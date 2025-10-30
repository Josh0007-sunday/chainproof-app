import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCopy, FiPlay } from 'react-icons/fi';
import { useAuth } from '../services/AuthContext';
import Sidebar from './Sidebar';

const API_BASE_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

interface Endpoint {
  method: string;
  path: string;
  description: string;
  tier: 'public' | 'premium';
  bodyType: 'single' | 'batch';
}

const ENDPOINTS: Endpoint[] = [
  { method: 'POST', path: '/api/mu-checker/analyze', description: 'Classify token as utility or meme', tier: 'public', bodyType: 'single' },
  { method: 'POST', path: '/api/mu-checker/risk-score', description: 'Get risk assessment for token', tier: 'public', bodyType: 'single' },
  { method: 'POST', path: '/api/mu-checker/full-analysis', description: 'Complete analysis with classification and risk', tier: 'public', bodyType: 'single' },
  { method: 'POST', path: '/api/v1/mu-checker/analyze', description: 'Classify token (Premium)', tier: 'premium', bodyType: 'single' },
  { method: 'POST', path: '/api/v1/mu-checker/risk-score', description: 'Risk assessment (Premium)', tier: 'premium', bodyType: 'single' },
  { method: 'POST', path: '/api/v1/mu-checker/full-analysis', description: 'Full analysis (Premium)', tier: 'premium', bodyType: 'single' },
  { method: 'POST', path: '/api/v1/mu-checker/batch-full-analysis', description: 'Batch full analysis (Premium)', tier: 'premium', bodyType: 'batch' },
];

