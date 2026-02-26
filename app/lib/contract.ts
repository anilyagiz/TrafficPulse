import { Contract, Networks, Address } from '@stellar/stellar-sdk';

const CONTRACT_ID = process.env.NEXT_PUBLIC_CONTRACT_ID || 'CDTUCJ52DABJ3GWL2N5Y5HOEHXA4IA3RUE6DILYFNHWUH4N67EHCWECC';
const NETWORK = Networks.TESTNET;

export class TrafficPulseClient {
  private contract: Contract;

  constructor() {
    this.contract = new Contract(CONTRACT_ID);
  }

  async createRound(commitHash: string, startTime: number, durationMinutes: number) {
    console.log('Creating round:', { commitHash, startTime, durationMinutes });
    return { roundId: 1, success: true };
  }

  async placeBet(roundId: number, binId: number, amount: bigint) {
    console.log('Placing bet:', { roundId, binId, amount });
    return { success: true };
  }

  async getRound(roundId: number) {
    return {
      roundId,
      startTime: Date.now(),
      endTime: Date.now() + 600000,
      status: 'OPEN' as const,
      totalPool: 0n,
      binTotals: [0n, 0n, 0n, 0n, 0n],
    };
  }

  async getClaimable(roundId: number, wallet: string) {
    return 0n;
  }
}

export const trafficPulseClient = new TrafficPulseClient();
