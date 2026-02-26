'use client';

interface HowToPlayProps {
  compact?: boolean;
}

export function HowToPlay({ compact = false }: HowToPlayProps) {
  const steps = [
    { step: 1, icon: '💳', title: 'Connect', desc: compact ? 'Link wallet' : 'Link Freighter wallet' },
    { step: 2, icon: '🎯', title: 'Predict', desc: compact ? 'Choose bin' : 'Choose a traffic bin' },
    { step: 3, icon: '💰', title: 'Stake', desc: compact ? 'Enter amount' : 'Enter PULSE amount' },
    { step: 4, icon: '⏰', title: 'Wait', desc: compact ? '10 minutes' : 'Round resolves in 10m' },
    { step: 5, icon: '🏆', title: 'Win', desc: compact ? 'Share pool!' : 'Claim your share!' },
  ];

  return (
    <div className={`glass-card ${compact ? 'p-8' : 'p-8'}`}>
      <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
        <span className="text-2xl">📖</span>
        How to Play
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
        {steps.map((item) => (
          <div key={item.step} className="text-center group">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/10 to-teal-500/10 rounded-2xl mx-auto mb-3 flex items-center justify-center border border-cyan-500/20 group-hover:border-cyan-400/40 transition-colors">
              <span className="text-2xl">{item.icon}</span>
            </div>
            <div className="text-xs text-cyan-400 font-medium mb-1">Step {item.step}</div>
            <div className="text-white font-semibold mb-1">{item.title}</div>
            <div className="text-slate-500 text-sm">{item.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
