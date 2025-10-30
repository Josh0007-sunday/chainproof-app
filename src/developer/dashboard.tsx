import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import authService, { type APIKey } from '../services/authService';
import { FiCopy, FiTrash2, FiPlus, FiRefreshCw } from 'react-icons/fi';
import Sidebar from './Sidebar';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [creatingKey, setCreatingKey] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  useEffect(() => {
    fetchAPIKeys();
  }, []);

  const fetchAPIKeys = async () => {
    try {
      setLoading(true);
      const response = await authService.getAPIKeys();
      console.log('Fetch API Keys Response:', response);

      if (response.success) {
        console.log('API Keys Data:', response.data);
        // Log the first key's structure to debug
        if (response.data && response.data.length > 0) {
          const firstKey = response.data[0] as any;
          console.log('First key structure:', {
            id: firstKey.id,
            _id: firstKey._id,
            hasId: 'id' in firstKey,
            has_id: '_id' in firstKey,
            allKeys: Object.keys(firstKey)
          });
        }
        setApiKeys(response.data);
        setError('');
      } else {
        console.error('Failed to fetch API keys:', response.error);
        setError(response.error || 'Failed to fetch API keys');
      }
    } catch (err) {
      console.error('Error fetching API keys:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAPIKeys();
  };

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      setError('Please enter a name for your API key');
      return;
    }

    setCreatingKey(true);
    setError('');

    try {
      const response = await authService.createAPIKey(newKeyName);
      console.log('Create API Key Response:', response);

      if (response.success && response.data) {
        setNewKeyValue(response.data.apiKey);
        setNewKeyName('');
        setSuccess('API key created successfully!');
        console.log('API key created, fetching updated list...');
        await fetchAPIKeys();
      } else {
        console.error('Failed to create API key:', response.error);
        setError(response.error || 'Failed to create API key');
        setShowNewKeyModal(false);
      }
    } catch (err) {
      console.error('Error creating API key:', err);
      setError('An unexpected error occurred');
    } finally {
      setCreatingKey(false);
    }
  };

  const handleDeleteKey = async (keyId: string, keyName: string) => {
    console.log('Delete key called with:', { keyId, keyName, type: typeof keyId });

    if (!keyId || keyId === 'undefined') {
      console.error('Invalid keyId:', keyId);
      setError('Invalid API key ID. Please refresh the page and try again.');
      return;
    }

    if (!confirm(`Are you sure you want to revoke "${keyName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await authService.deleteAPIKey(keyId);
      if (response.success) {
        setSuccess('API key revoked successfully');
        fetchAPIKeys();
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.error || 'Failed to revoke API key');
      }
    } catch (err) {
      console.error('Error deleting API key:', err);
      setError('An unexpected error occurred');
    }
  };

  const copyToClipboard = async (text: string, keyId?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      if (keyId) {
        setCopiedKeyId(keyId);
        setTimeout(() => setCopiedKeyId(null), 2000);
      }
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/developer/login');
  };

  const closeModal = () => {
    setShowNewKeyModal(false);
    setNewKeyValue('');
    setNewKeyName('');
    setError('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const activeKeys = apiKeys.filter(k => k.isActive).length;
  const totalRequests = apiKeys.reduce((sum, k) => sum + k.usageCount, 0);

  return (
    <div className="flex h-screen" style={{ backgroundColor: '#0e0d13' }}>
      <Sidebar onLogout={handleLogout} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden md:ml-64">
        {/* Header */}
        <header className="flex items-center justify-between h-16 md:h-20 px-4 md:px-8 border-b" style={{ borderColor: '#252538ff' }}>
          <div className="flex items-center gap-4">
            <h2 className="text-xl md:text-2xl font-bold text-white">Dashboard</h2>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
              title="Refresh"
            >
              <FiRefreshCw className={`text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <span className="text-xs md:text-sm" style={{ color: '#6b7280' }}>Welcome, {user?.username}</span>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8">
          {/* Alert Messages */}
          {error && (
            <div className="mb-6 border px-4 py-3 rounded-lg" style={{ backgroundColor: '#ff000020', borderColor: '#ff0000', color: '#ffcccc' }}>
              <div className="flex justify-between items-center">
                <span>{error}</span>
                <button onClick={() => setError('')} className="text-lg">&times;</button>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 border px-4 py-3 rounded-lg" style={{ backgroundColor: '#00ff0020', borderColor: '#00ff00', color: '#ccffcc' }}>
              <div className="flex justify-between items-center">
                <span>{success}</span>
                <button onClick={() => setSuccess('')} className="text-lg">&times;</button>
              </div>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-4 md:gap-8">
            {/* Left Column - Stats */}
            <div className="w-full lg:w-1/3">
              <div className="grid grid-cols-3 lg:grid-cols-1 gap-4 lg:space-y-2">
                <div className="rounded-xl p-4 md:p-6" style={{ backgroundColor: '#181824' }}>
                  <h3 className="text-xs md:text-sm font-medium mb-1 md:mb-2" style={{ color: '#6b7280' }}>Active API Keys</h3>
                  <p className="text-xl md:text-3xl font-bold text-white">{activeKeys}</p>
                  <p className="text-xs text-gray-500 mt-1">Total: {apiKeys.length}</p>
                </div>
                <div className="rounded-xl p-4 md:p-6" style={{ backgroundColor: '#181824' }}>
                  <h3 className="text-xs md:text-sm font-medium mb-1 md:mb-2" style={{ color: '#6b7280' }}>Total Requests</h3>
                  <p className="text-xl md:text-3xl font-bold text-white">{totalRequests.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">All time</p>
                </div>
                <div className="rounded-xl p-4 md:p-6" style={{ backgroundColor: '#181824' }}>
                  <h3 className="text-xs md:text-sm font-medium mb-1 md:mb-2" style={{ color: '#6b7280' }}>Rate Limit</h3>
                  <p className="text-xl md:text-3xl font-bold text-white">500/15min</p>
                  <p className="text-xs text-gray-500 mt-1">Per key</p>
                </div>
              </div>
            </div>

            {/* Right Column - API Keys */}
            <div className="w-full lg:w-2/3">
              <div className="rounded-2xl p-4 md:p-6" style={{ backgroundColor: '#181824' }}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div>
                    <h2 className="text-lg md:text-xl font-bold text-white">Your API Keys</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage your API keys and monitor usage</p>
                  </div>
                  <button
                    onClick={() => setShowNewKeyModal(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition hover:opacity-80"
                    style={{ borderColor: '#35da9a', borderWidth: '1px' }}
                  >
                    <FiPlus /> Create New Key
                  </button>
                </div>

                {loading ? (
                  <div className="text-center py-8" style={{ color: '#6b7280' }}>
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                    <p className="mt-2">Loading API keys...</p>
                  </div>
                ) : apiKeys.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4 text-gray-600">🔑</div>
                    <p className="mb-4 text-gray-400">No API keys yet. Create one to get started!</p>
                    <button
                      onClick={() => setShowNewKeyModal(true)}
                      className="px-6 py-2 rounded-lg font-semibold transition hover:opacity-80"
                      style={{ borderColor: '#35da9a', borderWidth: '1px' }}
                    >
                      Create Your First Key
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase text-gray-400" style={{ backgroundColor: '#0e0d13' }}>
                          <tr>
                            <th scope="col" className="px-6 py-3">Name</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Usage</th>
                            <th scope="col" className="px-6 py-3">Last Used</th>
                            <th scope="col" className="px-6 py-3">Created</th>
                            <th scope="col" className="px-6 py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {apiKeys.map((key) => (
                            <tr key={key.id} className="border-b hover:bg-opacity-50 transition" style={{ borderColor: '#252538ff', backgroundColor: '#181824' }}>
                              <td className="px-6 py-4 font-medium text-white">
                                <div className="flex items-center gap-2">
                                  <span>{key.name}</span>
                                  {!key.isActive && (
                                    <span className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-400">Revoked</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span style={{ color: key.isActive ? '#35da9a' : '#ff6b6b' }}>
                                  {key.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-gray-400">{key.usageCount.toLocaleString()} requests</td>
                              <td className="px-6 py-4 text-gray-400">
                                {key.lastUsed ? formatDateTime(key.lastUsed) : 'Never'}
                              </td>
                              <td className="px-6 py-4 text-gray-400">{formatDate(key.createdAt)}</td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => handleDeleteKey(key.id, key.name)}
                                    className="p-2 hover:opacity-80 transition rounded"
                                    style={{ color: '#ff6b6b' }}
                                    title="Revoke key"
                                  >
                                    <FiTrash2 />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-4">
                      {apiKeys.map((key) => (
                        <div key={key.id} className="rounded-lg p-4 border transition" style={{ backgroundColor: '#0e0d13', borderColor: '#252538ff' }}>
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-medium text-white text-sm">{key.name}</h3>
                              {!key.isActive && (
                                <span className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-400 mt-1 inline-block">Revoked</span>
                              )}
                            </div>
                            <button
                              onClick={() => handleDeleteKey(key.id, key.name)}
                              className="p-1.5 rounded"
                              style={{ color: '#ff6b6b' }}
                              title="Revoke key"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <p className="text-gray-500 mb-1">Status</p>
                              <span style={{ color: key.isActive ? '#35da9a' : '#ff6b6b' }}>
                                {key.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <div>
                              <p className="text-gray-500 mb-1">Usage</p>
                              <p className="text-gray-400">{key.usageCount} requests</p>
                            </div>
                            <div>
                              <p className="text-gray-500 mb-1">Last Used</p>
                              <p className="text-gray-400">{key.lastUsed ? formatDate(key.lastUsed) : 'Never'}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 mb-1">Created</p>
                              <p className="text-gray-400">{formatDate(key.createdAt)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Create New Key Modal */}
      {showNewKeyModal && !newKeyValue && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="rounded-2xl p-6 max-w-md w-full" style={{ backgroundColor: '#181824' }}>
            <h3 className="text-2xl font-bold text-white mb-2">Create New API Key</h3>
            <p className="text-gray-400 mb-6">Give your key a descriptive name</p>

            <div className="mb-6">
              <label htmlFor="keyName" className="block text-sm font-medium text-white mb-2">
                Key Name *
              </label>
              <input
                type="text"
                id="keyName"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateKey()}
                className="w-full px-4 py-3 rounded-lg text-white focus:outline-none focus:ring-2 transition"
                style={{ backgroundColor: '#0e0d13', borderColor: '#252538ff', borderWidth: '1px' }}
                placeholder="e.g., Production Server, Development"
                disabled={creatingKey}
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeModal}
                disabled={creatingKey}
                className="flex-1 px-4 py-3 rounded-lg transition-all disabled:opacity-50 text-white"
                style={{ backgroundColor: '#0e0d13' }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateKey}
                disabled={creatingKey || !newKeyName.trim()}
                className="flex-1 px-4 py-3 rounded-lg font-semibold transition hover:opacity-80 disabled:opacity-50 text-white"
                style={{ backgroundColor: '#35da9a' }}
              >
                {creatingKey ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </div>
                ) : (
                  'Create Key'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Show New Key Modal */}
      {newKeyValue && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="rounded-2xl p-6 max-w-lg w-full" style={{ backgroundColor: '#181824' }}>
            <h3 className="text-2xl font-bold text-white mb-2">API Key Created!</h3>
            <p className="text-gray-400 mb-6">Your new API key has been generated</p>

            <div className="border px-4 py-3 rounded-lg mb-4" style={{ backgroundColor: '#ffff0020', borderColor: '#ffff00', color: '#ffffcc' }}>
              <strong>Important:</strong> Copy this key now. You won't be able to see it again!
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-white mb-2">
                Your API Key
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newKeyValue}
                  readOnly
                  className="flex-1 px-4 py-3 rounded-lg text-white font-mono text-sm select-all"
                  style={{ backgroundColor: '#0e0d13', borderColor: '#252538ff', borderWidth: '1px' }}
                />
                <button
                  onClick={() => copyToClipboard(newKeyValue)}
                  className="px-4 py-3 rounded-lg transition-all flex items-center gap-2 text-white"
                  style={{ backgroundColor: '#35da9a' }}
                  title="Copy to clipboard"
                >
                  <FiCopy />
                  {copiedKeyId ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <button
              onClick={closeModal}
              className="w-full px-4 py-3 rounded-lg font-semibold transition hover:opacity-80 text-white"
              style={{ backgroundColor: '#0e0d13' }}
            >
              I've Saved My Key
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;