import React from 'react';
import {
  Grid,
} from '@mui/material';
import ColorSelector from './ColorSelector';

const ColorSchemeSelector = ({ formik }) => {
  return (
    <Grid item xs={12}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <ColorSelector
            label="Choose Header Color Scheme"
            value={formik.values.headerColor}
            onChange={(color) => formik.setFieldValue('headerColor', color)}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <ColorSelector
            label="Choose Sidebar Color Scheme"
            value={formik.values.sidebarColor}
            onChange={(color) => formik.setFieldValue('sidebarColor', color)}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <ColorSelector
            label="Choose Body Color Scheme"
            value={formik.values.bodyColor}
            onChange={(color) => formik.setFieldValue('bodyColor', color)}
          />
        </Grid>
      </Grid>
    </Grid>
  );
};

export default ColorSchemeSelector;
