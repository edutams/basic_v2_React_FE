import { useRef, useState } from 'react';
import { Box, Typography, Button, CircularProgress, Alert } from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import PageContainer from 'src/components/container/PageContainer';
import Breadcrumb from 'src/layouts/full/shared/breadcrumb/Breadcrumb';
import SetUpClassesTab from 'src/views/school-setup/components/SetUpClassesTab';

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

      <Alert severity="info">
       Set class arms, generate, then edit names if needed.
      </Alert>

      <Box mt={2} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
     
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            bgcolor: '#fff',
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <SetUpClassesTab ref={tabRef} />
        </Box>

        {/* Save button — bottom right */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
  <Button
    size="small"
    variant="contained"
    onClick={handleSave}
    disabled={saving}
    sx={{
      minWidth: 140,
    }}
  >
    {saving ? (
      <CircularProgress size={16} color="inherit" />
    ) : (
      'Save Changes'
    )}
  </Button>
</Box>
      </Box>
    </PageContainer>
  );
};

export default ClassStructureManager;
