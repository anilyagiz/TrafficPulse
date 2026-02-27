'use client';
import { useState, useEffect } from 'react';
import { trafficPulseClient } from '@/lib/contract';
import { useWallet } from '@/contexts/WalletContext';

export function ClaimRewards() {
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
      alert("Please connect your wallet first");
      return;
    }
    setLoading(true);
    try {
      // MVP: Always try to claim from round #1 for demo
      await trafficPulseClient.claim(address, 1);
      alert("Claim successful!");
      setClaimable(0n);
    } catch (err: any) {
      const msg = err.message || "Nothing to claim yet. Make sure the round is finalized and you won!";
      if (msg.includes("invalid encoded string")) {
        alert("No rewards available for this round. Try again after a round is finalized.");
      } else {
        alert(msg);
      }
    } finally {
      setLoading(false);
    }
  };

    if (!address) return;
    setLoading(true);
    try {
      // MVP: Always try to claim from round #1 for demo
      await trafficPulseClient.claim(address, 1);
      alert("Claim successful!");
      setClaimable(0n);
    } catch (err: any) {
      alert(err.message || "Nothing to claim or error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!connected) return null;

  return (
    <div className="glass-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        <h3 className="text-lg font-bold text-white mb-1">Winning Rewards</h3>
        <p className="text-slate-400 text-sm">Claim your PULSE tokens from successful predictions</p>
      </div>
      <button
        onClick={handleClaim}
        disabled={loading}
        className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-xl font-bold shadow-lg shadow-yellow-500/20 hover:scale-105 transition-all disabled:opacity-50"
      >
        {loading ? "Processing..." : "Claim Rewards 🏆"}
      </button>
    </div>
  );
}
