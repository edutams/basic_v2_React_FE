import React from 'react';
import { Card, CardContent, Typography, Box, Stack, useTheme } from '@mui/material';
import PropTypes from 'prop-types';

const AgentSubAgentsCard = ({ title, value, icon: Icon, bgcolor, iconBgColor }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <Card
      sx={{
        backgroundColor: isDarkMode ? 'rgba(44, 168, 127, 0.1)' : (bgcolor || '#E8F2F3'),
        height: '100%',
        borderRadius: '12px',
        boxShadow: 'none',
        border: `1px solid ${isDarkMode ? theme.palette.divider : 'rgba(0,0,0,0.05)'}`,
      }}
    >
      <CardContent sx={{ p: '24px !important', height: '100%', display: 'flex', alignItems: 'center' }}>
        <Stack direction="row" spacing={4} alignItems="center" justifyContent="center" sx={{ width: '100%' }}>
          {Icon && (
            <Box
              sx={{
                backgroundColor: iconBgColor || '#2ca87f',
                borderRadius: '8px',
                width: 56,
                height: 56,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon width="32" height="32" color="white" />
            </Box>
          )}
          <Box>
            <Typography variant="h1" fontWeight="700" sx={{ color: theme.palette.text.primary, fontSize: '48px', lineHeight: 1 }}>
              {value}
            </Typography>
            <Typography variant="h6" fontWeight="600" sx={{ color: theme.palette.text.primary, mt: 0.5, opacity: 0.9 }}>
              {title}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

AgentSubAgentsCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.elementType,
  bgcolor: PropTypes.string,
  iconBgColor: PropTypes.string,
};

export default AgentSubAgentsCard;
