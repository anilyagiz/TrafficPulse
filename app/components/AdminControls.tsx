'use client';
import { useState } from 'react';
import { trafficPulseClient } from '@/lib/contract';
import { useWallet } from '@/contexts/WalletContext';

export function AdminControls() {
  const { address, connected } = useWallet();
  const [loading, setLoading] = useState(false);
  const [roundId, setRoundId] = useState('1');
  const [duration, setDuration] = useState('10');
  const [seed, setSeed] = useState('');
  const [commit, setCommit] = useState('');

  // Simplified: only show if connected (in real app, check against owner() from contract)
  if (!connected) return null;

  const handleInitialize = async () => {
    if (!address) return;
    setLoading(true);
    try {
      // Mock Pulse Token Address for demo
      const tokenAddr = "CAS3J7GYCCX73N3Y2U667B3S7S24X6B7F6J6B7F6J6B7F6J6B7F6J6B7"; 
      await trafficPulseClient.initialize(address, tokenAddr);
      alert("Contract initialized!");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRound = async () => {
    if (!address || !commit) return;
    setLoading(true);
    try {
      const endTime = Math.floor(Date.now() / 1000) + (parseInt(duration) * 60);
      await trafficPulseClient.createRound(address, parseInt(roundId), endTime, commit);
      alert(`Round #${roundId} created!`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalize = async () => {
    if (!address || !seed) return;
    setLoading(true);
    try {
      await trafficPulseClient.finalizeRound(address, parseInt(roundId), seed);
      alert(`Round #${roundId} finalized!`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-strong-card p-8 border-cyan-500/30">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
        <span className="text-2xl">🛠️</span> Admin Dashboard
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-cyan-400 font-semibold text-sm uppercase">Lifecycle</h3>
          <button
            onClick={handleInitialize}
            disabled={loading}
            className="w-full py-2 bg-slate-800 border border-slate-700 text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            Initialize Contract
          </button>
          
          <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-800 space-y-3">
            <input
              type="number"
              value={roundId}
              onChange={e => setRoundId(e.target.value)}
              placeholder="Round ID"
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm"
            />
            <input
              type="number"
              value={duration}
              onChange={e => setDuration(e.target.value)}
              placeholder="Duration (mins)"
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm"
            />
            <input
              type="text"
              value={commit}
              onChange={e => setCommit(e.target.value)}
              placeholder="Commit Hash (Hex)"
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm"
            />
            <button
              onClick={handleCreateRound}
              disabled={loading || !commit}
              className="w-full py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 transition-colors font-medium"
            >
              Create Round
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-orange-400 font-semibold text-sm uppercase">Resolution</h3>
          <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-800 space-y-3">
            <input
              type="text"
              value={seed}
              onChange={e => setSeed(e.target.value)}
              placeholder="Reveal Seed (Hex)"
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm"
            />
            <button
              onClick={handleFinalize}
              disabled={loading || !seed}
              className="w-full py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-500 transition-colors font-medium"
            >
              Reveal Seed & Finalize
            </button>
          </div>
          <p className="text-slate-500 text-xs italic">
            * Finalizing will verify the seed against the commit and calculate winners.
          </p>
        </div>
      </div>
    </div>
  );
}
