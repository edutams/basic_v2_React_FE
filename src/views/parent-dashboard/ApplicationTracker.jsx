import { Box, Grid, Typography, Button } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import PageContainer from 'src/components/container/PageContainer';
import ward from 'src/assets/images/backgrounds/ward.png';

import ApplicantCard        from 'src/components/tenant-components/admission/tracker/ApplicantCard';
import ProgressTracker      from 'src/components/tenant-components/admission/tracker/ProgressTracker';
import FormSubmittedCard    from 'src/components/tenant-components/admission/tracker/FormSubmittedCard';
import CurrentStageCard     from 'src/components/tenant-components/admission/tracker/CurrentStageCard';
import NextStepCard         from 'src/components/tenant-components/admission/tracker/NextStepCard';
import UpcomingRequirements from 'src/components/tenant-components/admission/tracker/UpcomingRequirements';
import AssistanceCard       from 'src/components/tenant-components/admission/tracker/AssistanceCard';

const ApplicationTracker = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { wardData, academicData, selectedBatch } = location.state ?? {};

  const applicantName = wardData
    ? `${wardData.surname ?? ''} ${wardData.first_name ?? ''} ${wardData.other_name ?? ''}`.trim()
    : 'Queensley Ademola';

  const intendingClass = academicData?.class_label ?? 'JSS1';
  const gender = wardData?.gender
    ? wardData.gender.toUpperCase()
    : 'FEMALE';
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

      {/* Top row: applicant profile + progress tracker */}
      <Grid container spacing={2} sx={{ mb: 3 }} alignItems="stretch">
        <Grid size={{ xs: 12, md: 5 }}>
          <ApplicantCard
            name={applicantName}
            intendingClass={intendingClass}
            gender={gender}
            address={address}
            photo={ward}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <ProgressTracker currentStage={1} />
        </Grid>
      </Grid>

      {/* Main content + sidebar */}
      <Grid container spacing={3} alignItems="flex-start">
        {/* Left column */}
        <Grid size={{ xs: 12, md: 8 }}>
          <FormSubmittedCard
            submittedDate="Sept 12, 2024"
            onViewDetails={() =>
              navigate('/admission/new-application', {
                state: { wardData, academicData, selectedBatch },
              })
            }
          />

          <CurrentStageCard
            stageTitle="Entrance Exam"
            stageDescription="Your child is required to take the online aptitude test as part of the admission process."
            requirementStatus="Ready to Begin"
            timeLimit="45 Minutes"
            onStart={() => {}}
            onPractice={() => {}}
          />

          <NextStepCard
            title="Admission Decision"
            description="Requires completion of Entrance Exam."
            actionLabel="Pay Acceptance Fee"
            actionDisabled
            onAction={() => {}}
          />
        </Grid>

        {/* Right sidebar */}
        <Grid size={{ xs: 12, md: 4 }}>
          <UpcomingRequirements />
          <AssistanceCard />
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default ApplicationTracker;
