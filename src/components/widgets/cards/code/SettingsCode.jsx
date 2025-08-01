import CodeDialog from '../../../shared/CodeDialog';
import React from 'react';
const SettingsCode = () => {
  return (
    <>
      <CodeDialog>
        {`
import React from 'react';
import { CardContent, Typography, Avatar, Divider, Button, Box, Stack, Card } from '@mui/material';
import { IconMessage, IconVolume } from '@tabler/icons';
import { styled } from '@mui/material/styles';
import { Slider } from '@mui/material';
import { Switch } from '@mui/material';

const CustomSlider = styled(Slider)(({ theme }) => ({
  '& .MuiSlider-rail': {
    height: '9px',
    borderRadius: '9px',
    opacity: '1',
    backgroundColor: theme.palette.grey[200],
  },
  '& .MuiSlider-thumb': {
    borderRadius: '50%',
    backgroundColor: () => theme.palette.secondary.main,
    width: '23px',
    height: '23px',
  },
  '& .MuiSlider-track': {
    height: '9px',
    borderRadius: '9px',
  },
}));

const CustomSwitch = styled((props: any) => <Switch {...props} />)(({ theme }) => ({
  '&.MuiSwitch-root': {
    width: '68px',
    height: '49px',
  },
  '&  .MuiButtonBase-root': {
    top: '6px',
    left: '6px',
  },
  '&  .MuiButtonBase-root.Mui-checked .MuiSwitch-thumb': {
    backgroundColor: 'primary.main',
  },
  '& .MuiSwitch-thumb': {
    width: '18px',
    height: '18px',
    borderRadius: '6px',
  },

  '& .MuiSwitch-track': {
    backgroundColor: theme.palette.grey[200],
    opacity: 1,
    borderRadius: '5px',
  },
  '& .MuiSwitch-switchBase': {
    '&.Mui-checked': {
      '& + .MuiSwitch-track': {
        backgroundColor: 'primary',
        opacity: 0.18,
      },
    },
  },
}));

const Settings = () => {
  const [value3, setValue3] = React.useState(45);
  const handleChange6 = (event: any, newValue: any) => {
    setValue3(newValue);
  };

  return (
    <Card>
      <CardContent sx={{p: "30px"}}>
        <Typography variant="h5">Settings</Typography>
        <Stack spacing={2} mt={3}>
          <Stack direction="row" spacing={2}>
            <Avatar variant="rounded" sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
              <IconVolume width={22} />
            </Avatar>
            <Box width="100%">
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="h6">Sound</Typography>
                <Typography variant="subtitle2" color="textSecondary">
                  45%
                </Typography>
              </Box>
              <CustomSlider aria-label="Volume" value={value3} onChange={handleChange6} />
            </Box>
          </Stack>
          <Divider />
          <Stack direction="row" spacing={2}>
            <Avatar variant="rounded" sx={{ bgcolor: 'secondary.main', width: 48, height: 48 }}>
              <IconMessage width={22} />
            </Avatar>
            <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
              <Box>
                <Typography variant="h6" mb={1}>Chat</Typography>
                <Typography variant="subtitle2" color="textSecondary">
                  Turn on chat during call
                </Typography>
              </Box>
              <Box>
                <CustomSwitch />
              </Box>
            </Box>
          </Stack>
          <Divider />
        </Stack>
        <Stack direction="row" justifyContent="end" spacing={2} mt={2}>
            <Button variant="outlined" color="error">Cancel</Button>
            <Button variant="contained" color="primary">Save</Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default Settings;
`}
      </CodeDialog>
    </>
  );
};

export default SettingsCode;
