import { web3 } from '@project-serum/anchor';
import { getProgram, getProvider } from './useProgram';

export const useTokenRegistry = () => {
  const checkTokenExists = async (mint: string) => {
    try {
      const program = getProgram();
      const provider = getProvider();

      if (!program || !provider) return false;

      const mintPubkey = new web3.PublicKey(mint);
      const PROGRAM_ID = new web3.PublicKey('45gVbLLSYYcW254TFoJMXmfupM5dJaFxTLsbny2eqKWx');

      const [tokenEntryPda] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("token_entry"), mintPubkey.toBuffer()],
        PROGRAM_ID
      );

      const account = await program.account.tokenEntry.fetchNullable(tokenEntryPda);
      return account !== null;
    } catch (error) {
      console.error('Error checking token existence:', error);
      return false;
    }
  };

  const registerToken = async (mint: string, name: string, symbol: string, ipfsHash: string) => {
    const program = getProgram();
    const provider = getProvider();

    if (!program || !provider) throw new Error("Program or Provider not initialized");
    if (!window.solana?.publicKey) throw new Error("Wallet not connected");

    const authority = window.solana.publicKey;
    const mintPubkey = new web3.PublicKey(mint);
    const PROGRAM_ID = new web3.PublicKey('45gVbLLSYYcW254TFoJMXmfupM5dJaFxTLsbny2eqKWx');

    const [tokenEntryPda] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("token_entry"), mintPubkey.toBuffer()],
      PROGRAM_ID
    );

    // Check if token already exists
    const exists = await checkTokenExists(mint);
    if (exists) {
      throw new Error('This token is already registered on the blockchain. Use the update function instead.');
    }

    const tx = await program.methods
      .registerToken(name, symbol, ipfsHash)
      .accounts({
        authority,
        mint: mintPubkey,
        tokenEntry: tokenEntryPda,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();

    console.log("✅ Token registered. Tx:", tx);
    return tx;
  };

  const updateTokenEntry = async (mint: string, name: string, symbol: string, ipfsHash: string) => {
    const program = getProgram();
    const provider = getProvider();
    
    if (!program || !provider) throw new Error("Program or Provider not initialized");
    if (!window.solana?.publicKey) throw new Error("Wallet not connected");

    const authority = window.solana.publicKey;
    const mintPubkey = new web3.PublicKey(mint);
    const PROGRAM_ID = new web3.PublicKey('45gVbLLSYYcW254TFoJMXmfupM5dJaFxTLsbny2eqKWx');

    const [tokenEntryPda] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("token_entry"), mintPubkey.toBuffer()],
      PROGRAM_ID
    );

    const tx = await program.methods
      .updateTokenEntry(name, symbol, ipfsHash)
      .accounts({
        authority,
        tokenEntry: tokenEntryPda,
      })
      .rpc();

    console.log("🔄 Token entry updated. Tx:", tx);
    return tx;
  };

  return {
    registerToken,
    updateTokenEntry,
    checkTokenExists,
  };
};