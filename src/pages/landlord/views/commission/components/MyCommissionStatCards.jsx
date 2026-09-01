import React from 'react';
import { Box, useTheme, Paper, Typography, Button } from '@mui/material';
import {
  IconAdjustments,
  IconChartBar,
} from '@tabler/icons-react';

const schemeMap = [
  { bg: '#DBEAFE', color: '#2563EB' },
  { bg: '#DCFCE7', color: '#16A34A' },
  { bg: '#F3E8FF', color: '#9333EA' },
  { bg: '#FEF3C7', color: '#D97706' },
  { bg: '#FEE2E2', color: '#DC2626' },
];

const MyCommissionStatCards = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const s0 = schemeMap[0];
  const s1 = schemeMap[1];
  const s2 = schemeMap[2];
  const s3 = schemeMap[3];

  return (
    <Box sx={{ mb: 3 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(4,1fr)' },
          gap: 2,
          mb: 3,
        }}
      >
        {/* GUPSA Ogun State Card */}
        <Paper
          sx={{
            p: '14px',
            borderRadius: '14px',
            border: '1px solid',
            borderColor: isDarkMode ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
            bgcolor: isDarkMode ? theme.palette.background.paper : '#ffffff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            transition: 'transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              borderColor: '#94a3b8',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
            },
          }}
        >
          <Typography variant="h6" fontWeight={600} mb={2}>
            GUPSA Ogun State
          </Typography>

          <Box
            sx={{
              bgcolor: isDarkMode ? 'rgba(255,255,255,0.08)' : s0.bg,
              borderRadius: '8px',
              px: 3,
              py: 1,
              display: 'inline-block',
              mb: 1,
            }}
          >
            <Typography
              sx={{
                fontSize: 20,
                fontWeight: 700,
                color: isDarkMode ? '#fff' : s0.color,
              }}
            >
              ₦7,000,234.00
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Box
              fontWeight="600"
              sx={{
                bgcolor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#F3F4F6',
                color: isDarkMode ? '#fff' : s0.color,
                px: 2,
                py: '4px',
                borderRadius: '5px',
                fontSize: 10,
              }}
            >
              Account Number
            </Box>

            <Typography fontSize={15} fontWeight={800}>
              93458438484
            </Typography>
          </Box>

          <Typography fontWeight="500" sx={{ mb: 1 }}>
            Bank : Globus
          </Typography>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<IconAdjustments size={16} />}
              sx={{
                borderColor: isDarkMode ? 'rgba(255,255,255,0.3)' : s0.color,
                color: isDarkMode ? '#fff' : s0.color,
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '8px',
                '&:hover': {
                  borderColor: s0.color,
                  backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : `${s0.bg}`,
                },
              }}
            >
              View Details
            </Button>

            <Button
              variant="contained"
              size="small"
              sx={{
                backgroundColor: `${s0.color} !important`,
                color: '#ffffff',
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '8px',
                '&:hover': {
                  opacity: 0.9,
                },
              }}
            >
              Withdraw
            </Button>
          </Box>
        </Paper>

        {/* Total Transaction Card */}
        <Paper
          sx={{
            p: '14px',
            borderRadius: '14px',
            border: '1px solid',
            borderColor: isDarkMode ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
            bgcolor: isDarkMode ? theme.palette.background.paper : '#ffffff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            transition: 'transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              borderColor: '#94a3b8',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
            },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Typography variant="h6" fontWeight={600}>
              Total Transaction
            </Typography>

            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                bgcolor: isDarkMode ? 'rgba(255,255,255,0.08)' : s1.bg,
                color: isDarkMode ? '#fff' : s1.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <IconChartBar size={18} color="currentColor" />
            </Box>
          </Box>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flex: 1,
              height: '100%',
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ color: isDarkMode ? '#fff' : s1.color }}>
                Inflow
              </Typography>
              <Typography sx={{ fontSize: 20, fontWeight: 500, color: isDarkMode ? '#fff' : s1.color }}>
                0
              </Typography>
            </Box>

            <Box
              sx={{
                width: '1px',
                height: 40,
                bgcolor: isDarkMode ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
              }}
            />

            <Box>
              <Typography variant="h6" sx={{ color: isDarkMode ? '#fff' : s3.color }}>
                Outflow
              </Typography>
              <Typography sx={{ fontSize: 20, fontWeight: 500, color: isDarkMode ? '#fff' : s3.color }}>
                0
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Total Sub Orgs Card */}
        <Paper
          sx={{
            p: '14px',
            borderRadius: '14px',
            border: '1px solid',
            borderColor: isDarkMode ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
            bgcolor: isDarkMode ? theme.palette.background.paper : '#ffffff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            transition: 'transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              borderColor: '#94a3b8',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
            },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Typography variant="h6" fontWeight={600}>
              Total Sub Orgs
            </Typography>

            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                bgcolor: isDarkMode ? 'rgba(255,255,255,0.08)' : s2.bg,
                color: isDarkMode ? '#fff' : s2.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <IconChartBar size={18} color="currentColor" />
            </Box>
          </Box>

          <Box
            sx={{
              bgcolor: isDarkMode ? 'rgba(255,255,255,0.08)' : s2.bg,
              borderRadius: '8px',
              px: 3,
              py: 1,
              display: 'inline-flex',
              alignItems: 'center',
              mb: 4,
            }}
          >
            <Typography
              sx={{
                fontSize: 20,
                fontWeight: 700,
                color: isDarkMode ? '#fff' : s2.color,
              }}
            >
              0
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box>
              <Typography variant="h6" color="text.primary">
                Level 3
              </Typography>
              <Typography sx={{ fontSize: 20, fontWeight: 500 }}>
                0
              </Typography>
            </Box>

            <Box
              sx={{
                width: '1px',
                height: 40,
                bgcolor: isDarkMode ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
              }}
            />

            <Box>
              <Typography variant="h6" color="text.primary">
                Level 4
              </Typography>
              <Typography sx={{ fontSize: 20, fontWeight: 500 }}>
                0
              </Typography>
            </Box>

            <Box
              sx={{
                width: '1px',
                height: 40,
                bgcolor: isDarkMode ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
              }}
            />

            <Box>
              <Typography variant="h6" color="text.primary">
                Level 5
              </Typography>
              <Typography sx={{ fontSize: 20, fontWeight: 500 }}>
                0
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Total School Card */}
        <Paper
          sx={{
            p: '14px',
            borderRadius: '14px',
            border: '1px solid',
            borderColor: isDarkMode ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
            bgcolor: isDarkMode ? theme.palette.background.paper : '#ffffff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            transition: 'transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              borderColor: '#94a3b8',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
            },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Typography variant="h6" fontWeight={600}>
              Total School
            </Typography>

            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                bgcolor: isDarkMode ? 'rgba(255,255,255,0.08)' : s3.bg,
                color: isDarkMode ? '#fff' : s3.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <IconChartBar size={18} color="currentColor" />
            </Box>
          </Box>

          <Box
            sx={{
              bgcolor: isDarkMode ? 'rgba(255,255,255,0.08)' : s3.bg,
              borderRadius: '8px',
              px: 3,
              py: 1,
              display: 'inline-flex',
              alignItems: 'center',
              mb: 4,
            }}
          >
            <Typography
              sx={{
                fontSize: 20,
                fontWeight: 700,
                color: isDarkMode ? '#fff' : s3.color,
              }}
            >
              0
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box>
              <Typography variant="h6" color="text.primary">
                Primary School
              </Typography>
              <Typography sx={{ fontSize: 20, fontWeight: 500 }}>
                0
              </Typography>
            </Box>

            <Box
              sx={{
                width: '1px',
                height: 40,
                bgcolor: isDarkMode ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
              }}
            />

            <Box>
              <Typography variant="h6" color="text.primary">
                Secondary School
              </Typography>
              <Typography sx={{ fontSize: 20, fontWeight: 500 }}>
                0
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default MyCommissionStatCards;
