'use client';
import { useState } from 'react';
import { trafficPulseClient } from '@/lib/contract';
import { useWallet } from '@/contexts/WalletContext';

interface AdminControlsProps {
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export function AdminControls({ showToast }: AdminControlsProps) {
  const { address, connected } = useWallet();
  const [loading, setLoading] = useState(false);
  const [roundId, setRoundId] = useState('1');
  const [duration, setDuration] = useState('10');
  const [seed, setSeed] = useState('');
  const [commit, setCommit] = useState('');

  // Validation helpers
  const isValidHex = (str: string) => /^[0-9a-fA-F]{64}$/.test(str);
  const isValidNumber = (str: string) => /^\d+$/.test(str) && parseInt(str) > 0;

  // Simplified: only show if connected (in real app, check against owner() from contract)
  if (!connected) return null;

  const handleInitialize = async () => {
    if (!address) return;
    setLoading(true);
    try {
      // Mock Pulse Token Address for demo
      const tokenAddr = "CAS3J7GYCCX73N3Y2U667B3S7S24X6B7F6J6B7F6J6B7F6J6B7F6J6B7"; 
      await trafficPulseClient.initialize(address, tokenAddr);
      showToast("Contract initialized successfully!", 'success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to initialize contract';
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRound = async () => {
    if (!address || !commit) return;
    
    if (!isValidHex(commit)) {
      showToast('Commit hash must be 64 hex characters (32 bytes)', 'error');
      return;
    }
    
    setLoading(true);
    try {
      const endTime = Math.floor(Date.now() / 1000) + (parseInt(duration) * 60);
      await trafficPulseClient.createRound(address, parseInt(roundId), endTime, commit);
      showToast(`Round #${roundId} created successfully!`, 'success');
      setCommit(''); // Clear form on success
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create round';
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFinalize = async () => {
    if (!address || !seed) return;
    
    if (!isValidHex(seed)) {
      showToast('Seed must be 64 hex characters (32 bytes)', 'error');
      return;
    }
    
    setLoading(true);
    try {
      await trafficPulseClient.finalizeRound(address, parseInt(roundId), seed);
      showToast(`Round #${roundId} finalized! Winners can now claim their rewards.`, 'success');
      setSeed(''); // Clear form on success
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to finalize round';
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="glass-strong-card p-8 border-cyan-500/30"
      role="region"
      aria-label="Admin dashboard"
    >
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
        <span className="text-2xl" aria-hidden="true">🛠️</span> Admin Dashboard
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-cyan-400 font-semibold text-sm uppercase">Lifecycle</h3>
          <button
            onClick={handleInitialize}
            disabled={loading}
            aria-label="Initialize the contract"
            className="w-full py-2 bg-slate-800 border border-slate-700 text-white rounded-lg hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
          >
            Initialize Contract
          </button>
          
          <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-800 space-y-3">
            <div>
              <label htmlFor="admin-round-id" className="sr-only">Round ID</label>
              <input
                id="admin-round-id"
                type="number"
                value={roundId}
                onChange={e => setRoundId(e.target.value)}
                placeholder="Round ID"
                aria-label="Round ID"
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label htmlFor="admin-duration" className="sr-only">Duration in minutes</label>
              <input
                id="admin-duration"
                type="number"
                value={duration}
                onChange={e => setDuration(e.target.value)}
                placeholder="Duration (mins)"
                aria-label="Duration in minutes"
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label htmlFor="admin-commit" className="sr-only">Commit hash (64 hex characters)</label>
              <input
                id="admin-commit"
                type="text"
                value={commit}
                onChange={e => setCommit(e.target.value)}
                placeholder="Commit Hash (64 hex chars)"
                aria-label="Commit hash"
                aria-invalid={commit.length > 0 && !isValidHex(commit)}
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              {commit.length > 0 && !isValidHex(commit) && (
                <p className="text-red-400 text-xs mt-1">Must be exactly 64 hex characters</p>
              )}
            </div>
            <button
              onClick={handleCreateRound}
              disabled={loading || !commit || !isValidHex(commit)}
              aria-label="Create new round"
              className="w-full py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
            >
              Create Round
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-orange-400 font-semibold text-sm uppercase">Resolution</h3>
          <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-800 space-y-3">
            <div>
              <label htmlFor="admin-seed" className="sr-only">Reveal seed (64 hex characters)</label>
              <input
                id="admin-seed"
                type="text"
                value={seed}
                onChange={e => setSeed(e.target.value)}
                placeholder="Reveal Seed (64 hex chars)"
                aria-label="Reveal seed"
                aria-invalid={seed.length > 0 && !isValidHex(seed)}
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              {seed.length > 0 && !isValidHex(seed) && (
                <p className="text-red-400 text-xs mt-1">Must be exactly 64 hex characters</p>
              )}
            </div>
            <button
              onClick={handleFinalize}
              disabled={loading || !seed || !isValidHex(seed)}
              aria-label="Reveal seed and finalize round"
              className="w-full py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-500 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
            >
              Reveal Seed & Finalize
            </button>
          </div>
          <p className="text-slate-500 text-xs italic">
            Finalizing will verify the seed against the commit hash and determine the winning bin.
          </p>
        </div>
      </div>
    </div>
  );
}