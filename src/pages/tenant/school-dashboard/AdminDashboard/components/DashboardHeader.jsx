import React, { useState } from 'react';
import { Box, Typography, Button, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { WavingHand, Download, ArrowDropDown, TableChart, PictureAsPdf } from '@mui/icons-material';
import { ORANGE } from '../constants';

/**
 * Dashboard header — welcome greeting + Download Report dropdown
 * (Excel / PDF), mirroring the export menu used across the project.
 */
const DashboardHeader = ({ onExportExcel, onExportPdf, exporting }) => {
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
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Box>
        <Typography variant="h4" fontWeight={800}>
          Welcome back, Admin!{' '}
          <WavingHand sx={{ fontSize: 22, verticalAlign: 'middle', color: ORANGE }} />
        </Typography>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 0.5 }}>
          Here's an overview of your school today.
        </Typography>
      </Box>

      <Button
        variant="contained"
        startIcon={<Download />}
        endIcon={<ArrowDropDown />}
        disabled={Boolean(exporting)}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{ borderRadius: 2, fontWeight: 700 }}
      >
        {exporting ? 'Preparing…' : 'Download Report'}
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
  );
};

export default DashboardHeader;
