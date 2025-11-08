import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createTransferInstruction,
  createAssociatedTokenAccountInstruction,
  ASSOCIATED_TOKEN_PROGRAM_ID
} from '@solana/spl-token';

/**
 * x402 Payment Service for ChainProof Premium API
 * Handles payment transaction creation for pay-per-use API access
 */

interface X402PaymentRequirements {
  recipient: string;
  amount: number;
  token: string;
  network: string;
}

interface X402PaymentHeader {
  x402Version: number;
  scheme: string;
  network: string;
  payload: {
    serializedTransaction: string;
  };
}

export class X402PaymentService {
  private connection: Connection;
  private network: string;

  constructor() {
    // Get network and RPC from environment
    this.network = import.meta.env.VITE_X402_NETWORK || 'solana-devnet';
    const rpcUrl = this.network === 'solana-devnet'
      ? import.meta.env.VITE_SOLANA_DEVNET_RPC_URL || 'https://api.devnet.solana.com'
      : import.meta.env.VITE_MAINNET_RPC_URL || 'https://api.mainnet-beta.solana.com';

    console.log('X402PaymentService initialized with:', {
      network: this.network,
      rpcUrl
    });

    this.connection = new Connection(rpcUrl, 'confirmed');
  }

  /**
   * Creates a payment transaction for x402 protocol
   * @param wallet - Connected Solana wallet
   * @param requirements - Payment requirements from 402 response
   * @returns X-PAYMENT header value
   */
  async createPaymentTransaction(
    wallet: any,
    requirements: X402PaymentRequirements
  ): Promise<string> {
    try {
      if (!wallet.publicKey) {
        throw new Error('Wallet not connected');
      }

      const tokenMint = new PublicKey(requirements.token);
      const senderPubkey = wallet.publicKey;

      // Get sender's token account
      const senderTokenAccount = await getAssociatedTokenAddress(
        tokenMint,
        senderPubkey
      );

      // Recipient is already the token account address (vault address)
      // No need to derive - backend sends the vault address directly
      const recipientTokenAccount = new PublicKey(requirements.recipient);

      // Check if recipient token account exists
      const recipientAccountInfo = await this.connection.getAccountInfo(recipientTokenAccount);

      // Create transaction
      const transaction = new Transaction();

      // If recipient account doesn't exist, we need to create it first
      // This is needed for the reward pool vault which is a PDA's associated token account
      if (!recipientAccountInfo) {
        console.log('Recipient token account does not exist, creating it...');

        // We need to derive the PDA owner from the vault address
        // For ChainProof reward pool: PDA is derived from ['reward_pool'] seed
        const PROGRAM_ID = new PublicKey('D6yD4d3ZEGxpdgbFHWTwMSpr9iGrnapLK5QCLvehoiDr');
        const [rewardPoolPda] = PublicKey.findProgramAddressSync(
          [Buffer.from('reward_pool')],
          PROGRAM_ID
        );

        const createAccountInstruction = createAssociatedTokenAccountInstruction(
          senderPubkey, // payer
          recipientTokenAccount, // ata
          rewardPoolPda, // owner (the PDA)
          tokenMint, // mint
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        );

        transaction.add(createAccountInstruction);
      }

      // Add transfer instruction
      const transferInstruction = createTransferInstruction(
        senderTokenAccount,
        recipientTokenAccount,
        senderPubkey,
        requirements.amount,
        [],
        TOKEN_PROGRAM_ID
      );

      transaction.add(transferInstruction);

      // Get recent blockhash
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = senderPubkey;

      // Sign transaction with wallet
      const signedTransaction = await wallet.signTransaction(transaction);

      // Serialize transaction to base64
      const serializedTransaction = signedTransaction.serialize().toString('base64');

      // Create x402 payment header
      const paymentHeader: X402PaymentHeader = {
        x402Version: 1,
        scheme: 'exact',
        network: this.network,
        payload: {
          serializedTransaction
        }
      };

      return JSON.stringify(paymentHeader);
    } catch (error: any) {
      console.error('Payment transaction creation error:', error);
      throw new Error(`Failed to create payment transaction: ${error.message}`);
    }
  }

  /**
   * Makes a paid API request with x402 payment
   * @param endpoint - API endpoint URL
   * @param wallet - Connected Solana wallet
   * @param options - Request options (method, body, etc.)
   */
  async makePaymentRequest(
    endpoint: string,
    wallet: any,
    options: RequestInit = {}
  ): Promise<Response> {
    try {
      // First, try the request without payment to get requirements
      const initialResponse = await fetch(endpoint, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      // If 402, payment required
      if (initialResponse.status === 402) {
        const responseData = await initialResponse.json();

        if (!responseData.x402) {
          throw new Error('Invalid 402 response: missing x402 payment requirements');
        }

        // Create payment transaction
        const paymentHeader = await this.createPaymentTransaction(
          wallet,
          responseData.x402
        );

        // Retry request with payment
        const paidResponse = await fetch(endpoint, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            'X-PAYMENT': paymentHeader,
            ...options.headers
          }
        });

        return paidResponse;
      }

      // If not 402, return the original response
      return initialResponse;
    } catch (error: any) {
      console.error('Payment request error:', error);
      throw error;
    }
  }

  /**
   * Estimates the cost in USDC for an API request
   * @param requirements - Payment requirements
   * @returns Cost in USDC (formatted)
   */
  estimateCost(requirements: X402PaymentRequirements): string {
    // USDC has 6 decimals
    const cost = requirements.amount / 1_000_000;
    return cost.toFixed(6);
  }

  /**
   * Checks if user has sufficient token balance
   * @param wallet - Connected wallet
   * @param tokenMint - Token mint address
   * @param amount - Required amount
   */
  async checkBalance(
    wallet: any,
    tokenMint: string,
    amount: number
  ): Promise<{ sufficient: boolean; balance: number; error?: string }> {
    try {
      if (!wallet.publicKey) {
        return { sufficient: false, balance: 0, error: 'Wallet not connected' };
      }

      const mint = new PublicKey(tokenMint);
      const tokenAccount = await getAssociatedTokenAddress(
        mint,
        wallet.publicKey
      );

      console.log('Token account address:', tokenAccount.toBase58());
      console.log('Fetching balance from RPC...');

      try {
        const accountInfo = await this.connection.getTokenAccountBalance(tokenAccount);
        console.log('Account info received:', accountInfo);

        if (!accountInfo || !accountInfo.value) {
          return { sufficient: false, balance: 0, error: 'Token account not found' };
        }

        const balance = Number(accountInfo.value.amount);

        return {
          sufficient: balance >= amount,
          balance
        };
      } catch (accountError: any) {
        // If account doesn't exist, it means balance is 0
        if (accountError.message?.includes('could not find account')) {
          return {
            sufficient: false,
            balance: 0,
            error: 'Token account does not exist. You need to receive USDC first to create the account.'
          };
        }
        throw accountError;
      }
    } catch (error: any) {
      console.error('Balance check error:', error);
      return { sufficient: false, balance: 0, error: error.message };
    }
  }

  /**
   * Helper to get payment requirements from 402 response
   * @param endpoint - API endpoint
   * @param options - Request options
   */
  async getPaymentRequirements(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<X402PaymentRequirements | null> {
    try {
      const response = await fetch(endpoint, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      if (response.status === 402) {
        const data = await response.json();
        return data.x402 || null;
      }

      return null;
    } catch (error) {
      console.error('Error getting payment requirements:', error);
      return null;
    }
  }
}

export const x402PaymentService = new X402PaymentService();
