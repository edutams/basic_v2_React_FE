import React from 'react';
import { Paper, Avatar, Box, Typography, Stack, Chip, Button } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const EnrolledWardCard = ({ ward }) => (
  <Paper
    variant="outlined"
    sx={{ p: 2, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2 }}
  >
    <Avatar src={ward.avatar} sx={{ width: 40, height: 40 }}>
      {ward.name?.[0]}
    </Avatar>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography variant="subtitle2" fontWeight={700} noWrap>
        {ward.name}
      </Typography>
      <Stack direction="row" spacing={0.5} flexWrap="wrap" mt={0.3}>
        {ward.tags?.map((t) => (
          <Chip
            key={t}
            label={t}
            size="small"
            sx={{ fontSize: 10, bgcolor: '#E7F3D4', color: '#000000', fontWeight: 600 }}
          />
        ))}
      </Stack>
      <Typography variant="caption" color="text.secondary">
        {ward.regNo}
      </Typography>
    </Box>
    <Box sx={{ textAlign: 'left', flexShrink: 0 }}>
      <Box
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}
      >
        <Box>
          <Typography variant="caption" color="text.secondary" display="block">
            Compulsory: <strong>₦{ward.compulsory?.toLocaleString()}</strong>
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
            Optional: <strong>₦{ward.optional?.toLocaleString()}</strong>
          </Typography>
        </Box>

        <Box sx={{ textAlign: 'left' }}>
          <Typography variant="body2" fontWeight={700} sx={{ color: '#E28327' }}>
            Total Payable
          </Typography>

          <Box
            sx={{
              mt: 0.5,
              px: 1.5,
              bgcolor: '#C5A07A',
              color: '#fff',
              fontWeight: 700,
              borderRadius: '4px',
              display: 'inline-block',
              fontSize: '0.75rem',
            }}
          >
            ₦ {ward.total?.toLocaleString()}
          </Box>
        </Box>
      </Box>
    </Box>

    <Button
      size="small"
      endIcon={<ArrowForwardIcon />}
      sx={{ ml: 1, whiteSpace: 'nowrap', fontSize: '0.75rem' }}
    >
      View Details
    </Button>
  </Paper>
);

export default EnrolledWardCard;