import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import ParentCard from '@/components/shared/ParentCard';
import { IconTarget, IconChevronRight, IconDatabase, IconChartBar, IconCalendar } from '@tabler/icons';

const ICONS = { database: IconDatabase, chart: IconChartBar, calendar: IconCalendar };

// Account Summary tab's "Actions & Next Steps" card — a clickable punch
// list, visually distinct from InsightsCard (purple header, chevron rows)
// since it reads as actionable rather than informational.
const ActionsCard = ({ items }) => {
  const theme = useTheme();
  return (
    <ParentCard
      title={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconTarget size={18} color="#7C3AED" />
          <Typography sx={{ fontWeight: 700, fontSize: 15.5 }}>Actions &amp; Next Steps</Typography>
        </Box>
      }
      sx={{
        '& .MuiCardHeader-root': { pb: 0.5, pt: 1.75, px: 2 },
        '& .MuiCardContent-root': { p: 1, '&:last-child': { pb: 1 } },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {items.map((action) => {
          const Icon = ICONS[action.icon] || IconDatabase;
          return (
            <Box
              key={action.title}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                p: 1,
                borderRadius: '8px',
                cursor: 'pointer',
                '&:hover': { bgcolor: theme.palette.action.hover },
              }}
            >
              <Box
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: '8px',
                  bgcolor: '#F3E8FF',
                  color: '#7C3AED',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon size={15} />
              </Box>
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 700, fontSize: 12.5 }}>{action.title}</Typography>
                {action.description && (
                  <Typography sx={{ fontSize: 11.5, color: 'text.secondary' }}>{action.description}</Typography>
                )}
              </Box>
              <IconChevronRight size={16} color={theme.palette.text.disabled} />
            </Box>
          );
        })}
      </Box>
    </ParentCard>
  );
};

export default ActionsCard;
