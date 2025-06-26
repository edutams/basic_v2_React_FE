import React from 'react';
import {
  Grid,
  Box,
  Typography,
  Button,
  Paper,
} from '@mui/material';

const colors = [
  '#7F8C8D',
  '#BDC3C7',
  '#1ABC9C',
  '#3498DB',
  '#F1C40F',
  '#E67E22',
  '#E74C3C',
  '#ECF0F1',
  '#9B59B6',
  '#34495E',
  '#2C3E50',
  '#95A5A6',
  '#16A085',
  '#27AE60',
  '#2980B9',
  '#8E44AD',
  '#D35400',
  '#C0392B',
  '#F39C12',
  '#2ECC71',
];

const ColorSelector = ({ label, value, onChange }) => (
  <Grid item xs={12} md={4}>
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        {label}
      </Typography>
      <Button variant="outlined" size="small" sx={{ mb: 2 }} onClick={() => onChange('')}>
        Default
      </Button>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 1,
        }}
      >
        {colors.map((color, index) => (
          <Box
            key={index}
            onClick={() => onChange(color)}
            sx={{
              width: 24,
              height: 24,
              bgcolor: color,
              borderRadius: '50%',
              border: value === color ? '3px solid #1976d2' : '1px solid #ccc',
              cursor: 'pointer',
              mx: 'auto',
              transition: 'border 0.2s ease',
              '&:hover': {
                border: '2px solid #1976d2',
              },
            }}
          />
        ))}
      </Box>
      {value && (
        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" color="textSecondary">
            Selected:
          </Typography>
          <Box
            sx={{
              width: 16,
              height: 16,
              bgcolor: value,
              borderRadius: '50%',
              border: '1px solid #ccc',
            }}
          />
          <Typography variant="caption" color="textSecondary">
            {value}
          </Typography>
        </Box>
      )}
    </Paper>
  </Grid>
);

export default ColorSelector;
