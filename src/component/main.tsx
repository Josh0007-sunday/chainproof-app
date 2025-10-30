import { useState, useEffect, useRef } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import tokens from './tokens/token.json';
import { useNavigate } from 'react-router-dom';
import { getProgram, getReadOnlyProgram } from '../chainproofconnect/useProgram';
import { FaSearch } from 'react-icons/fa';

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
  };
  tokenInfo?: {
    name: string;
    symbol: string;
    logoURI: string;
    isVerified: boolean;
  };
  jupiterData?: {
    usdPrice?: number;
    holderCount?: number;
    liquidity?: number;
    mcap?: number;
  };
}

interface Token {
  name: string;
  symbol: string;
  address: string;
  icon?: string;
}

function Main() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const [verifiedTokens, setVerifiedTokens] = useState<any[]>([]);
  const [verifiedLoading, setVerifiedLoading] = useState(true);
  const searchRef = useRef<HTMLDivElement>(null);

  // Duplicate tokens for infinite scroll effect
  const infiniteTokens = [...verifiedTokens, ...verifiedTokens, ...verifiedTokens];

  useEffect(() => {
    const fetchVerifiedTokens = async () => {
      setVerifiedLoading(true);
      try {
        let program = getProgram();
        if (!program) {
          program = getReadOnlyProgram();
        }

        if (!program) {
          setVerifiedLoading(false);
          return;
        }

        const verifiedTokensData = await (program.account as any).tokenEntry.all();

        const tokensWithIpfsData = await Promise.all(
          verifiedTokensData.map(async (token: any) => {
            try {
              let fetchUrl = token.account.ipfsHash;
              if (fetchUrl && !fetchUrl.startsWith('http')) {
                fetchUrl = `https://maroon-solid-leech-193.mypinata.cloud/ipfs/${fetchUrl.replace(/^ipfs:\/\//, '')}`;
              }

              if (!fetchUrl) {
                return { ...token, ipfsData: null };
              }

              const response = await fetch(fetchUrl);
              const ipfsData = await response.json();
              return { ...token, ipfsData };
            } catch (e) {
              return { ...token, ipfsData: null };
            }
          })
        );

        setVerifiedTokens(tokensWithIpfsData);
      } catch (error) {
        setVerifiedTokens([]);
      } finally {
        setVerifiedLoading(false);
      }
    };

    fetchVerifiedTokens();
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSelect = (address: string) => {
    setShowDropdown(false);
    setSearchTerm('');
    navigate(`/token/${address}`);
  };

  // Filter tokens from token.json based on search term
  const filteredSearchResults = tokens.filter(token =>
    searchTerm.length > 0 && (
      token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      token.address.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleVerifiedTokenClick = (token: any) => {
    const serializableToken = {
      ...token,
      account: {
        ...token.account,
        mint: token.account.mint.toString(),
        authority: token.account.authority.toString(),
        timestamp: token.account.timestamp.toString(),
      },
      publicKey: token.publicKey.toString(),
    };
    navigate(`/verified-token/${serializableToken.account.mint}`, { state: { token: serializableToken } });
  };

  return (
    <div className="min-h-screen text-white flex flex-col" style={{ backgroundColor: '#0e0d13' }}>
      <Navbar />

      <style>{`
        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
        .animate-scroll {
          animation: scroll-left 30s linear infinite;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <div className="flex-grow w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="flex flex-col items-center pt-20 space-y-6">

          {/* Logo and BETA */}
          <div className="flex flex-col items-center mb-2">
            <h1 className="text-5xl sm:text-6xl font-light tracking-wide mb-2" style={{ color: '#35da9a', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
              ChainProof
            </h1>
            <span className="text-xs font-light tracking-widest" style={{ color: '#6b7280' }}>
              BETA
            </span>
          </div>

          {/* Verified Tokens Label */}
          <div className="w-full max-w-2xl">
            <p className="text-xs mb-2 text-left" style={{ color: '#9ca3af' }}>
              Verified Token:
            </p>
          </div>

          {/* Infinite Scrolling Tokens Carousel */}
          <div className="w-full max-w-2xl overflow-hidden">
            {verifiedLoading ? (
              <div className="flex gap-2 overflow-hidden">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-full animate-pulse flex-shrink-0" style={{ backgroundColor: '#181824' }}>
                    <div className="w-4 h-4 rounded-full bg-gray-700"></div>
                    <div className="h-2 bg-gray-700 rounded w-8"></div>
                  </div>
                ))}
              </div>
            ) : verifiedTokens.length === 0 ? (
              <div className="text-left text-gray-400 py-2">
                <p className="text-xs">No verified tokens yet</p>
              </div>
            ) : (
              <div className="relative">
                <div className="flex gap-2 animate-scroll">
                  {infiniteTokens.map((token, index) => (
                    <div
                      key={`${token.publicKey.toString()}-${index}`}
                      onClick={() => handleVerifiedTokenClick(token)}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-full cursor-pointer transition hover:opacity-80 flex-shrink-0"
                      style={{ backgroundColor: '#181824', borderColor: '#252538', borderWidth: '1px' }}
                    >
                      {token.ipfsData?.tokenInfo?.icon ? (
                        <img
                          src={token.ipfsData.tokenInfo.icon}
                          alt={token.account.name}
                          className="w-4 h-4 rounded-full"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/16?text=T';
                          }}
                        />
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-[8px]">
                            {token.account.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <span className="text-xs text-white whitespace-nowrap">
                        {token.account.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Search Section */}
          <div className="w-full max-w-2xl">
            {/* Search Bar with Dropdown */}
            <div className="relative" ref={searchRef}>
              <div
                className="p-3 rounded-lg flex items-center gap-3 cursor-text"
                style={{ backgroundColor: '#181824', borderColor: '#252538', borderWidth: '1px' }}
                onClick={() => {
                  const input = document.getElementById('search-input') as HTMLInputElement;
                  if (input) {
                    input.focus();
                    setShowDropdown(true);
                  }
                }}
              >
                <FaSearch className="text-gray-400 text-base flex-shrink-0" />
                <input
                  id="search-input"
                  type="text"
                  placeholder="Search by name, symbol, or enter token address..."
                  className="w-full bg-transparent p-2 text-sm text-white outline-none"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                  }}
                  onFocus={() => setShowDropdown(true)}
                />
              </div>

              {/* Dropdown Results */}
              {showDropdown && (
                <div
                  className="absolute w-full mt-2 rounded-lg overflow-hidden z-10 shadow-lg"
                  style={{ backgroundColor: '#181824', borderColor: '#252538', borderWidth: '1px' }}
                >
                  <div className="max-h-80 overflow-y-auto">
                    {filteredSearchResults.length > 0 ? (
                      filteredSearchResults.map((token: Token) => (
                        <div
                          key={token.address}
                          onClick={() => handleSearchSelect(token.address)}
                          className="p-3 cursor-pointer transition hover:bg-opacity-80 border-b"
                          style={{ backgroundColor: '#181824', borderColor: '#252538' }}
                        >
                          <div className="flex items-center gap-3">
                            {token.icon ? (
                              <img
                                src={token.icon}
                                alt={token.symbol}
                                className="w-8 h-8 rounded-full flex-shrink-0"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/32?text=' + token.symbol.charAt(0);
                                }}
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-bold text-sm">
                                  {token.symbol.charAt(0)}
                                </span>
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="text-white font-medium text-sm">{token.name}</div>
                              <div className="text-gray-400 text-xs">{token.symbol}</div>
                            </div>
                            <div className="text-gray-500 text-xs font-mono">
                              {token.address.slice(0, 4)}...{token.address.slice(-4)}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : searchTerm.length > 30 ? (
                      <div
                        onClick={() => handleSearchSelect(searchTerm)}
                        className="p-3 cursor-pointer hover:opacity-80"
                      >
                        <div className="text-white text-sm">
                          Search for address: {searchTerm.slice(0, 15)}...
                        </div>
                      </div>
                    ) : searchTerm.length > 0 ? (
                      <div className="p-3 text-gray-400 text-xs">
                        No tokens found
                      </div>
                    ) : (
                      <div className="p-3 text-gray-400 text-xs">
                        Start typing to search for tokens...
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Information Cards */}
          <div className="w-full max-w-2xl mt-8 grid grid-cols-2 gap-4">
            {/* Learn Demo Card */}
            <div
              className="p-5 rounded-lg transition hover:opacity-90 cursor-pointer"
              style={{ backgroundColor: '#181824', borderColor: '#252538', borderWidth: '1px' }}
              onClick={() => window.open('https://docs.chainproof.io', '_blank')}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: '#35da9a20' }}>
                  <svg className="w-7 h-7" style={{ color: '#35da9a' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-white font-semibold text-base mb-2">Learn & Demo</h3>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Explore our documentation and try the demo to understand how ChainProof works.
                </p>
              </div>
            </div>

            {/* Encryption Project Card */}
            <div
              className="p-5 rounded-lg transition hover:opacity-90 cursor-pointer"
              style={{ backgroundColor: '#181824', borderColor: '#252538', borderWidth: '1px' }}
              onClick={() => window.open('https://github.com/chainproof', '_blank')}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: '#35da9a20' }}>
                  <svg className="w-7 h-7" style={{ color: '#35da9a' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-white font-semibold text-base mb-2">Encryption & Security</h3>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Learn about our encryption and security features powered by IPFS.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Main;