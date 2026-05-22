import React from 'react';
import { Box, Paper, Typography, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Description as DescriptionIcon,
  CreditCard as CreditCardIcon,
} from '@mui/icons-material';

const ActionCard = ({ amount, dueLabel, onPay, onViewLetter }) => {
  const theme = useTheme();
  return (
    <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
      <Box sx={{ background: `linear-gradient(90deg,#15161a 0%,${theme.palette.primary.main} 100%)`, p: 2, color: '#fff' }}>
        <Typography variant="caption" sx={{ opacity: 0.85, textTransform: 'uppercase', letterSpacing: 1 }}>
          Action Required
        </Typography>
        <Typography variant="h5" fontWeight={800} mt={0.5}>₦{amount?.toLocaleString()}</Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>{dueLabel}</Typography>
      </Box>
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Button variant="contained" fullWidth startIcon={<CreditCardIcon />} onClick={onPay}
          sx={{ fontWeight: 700, py: 1.25, borderRadius: 2 }}>
          Pay acceptance fee
        </Button>
        <Button variant="outlined" fullWidth startIcon={<DescriptionIcon />} onClick={onViewLetter}
          sx={{ fontWeight: 600, py: 1.25, borderRadius: 2 }}>
          View admission letter
        </Button>
      </Box>
    </Paper>
  );
};

export default ActionCard;
