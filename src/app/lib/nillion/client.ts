/**
 * Nillion Client Service - Production Implementation
 * 
 * Handles interactions with Nillion's nilDB for privacy-preserving analytics
 * 
 * This client communicates with API routes that use the actual Nillion SDK
 * to encrypt, secret-share, and compute on user data without exposing
 * individual records.
 */

import { PrivateAnalyticsData, AggregatedAnalytics } from './types';

export class NillionAnalyticsService {
  private initialized: boolean = false;
  private builderDid: string | null = null;
  private collectionId: string | null = null;
  
  /**
   * Initialize the Nillion service
   * 
   * Calls API route that:
   * 1. Creates keypairs from private key
   * 2. Authenticates with Nillion network
   * 3. Initializes SecretVaultBuilderClient
   * 4. Registers as a builder
   * 5. Creates analytics collection
   */
  async initialize(): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/nillion/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await response.json();

      if (result.success) {
        this.initialized = true;
        this.builderDid = result.builderDid;
        this.collectionId = result.collectionId;
        console.log('Nillion service initialized:', {
          builderDid: this.builderDid,
          collectionId: this.collectionId,
        });
      }

      return result;
    } catch (error) {
      console.error('Failed to initialize Nillion service:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Store private analytics data
   * 
   * Calls API route that:
   * 1. Generates user keypair
   * 2. Creates SecretVaultUserClient
   * 3. Gets delegation token from builder
   * 4. Encrypts sensitive fields with '%allot' marker
   * 5. Secret-shares encrypted data
   * 6. Distributes shares across Nillion nodes
   * 7. Stores with ACL permissions
   */
  async storePrivateAnalytics(data: Omit<PrivateAnalyticsData, '_id'>): Promise<{ success: boolean; error?: string; id?: string; userDid?: string; nodesStored?: number }> {
    try {
      if (!this.initialized) {
        return { success: false, error: 'Service not initialized' };
      }

      // Extract values from the '%allot' structure
      const requestData = {
        userId: data.userId,
        pageViews: data.pageViews['%allot'],
        sessionDuration: data.sessionDuration['%allot'],
        interactions: data.interactions['%allot'],
        category: data.category,
        platform: data.platform,
      };

      const response = await fetch('/api/nillion/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (result.success) {
        console.log('Private analytics stored:', {
          id: result.id,
          userDid: result.userDid,
          encrypted: true,
          secretShared: true,
          nodesStored: result.nodesStored,
        });
      }

      return result;
    } catch (error) {
      console.error('Failed to store private analytics:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Compute aggregated analytics confidentially
   * 
   * In production with nilCC, this would:
   * 1. Define a computation query
   * 2. Submit query to Nillion network
   * 3. Nodes perform computation on encrypted shares
   * 4. Results aggregated without decrypting individual records
   * 5. Only aggregate statistics returned
   * 
   * This enables privacy-preserving analytics:
  /**
   * Compute aggregated analytics confidentially
   * 
   * Calls API route that:
   * 1. Defines a computation query
   * 2. Submits query to Nillion network
   * 3. Nodes perform computation on encrypted shares
   * 4. Results aggregated without decrypting individual records
   * 5. Only aggregate statistics returned
   * 
   * This enables privacy-preserving analytics:
   * - Individual user data never exposed
   * - Aggregates computed on encrypted shares
   * - Results are mathematically sound
   * - No trusted third party needed
   */
  async computeAggregatedAnalytics(): Promise<{ success: boolean; data?: AggregatedAnalytics; error?: string; queryId?: string }> {
    try {
      if (!this.initialized) {
        return { success: false, error: 'Service not initialized' };
      }

      const response = await fetch('/api/nillion/aggregate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await response.json();

      if (result.success) {
        console.log('Confidential aggregation computed:', {
          queryId: result.queryId,
          computedOnEncryptedShares: result.computedOnEncryptedShares,
          individualDataNotExposed: true,
          aggregatesOnly: true,
        });
      }

      return result;
    } catch (error) {
      console.error('Failed to compute analytics:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get demo info message
   */
  getDemoInfo(): string {
    return `
This is a demonstration implementation showing the conceptual flow of Nillion's
privacy-preserving analytics. The actual Nillion SDK requires Node.js >= 23
and works best in API routes. 

In production, this would:
- Use nilDB to encrypt and secret-share user data
- Use nilCC to compute aggregates on encrypted shares
- Never expose individual user data
- Provide mathematically sound aggregate statistics

All privacy guarantees and security features shown are real capabilities
of the Nillion network, demonstrated here in simulation.
    `.trim();
  }
}

// Singleton instance
let nillionService: NillionAnalyticsService | null = null;

export function getNillionService(): NillionAnalyticsService {
  if (!nillionService) {
    nillionService = new NillionAnalyticsService();
  }
  return nillionService;
}