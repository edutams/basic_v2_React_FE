import React from 'react';
import { Button, Stack } from '@mui/material';

const OutlinedSizeButton = () => (
  <Stack
    spacing={1}
    direction={{ xs: 'column', sm: 'row' }}
    alignItems="center"
    justifyContent="center"
  >
    <Button size="small">Small</Button>
    <Button size="medium">Medium</Button>
    <Button size="large">Large</Button>
  </Stack>
);

export default OutlinedSizeButton;
