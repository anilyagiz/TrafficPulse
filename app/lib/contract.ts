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

const CONTRACT_ID = process.env.NEXT_PUBLIC_CONTRACT_ID || 'CDTUCJ52DABJ3GWL2N5Y5HOEHXA4IA3RUE6DILYFNHWUH4N67EHCWECC';
const RPC_URL = process.env.NEXT_PUBLIC_SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org';
const NETWORK_PASSPHRASE = Networks.TESTNET;

export interface Round {
  roundId: number;
  endTime: number;
  status: 'OPEN' | 'CLOSED' | 'FINALIZED';
  totalPool: bigint;
  binTotals: bigint[];
  winningBin?: number;
}

// Type for the raw round data returned from the contract
interface RawRoundData {
  id: number;
  end_time: number | string;
  total_pool: number | string;
  bin_totals: (number | string)[];
  finalized: boolean;
  winning_bin: number;
}

// Transaction status enum to avoid `any`
enum TransactionStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  NOT_FOUND = 'NOT_FOUND',
}

export class TrafficPulseClient {
  private server: rpc.Server;
  private contract: Contract;

  constructor() {
    this.server = new rpc.Server(RPC_URL);
    this.contract = new Contract(CONTRACT_ID);
  }

  async placeBet(userAddress: string, roundId: number, binId: number, amount: bigint) {
    try {
      const account = await this.server.getAccount(userAddress);
      let tx = new TransactionBuilder(account, { fee: BASE_FEE })
        .setNetworkPassphrase(NETWORK_PASSPHRASE)
        .setTimeout(30)
        .addOperation(
          this.contract.call(
            "place_bet",
            new Address(userAddress).toScVal(),
            nativeToScVal(roundId, { type: "u32" }),
            nativeToScVal(binId, { type: "u32" }),
            nativeToScVal(amount, { type: "i128" })
          )
        )
        .build();

      tx = await this.server.prepareTransaction(tx);
      const { signedTxXdr, error } = await signTransaction(tx.toXDR(), { networkPassphrase: NETWORK_PASSPHRASE });
      if (error) throw new Error(error);

      const sendResponse = await this.server.sendTransaction(
        TransactionBuilder.fromXDR(signedTxXdr, NETWORK_PASSPHRASE) as Transaction
      );
      return await this.pollTransaction(sendResponse.hash);
    } catch (err) {
      console.error("placeBet error:", err);
      throw err;
    }
  }

