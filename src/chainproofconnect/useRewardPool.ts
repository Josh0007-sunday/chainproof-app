import { web3, BN } from '@coral-xyz/anchor';
import { getProgram, getProvider, getReadOnlyProgram } from './useProgram';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';

const STAKE_TOKEN_MINT = new web3.PublicKey('2FKjWV4zh7AVsmXonL7AM9Lh9zfpcE3e1dCYejWvd5W8');

export const useRewardPool = () => {
  // Initialize the reward pool (one-time setup)
  const initializeRewardPool = async () => {
    const program = getProgram();
    const provider = getProvider();

    if (!program || !provider) throw new Error("Program or Provider not initialized - please connect your wallet");
    if (!window.solana?.publicKey) throw new Error("Wallet not connected");

    const authority = window.solana.publicKey;

    const [rewardPoolPda] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("reward_pool")],
      program.programId
    );

    const poolVault = await getAssociatedTokenAddress(
      STAKE_TOKEN_MINT,
      rewardPoolPda,
      true
    );

    const tx = await program.methods
      .initializeRewardPool()
      .accounts({
        authority,
        rewardPool: rewardPoolPda,
        poolVault,
        tokenMint: STAKE_TOKEN_MINT,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();

    console.log("✅ Reward pool initialized. Tx:", tx);
    return tx;
  };

  // Deposit tokens to the reward pool (for x402 revenue)
  const depositToPool = async (amount: number) => {
    const program = getProgram();
    const provider = getProvider();

    if (!program || !provider) throw new Error("Program or Provider not initialized - please connect your wallet");
    if (!window.solana?.publicKey) throw new Error("Wallet not connected");

    const depositor = window.solana.publicKey;

    const [rewardPoolPda] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("reward_pool")],
      program.programId
    );

    const depositorTokenAccount = await getAssociatedTokenAddress(
      STAKE_TOKEN_MINT,
      depositor
    );

    const poolVault = await getAssociatedTokenAddress(
      STAKE_TOKEN_MINT,
      rewardPoolPda,
      true
    );

    const tx = await program.methods
      .depositToPool(new BN(amount))
      .accounts({
        depositor,
        rewardPool: rewardPoolPda,
        depositorTokenAccount,
        poolVault,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    console.log("✅ Deposited to reward pool. Tx:", tx);
    return tx;
  };

  // Distribute rewards (weekly distribution)
  const distributeRewards = async () => {
    const program = getProgram();
    const provider = getProvider();

    if (!program || !provider) throw new Error("Program or Provider not initialized - please connect your wallet");
    if (!window.solana?.publicKey) throw new Error("Wallet not connected");

    const authority = window.solana.publicKey;

    const [rewardPoolPda] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("reward_pool")],
      program.programId
    );

    const [developerRegistryPda] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("developer_registry")],
      program.programId
    );

    const poolVault = await getAssociatedTokenAddress(
      STAKE_TOKEN_MINT,
      rewardPoolPda,
      true
    );

    const tx = await program.methods
      .distributeRewards()
      .accounts({
        authority,
        rewardPool: rewardPoolPda,
        developerRegistry: developerRegistryPda,
        poolVault,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    console.log("✅ Rewards distributed. Tx:", tx);
    return tx;
  };

  // Get reward pool info
  const getRewardPool = async () => {
    try {
      const program = getProgram() || getReadOnlyProgram();
      if (!program) return null;

      const [rewardPoolPda] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("reward_pool")],
        program.programId
      );

      const account = await (program.account as any).rewardPool.fetchNullable(rewardPoolPda);
      return account;
    } catch (error) {
      console.error('Error fetching reward pool:', error);
      return null;
    }
  };

  // Get developer registry info
  const getDeveloperRegistry = async () => {
    try {
      const program = getProgram() || getReadOnlyProgram();
      if (!program) return null;

      const [developerRegistryPda] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("developer_registry")],
        program.programId
      );

      const account = await (program.account as any).developerRegistry.fetchNullable(developerRegistryPda);
      return account;
    } catch (error) {
      console.error('Error fetching developer registry:', error);
      return null;
    }
  };

  // Initialize developer registry (one-time setup)
  const initializeDeveloperRegistry = async () => {
    const program = getProgram();
    const provider = getProvider();

    if (!program || !provider) throw new Error("Program or Provider not initialized - please connect your wallet");
    if (!window.solana?.publicKey) throw new Error("Wallet not connected");

    const authority = window.solana.publicKey;

    const [developerRegistryPda] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("developer_registry")],
      program.programId
    );

    const tx = await program.methods
      .initializeDeveloperRegistry()
      .accounts({
        authority,
        developerRegistry: developerRegistryPda,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();

    console.log("✅ Developer registry initialized. Tx:", tx);
    return tx;
  };

  return {
    initializeRewardPool,
    depositToPool,
    distributeRewards,
    getRewardPool,
    getDeveloperRegistry,
    initializeDeveloperRegistry,
  };
};
