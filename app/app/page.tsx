'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useWallet } from '@/contexts/WalletContext';
import { trafficPulseClient } from '@/lib/contract';
import { WalletButton } from '@/components/WalletButton';

interface Round {
  roundId: number;
  startTime: number;
  endTime: number;
  status: 'OPEN' | 'CLOSED' | 'FINALIZED';
  totalPool: bigint;
  binTotals: bigint[];
}

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

const BINS = [
  { label: '0-20', range: 'Very Light', icon: '🟢', color: 'from-emerald-500/20 to-emerald-600/10', border: 'border-emerald-500/30', activeBg: 'from-emerald-500/30 to-emerald-600/20', glow: 'shadow-emerald-500/20' },
  { label: '21-40', range: 'Light', icon: '🔵', color: 'from-blue-500/20 to-blue-600/10', border: 'border-blue-500/30', activeBg: 'from-blue-500/30 to-blue-600/20', glow: 'shadow-blue-500/20' },
  { label: '41-60', range: 'Moderate', icon: '🟡', color: 'from-yellow-500/20 to-yellow-600/10', border: 'border-yellow-500/30', activeBg: 'from-yellow-500/30 to-yellow-600/20', glow: 'shadow-yellow-500/20' },
  { label: '61-80', range: 'Heavy', icon: '🟠', color: 'from-orange-500/20 to-orange-600/10', border: 'border-orange-500/30', activeBg: 'from-orange-500/30 to-orange-600/20', glow: 'shadow-orange-500/20' },
  { label: '81+', range: 'Severe', icon: '🔴', color: 'from-red-500/20 to-red-600/10', border: 'border-red-500/30', activeBg: 'from-red-500/30 to-red-600/20', glow: 'shadow-red-500/20' },
];

const FEATURES = [
  { icon: '🔒', title: 'Commit-Reveal', desc: 'Fair result computation with hidden seeds until round ends' },
  { icon: '👥', title: '2/3 Multi-Sig', desc: 'Committee approval prevents single-point manipulation' },
  { icon: '🛡️', title: 'Sniping Prevention', desc: 'No bets allowed in the last 3 minutes of each round' },
  { icon: '💸', title: 'Pari-Mutuel', desc: 'Winners share the entire pool with only 3% protocol fee' },
];

