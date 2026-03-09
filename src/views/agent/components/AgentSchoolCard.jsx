import React from 'react';
import { Card, CardContent, Typography, Box, Stack, Divider } from '@mui/material';
import PropTypes from 'prop-types';

const AgentSchoolCard = ({ title, value, icon: Icon, bgcolor, iconBgColor, rightContent }) => {
  return (
    <Card
      sx={{
        backgroundColor: bgcolor || '#C9EBD2',
        height: '100%',
        borderRadius: '12px',
        boxShadow: 'none',
        border: '1px solid rgba(0,0,0,0.05)',
      }}
    >
      <CardContent sx={{ p: '24px !important', height: '100%', display: 'flex', alignItems: 'center' }}>
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" sx={{ width: '100%' }}>
          <Stack direction="row" spacing={2} alignItems="center">
            {Icon && (
              <Box
                sx={{
                  backgroundColor: iconBgColor || '#2ca87f',
                  borderRadius: '8px',
                  width: 48,
                  height: 48,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon width="24" height="24" color="white" />
              </Box>
            )}
            <Box>
              <Typography variant="h1" fontWeight="700" sx={{ color: '#333', fontSize: '32px', lineHeight: 1 }}>
                {value}
              </Typography>
              <Typography variant="subtitle2" fontWeight="600" sx={{ color: '#333', mt: 0.5, opacity: 0.8 }}>
                {title}
              </Typography>
            </Box>
          </Stack>

          {rightContent && (
            <Stack direction="row" spacing={2} alignItems="center">
              <Divider orientation="vertical" flexItem sx={{ height: '60px', borderColor: 'rgba(0,0,0,0.1)', borderRightWidth: 1 }} />
              <Box>
                {rightContent}
              </Box>
            </Stack>
          )}
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
