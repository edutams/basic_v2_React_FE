import React from 'react';
import { Grid } from '@mui/material';
import ColorSelector from './ColorSelector';

const ColorSchemeSelector = ({ formData, onColorChange }) => {
  return (
    <Grid item xs={12}>
      <Grid container spacing={1}>
        <Grid item xs={12} sm={4}>
          <ColorSelector
            label="Choose Header Color Scheme"
            value={formData.headcolor}
            onChange={(color) => onColorChange('headcolor', color)}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <ColorSelector
            label="Choose Sidebar Color Scheme"
            value={formData.sidecolor}
            onChange={(color) => onColorChange('sidecolor', color)}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <ColorSelector
            label="Choose Body Color Scheme"
            value={formData.bodycolor}
            onChange={(color) => onColorChange('bodycolor', color)}
          />
        </Grid>
      </Grid>
    </Grid>
  );
};

export default ColorSchemeSelector;
