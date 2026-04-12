import React, { useState } from 'react';
import { Box, Grid, Typography, Button, Stack, Paper, Tabs, Tab, CardContent } from '@mui/material';
import {
  IconSchool,
  IconVideo,
  IconArrowRight,
  IconArrowLeft,
  IconBooks,
  IconCalendar,
  IconUserPlus,
  IconUsers,
} from '@tabler/icons-react';
import ParentCard from 'src/components/shared/ParentCard';

// Tab Components
import SetUpClassesTab from './tabs/SetUpClassesTab';
import UploadLearnersTab from './tabs/UploadLearnersTab';
import UploadTeachersTab from './tabs/UploadTeachersTab';
import SetCalendarTab from './tabs/SetCalendarTab';

const TOTAL_STEPS = 4;

const CompleteSetup = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handlePrevious = () => {
    if (activeTab > 0) {
      setActiveTab(activeTab - 1);
    }
  };

  const handleNext = () => {
    if (activeTab < TOTAL_STEPS - 1) {
      setActiveTab(activeTab + 1);
    }
  };

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

      {/* CLASS DETAILS CARD */}
      <Box sx={{ p: 2, pb: 1 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 2, sm: 2 }} mb={1}>
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

      {/* TABS SECTION */}
      <Box sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
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
      <ParentCard sx={{ p: 0 }}>
        {activeTab === 0 && <SetUpClassesTab onSaveAndContinue={handleNext} />}
        {activeTab === 1 && <UploadLearnersTab onSaveAndContinue={handleNext} />}
        {activeTab === 2 && <UploadTeachersTab onSaveAndContinue={handleNext} />}
        {activeTab === 3 && <SetCalendarTab onSaveAndContinue={handleNext} />}
      </ParentCard>

      {/* STEP NAVIGATION CONTROLS */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mt: 2,
          p: 2,
          bgcolor: '#f9f9f9',
          borderRadius: 2,
        }}
      >
        {/* Previous Button */}
        <Button
          variant="outlined"
          startIcon={<IconArrowLeft />}
          onClick={handlePrevious}
          disabled={activeTab === 0}
        >
          Previous
        </Button>

        {/* Step Indicator */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Step {activeTab + 1} of {TOTAL_STEPS}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              ml: 2,
            }}
          >
            {[0, 1, 2, 3].map((step) => (
              <Box
                key={step}
                onClick={() => setActiveTab(step)}
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  bgcolor: activeTab === step ? '#1976d2' : '#e0e0e0',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: activeTab === step ? '#1976d2' : '#bdbdbd',
                  },
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Next Button */}
        <Button
          variant="contained"
          endIcon={<IconArrowRight />}
          onClick={handleNext}
          disabled={activeTab === TOTAL_STEPS - 1}
        >
          Next
        </Button>
      </Box>
    </Box>
  );
};

export default CompleteSetup;
