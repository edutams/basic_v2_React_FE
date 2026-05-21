import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Menu,
  MenuItem,
} from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import PropTypes from 'prop-types';

const HolidayTable = ({ holidays = [], onHolidayAction, isLoading = false }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedHoliday, setSelectedHoliday] = useState(null);

  const handleMenuOpen = (event, holiday) => {
    setAnchorEl(event.currentTarget);
    setSelectedHoliday(holiday);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedHoliday(null);
  };

  const handleAction = (action) => {
    onHolidayAction(action, selectedHoliday);
    handleMenuClose();
  };

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: 'grey.100' }}>
            <TableCell sx={{ fontWeight: 'bold' }}>#</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Session-Term</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Week Name</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Holiday Date</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }} align="center">
              Action
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} align="center">
                <Typography>Loading...</Typography>
              </TableCell>
            </TableRow>
          ) : holidays.length > 0 ? (
            holidays.map((holiday, index) => (
              <TableRow key={holiday.id} hover>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{holiday.sessionTerm}</TableCell>
                <TableCell>{holiday.weekName}</TableCell>
                <TableCell>{holiday.holiday_description}</TableCell>
                <TableCell>{holiday.holiday_date}</TableCell>
                <TableCell align="center">
                  <IconButton size="small" onClick={(e) => handleMenuOpen(e, holiday)}>
                    <MoreVertIcon />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl) && selectedHoliday?.id === holiday.id}
                    onClose={handleMenuClose}
                  >
                    <MenuItem onClick={() => handleAction('edit')}>Edit</MenuItem>
                    <MenuItem onClick={() => handleAction('delete')}>Delete</MenuItem>
                  </Menu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} align="center">
                <Typography variant="body1" color="textSecondary">
                  No holidays found
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

HolidayTable.propTypes = {
  holidays: PropTypes.array,
  onHolidayAction: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default HolidayTable;
