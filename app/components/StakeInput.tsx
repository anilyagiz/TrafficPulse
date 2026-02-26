'use client';
import { BINS } from './PredictionBins';

interface StakeInputProps {
  stakeAmount: string;
  setStakeAmount: (amount: string) => void;
  loading: boolean;
  handlePlaceBet: () => void;
  selectedBin: number;
  totalPool: bigint;
}

export function StakeInput({ 
  stakeAmount, 
  setStakeAmount, 
  loading, 
  handlePlaceBet, 
  selectedBin,
  totalPool 
}: StakeInputProps) {
  return (
    <div className="border-t border-slate-700/50 pt-8 animate-fadeIn">
      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-slate-300 text-sm font-medium mb-2">
            Stake Amount
          </label>
          <div className="relative">
            <input
              type="number"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-4 text-white text-lg font-medium focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all pr-20"
              min="1"
              placeholder="Enter amount"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-cyan-400 font-medium text-sm">
              PULSE
            </div>
          </div>
        </div>
        <button
          onClick={handlePlaceBet}
          disabled={loading || !stakeAmount || parseInt(stakeAmount) <= 0}
          className="btn-primary w-full sm:w-auto px-10 py-4 text-white rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="spinner" />
              <span>Placing...</span>
            </>
          ) : (
            <>
              <span>🎲</span>
              <span>Place Bet</span>
            </>
          )}
        </button>
      </div>
      <div className="mt-4 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <span>💡</span>
          <span>
            Betting on <span className="text-white font-medium">{BINS[selectedBin].label} vehicles</span> •
            Potential share: <span className="text-cyan-400 font-semibold">
              {stakeAmount && totalPool
                ? ((parseInt(stakeAmount) / (Number(totalPool) + parseInt(stakeAmount))) * 100).toFixed(1)
                : '100'}%
            </span> of the pool
          </span>
        </div>
      </div>
    </div>
  );
}
