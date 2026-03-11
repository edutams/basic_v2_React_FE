import React from 'react';
import { Card, CardContent, Typography, Grid, useTheme } from '@mui/material';
import { mockSummaryStats } from '../mockData';

const CommissionSummaryCards = () => {
    const theme = useTheme();

    return (
        <Grid container spacing={3}>
            {mockSummaryStats.map((stat, index) => {
                const isDefaultColor = stat.color === '#333';
                const borderColor = isDefaultColor ? theme.palette.divider : stat.color;
                const textColor = isDefaultColor ? theme.palette.text.primary : stat.color;

                return (
                    <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={index}>
                        <Card 
                            sx={{ 
                                borderRadius: '16px',
                                border: `1px solid ${borderColor}`,
                                boxShadow: 'none',
                                height: '100%',
                                bgcolor: theme.palette.background.paper
                            }}
                        >
                            <CardContent sx={{ p: '24px !important', textAlign: 'center' }}>
                                <Typography variant="h3" sx={{ fontWeight: 700, color: textColor, mb: 1 }}>
                                    {stat.value}
                                </Typography>
                                <Typography variant="subtitle2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
                                    {stat.title}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                );
            })}
        </Grid>
    );
};

export default CommissionSummaryCards;
