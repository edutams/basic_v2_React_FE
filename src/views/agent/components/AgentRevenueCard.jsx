import React from 'react';
import { Card, CardContent, Typography, Box, Stack, Divider, useTheme } from '@mui/material';
import PropTypes from 'prop-types';
import { IconChartBar, IconWallet } from '@tabler/icons-react';

const AgentRevenueCard = ({ title, value, icon: Icon, commission, volume, onClick }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Card
      onClick={onClick}
      sx={{
        backgroundColor: isDark ? 'hsl(142, 100%, 98%)' : 'hsl(142, 100%, 98%)',
        height: '100%',
        borderRadius: '12px',
        boxShadow: 'none',
        border: isDark ? '1px solid #333' : '1px solid rgba(0,0,0,0.05)',
        position: 'relative',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? { transform: 'scale(1.01)', transition: '0.2s' } : {},
      }}
    >
      <CardContent sx={{ p: '24px !important' }}>
        <Box
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}
        >
          {Icon && (
            <Box sx={{ color: '#00ACFF', p: 0.5 }}>
              <IconWallet size={35} color="#00ACFF" />
            </Box>
          )}
          <Box
            sx={{
              bgcolor: isDark ? '#333' : '#454545',
              p: 0.5,
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconChartBar size={20} color="white" />
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h2"
            fontWeight="700"
            sx={{ color: theme.palette.mode === 'dark' ? '#1E3A5F' : '#1E3A5F', fontSize: '32px', mb: 0.5 }}
          >
            # {value}
          </Typography>
          <Typography
            variant="subtitle2"
            sx={{ color: theme.palette.mode === 'dark' ? '#1E3A5F' : '#1E3A5F', fontWeight: 500, fontSize: '15px' }}
          >
            {title}
          </Typography>
        </Box>

        <Stack direction="row" spacing={2} alignItems="center">
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.mode === 'dark' ? '#fff' : '#1E3A5F',
                fontWeight: 700,
                display: 'block',
                mb: 0.5,
                width: 'fit-content',
              }}
            >
              Commission
            </Typography>
            <Box
              sx={{
                bgcolor: '#9c27b0',
                color: 'white',
                px: 2,
                py: 1,
                borderRadius: '50px',
                textAlign: 'center',
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                # {commission}
              </Typography>
            </Box>
          </Box>

          <Divider
            orientation="vertical"
            flexItem
            sx={{
              height: '40px',
              alignSelf: 'center',
              borderColor: isDark ? '#555' : '#E2E8F0',
              borderRightWidth: 2,
            }}
          />

          <Box sx={{ flex: 1 }}>
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.mode === 'dark' ? '#fff' : '#1E3A5F',
                fontWeight: 600,
                display: 'block',
                mb: 0.5,
                textAlign: 'center',
              }}
            >
              Volume
            </Typography>
            <Box
              sx={{
                bgcolor: '#4a6750',
                color: 'white',
                px: 2,
                py: 1,
                borderRadius: '50px',
                textAlign: 'center',
                
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {volume}
              </Typography>
            </Box>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

AgentRevenueCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.elementType,
  commission: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  volume: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default AgentRevenueCard;
