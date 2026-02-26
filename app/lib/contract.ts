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
  startTime?: number;
  endTime: number;
  status: 'OPEN' | 'CLOSED' | 'FINALIZED';
  totalPool: bigint;
  binTotals: bigint[];
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

      const { signedTxXdr, error } = await signTransaction(tx.toXDR(), {
        network: "TESTNET",
      });

      if (error) throw new Error(error);

      const sendResponse = await this.server.sendTransaction(
        TransactionBuilder.fromXDR(signedTxXdr, NETWORK_PASSPHRASE) as Transaction
      );

      if (sendResponse.status !== "PENDING") {
        throw new Error(`Submission failed: ${JSON.stringify(sendResponse)}`);
      }

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
        const roundData = scValToNative(simulation.result!.retval);
        if (!roundData) {
           return {
            roundId,
            endTime: Date.now() + 600000,
            status: 'OPEN',
            totalPool: 0n,
            binTotals: [0n, 0n, 0n, 0n, 0n],
          };
        }
        return {
          roundId: roundData.id,
          endTime: Number(roundData.end_time) * 1000,
          status: roundData.finalized ? 'FINALIZED' : (Date.now() > Number(roundData.end_time) * 1000 ? 'CLOSED' : 'OPEN'),
          totalPool: BigInt(roundData.total_pool),
          binTotals: (roundData.bin_totals as any[]).map((t) => BigInt(t)),
        };
      }
      
      throw new Error("Simulation failed");
    } catch (err) {
      console.error("getRound error:", err);
      return {
        roundId,
        endTime: Date.now() + 600000,
        status: 'OPEN',
        totalPool: 0n,
        binTotals: [0n, 0n, 0n, 0n, 0n],
      };
    }
  }

  async claim(userAddress: string, roundId: number) {
    try {
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
      const { signedTxXdr, error } = await signTransaction(tx.toXDR(), { network: "TESTNET" });
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

  private async pollTransaction(hash: string) {

    let response = await this.server.getTransaction(hash);
    
    while (
      response.status === rpc.Api.GetTransactionStatus.NOT_FOUND ||
      response.status === rpc.Api.GetTransactionStatus.PENDING
    ) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      response = await this.server.getTransaction(hash);
    }

    if (response.status === rpc.Api.GetTransactionStatus.FAILED) {
      throw new Error(`Transaction failed: ${JSON.stringify(response.resultXdr)}`);
    }

    return response;
  }
}

export const trafficPulseClient = new TrafficPulseClient();
