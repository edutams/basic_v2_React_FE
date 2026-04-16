import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  Box,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import PropTypes from 'prop-types';

const ClassStructureTable = ({
  classStructures = [],
  onToggleStatus,
  isLoading = false,
}) => {
  const [confirm, setConfirm] = useState({ open: false, structure: null });

  const handleToggleClick = (structure) => {
    setConfirm({ open: true, structure });
  };

  const handleConfirm = () => {
    onToggleStatus(confirm.structure);
    setConfirm({ open: false, structure: null });
  };

  const handleClose = () => {
    setConfirm({ open: false, structure: null });
  };

  const isActive = confirm.structure?.status === 'active';

  const renderArms = (arms) => {
    if (!arms || arms.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ p: 1 }}>
          No arms
        </Typography>
      );
    }

    const armLabels = arms.flatMap((arm) => {
      const names = arm.arm_names;
      if (Array.isArray(names)) return names;
      if (typeof names === 'string') return [names];
      return [];
    });

    if (armLabels.length === 0) {
      return <Typography variant="body2" color="text.secondary">No arms</Typography>;
    }

    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {armLabels.map((name, i) => (
          <TextField
            key={i}
            size="small"
            value={name}
            disabled
            sx={{
              width: 90,
              '& .MuiInputBase-input.Mui-disabled': {
                WebkitTextFillColor: '#374151',
                fontSize: '0.8rem',
              },
              '& .MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-notchedOutline': {
                borderColor: '#d1d5db',
              },
            }}
          />
        ))}
      </Box>
    );
  };

  return (
    <>
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', width: '60px' }}>S/N</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '20%' }}>Class</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Arms</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '120px' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '130px' }} align="center">
                Action
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography>Loading...</Typography>
                </TableCell>
              </TableRow>
            ) : classStructures.length > 0 ? (
              classStructures.map((structure, index) => (
                <TableRow key={structure.id} hover>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {structure.class_name}
                    </Typography>
                    {structure.division && (
                      <Typography variant="caption" color="text.secondary">
                        {structure.division}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{renderArms(structure.arms)}</TableCell>
                  <TableCell>
                    <Chip
                      label={structure.status === 'active' ? 'Active' : 'Inactive'}
                      color={structure.status === 'active' ? 'success' : 'error'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      size="small"
                      variant="outlined"
                      color={structure.status === 'active' ? 'warning' : 'success'}
                      onClick={() => handleToggleClick(structure)}
                    >
                      {structure.status === 'active' ? 'Deactivate' : 'Activate'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body1" color="textSecondary" sx={{ py: 4 }}>
                    No classes found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Confirm Status Change Dialog — same pattern as SetCalendarTab */}
      <Dialog open={confirm.open} onClose={handleClose}>
        <DialogTitle>Confirm Status Change</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to{' '}
            <strong>{isActive ? 'deactivate' : 'activate'}</strong> the class{' '}
            <strong>{confirm.structure?.class_name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            color={isActive ? 'warning' : 'success'}
            autoFocus
          >
            {isActive ? 'Deactivate' : 'Activate'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

ClassStructureTable.propTypes = {
  classStructures: PropTypes.array,
  onToggleStatus: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default ClassStructureTable;