  async getRound(roundId: number): Promise<Round> {
    try {
      const account = await this.server.getAccount("GBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
      const tx = new TransactionBuilder(account, { fee: BASE_FEE })
        .setNetworkPassphrase(NETWORK_PASSPHRASE)
        .setTimeout(30)
        .addOperation(this.contract.call("get_round", nativeToScVal(roundId, { type: "u32" })))
        .build();

      const simulation = await this.server.simulateTransaction(tx);
      if (rpc.Api.isSimulationSuccess(simulation)) {
        const roundData = scValToNative(simulation.result!.retval) as RawRoundData | null;
        if (!roundData) {
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
      throw new Error("Simulation failed");
    } catch (err) {
      // Only return mock data in development mode
      if (process.env.NODE_ENV === 'development') {
        console.warn('getRound: Returning mock data in development mode');
        return this.getDefaultRound(roundId);
      }
      throw err;
    }
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
    try {
      if (!userAddress || !userAddress.startsWith('G') || userAddress.length !== 56) {
        throw new Error('Invalid Stellar address format');
      }
      const account = await this.server.getAccount(userAddress);
      let tx = new TransactionBuilder(account, { fee: BASE_FEE })
        .setNetworkPassphrase(NETWORK_PASSPHRASE)
        .setTimeout(30)
        .addOperation(
          this.contract.call(
            "claim",
            new Address(userAddress).toScVal(),
            nativeToScVal(roundId, { type: "u32" })
          )
        )
        .build();

      tx = await this.server.prepareTransaction(tx);
      const { signedTxXdr, error } = await signTransaction(tx.toXDR(), { networkPassphrase: NETWORK_PASSPHRASE });
      if (error) throw new Error(error);

      const sendResponse = await this.server.sendTransaction(
        TransactionBuilder.fromXDR(signedTxXdr, NETWORK_PASSPHRASE) as Transaction
      );
      return await this.pollTransaction(sendResponse.hash);
    } catch (err) {
      console.error("claim error:", err);
      throw err;
    }
  }

  async initialize(adminAddress: string, tokenAddress: string) {
    try {
      const account = await this.server.getAccount(adminAddress);
      let tx = new TransactionBuilder(account, { fee: BASE_FEE })
        .setNetworkPassphrase(NETWORK_PASSPHRASE)
        .setTimeout(30)
        .addOperation(
          this.contract.call(
            "initialize",
            new Address(adminAddress).toScVal(),
            new Address(tokenAddress).toScVal()
          )
        )
        .build();

      tx = await this.server.prepareTransaction(tx);
      const { signedTxXdr, error } = await signTransaction(tx.toXDR(), { networkPassphrase: NETWORK_PASSPHRASE });
      if (error) throw new Error(error);

      const sendResponse = await this.server.sendTransaction(
        TransactionBuilder.fromXDR(signedTxXdr, NETWORK_PASSPHRASE) as Transaction
      );
      return await this.pollTransaction(sendResponse.hash);
    } catch (err) {
      console.error("initialize error:", err);
      throw err;
    }
  }

  async createRound(adminAddress: string, roundId: number, endTimeSeconds: number, commitHashHex: string) {
    try {
      // Validate commit hash is 64 hex characters (32 bytes)
      if (!/^[0-9a-fA-F]{64}$/.test(commitHashHex)) {
        throw new Error('Commit hash must be 64 hex characters (32 bytes)');
      }
      
      const account = await this.server.getAccount(adminAddress);
      const commitBytes = Buffer.from(commitHashHex, 'hex');
      let tx = new TransactionBuilder(account, { fee: BASE_FEE })
        .setNetworkPassphrase(NETWORK_PASSPHRASE)
        .setTimeout(30)
        .addOperation(
          this.contract.call(
            "create_round",
            new Address(adminAddress).toScVal(),
            nativeToScVal(roundId, { type: "u32" }),
            nativeToScVal(endTimeSeconds, { type: "u64" }),
            nativeToScVal(commitBytes, { type: "bytes" })
          )
        )
        .build();

      tx = await this.server.prepareTransaction(tx);
      const { signedTxXdr, error } = await signTransaction(tx.toXDR(), { networkPassphrase: NETWORK_PASSPHRASE });
      if (error) throw new Error(error);

      const sendResponse = await this.server.sendTransaction(
        TransactionBuilder.fromXDR(signedTxXdr, NETWORK_PASSPHRASE) as Transaction
      );
      return await this.pollTransaction(sendResponse.hash);
    } catch (err) {
      console.error("createRound error:", err);
      throw err;
    }
  }

  async finalizeRound(adminAddress: string, roundId: number, seedHex: string) {
    try {
      // Validate seed is 64 hex characters (32 bytes)
      if (!/^[0-9a-fA-F]{64}$/.test(seedHex)) {
        throw new Error('Seed must be 64 hex characters (32 bytes)');
      }
      
      const account = await this.server.getAccount(adminAddress);
      const seedBytes = Buffer.from(seedHex, 'hex');
      let tx = new TransactionBuilder(account, { fee: BASE_FEE })
        .setNetworkPassphrase(NETWORK_PASSPHRASE)
        .setTimeout(30)
        .addOperation(
          this.contract.call(
            "finalize_round",
            nativeToScVal(roundId, { type: "u32" }),
            nativeToScVal(seedBytes, { type: "bytes" })
          )
        )
        .build();

      tx = await this.server.prepareTransaction(tx);
      const { signedTxXdr, error } = await signTransaction(tx.toXDR(), { networkPassphrase: NETWORK_PASSPHRASE });
      if (error) throw new Error(error);

      const sendResponse = await this.server.sendTransaction(
        TransactionBuilder.fromXDR(signedTxXdr, NETWORK_PASSPHRASE) as Transaction
      );
      return await this.pollTransaction(sendResponse.hash);
    } catch (err) {
      console.error("finalizeRound error:", err);
      throw err;
    }
  }

  async getAdmin(): Promise<string | null> {
    try {
      const account = await this.server.getAccount("GBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
      const tx = new TransactionBuilder(account, { fee: BASE_FEE })
        .setNetworkPassphrase(NETWORK_PASSPHRASE)
        .setTimeout(30)
        .addOperation(this.contract.call("get_admin"))
        .build();

      const simulation = await this.server.simulateTransaction(tx);
      if (rpc.Api.isSimulationSuccess(simulation)) {
        return scValToNative(simulation.result!.retval) as string | null;
      }
      return null;
    } catch {
      return null;
    }
  }

  private async pollTransaction(hash: string) {
    let response = await this.server.getTransaction(hash);
    
    // Poll while transaction is pending - use the enum value
    const pendingStatus = 'PENDING' as rpc.Api.GetTransactionStatus;
    const failedStatus = 'FAILED' as rpc.Api.GetTransactionStatus;
    
    while (response.status === pendingStatus) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      response = await this.server.getTransaction(hash);
    }
    
    if (response.status === failedStatus) {
      // Type narrow to failed response
      const failedResponse = response as rpc.Api.GetFailedTransactionResponse;
      const errorMsg = failedResponse.resultXdr 
        ? `Transaction failed. Check Stellar Explorer for details. Hash: ${hash}`
        : `Transaction failed`;
      throw new Error(errorMsg);
    }
    
    return response;
  }
}

export const trafficPulseClient = new TrafficPulseClient();