import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { x402PaymentService } from '../services/x402PaymentService';
import { useX402Payment } from '../hooks/useX402Payment';

interface X402PaymentButtonProps {
  endpoint: string;
  requestOptions?: RequestInit;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  buttonText?: string;
  className?: string;
}

/**
 * Component that displays payment requirements and handles x402 payments
 */
export const X402PaymentButton: React.FC<X402PaymentButtonProps> = ({
  endpoint,
  requestOptions = {},
  onSuccess,
  onError,
  buttonText = 'Pay & Access API',
  className = ''
}) => {
  const wallet = useWallet();
  const { makePaymentRequest, isProcessing, error: paymentError } = useX402Payment();

  const [paymentRequirements, setPaymentRequirements] = useState<any>(null);
  const [loadingRequirements, setLoadingRequirements] = useState(false);
  const [balance, setBalance] = useState<{ sufficient: boolean; balance: number; error?: string } | null>(null);

  // Load payment requirements
  useEffect(() => {
    const loadRequirements = async () => {
      setLoadingRequirements(true);
      try {
        const requirements = await x402PaymentService.getPaymentRequirements(
          endpoint,
          requestOptions
        );
        setPaymentRequirements(requirements);
      } catch (err) {
        console.error('Failed to load payment requirements:', err);
      } finally {
        setLoadingRequirements(false);
      }
    };

    loadRequirements();
  }, [endpoint]);

  // Check balance when wallet connects or requirements change
  useEffect(() => {
    const checkUserBalance = async () => {
      if (wallet.connected && wallet.publicKey && paymentRequirements) {
        console.log('Checking balance for wallet:', wallet.publicKey.toBase58());
        console.log('Token mint:', paymentRequirements.token);
        console.log('Required amount:', paymentRequirements.amount);

        const balanceInfo = await x402PaymentService.checkBalance(
          wallet,
          paymentRequirements.token,
          paymentRequirements.amount
        );

        console.log('Balance check result:', balanceInfo);
        setBalance(balanceInfo);
      } else if (!wallet.connected) {
        setBalance(null);
      }
    };

    checkUserBalance();
  }, [wallet.connected, wallet.publicKey, paymentRequirements]);

  const handlePayment = async () => {
    try {
      const response = await makePaymentRequest(endpoint, requestOptions);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'API request failed');
      }

      const data = await response.json();
      onSuccess?.(data);
    } catch (err: any) {
      const errorMessage = err.message || 'Payment failed';
      onError?.(errorMessage);
    }
  };

  if (loadingRequirements) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        <span className="ml-3 text-gray-600">Loading payment details...</span>
      </div>
    );
  }

  if (!paymentRequirements) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg">
        <p className="text-gray-600">No payment required or unable to load requirements.</p>
      </div>
    );
  }

  const cost = x402PaymentService.estimateCost(paymentRequirements);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Payment Info Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Payment Required</h3>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Cost per request:</span>
            <span className="text-xl font-bold text-blue-600">{cost} USDC</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600">Network:</span>
            <span className="text-gray-800 font-medium">{paymentRequirements.network}</span>
          </div>

          {wallet.connected && balance !== null && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Your balance:</span>
              <span className={`font-medium ${balance.sufficient ? 'text-green-600' : 'text-red-600'}`}>
                {(balance.balance / 1_000_000).toFixed(6)} USDC
              </span>
            </div>
          )}

          {wallet.connected && balance === null && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Checking balance...</span>
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
          )}
        </div>

        {!balance?.sufficient && wallet.connected && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800 font-semibold mb-1">
              Insufficient balance
            </p>
            <p className="text-xs text-yellow-700">
              {balance?.error || 'Please add devnet USDC to your wallet.'}
            </p>
            <p className="text-xs text-yellow-600 mt-2">
              Get devnet USDC: <a
                href="https://faucet.solana.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-yellow-800"
              >
                Solana Faucet
              </a> (for SOL), then swap for USDC on a devnet DEX
            </p>
          </div>
        )}

        {paymentError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{paymentError}</p>
          </div>
        )}
      </div>

      {/* Action Button */}
      {!wallet.connected ? (
        <div className="flex justify-center">
          <WalletMultiButton className="!bg-blue-600 hover:!bg-blue-700" />
        </div>
      ) : (
        <button
          onClick={handlePayment}
          disabled={isProcessing || !balance?.sufficient}
          className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all
            ${isProcessing || !balance?.sufficient
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
            }`}
        >
          {isProcessing ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
              Processing Payment...
            </span>
          ) : (
            buttonText
          )}
        </button>
      )}
    </div>
  );
};
