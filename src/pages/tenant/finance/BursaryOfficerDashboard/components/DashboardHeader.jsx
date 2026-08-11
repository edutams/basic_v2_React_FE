import React, { useState } from 'react';
import { Box, Typography, FormControl, Select, MenuItem, Button, Menu, useTheme } from '@mui/material';
import { Event, Download, FilterAlt } from '@mui/icons-material';

/**
 * Header — title + data-as-of line, session/term selectors, export button and
 * class-status filter menu.
 */
const DashboardHeader = ({
  dataAsOf,
  sessions,
  selectedSession,
  onSessionChange,
  termsForSession,
  selectedTerm,
  onTermChange,
  onExport,
  statusFilter,
  onStatusFilterChange,
}) => {
  const theme = useTheme();
  const [filterAnchor, setFilterAnchor] = useState(null);

  return (
    <Box
      sx={{
        mb: 3,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 2,
        alignItems: 'flex-start',
        justifyContent: 'space-between',
      }}
    >
      <Box>
        <Typography variant="h4" fontWeight={800}>
          Bursary Officer Dashboard
        </Typography>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 0.5 }}>
          Overview of revenue performance and collections
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 1 }}>
          <Event sx={{ fontSize: 14, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            Data as of {dataAsOf}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
        {/* Session */}
        <FormControl size="small" sx={{ minWidth: 170 }}>
          <Select
            value={selectedSession}
            onChange={(e) => onSessionChange(e.target.value)}
            displayEmpty
            sx={{
              bgcolor: 'background.paper',
              borderRadius: 2,
              fontWeight: 600,
              '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
            }}
          >
            {sessions.length === 0 && <MenuItem value="">All Sessions</MenuItem>}
            {sessions.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Term */}
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <Select
            value={selectedTerm}
            onChange={(e) => onTermChange(e.target.value)}
            displayEmpty
            renderValue={(v) => (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                {v && (
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
                )}
                <Typography variant="body2" fontWeight={600}>
                  {v || 'Select Term'}
                </Typography>
              </Box>
            )}
            sx={{
              bgcolor: 'background.paper',
              borderRadius: 2,
              '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
            }}
          >
            {termsForSession.map((t) => (
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="outlined"
          color="inherit"
          startIcon={<Download />}
          onClick={onExport}
          sx={{
            borderRadius: 2,
            borderColor: theme.palette.divider,
            color: 'text.primary',
            fontWeight: 600,
            '&:hover': { borderColor: 'text.secondary' },
          }}
        >
          Export Report
        </Button>

        <Button
          variant="contained"
          startIcon={<FilterAlt />}
          onClick={(e) => setFilterAnchor(e.currentTarget)}
          sx={{ borderRadius: 2, fontWeight: 700 }}
        >
          Filter
        </Button>
        <Menu
          anchorEl={filterAnchor}
          open={Boolean(filterAnchor)}
          onClose={() => setFilterAnchor(null)}
        >
          {[
            { value: 'all', label: 'All Classes' },
            { value: 'excellent', label: 'Excellent' },
            { value: 'pending', label: 'Pending' },
            { value: 'poor', label: 'Poor' },
          ].map((opt) => (
            <MenuItem
              key={opt.value}
              selected={statusFilter === opt.value}
              onClick={() => {
                onStatusFilterChange(opt.value);
                setFilterAnchor(null);
              }}
            >
              {opt.label}
            </MenuItem>
          ))}
        </Menu>
      </Box>
    </Box>
  );
};

export default DashboardHeader;
