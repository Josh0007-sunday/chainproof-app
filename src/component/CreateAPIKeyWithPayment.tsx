import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { X402PaymentButton } from './X402PaymentButton';

interface CreateAPIKeyWithPaymentProps {
  onSuccess: (apiKey: string) => void;
  onCancel: () => void;
}

export const CreateAPIKeyWithPayment: React.FC<CreateAPIKeyWithPaymentProps> = ({
  onSuccess,
  onCancel
}) => {
  const wallet = useWallet();
  const [keyName, setKeyName] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const serverUrl = import.meta.env.VITE_SERVER_URL || '';

  const handleNext = () => {
    if (!keyName.trim()) {
      setError('Please enter a name for your API key');
      return;
    }
    setError(null);
    setShowPayment(true);
  };

  const handlePaymentSuccess = (data: any) => {
    if (data.success && data.data?.apiKey) {
      onSuccess(data.data.apiKey);
    } else {
      setError('Failed to create API key');
    }
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
  };

  if (showPayment) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="rounded-2xl p-6 max-w-md w-full" style={{ backgroundColor: '#181824' }}>
          <h3 className="text-2xl font-bold text-white mb-2">Pay to Create API Key</h3>
          <p className="text-gray-400 mb-4">API Key Name: <strong className="text-white">{keyName}</strong></p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <X402PaymentButton
            endpoint={`${serverUrl}/auth/api-keys`}
            requestOptions={{
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                name: keyName,
                permissions: {
                  analyze: true,
                  riskScore: true,
                  fullAnalysis: true,
                  batch: true,
                  registration: true
                }
              })
            }}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            buttonText="Pay & Create API Key"
          />

          <button
            onClick={() => setShowPayment(false)}
            className="w-full mt-4 px-4 py-3 rounded-lg transition-all text-white"
            style={{ backgroundColor: '#0e0d13' }}
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="rounded-2xl p-6 max-w-md w-full" style={{ backgroundColor: '#181824' }}>
        <h3 className="text-2xl font-bold text-white mb-2">Create New API Key</h3>
        <p className="text-gray-400 mb-6">Pay with USDC to generate an API key instantly</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="mb-6">
          <label htmlFor="keyName" className="block text-sm font-medium text-white mb-2">
            Key Name *
          </label>
          <input
            type="text"
            id="keyName"
            value={keyName}
            onChange={(e) => setKeyName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleNext()}
            className="w-full px-4 py-3 rounded-lg text-white focus:outline-none focus:ring-2 transition"
            style={{ backgroundColor: '#0e0d13', borderColor: '#252538ff', borderWidth: '1px' }}
            placeholder="e.g., Production Server, Development"
            autoFocus
          />
        </div>

        {!wallet.connected && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 mb-3">Connect your wallet to proceed with payment</p>
            <WalletMultiButton className="!bg-blue-600 hover:!bg-blue-700 w-full" />
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 rounded-lg transition-all text-white"
            style={{ backgroundColor: '#0e0d13' }}
          >
            Cancel
          </button>
          <button
            onClick={handleNext}
            disabled={!keyName.trim() || !wallet.connected}
            className="flex-1 px-4 py-3 rounded-lg font-semibold transition hover:opacity-80 disabled:opacity-50 text-white"
            style={{ backgroundColor: '#35da9a' }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
