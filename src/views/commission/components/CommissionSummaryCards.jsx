
import React from 'react';
import { Card, CardContent, Typography, Grid, Box } from '@mui/material';
import { mockSummaryStats } from '../mockData';

const CommissionSummaryCards = () => {
    return (
        <Grid container spacing={3}>
            {mockSummaryStats.map((stat, index) => (
                <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={index}>
                    <Card 
                        sx={{ 
                            borderRadius: '16px',
                            border: `1px solid ${stat.color === '#333' ? '#E5E7EB' : stat.color}`,
                            boxShadow: 'none',
                            height: '100%'
                        }}
                    >
                        <CardContent sx={{ p: '24px !important' }}>
                            <Typography variant="h3" sx={{ fontWeight: 700, color: stat.color, mb: 1 }}>
                                {stat.value}
                            </Typography>
                            <Typography variant="subtitle2" color="textSecondary" sx={{ fontWeight: 500 }}>
                                {stat.title}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};

export default CommissionSummaryCards;
