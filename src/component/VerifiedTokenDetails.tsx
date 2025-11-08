import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { FaTwitter, FaGlobe, FaArrowLeft, FaCheckCircle, FaCopy, FaChevronDown, FaChevronUp, FaHeart, FaClock } from 'react-icons/fa';
import { useStaking } from '../chainproofconnect/useStaking';
import { useUserProfile } from '../chainproofconnect/useUserProfile';
import { useWallet } from '@solana/wallet-adapter-react';
import { useTheme } from '../context/ThemeContext';

export const VerifiedTokenDetails: React.FC = () => {
  const { publicKey, connected } = useWallet();
  const location = useLocation();
  const navigate = useNavigate();
  const { colors } = useTheme();
  const { token } = location.state || {};
  const [showMetadata, setShowMetadata] = useState(false);
  const [showStakeInput, setShowStakeInput] = useState(false);
  const [stakeAmount, setStakeAmount] = useState('10');
  const [loading, setLoading] = useState(false);
  const [projectStakes, setProjectStakes] = useState<any>(null);
  const [userStake, setUserStake] = useState<any>(null);
  const [hasProfile, setHasProfile] = useState(false);

  const { stakeOnProject, requestUnstake, completeUnstake, getProjectStakes, getUserStake, initializeProjectStakes } = useStaking();
  const { getUserProfile } = useUserProfile();

  useEffect(() => {
    const loadStakingData = async () => {
      if (!token || !publicKey || !connected) return;

      try {
        const profile = await getUserProfile(publicKey);
        const hasUserProfile = profile !== null;
        setHasProfile(hasUserProfile);
        console.log('✅ Profile check:', { hasProfile: hasUserProfile, profile });

        const stakes = await getProjectStakes(token.account.mint);
        console.log('📊 Project stakes loaded:', stakes);
        setProjectStakes(stakes);

        if (hasUserProfile) {
          const userStakeData = await getUserStake(publicKey, token.account.mint);
          setUserStake(userStakeData);
        }
      } catch (error) {
        console.error('Error loading staking data:', error);
      }
    };

    loadStakingData();
  }, [token, publicKey, connected]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleStake = async () => {
    if (!hasProfile) {
      alert('Please create a profile first. Visit the Protocol Dashboard to create your profile.');
      navigate('/protocol-dashboard');
      return;
    }

    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      alert('Please enter a valid stake amount');
      return;
    }

    setLoading(true);
    try {
      const amount = parseFloat(stakeAmount) * 1_000_000_000;
      await stakeOnProject(token.account.mint, amount);
      alert('Successfully liked this project!');

      const stakes = await getProjectStakes(token.account.mint);
      setProjectStakes(stakes);
      if (publicKey) {
        const userStakeData = await getUserStake(publicKey, token.account.mint);
        setUserStake(userStakeData);
      }
      setStakeAmount('10');
      setShowStakeInput(false);
    } catch (error: any) {
      console.error('Error staking:', error);
      alert('Failed to stake: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleRequestUnstake = async () => {
    setLoading(true);
    try {
      await requestUnstake(token.account.mint);
      alert('Unstake requested. You can complete the unstake after 48 hours.');

      if (publicKey) {
        const userStakeData = await getUserStake(publicKey, token.account.mint);
        setUserStake(userStakeData);
      }
    } catch (error: any) {
      console.error('Error requesting unstake:', error);
      alert('Failed to request unstake: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteUnstake = async () => {
    setLoading(true);
    try {
      await completeUnstake(token.account.mint);
      alert('Successfully unstaked!');

      const stakes = await getProjectStakes(token.account.mint);
      setProjectStakes(stakes);
      if (publicKey) {
        const userStakeData = await getUserStake(publicKey, token.account.mint);
        setUserStake(userStakeData);
      }
    } catch (error: any) {
      console.error('Error completing unstake:', error);
      alert('Failed to complete unstake: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleInitializeStakes = async () => {
    setLoading(true);
    try {
      await initializeProjectStakes(token.account.mint);
      alert('Project stakes initialized!');

      const stakes = await getProjectStakes(token.account.mint);
      setProjectStakes(stakes);
    } catch (error: any) {
      console.error('Error initializing stakes:', error);
      alert('Failed to initialize stakes: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: colors.background, color: colors.text }}>
        <Navbar />
        <div className="p-8 max-w-7xl mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-4 transition hover:opacity-70" style={{ color: colors.textSecondary }}>
            <FaArrowLeft />
            Back
          </button>
          <h2 className="text-2xl font-bold" style={{ color: colors.text }}>Token not found</h2>
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
    : 'transition';

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background, color: colors.text }}>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-4 transition hover:opacity-70" style={{ color: colors.textSecondary }}>
          <FaArrowLeft />
          Back
        </button>

        {/* Header Section */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden mr-4">
              {ipfsData?.tokenInfo?.icon ? (
                <img
                  src={ipfsData.tokenInfo.icon}
                  alt={account.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sm transition">No Icon</span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold">{ipfsData?.tokenInfo?.name || account.name}</h1>
                <FaCheckCircle className="text-xl" style={{ color: colors.primary }} />
                <span className="text-sm px-2 py-1 rounded" style={{ backgroundColor: colors.cardBg, color: colors.primary }}>Verified</span>
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm" style={{ color: colors.textTertiary }}>
                <span>socials:</span>
                {ipfsData?.tokenInfo?.website && (
                  <a href={ipfsData.tokenInfo.website} target="_blank" rel="noreferrer" className="flex items-center hover:opacity-70 transition" style={{ color: colors.textSecondary }}>
                    <FaGlobe className="mr-1" /> Website
                  </a>
                )}
                {ipfsData?.tokenInfo?.twitter && (
                  <a href={ipfsData.tokenInfo.twitter} target="_blank" rel="noreferrer" className="flex items-center hover:opacity-70 transition" style={{ color: colors.textSecondary }}>
                    <FaTwitter className="mr-1" /> Twitter
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Like Button */}
          {connected && publicKey && projectStakes && (!userStake || userStake.amount === 0) && (
            <button
              onClick={() => setShowStakeInput(!showStakeInput)}
              disabled={!hasProfile}
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: colors.primary, color: '#0e0d13' }}
              title={!hasProfile ? 'Create a profile first' : 'Like this project by staking tokens'}
            >
              <FaHeart className="text-xl" />
              Like This Project
            </button>
          )}

          {/* Already Liked Badge */}
          {connected && publicKey && userStake && userStake.amount > 0 && (
            <div className="flex items-center gap-2 px-6 py-3 rounded-lg font-bold" style={{ backgroundColor: `${colors.primary}20`, borderColor: colors.primary, borderWidth: '2px', color: colors.primary }}>
              <FaHeart className="text-xl" />
              You Liked This Project
            </div>
          )}
        </div>

        {/* Stake Input Modal */}
        {showStakeInput && connected && publicKey && (
          <div className="mb-6 rounded-lg p-4" style={{ backgroundColor: colors.cardBg, borderColor: colors.primary, borderWidth: '2px' }}>
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              <FaHeart style={{ color: colors.primary }} />
              Like {ipfsData?.tokenInfo?.name || account.name}
            </h3>
            {!hasProfile ? (
              <div className="p-3 rounded-lg text-sm mb-3" style={{ backgroundColor: '#ffa50020', borderColor: '#ffa500', borderWidth: '1px', color: '#ffa500' }}>
                Create a profile first to stake on projects.
                <button onClick={() => navigate('/protocol-dashboard')} className="underline ml-2 font-bold">
                  Go to Protocol Dashboard
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                    How many tokens do you want to stake?
                  </label>
                  <input
                    type="number"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    placeholder="Enter amount (e.g. 10)"
                    min="0.1"
                    step="1"
                    className="w-full p-3 rounded-lg bg-transparent outline-none text-lg font-medium"
                    style={{ backgroundColor: colors.background, borderColor: colors.primary, borderWidth: '2px', color: colors.text }}
                  />
                  <p className="text-xs mt-1" style={{ color: colors.textTertiary }}>
                    Stake tokens to show support for this project
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowStakeInput(false)}
                    className="flex-1 py-2 rounded-lg font-medium transition hover:opacity-90"
                    style={{ backgroundColor: colors.backgroundTertiary, color: colors.text }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleStake}
                    disabled={loading || !stakeAmount || parseFloat(stakeAmount) <= 0}
                    className="flex-1 py-2 rounded-lg font-bold transition hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                    style={{ backgroundColor: colors.primary, color: '#0e0d13' }}
                  >
                    <FaHeart />
                    {loading ? 'Liking...' : `Like with ${stakeAmount} Tokens`}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left Column - Info Cards */}
          <div className="space-y-4">
            {/* Overview Card */}
            <div className="rounded-lg p-4" style={{ backgroundColor: colors.cardBg, borderColor: colors.border, borderWidth: '1px' }}>
              <h3 className="text-lg font-bold mb-3">Overview</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2" style={{ borderBottomColor: colors.border, borderBottomWidth: '1px' }}>
                  <span className="text-sm" style={{ color: colors.textTertiary }}>Risk Assessment</span>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-xl font-bold ${riskColor}`}>{riskLevel || 'N/A'}</span>
                    <span className="text-xs" style={{ color: colors.textTertiary }}>
                      ({ipfsData?.riskAssessment?.riskScore ?? '--'}/100)
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center pb-2" style={{ borderBottomColor: colors.border, borderBottomWidth: '1px' }}>
                  <span className="text-sm" style={{ color: colors.textTertiary }}>Classification</span>
                  <span className="text-sm font-medium">{ipfsData?.classification?.type || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center pb-2" style={{ borderBottomColor: colors.border, borderBottomWidth: '1px' }}>
                  <span className="text-sm" style={{ color: colors.textTertiary }}>Utility Score</span>
                  <span className="text-sm font-medium">{ipfsData?.classification?.utilityScore ?? '--'}%</span>
                </div>
                <div className="flex justify-between items-center pb-2" style={{ borderBottomColor: colors.border, borderBottomWidth: '1px' }}>
                  <span className="text-sm" style={{ color: colors.textTertiary }}>Meme Score</span>
                  <span className="text-sm font-medium">{ipfsData?.classification?.memeScore ?? '--'}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: colors.textTertiary }}>Registered On</span>
                  <span className="text-sm font-medium">{new Date(parseInt(account.timestamp) * 1000).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Token Information Card */}
            <div className="rounded-lg p-4" style={{ backgroundColor: colors.cardBg, borderColor: colors.border, borderWidth: '1px' }}>
              <h3 className="text-lg font-bold mb-3">Token Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2" style={{ borderBottomColor: colors.border, borderBottomWidth: '1px' }}>
                  <span className="text-sm" style={{ color: colors.textTertiary }}>Name</span>
                  <span className="text-sm font-medium">{account.name}</span>
                </div>
                <div className="flex justify-between items-center pb-2" style={{ borderBottomColor: colors.border, borderBottomWidth: '1px' }}>
                  <span className="text-sm" style={{ color: colors.textTertiary }}>Symbol</span>
                  <span className="text-sm font-medium">{account.symbol}</span>
                </div>
                <div className="flex justify-between items-center pb-2" style={{ borderBottomColor: colors.border, borderBottomWidth: '1px' }}>
                  <span className="text-sm" style={{ color: colors.textTertiary }}>Mint Address</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono">{account.mint.slice(0, 8)}...{account.mint.slice(-8)}</span>
                    <button onClick={() => copyToClipboard(account.mint)} className="transition hover:opacity-70">
                      <FaCopy className="text-xs" />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center pb-2" style={{ borderBottomColor: colors.border, borderBottomWidth: '1px' }}>
                  <span className="text-sm" style={{ color: colors.textTertiary }}>Update Authority</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono">{account.authority.slice(0, 8)}...{account.authority.slice(-8)}</span>
                    <button onClick={() => copyToClipboard(account.authority)} className="transition hover:opacity-70">
                      <FaCopy className="text-xs" />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: colors.textTertiary }}>IPFS Hash</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono">{account.ipfsHash.slice(0, 12)}...{account.ipfsHash.slice(-12)}</span>
                    <button onClick={() => copyToClipboard(account.ipfsHash)} className="transition hover:opacity-70">
                      <FaCopy className="text-xs" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Metadata Card */}
            {ipfsData && (
              <div className="rounded-lg p-4" style={{ backgroundColor: colors.cardBg, borderColor: colors.border, borderWidth: '1px' }}>
                <button
                  onClick={() => setShowMetadata(!showMetadata)}
                  className="w-full flex items-center justify-between text-lg font-bold mb-3 hover:opacity-80 transition"
                >
                  <span>IPFS Metadata</span>
                  {showMetadata ? <FaChevronUp className="text-sm" /> : <FaChevronDown className="text-sm" />}
                </button>
                {showMetadata && (
                  <div className="rounded p-4 overflow-x-auto" style={{ backgroundColor: colors.background }}>
                    <pre className="text-xs" style={{ color: colors.textTertiary }}>
                      {JSON.stringify(ipfsData, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Staking Card */}
          <div className="space-y-4">
            {connected && publicKey && (
              <div className="rounded-lg p-4 sticky top-4" style={{ backgroundColor: colors.cardBg, borderColor: colors.border, borderWidth: '1px' }}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <FaHeart style={{ color: colors.primary }} />
                    Like This Project
                  </h3>
                  {projectStakes && projectStakes.totalStakes?.toNumber && projectStakes.totalStakes.toNumber() >= 10 && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded text-xs" style={{ backgroundColor: `${colors.primary}20`, color: colors.primary }}>
                      <FaCheckCircle />
                      <span>Verified</span>
                    </div>
                  )}
                </div>

                {projectStakes ? (
                  <>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="p-3 rounded-lg" style={{ backgroundColor: colors.background }}>
                        <div className="flex items-center gap-2 mb-1">
                          <FaHeart className="text-xs" style={{ color: colors.primary }} />
                          <span className="text-xs" style={{ color: colors.textTertiary }}>Total Likes</span>
                        </div>
                        <p className="text-xl font-bold">{projectStakes.totalStakes?.toNumber ? projectStakes.totalStakes.toNumber() : 0}</p>
                      </div>
                      <div className="p-3 rounded-lg" style={{ backgroundColor: colors.background }}>
                        <div className="flex items-center gap-2 mb-1">
                          <FaCheckCircle className="text-xs" style={{ color: colors.primary }} />
                          <span className="text-xs" style={{ color: colors.textTertiary }}>To Verify</span>
                        </div>
                        <p className="text-xl font-bold">{Math.max(0, 10 - (projectStakes.totalStakes?.toNumber ? projectStakes.totalStakes.toNumber() : 0))}</p>
                      </div>
                    </div>

                    {userStake && userStake.amount > 0 ? (
                      <div className="space-y-3">
                        <div className="p-3 rounded-lg" style={{ backgroundColor: `${colors.primary}20`, borderColor: colors.primary, borderWidth: '1px' }}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm" style={{ color: colors.primary }}>Your Stake</span>
                            <span className="font-bold" style={{ color: colors.primary }}>
                              {(userStake.amount / 1_000_000_000).toFixed(2)} Tokens
                            </span>
                          </div>
                          {userStake.unstakeRequestedAt && (
                            <div className="flex items-center gap-2 text-xs" style={{ color: colors.primary }}>
                              <FaClock />
                              <span>Unstake requested - can complete after cooldown</span>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          {userStake.unstakeRequestedAt ? (
                            <button
                              onClick={handleCompleteUnstake}
                              disabled={loading}
                              className="flex-1 py-2 rounded-lg font-medium transition hover:opacity-90 disabled:opacity-50 text-sm"
                              style={{ backgroundColor: colors.primary, color: '#0e0d13' }}
                            >
                              {loading ? 'Processing...' : 'Complete Unstake'}
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={handleRequestUnstake}
                                disabled={loading}
                                className="flex-1 py-2 rounded-lg font-medium transition hover:opacity-90 disabled:opacity-50 text-sm"
                                style={{ backgroundColor: colors.backgroundTertiary, color: colors.text }}
                              >
                                {loading ? 'Processing...' : 'Request Unstake'}
                              </button>
                              <button
                                onClick={() => setShowStakeInput(true)}
                                disabled={loading}
                                className="flex-1 py-2 rounded-lg font-medium transition hover:opacity-90 disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                                style={{ backgroundColor: colors.primary, color: '#0e0d13' }}
                              >
                                <FaHeart />
                                Add More
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm mb-3" style={{ color: colors.textTertiary }}>
                          Click the "Like This Project" button above to stake tokens
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm mb-3" style={{ color: colors.textTertiary }}>
                      Staking not initialized for this project yet
                    </p>
                    <button
                      onClick={handleInitializeStakes}
                      disabled={loading}
                      className="px-4 py-2 rounded-lg font-medium transition hover:opacity-90 disabled:opacity-50 text-sm"
                      style={{ backgroundColor: colors.primary, color: '#0e0d13' }}
                    >
                      {loading ? 'Initializing...' : 'Initialize Staking'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
