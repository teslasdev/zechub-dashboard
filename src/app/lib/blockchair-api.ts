const BLOCKCHAIR_API_URL = 'https://api.blockchair.com/zcash/stats';

export class BlockChairService {
  cacheDuration: number;
  constructor() {
    this.cacheDuration = 5 * 60 * 1000; // 5 minutes cache
  }

  async getZcashStats() {
    try {
      // Try to get cached data first
      const cached = this.getCachedData();
      if (cached && !this.isCacheExpired(cached.timestamp)) {
        console.log('Using cached BlockChair data');
        return cached.data;
      }

      console.log('Fetching fresh data from BlockChair');
      const response = await fetch(BLOCKCHAIR_API_URL);
      
      if (!response.ok) {
        throw new Error(`BlockChair API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Calculate changes and cache the data
      const enhancedData = await this.enhanceWithChanges(data);
      this.cacheData(enhancedData);
      
      return enhancedData;
    } catch (error) {
      console.error('Error fetching BlockChair data:', error);
      // Return cached data even if expired as fallback
      const cached = this.getCachedData();
      if (cached) {
        console.log('Using expired cache as fallback');
        return cached.data;
      }
      throw error;
    }
  }

  async enhanceWithChanges(currentData: { data: { market_price_usd: any; transactions_24h: any; volume_24h: any; blocks_24h: any; market_cap_usd: any; hashrate_24h: any; }; }) {
    const previousData = this.getPreviousData();
    
    if (!previousData) {
      // First time, no changes to calculate
      return {
        ...currentData,
        changes: {}
      };
    }

    // Calculate percentage changes for key metrics
    const changes = {
      market_price_usd: this.calculateChange(
        currentData.data.market_price_usd,
        previousData.data.market_price_usd
      ),
      transactions_24h: this.calculateChange(
        currentData.data.transactions_24h,
        previousData.data.transactions_24h
      ),
      volume_24h: this.calculateChange(
        currentData.data.volume_24h,
        previousData.data.volume_24h
      ),
      blocks_24h: this.calculateChange(
        currentData.data.blocks_24h,
        previousData.data.blocks_24h
      ),
      market_cap_usd: this.calculateChange(
        currentData.data.market_cap_usd,
        previousData.data.market_cap_usd
      ),
      hashrate_24h: this.calculateChange(
        this.parseHashrate(currentData.data.hashrate_24h),
        this.parseHashrate(previousData.data.hashrate_24h)
      )
    };

    return {
      ...currentData,
      changes,
      timestamp: Date.now()
    };
  }

  calculateChange(current: number, previous: number) {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  }

  parseHashrate(hashrateString: string) {
    // Convert "13246918424" to number
    return parseFloat(hashrateString) || 0;
  }

  getCachedData() {
    if (typeof window === 'undefined') return null;
    
    try {
      const cached = localStorage.getItem('blockchair_zcash_stats');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  }

  cacheData(data: { changes: {}; data: { market_price_usd: any; transactions_24h: any; volume_24h: any; blocks_24h: any; market_cap_usd: any; hashrate_24h: any; }; } | { changes: { market_price_usd: number; transactions_24h: number; volume_24h: number; blocks_24h: number; market_cap_usd: number; hashrate_24h: number; }; timestamp: number; data: { market_price_usd: any; transactions_24h: any; volume_24h: any; blocks_24h: any; market_cap_usd: any; hashrate_24h: any; }; }) {
    if (typeof window === 'undefined') return;
    
    try {
      const cache = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem('blockchair_zcash_stats', JSON.stringify(cache));
      
      // Also store as previous data for change calculations
      this.storeAsPreviousData(data);
    } catch (error) {
      console.warn('Could not cache data:', error);
    }
  }

  storeAsPreviousData(data: any) {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('blockchair_zcash_previous', JSON.stringify(data));
    } catch (error) {
      console.warn('Could not store previous data:', error);
    }
  }

  getPreviousData() {
    if (typeof window === 'undefined') return null;
    
    try {
      const previous = localStorage.getItem('blockchair_zcash_previous');
      return previous ? JSON.parse(previous) : null;
    } catch {
      return null;
    }
  }

  isCacheExpired(timestamp: number) {
    return Date.now() - timestamp > this.cacheDuration;
  }

  // Force refresh and update cache
  async refreshData() {
    localStorage.removeItem('blockchair_zcash_stats');
    return await this.getZcashStats();
  }
}