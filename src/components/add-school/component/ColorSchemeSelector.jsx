import React, { useState, useRef } from 'react';
import {
  Grid, TextField, InputAdornment, Box, Typography,
  Paper, ClickAwayListener,
} from '@mui/material';
import { HexColorPicker } from 'react-colorful';

// Validate any CSS color string (hex, rgb, hsl, named)
const isValidCssColor = (color) => {
  if (!color || !color.trim()) return false;
  try {
    const el = document.createElement('div');
    el.style.color = color;
    return el.style.color !== '';
  } catch {
    return false;
  }
};

// Convert any valid CSS color to hex for the picker
const toHexForPicker = (color) => {
  if (!color || !isValidCssColor(color)) return '#3949ab';
  // If already hex, return as-is
  if (/^#[0-9a-fA-F]{6}$/.test(color)) return color;
  if (/^#[0-9a-fA-F]{3}$/.test(color)) {
    const [, r, g, b] = color.match(/^#(.)(.)(.)$/);
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  // For named/hsl/rgb — render to canvas to get hex
  try {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
  } catch {
    return '#3949ab';
  }
};

const ColorField = ({ label, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const valid = isValidCssColor(value);

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <Box sx={{ position: 'relative' }}>
        <TextField
          fullWidth
          label={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="red, #3949ab, hsl(220,80%,50%)"
          size="small"
          error={Boolean(value && !valid)}
          helperText={value && !valid ? 'Invalid color' : ' '}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Box
                  onClick={() => setOpen((prev) => !prev)}
                  sx={{
                    width: 22,
                    height: 22,
                    borderRadius: '4px',
                    bgcolor: valid ? value : '#e0e0e0',
                    border: '1px solid rgba(0,0,0,0.18)',
                    cursor: 'pointer',
                    flexShrink: 0,
                    transition: 'background-color 0.15s',
                  }}
                />
              </InputAdornment>
            ),
          }}
        />

        {open && (
          <Paper
            elevation={8}
            sx={{
              position: 'absolute',
              zIndex: 1400,
              top: 'calc(100% + 4px)',
              left: 0,
              borderRadius: '12px',
              p: 1.5,
              bgcolor: '#1e1e1e',
              '& .react-colorful': { width: '220px', height: '200px' },
              '& .react-colorful__saturation': { borderRadius: '8px 8px 0 0' },
              '& .react-colorful__hue': { height: '14px', borderRadius: '8px', mt: '10px' },
              '& .react-colorful__pointer': { width: '20px', height: '20px', borderWidth: '3px' },
            }}
          >
            <HexColorPicker
              color={toHexForPicker(value)}
              onChange={(hex) => onChange(hex)}
            />
            <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
              <Box sx={{ bgcolor: '#2d2d2d', borderRadius: '6px', px: 1.5, py: 0.6 }}>
                <Typography variant="caption" sx={{ color: '#fff', fontFamily: 'monospace', fontSize: '12px', fontWeight: 600 }}>
                  Hex
                </Typography>
              </Box>
              <Box sx={{ bgcolor: '#2d2d2d', borderRadius: '6px', px: 1.5, py: 0.6, flex: 1 }}>
                <Typography variant="caption" sx={{ color: '#fff', fontFamily: 'monospace', fontSize: '12px' }}>
                  {valid ? toHexForPicker(value).toUpperCase() : '------'}
                </Typography>
              </Box>
            </Box>
          </Paper>
        )}
      </Box>
    </ClickAwayListener>
  );
};

const ColorSchemeSelector = ({ formData, onColorChange }) => {
  return (
    <Grid item xs={12}>
      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
        Color Scheme
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <ColorField
            label="Header Color"
            value={formData.headcolor || ''}
            onChange={(v) => onColorChange('headcolor', v)}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <ColorField
            label="Sidebar Color"
            value={formData.sidecolor || ''}
            onChange={(v) => onColorChange('sidecolor', v)}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <ColorField
            label="Body Color"
            value={formData.bodycolor || ''}
            onChange={(v) => onColorChange('bodycolor', v)}
          />
        </Grid>
      </Grid>
    </Grid>
  );
};

export default ColorSchemeSelector;
