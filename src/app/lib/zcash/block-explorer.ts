/**
 * Zcash Block Explorer Service
 * Fetches blockchain data and handles shielded transaction decryption
 */

import { ViewingKey, ShieldedTransaction, viewingKeyManager } from './viewing-keys';

export interface Block {
  hash: string;
  height: number;
  time: number;
  tx: string[];
  size: number;
  difficulty: number;
  chainwork: string;
}

export interface Transaction {
  txid: string;
  version: number;
  locktime: number;
  vin: any[];
  vout: any[];
  vShieldedSpend?: any[];
  vShieldedOutput?: any[];
  vJoinSplit?: any[];
  valueBalance?: number;
  height: number;
  time: number;
  hasShielded: boolean;
}

export class ZcashBlockExplorer {
  private rpcUrl: string;
  private isTestnet: boolean;
  private cache: Map<string, any> = new Map();

  constructor(rpcUrl?: string, isTestnet: boolean = true) {
    // Use testnet by default for development
    this.isTestnet = isTestnet;
    this.rpcUrl = rpcUrl || (isTestnet 
      ? 'https://testnet.zcashexplorer.app/api'
      : 'https://api.zcha.in');
  }

  /**
   * Get block by height or hash
   */
  async getBlock(heightOrHash: string | number): Promise<Block | null> {
    const cacheKey = `block_${heightOrHash}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const network = this.isTestnet ? 'testnet' : 'mainnet';
      // Try multiple explorers for better reliability
      let response;
      
      // Try Zcash block explorer first
      try {
        response = await fetch(`${this.rpcUrl}/block/${heightOrHash}`);
      } catch (err) {
        // Fallback to alternative explorers
        const fallbackUrl = this.isTestnet 
          ? `https://explorer.testnet.z.cash/api/block/${heightOrHash}`
          : `https://api.zcha.in/v2/mainnet/blocks/${heightOrHash}`;
        response = await fetch(fallbackUrl);
      }
      
      if (!response.ok) return null;
      
      const block = await response.json();
      this.cache.set(cacheKey, block);
      return block;
    } catch (error) {
      console.error('Failed to fetch block:', error);
      return null;
    }
  }

  /**
   * Get transaction details
   */
  async getTransaction(txid: string): Promise<Transaction | null> {
    const cacheKey = `tx_${txid}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      let response;
      
      // Try multiple endpoints
      try {
        response = await fetch(`${this.rpcUrl}/tx/${txid}`);
      } catch (err) {
        // Fallback to alternative testnet explorer
        const fallbackUrl = this.isTestnet 
          ? `https://explorer.testnet.z.cash/api/tx/${txid}`
          : `https://api.zcha.in/v2/mainnet/transactions/${txid}`;
        response = await fetch(fallbackUrl);
      }
      
      if (!response.ok) return null;
      
      const tx = await response.json();
      
      // Mark if transaction has shielded components
      tx.hasShielded = !!(
        tx.vShieldedSpend?.length ||
        tx.vShieldedOutput?.length ||
        tx.vJoinSplit?.length
      );
      
      this.cache.set(cacheKey, tx);
      return tx;
    } catch (error) {
      console.error('Failed to fetch transaction:', error);
      return null;
    }
  }

  /**
   * Search for transactions by address (transparent only without viewing key)
   */
  async searchTransactionsByAddress(
    address: string,
    limit: number = 10
  ): Promise<Transaction[]> {
    try {
      const response = await fetch(
        `${this.rpcUrl}/v2/mainnet/accounts/${address}/recv?limit=${limit}&sort=timestamp&direction=descending`
      );
      
      if (!response.ok) return [];
      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error('Failed to search transactions:', error);
      return [];
    }
  }

  /**
   * Scan blockchain for transactions related to viewing key
   * This happens entirely client-side
   */
  async scanForShieldedTransactions(
    viewingKey: ViewingKey,
    startBlock: number,
    endBlock: number,
    onProgress?: (current: number, total: number) => void
  ): Promise<ShieldedTransaction[]> {
    const transactions: ShieldedTransaction[] = [];
    const totalBlocks = endBlock - startBlock;

    for (let height = startBlock; height <= endBlock; height++) {
      if (onProgress) {
        onProgress(height - startBlock, totalBlocks);
      }

      const block = await this.getBlock(height);
      if (!block) continue;

      // Check each transaction in the block
      for (const txid of block.tx) {
        const tx = await this.getTransaction(txid);
        if (!tx?.hasShielded) continue;

        // Attempt to decrypt client-side
        const decrypted = await viewingKeyManager.decryptTransaction(tx, viewingKey);
        if (decrypted) {
          transactions.push(decrypted);
        }
      }
    }

    return transactions;
  }

  /**
   * Get latest block height
   */
  async getLatestBlockHeight(): Promise<number> {
    try {
      let response;
      
      try {
        response = await fetch(`${this.rpcUrl}/status`);
        if (response.ok) {
          const data = await response.json();
          return data.blocks || data.blockbook?.bestHeight || 0;
        }
      } catch (err) {
        // Fallback
        const fallbackUrl = this.isTestnet 
          ? 'https://explorer.testnet.z.cash/api/status'
          : 'https://api.zcha.in/v2/mainnet/blocks?limit=1&sort=height&direction=descending';
        response = await fetch(fallbackUrl);
      }
      
      if (!response.ok) return 0;
      
      const data = await response.json();
      // Handle different API response formats
      return data.blocks || data.blockbook?.bestHeight || data[0]?.height || 0;
    } catch (error) {
      console.error('Failed to fetch latest block:', error);
      return 0;
    }
  }

  /**
   * Verify shielded transaction privacy
   */
  verifyTransactionPrivacy(tx: Transaction): {
    isPrivate: boolean;
    level: 'full' | 'partial' | 'transparent';
    details: string[];
  } {
    const details: string[] = [];
    
    const hasTransparent = tx.vin.length > 0 || tx.vout.length > 0;
    const hasShielded = tx.vShieldedSpend?.length || tx.vShieldedOutput?.length;
    const hasSprout = tx.vJoinSplit?.length;

    if (hasShielded && !hasTransparent) {
      details.push('Fully shielded transaction (Sapling/Orchard)');
      return { isPrivate: true, level: 'full', details };
    }

    if (hasShielded && hasTransparent) {
      details.push('Partially shielded transaction');
      details.push('Contains both transparent and shielded components');
      return { isPrivate: true, level: 'partial', details };
    }

    if (hasSprout) {
      details.push('Legacy Sprout shielded transaction');
      return { isPrivate: true, level: 'partial', details };
    }

    details.push('Fully transparent transaction');
    return { isPrivate: false, level: 'transparent', details };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// Export singleton instance - TESTNET by default for development
export const blockExplorer = new ZcashBlockExplorer(undefined, true);

// Export mainnet instance if needed
export const mainnetExplorer = new ZcashBlockExplorer(undefined, false);
