import React from 'react';
import { Card, CardContent, Typography, Box, Stack, Divider, useTheme } from '@mui/material';
import PropTypes from 'prop-types';
import { IconChartBar } from '@tabler/icons-react';

const AgentSchoolCard = ({
  title,
  value,
  icon: Icon,
  bgcolor,
  iconBgColor,
  rightContent,
  onClick,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Card
      onClick={onClick}
      sx={{
        backgroundColor: isDark ? '#1e1e1e' : bgcolor || '#C9EBD2',
        height: '100%',
        borderRadius: '16px',
        boxShadow: 'none',
        border: isDark ? '1px solid #333' : 'none',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'visible',
        '&:hover': onClick ? { transform: 'scale(1.01)', transition: '0.2s' } : {},
      }}
    >
      <CardContent
        sx={{
          p: '24px !important',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        {/* Top Section */}
        <Box
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}
        >
          {Icon && (
            <Box
              sx={{
                backgroundColor: iconBgColor || '#2ca87f',
                borderRadius: '8px',
                width: 44,
                height: 44,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon width="24" height="24" color="white" />
            </Box>
          )}
          <Typography
            variant="h6"
            fontWeight="600"
            sx={{ color: isDark ? '#fff' : '#1a3353', fontSize: '15px', mt: 1 }}
          >
            Active School
          </Typography>
        </Box>

        {/* Main Content Row */}
        <Stack
          direction="row"
          spacing={3}
          alignItems="center"
          justifyContent="space-between"
          sx={{ position: 'relative' }}
        >
          {/* Left: Value & Title */}
          <Box sx={{ flex: 1.2 }}>
            <Typography
              variant="h1"
              fontWeight="800"
              sx={{ color: isDark ? '#fff' : '#1a3353', fontSize: '48px', lineHeight: 1, mb: 1 }}
            >
              {value}
            </Typography>
            <Typography
              variant="subtitle1"
              fontWeight="700"
              sx={{ color: isDark ? '#aaa' : '#1a3353', fontSize: '16px' }}
            >
              {title}
            </Typography>
          </Box>

          {/* Divider & Bottom Icon */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
              height: '80px',
            }}
          >
            <Divider
              orientation="vertical"
              flexItem
              sx={{ borderRightWidth: 3, borderColor: isDark ? '#555' : '#111', height: '100%' }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: -15,
                left: -40,
                bgcolor: isDark ? '#333' : '#454545',
                borderRadius: '6px',
                p: 0.8,
                display: 'flex',
                color: 'white',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
              }}
            >
              <IconChartBar size={20} strokeWidth={2.5} />
            </Box>
          </Box>

          {/* Right: Schools List */}
          <Box sx={{ flex: 1.5, pl: 2 }}>{rightContent}</Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

AgentSchoolCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.elementType,
  bgcolor: PropTypes.string,
  iconBgColor: PropTypes.string,
  rightContent: PropTypes.node,
};

export default AgentSchoolCard;
