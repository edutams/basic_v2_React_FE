import React from 'react';
import { Box, Card, Typography, Stack, Button, Skeleton } from '@mui/material';

const cardSx = {
  borderRadius: '8px',
  border: '1px solid',
  borderColor: 'grey.100',
  boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
  bgcolor: '#fff',
};

const CommunicationCenter = ({ loading = false }) => {
  if (loading) {
    return (
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} mb={2} alignItems="stretch">
        <Skeleton variant="rounded" height={160} sx={{ flex: 1, borderRadius: '8px' }} />
      </Stack>
    );
  }

  return (
  <Box mb={2}>
    {/* Weekly Report Ready */}
    <Card
      elevation={0}
      sx={{
        ...cardSx,
        p: '12px 14px',
        borderColor: '#BFDBFE',
        bgcolor: '#EFF6FF',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle decorative bar top-right */}
      <Box sx={{ position: 'absolute', top: 0, right: 0, width: 60, height: 60, borderRadius: '0 8px 0 60px', bgcolor: 'rgba(37,99,235,0.07)' }} />

      <Box>
        <Typography fontWeight="700" sx={{ fontSize: '0.88rem', color: '#1E40AF', mb: 0.4 }}>
          Weekly Report Ready
        </Typography>
        <Typography sx={{ fontSize: '0.68rem', color: '#3B82F6', lineHeight: 1.45, mb: 1.25 }}>
          Your weekly academic and attendance report is ready to view.
        </Typography>
      </Box>
      <Button
        variant="contained"
        size="small"
        disableElevation
        sx={{
          alignSelf: 'flex-start',
          bgcolor: '#2563EB',
          borderRadius: '7px',
          textTransform: 'none',
          fontSize: '0.73rem',
          fontWeight: 600,
          px: 1.75,
          py: 0.5,
          '&:hover': { bgcolor: '#1D4ED8' },
        }}
      >
        View Report
      </Button>
    </Card>

  </Box>
  );
};

export default CommunicationCenter;