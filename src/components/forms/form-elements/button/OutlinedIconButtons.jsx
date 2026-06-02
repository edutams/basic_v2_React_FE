import React from 'react';
import { Button, Stack } from '@mui/material';
import { IconTrash, IconSend } from '@tabler/icons';

const OutlinedIconButtons = () => (
  <Stack spacing={1} direction={{ xs: 'column', sm: 'row' }} justifyContent="center">
    <Button color="error" startIcon={<IconTrash width={18} />}>
      Left Icon
    </Button>
    <Button color="secondary" endIcon={<IconSend width={18} />}>
      Right Icon
    </Button>
  </Stack>
);

export default OutlinedIconButtons;
