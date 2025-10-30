import { Program, AnchorProvider } from '@project-serum/anchor';
import { Connection, PublicKey, type Commitment } from '@solana/web3.js';
import idl from './cp_idl.json';

const programID = new PublicKey('45gVbLLSYYcW254TFoJMXmfupM5dJaFxTLsbny2eqKWx');
const network = 'https://api.devnet.solana.com';
const opts: { preflightCommitment: Commitment } = { preflightCommitment: 'processed' };

export const getProvider = () => {
  if (typeof window === 'undefined' || !window.solana) {
    console.warn('Solana wallet not found');
    return null;
  }
  
  try {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new AnchorProvider(connection, window.solana as any, opts);
    return provider;
  } catch (error) {
    console.error('Error creating provider:', error);
    return null;
  }
};

export const getProgram = () => {
  const provider = getProvider();
  if (!provider) {
    return null;
  }

  try {
    const program = new Program(idl as any, programID, provider);
    return program;
  } catch (error) {
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
    const program = new Program(idl as any, programID, provider);
    return program;
  } catch (error) {
    return null;
  }
};

export { programID };