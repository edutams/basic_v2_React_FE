import { useRef, useState } from 'react';
import { Box, Grid, Button, CircularProgress, Alert } from '@mui/material';
import { IconSchool, IconListCheck, IconLayoutGrid, IconBan } from '@tabler/icons-react';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import StatCard from '@/components/shared/StatCard';
import SetUpClassesTab from '@/pages/tenant/school-setup/components/SetUpClassesTab';

const BCrumb = [
  { to: '/', title: 'Home' },
  { to: '/dashboard', title: 'Dashboard' },
  { title: 'Class Structure' },
];

const ClassStructureManager = () => {
  const tabRef = useRef(null);
  const [saving, setSaving] = useState(false);

  // Reported up by SetUpClassesTab (which owns the underlying class data) so
  // the stat-card row can live here, above its bordered card, instead of
  // rendered inside that same card alongside the table.
  const [stats, setStats] = useState({
    totalClasses: 0,
    configuredClasses: 0,
    totalArms: 0,
    inactiveClasses: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  const handleSave = async () => {
    if (!tabRef.current?.save) return;
    setSaving(true);
    try {
      await tabRef.current.save();
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer title="Class Structure" description="Manage class arms">
      <Breadcrumb title="Class Structure" items={BCrumb} />

      <Alert severity="info" sx={{ mb: 2 }}>
        1. Set how many arms each class needs → 2. Click <strong>Generate</strong> to create
        A, B, C... names → 3. Edit any arm's name if you'd rather use something else, then Save.
      </Alert>

      <Grid container spacing={1.5} sx={{ mb: 2 }}>
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

      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Box
          sx={{
            bgcolor: 'background.paper',
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'auto',
          }}
        >
          <SetUpClassesTab
            ref={tabRef}
            onStatsChange={(s, loading) => {
              setStats(s);
              setStatsLoading(loading);
            }}
          />
        </Box>

        {/* Save button — full width on xs, right-aligned on sm+ */}
        <Box sx={{ display: 'flex', justifyContent: { xs: 'stretch', sm: 'flex-end' }, mt: 2 }}>
          <Button variant="contained" size="small" onClick={handleSave} disabled={saving} sx={{ width: { xs: '100%', sm: 'auto' }, minWidth: { sm: 140 } }}>
            {saving ? <CircularProgress size={16} color="inherit" /> : 'Save Changes'}
          </Button>
        </Box>
      </Box>
    </PageContainer>
  );
};

export default ClassStructureManager;
