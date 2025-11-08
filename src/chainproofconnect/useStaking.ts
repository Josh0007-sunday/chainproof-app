import { web3, BN } from '@coral-xyz/anchor';
import { getProgram, getProvider } from './useProgram';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, getAccount } from '@solana/spl-token';

const STAKE_TOKEN_MINT = new web3.PublicKey('2FKjWV4zh7AVsmXonL7AM9Lh9zfpcE3e1dCYejWvd5W8');

export const useStaking = () => {
  // Initialize project stakes (must be done before anyone can stake)
  const initializeProjectStakes = async (projectMint: string) => {
    const program = getProgram();
    const provider = getProvider();

    if (!program || !provider) throw new Error("Program or Provider not initialized");
    if (!window.solana?.publicKey) throw new Error("Wallet not connected");

    const payer = window.solana.publicKey;
    const projectMintPubkey = new web3.PublicKey(projectMint);

    const [projectStakesPda] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("project_stakes"), projectMintPubkey.toBuffer()],
      program.programId
    );

    const tx = await program.methods
      .initializeProjectStakes()
      .accounts({
        payer,
        projectMint: projectMintPubkey,
        projectStakes: projectStakesPda,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();

    console.log("✅ Project stakes initialized. Tx:", tx);
    return tx;
  };

  // Stake on a project
  const stakeOnProject = async (projectMint: string, amount: number) => {
    const program = getProgram();
    const provider = getProvider();

    if (!program || !provider) throw new Error("Program or Provider not initialized");
    if (!window.solana?.publicKey) throw new Error("Wallet not connected");

    const user = window.solana.publicKey;
    const projectMintPubkey = new web3.PublicKey(projectMint);

    // Get PDAs
    const [userStakePda] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("user_stake"), user.toBuffer(), projectMintPubkey.toBuffer()],
      program.programId
    );

    const [projectStakesPda] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("project_stakes"), projectMintPubkey.toBuffer()],
      program.programId
    );

    const [userProfilePda] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("user_profile"), user.toBuffer()],
      program.programId
    );

    // Get token accounts
    const userTokenAccount = await getAssociatedTokenAddress(
      STAKE_TOKEN_MINT,
      user
    );

    const stakeVault = await getAssociatedTokenAddress(
      STAKE_TOKEN_MINT,
      projectStakesPda,
      true
    );

    // Check if stake vault exists, create if needed
    const connection = provider.connection;
    let stakeVaultExists = false;
    try {
      await getAccount(connection, stakeVault);
      stakeVaultExists = true;
    } catch (error) {
      // Account doesn't exist
      stakeVaultExists = false;
    }

    // If stake vault doesn't exist, create it first
    if (!stakeVaultExists) {
      console.log('Creating stake vault for project...');
      const createVaultIx = createAssociatedTokenAccountInstruction(
        user,
        stakeVault,
        projectStakesPda,
        STAKE_TOKEN_MINT
      );

      const createVaultTx = new web3.Transaction().add(createVaultIx);
      const createVaultSig = await provider.sendAndConfirm(createVaultTx);
      console.log('✅ Stake vault created. Tx:', createVaultSig);
    }

    const tx = await program.methods
      .stakeOnProject(new BN(amount))
      .accounts({
        user,
        projectMint: projectMintPubkey,
        userStake: userStakePda,
        projectStakes: projectStakesPda,
        userProfile: userProfilePda,
        userTokenAccount,
        stakeVault,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();

    console.log("✅ Staked on project. Tx:", tx);
    return tx;
  };

  // Request unstake (starts cooldown period)
  const requestUnstake = async (projectMint: string) => {
    const program = getProgram();
    const provider = getProvider();

    if (!program || !provider) throw new Error("Program or Provider not initialized");
    if (!window.solana?.publicKey) throw new Error("Wallet not connected");

    const user = window.solana.publicKey;
    const projectMintPubkey = new web3.PublicKey(projectMint);

    const [userStakePda] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("user_stake"), user.toBuffer(), projectMintPubkey.toBuffer()],
      program.programId
    );

    const tx = await program.methods
      .requestUnstake()
      .accounts({
        user,
        userStake: userStakePda,
      })
      .rpc();

    console.log("⏳ Unstake requested (48h cooldown). Tx:", tx);
    return tx;
  };

  // Complete unstake (after cooldown)
  const completeUnstake = async (projectMint: string) => {
    const program = getProgram();
    const provider = getProvider();

    if (!program || !provider) throw new Error("Program or Provider not initialized");
    if (!window.solana?.publicKey) throw new Error("Wallet not connected");

    const user = window.solana.publicKey;
    const projectMintPubkey = new web3.PublicKey(projectMint);

    const [userStakePda] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("user_stake"), user.toBuffer(), projectMintPubkey.toBuffer()],
      program.programId
    );

    const [projectStakesPda] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("project_stakes"), projectMintPubkey.toBuffer()],
      program.programId
    );

    const [userProfilePda] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("user_profile"), user.toBuffer()],
      program.programId
    );

    const userTokenAccount = await getAssociatedTokenAddress(
      STAKE_TOKEN_MINT,
      user
    );

    const stakeVault = await getAssociatedTokenAddress(
      STAKE_TOKEN_MINT,
      projectStakesPda,
      true
    );

    const tx = await program.methods
      .completeUnstake()
      .accounts({
        user,
        projectMint: projectMintPubkey,
        userStake: userStakePda,
        projectStakes: projectStakesPda,
        userProfile: userProfilePda,
        userTokenAccount,
        stakeVault,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    console.log("✅ Unstake completed. Tx:", tx);
    return tx;
  };

  // Get project stakes info
  const getProjectStakes = async (projectMint: string) => {
    try {
      const program = getProgram();
      if (!program) return null;

      const projectMintPubkey = new web3.PublicKey(projectMint);
      const [projectStakesPda] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("project_stakes"), projectMintPubkey.toBuffer()],
        program.programId
      );

      const account = await (program.account as any).projectStakes.fetchNullable(projectStakesPda);
      return account;
    } catch (error) {
      console.error('Error fetching project stakes:', error);
      return null;
    }
  };

  // Get user stake info
  const getUserStake = async (userWallet: web3.PublicKey, projectMint: string) => {
    try {
      const program = getProgram();
      if (!program) return null;

      const projectMintPubkey = new web3.PublicKey(projectMint);
      const [userStakePda] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("user_stake"), userWallet.toBuffer(), projectMintPubkey.toBuffer()],
        program.programId
      );

      const account = await (program.account as any).userStake.fetchNullable(userStakePda);
      return account;
    } catch (error) {
      console.error('Error fetching user stake:', error);
      return null;
    }
  };

  return {
    initializeProjectStakes,
    stakeOnProject,
    requestUnstake,
    completeUnstake,
    getProjectStakes,
    getUserStake,
  };
};
