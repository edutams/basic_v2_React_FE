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
  Chip,
  Box,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
} from '@mui/icons-material';
import PropTypes from 'prop-types';

const ClassStructureTable = ({ 
  classStructures = [], 
  onToggleStatus, 
  isLoading = false 
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedStructure, setSelectedStructure] = useState(null);

  const handleMenuOpen = (event, structure) => {
    setAnchorEl(event.currentTarget);
    setSelectedStructure(structure);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedStructure(null);
  };

  const handleAction = (action) => {
    switch (action) {
      case 'toggle-status':
        onToggleStatus(selectedStructure);
        break;
      default:
        break;
    }
    handleMenuClose();
  };

  const getStatusChip = (status) => {
    const color = status === 'active' ? 'success' : 'error';
    const label = status === 'active' ? 'Active' : 'Inactive';
    
    return (
      <Chip
        label={label}
        color={color}
        size="small"
        variant="outlined"
      />
    );
  };

  const renderArms = (arms) => {
    if (!arms || !Array.isArray(arms) || arms.length === 0) {
      return <Typography variant="body2" color="text.secondary">No arms</Typography>;
    }

    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {arms.map((arm, index) => (
          <Chip
            key={index}
            label={arm}
            size="small"
            variant="outlined"
            sx={{ fontSize: '0.75rem' }}
          />
        ))}
      </Box>
    );
  };

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold', width: '60px' }}>S/N</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Classes</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Arms</TableCell>
            <TableCell sx={{ fontWeight: 'bold', width: '120px' }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 'bold', width: '80px' }} align="center">
              Actions
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
              <TableRow 
                key={structure.id} 
                hover
            
              >
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    {structure.class_name}
                  </Typography>
                </TableCell>
                <TableCell>
                  {renderArms(structure.arms)}
                </TableCell>
                <TableCell>
                  {getStatusChip(structure.status)}
                </TableCell>
                <TableCell align="center">
                  <IconButton 
                    size="small" 
                    onClick={(e) => handleMenuOpen(e, structure)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl) && selectedStructure?.id === structure.id}
                    onClose={handleMenuClose}
                  >
                    <MenuItem onClick={() => handleAction('toggle-status')}>
                      {structure.status === 'active' ? (
                        <>
                          <ToggleOffIcon sx={{ mr: 1, fontSize: 18 }} />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <ToggleOnIcon sx={{ mr: 1, fontSize: 18 }} />
                          Activate
                        </>
                      )}
                    </MenuItem>
                  </Menu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} align="center">
                <Typography variant="body1" color="textSecondary" sx={{ py: 4 }}>
                  No class structures found
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

ClassStructureTable.propTypes = {
  classStructures: PropTypes.array,
  onToggleStatus: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default ClassStructureTable;
