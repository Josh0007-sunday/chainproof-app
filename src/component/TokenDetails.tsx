import { FaCheckCircle, FaTwitter, FaGlobe, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';
import Footer from './Footer';

interface TokenDetailsProps {
  token: {
    tokenInfo?: {
      name: string;
      logoURI: string;
      isVerified: boolean;
    };
    riskAssessment?: {
      riskLevel: string;
      riskScore: number;
      detailedScores?: Record<string, { score: number }>;
    };
    classification?: {
        type: string;
        utilityScore: number;
        memeScore: number;
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
      liquidity?: number;
      mcap?: number;
    };
  };
}

function TokenDetails({ token }: TokenDetailsProps) {
  const navigate = useNavigate();
  const [priceData, setPriceData] = useState<any[]>([]);

  const riskLevel = token.riskAssessment?.riskLevel?.toUpperCase();
  const riskColor = riskLevel === 'GOOD' || riskLevel === 'SAFE'
    ? 'text-green-400'
    : riskLevel === 'AVERAGE'
    ? 'text-yellow-400'
    : riskLevel === 'BAD' || riskLevel === 'DANGER'
    ? 'text-red-400'
    : 'text-gray-400';

  // Generate mock price data based on current price
  useEffect(() => {
    const currentPrice = token.jupiterData?.usdPrice || 0;
    const generatePriceData = () => {
      const data = [];
      const now = Date.now();
      const hoursToShow = 24;

      for (let i = hoursToShow; i >= 0; i--) {
        const time = new Date(now - i * 60 * 60 * 1000);
        const variance = (Math.random() - 0.5) * 0.1;
        const price = currentPrice * (1 + variance);

        data.push({
          time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          price: parseFloat(price.toFixed(8)),
        });
      }
      return data;
    };

    setPriceData(generatePriceData());

    const interval = setInterval(() => {
      setPriceData(prev => {
        const newData = [...prev.slice(1)];
        const lastPrice = newData[newData.length - 1]?.price || currentPrice;
        const variance = (Math.random() - 0.5) * 0.02;
        const newPrice = lastPrice * (1 + variance);

        newData.push({
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          price: parseFloat(newPrice.toFixed(8)),
        });

        return newData;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [token.jupiterData?.usdPrice]);

  return (
    <div className="text-white" style={{ backgroundColor: '#0e0d13' }}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-3 sm:py-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-3 sm:mb-4 text-sm sm:text-base text-gray-400 hover:text-white transition">
          <FaArrowLeft className="text-sm" />
          <span className="text-sm sm:text-base">Back</span>
        </button>

        {/* Header Section */}
        <div className="flex items-center mb-4 sm:mb-6">
          <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center overflow-hidden mr-3 sm:mr-4 flex-shrink-0">
            {token.tokenInfo?.logoURI ? (
              <img
                src={token.tokenInfo.logoURI}
                alt={token.tokenInfo.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs sm:text-sm text-gray-400">Logo</span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">{token.tokenInfo?.name || 'Token Name'}</h1>
              {token.tokenInfo?.isVerified && (
                <FaCheckCircle className="ml-2 text-base sm:text-lg lg:text-xl flex-shrink-0" style={{ color: '#35da9a' }} />
              )}
            </div>
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 mt-2 text-xs sm:text-sm flex-wrap" style={{ color: '#6b7280' }}>
              <span>socials:</span>
              {token.jupiterData?.website && (
                <a
                  href={token.jupiterData.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center hover:text-white transition"
                >
                  <FaGlobe className="mr-1 text-xs sm:text-sm" /> <span>Website</span>
                </a>
              )}
              {token.jupiterData?.twitter && (
                <a
                  href={token.jupiterData.twitter}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center hover:text-white transition"
                >
                  <FaTwitter className="mr-1 text-xs sm:text-sm" /> <span>Twitter</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Live Price Chart */}
        <div className="rounded-lg p-4 sm:p-6 mb-4" style={{ backgroundColor: '#181824', borderColor: '#252538ff', borderWidth: '1px' }}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold">Live Price Chart (24H)</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs text-gray-400">Live</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={priceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#252538" />
              <XAxis
                dataKey="time"
                stroke="#6b7280"
                tick={{ fill: '#6b7280', fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="#6b7280"
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickFormatter={(value) => `$${value.toFixed(6)}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0e0d13',
                  border: '1px solid #252538',
                  borderRadius: '8px',
                  color: '#ffffff'
                }}
                formatter={(value: any) => [`$${value.toFixed(8)}`, 'Price']}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#35da9a"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, fill: '#35da9a' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Full Width Token Details Card */}
        <div className="rounded-lg p-4 sm:p-6" style={{ backgroundColor: '#181824', borderColor: '#252538ff', borderWidth: '1px' }}>
          {/* Risk Score Section */}
          <div className="pb-6" style={{ borderBottomColor: '#252538ff', borderBottomWidth: '1px' }}>
            <h3 className="text-base font-bold mb-4">Risk Score</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <p className={`text-5xl font-bold ${riskColor}`}>
                  {token.riskAssessment?.riskLevel || 'N/A'}
                </p>
                <p className="text-sm mt-2" style={{ color: '#6b7280' }}>
                  Score: {token.riskAssessment?.riskScore ?? '--'}/100
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p style={{ color: '#6b7280' }} className="text-sm mb-1">Price</p>
                  <p className="font-bold text-lg">
                    {token.jupiterData?.usdPrice
                      ? `$${token.jupiterData.usdPrice.toFixed(6)}`
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p style={{ color: '#6b7280' }} className="text-sm mb-1">Holders</p>
                  <p className="font-bold text-lg">
                    {token.jupiterData?.holderCount
                      ? token.jupiterData.holderCount.toLocaleString()
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p style={{ color: '#6b7280' }} className="text-sm mb-1">Liquidity</p>
                  <p className="font-bold text-lg">
                    {token.jupiterData?.liquidity
                      ? `$${token.jupiterData.liquidity.toLocaleString()}`
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p style={{ color: '#6b7280' }} className="text-sm mb-1">Market Cap</p>
                  <p className="font-bold text-lg">
                    {token.jupiterData?.mcap
                      ? `$${token.jupiterData.mcap.toLocaleString()}`
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Classification Section */}
          <div className="py-6" style={{ borderBottomColor: '#252538ff', borderBottomWidth: '1px' }}>
            <h3 className="text-base font-bold mb-4">Classification</h3>
            <div className="flex flex-wrap items-center gap-8">
              <div>
                <p className="text-3xl font-bold">{token.classification?.type || 'N/A'}</p>
              </div>
              <div className="flex gap-6 text-base">
                <div>
                  <span style={{ color: '#6b7280' }}>Utility: </span>
                  <span className="font-bold text-lg">{token.classification?.utilityScore}%</span>
                </div>
                <div>
                  <span style={{ color: '#6b7280' }}>Meme: </span>
                  <span className="font-bold text-lg">{token.classification?.memeScore}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Score Breakdown Section */}
          <div className="pt-6">
            <h3 className="text-base font-bold mb-4">Score Breakdown</h3>
            {token.riskAssessment?.detailedScores ? (
              <div className="space-y-3">
                {Object.entries(token.riskAssessment.detailedScores).map(
                  ([key, value]: [string, any]) => (
                    <div key={key}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="capitalize text-sm font-medium text-white">{key}</span>
                        <span className="text-sm font-bold" style={{ color: '#35da9a' }}>{value.score}/100</span>
                      </div>
                      <div className="w-full h-2 rounded-full" style={{ backgroundColor: '#252538' }}>
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{
                            backgroundColor: '#35da9a',
                            width: `${value.score}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  )
                )}
              </div>
            ) : (
              <p className="text-sm" style={{ color: '#6b7280' }}>No detailed scores available.</p>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default TokenDetails;
