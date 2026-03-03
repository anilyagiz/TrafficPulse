import { 
  Contract, 
  rpc, 
  Networks, 
  TransactionBuilder, 
  BASE_FEE, 
  scValToNative, 
  nativeToScVal,
  Address,
  Transaction
} from '@stellar/stellar-sdk';
import { signTransaction } from '@stellar/freighter-api';

const CONTRACT_ID = process.env.NEXT_PUBLIC_CONTRACT_ID || '';
const RPC_URL = process.env.NEXT_PUBLIC_SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org';
const NETWORK_PASSPHRASE = Networks.TESTNET;

const DEMO_MODE = !CONTRACT_ID || CONTRACT_ID.length !== 56;

export interface Round {
  roundId: number;
  endTime: number;
  status: 'OPEN' | 'CLOSED' | 'FINALIZED';
  totalPool: bigint;
  binTotals: bigint[];
  winningBin?: number;
}

interface RawRoundData {
  id: number;
  end_time: number | string;
  total_pool: number | string;
  bin_totals: (number | string)[];
  finalized: boolean;
  winning_bin: number;
}

let demoRound: Round = {
  roundId: 1,
  endTime: Date.now() + 600000,
  status: 'OPEN',
  totalPool: 0n,
  binTotals: [0n, 0n, 0n, 0n, 0n],
};

let demoBets: { user: string; roundId: number; binId: number; amount: bigint }[] = [];

export class TrafficPulseError extends Error {
  constructor(
    message: string,
    public code: string,
    public recoverable: boolean = true
  ) {
    super(message);
    this.name = 'TrafficPulseError';
  }
}

export class NetworkError extends TrafficPulseError {
  constructor(message: string) {
    super(message, 'NETWORK_ERROR', true);
  }
}

export class UserRejectionError extends TrafficPulseError {
  constructor(message: string = 'Transaction rejected by user') {
    super(message, 'USER_REJECTION', false);
  }
}

export class ValidationError extends TrafficPulseError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', false);
  }
}

export class ContractError extends TrafficPulseError {
  constructor(message: string) {
    super(message, 'CONTRACT_ERROR', true);
  }
}

export class TrafficPulseClient {
  private server: rpc.Server | null = null;
  private contract: Contract | null = null;
  public readonly isDemoMode: boolean;
  private consecutiveFailures = 0;
  private maxRetries = 3;
  private retryDelay = 1000;

