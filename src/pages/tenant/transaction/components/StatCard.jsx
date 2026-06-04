import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, Box, Typography } from '@mui/material';

const StatCard = ({
  title,
  value,
  icon: Icon,
  color = '#4A3AFF',
  lightColor = '#EEF2FF',
  onClick,
  sx = {},
}) => {
  return (
    <Card
      onClick={onClick}
      sx={{
        borderRadius: '18px',
        bgcolor: '#F7F8FA',
        boxShadow: '0px 8px 20px rgba(0,0,0,0.04)',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',

        '&:hover': {
          boxShadow: '0px 12px 30px rgba(0,0,0,0.08)',
        },

        ...sx,
      }}
    >
      <CardContent
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          width: '100%',
        }}
      >
        {/* Icon */}
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            bgcolor: lightColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {Icon && <Icon size={22} color={color} stroke={2} />}
        </Box>

        {/* Content */}
        <Box>
          <Typography
            sx={{
              fontSize: 22,
              fontWeight: 700,
              color,
              lineHeight: 1.2,
            }}
          >
            {value}
          </Typography>

          <Typography
            sx={{
              fontSize: 13,
              color: '#9D9D9D',
              mt: 0.5,
            }}
          >
            {title}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]).isRequired,
  icon: PropTypes.elementType,
  color: PropTypes.string,
  lightColor: PropTypes.string,
  onClick: PropTypes.func,
  sx: PropTypes.object,
};

export default StatCard;