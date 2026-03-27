import React from 'react';
import {
  Box,
  Grid,
  Typography,
  Button,
  Avatar,
  TextField,
  Stack,
  Divider,
  MenuItem,
  Card,
} from '@mui/material';
import { IconSchool, IconVideo, IconArrowRight } from '@tabler/icons-react';
import ParentCard from '../../components/shared/ParentCard';

const SchoolInformationPage = () => {
  return (
    <Box>
      {/* PAGE HEADER */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Box>
          <Typography fontWeight={700} fontSize={20}>
            School Information
          </Typography>

          <Typography fontSize={13} color="#8A8D91">
            Register your school and set up administrative accounts
          </Typography>
        </Box>

        <Box
          sx={{
            px: 2,
            py: 1,
            bgcolor: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            cursor: 'pointer',
            boxShadow: '0px 6px 16px rgba(0,0,0,0.08)',
            '&:hover': {
              transform: 'translateY(-2px)',
            },
          }}
        >
          <IconVideo size={20} />
          <Typography fontSize={13} fontWeight={500}>
            How to setup your Profile
          </Typography>
          <IconArrowRight size={16} />
        </Box>
      </Box>

      {/* SCHOOL DETAILS */}
      <Card sx={{ p: 0, mb: 2 }}>
        {/* HEADER */}
        <Box sx={{ px: 3, py: 1.5, bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
          <Typography fontWeight={600}>School Details</Typography>
        </Box>

        {/* BODY */}
        <Box sx={{ p: 3 }}>
          <Box
            sx={{
              display: 'flex',
              gap: 3,
              alignItems: 'flex-start',
            }}
          >
            {/* LOGO */}
            <Box sx={{ width: 140, flexShrink: 0, textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 110,
                  height: 110,
                  bgcolor: '#f5f5f5',
                  border: '1px solid #e0e0e0',
                  mx: 'auto',
                }}
              >
                <IconSchool size={40} color="#9e9e9e" />
              </Avatar>

              <Button variant="outlined" size="small" sx={{ mt: 2, textTransform: 'none' }}>
                Browse
              </Button>
            </Box>

            {/* FORM AREA */}
            <Box sx={{ flex: 1, display: 'flex', gap: 3 }}>
              {/* LEFT */}
              <Box sx={{ flex: 1 }}>
                <Stack spacing={2}>
                  <Box>
                    <Typography fontSize={14} mb={0.5}>
                      School Name
                    </Typography>
                    <TextField fullWidth placeholder="Enter School Name" />
                  </Box>

                  <Box>
                    <Typography fontSize={14} mb={0.5}>
                      Acronym
                    </Typography>

                    <Stack direction="row" spacing={1}>
                      <TextField fullWidth placeholder="e.g. GSS" />
                      <Button sx={{ height: 56, minWidth: 90 }}>Check</Button>
                    </Stack>
                  </Box>
                </Stack>
              </Box>

              {/* RIGHT */}
              <Box sx={{ flex: 1 }}>
                <Stack spacing={2}>
                  <Box>
                    <Typography fontSize={14} mb={0.5}>
                      Category
                    </Typography>
                    <TextField fullWidth select defaultValue="">
                      <MenuItem value="">Select School Category</MenuItem>
                      <MenuItem value="primary">Primary</MenuItem>
                      <MenuItem value="secondary">Secondary</MenuItem>
                    </TextField>
                  </Box>

                  <Box>
                    <Typography fontSize={14} mb={0.5}>
                      Address
                    </Typography>
                    {/* <TextField fullWidth multiline rows={2} /> */}
                    <TextField fullWidth placeholder="Enter school address" />
                  </Box>
                </Stack>
              </Box>
            </Box>
          </Box>
        </Box>
      </Card>

      {/* ADMINISTRATIVE ACCOUNTS */}
      <Card sx={{ p: 0 }}>
        <Box
          sx={{
            px: 3,
            py: 1.5,
            bgcolor: '#f5f5f5',
            borderBottom: '1px solid #e0e0e0',
          }}
        >
          <Typography fontWeight={600}>Administrative Accounts</Typography>
        </Box>

        <Box sx={{ p: 3 }}>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              flexWrap: 'wrap',
            }}
          >
            {['School Owner Detail', 'School Head Detail', 'Portal Admin'].map((title, index) => (
              <Box
                key={title}
                sx={{
                  flex: '1 1 300px',
                  minWidth: 260,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: 'white',
                  boxShadow: '0px 6px 16px rgba(0,0,0,0.08)',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  boxShadow: '0px 6px 16px rgba(0,0,0,0.08)',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: '0px 10px 20px rgba(0,0,0,0.15)',
                  },
                }}
              >
                <Typography fontWeight={600} mb={1}>
                  {title}
                </Typography>

                <Divider sx={{ mb: 2 }} />

                <Stack spacing={1.5}>
                  <TextField placeholder="Surname" fullWidth />
                  <TextField placeholder="First Name" fullWidth />
                  <TextField placeholder="Other Name" fullWidth />
                  <TextField placeholder="Phone" fullWidth />
                  <TextField placeholder="Email" fullWidth />
                </Stack>
              </Box>
            ))}
          </Box>
        </Box>
      </Card>

      <Box mt={3} display="flex" justifyContent="flex-end">
        <Button variant="contained" color="primary" onClick={() => setNewRoleModalOpen(true)}>
          Save & Continue
        </Button>
      </Box>
    </Box>
  );
};

export default SchoolInformationPage;
