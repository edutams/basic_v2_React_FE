import { Box, Grid, Typography, Button, Paper } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import PageContainer from 'src/components/container/PageContainer';
import ward from 'src/assets/images/backgrounds/ward.png';

import TrackerHeader from 'src/components/tenant-components/admission/tracker/TrackerHeader';
import TrackerMain from 'src/components/tenant-components/admission/tracker/TrackerMain';
import TrackerSidebar from 'src/components/tenant-components/admission/tracker/TrackerSidebar';

const ApplicationTracker = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { wardData, academicData, selectedBatch } = location.state ?? {};

  const applicantName = wardData
    ? `${wardData.surname ?? ''} ${wardData.first_name ?? ''} ${wardData.other_name ?? ''}`.trim()
    : 'Queensley Ademola';

  const intendingClass = academicData?.class_label ?? 'JSS1';
  const gender = wardData?.gender ? wardData.gender.toUpperCase() : 'FEMALE';
  const address = wardData?.home_address ?? 'NO 3, Adeleke Tolulope Street, Akinola Road.';

  return (
    <PageContainer title="Application Tracker" description="Track your admission application">
      {/* Page header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        flexDirection={{ xs: 'column', sm: 'row' }}
        gap={1.5}
        mb={3}
      >
        <Typography variant="h5" fontWeight={800}>
          Application Tracker
        </Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dashboard')}
          sx={{ color: 'text.secondary', fontWeight: 500 }}
        >
          Back to dashboard
        </Button>
      </Box>

      {/* Applicant profile + progress tracker */}
      <TrackerHeader
        name={applicantName}
        intendingClass={intendingClass}
        gender={gender}
        address={address}
        photo={ward}
        currentStage={1}
      />

      {/* Main content + sidebar */}
      <Grid container spacing={3} alignItems="flex-start">
        <Grid size={{ xs: 12 }}>
          <Paper
            sx={{
              p: 3,
              bgcolor: '#e5e8f86a',
            }}
          >
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 8 }}>
                <TrackerMain
                  submittedDate="Sept 12, 2024"
                  onViewDetails={() =>
                    navigate('/admission/new-application', {
                      state: { wardData, academicData, selectedBatch },
                    })
                  }
                  stageTitle="Entrance Exam"
                  stageDescription="Your child is required to take the online aptitude test as part of the admission process."
                  requirementStatus="Ready to Begin"
                  timeLimit="45 Minutes"
                  onStart={() => {}}
                  onPractice={() => {}}
                  nextTitle="Admission Decision"
                  nextDescription="Requires completion of Entrance Exam."
                  nextActionLabel="Pay Acceptance Fee"
                  nextActionDisabled
                  onNextAction={() => {}}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TrackerSidebar />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default ApplicationTracker;
