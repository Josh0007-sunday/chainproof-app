import { web3, BN } from '@coral-xyz/anchor';
import { getProgram, getProvider, getReadOnlyProgram } from './useProgram';

export const useUserProfile = () => {
  // Create user profile with optional referral code
  const createProfile = async (username: string, referralCode?: string) => {
    console.log('🔍 Creating profile - wallet state:', {
      windowSolana: !!window.solana,
      publicKey: window.solana?.publicKey?.toString(),
      isConnected: window.solana?.isConnected
    });

    const program = getProgram();
    const provider = getProvider();

    console.log('🔍 Program and Provider:', { program: !!program, provider: !!provider });

    if (!program || !provider) throw new Error("Program or Provider not initialized - please connect your wallet");
    if (!window.solana?.publicKey) throw new Error("Wallet not connected");

    const user = window.solana.publicKey;

    const [userProfilePda] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("user_profile"), user.toBuffer()],
      program.programId
    );

    const tx = await program.methods
      .createProfile(username, referralCode || null)
      .accounts({
        user,
        userProfile: userProfilePda,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();

    console.log("✅ Profile created. Tx:", tx);
    return tx;
  };

  // Update user profile username
  const updateProfile = async (username: string) => {
    const program = getProgram();
    const provider = getProvider();

    if (!program || !provider) throw new Error("Program or Provider not initialized - please connect your wallet");
    if (!window.solana?.publicKey) throw new Error("Wallet not connected");

    const user = window.solana.publicKey;

    const [userProfilePda] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("user_profile"), user.toBuffer()],
      program.programId
    );

    const tx = await program.methods
      .updateProfile(username)
      .accounts({
        user,
        userProfile: userProfilePda,
        wallet: user,
      })
      .rpc();

    console.log("🔄 Profile updated. Tx:", tx);
    return tx;
  };

  // Fetch user profile
  const getUserProfile = async (userWallet: web3.PublicKey) => {
    try {
      // Use connected program if available, otherwise use read-only
      const program = getProgram() || getReadOnlyProgram();
      if (!program) return null;

      const [userProfilePda] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("user_profile"), userWallet.toBuffer()],
        program.programId
      );

      const account = await (program.account as any).userProfile.fetchNullable(userProfilePda);
      return account;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  // Check if user profile exists
  const profileExists = async (userWallet: web3.PublicKey) => {
    const profile = await getUserProfile(userWallet);
    return profile !== null;
  };

  return {
    createProfile,
    updateProfile,
    getUserProfile,
    profileExists,
  };
};
