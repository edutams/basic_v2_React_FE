import { Box, Grid, Typography, Button, Paper } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import PageContainer from '@/components/container/PageContainer';
import ward from '@/assets/images/backgrounds/ward.png';

import TrackerHeader from '@/components/tenant/admission/tracker/TrackerHeader';
import TrackerMain from '@/components/tenant/admission/tracker/TrackerMain';
import TrackerSidebar from '@/components/tenant/admission/tracker/TrackerSidebar';

const ApplicationTracker = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { wardData, academicData, selectedBatch } = location.state ?? {};

  const applicantName = wardData
    ? `${wardData.surname ?? ''} ${wardData.first_name ?? ''} ${wardData.other_name ?? ''}`.trim()
    : 'Adewale Johnson';

  const intendingClass = academicData?.class_label ?? 'JSS1';
  const gender = wardData?.gender ? wardData.gender.toUpperCase() : 'FEMALE';
  const address = wardData?.home_address ?? 'NO 3, Adeleke Tolulope Street, Akinola Road.';

  return (
    <PageContainer title="Application Tracker" description="Track your admission application">
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
      <Paper sx={{ p: 3, bgcolor: '#e5e8f86a' }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <TrackerMain
              submittedDate="Sept 12, 2024"
              onViewDetails={() =>
                navigate('/admission/form-details', {
                  state: { wardData, academicData, selectedBatch, viewMode: true },
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
    </PageContainer>
  );
};

export default ApplicationTracker;
