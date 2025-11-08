import { Program, AnchorProvider, web3 } from '@coral-xyz/anchor';
import type { Idl } from '@coral-xyz/anchor';
import { Connection, PublicKey, type Commitment } from '@solana/web3.js';
import idlJson from './cp_idl.json';

const idl = idlJson as unknown as Idl;
// Program ID is now derived from the IDL address field
const programID = new PublicKey(idl.address as string);
const network = 'https://api.devnet.solana.com';
const opts: { preflightCommitment: Commitment } = { preflightCommitment: 'processed' };

export const getProvider = () => {
  if (typeof window === 'undefined' || !window.solana) {
    return null;
  }

  // Don't check isConnected - just check if publicKey exists
  if (!window.solana.publicKey) {
    return null;
  }

  try {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new AnchorProvider(connection, window.solana as any, opts);
    return provider;
  } catch (error) {
    return null;
  }
};

export const getProgram = () => {
  const provider = getProvider();
  if (!provider) {
    console.log('❌ No provider available');
    return null;
  }

  try {
    console.log('🔍 Creating program with:', {
      programID: programID.toString(),
      hasIdl: !!idl,
      idlAddress: idl.address,
      metadataAddress: (idl as any).metadata?.address
    });

    const program = new Program(idl, provider);
    console.log('✅ Program created successfully, programId:', program.programId.toString());

    // Verify the programId matches what we expect
    if (program.programId.toString() !== programID.toString()) {
      console.error('⚠️ Program ID mismatch!', {
        expected: programID.toString(),
        actual: program.programId.toString()
      });
    }

    return program;
  } catch (error) {
    console.error('❌ Failed to create program:', error);
    return null;
  }
};

// Read-only program instance for fetching data without wallet
export const getReadOnlyProgram = () => {
  try {
    const connection = new Connection(network, opts.preflightCommitment);
    // Create a dummy provider for read-only access
    const dummyWallet = {
      publicKey: PublicKey.default,
      signTransaction: async () => { throw new Error('Read-only mode'); },
      signAllTransactions: async () => { throw new Error('Read-only mode'); },
    };
    const provider = new AnchorProvider(connection, dummyWallet as any, opts);
    const program = new Program(idl, provider);
    return program;
  } catch (error) {
    return null;
  }
};