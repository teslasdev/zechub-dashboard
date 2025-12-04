import { useState, useEffect } from 'react';
import { BlockChairService } from '../lib/blockchair-api';


export function useZcashStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const blockchairService = new BlockChairService();

    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await blockchairService.getZcashStats();
        
        if (mounted) {
          setStats(data);
        }
      } catch (err : any) {
        if (mounted) {
          setError(err.message);
          console.error('Failed to fetch Zcash stats:', err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchStats();

    // Set up interval for auto-refresh
    const interval = setInterval(fetchStats, 5 * 60 * 1000); // 5 minutes

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const refresh = async () => {
    const blockchairService = new BlockChairService();
    try {
      setLoading(true);
      const data = await blockchairService.refreshData();
      setStats(data);
    } catch (err : any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    stats,
    loading,
    error,
    refresh
  };
}