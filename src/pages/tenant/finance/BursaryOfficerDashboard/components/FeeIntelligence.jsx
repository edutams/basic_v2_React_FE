import React from 'react';
import { Box, Typography, Stack, Divider, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Insights, Description, TaskAlt, Grade } from '@mui/icons-material';
import SectionCard from './SectionCard';
import { formatCurrency } from '../constants';

/**
 * Fee Intelligence — list of fee types with collected amount and label.
 */
const FeeIntelligence = ({ fee_intelligence = [], onClick }) => {
  const theme = useTheme();
  const feeIcons = [Description, TaskAlt, Grade];
  const feeColors = [
    theme.palette.secondary.main,
    theme.palette.info.main,
    theme.palette.warning.main,
  ];

  return (
    <SectionCard icon={Insights} title="Fee Intelligence" color={theme.palette.info.main} onClick={onClick}>
      <Stack spacing={2}>
        {fee_intelligence.map((fee, i) => {
          const Icon = feeIcons[i % feeIcons.length];
          return (
            <Box key={i}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha(feeColors[i % feeColors.length], 0.12),
                    color: feeColors[i % feeColors.length],
                  }}
                >
                  <Icon sx={{ fontSize: 17 }} />
                </Box>
                <Typography variant="body2" fontWeight={700} noWrap sx={{ flex: 1, minWidth: 0 }}>
                  {fee.name}
                </Typography>
                <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                  <Typography variant="subtitle2" fontWeight={800} whiteSpace="nowrap">
                    {formatCurrency(fee.collected)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {fee.label}
                  </Typography>
                </Box>
              </Box>
              {i < fee_intelligence.length - 1 && <Divider sx={{ mt: 2 }} />}
            </Box>
          );
        })}
      </Stack>
    </SectionCard>
  );
};

export default FeeIntelligence;
