'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { connectWallet, disconnectWallet, getWalletAddress, getWalletNetwork, checkFreighterInstalled } from '../lib/wallet';

interface WalletContextType {
  address: string | null;
  connected: boolean;
  network: string | null;
  freighterInstalled: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  refreshConnection: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [network, setNetwork] = useState<string | null>(null);
  const [freighterInstalled, setFreighterInstalled] = useState(false);

  // Check if Freighter is installed on mount
  useEffect(() => {
    checkFreighterInstalled().then(installed => {
      setFreighterInstalled(installed);
    });
  }, []);

  // Restore connection from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('wallet-address');
    if (saved) {
      // Verify wallet is still connected
      getWalletAddress().then((addr) => {
        if (addr) {
          setAddress(addr);
          setConnected(true);
          localStorage.setItem('wallet-address', addr);
          // Also get network
          getWalletNetwork().then(net => setNetwork(net));
        } else {
          // Wallet no longer connected, clean up
          localStorage.removeItem('wallet-address');
          localStorage.removeItem('wallet-connected');
        }
      }).catch(() => {
        // Freighter not available, clean up
        localStorage.removeItem('wallet-address');
        localStorage.removeItem('wallet-connected');
      });
    }
  }, []);

  const connect = async () => {
    const wallet = await connectWallet();
    setAddress(wallet.address);
    setConnected(true);
    setNetwork(wallet.network);
    localStorage.setItem('wallet-address', wallet.address);
    localStorage.setItem('wallet-connected', 'true');
  };

  const disconnect = async () => {
    await disconnectWallet();
    setAddress(null);
    setConnected(false);
    setNetwork(null);
  };

  const refreshConnection = async () => {
    try {
      const addr = await getWalletAddress();
      const net = await getWalletNetwork();
      if (addr) {
        setAddress(addr);
        setConnected(true);
        setNetwork(net);
      } else {
        setConnected(false);
        setAddress(null);
      }
    } catch {
      setConnected(false);
      setAddress(null);
    }
  };

  return (
    <WalletContext.Provider value={{ 
      address, 
      connected, 
      network,
      freighterInstalled,
      connect, 
      disconnect,
      refreshConnection
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) throw new Error('useWallet must be used within WalletProvider');
  return context;
}
