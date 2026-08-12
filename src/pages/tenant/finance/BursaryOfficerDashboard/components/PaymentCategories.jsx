import React from 'react';
import { Box, Typography, Stack, Avatar, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Groups } from '@mui/icons-material';
import SectionCard from './SectionCard';
import { formatCurrency } from '../constants';

/**
 * Payment Categories — list of categories with amount and share of total.
 */
const PaymentCategories = ({ payment_categories = [] }) => {
  const theme = useTheme();
  const catColors = [
    theme.palette.info.main,
    theme.palette.success.main,
    theme.palette.secondary.main,
    theme.palette.warning.main,
  ];
  const catIcons = [Groups, Groups, Groups, Groups];

  return (
    <SectionCard
      icon={Groups}
      title="Payment Categories"
      color={theme.palette.secondary.main}
    >
      <Stack spacing={2} sx={{ flexGrow: 1 }}>
        {payment_categories.map((cat, i) => {
          const CatIcon = catIcons[i % catIcons.length];
          return (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: alpha(catColors[i % catColors.length], 0.12),
                  color: catColors[i % catColors.length],
                  fontSize: 12.5,
                }}
              >
                <CatIcon sx={{ fontSize: 17 }} />
              </Avatar>
              <Typography variant="body2" fontWeight={700} noWrap sx={{ flex: 1, minWidth: 0 }}>
                {cat.category}
              </Typography>
              <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                <Typography variant="subtitle2" fontWeight={800} whiteSpace="nowrap">
                  {formatCurrency(cat.amount)}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  {cat.percentage}% of total
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Stack>
    </SectionCard>
  );
};

export default PaymentCategories;
