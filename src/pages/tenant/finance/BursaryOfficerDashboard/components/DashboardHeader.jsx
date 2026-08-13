import React, { useState } from 'react';
import {
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Button,
  Menu,
  ListItemIcon,
  ListItemText,
  useTheme,
} from '@mui/material';
import {
  Event,
  Download,
  ArrowDropDown,
  TableChart,
  PictureAsPdf,
} from '@mui/icons-material';

/**
 * Header — title + data-as-of line, session/term selectors and an
 * Excel/PDF export dropdown (mirrors the export menu used across the project).
 */
const DashboardHeader = ({
  dataAsOf,
  sessions,
  selectedSession,
  onSessionChange,
  termsForSession,
  selectedTerm,
  onTermChange,
  onExportExcel,
  onExportPdf,
  exporting,
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClose = () => setAnchorEl(null);

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
        {/* Data as of — commented out per request
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 1 }}>
          <Event sx={{ fontSize: 14, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            Data as of {dataAsOf}
          </Typography>
        </Box>
        */}
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
          endIcon={<ArrowDropDown />}
          disabled={Boolean(exporting)}
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{
            borderRadius: 2,
            borderColor: theme.palette.divider,
            color: 'text.primary',
            fontWeight: 600,
            '&:hover': { borderColor: 'text.secondary' },
          }}
        >
          {exporting ? 'Preparing…' : 'Export Report'}
        </Button>

        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          PaperProps={{ sx: { borderRadius: 2, minWidth: 180 } }}
        >
          <MenuItem
            onClick={() => {
              handleClose();
              if (onExportExcel) onExportExcel();
            }}
          >
            <ListItemIcon>
              <TableChart fontSize="small" sx={{ color: 'success.main' }} />
            </ListItemIcon>
            <ListItemText>Export Excel (.xlsx)</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleClose();
              if (onExportPdf) onExportPdf();
            }}
          >
            <ListItemIcon>
              <PictureAsPdf fontSize="small" sx={{ color: 'error.main' }} />
            </ListItemIcon>
            <ListItemText>Export PDF (.pdf)</ListItemText>
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default DashboardHeader;
