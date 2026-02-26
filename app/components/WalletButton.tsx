'use client';
import { useWallet } from '../contexts/WalletContext';
import { useState } from 'react';

export function WalletButton() {
  const { address, connected, connect, disconnect } = useWallet();
  const [loading, setLoading] = useState(false);

  const shortenAddress = (addr: string) => {
    if (!addr || addr.length < 10) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleConnect = async () => {
    setLoading(true);
    try {
      await connect();
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  if (connected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className="glass-card px-4 py-2.5 flex items-center gap-3">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-cyan-300 font-mono text-sm">{shortenAddress(address)}</span>
        </div>
        <button
          onClick={disconnect}
          className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-200"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={loading}
      className="btn-primary px-6 py-2.5 rounded-xl text-white font-semibold text-sm flex items-center gap-2 disabled:opacity-50"
    >
      {loading ? (
        <>
          <div className="spinner" style={{ width: 16, height: 16 }} />
          <span>Connecting...</span>
        </>
      ) : (
        <>
          <span>💳</span>
          <span>Connect Wallet</span>
        </>
      )}
    </button>
  );
}
