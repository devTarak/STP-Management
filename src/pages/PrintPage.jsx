import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import api from '@/config/api';

export default function PrintPage() {
  const { id } = useParams();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const res = await api.get(`students/${id}/print`, {
          headers: { Authorization: `Bearer ${token}`, Accept: 'text/html' },
          responseType: 'text',
        });
        if (cancelled) return;
        document.open();
        document.write(res.data);
        document.close();
      } catch {
        if (!cancelled) {
          document.open();
          document.write('<h2>Failed to load print page. Please try again.</h2>');
          document.close();
        }
      }
    })();

    return () => { cancelled = true; };
  }, [id]);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress />
    </Box>
  );
}
