import React from 'react';
import { Card, CardContent, Typography, Box, Stack } from '@mui/material';
import PropTypes from 'prop-types';

const DashboardStatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  bgcolor, 
  color = 'white', 
  iconBgColor,
  rightContent 
}) => {
  return (
    <Card
      sx={{
        backgroundColor: bgcolor || 'primary.main',
        color: color,
        height: '100%',
        borderRadius: '12px',
        boxShadow: 'none',
        border: '1px solid rgba(0,0,0,0.05)',
      }}
    >
      <CardContent sx={{ p: '24px !important' }}>
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={2} alignItems="center" sx={{ flexGrow: 1 }}>
            <Box>
               {Icon && (
                <Box
                  sx={{
                    backgroundColor: iconBgColor || 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    width: 48,
                    height: 48,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                  }}
                >
                  <Icon width="24" height="24" />
                </Box>
              )}
              
              <Stack direction="row" alignItems="flex-end" spacing={1}>
                <Typography variant="h1" fontWeight="700" sx={{ lineHeight: 1 }}>
                  {value}
                </Typography>
                {subtitle && (
                  <Typography variant="subtitle1" sx={{ opacity: 0.8, fontSize: '14px', lineHeight: 1, pb: '4px' }}>
                    {subtitle}
                  </Typography>
                )}
              </Stack>
              
              <Typography variant="subtitle2" fontWeight="400" sx={{ opacity: 0.7, mt: 1, textAlign: 'right', display: 'block', width: '100%' }}>
                {title}
              </Typography>
            </Box>
          </Stack>

          {rightContent && (
            <Stack direction="row" spacing={3} alignItems="center">
              <Box sx={{ width: '1px', height: '60px', bgcolor: 'rgba(0,0,0,0.1)' }} />
              <Box>
                {rightContent}
              </Box>
            </Stack>
          )}

          {!rightContent && !subtitle && (
            <Typography variant="subtitle2" sx={{ opacity: 0.7, position: 'absolute', top: 24, right: 24 }}>
              {title}
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

DashboardStatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  subtitle: PropTypes.string,
  icon: PropTypes.elementType,
  bgcolor: PropTypes.string,
  color: PropTypes.string,
  iconBgColor: PropTypes.string,
  rightContent: PropTypes.node,
};

export default DashboardStatCard;
