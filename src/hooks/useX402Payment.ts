import { useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { x402PaymentService } from '../services/x402PaymentService';

interface UseX402PaymentResult {
  makePaymentRequest: (endpoint: string, options?: RequestInit) => Promise<Response>;
  isProcessing: boolean;
  error: string | null;
  clearError: () => void;
}

/**
 * React hook for making x402 payment-based API requests
 * Automatically handles payment requirements and wallet interactions
 */
export function useX402Payment(): UseX402PaymentResult {
  const wallet = useWallet();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const makePaymentRequest = useCallback(
    async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
      setIsProcessing(true);
      setError(null);

      try {
        if (!wallet.connected || !wallet.publicKey) {
          throw new Error('Please connect your wallet to make payment requests');
        }

        if (!wallet.signTransaction) {
          throw new Error('Wallet does not support transaction signing');
        }

        const response = await x402PaymentService.makePaymentRequest(
          endpoint,
          wallet,
          options
        );

        return response;
      } catch (err: any) {
        const errorMessage = err.message || 'Payment request failed';
        setError(errorMessage);
        throw err;
      } finally {
        setIsProcessing(false);
      }
    },
    [wallet]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    makePaymentRequest,
    isProcessing,
    error,
    clearError
  };
}
