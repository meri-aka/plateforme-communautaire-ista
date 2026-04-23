import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function useAdminStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/admin/stats')
      .then(res => setStats(res.data))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, []);

  return { stats, loading, error };
}