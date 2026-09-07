import { useRef, useState } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { IconSchool, IconListCheck, IconLayoutGrid, IconBan } from '@tabler/icons-react';
import StatCard from '@/components/shared/StatCard';
import SetupShell from './SetupShell';
import SetUpClassesTab from '../components/SetUpClassesTab';

const Stage3ClassArms = ({ onNext, onBack, onSkip }) => {
  const tabRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [canContinue, setCanContinue] = useState(false);

  // Reported up by SetUpClassesTab, rendered here above its bordered card
  // instead of inside it (see ClassStructureManager for the same pattern).
  const [stats, setStats] = useState({
    totalClasses: 0,
    configuredClasses: 0,
    totalArms: 0,
    inactiveClasses: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  const handleSaveAndContinue = async () => {
    if (tabRef.current?.save) {
      setSaving(true);
      try {
        await tabRef.current.save();
      } finally {
        setSaving(false);
      }
    } else {
      onNext();
    }
  };

  return (
    <SetupShell
      stage={3}
      totalStages={5}
      onBack={onBack}
      onSkip={onSkip}
      onSaveAndContinue={handleSaveAndContinue}
      saving={saving}
      canContinue={canContinue}
      noPadding
      leftTitle="Create your class arms."
      leftSubtitle="Set up class arms and deactivate any class you currently do not have in your school."
    >
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          px: { xs: 2, sm: 3, md: '30px' },
          pt: { xs: '80px', sm: '85px', md: '90px' },
          pb: 1,
        }}
      >
        <Typography
          sx={{
            fontSize: { xs: 20, sm: 26 },
            fontWeight: 800,
            color: 'text.primary',
            mb: 0.5,
            flexShrink: 0,
          }}
        >
          Create Class Arms
        </Typography>
        <Typography
          sx={{
            fontSize: 13,
            color: 'text.secondary',
            mb: 2,
            maxWidth: 480,
            lineHeight: 1.6,
            flexShrink: 0,
          }}
        >
          Setup your class arm and deactivate any class you currently do not have in your school
        </Typography>

        <Grid container spacing={1.5} sx={{ mb: 1.5, flexShrink: 0 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              count={stats.totalClasses}
              label="Total Classes"
              icon={IconSchool}
              colorIndex={0}
              loading={statsLoading}
              tooltip="Every class configured for this school."
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              count={stats.configuredClasses}
              label="Arms Configured"
              icon={IconListCheck}
              colorIndex={1}
              loading={statsLoading}
              tooltip="Classes that already have arm names generated."
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              count={stats.totalArms}
              label="Total Arms"
              icon={IconLayoutGrid}
              colorIndex={2}
              loading={statsLoading}
              tooltip="Total class arms (streams) generated across all classes."
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              count={stats.inactiveClasses}
              label="Inactive Classes"
              icon={IconBan}
              colorIndex={4}
              loading={statsLoading}
              tooltip="Classes deactivated because this school doesn't run them."
            />
          </Grid>
        </Grid>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            bgcolor: '#fff',
            borderRadius: '12px !important',
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <SetUpClassesTab
            ref={tabRef}
            onSaveAndContinue={onNext}
            onReadyChange={setCanContinue}
            onStatsChange={(s, loading) => {
              setStats(s);
              setStatsLoading(loading);
            }}
          />
        </Box>
      </Box>
    </SetupShell>
  );
};

export default Stage3ClassArms;
