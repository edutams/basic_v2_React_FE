import React from 'react';
import { Box, Typography, Paper, Stack } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { TrendingUp, TrendingDown, Male, Female } from '@mui/icons-material';
import { BLUE, GREEN, MAGENTA, num } from './constants';

// Card shell — rounded section container with subtle border & shadow
export const CardShell = ({ children, sx = {} }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2,
      borderRadius: '12px',
      height: '100%',
      border: '1px solid',
      borderColor: (t) => t.palette.divider,
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      ...sx,
    }}
  >
    {children}
  </Paper>
);

// Growth footer: "↑ 18% vs 2023/24" (green on increase, red on decrease)
export const GrowthRow = ({ pct, type, label }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
    {type === 'increase' ? (
      <TrendingUp sx={{ fontSize: 13, color: GREEN }} />
    ) : (
      <TrendingDown sx={{ fontSize: 13, color: 'error.main' }} />
    )}
    <Typography
      variant="body2"
      sx={{
        fontWeight: 700,
        fontSize: 11,
        color: type === 'increase' ? GREEN : 'error.main',
      }}
    >
      {Math.abs(num(pct))}% vs {label}
    </Typography>
  </Box>
);

// Legend item: colored square + label
export const LegendItem = ({ color, label, square = true }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
    {square ? (
      <Box sx={{ width: 10, height: 10, borderRadius: 0.5, bgcolor: color }} />
    ) : (
      <Box
        sx={{
          width: 16,
          height: 0,
          borderTop: `3px solid ${color}`,
          borderRadius: 2,
        }}
      />
    )}
    <Typography variant="caption" sx={{ fontSize: 10, fontWeight: 600 }}>
      {label}
    </Typography>
  </Box>
);

// "At a Glance" row — each metric sits in its own light-tinted rounded container
// with an icon tile on the left, label(+sub) in the middle and a large bold colored
// value on the right, matching the reference design.
export const GlanceRow = ({ icon: Icon, color, label, sub, value, valueColor }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1.25,
      p: 1.25,
      borderRadius: '12px',
      bgcolor: (t) => (t.palette.mode === 'dark' ? alpha(color, 0.12) : alpha(color, 0.07)),
      border: '1px solid',
      borderColor: (t) => (t.palette.mode === 'dark' ? alpha(color, 0.28) : alpha(color, 0.16)),
      transition: 'all 0.2s ease',
      '&:hover': {
        transform: 'translateX(3px)',
        boxShadow: `0 4px 12px ${alpha(color, 0.18)}`,
      },
    }}
  >
    <Box
      sx={{
        width: 36,
        height: 36,
        borderRadius: '10px',
        bgcolor: (t) => (t.palette.mode === 'dark' ? alpha(color, 0.2) : alpha(color, 0.14)),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Icon sx={{ fontSize: 16, color }} />
    </Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography sx={{ fontSize: 11, fontWeight: 700, lineHeight: 1.3 }}>{label}</Typography>
      {sub && (
        <Typography variant="caption" sx={{ fontSize: 9.5, color: 'text.secondary', lineHeight: 1.2 }}>
          {sub}
        </Typography>
      )}
    </Box>
    <Typography
      sx={{ fontSize: 15, fontWeight: 800, color: valueColor, whiteSpace: 'nowrap', flexShrink: 0 }}
    >
      {value}
    </Typography>
  </Box>
);

// Gender split: blue male (♂) / pink female (♀) human icons with gender label,
// bold count + (pct), right-aligned beside the value — matches the reference design.
export const GenderSplit = ({ male, female }) => {
  const total = num(male) + num(female);
  const mPct = total ? Math.round((num(male) / total) * 100) : 0;
  const fPct = total ? 100 - mPct : 0;

  const GenderRow = ({ icon: Icon, color, label, count, pct }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, whiteSpace: 'nowrap' }}>
      <Icon sx={{ fontSize: 13, color }} />
      <Typography sx={{ fontSize: 10, fontWeight: 700, color, lineHeight: 1 }}>
        {label} {count.toLocaleString()} ({pct}%)
      </Typography>
    </Box>
  );

  return (
    <Stack spacing={0.5} sx={{ alignItems: 'flex-end' }}>
      <GenderRow icon={Male} color={BLUE} label="Male" count={num(male)} pct={mPct} />
      <GenderRow icon={Female} color={MAGENTA} label="Female" count={num(female)} pct={fPct} />
    </Stack>
  );
};
