import React from 'react';
import { Card, CardContent, Typography, Box, Stack, useTheme } from '@mui/material';
import PropTypes from 'prop-types';
import { IconChartBar } from '@tabler/icons-react';

const LoginActivitiesCard = ({ title, activities, onIconClick }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <Card
      sx={{
        backgroundColor: theme.palette.background.paper,
        height: '100%',
        borderRadius: '12px',
        boxShadow: 'none',
        border: `1px solid ${isDarkMode ? theme.palette.divider : 'rgba(0,0,0,0.05)'}`,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <CardContent sx={{ p: '24px !important', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
          <Typography variant="subtitle2" fontWeight="600" sx={{ color: isDarkMode ? '#fff' : '#1E3A5F' }}>
            {title}
          </Typography>
          <Box 
            onClick={onIconClick}
            sx={{ 
              bgcolor: isDarkMode ? theme.palette.grey[800] : '#454545', 
              p: 0.5, 
              borderRadius: '4px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              cursor: 'pointer',
              '&:hover': { bgcolor: isDarkMode ? theme.palette.grey[700] : '#333' }
            }}
          >
            <IconChartBar size={20} color="white" />
          </Box>
        </Box>

        <Stack spacing={2.5} sx={{ px: 2 }}>
          {activities.map((activity, index) => (
            <Stack key={index} direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h5" fontWeight="500" sx={{ color: theme.palette.text.primary, fontSize: '20px' }}>
                {activity.label}:
              </Typography>
              <Typography variant="h5" fontWeight="600" sx={{ color: isDarkMode ? '#ff6b6b' : '#ff4d4d', fontSize: '20px' }}>
                {activity.value}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
};

LoginActivitiesCard.propTypes = {
  title: PropTypes.string.isRequired,
  activities: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    })
  ).isRequired,
  onIconClick: PropTypes.func,
};

export default LoginActivitiesCard;
