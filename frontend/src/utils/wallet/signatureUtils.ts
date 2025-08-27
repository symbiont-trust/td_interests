import { BrowserProvider } from 'ethers';

export class WalletSignatureError extends Error {
  public readonly code?: string;
  
  constructor(message: string, code?: string) {
    super(message);
    this.name = 'WalletSignatureError';
    this.code = code;
  }
}

export const signMessage = async (
  message: string, 
  walletAddress: string
): Promise<string> => {
  try {
    if (!window.ethereum) {
      throw new WalletSignatureError('No wallet found. Please install MetaMask or connect a wallet.', 'NO_WALLET');
    }

    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    // Verify the signer address matches the expected wallet address
    const signerAddress = await signer.getAddress();
    if (signerAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      throw new WalletSignatureError('Connected wallet does not match expected address', 'ADDRESS_MISMATCH');
    }

    // Sign the message
    const signature = await signer.signMessage(message);
    return signature;

  } catch (error) {
    if (error instanceof WalletSignatureError) {
      throw error;
    }

    // Handle user rejection
    if (error instanceof Error && error.message.includes('user rejected')) {
      throw new WalletSignatureError('User rejected the signature request', 'USER_REJECTED');
    }

    // Handle other errors
    console.error('Signature error:', error);
    throw new WalletSignatureError(
      error instanceof Error ? error.message : 'Failed to sign message',
      'SIGNATURE_FAILED'
    );
  }
};

// Extend the Window interface to include ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}