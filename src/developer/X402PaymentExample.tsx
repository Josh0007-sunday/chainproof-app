import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { X402PaymentButton } from '../component/X402PaymentButton';

/**
 * Example component showing how to use x402 payments with ChainProof Premium API
 * Located in developer section for testing and demonstration
 */
export const X402PaymentExample: React.FC = () => {
  const wallet = useWallet();
  const [tokenAddress, setTokenAddress] = useState('');
  const [apiResult, setApiResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

  const handleSuccess = (data: any) => {
    setApiResult(data);
    setError(null);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setApiResult(null);
  };

  const resetForm = () => {
    setApiResult(null);
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-3xl font-bold mb-2 text-gray-800">Premium Token Analysis</h2>
              <p className="text-gray-600 mb-4">
                Pay per request with USDC - No subscription required
              </p>
            </div>
            <div>
              <WalletMultiButton className="!bg-blue-600 hover:!bg-blue-700" />
            </div>
          </div>

          {wallet.connected && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-green-800">
                <strong>Connected:</strong> {wallet.publicKey?.toBase58().substring(0, 8)}...{wallet.publicKey?.toBase58().slice(-8)}
              </p>
            </div>
          )}

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
            <p className="text-sm text-blue-700">
              <strong>x402 Protocol:</strong> This uses the x402 payment protocol for micropayments.
              Connect your wallet and pay with USDC on Solana devnet for instant API access.
            </p>
          </div>
        </div>

        {/* Input Section */}
        <div className="mb-6">
          <label htmlFor="tokenAddress" className="block text-sm font-medium text-gray-700 mb-2">
            Token Address
          </label>
          <input
            id="tokenAddress"
            type="text"
            value={tokenAddress}
            onChange={(e) => {
              setTokenAddress(e.target.value);
              resetForm();
            }}
            placeholder="Enter Solana token address..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="mt-1 text-xs text-gray-500">
            Example: So11111111111111111111111111111111111111112 (Wrapped SOL)
          </p>
        </div>

        {/* Payment Button */}
        {tokenAddress && (
          <div className="mb-6">
            <X402PaymentButton
              endpoint={`${serverUrl}/api/v1/mu-checker/full-analysis`}
              requestOptions={{
                method: 'POST',
                body: JSON.stringify({ tokenAddress })
              }}
              onSuccess={handleSuccess}
              onError={handleError}
              buttonText="Pay & Analyze Token"
            />
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-red-800 font-semibold mb-1">Error</h3>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Results Display */}
        {apiResult && (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-green-800 font-semibold mb-2">Payment Successful!</h3>
              {apiResult.paymentUsed && (
                <div className="text-sm text-green-700 space-y-1">
                  <p><strong>Transaction:</strong> {apiResult.paymentUsed.transactionSignature.substring(0, 20)}...</p>
                  <p><strong>Amount:</strong> {(apiResult.paymentUsed.amount / 1_000_000).toFixed(6)} USDC</p>
                  <p><strong>Status:</strong> <span className="uppercase">{apiResult.paymentUsed.status}</span></p>
                </div>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Analysis Results</h3>

              {/* Classification */}
              {apiResult.classification && (
                <div className="mb-4 p-4 bg-white rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-700 mb-2">Classification</h4>
                  <div className="space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">Type:</span>{' '}
                      <span className={`px-2 py-1 rounded ${
                        apiResult.classification.type === 'UTILITY'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {apiResult.classification.type}
                      </span>
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Confidence:</span>{' '}
                      {(apiResult.classification.confidence * 100).toFixed(2)}%
                    </p>
                  </div>
                </div>
              )}

              {/* Risk Assessment */}
              {apiResult.riskAssessment && (
                <div className="mb-4 p-4 bg-white rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-700 mb-2">Risk Assessment</h4>
                  <div className="space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">Level:</span>{' '}
                      <span className={`px-2 py-1 rounded ${
                        apiResult.riskAssessment.level === 'SAFE'
                          ? 'bg-green-100 text-green-800'
                          : apiResult.riskAssessment.level === 'MODERATE'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {apiResult.riskAssessment.level}
                      </span>
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Score:</span>{' '}
                      {apiResult.riskAssessment.score}/100
                    </p>
                  </div>
                </div>
              )}

              {/* Token Info */}
              {apiResult.tokenInfo && (
                <div className="p-4 bg-white rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-700 mb-2">Token Information</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Name:</span> {apiResult.tokenInfo.name}</p>
                    <p><span className="font-medium">Symbol:</span> {apiResult.tokenInfo.symbol}</p>
                    {apiResult.tokenInfo.marketCap && (
                      <p><span className="font-medium">Market Cap:</span> ${apiResult.tokenInfo.marketCap.toLocaleString()}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Raw Data */}
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800 font-medium">
                  View Raw JSON
                </summary>
                <pre className="mt-2 p-4 bg-gray-800 text-green-400 rounded-lg overflow-x-auto text-xs">
                  {JSON.stringify(apiResult, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">How x402 Works</h4>
          <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
            <li>Connect your Solana wallet (devnet for testing)</li>
            <li>Enter a token address to analyze</li>
            <li>Pay with USDC (5 USDC per request on devnet)</li>
            <li>Payment is verified on-chain automatically</li>
            <li>Get instant, comprehensive token analysis</li>
            <li>No subscription or API key registration needed</li>
          </ul>

          <div className="mt-4 text-xs text-blue-600">
            <p><strong>Developer Note:</strong> This is using Solana devnet with 5 USDC payment. Get devnet USDC from a faucet to test.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
