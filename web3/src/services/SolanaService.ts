import {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  SystemProgram, LAMPORTS_PER_SOL
} from '@solana/web3.js';
import * as bip39 from 'bip39';

const APPLC = '7Rv9SPKEKZQ9MRZ3gzKaAWR7sKj7tBL6rikVy2oZiGMa'
const APPLC_PRIVATE = [83,185,212,120,153,57,177,200,219,98,198,57,55,35,214,234,110,221,137,32,58,4,30,66,15,240,63,11,53,226,172,219,26,210,44,61,138,137,159,154,194,170,231,181,98,102,34,16,184,179,208,230,176,124,80,21,72,168,183,62,221,220,158,84]
export default class SolanaService {
  private connection: Connection;

  constructor(network = 'https://api.mainnet-beta.solana.com') {
    this.connection = new Connection(network, 'confirmed');
  }

  /**
   * Get the balance of an account by address
   * @param {string} accountAddress - The public address of the account
   * @returns {Promise<number>} - Balance in lamports
   */
  async getBalanceFromAccountAddress(accountAddress: string) {
    try {
      const publicKey = new PublicKey(accountAddress);
      const balance = await this.connection.getBalance(publicKey);
      return balance; // Returns balance in lamports
    } catch (error) {
      console.error('Error getting balance:', error);
      throw error;
    }
  }

  lamportsToSol(lamports: number) {
    return lamports / 1000000000;
  }
  solToOther(sol: number, tokenAddress: string) {
    return sol;
  }

  async  lamportsToUSD(lamports: number) {
    // Fetch SOL to USD price (using CoinGecko API)
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
    const data = await response.json();
    const solToUsdRate = data.solana.usd;

    // Convert lamports to USD
    const solValue = lamports / LAMPORTS_PER_SOL;
    const usdValue = solValue * solToUsdRate;

    return usdValue;
  }
  /**
   * Send SOL from one address to another
   * @param {Keypair} sender - The sender's Keypair
   * @param {string} recipientAddress - The recipient's public address
   * @param {number} amount - Amount in lamports
   * @returns {Promise<string>} - Transaction signature
   */
  async sendToAddress(recipientAddress: string, amount: number) {
    try {
      let signer = Keypair.fromSecretKey(Uint8Array.from(APPLC_PRIVATE));
      const recipientPublicKey = new PublicKey(recipientAddress);

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: signer.publicKey,
          toPubkey: recipientPublicKey,
          lamports: amount,
        })
      );

      const signature = await this.connection.sendTransaction(transaction, [signer]);
      await this.connection.confirmTransaction(signature, 'confirmed');

      return signature;
    } catch (error) {
      console.error('Error sending SOL:', error);
      throw error;
    }
  }

  /**
   * Get contract information by address
   * @param {string} contractAddress - The public address of the contract
   * @returns {Promise<any>} - Account information
   */
  async getContractInfoByAddress(contractAddress: string) {
    try {
      const publicKey = new PublicKey(contractAddress);
      const accountInfo = await this.connection.getAccountInfo(publicKey);

      if (!accountInfo) {
        throw new Error('Account does not exist or is not accessible.');
      }

      return accountInfo;
    } catch (error) {
      console.error('Error getting contract info:', error);
      throw error;
    }
  }

  // Other methods (getBalanceFromAccountAddress, sendToAddress, getContractInfoByAddress)

  /**
   * Create a new Solana account and return the keys and passphrase
   * @returns {Promise<{passphrase: string, privateKey: Uint8Array, publicKey: string}>}
   */
  async createAccount() {
    try {
      // Generate a mnemonic passphrase (optional but recommended)
      const passphrase = bip39.generateMnemonic();

      // Generate a new Keypair
      const keypair = Keypair.generate();

      // Return passphrase, private key, and public key
      return {
        passphrase,
        privateKey: Array.from(keypair.secretKey), // Convert Uint8Array to regular array for readability
        publicKey: keypair.publicKey.toString(),
      };
    } catch (error) {
      console.error('Error creating account:', error);
      throw error;
    }
  }
}


