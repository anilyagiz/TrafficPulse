'use client';
import { useWallet } from '../contexts/WalletContext';
import { useState } from 'react';

interface WalletButtonProps {
  showToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

export function WalletButton({ showToast }: WalletButtonProps) {
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
      showToast?.('Wallet connected successfully!', 'success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect wallet. Please make sure Freighter is installed.';
      showToast?.(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    showToast?.('Wallet disconnected', 'info');
  };

  if (connected && address) {
    return (
      <div className="flex items-center gap-2">
        <div 
          className="glass-card px-4 py-2.5 flex items-center gap-3"
          aria-label={`Connected wallet: ${address}`}
        >
          <div 
            className="w-2 h-2 bg-green-400 rounded-full animate-pulse" 
            aria-hidden="true"
          />
          <span className="text-cyan-300 font-mono text-sm">{shortenAddress(address)}</span>
        </div>
        <button
          onClick={handleDisconnect}
          aria-label="Disconnect wallet"
          className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
      aria-label={loading ? 'Connecting to wallet' : 'Connect wallet'}
      aria-busy={loading}
      className="btn-primary px-6 py-2.5 rounded-xl text-white font-semibold text-sm flex items-center gap-2 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900"
    >
      {loading ? (
        <>
          <div className="spinner" style={{ width: 16, height: 16 }} aria-hidden="true" />
          <span>Connecting...</span>
        </>
      ) : (
        <>
          <span aria-hidden="true">💳</span>
          <span>Connect Wallet</span>
        </>
      )}
    </button>
  );
}