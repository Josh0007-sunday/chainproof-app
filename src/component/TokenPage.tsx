import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import TokenDetails from './TokenDetails';
import Navbar from './Navbar';

interface AnalysisResult {
  success: boolean;
  tokenAddress: string;
  classification?: {
    type: string;
    utilityScore: number;
    memeScore: number;
  };
  riskAssessment?: {
    riskLevel: string;
    riskScore: number;
    detailedScores: any;
  };
  tokenInfo?: {
    name: string;
    symbol: string;
    logoURI: string;
    isVerified: boolean;
  };
  jupiterData?: {
    id: string;
    name: string;
    symbol: string;
    icon: string;
    decimals: number;
    twitter?: string;
    website?: string;
    usdPrice?: number;
    holderCount?: number;
    mcap?: number;
  }
}

function TokenPage() {
  const { address } = useParams<{ address: string }>();
  const [token, setToken] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTokenData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/mu-checker/full-analysis`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tokenAddress: address }),
        });
        const data = await response.json();
        setToken(data);
      } catch (error) {
        console.error('Error fetching token data:', error);
      }
      setLoading(false);
    };

    if (address) {
      fetchTokenData();
    }
  }, [address]);

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: '#0e0d13' }}>
      <Navbar />
      {loading ? (
        <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-700 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin absolute top-0" style={{ borderTopColor: '#35da9a', borderRightColor: '#35da9a', borderBottomColor: '#35da9a' }}></div>
          </div>
        </div>
      ) : token ? (
        <TokenDetails token={token} />
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-lg">Token not found.</p>
        </div>
      )}
    </div>
  );
}

export default TokenPage;