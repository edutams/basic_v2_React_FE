import React from 'react';
import { Box, Tabs, Tab, Button } from '@mui/material';
import { SwapHoriz as MigrateIcon } from '@mui/icons-material';

/** Shared "Class Teacher Allocation | Subject Teacher Allocation" sub-tab
 * switcher + "Migrate from Previous Term" button — rendered by each
 * allocation tab itself (below its own stat cards), not by the parent
 * TeachingAllocations.jsx, so the stat cards sit above this row rather
 * than above it. */
const AllocationSubTabs = ({ activeTab, onTabChange, onOpenMigrate }) => (
  <Box
    sx={{
      borderBottom: 1,
      borderColor: 'divider',
      mb: 2,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 1,
    }}
  >
    <Tabs
      value={activeTab}
      onChange={(e, newValue) => onTabChange(newValue)}
      sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '15px' } }}
    >
      <Tab label="Class Teacher Allocation" value="class" />
      <Tab label="Subject Teacher Allocation" value="subject" />
    </Tabs>

    <Button
      variant="contained"
      size="small"
      startIcon={<MigrateIcon />}
      onClick={onOpenMigrate}
      sx={{ whiteSpace: 'nowrap', mb: 1 }}
    >
      Migrate from Previous Term
    </Button>
  </Box>
);

export default AllocationSubTabs;
