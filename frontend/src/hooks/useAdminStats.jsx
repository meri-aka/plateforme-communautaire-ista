import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

export default function useAdminStats() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchStats = useCallback(() => {
    setLoading(true);
    api.get('/admin/stats')
      .then(res => setStats(res.data))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  return { stats, loading, error, fetchStats };
}