'use client';
import { WalletButton } from './WalletButton';

export function Hero() {
  return (
    <div className="space-y-16">
      <section className="max-w-4xl mx-auto text-center pt-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-8">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
          Live on Stellar Testnet
        </div>
        <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
          Predict Traffic.
          <br />
          <span className="gradient-text">Win Rewards.</span>
        </h2>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
          Stake PULSE tokens on your traffic volume prediction. Correct guesses share the pool.
          Powered by Stellar blockchain with commit-reveal fairness.
        </p>
        <div className="flex items-center justify-center gap-4">
          <WalletButton />
          <a 
            href="https://www.freighter.app/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-6 py-2.5 rounded-xl text-sm font-medium text-slate-400 border border-slate-700 hover:text-white hover:border-slate-500 transition-all"
          >
            Get Freighter
          </a>
          <a 
            href="https://laboratory.stellar.org/#account-creator?network=testnet" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-6 py-2.5 rounded-xl text-sm font-medium text-cyan-400/80 border border-cyan-500/20 hover:text-cyan-400 hover:border-cyan-500/40 transition-all"
          >
            Testnet Faucet
          </a>
        </div>
      </section>

      <section id="demo" className="max-w-4xl mx-auto">
        <div className="glass-strong-card overflow-hidden">
          <div className="aspect-video bg-slate-900/80 relative flex items-center justify-center">
            <video
              className="absolute inset-0 w-full h-full object-cover opacity-30"
              autoPlay
              loop
              muted
              playsInline
            >
              <source src="/demo-video.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-slate-950/60" />
            <div className="relative z-10 text-center">
              <div className="w-20 h-20 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors cursor-pointer group">
                <svg className="w-8 h-8 text-cyan-400 ml-1 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <title>Play</title>
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <p className="text-white font-semibold text-lg">Watch How It Works</p>
              <p className="text-slate-400 text-sm mt-1">2 min demo - Predict, Stake, Win</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
