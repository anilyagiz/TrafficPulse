'use client';

export const BINS = [
  { label: '0-20', range: 'Very Light', icon: '🟢', color: 'from-emerald-500/20 to-emerald-600/10', border: 'border-emerald-500/30', activeBg: 'from-emerald-500/30 to-emerald-600/20', glow: 'shadow-emerald-500/20' },
  { label: '21-40', range: 'Light', icon: '🔵', color: 'from-blue-500/20 to-blue-600/10', border: 'border-blue-500/30', activeBg: 'from-blue-500/30 to-blue-600/20', glow: 'shadow-blue-500/20' },
  { label: '41-60', range: 'Moderate', icon: '🟡', color: 'from-yellow-500/20 to-yellow-600/10', border: 'border-yellow-500/30', activeBg: 'from-yellow-500/30 to-yellow-600/20', glow: 'shadow-yellow-500/20' },
  { label: '61-80', range: 'Heavy', icon: '🟠', color: 'from-orange-500/20 to-orange-600/10', border: 'border-orange-500/30', activeBg: 'from-orange-500/30 to-orange-600/20', glow: 'shadow-orange-500/20' },
  { label: '81+', range: 'Severe', icon: '🔴', color: 'from-red-500/20 to-red-600/10', border: 'border-red-500/30', activeBg: 'from-red-500/30 to-red-600/20', glow: 'shadow-red-500/20' },
];

interface PredictionBinsProps {
  selectedBin: number | null;
  setSelectedBin: (bin: number | null) => void;
  binTotals: bigint[];
}

export function PredictionBins({ selectedBin, setSelectedBin, binTotals }: PredictionBinsProps) {
  return (
    <div 
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8"
      role="radiogroup"
      aria-label="Traffic prediction bins"
    >
      {BINS.map((bin, idx) => {
        const isSelected = selectedBin === idx;
        const poolAmount = binTotals[idx] ? Number(binTotals[idx]).toLocaleString() : '0';
        
        return (
          <button
            key={idx}
            onClick={() => setSelectedBin(isSelected ? null : idx)}
            role="radio"
            aria-checked={isSelected}
            aria-label={`Select ${bin.label} traffic bin, ${bin.range} traffic volume, current pool ${poolAmount} PULSE`}
            className={`relative overflow-hidden rounded-2xl p-5 transition-all duration-300 border focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
              isSelected
                ? `bg-gradient-to-br ${bin.activeBg} ${bin.border} shadow-xl ${bin.glow} scale-[1.03]`
                : `bg-gradient-to-br ${bin.color} border-slate-700/50 hover:${bin.border} hover:scale-[1.02]`
            }`}
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <div className="text-2xl mb-2" aria-hidden="true">{bin.icon}</div>
              <div className="text-xl font-bold text-white mb-0.5">{bin.label}</div>
              <div className="text-xs text-slate-400 mb-3">{bin.range}</div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Pool:</span>
                <span className="font-semibold text-cyan-300" aria-label={`${poolAmount} PULSE in pool`}>
                  {poolAmount}
                </span>
              </div>
            </div>
            {isSelected && (
              <div 
                className="absolute top-2 right-2 w-6 h-6 bg-cyan-400 rounded-full flex items-center justify-center"
                aria-hidden="true"
              >
                <svg className="w-4 h-4 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}