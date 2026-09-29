import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import { IconRefresh } from '@tabler/icons-react';

// "3s ago" / "2m ago" — lightweight relative-time label, no date library needed.
function timeAgo(date) {
  if (!date) return '';
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

// Pulsing "Live · updated Xs ago" indicator + manual refresh button, paired
// with a page's silent-polling fetch (see calendar / subscriptions pages).
const LiveStatusBar = ({ loading, lastUpdated, onRefresh }) => {
  const [, forceTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => forceTick((n) => n + 1), 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Box
          sx={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            bgcolor: 'success.main',
            animation: 'pulse 2s infinite',
            '@keyframes pulse': {
              '0%': { opacity: 1 },
              '50%': { opacity: 0.35 },
              '100%': { opacity: 1 },
            },
          }}
        />
        <Typography sx={{ fontSize: '11px', color: 'text.secondary' }}>
          {loading ? 'Updating…' : `Live · updated ${timeAgo(lastUpdated)}`}
        </Typography>
      </Box>
      <Tooltip title="Refresh now">
        <IconButton size="small" onClick={onRefresh} disabled={loading}>
          <IconRefresh size={16} />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default LiveStatusBar;
