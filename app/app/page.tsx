'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useWallet } from '@/contexts/WalletContext';
import { trafficPulseClient, Round } from '@/lib/contract';
import { WalletButton } from '@/components/WalletButton';
import { Hero } from '@/components/Hero';
import { StatsCards } from '@/components/StatsCards';
import { PredictionBins, BINS } from '@/components/PredictionBins';
import { StakeInput } from '@/components/StakeInput';
import { HowToPlay } from '@/components/HowToPlay';
import { Features } from '@/components/Features';
import { ClaimRewards } from '@/components/ClaimRewards';
import { AdminControls } from '@/components/AdminControls';
import { ToastContainer, Toast } from '@/components/ToastContainer';

export default function Home() {
  const { connected, address } = useWallet();
  const [round, setRound] = useState<Round | null>(null);
  const [selectedBin, setSelectedBin] = useState<number | null>(null);
  const [stakeAmount, setStakeAmount] = useState('100');
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState('00:00');
  const [mounted, setMounted] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [progressPercent, setProgressPercent] = useState(0);
  const [adminAddress, setAdminAddress] = useState<string | null>(null);

  const showToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadRound = useCallback(async () => {
    try {
      const data = await trafficPulseClient.getRound(1);
      setRound(data);
      const admin = await trafficPulseClient.getAdmin();
      setAdminAddress(admin);
    } catch (err) {
      console.error("Failed to load round:", err);
    }
  }, []);

  useEffect(() => {
    loadRound();
    const interval = setInterval(loadRound, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [loadRound]);

  useEffect(() => {
    if (!round) return;

    const timer = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((round.endTime - now) / 1000));
      
      const mins = Math.floor(remaining / 60);
      const secs = remaining % 60;
      setTimeLeft(String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0'));
      
      const totalDuration = 600; 
      const elapsed = totalDuration - remaining;
      setProgressPercent(Math.min(100, (elapsed / totalDuration) * 100));
    }, 1000);

    return () => clearInterval(timer);
  }, [round]);

  async function handlePlaceBet() {
    if (!connected || !address || selectedBin === null) return;
    setLoading(true);
    try {
      await trafficPulseClient.placeBet(address, 1, selectedBin, BigInt(stakeAmount));
      showToast(`Bet placed on ${BINS[selectedBin].label} for ${stakeAmount} PULSE!`, 'success');
      setSelectedBin(null);
      setStakeAmount('100');
      loadRound();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to place bet. Please try again.';
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  }

  // Loading state before hydration
  if (!mounted) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      <ToastContainer toasts={toasts} />

      {/* Skip to main content link for accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-cyan-500 focus:text-white focus:rounded-lg"
      >
        Skip to main content
      </a>

      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/8 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal-500/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="container mx-auto px-4 py-6 relative z-10 max-w-7xl">
        {/* Header */}
        <header className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <span className="text-2xl" aria-hidden="true">🚦</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">TrafficPulse</h1>
              <p className="text-cyan-400/70 text-xs font-medium">Predict Traffic • Win PULSE</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <nav className="hidden md:flex items-center gap-1 mr-2" aria-label="Main navigation">
              <Link 
                href="/" 
                className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-slate-800/50 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500"
                aria-current="page"
              >
                Game
              </Link>
              <Link 
                href="/leaderboard" 
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                Leaderboard
              </Link>
            </nav>
            <WalletButton showToast={showToast} />
          </div>
        </header>

        {/* Mobile Navigation */}
        <nav className="md:hidden flex items-center justify-center gap-2 mb-6" aria-label="Mobile navigation">
          <Link 
            href="/" 
            className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-slate-800/50"
            aria-current="page"
          >
            Game
          </Link>
          <Link 
            href="/leaderboard" 
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white"
          >
            Leaderboard
          </Link>
        </nav>

        {!connected ? (
          <div id="main-content" className="space-y-16">
            <Hero />
            <Features />
            <HowToPlay />
            
            <section className="max-w-3xl mx-auto text-center pb-4">
              <div className="flex flex-wrap items-center justify-center gap-6 text-slate-500 text-sm">
                <span className="flex items-center gap-2"><span className="text-lg" aria-hidden="true">⛓️</span> Stellar / Soroban</span>
                <span className="text-slate-700" aria-hidden="true">•</span>
                <span className="flex items-center gap-2"><span className="text-lg" aria-hidden="true">⚛️</span> Next.js 14</span>
                <span className="text-slate-700" aria-hidden="true">•</span>
                <span className="flex items-center gap-2"><span className="text-lg" aria-hidden="true">🦀</span> Rust Smart Contracts</span>
                <span className="text-slate-700" aria-hidden="true">•</span>
                <span className="flex items-center gap-2"><span className="text-lg" aria-hidden="true">🔑</span> Freighter Wallet</span>
              </div>
            </section>
          </div>
        ) : (
          <div id="main-content" className="space-y-8">
            <StatsCards 
              timeLeft={timeLeft} 
              progressPercent={progressPercent} 
              totalPool={round?.totalPool || 0n} 
              status={round?.status || 'OPEN'} 
              winningBin={round?.winningBin}
            />

            <ClaimRewards showToast={showToast} />

            <div className="glass-strong-card p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-xl flex items-center justify-center" aria-hidden="true">
                    <span className="text-lg">🎯</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Select Your Prediction</h2>
                    <p className="text-slate-400 text-sm">Choose the traffic volume bin you think will win</p>
                  </div>
                </div>
              </div>

              <PredictionBins 
                selectedBin={selectedBin} 
                setSelectedBin={setSelectedBin} 
                binTotals={round?.binTotals || [0n, 0n, 0n, 0n, 0n]} 
              />

              {selectedBin !== null && (
                <StakeInput 
                  stakeAmount={stakeAmount} 
                  setStakeAmount={setStakeAmount} 
                  loading={loading} 
                  handlePlaceBet={handlePlaceBet} 
                  selectedBin={selectedBin} 
                  totalPool={round?.totalPool || 0n} 
                />
              )}
            </div>

            <div className="glass-card overflow-hidden">
              <div className="p-6 border-b border-slate-700/50">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  <span className="text-2xl" aria-hidden="true">🎬</span>
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
                  aria-hidden="true"
                >
                  <source src="/demo-video.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/50" aria-hidden="true" />
                <div className="relative z-10 text-center">
                  <button 
                    className="w-20 h-20 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors cursor-pointer group focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    aria-label="Play demo video"
                  >
                    <svg className="w-8 h-8 text-cyan-400 ml-1 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                  <p className="text-white font-semibold text-lg">Watch Demo Video</p>
                  <p className="text-slate-400 text-sm mt-1">See TrafficPulse in action</p>
                </div>
              </div>
            </div>

            <HowToPlay compact />

            {connected && address === adminAddress && <AdminControls showToast={showToast} />}

            <footer className="text-center text-slate-500 text-sm py-6">
              <div className="flex items-center justify-center gap-4 mb-2">
                <Link 
                  href="/leaderboard" 
                  className="text-cyan-400/80 hover:text-cyan-400 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded"
                >
                  Leaderboard
                </Link>
                <span className="text-slate-700" aria-hidden="true">•</span>
                <a
                  href={`https://stellar.expert/explorer/testnet/contract/${process.env.NEXT_PUBLIC_CONTRACT_ID || 'CDTUCJ52DABJ3GWL2N5Y5HOEHXA4IA3RUE6DILYFNHWUH4N67EHCWECC'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400/80 hover:text-cyan-400 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded"
                >
                  Explorer ↗
                </a>
                <span className="text-slate-700" aria-hidden="true">•</span>
                <a
                  href="https://github.com/anilyagiz/trafficpulse"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400/80 hover:text-cyan-400 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded"
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