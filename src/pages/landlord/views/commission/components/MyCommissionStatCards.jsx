import React from 'react';
import { Box, useTheme, Paper, Typography, Button } from '@mui/material';
import {
  IconAdjustments,
  IconChartBar,
} from '@tabler/icons-react';
import { getStatCardColor } from '@/utils/statCardColors';

const MyCommissionStatCards = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const statColor0 = getStatCardColor(null, 0, isDarkMode, theme); // Primary
  const statColor1 = getStatCardColor(null, 1, isDarkMode, theme); // Success
  const statColor2 = getStatCardColor(null, 2, isDarkMode, theme); // Info
  const statColor3 = getStatCardColor(null, 3, isDarkMode, theme); // Warning

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
            p: 3,
            borderRadius: '16px',
            border: isDarkMode
              ? '1px solid rgba(255, 255, 255, 0.12)'
              : `1px solid ${statColor0.borderColor}`,
            background: isDarkMode ? theme.palette.background.paper : `${statColor0.cardBg} !important`,
            boxShadow: isDarkMode
              ? '0 6px 24px rgba(0,0,0,0.28)'
              : '0 4px 20px rgba(0,0,0,0.07)',
          }}
        >
          {/* Header */}
          <Typography variant="h6" fontWeight={600} mb={2}>
            GUPSA Ogun State
          </Typography>

          {/* Amount */}
          <Box
            sx={{
              background: `${statColor0.valueBg} !important`,
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
                color: statColor0.accentColor,
              }}
            >
              ₦7,000,234.00
            </Typography>
          </Box>

          {/* Account Number */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Box
              fontWeight="600"
              sx={{
                background: isDarkMode ? 'rgba(255,255,255,0.1)' : statColor0.borderColor,
                color: statColor0.accentColor,
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

          {/* Bank */}
          <Typography fontWeight="500" sx={{ mb: 1 }}>
            Bank : Globus
          </Typography>

          {/* Actions */}
          <Box
            sx={{
              display: 'flex',
              gap: 1,
            }}
          >
            <Button
              variant="outlined"
              size="small"
              startIcon={<IconAdjustments size={16} />}
              sx={{
                borderColor: statColor0.accentColor,
                color: statColor0.accentColor,
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '8px',
                '&:hover': {
                  borderColor: statColor0.accentColor,
                  backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(109, 40, 217, 0.08)',
                },
              }}
            >
              View Details
            </Button>

            <Button
              variant="contained"
              size="small"
              sx={{
                backgroundColor: `${statColor0.accentColor} !important`,
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
            p: 3,
            borderRadius: '16px',
            border: isDarkMode
              ? '1px solid rgba(255, 255, 255, 0.12)'
              : `1px solid ${statColor1.borderColor}`,
            background: isDarkMode ? theme.palette.background.paper : `${statColor1.cardBg} !important`,
            boxShadow: isDarkMode
              ? '0 6px 24px rgba(0,0,0,0.28)'
              : '0 4px 20px rgba(0,0,0,0.07)',
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
                borderRadius: '6px',
                background: `${statColor1.iconBg} !important`,
                boxShadow: isDarkMode
                  ? '0 4px 12px rgba(0,0,0,0.3)'
                  : `0 4px 14px ${statColor1.iconGlow}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <IconChartBar size={18} color={statColor1.iconColor || '#FFFFFF'} />
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
              <Typography variant="h6" sx={{ color: statColor1.accentColor }}>
                Inflow
              </Typography>
              <Typography sx={{ fontSize: 20, fontWeight: 500, color: statColor1.accentColor }}>
                0
              </Typography>
            </Box>

            <Box
              sx={{
                width: '1px',
                height: 40,
                background: statColor1.borderColor,
              }}
            />

            <Box>
              <Typography variant="h6" sx={{ color: statColor3.accentColor }}>
                Outflow
              </Typography>
              <Typography sx={{ fontSize: 20, fontWeight: 500, color: statColor3.accentColor }}>
                0
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Total Sub Orgs Card */}
        <Paper
          sx={{
            p: 3,
            borderRadius: '16px',
            border: isDarkMode
              ? '1px solid rgba(255, 255, 255, 0.12)'
              : `1px solid ${statColor2.borderColor}`,
            background: isDarkMode ? theme.palette.background.paper : `${statColor2.cardBg} !important`,
            boxShadow: isDarkMode
              ? '0 6px 24px rgba(0,0,0,0.28)'
              : '0 4px 20px rgba(0,0,0,0.07)',
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
                borderRadius: '6px',
                background: `${statColor2.iconBg} !important`,
                boxShadow: isDarkMode
                  ? '0 4px 12px rgba(0,0,0,0.3)'
                  : `0 4px 14px ${statColor2.iconGlow}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <IconChartBar size={18} color={statColor2.iconColor || '#FFFFFF'} />
            </Box>
          </Box>

          <Box
            sx={{
              background: `${statColor2.valueBg} !important`,
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
                color: statColor2.accentColor,
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
                background: statColor2.borderColor,
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
                background: statColor2.borderColor,
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
            p: 3,
            borderRadius: '16px',
            border: isDarkMode
              ? '1px solid rgba(255, 255, 255, 0.12)'
              : `1px solid ${statColor3.borderColor}`,
            background: isDarkMode ? theme.palette.background.paper : `${statColor3.cardBg} !important`,
            boxShadow: isDarkMode
              ? '0 6px 24px rgba(0,0,0,0.28)'
              : '0 4px 20px rgba(0,0,0,0.07)',
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
                borderRadius: '6px',
                background: `${statColor3.iconBg} !important`,
                boxShadow: isDarkMode
                  ? '0 4px 12px rgba(0,0,0,0.3)'
                  : `0 4px 14px ${statColor3.iconGlow}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <IconChartBar size={18} color={statColor3.iconColor || '#FFFFFF'} />
            </Box>
          </Box>

          <Box
            sx={{
              background: `${statColor3.valueBg} !important`,
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
                color: statColor3.accentColor,
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
                background: statColor3.borderColor,
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
