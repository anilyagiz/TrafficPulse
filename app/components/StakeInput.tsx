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
  const isInvalid = stakeAmount !== '' && parseInt(stakeAmount) <= 0;
  const potentialShare = stakeAmount && totalPool
    ? ((parseInt(stakeAmount) / (Number(totalPool) + parseInt(stakeAmount))) * 100).toFixed(1)
    : '100';

  return (
    <div className="border-t border-slate-700/50 pt-8 animate-fadeIn">
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-end">
        <div className="flex-1 w-full">
          <label 
            htmlFor="stake-amount" 
            className="block text-slate-300 text-sm font-medium mb-2"
          >
            Stake Amount (PULSE)
          </label>
          <div className="relative">
            <input
              id="stake-amount"
              type="number"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              className={`w-full bg-slate-800/50 border rounded-xl px-4 py-4 text-white text-lg font-medium focus:outline-none focus:ring-2 transition-all pr-20 ${
                isInvalid 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                  : 'border-slate-700 focus:border-cyan-500 focus:ring-cyan-500/20'
              }`}
              min="1"
              placeholder="Enter amount"
              aria-invalid={isInvalid}
              aria-describedby={isInvalid ? 'stake-error' : 'stake-hint'}
            />
            <div 
              className="absolute right-4 top-1/2 -translate-y-1/2 text-cyan-400 font-medium text-sm"
              aria-hidden="true"
            >
              PULSE
            </div>
          </div>
          {isInvalid && (
            <p id="stake-error" className="mt-2 text-sm text-red-400" role="alert">
              Amount must be greater than 0
            </p>
          )}
        </div>
        <button
          onClick={handlePlaceBet}
          disabled={loading || !stakeAmount || parseInt(stakeAmount) <= 0}
          aria-label={`Place bet of ${stakeAmount || 0} PULSE on ${BINS[selectedBin].label} traffic bin`}
          aria-busy={loading}
          className="btn-primary w-full sm:w-auto px-10 py-4 text-white rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900"
        >
          {loading ? (
            <>
              <div className="spinner" aria-hidden="true" />
              <span>Placing...</span>
            </>
          ) : (
            <>
              <span aria-hidden="true">🎲</span>
              <span>Place Bet</span>
            </>
          )}
        </button>
      </div>
      <div 
        id="stake-hint"
        className="mt-4 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50"
      >
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <span aria-hidden="true">💡</span>
          <span>
            Betting on <span className="text-white font-medium">{BINS[selectedBin].label} vehicles</span> •
            Potential share: <span className="text-cyan-400 font-semibold">{potentialShare}%</span> of the pool
          </span>
        </div>
      </div>
    </div>
  );
}