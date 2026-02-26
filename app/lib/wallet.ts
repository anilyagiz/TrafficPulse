import { isConnected, getAddress, signTransaction, setAllowed } from '@stellar/freighter-api';
import { Networks } from '@stellar/stellar-sdk';

export const NETWORK_PASSPHRASE = Networks.TESTNET;

export interface WalletInfo {
  address: string;
  connected: boolean;
}

export async function connectWallet(): Promise<WalletInfo> {
  const connected = await isConnected();
  if (!connected) {
    await setAllowed();
  }
  const result = await getAddress();
  const publicKey = (result as any).address || (result as any).publicKey;
  return { address: publicKey, connected: true };
}

export async function disconnectWallet(): Promise<void> {
  localStorage.removeItem('wallet-address');
}

export async function getWalletAddress(): Promise<string | null> {
  try {
    const result = await getAddress();
    return (result as any).address || (result as any).publicKey || null;
  } catch {
    return null;
  }
}

export async function checkNetwork(): Promise<boolean> {
  return true;
}
