import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { FaTwitter, FaGlobe, FaArrowLeft, FaCheckCircle, FaCopy, FaChevronDown, FaChevronUp } from 'react-icons/fa';

export const VerifiedTokenDetails: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = location.state || {};
  const [showMetadata, setShowMetadata] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (!token) {
    return (
      <div className="min-h-screen text-white" style={{ backgroundColor: '#0e0d13' }}>
        <Navbar />
        <div className="p-8 max-w-7xl mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-4 text-gray-400 hover:text-white transition">
            <FaArrowLeft />
            Back
          </button>
          <h2 className="text-2xl font-bold">Token not found</h2>
        </div>
      </div>
    );
  }

  const { account, ipfsData } = token;

  const riskLevel = ipfsData?.riskAssessment?.riskLevel?.toUpperCase();
  const riskColor = riskLevel === 'GOOD' || riskLevel === 'SAFE'
    ? 'text-green-400'
    : riskLevel === 'AVERAGE'
    ? 'text-yellow-400'
    : riskLevel === 'BAD' || riskLevel === 'DANGER'
    ? 'text-red-400'
    : 'text-gray-400';

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: '#0e0d13' }}>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-4 text-gray-400 hover:text-white transition">
          <FaArrowLeft />
          Back
        </button>

        {/* Header Section */}
        <div className="flex items-center mb-6">
          <div className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden mr-4">
            {ipfsData?.tokenInfo?.icon ? (
              <img
                src={ipfsData.tokenInfo.icon}
                alt={account.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-sm text-gray-400">No Icon</span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">{ipfsData?.tokenInfo?.name || account.name}</h1>
              <FaCheckCircle className="text-xl" style={{ color: '#35da9a' }} />
              <span className="text-sm px-2 py-1 rounded" style={{ backgroundColor: '#181824', color: '#35da9a' }}>Verified</span>
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm" style={{ color: '#6b7280' }}>
              <span>socials:</span>
              {ipfsData?.tokenInfo?.website && (
                <a href={ipfsData.tokenInfo.website} target="_blank" rel="noreferrer" className="flex items-center hover:text-white transition">
                  <FaGlobe className="mr-1" /> Website
                </a>
              )}
              {ipfsData?.tokenInfo?.twitter && (
                <a href={ipfsData.tokenInfo.twitter} target="_blank" rel="noreferrer" className="flex items-center hover:text-white transition">
                  <FaTwitter className="mr-1" /> Twitter
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Explorer Cards */}
        <div className="space-y-4">
          {/* Overview Card */}
          <div className="rounded-lg p-4" style={{ backgroundColor: '#181824', borderColor: '#252538ff', borderWidth: '1px' }}>
            <h3 className="text-lg font-bold mb-3">Overview</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2" style={{ borderBottomColor: '#252538ff', borderBottomWidth: '1px' }}>
                <span className="text-sm" style={{ color: '#6b7280' }}>Risk Assessment</span>
                <div className="flex items-baseline gap-2">
                  <span className={`text-xl font-bold ${riskColor}`}>{riskLevel || 'N/A'}</span>
                  <span className="text-xs" style={{ color: '#6b7280' }}>
                    ({ipfsData?.riskAssessment?.riskScore ?? '--'}/100)
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center pb-2" style={{ borderBottomColor: '#252538ff', borderBottomWidth: '1px' }}>
                <span className="text-sm" style={{ color: '#6b7280' }}>Classification</span>
                <span className="text-sm font-medium">{ipfsData?.classification?.type || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center pb-2" style={{ borderBottomColor: '#252538ff', borderBottomWidth: '1px' }}>
                <span className="text-sm" style={{ color: '#6b7280' }}>Utility Score</span>
                <span className="text-sm font-medium">{ipfsData?.classification?.utilityScore ?? '--'}%</span>
              </div>
              <div className="flex justify-between items-center pb-2" style={{ borderBottomColor: '#252538ff', borderBottomWidth: '1px' }}>
                <span className="text-sm" style={{ color: '#6b7280' }}>Meme Score</span>
                <span className="text-sm font-medium">{ipfsData?.classification?.memeScore ?? '--'}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: '#6b7280' }}>Registered On</span>
                <span className="text-sm font-medium">{new Date(parseInt(account.timestamp) * 1000).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Token Information Card */}
          <div className="rounded-lg p-4" style={{ backgroundColor: '#181824', borderColor: '#252538ff', borderWidth: '1px' }}>
            <h3 className="text-lg font-bold mb-3">Token Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2" style={{ borderBottomColor: '#252538ff', borderBottomWidth: '1px' }}>
                <span className="text-sm" style={{ color: '#6b7280' }}>Name</span>
                <span className="text-sm font-medium">{account.name}</span>
              </div>
              <div className="flex justify-between items-center pb-2" style={{ borderBottomColor: '#252538ff', borderBottomWidth: '1px' }}>
                <span className="text-sm" style={{ color: '#6b7280' }}>Symbol</span>
                <span className="text-sm font-medium">{account.symbol}</span>
              </div>
              <div className="flex justify-between items-center pb-2" style={{ borderBottomColor: '#252538ff', borderBottomWidth: '1px' }}>
                <span className="text-sm" style={{ color: '#6b7280' }}>Mint Address</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono">{account.mint.slice(0, 8)}...{account.mint.slice(-8)}</span>
                  <button onClick={() => copyToClipboard(account.mint)} className="text-gray-400 hover:text-white">
                    <FaCopy className="text-xs" />
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center pb-2" style={{ borderBottomColor: '#252538ff', borderBottomWidth: '1px' }}>
                <span className="text-sm" style={{ color: '#6b7280' }}>Update Authority</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono">{account.authority.slice(0, 8)}...{account.authority.slice(-8)}</span>
                  <button onClick={() => copyToClipboard(account.authority)} className="text-gray-400 hover:text-white">
                    <FaCopy className="text-xs" />
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: '#6b7280' }}>IPFS Hash</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono">{account.ipfsHash.slice(0, 12)}...{account.ipfsHash.slice(-12)}</span>
                  <button onClick={() => copyToClipboard(account.ipfsHash)} className="text-gray-400 hover:text-white">
                    <FaCopy className="text-xs" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Metadata Card */}
          {ipfsData && (
            <div className="rounded-lg p-4" style={{ backgroundColor: '#181824', borderColor: '#252538ff', borderWidth: '1px' }}>
              <button
                onClick={() => setShowMetadata(!showMetadata)}
                className="w-full flex items-center justify-between text-lg font-bold mb-3 hover:opacity-80 transition"
              >
                <span>IPFS Metadata</span>
                {showMetadata ? <FaChevronUp className="text-sm" /> : <FaChevronDown className="text-sm" />}
              </button>
              {showMetadata && (
                <div className="rounded p-4 overflow-x-auto" style={{ backgroundColor: '#0e0d13' }}>
                  <pre className="text-xs" style={{ color: '#6b7280' }}>
                    {JSON.stringify(ipfsData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};