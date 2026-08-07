import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab, Paper } from '@mui/material';
import SchoolRoleBasedAccess from '@/components/tenant/alc-manager/SchoolRoleBasedAccess';
import SchoolPermissionBased from '@/components/tenant/alc-manager/SchoolPermissionBased';
import ShowTourGuideButton from '@/components/shared/ShowTourGuideButton';

const SchoolAccessAnalysis = () => {
  const [subActiveTab, setSubActiveTab] = useState('Role Based');

  const handleSubTabChange = (event, newValue) => {
    setSubActiveTab(newValue);
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box
        sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        flexWrap="wrap"
        gap={1}
      >
        <Tabs
          value={subActiveTab}
          onChange={handleSubTabChange}
          aria-label="access analysis sub-tabs"
          data-tour="acl-analysis-tabs"
        >
          <Tab label="Role Based" value="Role Based" />
          <Tab label="Permission Based" value="Permission Based" />
        </Tabs>
        <ShowTourGuideButton />
      </Box>

      <Box data-tour="acl-analysis-content">
        {subActiveTab === 'Role Based' && (
          <Box sx={{ p: 2 }} data-tour="acl-analysis-role">
            <SchoolRoleBasedAccess />
          </Box>
        )}

        {subActiveTab === 'Permission Based' && (
          <Box sx={{ p: 2 }} data-tour="acl-analysis-permission">
            <SchoolPermissionBased />
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default SchoolAccessAnalysis;
