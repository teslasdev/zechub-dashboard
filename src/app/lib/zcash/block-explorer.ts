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
  private apiKey?: string;

  constructor(rpcUrl?: string, isTestnet: boolean = true) {
    // Use API proxy to avoid CORS
    this.isTestnet = isTestnet;
    this.rpcUrl = rpcUrl || '/api/zcash';
  }

  /**
   * Make request through our API proxy (avoids CORS)
   */
  private async fetchWithAuth(endpoint: string): Promise<Response> {
    const url = `${this.rpcUrl}?endpoint=${encodeURIComponent(endpoint)}`;
    
    return fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
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
      // Blockchair format: /dashboards/block/{height}
      const response = await this.fetchWithAuth(
        `dashboards/block/${heightOrHash}`
      );
      
      if (!response.ok) {
        console.error(`Block fetch failed: ${response.status} ${response.statusText}`);
        return null;
      }
      
      const result = await response.json();
      const blockData = result.data?.[heightOrHash];
      
      if (blockData?.block) {
        const block = {
          hash: blockData.block.hash,
          height: blockData.block.id,
          time: new Date(blockData.block.time).getTime() / 1000,
          tx: blockData.transactions?.map((tx: any) => tx.hash) || [],
          size: blockData.block.size,
          difficulty: blockData.block.difficulty,
          chainwork: ''
        };
        this.cache.set(cacheKey, block);
        return block;
      }
      
      return null;
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
      // Blockchair format: /dashboards/transaction/{txid}
      const response = await this.fetchWithAuth(
        `dashboards/transaction/${txid}`
      );
      
      if (!response.ok) {
        console.error(`Transaction fetch failed: ${response.status} ${response.statusText}`);
        return null;
      }
      
      const result = await response.json();
      const txData = result.data?.[txid];
      
      if (txData?.transaction) {
        const tx: Transaction = {
          txid: txData.transaction.hash,
          version: txData.transaction.version,
          locktime: txData.transaction.lock_time,
          vin: txData.inputs || [],
          vout: txData.outputs || [],
          vShieldedSpend: txData.transaction.shielded_spend || [],
          vShieldedOutput: txData.transaction.shielded_output || [],
          vJoinSplit: [],
          valueBalance: 0,
          height: txData.transaction.block_id,
          time: new Date(txData.transaction.time).getTime() / 1000,
          hasShielded: !!(txData.transaction.shielded_spend?.length || txData.transaction.shielded_output?.length)
        };
        
        this.cache.set(cacheKey, tx);
        return tx;
      }
      
      return null;
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
      // Blockchair format: /dashboards/address/{address}
      const response = await this.fetchWithAuth(
        `dashboards/address/${address}?limit=${limit}`
      );
      
      if (!response.ok) return [];
      const result = await response.json();
      const data = result.data?.[address]?.transactions || [];
      return data;
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
      // Blockchair format: /stats
      const response = await this.fetchWithAuth(`stats`);
      
      if (!response.ok) {
        console.error(`Latest block fetch failed: ${response.status} ${response.statusText}`);
        return 0;
      }
      
      const result = await response.json();
      return result.data?.blocks || 0;
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
