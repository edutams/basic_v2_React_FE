import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Menu,
  ListItemIcon,
  ListItemText,
  useTheme,
} from '@mui/material';
import {
  Download,
  ArrowDropDown,
  TableChart,
  PictureAsPdf,
} from '@mui/icons-material';

/**
 * Header — title + Excel/PDF export dropdown.
 * Session/term filtering is now automatic (active session term).
 */
const DashboardHeader = ({
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
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
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
