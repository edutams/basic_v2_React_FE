import React from 'react';
import { Box, Tabs, Tab, Button } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { SwapHoriz as MigrateIcon } from '@mui/icons-material';

/** Shared "Class Teacher Allocation | Subject Teacher Allocation" sub-tab
 * switcher — rendered by each allocation tab itself (below its own stat
 * cards), not by the parent TeachingAllocations.jsx, so the stat cards sit
 * above this row rather than above it.
 *
 * `rightSlot` lets a caller replace the default "Migrate from Previous
 * Term" button with its own right-aligned action row (e.g. Class Teacher
 * Allocation's Auto-Allocate/Bulk Upload/Download Template buttons) — the
 * Migrate action itself still has to live somewhere, so callers that pass
 * `rightSlot` are expected to include it themselves. */
const AllocationSubTabs = ({ activeTab, onTabChange, onOpenMigrate, rightSlot }) => (
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
      sx={{
        minHeight: 0,
        '& .MuiTab-root': {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '15px',
          minHeight: 0,
          py: 1,
          borderRadius: '8px 8px 0 0',
        },
        '& .Mui-selected': {
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
        },
      }}
    >
      <Tab label="Class Teacher Allocation" value="class" />
      <Tab label="Subject Teacher Allocation" value="subject" />
    </Tabs>

    {rightSlot || (
      <Button
        variant="contained"
        size="small"
        startIcon={<MigrateIcon />}
        onClick={onOpenMigrate}
        sx={{ whiteSpace: 'nowrap', mb: 1 }}
      >
        Migrate from Previous Term
      </Button>
    )}
  </Box>
);

export default AllocationSubTabs;
