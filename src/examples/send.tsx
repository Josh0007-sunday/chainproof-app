import { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import Navbar from '../component/Navbar';

const HELIUS_RPC = import.meta.env.VITE_MAINNET_RPC_URL || 'https://mainnet.helius-rpc.com/?api-key=53b061f7-82e6-4436-a39e-fe1cbfdf0394';

interface TokenBalance {
  mint: string;
  amount: number;
  decimals: number;
  uiAmount: number;
  name?: string;
  symbol?: string;
  logoURI?: string;
}

interface TokenAnalysis {
  success: boolean;
  classification?: {
    type: string;
    utilityScore: number;
    memeScore: number;
  };
  riskAssessment?: {
    riskLevel: string;
  };
}

function Send() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [tokens, setTokens] = useState<TokenBalance[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedToken, setSelectedToken] = useState<string>('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [analysis, setAnalysis] = useState<TokenAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (publicKey) {
      fetchTokenBalances();
    }
  }, [publicKey]);

  const fetchTokenBalances = async () => {
    if (!publicKey) return;

    setLoading(true);
    try {
      // Fetch SOL balance
      const solBalance = await connection.getBalance(publicKey);

      // Fetch token accounts
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
        programId: TOKEN_PROGRAM_ID,
      });

      const tokenBalances: TokenBalance[] = [
        {
          mint: 'SOL',
          amount: solBalance,
          decimals: 9,
          uiAmount: solBalance / LAMPORTS_PER_SOL,
          name: 'Solana',
          symbol: 'SOL',
          logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
        },
      ];

      // Get token metadata from Helius
      for (const account of tokenAccounts.value) {
        const parsedInfo = account.account.data.parsed.info;
        const mint = parsedInfo.mint;
        const amount = parsedInfo.tokenAmount.amount;
        const decimals = parsedInfo.tokenAmount.decimals;
        const uiAmount = parsedInfo.tokenAmount.uiAmount;

        if (uiAmount > 0) {
          try {
            const response = await fetch(HELIUS_RPC, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                jsonrpc: '2.0',
                id: 'token-metadata',
                method: 'getAsset',
                params: { id: mint },
              }),
            });

            const data = await response.json();
            const metadata = data.result?.content?.metadata;

            tokenBalances.push({
              mint,
              amount: parseInt(amount),
              decimals,
              uiAmount,
              name: metadata?.name || 'Unknown Token',
              symbol: metadata?.symbol || 'UNKNOWN',
              logoURI: data.result?.content?.links?.image || '',
            });
          } catch (error) {
            tokenBalances.push({
              mint,
              amount: parseInt(amount),
              decimals,
              uiAmount,
            });
          }
        }
      }

      setTokens(tokenBalances);
    } catch (error) {
      console.error('Error fetching token balances:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendClick = async () => {
    if (!selectedToken || !recipientAddress || !amount) {
      alert('Please fill in all fields');
      return;
    }

    // Validate recipient address
    try {
      new PublicKey(recipientAddress);
    } catch {
      alert('Invalid recipient address');
      return;
    }

    // Only analyze SPL tokens, not SOL
    if (selectedToken !== 'SOL') {
      setAnalyzing(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/mu-checker/full-analysis`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tokenAddress: selectedToken }),
        });

        const data = await response.json();
        setAnalysis(data);
      } catch (error) {
        console.error('Error analyzing token:', error);
        setAnalysis(null);
      } finally {
        setAnalyzing(false);
      }
    }

    setShowConfirm(true);
  };

  const handleConfirmSend = async () => {
    if (!publicKey || !selectedToken) return;

    setSending(true);
    try {
      const recipient = new PublicKey(recipientAddress);
      const selectedTokenData = tokens.find((t) => t.mint === selectedToken);

      if (!selectedTokenData) {
        throw new Error('Token not found');
      }

      const amountInSmallestUnit = parseFloat(amount) * Math.pow(10, selectedTokenData.decimals);

      let transaction = new Transaction();

      if (selectedToken === 'SOL') {
        // Send SOL
        transaction.add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: recipient,
            lamports: amountInSmallestUnit,
          })
        );
      } else {
        // Send SPL Token
        const mint = new PublicKey(selectedToken);
        const fromTokenAccount = await getAssociatedTokenAddress(mint, publicKey);
        const toTokenAccount = await getAssociatedTokenAddress(mint, recipient);

        // Check if recipient's ATA exists
        const toTokenAccountInfo = await connection.getAccountInfo(toTokenAccount);

        // If recipient's ATA doesn't exist, create it
        if (!toTokenAccountInfo) {
          transaction.add(
            createAssociatedTokenAccountInstruction(
              publicKey, // payer
              toTokenAccount, // associated token account
              recipient, // owner
              mint, // mint
              TOKEN_PROGRAM_ID,
              ASSOCIATED_TOKEN_PROGRAM_ID
            )
          );
        }

        // Add transfer instruction
        transaction.add(
          createTransferInstruction(
            fromTokenAccount,
            toTokenAccount,
            publicKey,
            amountInSmallestUnit,
            [],
            TOKEN_PROGRAM_ID
          )
        );
      }

      const signature = await sendTransaction(transaction, connection);
      const latestBlockhash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        signature,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      });

      alert(`Transaction successful! Signature: ${signature}`);
      setShowConfirm(false);
      setAmount('');
      setRecipientAddress('');
      fetchTokenBalances();
    } catch (error) {
      console.error('Error sending transaction:', error);
      alert('Transaction failed: ' + (error as Error).message);
    } finally {
      setSending(false);
    }
  };

  const selectedTokenData = tokens.find((t) => t.mint === selectedToken);

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: '#0e0d13' }}>
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="rounded-lg p-6 space-y-6" style={{ backgroundColor: '#181824', borderColor: '#252538ff', borderWidth: '1px' }}>
          <h1 className="text-2xl font-bold">Send Token</h1>

          {/* Wallet Connection */}
          <div className="flex justify-between items-center pb-4" style={{ borderBottomColor: '#252538ff', borderBottomWidth: '1px' }}>
            <span className="text-lg">Wallet:</span>
            <WalletMultiButton />
          </div>

          {publicKey ? (
            <>
              {/* Token Selection */}
              <div>
                <label className="block text-sm mb-2" style={{ color: '#6b7280' }}>Select Token</label>
                <select
                  className="w-full p-3 rounded-lg text-white outline-none"
                  style={{ backgroundColor: '#0e0d13' }}
                  value={selectedToken}
                  onChange={(e) => setSelectedToken(e.target.value)}
                  disabled={loading}
                >
                  <option value="">
                    {loading ? 'Loading tokens...' : 'Choose a token'}
                  </option>
                  {tokens.map((token) => (
                    <option key={token.mint} value={token.mint}>
                      {token.symbol || 'Unknown'} - {token.uiAmount?.toFixed(4)} {token.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Recipient Address */}
              <div>
                <label className="block text-sm mb-2" style={{ color: '#6b7280' }}>Recipient Address</label>
                <input
                  type="text"
                  className="w-full p-3 rounded-lg text-white outline-none"
                  style={{ backgroundColor: '#0e0d13' }}
                  placeholder="Enter recipient wallet address"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm mb-2" style={{ color: '#6b7280' }}>Amount</label>
                <input
                  type="number"
                  className="w-full p-3 rounded-lg text-white outline-none"
                  style={{ backgroundColor: '#0e0d13' }}
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  step="0.000001"
                />
                {selectedTokenData && (
                  <p className="text-sm mt-1" style={{ color: '#6b7280' }}>
                    Available: {selectedTokenData.uiAmount?.toFixed(6)} {selectedTokenData.symbol}
                  </p>
                )}
              </div>

              {/* Send Button */}
              <button
                className="w-full text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                style={{ borderColor: '#35da9a', borderWidth: '1px', backgroundColor: 'transparent' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(53, 218, 154, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                onClick={handleSendClick}
                disabled={!selectedToken || !recipientAddress || !amount || analyzing}
              >
                {analyzing ? 'Analyzing Token...' : 'Send'}
              </button>
            </>
          ) : (
            <p className="text-center text-gray-400 py-8">
              Please connect your wallet to send tokens
            </p>
          )}
        </div>

        {/* Confirmation Popup */}
        {showConfirm && (
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            <div className="rounded-lg p-6 max-w-md w-full space-y-4" style={{ backgroundColor: '#181824', borderColor: '#252538ff', borderWidth: '1px' }}>
              <h2 className="text-xl font-bold">Confirm Transaction</h2>

              {/* Token Analysis */}
              {selectedToken !== 'SOL' && analysis?.success && (
                <div className="rounded-lg p-4 space-y-2" style={{ borderColor: '#252538ff', borderWidth: '1px' }}>
                  <h3 className="font-semibold">Token Analysis</h3>
                  <div className="flex justify-between">
                    <span style={{ color: '#6b7280' }}>Safety:</span>
                    <span
                      className={
                        analysis.riskAssessment?.riskLevel === 'SAFE'
                          ? 'text-green-500'
                          : analysis.riskAssessment?.riskLevel === 'MODERATE'
                          ? 'text-yellow-500'
                          : 'text-red-500'
                      }
                    >
                      {analysis.riskAssessment?.riskLevel || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: '#6b7280' }}>Type:</span>
                    <span>{analysis.classification?.type || 'Unknown'}</span>
                  </div>
                </div>
              )}

              {/* Transaction Details */}
              <div className="rounded-lg p-4 space-y-2" style={{ borderColor: '#252538ff', borderWidth: '1px' }}>
                <div className="flex justify-between">
                  <span style={{ color: '#6b7280' }}>Token:</span>
                  <span>{selectedTokenData?.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#6b7280' }}>Amount:</span>
                  <span>{amount}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#6b7280' }}>To:</span>
                  <span className="text-xs">
                    {recipientAddress.slice(0, 4)}...{recipientAddress.slice(-4)}
                  </span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  className="flex-1 text-white font-bold py-2 px-4 rounded-lg transition duration-200 hover:bg-gray-700"
                  style={{ backgroundColor: '#282924' }}
                  onClick={() => {
                    setShowConfirm(false);
                    setAnalysis(null);
                  }}
                  disabled={sending}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 transition duration-200"
                  style={{ borderColor: '#35da9a', borderWidth: '1px', backgroundColor: 'transparent' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(53, 218, 154, 0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  onClick={handleConfirmSend}
                  disabled={sending}
                >
                  {sending ? 'Sending...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Send;
