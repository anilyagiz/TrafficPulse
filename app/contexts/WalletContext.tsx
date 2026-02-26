'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { connectWallet, disconnectWallet, getWalletAddress } from '../lib/wallet';

interface WalletContextType {
  address: string | null;
  connected: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('wallet-address');
    if (saved) {
      setAddress(saved);
      setConnected(true);
    }
  }, []);

  const connect = async () => {
    const wallet = await connectWallet();
    setAddress(wallet.address);
    setConnected(true);
    localStorage.setItem('wallet-address', wallet.address);
  };

  const disconnect = async () => {
    await disconnectWallet();
    setAddress(null);
    setConnected(false);
  };

  return (
    <WalletContext.Provider value={{ address, connected, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) throw new Error('useWallet must be used within WalletProvider');
  return context;
}
