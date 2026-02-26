import React from 'react';
import { Card, CardContent, Typography, Box, Stack } from '@mui/material';
import PropTypes from 'prop-types';

const DashboardStatCard = ({ title, value, subtitle, icon: Icon, bgcolor, color = 'white', iconBgColor }) => {
  return (
    <Card
      sx={{
        backgroundColor: bgcolor || 'primary.main',
        color: color,
        height: '100%',
      }}
    >
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
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
            <Typography variant="subtitle1" fontWeight="500" sx={{ opacity: 0.9 }}>
              {title}
            </Typography>
            <Typography variant="h3" fontWeight="700" mt={1}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="subtitle2" sx={{ opacity: 0.7, mt: 0.5 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
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
};

export default DashboardStatCard;
