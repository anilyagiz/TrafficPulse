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

      <section id="demo" className="max-w-5xl mx-auto">
        <div className="glass-strong-card overflow-hidden">
          <div className="p-6 border-b border-slate-700/50">
            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="text-3xl">🎬</span>
              Live Traffic Feed
            </h3>
            <p className="text-slate-400 mt-2">Watch real-time traffic and make your prediction</p>
          </div>
          <div className="aspect-video bg-slate-900/80 relative">
            <video
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
            >
              <source src="/demo-video.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-slate-950/50" />
            
            {/* Live Badge */}
            <div className="absolute top-4 left-4 flex items-center gap-2 px-4 py-2 bg-red-500/90 rounded-full text-white text-sm font-bold animate-pulse">
              <div className="w-2 h-2 bg-white rounded-full" />
              LIVE
            </div>

            {/* Prediction Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="glass-card inline-block rounded-xl px-6 py-4">
                <p className="text-white font-semibold text-lg mb-2">Current Traffic Flow</p>
                <p className="text-cyan-400 text-sm">Watch the video and predict the traffic volume bin</p>
              </div>
            </div>
          </div>
          
          {/* Video Info */}
          <div className="p-6 bg-slate-900/50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-xl">⏱️</span>
                </div>
                <div>
                  <p className="text-white font-medium text-sm">Real-Time</p>
                  <p className="text-slate-500 text-xs">Live traffic feed</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🎯</span>
                </div>
                <div>
                  <p className="text-white font-medium text-sm">Make Prediction</p>
                  <p className="text-slate-500 text-xs">Choose your bin below</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🏆</span>
                </div>
                <div>
                  <p className="text-white font-medium text-sm">Win PULSE</p>
                  <p className="text-slate-500 text-xs">Share the pool</p>
                </div>
              </div>
            </div>
          </div>
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
