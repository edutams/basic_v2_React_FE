import React from 'react';
import { Card, Box, CardContent, Typography, Grid, useTheme } from '@mui/material';
import { mockSummaryStats } from '../mockData';

const CommissionSummaryCards = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(4, 1fr)',
        },
        gap: 3,
        mb: 3,
      }}
    >
      {mockSummaryStats.map((stat, index) => {
        const Icon = stat.icon;

        return (
          <Card
            key={index}
            sx={{
              borderRadius: '18px',
              bgcolor: '#F7F8FA',
              boxShadow: '0px 8px 20px rgba(0,0,0,0.04)',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.3s ease',

              '&:hover': {
                boxShadow: '0px 12px 30px rgba(0,0,0,0.08)',
              },
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
              {/* ICON */}
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  bgcolor: stat.lightColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon size={22} color={stat.color} stroke={2} />
              </Box>

              {/* TEXT */}
              <Box>
                <Typography
                  sx={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: stat.color,
                    lineHeight: 1.2,
                  }}
                >
                  {stat.value}
                </Typography>

                <Typography
                  sx={{
                    fontSize: 13,
                    color: '#9AA0A6',
                    mt: 0.5,
                  }}
                >
                  {stat.title}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
};

export default CommissionSummaryCards;
