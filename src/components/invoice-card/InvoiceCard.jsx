import React from 'react';
import { Box, Grid, Typography, Paper, Stack } from '@mui/material';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';

const data = [
  {
    title: 'Total',
    count: 7,
    label: 'Invoices',
    icon: <QrCode2Icon fontSize="large" />,
    color: '#1C2541',
    iconBg: '#3A5AAB',
  },
  {
    title: 'Shipped',
    count: 3,
    label: 'Invoices',
    icon: <ShoppingBagIcon fontSize="large" />,
    color: '#27496D',
    iconBg: '#00A8FF',
  },
  {
    title: 'Delivered',
    count: 3,
    label: 'Invoices',
    icon: <LocalShippingIcon fontSize="large" />,
    color: '#1E3D43',
    iconBg: '#2ECC71',
  },
  {
    title: 'Pending',
    count: 1,
    label: 'Invoices',
    icon: <FormatListNumberedIcon fontSize="large" />,
    color: '#4B3F35',
    iconBg: '#F1C40F',
  },
];

const InvoiceCard = () => {
  return (
    <Grid container spacing={2}>
      {data.map((item, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Paper
            elevation={3}
            sx={{
              backgroundColor: item.color,
              padding: 2,
              borderRadius: 2,
              color: 'white',
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  backgroundColor: item.iconBg,
                  borderRadius: 2,
                  padding: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {item.icon}
              </Box>
              <Box>
                <Typography variant="body2">{item.title}</Typography>
                <Typography variant="h6" fontWeight="bold">
                  {item.count} {item.label}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default InvoiceCard;
