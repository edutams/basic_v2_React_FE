import React from 'react';
import { Box, Typography, Paper, Stack, Button, useTheme } from '@mui/material';
import { CampaignOutlined, ArrowForward } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const defaultAnnouncements = [
  {
    id: 1,
    title: 'Mid-Term Break',
    content: 'School will be closed from 20th – 24th May 2025 for mid-term break.',
    date: 'May 12, 2025',
    color: '#2563eb',
    bg: '#eff6ff',
  },
  {
    id: 2,
    title: 'PTA Meeting',
    content: 'PTA meeting holds on Saturday, 17th May 2025 at 10:00 AM in the school hall.',
    date: 'May 10, 2025',
    color: '#16a34a',
    bg: '#dcfce7',
  },
];

/**
 * Announcements Card Component
 */
const AnnouncementsCard = ({ announcements = defaultAnnouncements, onViewAllAnnouncements }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Paper
      elevation={0}
      sx={{
        p: 1,
        borderRadius: '14px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: isDark ? theme.palette.background.paper : '#ffffff',
        border: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0',
        boxShadow: '0 2px 4px rgba(15, 23, 42, 0.04)',
      }}
    >
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1.5, flexShrink: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CampaignOutlined sx={{ fontSize: 18, color: '#16a34a' }} />
            <Typography
              sx={{
                fontSize: '11px',
                fontWeight: 800,
                color: isDark ? 'rgba(255,255,255,0.6)' : '#64748b',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              ANNOUNCEMENTS
            </Typography>
          </Box>
          <Button
            size='small'
            onClick={() => (onViewAllAnnouncements ? onViewAllAnnouncements() : navigate('/communications/broadcast-messaging'))}
            endIcon={<ArrowForward sx={{ fontSize: '14px !important' }} />}
            sx={{ fontSize: '12px' }}
          >
            View All
          </Button>
        </Box>

        {/* Announcement items list */}
        <Stack spacing={0} sx={{ flex: 1, minHeight: 0, overflowY: 'auto', '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: '#d1d5db', borderRadius: 4 } }}>
          {announcements.map((item, index) => (
            <Stack
              key={item.id}
              direction="row"
              spacing={1.25}
              alignItems="flex-start"
              sx={{
                py: 1.25,
                borderBottom: index < announcements.length - 1 ? '1px solid' : 'none',
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '8px',
                  bgcolor: isDark ? 'rgba(255,255,255,0.08)' : item.bg,
                  color: isDark ? '#ffffff' : item.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  mt: 0.25,
                }}
              >
                <CampaignOutlined sx={{ fontSize: 18 }} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: '12.5px', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', lineHeight: 1.2 }}>
                  {item.title}
                </Typography>
                <Typography sx={{ fontSize: '11px', color: isDark ? 'rgba(255,255,255,0.65)' : '#475569', lineHeight: 1.3, mt: 0.25 }}>
                  {item.content}
                </Typography>
                <Typography sx={{ fontSize: '10px', fontWeight: 600, color: '#94a3b8', mt: 0.5 }}>
                  {item.date}
                </Typography>
              </Box>
            </Stack>
          ))}
        </Stack>
      </Box>
    </Paper>
  );
};

export default AnnouncementsCard;
