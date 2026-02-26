import { BINS } from './PredictionBins';

interface StatsCardsProps {
  timeLeft: string;
  progressPercent: number;
  totalPool: bigint;
  status: string;
  winningBin?: number;
}

export function StatsCards({ timeLeft, progressPercent, totalPool, status, winningBin }: StatsCardsProps) {
  const isFinalized = status === 'FINALIZED';

  return (
    <div className="space-y-6">
      {isFinalized && winningBin !== undefined && winningBin < 5 && (
        <div className="animate-bounce glass-card p-4 border-yellow-500/50 bg-yellow-500/10 flex items-center justify-center gap-4">
          <span className="text-2xl">🏆</span>
          <div>
            <p className="text-yellow-400 font-bold">Round #1 Finalized!</p>
            <p className="text-white text-sm">Winning Bin: <span className="font-bold">{BINS[winningBin].label}</span> ({BINS[winningBin].range})</p>
          </div>
          <span className="text-2xl">🏆</span>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Timer */}
        <div className="glass-card p-6 card-hover">
          <div className="flex items-start justify-between mb-3">
            <div className="w-11 h-11 bg-gradient-to-br from-cyan-500/20 to-teal-500/20 rounded-xl flex items-center justify-center">
              <span className="text-lg">⏱️</span>
            </div>
            <span className={`text-xs font-semibold ${isFinalized ? 'text-slate-400 bg-slate-400/10' : 'text-cyan-400 bg-cyan-400/10'} px-3 py-1 rounded-full flex items-center gap-1.5`}>
              {!isFinalized && <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />}
              {status}
            </span>
          </div>
          <div className="text-slate-400 text-sm font-medium mb-1">Round Ends In</div>
          <div className="text-4xl font-bold text-white font-mono tracking-wider">{isFinalized ? '00:00' : timeLeft}</div>
          <div className="mt-3 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${isFinalized ? 'from-slate-500 to-slate-600' : 'from-cyan-500 to-teal-500'} rounded-full transition-all duration-1000`}
              style={{ width: `${isFinalized ? 100 : progressPercent}%` }}
            />
          </div>
        </div>

        {/* Pool */}
        <div className="glass-card p-6 card-hover">
          <div className="flex items-start justify-between mb-3">
            <div className="w-11 h-11 bg-gradient-to-br from-cyan-500/20 to-teal-500/20 rounded-xl flex items-center justify-center">
              <span className="text-lg">💎</span>
            </div>
          </div>
          <div className="text-slate-400 text-sm font-medium mb-1">Total Pool</div>
          <div className="text-4xl font-bold text-white">
            {Number(totalPool).toLocaleString()}
            <span className="text-lg text-cyan-400 ml-2">PULSE</span>
          </div>
          <div className="mt-3 text-sm text-slate-500">
            ≈ ${(Number(totalPool) * 0.01).toFixed(2)} USD
          </div>
        </div>

        {/* Status */}
        <div className="glass-card p-6 card-hover">
          <div className="flex items-start justify-between mb-3">
            <div className="w-11 h-11 bg-gradient-to-br from-cyan-500/20 to-teal-500/20 rounded-xl flex items-center justify-center">
              <span className="text-lg">🎯</span>
            </div>
          </div>
          <div className="text-slate-400 text-sm font-medium mb-1">Round Status</div>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 ${status === 'OPEN' ? 'bg-green-400 shadow-green-400/50' : 'bg-red-400 shadow-red-400/50'} rounded-full animate-pulse shadow-lg`} />
            <div className="text-2xl font-bold text-white">{status}</div>
          </div>
          <div className="mt-3 text-sm text-slate-500">Round #1 • {status === 'OPEN' ? 'Accepting bets' : 'Closed'}</div>
        </div>
      </div>
    </div>
  );
}


interface StatsCardsProps {
  timeLeft: string;
  progressPercent: number;
  totalPool: bigint;
  status: string;
}

export function StatsCards({ timeLeft, progressPercent, totalPool, status }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* Timer */}
      <div className="glass-card p-6 card-hover">
        <div className="flex items-start justify-between mb-3">
          <div className="w-11 h-11 bg-gradient-to-br from-cyan-500/20 to-teal-500/20 rounded-xl flex items-center justify-center">
            <span className="text-lg">⏱️</span>
          </div>
          <span className="text-xs font-semibold text-cyan-400 bg-cyan-400/10 px-3 py-1 rounded-full flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
            LIVE
          </span>
        </div>
        <div className="text-slate-400 text-sm font-medium mb-1">Round Ends In</div>
        <div className="text-4xl font-bold text-white font-mono tracking-wider">{timeLeft}</div>
        <div className="mt-3 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full transition-all duration-1000"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Pool */}
      <div className="glass-card p-6 card-hover">
        <div className="flex items-start justify-between mb-3">
          <div className="w-11 h-11 bg-gradient-to-br from-cyan-500/20 to-teal-500/20 rounded-xl flex items-center justify-center">
            <span className="text-lg">💎</span>
          </div>
        </div>
        <div className="text-slate-400 text-sm font-medium mb-1">Total Pool</div>
        <div className="text-4xl font-bold text-white">
          {Number(totalPool).toLocaleString()}
          <span className="text-lg text-cyan-400 ml-2">PULSE</span>
        </div>
        <div className="mt-3 text-sm text-slate-500">
          ≈ ${(Number(totalPool) * 0.01).toFixed(2)} USD
        </div>
      </div>

      {/* Status */}
      <div className="glass-card p-6 card-hover">
        <div className="flex items-start justify-between mb-3">
          <div className="w-11 h-11 bg-gradient-to-br from-cyan-500/20 to-teal-500/20 rounded-xl flex items-center justify-center">
            <span className="text-lg">🎯</span>
          </div>
        </div>
        <div className="text-slate-400 text-sm font-medium mb-1">Round Status</div>
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 ${status === 'OPEN' ? 'bg-green-400' : 'bg-red-400'} rounded-full animate-pulse shadow-lg`} />
          <div className="text-2xl font-bold text-white">{status}</div>
        </div>
        <div className="mt-3 text-sm text-slate-500">Round #1 • {status === 'OPEN' ? 'Accepting bets' : 'Closed'}</div>
      </div>
    </div>
  );
}
