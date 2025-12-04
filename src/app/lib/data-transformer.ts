export class DataTransformer {
  static formatMarketCap(usd: number) {
    if (usd >= 1e9) {
      return `$${(usd / 1e9).toFixed(2)}B`;
    } else if (usd >= 1e6) {
      return `$${(usd / 1e6).toFixed(2)}M`;
    }
    return `$${usd.toLocaleString()}`;
  }

  static formatCurrency(amount:  number | bigint) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  static formatNumber(num: number) {
    if (num >= 1e9) {
      return `${(num / 1e9).toFixed(2)}B`;
    } else if (num >= 1e6) {
      return `${(num / 1e6).toFixed(2)}M`;
    } else if (num >= 1e3) {
      return `${(num / 1e3).toFixed(1)}K`;
    }
    return num.toLocaleString();
  }

  static formatHashrate(hashrate: string) {
    const num = parseFloat(hashrate);
    if (num >= 1e12) {
      return `${(num / 1e12).toFixed(2)} TH/s`;
    } else if (num >= 1e9) {
      return `${(num / 1e9).toFixed(2)} GH/s`;
    } else if (num >= 1e6) {
      return `${(num / 1e6).toFixed(2)} MH/s`;
    }
    return `${num} H/s`;
  }

  static getMetricsFromStats(stats: { data: any; changes?: any; }) {
    if (!stats?.data) return [];

    const { data, changes } = stats;
    
    return [
      {
        title: "Market Cap",
        value: this.formatMarketCap(data.market_cap_usd),
        change: changes.market_cap_usd || 0,
        icon: require("../../assets/market_cap.png")
      },
      {
        title: "24h Transactions",
        value: data.transactions_24h?.toLocaleString() || "0",
        change: changes.transactions_24h || 0,
        icon: require("../../assets/transparency.png")
      },
      {
        title: "Market Price (USD)",
        value: this.formatCurrency(data.market_price_usd),
        change: changes.market_price_usd || 0,
        icon: require("../../assets/market_price.png")
      },
      {
        title: "24h Volume",
        value: this.formatMarketCap(data.volume_24h),
        change: changes.volume_24h || 0,
        icon: require("../../assets/shielded.png")
      },
      {
        title: "Market Price (BTC)",
        value: `₿${data.market_price_btc?.toFixed(8)}`,
        change: changes.market_price_usd || 0, // Use USD change as proxy
        icon: require("../../assets/market_price_btc.png")
      },
      {
        title: "Circulation",
        value: `${this.formatNumber(data.circulation)} ZEC`,
        change: 0, // Circulation change not provided
        icon: require("../../assets/circulation.png")
      },
      {
        title: "Blocks",
        value: data.blocks?.toLocaleString() || "0",
        change: changes.blocks_24h || 0,
        icon: require("../../assets/blocks.png")
      }
    ];
  }
}