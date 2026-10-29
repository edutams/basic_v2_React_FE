import { useEffect, useState } from 'react';
import { Box, Skeleton, Typography } from '@mui/material';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';

// Renders a screenshot referenced from markdown (`![caption](path)`) by
// fetching it through the gated docs-image endpoint — a plain <img src>
// can't carry the Authorization/X-Tenant-ID headers that endpoint needs.
// Until a real screenshot exists at that path, the fetch 404s and this
// shows a clear "screenshot pending" placeholder using the image's own
// alt text as the caption, so content can be written and reviewed before
// any screenshots are captured — swapping in the real file later needs
// no content change at all.
const DocImage = ({ src, alt, fetchImage }) => {
  const [state, setState] = useState('loading'); // 'loading' | 'ready' | 'missing'
  const [objectUrl, setObjectUrl] = useState(null);

  useEffect(() => {
    let cancelled = false;
    let url = null;
    setState('loading');

    fetchImage(src)
      .then((blob) => {
        if (cancelled) return;
        url = URL.createObjectURL(blob);
        setObjectUrl(url);
        setState('ready');
      })
      .catch(() => {
        if (!cancelled) setState('missing');
      });

    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [src, fetchImage]);

  if (state === 'loading') {
    return <Skeleton variant="rounded" width="100%" height={220} sx={{ my: 2, borderRadius: 2 }} />;
  }

  if (state === 'missing') {
    return (
      <Box
        sx={{
          my: 2,
          p: 3,
          borderRadius: 2,
          border: '1px dashed',
          borderColor: '#FBBF24',
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(217,119,6,0.1)' : '#FFFBEB'),
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 1,
        }}
      >
        <ImageOutlinedIcon sx={{ fontSize: 32, color: '#D97706' }} />
        <Typography variant="body2" fontWeight={700} sx={{ color: '#B45309' }}>
          Screenshot pending
        </Typography>
        {alt && (
          <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 420 }}>
            {alt}
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Box
      component="img"
      src={objectUrl}
      alt={alt || ''}
      sx={{
        display: 'block',
        maxWidth: '100%',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        my: 2,
      }}
    />
  );
};

export default DocImage;
