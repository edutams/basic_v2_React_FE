import React from 'react';
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
} from '@mui/material';
import { IconTrash } from '@tabler/icons';
import PropTypes from 'prop-types';

const HolidayTable = ({ 
  holidays = [], 
  onHolidayAction,
  isLoading = false 
}) => {
  const handleAction = (action, holiday) => {
    onHolidayAction(action, holiday);
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
            <TableCell sx={{ fontWeight: 'bold' }} align="center">Action</TableCell>
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
              <TableRow key={holiday.id} sx={{ '&:hover': { backgroundColor: 'grey.50' } }}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{holiday.sessionTerm}</TableCell>
                <TableCell>{holiday.weekName}</TableCell>
                <TableCell>{holiday.holiday_description}</TableCell>
                <TableCell>{holiday.holiday_date}</TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    onClick={() => handleAction('delete', holiday)}
                    sx={{ color: 'error.main' }}
                  >
                    <IconTrash size={16} />
                  </IconButton>
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