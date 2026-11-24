import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import ParentCard from '@/components/shared/ParentCard';
import { IconBulb, IconCircleCheck } from '@tabler/icons';

// Shared "Key Insights" card — reused by every report tab across both
// Income & Expenditure and Balance Sheet (Account Summary, Asset Details,
// Trend & Analysis, etc. all show the same bulleted-checkmark style, just
// different copy). `layout="row"` lays items out as a wrapping horizontal
// strip instead of a vertical list, matching the full-width summary tabs
// (Balance Sheet, Trend & Analysis) rather than the narrower right-rail
// placement the other tabs use.
const InsightsCard = ({ title = 'Key Insights', items, layout = 'column' }) => {
  const theme = useTheme();
  return (
    <ParentCard
      title={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconBulb size={18} color="#D97706" />
          <Typography sx={{ fontWeight: 700, fontSize: 15.5 }}>{title}</Typography>
        </Box>
      }
      sx={{
        '& .MuiCardHeader-root': { pb: 0.5, pt: 1.75, px: 2 },
        '& .MuiCardContent-root': { p: 2, '&:last-child': { pb: 2 } },
      }}
    >
      <Box
        sx={
          layout === 'row'
            ? { display: 'flex', flexWrap: 'wrap', gap: 2.5 }
            : { display: 'flex', flexDirection: 'column', gap: 1 }
        }
      >
        {items.map((text) => (
          <Box
            key={text}
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1,
              ...(layout === 'row' && { flex: '1 1 220px', minWidth: 220 }),
            }}
          >
            <IconCircleCheck size={15} color="#16A34A" style={{ marginTop: 2, flexShrink: 0 }} />
            <Typography sx={{ fontSize: 12.5, color: theme.palette.text.primary }}>{text}</Typography>
          </Box>
        ))}
      </Box>
    </ParentCard>
  );
};

export default InsightsCard;
