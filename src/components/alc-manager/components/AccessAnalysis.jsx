import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab, Alert, Paper } from '@mui/material';
import RoleBasedAcess from 'src/components/alc-manager/components/RoleBasedAcess';
import PermissionBased from 'src/components/alc-manager/components/PermissionBased';

const AccessAnalysis = () => {
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
          <RoleBasedAcess />
        </Box>
      )}

      {subActiveTab === 'Permission Based' && (
        <Box sx={{ p: 2 }}>
          <PermissionBased />
        </Box>
      )}
    </Paper>
  );
};

export default AccessAnalysis;