const Test: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState('');
  const [selectedEndpoint, setSelectedEndpoint] = useState(ENDPOINTS[0]);
  const [tokenAddress, setTokenAddress] = useState('');
  const [tokenAddresses, setTokenAddresses] = useState('');
  const [curlCommand, setCurlCommand] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/developer/login');
  };

  useEffect(() => {
    generateCurlCommand();
  }, [selectedEndpoint, apiKey, tokenAddress, tokenAddresses]);

  const generateCurlCommand = () => {
    const headers = [
      '-H "Content-Type: application/json"',
    ];

    if (selectedEndpoint.tier === 'premium') {
      headers.push(`-H "x-api-key: ${apiKey || '<YOUR_API_KEY>'}"`);
    }

    let body = '';
    if (selectedEndpoint.bodyType === 'batch') {
      const addresses = tokenAddresses.split('\n').filter(a => a.trim()).map(a => `"${a.trim()}"`);
      body = `'{"tokenAddresses": [${addresses.join(', ')}]}'`;
    } else {
      body = `'{"tokenAddress": "${tokenAddress || '<TOKEN_ADDRESS>'}"}'`;
    }

    const command = `curl --request ${selectedEndpoint.method} \\
--url ${API_BASE_URL}${selectedEndpoint.path} \\
${headers.join(' \\\n')} \\
-d ${body}`;

    setCurlCommand(command);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExecute = async () => {
    setLoading(true);
    setResponse('');

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (selectedEndpoint.tier === 'premium' && apiKey) {
        headers['x-api-key'] = apiKey;
      }

      let body: any = {};
      if (selectedEndpoint.bodyType === 'batch') {
        const addresses = tokenAddresses.split('\n').filter(a => a.trim());
        body = { tokenAddresses: addresses };
      } else {
        body = { tokenAddress };
      }

      const res = await fetch(`${API_BASE_URL}${selectedEndpoint.path}`, {
        method: selectedEndpoint.method,
        headers,
        body: JSON.stringify(body),
      });

      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (error: any) {
      setResponse(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen" style={{ backgroundColor: '#0e0d13' }}>
      <Sidebar onLogout={handleLogout} />

      {/* Main Content - Add left margin to account for fixed sidebar on desktop */}
      <div className="flex-1 flex flex-col overflow-hidden md:ml-64">
        {/* Header */}
        <header className="flex items-center justify-between h-20 px-8 border-b" style={{ borderColor: '#252538ff' }}>
          <div>
            <h2 className="text-2xl font-bold text-white">API Playground</h2>
            <p className="text-xs mt-1" style={{ color: '#6b7280' }}>Test ChainProof API endpoints interactively</p>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-8">
          <div className="grid grid-cols-2 gap-6">
            {/* LEFT COLUMN - Endpoint Selection, Parameters, Quick Reference */}
            <div className="space-y-5">
              {/* Endpoint Selection */}
              <div>
                <h3 className="text-sm font-bold text-white mb-2">Select Endpoint</h3>
                <select
                  value={ENDPOINTS.indexOf(selectedEndpoint)}
                  onChange={(e) => setSelectedEndpoint(ENDPOINTS[parseInt(e.target.value)])}
                  className="w-full px-3 py-2 rounded-lg text-white text-sm focus:outline-none transition"
                  style={{ backgroundColor: '#181824', borderColor: '#252538ff', borderWidth: '1px' }}
                >
                  {ENDPOINTS.map((endpoint, idx) => (
                    <option key={idx} value={idx}>
                      {endpoint.method} {endpoint.path} - {endpoint.description}
                    </option>
                  ))}
                </select>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded" style={{
                    backgroundColor: selectedEndpoint.tier === 'premium' ? '#35da9a20' : '#ffffff20',
                    color: selectedEndpoint.tier === 'premium' ? '#35da9a' : '#6b7280'
                  }}>
                    {selectedEndpoint.tier}
                  </span>
                  <span className="text-xs" style={{ color: '#6b7280' }}>{selectedEndpoint.description}</span>
                </div>
              </div>

              {/* Parameters */}
              <div>
                <h3 className="text-sm font-bold text-white mb-2">Parameters</h3>

                {selectedEndpoint.tier === 'premium' && (
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-white mb-1.5">
                      API Key <span style={{ color: '#ff0000' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg text-white focus:outline-none transition font-mono text-sm"
                      style={{ backgroundColor: '#181824', borderColor: '#252538ff', borderWidth: '1px' }}
                      placeholder="cp_xxxxxxxxxxxxxxxx"
                    />
                    <p className="text-xs mt-1" style={{ color: '#6b7280' }}>
                      Get your API key from the dashboard
                    </p>
                  </div>
                )}

                {selectedEndpoint.bodyType === 'single' ? (
                  <div>
                    <label className="block text-xs font-medium text-white mb-1.5">
                      Token Address <span style={{ color: '#ff0000' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={tokenAddress}
                      onChange={(e) => setTokenAddress(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg text-white focus:outline-none transition font-mono text-sm"
                      style={{ backgroundColor: '#181824', borderColor: '#252538ff', borderWidth: '1px' }}
                      placeholder="So11111111111111111111111111111111111111112"
                    />
                    <p className="text-xs mt-1" style={{ color: '#6b7280' }}>
                      Solana token mint address
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-medium text-white mb-1.5">
                      Token Addresses (one per line) <span style={{ color: '#ff0000' }}>*</span>
                    </label>
                    <textarea
                      value={tokenAddresses}
                      onChange={(e) => setTokenAddresses(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg text-white focus:outline-none transition font-mono text-sm"
                      style={{ backgroundColor: '#181824', borderColor: '#252538ff', borderWidth: '1px' }}
                      placeholder="So11111111111111111111111111111111111111112
EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
                      rows={4}
                    />
                    <p className="text-xs mt-1" style={{ color: '#6b7280' }}>
                      Enter up to 100 token addresses (one per line)
                    </p>
                  </div>
                )}
              </div>

              {/* Quick Reference */}
              <div>
                <h3 className="text-sm font-bold text-white mb-2">Quick Reference</h3>
                <div className="space-y-2 text-xs">
                  <div>
                    <p className="font-semibold text-white">Rate Limits</p>
                    <p style={{ color: '#6b7280' }}>Public: 100 requests / 15 min</p>
                    <p style={{ color: '#6b7280' }}>Premium: 500 requests / 15 min</p>
                  </div>
                  <div>
                    <p className="font-semibold text-white">Response Format</p>
                    <p style={{ color: '#6b7280' }}>All responses are in JSON format</p>
                  </div>
                  <div>
                    <p className="font-semibold text-white">Authentication</p>
                    <p style={{ color: '#6b7280' }}>Premium endpoints require x-api-key header</p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN - cURL Command, Response */}
            <div className="space-y-5">
              {/* cURL Command */}
              <div className="rounded-lg overflow-hidden" style={{ backgroundColor: '#181824', borderColor: '#252538ff', borderWidth: '1px' }}>
                <div className="flex justify-between items-center px-4 py-2.5" style={{ backgroundColor: '#0e0d13', borderBottomColor: '#252538ff', borderBottomWidth: '1px' }}>
                  <h3 className="text-sm font-bold text-white">Request</h3>
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition"
                    style={{ backgroundColor: copied ? '#35da9a' : '#252538ff', color: '#fff' }}
                  >
                    <FiCopy size={12} />
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div className="p-4">
                  <div className="rounded overflow-hidden" style={{ backgroundColor: '#0e0d13' }}>
                    <pre className="text-[11px] text-white overflow-x-auto p-4 leading-tight font-mono">
                      {curlCommand}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Response */}
              <div className="rounded-lg overflow-hidden" style={{ backgroundColor: '#181824', borderColor: '#252538ff', borderWidth: '1px' }}>
                <div className="flex justify-between items-center px-4 py-2.5" style={{ backgroundColor: '#0e0d13', borderBottomColor: '#252538ff', borderBottomWidth: '1px' }}>
                  <h3 className="text-sm font-bold text-white">Response</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: '#252538ff', color: '#6b7280' }}>
                      {loading ? 'Loading...' : response ? '200' : 'Ready'}
                    </span>
                    <button
                      onClick={handleExecute}
                      disabled={loading || (selectedEndpoint.bodyType === 'single' && !tokenAddress) || (selectedEndpoint.bodyType === 'batch' && !tokenAddresses) || (selectedEndpoint.tier === 'premium' && !apiKey)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        backgroundColor: loading ? '#252538ff' : '#35da9a',
                        color: '#fff'
                      }}
                    >
                      <FiPlay size={12} />
                      {loading ? 'Running...' : 'Execute'}
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  {response ? (
                    <div className="rounded overflow-hidden" style={{ backgroundColor: '#0e0d13' }}>
                      <pre className="text-[11px] text-white overflow-x-auto p-4 max-h-[400px] overflow-y-auto leading-tight font-mono">
                        {response}
                      </pre>
                    </div>
                  ) : (
                    <div className="p-8 text-center rounded" style={{ backgroundColor: '#0e0d13' }}>
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3" style={{ backgroundColor: '#252538ff' }}>
                        <FiPlay size={20} style={{ color: '#35da9a' }} />
                      </div>
                      <p className="text-sm text-white font-medium">Ready to execute</p>
                      <p className="text-xs mt-1" style={{ color: '#6b7280' }}>
                        Fill in parameters and click Execute
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Test;