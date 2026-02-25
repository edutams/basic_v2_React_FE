import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab, Paper } from '@mui/material';
import SchoolRoleBasedAccess from 'src/components/tenant-components/alc-manager/SchoolRoleBasedAccess';
import SchoolPermissionBased from 'src/components/tenant-components/alc-manager/SchoolPermissionBased';

const SchoolAccessAnalysis = () => {
  const [subActiveTab, setSubActiveTab] = useState('Role Based');

  const handleSubTabChange = (event, newValue) => {
    setSubActiveTab(newValue);
  };

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Box sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={subActiveTab}
          onChange={handleSubTabChange}
          aria-label="access analysis sub-tabs"
        >
          <Tab label="Role Based" value="Role Based" />
          <Tab label="Permission Based" value="Permission Based" />
        </Tabs>
      </Box>

      {subActiveTab === 'Role Based' && (
        <Box sx={{ p: 2 }}>
          <SchoolRoleBasedAccess />
        </Box>
      )}

      {subActiveTab === 'Permission Based' && (
        <Box sx={{ p: 2 }}>
          <SchoolPermissionBased />
        </Box>
      )}
    </Paper>
  );
};

export default SchoolAccessAnalysis;