  constructor() {
    this.isDemoMode = DEMO_MODE;
    
    if (DEMO_MODE) {
      console.warn('TrafficPulse: Running in DEMO mode - no valid contract ID provided');
      return;
    }
    
    try {
      this.server = new rpc.Server(RPC_URL);
      this.contract = new Contract(CONTRACT_ID);
      console.log('TrafficPulse: Connected to contract', CONTRACT_ID);
    } catch (err) {
      console.error('TrafficPulse: Failed to initialize contract client:', err);
      console.warn('TrafficPulse: Falling back to DEMO mode');
      (this as { isDemoMode: boolean }).isDemoMode = true;
    }
  }

  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await operation();
        this.consecutiveFailures = 0;
        return result;
      } catch (error) {
        lastError = error as Error;
        this.consecutiveFailures++;
        
        if (error instanceof UserRejectionError || error instanceof ValidationError) {
          throw error;
        }
        
        if (attempt === maxRetries) {
          throw new NetworkError(`Operation failed after ${maxRetries + 1} attempts: ${lastError.message}`);
        }
        
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 500;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        console.warn(`Retrying operation (attempt ${attempt + 1}/${maxRetries + 1}) after error:`, lastError.message);
      }
    }
    
    throw lastError!;
  }

  async placeBet(userAddress: string, roundId: number, binId: number, amount: bigint) {
    if (!userAddress || !userAddress.startsWith('G') || userAddress.length !== 56) {
      throw new ValidationError('Invalid Stellar address format');
    }
    if (amount <= 0n) {
      throw new ValidationError('Bet amount must be greater than 0');
    }
    if (binId < 0 || binId > 4) {
      throw new ValidationError('Invalid bin ID (must be 0-4)');
    }
    
    if (this.isDemoMode || !this.server || !this.contract) {
      console.log('Demo mode: Placing bet', { userAddress, roundId, binId, amount: amount.toString() });
      demoBets.push({ user: userAddress, roundId, binId, amount });
      demoRound.totalPool += amount;
      demoRound.binTotals[binId] += amount;
      return { status: 'SUCCESS', hash: 'demo_' + Date.now() };
    }

    return this.retryWithBackoff(async () => {
      try {
        const account = await this.server!.getAccount(userAddress);
        let tx = new TransactionBuilder(account, { fee: BASE_FEE })
          .setNetworkPassphrase(NETWORK_PASSPHRASE)
          .setTimeout(30)
          .addOperation(
            this.contract!.call(
              "place_bet",
              new Address(userAddress).toScVal(),
              nativeToScVal(roundId, { type: "u32" }),
              nativeToScVal(binId, { type: "u32" }),
              nativeToScVal(amount, { type: "i128" })
            )
          )
          .build();

        tx = await this.server!.prepareTransaction(tx);
        const { signedTxXdr, error } = await signTransaction(tx.toXDR(), { networkPassphrase: NETWORK_PASSPHRASE });
        
        if (error) {
          if (typeof error === 'string' && error.toLowerCase().includes('reject')) {
            throw new UserRejectionError();
          }
          throw new ContractError(`Signing failed: ${error}`);
        }

        const sendResponse = await this.server!.sendTransaction(
          TransactionBuilder.fromXDR(signedTxXdr, NETWORK_PASSPHRASE) as Transaction
        );
        
        return await this.pollTransaction(sendResponse.hash);
      } catch (error) {
        if (error instanceof TrafficPulseError) {
          throw error;
        }
        
        if (error instanceof Error) {
          if (error.message.includes('reject') || error.message.includes('denied')) {
            throw new UserRejectionError();
          }
          if (error.message.includes('timeout') || error.message.includes('network')) {
            throw new NetworkError(`Network timeout: ${error.message}`);
          }
          if (error.message.includes('insufficient')) {
            throw new ValidationError('Insufficient balance for this transaction');
          }
        }
        
        throw new NetworkError(`Unexpected error during bet placement: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });
  }

  async getRound(roundId: number): Promise<Round> {
    if (this.isDemoMode || !this.server || !this.contract) {
      console.log('Demo mode: Getting round', roundId);
      if (Date.now() > demoRound.endTime) {
        demoRound = {
          roundId: demoRound.roundId + 1,
          endTime: Date.now() + 600000,
          status: 'OPEN',
          totalPool: 0n,
          binTotals: [0n, 0n, 0n, 0n, 0n],
        };
        demoBets = [];
      }
      return { ...demoRound };
    }

    return this.retryWithBackoff(async () => {
      try {
        const dummyAccount = {
          accountId: () => "GBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
          sequenceNumber: () => "0",
          incrementSequenceNumber: () => {},
        };
        
        const tx = new TransactionBuilder(dummyAccount, { fee: BASE_FEE })
          .setNetworkPassphrase(NETWORK_PASSPHRASE)
          .setTimeout(30)
          .addOperation(this.contract!.call("get_round", nativeToScVal(roundId, { type: "u32" })))
          .build();

        const simulation = await this.server!.simulateTransaction(tx);
        
        if (rpc.Api.isSimulationSuccess(simulation)) {
          const roundData = scValToNative(simulation.result!.retval) as RawRoundData | null;
          
          if (!roundData) {
            console.warn(`Round ${roundId} not found on contract. Creating default round.`);
            return this.getDefaultRound(roundId);
          }
          
          return {
            roundId: roundData.id,
            endTime: Number(roundData.end_time) * 1000,
            status: roundData.finalized 
              ? 'FINALIZED' 
              : (Date.now() > Number(roundData.end_time) * 1000 ? 'CLOSED' : 'OPEN'),
            totalPool: BigInt(roundData.total_pool),
            binTotals: roundData.bin_totals.map((t) => BigInt(t)),
            winningBin: roundData.winning_bin === 99 ? undefined : roundData.winning_bin,
          };
        }
        
        if (simulation.error) {
          console.error("Simulation error:", simulation.error);
          throw new ContractError(`Contract simulation failed: ${simulation.error}`);
        }
        
        throw new ContractError("Failed to get round data from contract");
      } catch (error) {
        if (error instanceof TrafficPulseError) {
          throw error;
        }
        
        if (error instanceof Error) {
          if (error.message.includes('timeout') || error.message.includes('network')) {
            throw new NetworkError(`Network timeout while fetching round: ${error.message}`);
          }
        }
        
        throw new NetworkError(`Unexpected error fetching round data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }, 2, 500);
  }

  private getDefaultRound(roundId: number): Round {
    return {
      roundId,
      endTime: Date.now() + 600000,
      status: 'OPEN',
      totalPool: 0n,
      binTotals: [0n, 0n, 0n, 0n, 0n],
    };
  }

  async claim(userAddress: string, roundId: number) {
    if (!userAddress || !userAddress.startsWith('G') || userAddress.length !== 56) {
      throw new ValidationError('Invalid Stellar address format');
    }
    
    if (this.isDemoMode || !this.server || !this.contract) {
      console.log('Demo mode: Claiming rewards', { userAddress, roundId });
      const userBets = demoBets.filter(b => b.user === userAddress && b.roundId === roundId);
      if (userBets.length === 0) {
        throw new ValidationError('No bets found for this round');
      }
      return { status: 'SUCCESS', hash: 'demo_claim_' + Date.now() };
    }

    return this.retryWithBackoff(async () => {
      try {
        const account = await this.server!.getAccount(userAddress);
        let tx = new TransactionBuilder(account, { fee: BASE_FEE })
          .setNetworkPassphrase(NETWORK_PASSPHRASE)
          .setTimeout(30)
          .addOperation(
            this.contract!.call(
              "claim",
              new Address(userAddress).toScVal(),
              nativeToScVal(roundId, { type: "u32" })
            )
          )
          .build();

        tx = await this.server!.prepareTransaction(tx);
        const { signedTxXdr, error } = await signTransaction(tx.toXDR(), { networkPassphrase: NETWORK_PASSPHRASE });
        
        if (error) {
          if (typeof error === 'string' && error.toLowerCase().includes('reject')) {
            throw new UserRejectionError();
          }
          throw new ContractError(`Signing failed: ${error}`);
        }

        const sendResponse = await this.server!.sendTransaction(
          TransactionBuilder.fromXDR(signedTxXdr, NETWORK_PASSPHRASE) as Transaction
        );
        
        return await this.pollTransaction(sendResponse.hash);
      } catch (error) {
        if (error instanceof TrafficPulseError) {
          throw error;
        }
        
        if (error instanceof Error) {
          if (error.message.includes('reject') || error.message.includes('denied')) {
            throw new UserRejectionError();
          }
          if (error.message.includes('timeout') || error.message.includes('network')) {
            throw new NetworkError(`Network timeout during claim: ${error.message}`);
          }
          if (error.message.includes('already claimed')) {
            throw new ValidationError('Rewards for this round have already been claimed');
          }
        }
        
        throw new NetworkError(`Unexpected error during claim: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });
  }

  async initialize(adminAddress: string, tokenAddress: string) {
    if (!adminAddress || !adminAddress.startsWith('G') || adminAddress.length !== 56) {
      throw new ValidationError('Invalid admin address format');
    }
    if (!tokenAddress || !tokenAddress.startsWith('G') || tokenAddress.length !== 56) {
      throw new ValidationError('Invalid token address format');
    }
    
    if (this.isDemoMode || !this.server || !this.contract) {
      console.log('Demo mode: Initialize contract', { adminAddress, tokenAddress });
      return { status: 'SUCCESS', hash: 'demo_init_' + Date.now() };
    }

    return this.retryWithBackoff(async () => {
      try {
        const account = await this.server!.getAccount(adminAddress);
        let tx = new TransactionBuilder(account, { fee: BASE_FEE })
          .setNetworkPassphrase(NETWORK_PASSPHRASE)
          .setTimeout(30)
          .addOperation(
            this.contract!.call(
              "initialize",
              new Address(adminAddress).toScVal(),
              new Address(tokenAddress).toScVal()
            )
          )
          .build();

        tx = await this.server!.prepareTransaction(tx);
        const { signedTxXdr, error } = await signTransaction(tx.toXDR(), { networkPassphrase: NETWORK_PASSPHRASE });
        
        if (error) {
          if (typeof error === 'string' && error.toLowerCase().includes('reject')) {
            throw new UserRejectionError();
          }
          throw new ContractError(`Signing failed: ${error}`);
        }

        const sendResponse = await this.server!.sendTransaction(
          TransactionBuilder.fromXDR(signedTxXdr, NETWORK_PASSPHRASE) as Transaction
        );
        
        return await this.pollTransaction(sendResponse.hash);
      } catch (error) {
        if (error instanceof TrafficPulseError) {
          throw error;
        }
        
        if (error instanceof Error) {
          if (error.message.includes('reject') || error.message.includes('denied')) {
            throw new UserRejectionError();
          }
          if (error.message.includes('already been initialized')) {
            throw new ValidationError('Contract has already been initialized');
          }
        }
        
        throw new NetworkError(`Unexpected error during initialization: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });
  }

  async createRound(adminAddress: string, roundId: number, endTimeSeconds: number, commitHashHex: string) {
    if (!adminAddress || !adminAddress.startsWith('G') || adminAddress.length !== 56) {
      throw new ValidationError('Invalid admin address format');
    }
    if (!/^[0-9a-fA-F]{64}$/.test(commitHashHex)) {
      throw new ValidationError('Commit hash must be 64 hex characters (32 bytes)');
    }
    if (endTimeSeconds <= Math.floor(Date.now() / 1000)) {
      throw new ValidationError('End time must be in the future');
    }
    
    if (this.isDemoMode || !this.server || !this.contract) {
      console.log('Demo mode: Create round', { adminAddress, roundId, endTimeSeconds, commitHashHex });
      demoRound = {
        roundId,
        endTime: endTimeSeconds * 1000,
        status: 'OPEN',
        totalPool: 0n,
        binTotals: [0n, 0n, 0n, 0n, 0n],
      };
      demoBets = [];
      return { status: 'SUCCESS', hash: 'demo_create_' + Date.now() };
    }

    return this.retryWithBackoff(async () => {
      try {
        const account = await this.server!.getAccount(adminAddress);
        const commitBytes = Buffer.from(commitHashHex, 'hex');
        let tx = new TransactionBuilder(account, { fee: BASE_FEE })
          .setNetworkPassphrase(NETWORK_PASSPHRASE)
          .setTimeout(30)
          .addOperation(
            this.contract!.call(
              "create_round",
              new Address(adminAddress).toScVal(),
              nativeToScVal(roundId, { type: "u32" }),
              nativeToScVal(endTimeSeconds, { type: "u64" }),
              nativeToScVal(commitBytes, { type: "bytes" })
            )
          )
          .build();

        tx = await this.server!.prepareTransaction(tx);
        const { signedTxXdr, error } = await signTransaction(tx.toXDR(), { networkPassphrase: NETWORK_PASSPHRASE });
        
        if (error) {
          if (typeof error === 'string' && error.toLowerCase().includes('reject')) {
            throw new UserRejectionError();
          }
          throw new ContractError(`Signing failed: ${error}`);
        }

        const sendResponse = await this.server!.sendTransaction(
          TransactionBuilder.fromXDR(signedTxXdr, NETWORK_PASSPHRASE) as Transaction
        );
        
        return await this.pollTransaction(sendResponse.hash);
      } catch (error) {
        if (error instanceof TrafficPulseError) {
          throw error;
        }
        
        if (error instanceof Error) {
          if (error.message.includes('reject') || error.message.includes('denied')) {
            throw new UserRejectionError();
          }
          if (error.message.includes('already exists')) {
            throw new ValidationError(`Round ${roundId} already exists`);
          }
        }
        
        throw new NetworkError(`Unexpected error during round creation: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });
  }

  async finalizeRound(adminAddress: string, roundId: number, seedHex: string) {
    if (!adminAddress || !adminAddress.startsWith('G') || adminAddress.length !== 56) {
      throw new ValidationError('Invalid admin address format');
    }
    if (!/^[0-9a-fA-F]{64}$/.test(seedHex)) {
      throw new ValidationError('Seed must be 64 hex characters (32 bytes)');
    }
    
    if (this.isDemoMode || !this.server || !this.contract) {
      console.log('Demo mode: Finalize round', { adminAddress, roundId, seedHex });
      const winningBin = parseInt(seedHex.slice(0, 2), 16) % 5;
      demoRound.status = 'FINALIZED';
      demoRound.winningBin = winningBin;
      return { status: 'SUCCESS', hash: 'demo_finalize_' + Date.now(), winningBin };
    }

    return this.retryWithBackoff(async () => {
      try {
        const account = await this.server!.getAccount(adminAddress);
        const seedBytes = Buffer.from(seedHex, 'hex');
        let tx = new TransactionBuilder(account, { fee: BASE_FEE })
          .setNetworkPassphrase(NETWORK_PASSPHRASE)
          .setTimeout(30)
          .addOperation(
            this.contract!.call(
              "finalize_round",
              nativeToScVal(roundId, { type: "u32" }),
              nativeToScVal(seedBytes, { type: "bytes" })
            )
          )
          .build();

        tx = await this.server!.prepareTransaction(tx);
        const { signedTxXdr, error } = await signTransaction(tx.toXDR(), { networkPassphrase: NETWORK_PASSPHRASE });
        
        if (error) {
          if (typeof error === 'string' && error.toLowerCase().includes('reject')) {
            throw new UserRejectionError();
          }
          throw new ContractError(`Signing failed: ${error}`);
        }

        const sendResponse = await this.server!.sendTransaction(
          TransactionBuilder.fromXDR(signedTxXdr, NETWORK_PASSPHRASE) as Transaction
        );
        
        return await this.pollTransaction(sendResponse.hash);
      } catch (error) {
        if (error instanceof TrafficPulseError) {
          throw error;
        }
        
        if (error instanceof Error) {
          if (error.message.includes('reject') || error.message.includes('denied')) {
            throw new UserRejectionError();
          }
          if (error.message.includes('not finalized')) {
            throw new ValidationError(`Round ${roundId} cannot be finalized`);
          }
          if (error.message.includes('invalid seed')) {
            throw new ValidationError('Invalid seed: does not match commit hash');
          }
        }
        
        throw new NetworkError(`Unexpected error during round finalization: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });
  }

  async getAdmin(): Promise<string | null> {
    if (this.isDemoMode || !this.server || !this.contract) {
      return process.env.NEXT_PUBLIC_ADMIN_ADDRESS || 'GDBLUIMXTGNKDTSUXMF2UY3OC4I4TBJLMKJCQMLF5HYPN7RFGSIHLX6J';
    }

    try {
      const account = await this.server!.getAccount("GBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
      const tx = new TransactionBuilder(account, { fee: BASE_FEE })
        .setNetworkPassphrase(NETWORK_PASSPHRASE)
        .setTimeout(30)
        .addOperation(this.contract!.call("get_admin"))
        .build();

      const simulation = await this.server!.simulateTransaction(tx);
      if (rpc.Api.isSimulationSuccess(simulation)) {
        return scValToNative(simulation.result!.retval) as string | null;
      }
      return null;
    } catch (error) {
      console.error("getAdmin error:", error);
      return null;
    }
  }

  private async pollTransaction(hash: string) {
    if (!this.server) {
      throw new NetworkError('Server not initialized');
    }
    
    const startTime = Date.now();
    const timeout = 60000;
    
    let response = await this.server.getTransaction(hash);
    
    const pendingStatus = 'PENDING' as rpc.Api.GetTransactionStatus;
    const failedStatus = 'FAILED' as rpc.Api.GetTransactionStatus;
    
    while (response.status === pendingStatus) {
      if (Date.now() - startTime > timeout) {
        throw new NetworkError(`Transaction polling timed out after ${timeout/1000} seconds. Hash: ${hash}`);
      }
      
      await new Promise((resolve) => setTimeout(resolve, 2000));
      response = await this.server.getTransaction(hash);
    }
    
    if (response.status === failedStatus) {
      const failedResponse = response as rpc.Api.GetFailedTransactionResponse;
      let errorMsg = `Transaction failed`;
      
      if (failedResponse.resultXdr) {
        try {
          const result = TransactionBuilder.fromXDR(failedResponse.resultXdr, NETWORK_PASSPHRASE);
          if (result && (result as any).operations && (result as any).operations[0]) {
            const operation = (result as any).operations[0];
            if (operation.body && operation.body._arm) {
              switch (operation.body._arm) {
                case 0:
                  errorMsg = 'Contract invocation failed';
                  break;
                default:
                  errorMsg = 'Transaction execution failed';
              }
            }
          }
        } catch (e) {
        }
        errorMsg += `. Check Stellar Explorer for details. Hash: ${hash}`;
      }
      
      throw new ContractError(errorMsg);
    }
    
    return response;
  }

  getNetworkHealth() {
    return {
      isHealthy: this.consecutiveFailures < 3,
      consecutiveFailures: this.consecutiveFailures,
      isDemoMode: this.isDemoMode
    };
  }
}

export const trafficPulseClient = new TrafficPulseClient();