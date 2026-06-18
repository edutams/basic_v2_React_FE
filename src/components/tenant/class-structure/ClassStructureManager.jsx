import { useRef, useState } from 'react';
import { Box, Typography, Button, CircularProgress, Alert } from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import SetUpClassesTab from '@/pages/tenant/school-setup/components/SetUpClassesTab';

const BCrumb = [
  { to: '/', title: 'Home' },
  { to: '/dashboard', title: 'Dashboard' },
  { title: 'Class Structure' },
];

const ClassStructureManager = () => {
  const tabRef = useRef(null);
  const [saving, setSaving] = useState(false);

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
        Set class arms, generate, then edit names if needed.
      </Alert>

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
          <SetUpClassesTab ref={tabRef} />
        </Box>

        {/* Save button — full width on xs, right-aligned on sm+ */}
        <Box sx={{ display: 'flex', justifyContent: { xs: 'stretch', sm: 'flex-end' }, mt: 2 }}>
          <Button
            size="small"
            onClick={handleSave}
            disabled={saving}
            sx={{ width: { xs: '100%', sm: 'auto' }, minWidth: { sm: 140 } }}
          >
            {saving ? <CircularProgress size={16} color="inherit" /> : 'Save Changes'}
          </Button>
        </Box>
      </Box>
    </PageContainer>
  );
};

export default ClassStructureManager;