export default function Home() {
  const { connected, address } = useWallet();
  const [rounds, setRounds] = useState<Round[]>([]);
  const [selectedBin, setSelectedBin] = useState<number | null>(null);
  const [stakeAmount, setStakeAmount] = useState('100');
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState('10:00');
  const [mounted, setMounted] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [progressPercent, setProgressPercent] = useState(0);

  const showToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!connected) return;
    loadRounds();
    const timer = setInterval(() => {
      const remaining = Math.max(0, 600 - Math.floor((Date.now() % 600000) / 1000));
      const mins = Math.floor(remaining / 60);
      const secs = remaining % 60;
      setTimeLeft(String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0'));
      setProgressPercent(((600 - remaining) / 600) * 100);
    }, 1000);
    return () => clearInterval(timer);
  }, [connected]);

  async function loadRounds() {
    const round = await trafficPulseClient.getRound(1);
    setRounds([round]);
  }

  async function handlePlaceBet() {
    if (!connected || selectedBin === null) return;
    setLoading(true);
    try {
      await trafficPulseClient.placeBet(1, selectedBin, BigInt(stakeAmount));
      showToast(`Bet placed on ${BINS[selectedBin].label} for ${stakeAmount} PULSE!`, 'success');
      setSelectedBin(null);
      setStakeAmount('100');
      loadRounds();
    } catch {
      showToast('Failed to place bet. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  }

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Toast Notifications */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`animate-fadeIn glass-card px-5 py-3 flex items-center gap-3 min-w-[300px] ${
              toast.type === 'success' ? 'border-green-500/30' :
              toast.type === 'error' ? 'border-red-500/30' : 'border-cyan-500/30'
            }`}
          >
            <span className="text-lg">
              {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️'}
            </span>
            <span className="text-sm text-white">{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/8 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal-500/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="container mx-auto px-4 py-6 relative z-10 max-w-7xl">
        {/* ── Header ── */}
        <header className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <span className="text-2xl">🚦</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">TrafficPulse</h1>
              <p className="text-cyan-400/70 text-xs font-medium">Predict Traffic • Win PULSE</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <nav className="hidden md:flex items-center gap-1 mr-2">
              <Link href="/" className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-slate-800/50 transition-all">
                Game
              </Link>
              <Link href="/leaderboard" className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all">
                Leaderboard
              </Link>
            </nav>
            <WalletButton />
          </div>
        </header>

        {/* ── Hero Section (not connected) ── */}
        {!connected ? (
          <div className="space-y-16">
            {/* Hero */}
            <section className="max-w-4xl mx-auto text-center pt-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-8">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                Live on Stellar Testnet
              </div>
              <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Predict Traffic.<br />
                <span className="gradient-text">Win Rewards.</span>
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
                Stake PULSE tokens on your traffic volume prediction. Correct guesses share the pool.
                Powered by Stellar blockchain with commit-reveal fairness.
              </p>
              <div className="flex items-center justify-center gap-4">
                <WalletButton />
                <a href="#demo" className="px-6 py-2.5 rounded-xl text-sm font-medium text-slate-400 border border-slate-700 hover:text-white hover:border-slate-500 transition-all">
                  Watch Demo ▶
                </a>
              </div>
            </section>

            {/* Demo Video Section */}
            <section id="demo" className="max-w-4xl mx-auto">
              <div className="glass-strong-card overflow-hidden">
                <div className="aspect-video bg-slate-900/80 relative flex items-center justify-center">
                  <video
                    className="absolute inset-0 w-full h-full object-cover opacity-30"
                    autoPlay
                    loop
                    muted
                    playsInline
                    poster=""
                  >
                    <source src="/demo-video.mp4" type="video/mp4" />
                  </video>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-slate-950/60" />
                  <div className="relative z-10 text-center">
                    <div className="w-20 h-20 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors cursor-pointer group">
                      <svg className="w-8 h-8 text-cyan-400 ml-1 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    <p className="text-white font-semibold text-lg">Watch How It Works</p>
                    <p className="text-slate-400 text-sm mt-1">2 min demo • Predict, Stake, Win</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Features */}
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

            {/* How to Play */}
            <section className="max-w-4xl mx-auto">
              <div className="glass-card p-8">
                <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                  <span className="text-2xl">📖</span>
                  How to Play
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                  {[
                    { step: 1, icon: '💳', title: 'Connect', desc: 'Link Freighter wallet' },
                    { step: 2, icon: '🎯', title: 'Predict', desc: 'Choose a traffic bin' },
                    { step: 3, icon: '💰', title: 'Stake', desc: 'Enter PULSE amount' },
                    { step: 4, icon: '⏰', title: 'Wait', desc: 'Round resolves in 10m' },
                    { step: 5, icon: '🏆', title: 'Win', desc: 'Claim your share!' },
                  ].map((item) => (
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
            </section>

            {/* Tech Stack */}
            <section className="max-w-3xl mx-auto text-center pb-4">
              <div className="flex flex-wrap items-center justify-center gap-6 text-slate-500 text-sm">
                <span className="flex items-center gap-2"><span className="text-lg">⛓️</span> Stellar / Soroban</span>
                <span className="text-slate-700">•</span>
                <span className="flex items-center gap-2"><span className="text-lg">⚛️</span> Next.js 14</span>
                <span className="text-slate-700">•</span>
                <span className="flex items-center gap-2"><span className="text-lg">🦀</span> Rust Smart Contracts</span>
                <span className="text-slate-700">•</span>
                <span className="flex items-center gap-2"><span className="text-lg">🔑</span> Freighter Wallet</span>
              </div>
            </section>
          </div>
        ) : (
          /* ── Game Dashboard (connected) ── */
          <div className="space-y-8">
            {/* Stats Row */}
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
                  {rounds[0] ? Number(rounds[0].totalPool).toLocaleString() : '0'}
                  <span className="text-lg text-cyan-400 ml-2">PULSE</span>
                </div>
                <div className="mt-3 text-sm text-slate-500">
                  ≈ ${(rounds[0] ? Number(rounds[0].totalPool) * 0.01 : 0).toFixed(2)} USD
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
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
                  <div className="text-2xl font-bold text-white">OPEN</div>
                </div>
                <div className="mt-3 text-sm text-slate-500">Round #1 • Accepting bets</div>
              </div>
            </div>

            {/* Prediction Bins */}
            <div className="glass-strong-card p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-xl flex items-center justify-center">
                    <span className="text-lg">🎯</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Select Your Prediction</h2>
                    <p className="text-slate-400 text-sm">Choose the traffic volume bin you think will win</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                {BINS.map((bin, idx) => {
                  const isSelected = selectedBin === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedBin(isSelected ? null : idx)}
                      className={`relative overflow-hidden rounded-2xl p-5 transition-all duration-300 border ${
                        isSelected
                          ? `bg-gradient-to-br ${bin.activeBg} ${bin.border} shadow-xl ${bin.glow} scale-[1.03]`
                          : `bg-gradient-to-br ${bin.color} border-slate-700/50 hover:${bin.border} hover:scale-[1.02]`
                      }`}
                    >
                      <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                      <div className="relative z-10">
                        <div className="text-2xl mb-2">{bin.icon}</div>
                        <div className="text-xl font-bold text-white mb-0.5">{bin.label}</div>
                        <div className="text-xs text-slate-400 mb-3">{bin.range}</div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">Pool:</span>
                          <span className="font-semibold text-cyan-300">
                            {rounds[0]?.binTotals[idx] ? Number(rounds[0].binTotals[idx]).toLocaleString() : '0'}
                          </span>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-cyan-400 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Stake Input */}
              {selectedBin !== null && (
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
                          {stakeAmount && rounds[0]?.totalPool
                            ? ((parseInt(stakeAmount) / (Number(rounds[0].totalPool) + parseInt(stakeAmount))) * 100).toFixed(1)
                            : '100'}%
                        </span> of the pool
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Demo Video Section */}
            <div className="glass-card overflow-hidden">
              <div className="p-6 border-b border-slate-700/50">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  <span className="text-2xl">🎬</span>
                  Project Demo
                </h2>
              </div>
              <div className="aspect-video bg-slate-900/60 relative flex items-center justify-center">
                <video
                  className="absolute inset-0 w-full h-full object-cover opacity-25"
                  autoPlay
                  loop
                  muted
                  playsInline
                >
                  <source src="/demo-video.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/50" />
                <div className="relative z-10 text-center">
                  <div className="w-20 h-20 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors cursor-pointer group">
                    <svg className="w-8 h-8 text-cyan-400 ml-1 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <p className="text-white font-semibold text-lg">Watch Demo Video</p>
                  <p className="text-slate-400 text-sm mt-1">See TrafficPulse in action</p>
                </div>
              </div>
            </div>

            {/* How to Play (compact for logged-in users) */}
            <div className="glass-card p-8">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-2xl">📖</span>
                How to Play
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                {[
                  { step: 1, icon: '💳', title: 'Connect', desc: 'Link wallet' },
                  { step: 2, icon: '🎯', title: 'Predict', desc: 'Choose bin' },
                  { step: 3, icon: '💰', title: 'Stake', desc: 'Enter amount' },
                  { step: 4, icon: '⏰', title: 'Wait', desc: '10 minutes' },
                  { step: 5, icon: '🏆', title: 'Win', desc: 'Share pool!' },
                ].map((item) => (
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

            {/* Footer */}
            <footer className="text-center text-slate-500 text-sm py-6">
              <div className="flex items-center justify-center gap-4 mb-2">
                <Link href="/leaderboard" className="text-cyan-400/80 hover:text-cyan-400 transition-colors">
                  Leaderboard
                </Link>
                <span className="text-slate-700">•</span>
                <a
                  href="https://stellar.expert/explorer/testnet/contract/CDTUCJ52DABJ3GWL2N5Y5HOEHXA4IA3RUE6DILYFNHWUH4N67EHCWECC"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400/80 hover:text-cyan-400 transition-colors"
                >
                  Explorer ↗
                </a>
                <span className="text-slate-700">•</span>
                <a
                  href="https://github.com/anilyagiz/trafficpulse"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400/80 hover:text-cyan-400 transition-colors"
                >
                  GitHub ↗
                </a>
              </div>
              <p>Powered by Stellar / Soroban • Contract: <span className="font-mono text-cyan-400/60">CDTUC...WECC</span></p>
            </footer>
          </div>
        )}
      </div>
    </main>
  );
}
