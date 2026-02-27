'use client';
import { useState, useEffect } from 'react';
import { trafficPulseClient } from '@/lib/contract';
import { useWallet } from '@/contexts/WalletContext';

interface ClaimRewardsProps {
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export function ClaimRewards({ showToast }: ClaimRewardsProps) {
  const { address, connected } = useWallet();
  const [loading, setLoading] = useState(false);
  const [claimable, setClaimable] = useState<bigint>(0n);

  useEffect(() => {
    if (connected && address) {
      // In a real app, we'd check past rounds or have a specific view for claimable
      // For MVP, we might poll or just check the last round
    }
  }, [address, connected]);

  const handleClaim = async () => {
    if (!address || !connected) {
      showToast("Please connect your wallet first", 'error');
      return;
    }
    setLoading(true);
    try {
      // MVP: Always try to claim from round #1 for demo
      await trafficPulseClient.claim(address, 1);
      showToast("Claim successful! Rewards have been transferred to your wallet.", 'success');
      setClaimable(0n);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Nothing to claim yet. Make sure the round is finalized and you won!";
      if (msg.includes("invalid encoded string") || msg.includes("not found")) {
        showToast("No rewards available for this round. Try again after a round is finalized.", 'error');
      } else if (msg.includes("already claimed")) {
        showToast("You have already claimed your rewards for this round.", 'info');
      } else {
        showToast(msg, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!connected) return null;

  return (
    <div 
      className="glass-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4"
      role="region"
      aria-label="Claim rewards section"
    >
      <div>
        <h3 className="text-lg font-bold text-white mb-1">Winning Rewards</h3>
        <p className="text-slate-400 text-sm">Claim your PULSE tokens from successful predictions</p>
      </div>
      <button
        onClick={handleClaim}
        disabled={loading}
        aria-busy={loading}
        aria-label={loading ? "Processing claim" : "Claim your rewards"}
        className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-xl font-bold shadow-lg shadow-yellow-500/20 hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-slate-900"
      >
        {loading ? "Processing..." : "Claim Rewards 🏆"}
      </button>
    </div>
  );
}