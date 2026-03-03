import { isConnected, getAddress, setAllowed, getNetwork } from '@stellar/freighter-api';
import { Networks } from '@stellar/stellar-sdk';

export const NETWORK_PASSPHRASE = Networks.TESTNET;
export const EXPECTED_NETWORK = 'TESTNET';

export interface WalletInfo {
  address: string;
  connected: boolean;
  network: string;
}

export async function checkFreighterInstalled(): Promise<boolean> {
  try {
    const connected = await isConnected();
    return connected.isConnected;
  } catch {
    return false;
  }
}

export async function connectWallet(): Promise<WalletInfo> {
  try {
    // Check if Freighter is installed
    const connectedStatus = await isConnected();
    if (!connectedStatus.isConnected) {
      throw new Error('Freighter wallet is not installed. Please install it from https://www.freighter.app/');
    }

    // Request connection permission
    const allowed = await setAllowed();
    if (allowed.isAllowed === false) {
      throw new Error('Wallet connection was rejected. Please approve the connection in Freighter.');
    }

    // Get the connected address
    const addressResult = await getAddress();
    if (!addressResult.address) {
      throw new Error('No wallet address found. Please unlock your Freighter wallet.');
    }

    // Verify network
    const networkResult = await getNetwork();
    const currentNetwork = networkResult.network || 'UNKNOWN';
    
    if (currentNetwork.toUpperCase() !== EXPECTED_NETWORK) {
      console.warn(`Wallet is on ${currentNetwork} network. Expected: ${EXPECTED_NETWORK}`);
    }

    return { 
      address: addressResult.address, 
      connected: true,
      network: currentNetwork
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to connect wallet: ${String(error)}`);
  }
}

export async function disconnectWallet(): Promise<void> {
  localStorage.removeItem('wallet-address');
  localStorage.removeItem('wallet-connected');
}

export async function getWalletAddress(): Promise<string | null> {
  try {
    const result = await getAddress();
    return result.address || null;
  } catch {
    return null;
  }
}

export async function getWalletNetwork(): Promise<string | null> {
  try {
    const result = await getNetwork();
    return result.network || null;
  } catch {
    return null;
  }
}
