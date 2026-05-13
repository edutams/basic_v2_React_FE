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
  onNoOfArmsChange,
  onGenerateArms,
  onArmNameChange,
  isLoading = false 
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

  const renderArms = (structure) => {
    const isInactive = structure.status === 'inactive';
    
    if (isInactive) {
      // Display read-only arms for inactive classes
      if (!structure.arms || structure.arms.length === 0) {
        return (
          <Typography variant="body2" color="text.secondary" sx={{ p: 1 }}>
            No arms created yet
          </Typography>
        );
      }
      
      return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {structure.arms.map((arm, i) => (
            <TextField
              key={i}
              size="small"
              value={arm.arm_names}
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
    }
    
    // Editable arms for active classes
    return (
      <Box>
        <Box display="flex" gap={1} alignItems="center" mb={1}>
          <TextField
            size="small"
            type="number"
            value={structure.no_of_arms || 0}
            slotProps={{ htmlInput: { min: 0 } }}
            onChange={(e) => onNoOfArmsChange && onNoOfArmsChange(structure.id, e.target.value)}
            sx={{
              width: 70,
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'background.paper',
                borderRadius: '8px',
                '& fieldset': { borderColor: 'divider' },
                '&:hover fieldset': { borderColor: 'text.disabled' },
                '&.Mui-focused fieldset': { borderColor: 'primary.main', borderWidth: '2px' },
              },
            }}
          />
          <Button
            variant="contained"
            size="small"
            disabled={!structure.no_of_arms || structure.no_of_arms === 0 || structure.no_of_arms === '0'}
            onClick={() => onGenerateArms && onGenerateArms(structure.id)}
          >
            Generate
          </Button>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {structure.arm_names && structure.arm_names.length > 0 ? (
            structure.arm_names.map((armName, i) => (
              <TextField
                key={i}
                size="small"
                value={armName}
                slotProps={{ htmlInput: { min: 0 } }}
                onChange={(e) => onArmNameChange && onArmNameChange(structure.id, i, e.target.value)}
                sx={{
                  width: 90,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'background.paper',
                    borderRadius: '8px',
                    '& fieldset': { borderColor: 'divider' },
                    '&:hover fieldset': { borderColor: 'text.disabled' },
                    '&.Mui-focused fieldset': { borderColor: 'primary.main', borderWidth: '2px' },
                  },
                }}
              />
            ))
          ) : (
            <Typography variant="body2" color="text.info" sx={{ p: 1 }}>
              Click Generate to create arms
            </Typography>
          )}
        </Box>
      </Box>
    );
  };

  return (
    <>
      <TableContainer 
        component={Paper} 
        variant="outlined"
        sx={{ 
          maxHeight: 600, 
          overflow: 'auto',
          '& .MuiTable-root': {
            minWidth: 650
          }
        }}
      >
        <Table stickyHeader>
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
                    {/* <Typography variant="body2" fontWeight={600}>
                      {structure.class_name}
                    </Typography> */}
                    {structure.class_code && (
                      <Typography variant="body2" >
                        {structure.class_code}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{renderArms(structure)}</TableCell>
                  <TableCell>
                    <Chip
                      label={structure.status === 'active' ? 'active' : 'inactive'}
                      color={structure.status === 'active' ? 'success' : 'error'}
                      size="small"
                      sx={{
                        bgcolor: structure.status === 'active' ? '#dcfce7' : '#fef3c7',
                        color: structure.status === 'active' ? '#166534' : '#92400e',
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      size="small"
                      variant="outlined"
                      color={structure.status === 'active' ? 'error' : 'success'}
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
            Are you sure you want to <strong>{isActive ? 'deactivate' : 'activate'}</strong> the
            class <strong>{confirm.structure?.class_name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            color={isActive ? 'error' : 'success'}
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
  onNoOfArmsChange: PropTypes.func,
  onGenerateArms: PropTypes.func,
  onArmNameChange: PropTypes.func,
  isLoading: PropTypes.bool,
};

export default ClassStructureTable;
