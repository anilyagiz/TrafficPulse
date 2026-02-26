'use client';

const FEATURES = [
  { icon: '🔒', title: 'Commit-Reveal', desc: 'Fair result computation with hidden seeds until round ends' },
  { icon: '👥', title: '2/3 Multi-Sig', desc: 'Committee approval prevents single-point manipulation' },
  { icon: '🛡️', title: 'Sniping Prevention', desc: 'No bets allowed in the last 3 minutes of each round' },
  { icon: '💸', title: 'Pari-Mutuel', desc: 'Winners share the entire pool with only 3% protocol fee' },
];

export function Features() {
  return (
    <section className="max-w-5xl mx-auto">
      <h3 className="text-2xl font-bold text-white text-center mb-8">Built for Fairness & Transparency</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {FEATURES.map((feat, i) => (
          <div key={i} className="glass-card p-6 card-hover text-center">
            <div className="w-14 h-14 bg-gradient-to-br from-cyan-500/10 to-teal-500/10 rounded-2xl mx-auto mb-4 flex items-center justify-center border border-cyan-500/20">
              <span className="text-2xl">{feat.icon}</span>
            </div>
            <h4 className="text-white font-semibold mb-2">{feat.title}</h4>
            <p className="text-slate-400 text-sm leading-relaxed">{feat.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
