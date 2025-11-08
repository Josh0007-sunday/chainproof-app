import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { useUserProfile } from '../chainproofconnect/useUserProfile';
import { useStaking } from '../chainproofconnect/useStaking';
import { useRewardPool } from '../chainproofconnect/useRewardPool';
import { FaUser, FaHeart, FaTrophy, FaCheckCircle, FaClock, FaArrowRight } from 'react-icons/fa';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { useTheme } from '../context/ThemeContext';

export const ProtocolDashboard: React.FC = () => {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<'profile' | 'staking' | 'rewards'>('profile');
  const [username, setUsername] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [rewardPool, setRewardPool] = useState<any>(null);
  const [usdcVaultBalance, setUsdcVaultBalance] = useState<number>(0);

  const { createProfile, updateProfile, getUserProfile, profileExists } = useUserProfile();
  const { initializeRewardPool, getRewardPool, getDeveloperRegistry, distributeRewards } = useRewardPool();

  useEffect(() => {
    if (connected && publicKey) {
      loadUserData();
    } else {
      setUserProfile(null);
    }
  }, [connected, publicKey]);

  const loadUserData = async () => {
    try {
      if (!publicKey) return;

      // Load user profile
      try {
        const profile = await getUserProfile(publicKey);
        setUserProfile(profile);
        console.log('✅ User profile loaded:', profile);
      } catch (error) {
        console.log('User profile not found (this is normal for new users)');
        setUserProfile(null);
      }

      // Load reward pool data
      try {
        const poolData = await getRewardPool();
        setRewardPool(poolData);
      } catch (error) {
        console.log('Reward pool not loaded (might not be initialized yet)');
      }

      // Load USDC vault balance
      try {
        await loadUsdcVaultBalance();
      } catch (error) {
        console.log('USDC vault balance not loaded');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadUsdcVaultBalance = async () => {
    try {
      const PROGRAM_ID = new PublicKey('D6yD4d3ZEGxpdgbFHWTwMSpr9iGrnapLK5QCLvehoiDr');
      const USDC_MINT = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');

      // Derive reward pool PDA
      const [rewardPoolPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('reward_pool')],
        PROGRAM_ID
      );

      // Get USDC vault address
      const usdcVault = await getAssociatedTokenAddress(
        USDC_MINT,
        rewardPoolPda,
        true // allowOwnerOffCurve for PDA
      );

      // Fetch balance
      const balance = await connection.getTokenAccountBalance(usdcVault);
      const usdcAmount = parseFloat(balance.value.amount) / 1_000_000; // 6 decimals for USDC
      setUsdcVaultBalance(usdcAmount);
      console.log('✅ USDC Vault Balance:', usdcAmount, 'USDC');
    } catch (error) {
      console.error('Error loading USDC vault balance:', error);
      setUsdcVaultBalance(0);
    }
  };

  const handleCreateProfile = async () => {
    if (!username.trim()) {
      alert('Please enter a username');
      return;
    }

    // Check if wallet is connected
    if (!window.solana) {
      alert('No Solana wallet found. Please install Phantom wallet.');
      return;
    }

    if (!window.solana.isConnected) {
      alert('Wallet not connected. Please click the "Select Wallet" button and approve the connection.');
      try {
        await window.solana.connect();
      } catch (err) {
        alert('Failed to connect wallet. Please try clicking the wallet button.');
        return;
      }
    }

    if (!window.solana.publicKey) {
      alert('Wallet connected but no public key found. Please reconnect your wallet.');
      return;
    }

    console.log('Creating profile for wallet:', window.solana.publicKey.toString());

    setLoading(true);
    try {
      await createProfile(username, referralCode || undefined);
      alert('Profile created successfully!');
      await loadUserData();
      setUsername('');
      setReferralCode('');
    } catch (error: any) {
      console.error('Error creating profile:', error);
      alert('Failed to create profile: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!username.trim()) {
      alert('Please enter a new username');
      return;
    }

    setLoading(true);
    try {
      await updateProfile(username);
      alert('Profile updated successfully!');
      await loadUserData();
      setUsername('');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleInitializeRewardPool = async () => {
    setLoading(true);
    try {
      await initializeRewardPool();
      alert('Reward pool initialized successfully!');
      await loadUserData();
    } catch (error: any) {
      console.error('Error initializing reward pool:', error);
      alert('Failed to initialize reward pool: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDistributeRewards = async () => {
    setLoading(true);
    try {
      await distributeRewards();
      alert('Rewards distributed successfully!');
      await loadUserData();
    } catch (error: any) {
      console.error('Error distributing rewards:', error);
      alert('Failed to distribute rewards: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  if (!connected) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: colors.background, color: colors.text }}>
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center max-w-md px-4">
            <h2 className="text-2xl font-bold mb-4" style={{ color: colors.primary }}>
              Connect Your Wallet
            </h2>
            <p className="mb-6" style={{ color: colors.textSecondary }}>
              Please connect your Solana wallet using the wallet button in the navigation bar to access the ChainProof Protocol Dashboard
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: colors.background, color: colors.text }}>
      <Navbar />

      <div className="flex-grow w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-light" style={{ color: colors.primary }}>
              Protocol Dashboard
            </h1>
            <div className="text-sm" style={{ color: colors.textSecondary }}>
              Connected: {publicKey?.toString().slice(0, 4)}...{publicKey?.toString().slice(-4)}
            </div>
          </div>
          <p className="text-sm" style={{ color: colors.textTertiary }}>
            Manage your profile, stake on projects, and track rewards
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('profile')}
            className="px-4 py-2 rounded-lg transition flex items-center gap-2 whitespace-nowrap"
            style={{
              backgroundColor: activeTab === 'profile' ? colors.backgroundSecondary : 'transparent',
              borderColor: activeTab === 'profile' ? colors.primary : colors.border,
              borderWidth: '1px',
              color: activeTab === 'profile' ? colors.text : colors.textSecondary
            }}
          >
            <FaUser className="text-sm" />
            Profile
          </button>
          <button
            onClick={() => setActiveTab('staking')}
            className="px-4 py-2 rounded-lg transition flex items-center gap-2 whitespace-nowrap"
            style={{
              backgroundColor: activeTab === 'staking' ? colors.backgroundSecondary : 'transparent',
              borderColor: activeTab === 'staking' ? colors.primary : colors.border,
              borderWidth: '1px',
              color: activeTab === 'staking' ? colors.text : colors.textSecondary
            }}
          >
            <FaHeart className="text-sm" />
            Staking
          </button>
          <button
            onClick={() => setActiveTab('rewards')}
            className="px-4 py-2 rounded-lg transition flex items-center gap-2 whitespace-nowrap"
            style={{
              backgroundColor: activeTab === 'rewards' ? colors.backgroundSecondary : 'transparent',
              borderColor: activeTab === 'rewards' ? colors.primary : colors.border,
              borderWidth: '1px',
              color: activeTab === 'rewards' ? colors.text : colors.textSecondary
            }}
          >
            <FaTrophy className="text-sm" />
            Rewards
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Current Profile Card */}
            {userProfile ? (
              <div className="rounded-lg p-6" style={{ backgroundColor: colors.cardBg, borderColor: colors.border, borderWidth: '1px' }}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#35da9a20' }}>
                    <FaUser className="text-2xl" style={{ color: colors.primary }} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{userProfile.username}</h3>
                    <p className="text-sm" style={{ color: colors.textTertiary }}>
                      Member since {new Date(userProfile.createdAt.toNumber() * 1000).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {userProfile.referralCode && (
                  <div className="flex items-center gap-2 mb-4">
                    <FaCheckCircle style={{ color: colors.primary }} />
                    <span className="text-sm">Referred with code: <span className="font-mono">{userProfile.referralCode}</span></span>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-lg p-6" style={{ backgroundColor: colors.cardBg, borderColor: colors.border, borderWidth: '1px' }}>
                <h3 className="text-lg font-bold mb-4">Create Your Profile</h3>
                <p className="text-sm mb-6" style={{ color: colors.textTertiary }}>
                  Create a profile to start staking on projects and earning rewards
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-2" style={{ color: colors.textTertiary }}>
                      Username
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      className="w-full p-3 rounded-lg bg-transparent text-white outline-none"
                      style={{ backgroundColor: colors.inputBg, borderColor: colors.border, borderWidth: '1px' }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2" style={{ color: colors.textTertiary }}>
                      Referral Code (Optional)
                    </label>
                    <input
                      type="text"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                      placeholder="CHAINPROOFDEV"
                      className="w-full p-3 rounded-lg bg-transparent text-white outline-none"
                      style={{ backgroundColor: colors.inputBg, borderColor: colors.border, borderWidth: '1px' }}
                    />
                    <p className="text-xs mt-1" style={{ color: colors.textTertiary }}>
                      Use <span className="font-mono">CHAINPROOFDEV</span> to support the development team
                    </p>
                  </div>

                  <button
                    onClick={handleCreateProfile}
                    disabled={loading}
                    className="w-full py-3 rounded-lg font-medium transition hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: colors.primary, color: '#0e0d13' }}
                  >
                    {loading ? 'Creating Profile...' : 'Create Profile'}
                  </button>
                </div>
              </div>
            )}

            {/* Update Profile Card */}
            {userProfile && (
              <div className="rounded-lg p-6" style={{ backgroundColor: colors.cardBg, borderColor: colors.border, borderWidth: '1px' }}>
                <h3 className="text-lg font-bold mb-4">Update Username</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-2" style={{ color: colors.textTertiary }}>
                      New Username
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder={userProfile.username}
                      className="w-full p-3 rounded-lg bg-transparent text-white outline-none"
                      style={{ backgroundColor: colors.inputBg, borderColor: colors.border, borderWidth: '1px' }}
                    />
                  </div>

                  <button
                    onClick={handleUpdateProfile}
                    disabled={loading}
                    className="w-full py-3 rounded-lg font-medium transition hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: colors.primary, color: '#0e0d13' }}
                  >
                    {loading ? 'Updating...' : 'Update Username'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Staking Tab */}
        {activeTab === 'staking' && (
          <div className="space-y-6">
            <div className="rounded-lg p-6" style={{ backgroundColor: colors.cardBg, borderColor: colors.border, borderWidth: '1px' }}>
              <h3 className="text-lg font-bold mb-4">Staking Overview</h3>
              <p className="text-sm mb-6" style={{ color: colors.textTertiary }}>
                Stake tokens on projects to show your support. Projects with 10+ stakes get a verified badge.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: colors.inputBg }}>
                  <div className="flex items-center gap-2 mb-2">
                    <FaHeart style={{ color: colors.primary }} />
                    <span className="text-sm" style={{ color: colors.textTertiary }}>Total Staked</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {userProfile?.rewardPoints?.toNumber
                      ? (userProfile.rewardPoints.toNumber() / 1_000_000_000).toFixed(2)
                      : '0.00'} Tokens
                  </p>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: colors.inputBg }}>
                  <div className="flex items-center gap-2 mb-2">
                    <FaCheckCircle style={{ color: colors.primary }} />
                    <span className="text-sm" style={{ color: colors.textTertiary }}>Verification Threshold</span>
                  </div>
                  <p className="text-2xl font-bold">10 Stakes</p>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: colors.inputBg }}>
                  <div className="flex items-center gap-2 mb-2">
                    <FaClock style={{ color: colors.primary }} />
                    <span className="text-sm" style={{ color: colors.textTertiary }}>Unstake Cooldown</span>
                  </div>
                  <p className="text-2xl font-bold">48 Hours</p>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: '#35da9a20', borderColor: '#35da9a', borderWidth: '1px' }}>
                <p className="text-sm" style={{ color: colors.primary }}>
                  To stake on a project, visit a verified token's details page and click the "Like" button
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Rewards Tab */}
        {activeTab === 'rewards' && (
          <div className="space-y-6">
            {/* Reward Pool Stats */}
            <div className="rounded-lg p-6" style={{ backgroundColor: colors.cardBg, borderColor: colors.border, borderWidth: '1px' }}>
              <h3 className="text-lg font-bold mb-4">Reward Pool</h3>
              <p className="text-sm mb-6" style={{ color: colors.textTertiary }}>
                Revenue from public API calls (0.1 USDC per call via x402 protocol) flows directly to the reward pool and is distributed weekly to developers and stakers
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: colors.inputBg }}>
                  <div className="flex items-center gap-2 mb-2">
                    <FaTrophy style={{ color: colors.primary }} />
                    <span className="text-sm" style={{ color: colors.textTertiary }}>USDC Vault Balance</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {usdcVaultBalance.toFixed(2)} USDC
                  </p>
                  <p className="text-xs mt-1" style={{ color: colors.textTertiary }}>
                    From API payments
                  </p>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: colors.inputBg }}>
                  <div className="flex items-center gap-2 mb-2">
                    <FaArrowRight style={{ color: colors.primary }} />
                    <span className="text-sm" style={{ color: colors.textTertiary }}>Total Distributed</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {rewardPool?.totalDistributed?.toNumber
                      ? (rewardPool.totalDistributed.toNumber() / 1_000_000).toFixed(2)
                      : '0.00'} USDC
                  </p>
                  <p className="text-xs mt-1" style={{ color: colors.textTertiary }}>
                    To developers & stakers
                  </p>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: colors.inputBg }}>
                  <div className="flex items-center gap-2 mb-2">
                    <FaCheckCircle style={{ color: colors.primary }} />
                    <span className="text-sm" style={{ color: colors.textTertiary }}>API Calls</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {usdcVaultBalance > 0 ? (usdcVaultBalance / 0.1).toFixed(0) : '0'}
                  </p>
                  <p className="text-xs mt-1" style={{ color: colors.textTertiary }}>
                    @ 0.1 USDC per call
                  </p>
                </div>
              </div>

              {rewardPool ? (
                <>

                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#35da9a20', borderColor: '#35da9a', borderWidth: '1px' }}>
                    <p className="text-sm" style={{ color: colors.primary }}>
                      <strong>How it works:</strong> When users call the public API through the API Playground,
                      0.1 USDC is paid via x402 protocol and sent directly to this reward pool vault.
                      No intermediaries - transparent on-chain payments!
                    </p>
                  </div>
                </>
              ) : (
                <div className="p-4 rounded-lg text-center" style={{ backgroundColor: colors.inputBg }}>
                  <p className="text-sm mb-4" style={{ color: colors.textTertiary }}>
                    Reward pool not initialized yet
                  </p>
                  <button
                    onClick={handleInitializeRewardPool}
                    disabled={loading}
                    className="px-6 py-3 rounded-lg font-medium transition hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: colors.primary, color: '#0e0d13' }}
                  >
                    {loading ? 'Initializing...' : 'Initialize Reward Pool'}
                  </button>
                </div>
              )}
            </div>

            {/* Distribution Info */}
            <div className="rounded-lg p-6" style={{ backgroundColor: colors.cardBg, borderColor: colors.border, borderWidth: '1px' }}>
              <h3 className="text-lg font-bold mb-4">Distribution Split</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: colors.inputBg }}>
                  <span className="text-sm">Developers (CHAINPROOFDEV referrals)</span>
                  <span className="text-xl font-bold" style={{ color: colors.primary }}>60%</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: colors.inputBg }}>
                  <span className="text-sm">All Users (Stakers)</span>
                  <span className="text-xl font-bold" style={{ color: colors.primary }}>40%</span>
                </div>
              </div>

              {rewardPool && publicKey && (
                publicKey.toString() === 'GpwL49utAqN36HxkVJMF4d5qiqostZF4CWwSgHJzA3nx' ||
                publicKey.toString() === 'GgfFAteVqoD7KwHisQCH7DEpiqL3fEbYZ6ZDsPxntHCW'
              ) && (
                <button
                  onClick={handleDistributeRewards}
                  disabled={loading}
                  className="w-full mt-4 py-3 rounded-lg font-medium transition hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: colors.primary, color: '#0e0d13' }}
                >
                  {loading ? 'Distributing...' : 'Distribute Rewards (Weekly)'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};
