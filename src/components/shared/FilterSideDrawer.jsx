import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  Stack,
  TextField,
  MenuItem,
  Divider,
} from '@mui/material';
import { IconX, IconFilter, IconRefresh } from '@tabler/icons-react';

/**
 * FilterSideDrawer — a reusable toggleable side drawer for filters.
 *
 * Props:
 *   open        {boolean}   — controlled open state
 *   onClose     {function}  — called when drawer should close
 *   onApply     {function}  — called with { [fieldKey]: value } when Apply is clicked
 *   onReset     {function}  — called when Reset is clicked
 *   filters     {Array}     — filter field definitions (see below)
 *   anchor      {string}    — 'right' | 'left' (default: 'right')
 *   title       {string}    — drawer heading (default: 'Filters')
 *
 * Filter field definition:
 *   {
 *     key:         string,           // unique key, used in the values object
 *     label:       string,           // field label
 *     type:        'text'            // free-text input
 *               | 'select'          // dropdown — requires `options`
 *               | 'date',           // date picker (native)
 *     options:     [{ value, label }], // required for type='select'
 *     placeholder: string,           // optional placeholder
 *     defaultValue: any,             // optional default
 *   }
 *
 * Usage example:
 *   <FilterSideDrawer
 *     open={drawerOpen}
 *     onClose={() => setDrawerOpen(false)}
 *     onApply={(vals) => setActiveFilters(vals)}
 *     onReset={() => setActiveFilters({})}
 *     filters={[
 *       { key: 'status', label: 'Status', type: 'select', options: [
 *           { value: 'pending', label: 'Pending' },
 *           { value: 'approved', label: 'Approved' },
 *       ]},
 *       { key: 'name', label: 'School Name', type: 'text', placeholder: 'Search name…' },
 *       { key: 'created_at', label: 'Date From', type: 'date' },
 *     ]}
 *   />
 */
const FilterSideDrawer = ({
  open,
  onClose,
  onApply,
  onReset,
  onFilterChange, // New callback for individual filter changes
  filters = [],
  anchor = 'right',
  title = 'Filters',
}) => {
  const buildDefaults = () =>
    filters.reduce((acc, f) => {
      acc[f.key] = f.defaultValue ?? '';
      return acc;
    }, {});

  const [values, setValues] = useState(buildDefaults);

  // Only reset values when the drawer is opened or filter keys change (not when options change)
  useEffect(() => {
    setValues(buildDefaults());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, filters.map((f) => f.key).join(',')]);

  const handleChange = (key, val) => {
    setValues((prev) => ({ ...prev, [key]: val }));
    // Notify parent component of the change
    onFilterChange?.(key, val);
  };

  const handleApply = () => {
    onApply?.(values);
    onClose?.();
  };

  const handleReset = () => {
    const defaults = buildDefaults();
    setValues(defaults);
    onReset?.(defaults);
  };

  return (
    <Drawer
      anchor={anchor}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 320 },
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2.5,
          py: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <IconFilter size={18} />
          <Typography variant="h6" fontWeight={700}>
            {title}
          </Typography>
        </Stack>
        <IconButton size="small" onClick={onClose} aria-label="Close filter drawer">
          <IconX size={18} />
        </IconButton>
      </Box>

      {/* Filter fields */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 2.5, py: 2.5 }}>
        <Stack spacing={2.5}>
          {filters.map((f) => {
            if (f.type === 'select') {
              return (
                <TextField
                  key={f.key}
                  select
                  fullWidth
                  size="small"
                  label={f.label}
                  value={values[f.key] ?? ''}
                  onChange={(e) => handleChange(f.key, e.target.value)}
                >
                  <MenuItem value="">
                    <em>All</em>
                  </MenuItem>
                  {(f.options || []).map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </TextField>
              );
            }

            if (f.type === 'date') {
              return (
                <TextField
                  key={f.key}
                  fullWidth
                  size="small"
                  type="date"
                  label={f.label}
                  value={values[f.key] ?? ''}
                  onChange={(e) => handleChange(f.key, e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              );
            }

            // default: text
            return (
              <TextField
                key={f.key}
                fullWidth
                size="small"
                label={f.label}
                placeholder={f.placeholder || ''}
                value={values[f.key] ?? ''}
                onChange={(e) => handleChange(f.key, e.target.value)}
              />
            );
          })}
        </Stack>
      </Box>

      <Divider />

      {/* Footer actions */}
      <Box sx={{ px: 2.5, py: 2 }}>
        <Stack direction="row" spacing={1.5}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<IconRefresh size={16} />}
            onClick={handleReset}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Reset
          </Button>
          <Button
            fullWidth
            variant="contained"
            onClick={handleApply}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              bgcolor: '#3949ab',
              '&:hover': { bgcolor: '#303f9f' },
            }}
          >
            Apply Filters
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
};

export default FilterSideDrawer;
