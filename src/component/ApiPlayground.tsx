import React, { useState, useRef, useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { FaPaperPlane, FaSpinner, FaCheckCircle, FaExclamationTriangle, FaWallet, FaDownload } from 'react-icons/fa';
import { useWallet } from '@solana/wallet-adapter-react';
import { useX402Payment } from '../hooks/useX402Payment';
import html2canvas from 'html2canvas';
import { useTheme } from '../context/ThemeContext';

interface Message {
  id: string;
  type: 'user' | 'system' | 'analysis';
  content: any;
  timestamp: Date;
  status?: 'analyzing' | 'success' | 'error';
}

export const ApiPlayground: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputAddress, setInputAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { connected, publicKey } = useWallet();
  const { makePaymentRequest, isProcessing } = useX402Payment();
  const { colors } = useTheme();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleAnalyze = async () => {
    if (!inputAddress.trim()) {
      alert('Please enter a token address');
      return;
    }

    // Check if wallet is connected
    if (!connected || !publicKey) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'system',
        content: 'Please connect your wallet to use the API Playground. Payment of 0.1 USDC is required per request.',
        timestamp: new Date(),
        status: 'error',
      };
      setMessages((prev) => [...prev, errorMessage]);
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputAddress,
      timestamp: new Date(),
    };

    // Add analyzing message
    const analyzingMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: 'system',
      content: 'Analyzing token...',
      timestamp: new Date(),
      status: 'analyzing',
    };

    setMessages((prev) => [...prev, userMessage, analyzingMessage]);
    setInputAddress('');
    setLoading(true);

    try {
      // Call the full-analysis endpoint with x402 payment
      const response = await makePaymentRequest(`${import.meta.env.VITE_SERVER_URL}/api/mu-checker/full-analysis`, {
        method: 'POST',
        body: JSON.stringify({ tokenAddress: inputAddress }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();

      // Remove analyzing message and add success message
      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== analyzingMessage.id);
        const analysisMessage: Message = {
          id: Date.now().toString(),
          type: 'analysis',
          content: data,
          timestamp: new Date(),
          status: 'success',
        };
        return [...filtered, analysisMessage];
      });
    } catch (error: any) {
      // Remove analyzing message and add error message
      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== analyzingMessage.id);

        let errorContent = 'Failed to analyze token. Please try again.';

        // Check for specific error types
        if (error.message) {
          if (error.message.includes('wallet')) {
            errorContent = error.message;
          } else if (error.message.includes('Payment')) {
            errorContent = `Payment failed: ${error.message}`;
          } else if (error.message.includes('balance')) {
            errorContent = `Insufficient balance: ${error.message}`;
          } else {
            errorContent = error.message;
          }
        }

        const errorMessage: Message = {
          id: Date.now().toString(),
          type: 'system',
          content: errorContent,
          timestamp: new Date(),
          status: 'error',
        };
        return [...filtered, errorMessage];
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading && !isProcessing && connected) {
      handleAnalyze();
    }
  };

  const handleDownloadCard = async (messageId: string, tokenName: string) => {
    const cardElement = document.getElementById(`token-card-${messageId}`);
    if (!cardElement) return;

    try {
      const canvas = await html2canvas(cardElement, {
        backgroundColor: colors.background,
        scale: 2, // Higher quality
        logging: false,
        useCORS: true, // Allow cross-origin images
      });

      const link = document.createElement('a');
      link.download = `${tokenName.replace(/\s+/g, '_')}_analysis.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Failed to download card:', error);
      alert('Failed to download card. Please try again.');
    }
  };

  const renderMessage = (message: Message) => {
    if (message.type === 'user') {
      return (
        <div key={message.id} className="flex justify-end mb-4">
          <div className="max-w-2xl px-4 py-3 rounded-lg" style={{ backgroundColor: colors.primary, color: '#0e0d13' }}>
            <p className="font-mono text-sm break-all">{message.content}</p>
          </div>
        </div>
      );
    }

    if (message.type === 'system') {
      return (
        <div key={message.id} className="flex justify-start mb-4">
          <div className="max-w-2xl px-4 py-3 rounded-lg flex items-center gap-2" style={{ backgroundColor: colors.cardBg, borderColor: colors.border, borderWidth: '1px' }}>
            {message.status === 'analyzing' && <FaSpinner className="animate-spin" style={{ color: colors.primary }} />}
            {message.status === 'error' && <FaExclamationTriangle style={{ color: '#ff6b6b' }} />}
            <p className="text-sm" style={{ color: message.status === 'error' ? '#ff6b6b' : '#fff' }}>
              {message.content}
            </p>
          </div>
        </div>
      );
    }

    if (message.type === 'analysis') {
      const data = message.content;
      const tokenInfo = data.tokenInfo || {};
      const riskAssessment = data.riskAssessment || {};
      const classification = data.classification || {};
      const jupiterData = data.jupiterData || {};

      const riskLevel = riskAssessment.riskLevel?.toUpperCase();
      const riskColor = riskLevel === 'GOOD' || riskLevel === 'SAFE'
        ? '#4ade80'
        : riskLevel === 'AVERAGE'
        ? '#fbbf24'
        : riskLevel === 'BAD' || riskLevel === 'DANGER'
        ? '#ef4444'
        : '#6b7280';

      const logoURI = tokenInfo.logoURI || jupiterData.logoURI;

      const tokenName = tokenInfo.name || jupiterData.name || 'Unknown_Token';

      return (
        <div key={message.id} className="flex justify-start mb-4">
          <div className="max-w-3xl w-full">
            {/* Download Button */}
            <div className="flex justify-end mb-2">
              <button
                onClick={() => handleDownloadCard(message.id, tokenName)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition hover:opacity-80"
                style={{
                  backgroundColor: 'rgba(53, 218, 154, 0.1)',
                  borderColor: 'rgba(53, 218, 154, 0.3)',
                  borderWidth: '1px',
                  color: colors.primary,
                }}
              >
                <FaDownload />
                Download Card
              </button>
            </div>

            {/* Token Card */}
            <div id={`token-card-${message.id}`} className="rounded-2xl overflow-hidden relative" style={{
              backgroundColor: colors.cardBg,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            }}>
              {/* Blurred Background with Token Icon */}
              {logoURI && (
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: `url(${logoURI})`,
                    backgroundSize: '200%',
                    backgroundPosition: 'center',
                    filter: 'blur(60px)',
                    transform: 'scale(1.2)',
                  }}
                />
              )}

              {/* Gradient Overlay */}
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(135deg, rgba(53, 218, 154, 0.1) 0%, rgba(14, 13, 19, 0.95) 50%, rgba(24, 24, 36, 0.95) 100%)',
                }}
              />

              {/* Content */}
              <div className="relative z-10 p-6">
                {/* Header with Token Info */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    {logoURI && (
                      <div className="relative">
                        <div
                          className="absolute inset-0 rounded-full blur-xl opacity-50"
                          style={{ backgroundColor: colors.primary }}
                        />
                        <img
                          src={logoURI}
                          alt={tokenInfo.name || jupiterData.name}
                          className="relative w-16 h-16 rounded-full ring-2 ring-white/10"
                          style={{ boxShadow: '0 4px 20px rgba(53, 218, 154, 0.3)' }}
                        />
                      </div>
                    )}
                    <div>
                      <h3 className="text-2xl font-bold mb-1" style={{
                        background: 'linear-gradient(135deg, #ffffff 0%, #a1a1aa 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}>
                        {tokenInfo.name || jupiterData.name || 'Unknown Token'}
                      </h3>
                      <p className="text-sm font-mono" style={{ color: colors.textTertiary }}>
                        {tokenInfo.symbol || jupiterData.symbol || data.tokenAddress?.slice(0, 8)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ backgroundColor: 'rgba(53, 218, 154, 0.1)', borderColor: 'rgba(53, 218, 154, 0.3)', borderWidth: '1px' }}>
                    <FaCheckCircle style={{ color: colors.primary, fontSize: '12px' }} />
                    <span className="text-xs font-semibold" style={{ color: colors.primary }}>VERIFIED</span>
                  </div>
                </div>

              {/* Risk Assessment Card */}
              <div className="mb-5 p-4 rounded-xl" style={{
                backgroundColor: 'rgba(14, 13, 19, 0.6)',
                backdropFilter: 'blur(10px)',
                borderColor: 'rgba(255, 255, 255, 0.05)',
                borderWidth: '1px',
              }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#a1a1aa' }}>Risk Assessment</span>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-black" style={{ color: riskColor, textShadow: `0 0 20px ${riskColor}40` }}>
                      {riskLevel || 'N/A'}
                    </span>
                    <span className="text-sm font-mono" style={{ color: colors.textTertiary }}>
                      {riskAssessment.riskScore !== null && riskAssessment.riskScore !== undefined ? riskAssessment.riskScore : '--'}/100
                    </span>
                  </div>
                </div>
                <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(14, 13, 19, 0.8)' }}>
                  <div
                    className="h-full rounded-full transition-all relative"
                    style={{
                      width: `${riskAssessment.riskScore || 0}%`,
                      background: `linear-gradient(90deg, ${riskColor} 0%, ${riskColor}cc 100%)`,
                      boxShadow: `0 0 10px ${riskColor}60`,
                    }}
                  >
                    <div
                      className="absolute inset-0 animate-pulse"
                      style={{
                        background: `linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%)`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="p-3.5 rounded-xl" style={{
                  backgroundColor: 'rgba(14, 13, 19, 0.6)',
                  backdropFilter: 'blur(10px)',
                  borderColor: 'rgba(255, 255, 255, 0.05)',
                  borderWidth: '1px',
                }}>
                  <span className="text-xs block mb-1.5 uppercase tracking-wide font-semibold" style={{ color: colors.textTertiary }}>Classification</span>
                  <span className="text-base font-bold">{classification.type || 'N/A'}</span>
                </div>
                <div className="p-3.5 rounded-xl" style={{
                  backgroundColor: 'rgba(14, 13, 19, 0.6)',
                  backdropFilter: 'blur(10px)',
                  borderColor: 'rgba(255, 255, 255, 0.05)',
                  borderWidth: '1px',
                }}>
                  <span className="text-xs block mb-1.5 uppercase tracking-wide font-semibold" style={{ color: colors.textTertiary }}>Utility Score</span>
                  <span className="text-base font-bold" style={{ color: colors.primary }}>
                    {classification.utilityScore !== null && classification.utilityScore !== undefined ? classification.utilityScore.toFixed(1) : '--'}%
                  </span>
                </div>
                <div className="p-3.5 rounded-xl" style={{
                  backgroundColor: 'rgba(14, 13, 19, 0.6)',
                  backdropFilter: 'blur(10px)',
                  borderColor: 'rgba(255, 255, 255, 0.05)',
                  borderWidth: '1px',
                }}>
                  <span className="text-xs block mb-1.5 uppercase tracking-wide font-semibold" style={{ color: colors.textTertiary }}>Meme Score</span>
                  <span className="text-base font-bold" style={{ color: '#fbbf24' }}>
                    {classification.memeScore !== null && classification.memeScore !== undefined ? classification.memeScore.toFixed(1) : '--'}%
                  </span>
                </div>
                <div className="p-3.5 rounded-xl" style={{
                  backgroundColor: 'rgba(14, 13, 19, 0.6)',
                  backdropFilter: 'blur(10px)',
                  borderColor: 'rgba(255, 255, 255, 0.05)',
                  borderWidth: '1px',
                }}>
                  <span className="text-xs block mb-1.5 uppercase tracking-wide font-semibold" style={{ color: colors.textTertiary }}>Analyzed</span>
                  <span className="text-base font-bold">
                    {data.timestamp ? new Date(data.timestamp).toLocaleDateString() : new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Social Links */}
              {(tokenInfo.website || tokenInfo.twitter) && (
                <div className="flex gap-2 pt-4" style={{ borderTopColor: 'rgba(255, 255, 255, 0.05)', borderTopWidth: '1px' }}>
                  {tokenInfo.website && (
                    <a
                      href={tokenInfo.website}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-lg text-sm font-semibold transition hover:opacity-80 flex items-center gap-2"
                      style={{
                        backgroundColor: 'rgba(53, 218, 154, 0.1)',
                        borderColor: 'rgba(53, 218, 154, 0.3)',
                        borderWidth: '1px',
                        color: colors.primary,
                      }}
                    >
                      Website
                    </a>
                  )}
                  {tokenInfo.twitter && (
                    <a
                      href={tokenInfo.twitter}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-lg text-sm font-semibold transition hover:opacity-80 flex items-center gap-2"
                      style={{
                        backgroundColor: 'rgba(53, 218, 154, 0.1)',
                        borderColor: 'rgba(53, 218, 154, 0.3)',
                        borderWidth: '1px',
                        color: colors.primary,
                      }}
                    >
                      Twitter
                    </a>
                  )}
                </div>
              )}

              {/* Timestamp */}
              <div className="mt-4 text-xs font-mono" style={{ color: colors.textTertiary }}>
                {message.timestamp.toLocaleTimeString()}
              </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen flex flex-col text-white" style={{ backgroundColor: colors.background }}>
      <Navbar />

      <div className="flex-grow flex flex-col max-w-6xl w-full mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-light mb-2" style={{ color: colors.primary }}>
            API Playground
          </h1>
          <p className="text-sm" style={{ color: colors.textTertiary }}>
            Test the ChainProof Public API - Each request costs 0.1 USDC via x402 payment
          </p>
        </div>

        {/* Messages Container */}
        <div className="flex-grow overflow-y-auto mb-4 rounded-lg p-4" style={{ backgroundColor: colors.cardBg, minHeight: '400px' }}>
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <p className="text-lg mb-2" style={{ color: colors.textTertiary }}>
                  Enter a Solana token address to get started
                </p>
                <p className="text-sm" style={{ color: colors.textTertiary }}>
                  Example: So11111111111111111111111111111111111111112
                </p>
              </div>
            </div>
          ) : (
            <div>
              {messages.map((message) => renderMessage(message))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="rounded-lg p-4" style={{ backgroundColor: colors.cardBg, borderColor: colors.border, borderWidth: '1px' }}>
          {/* Wallet Status */}
          {connected ? (
            <div className="mb-3 flex items-center gap-2 text-sm" style={{ color: colors.primary }}>
              <FaWallet />
              <span>Wallet Connected: {publicKey?.toBase58().slice(0, 4)}...{publicKey?.toBase58().slice(-4)}</span>
            </div>
          ) : (
            <div className="mb-3 flex items-center gap-2 text-sm" style={{ color: '#ef4444' }}>
              <FaWallet />
              <span>Please connect your wallet to use the API Playground</span>
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              value={inputAddress}
              onChange={(e) => setInputAddress(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter token address (e.g., So11111111111111111111111111111111111111112)"
              disabled={loading || !connected}
              className="flex-1 px-4 py-3 rounded-lg bg-transparent text-white outline-none disabled:opacity-50"
              style={{ backgroundColor: colors.background, borderColor: colors.border, borderWidth: '1px' }}
            />
            <button
              onClick={handleAnalyze}
              disabled={loading || !inputAddress.trim() || !connected || isProcessing}
              className="px-6 py-3 rounded-lg font-bold transition hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
              style={{ backgroundColor: colors.primary, color: '#0e0d13' }}
            >
              {loading || isProcessing ? (
                <>
                  <FaSpinner className="animate-spin" />
                  {isProcessing ? 'Processing Payment' : 'Analyzing'}
                </>
              ) : (
                <>
                  <FaPaperPlane />
                  Analyze
                </>
              )}
            </button>
          </div>
          <p className="text-xs mt-2" style={{ color: colors.textTertiary }}>
            Cost: 0.1 USDC per request • Payment via x402 protocol • Requires wallet connection
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};
