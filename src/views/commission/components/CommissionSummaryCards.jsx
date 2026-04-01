import React from 'react';
import { Card, Box, CardContent, Typography, Grid, useTheme } from '@mui/material';
import { mockSummaryStats } from '../mockData';

const CommissionSummaryCards = () => {
  const theme = useTheme();

  return (
    <Grid container spacing={3}>
      {mockSummaryStats.map((stat, index) => {
        const Icon = stat.icon;

        return (
          <Box item xs={12} sm={6} lg={3} key={index}>
            <Card
              sx={{
                borderRadius: '18px',
                bgcolor: '#F7F8FA',
                boxShadow: '0px 8px 20px rgba(0,0,0,0.04)',
                height: '100%',
              }}
            >
              <CardContent
                sx={{
                  p: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                {/* ICON CIRCLE */}
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    bgcolor: stat.lightColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
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
                      fontWeight: 500,
                      mt: 0.5,
                    }}
                  >
                    {stat.title}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        );
      })}
    </Grid>
  );
};

export default CommissionSummaryCards;
