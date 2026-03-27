import React, { useState } from 'react';
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
  Paper,
  Tabs,
  Tab,
} from '@mui/material';
import {
  IconSchool,
  IconVideo,
  IconArrowRight,
  IconArrowLeft,
  IconUsers,
  IconBooks,
  IconCalendar,
  IconUserPlus,
} from '@tabler/icons-react';
import ParentCard from '../../components/shared/ParentCard';

const CompleteSetup = () => {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <Box>
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
            School Administration
          </Typography>

          <Typography fontSize={13} color="#8A8D91">
            Manage classes, learners, teachers and calendar
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
            Complete your setup to proceed
          </Typography>
          <IconArrowRight size={16} />
        </Box>
      </Box>

      {/* ACADEMIC SESSION SETUP */}
      <Card sx={{ p: 0, mb: 2, borderRadius: 0 }}>
        {/* HEADER */}
        <Box sx={{ px: 3, py: 1.5, bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
          <Typography fontWeight={600}>Class Details </Typography>
        </Box>

        {/* BODY */}
        <Box sx={{ px: 2, py: 0, mt: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 2, sm: 3 }} mb={3}>
            <Paper
              sx={{
                borderRadius: 2,
                px: 3,
                py: 2,
                width: { xs: '100%', sm: 320 },
                background: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: '#E3E8F8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconSchool size={22} color="#3B5BDB" />
              </Box>

              <Box sx={{ textAlign: 'center' }}>
                <Typography fontSize={26} fontWeight={700}>
                  6
                </Typography>
                <Typography fontSize={14} color="#6B7280">
                  Classes
                </Typography>
              </Box>
            </Paper>
            <Paper
              sx={{
                borderRadius: 2,
                px: 3,
                py: 2,
                width: { xs: '100%', sm: 320 },
                background: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: '#E3E8F8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconSchool size={22} color="#3B5BDB" />
              </Box>

              <Box sx={{ textAlign: 'center' }}>
                <Typography fontSize={26} fontWeight={700}>
                  16
                </Typography>
                <Typography fontSize={14} color="#6B7280">
                  Arms
                </Typography>
              </Box>
            </Paper>
            <Paper
              sx={{
                borderRadius: 2,
                px: 3,
                py: 2,
                width: { xs: '100%', sm: 320 },
                background: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: '#E3E8F8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconSchool size={22} color="#3B5BDB" />
              </Box>

              <Box sx={{ textAlign: 'center' }}>
                <Typography fontSize={26} fontWeight={700}>
                  209
                </Typography>
                <Typography fontSize={14} color="#6B7280">
                  Learners
                </Typography>
              </Box>
            </Paper>
            <Paper
              sx={{
                borderRadius: 2,
                px: 3,
                py: 2,
                width: { xs: '100%', sm: 320 },
                background: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: '#E3E8F8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconSchool size={22} color="#3B5BDB" />
              </Box>

              <Box sx={{ textAlign: 'center' }}>
                <Typography fontSize={26} fontWeight={700}>
                  36
                </Typography>
                <Typography fontSize={14} color="#6B7280">
                  Teachers
                </Typography>
              </Box>
            </Paper>
          </Stack>
        </Box>
      </Card>

      {/* TABS SECTION */}
      <Box sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab
            icon={<IconBooks size={18} />}
            iconPosition="start"
            label="Set-Up Classes"
            onClick={() => setActiveTab(0)}
          />
          <Tab
            icon={<IconUserPlus size={18} />}
            iconPosition="start"
            label="Upload Learners"
            onClick={() => setActiveTab(1)}
          />
          <Tab
            icon={<IconUsers size={18} />}
            iconPosition="start"
            label="Upload Teachers"
            onClick={() => setActiveTab(2)}
          />
          <Tab
            icon={<IconCalendar size={18} />}
            iconPosition="start"
            label="Set Calendar"
            onClick={() => setActiveTab(3)}
          />
        </Tabs>
      </Box>

      {/* TAB CONTENT */}
      <ParentCard sx={{ p: 3 }}>
        {activeTab === 0 && <Typography>Set-Up Classes content goes here</Typography>}
        {activeTab === 1 && <Typography>Upload Learners content goes here</Typography>}
        {activeTab === 2 && <Typography>Upload Teachers content goes here</Typography>}
        {activeTab === 3 && <Typography>Set Calendar content goes here</Typography>}
      </ParentCard>
      {/* </Card> */}
    </Box>
  );
};

export default CompleteSetup;
