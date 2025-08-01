import React from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Alert,
  Divider,
  Menu,
  MenuItem,
  Snackbar
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import ReusableModal from 'src/components/shared/ReusableModal';
import CreateClassArmModal from './CreateClassArmModal';
import ConfirmationDialog from 'src/components/shared/ConfirmationDialog';

const StyledAlert = styled(Alert)(({ theme }) => ({
  backgroundColor: '#e0f7fa',
  color: '#00695c',
  border: 'none',
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(2),
  '& .MuiAlert-icon': {
    display: 'none',
  },
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 0,
  boxShadow: 'none',
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  backgroundColor: theme.palette.grey[100],
  '& .MuiTableCell-head': {
    fontWeight: 600,
    color: theme.palette.text.primary,
    fontSize: '0.875rem',
    padding: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    borderRight: `1px solid ${theme.palette.divider}`,
    '&:last-child': {
      borderRight: 'none',
    },
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(even)': {
    backgroundColor: theme.palette.grey[50],
  },
  '& .MuiTableCell-root': {
    padding: theme.spacing(1),
    borderBottom: `1px solid ${theme.palette.divider}`,
    borderRight: `1px solid ${theme.palette.divider}`,
    fontSize: '0.875rem',
    '&:last-child': {
      borderRight: 'none',
    },
  },
}));

const ClassArmChip = styled(Chip)(({ theme }) => ({
  backgroundColor: '#7C3AED',
  color: 'white',
  fontSize: '0.5rem',
  fontWeight: 600,
  margin: '1px',
  minWidth: '32px',
  height: '15px',
  borderRadius: 0,
  '& .MuiChip-label': {
    padding: '0 3px',
  },
}));

const ManageClassArm = ({ open, onClose, programme, division, onUpdateClassArms }) => {
  const [classes, setClasses] = React.useState([]);
  const [createClassArmOpen, setCreateClassArmOpen] = React.useState(false);
  const [editClassArmOpen, setEditClassArmOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [selectedClass, setSelectedClass] = React.useState(null);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');
  const [snackbarSeverity, setSnackbarSeverity] = React.useState('success');
  
  // Load existing class arms when modal opens
  React.useEffect(() => {
    if (open && programme?.classArms) {
      setClasses(programme.classArms);
    } else if (open) {
      setClasses([]);
    }
  }, [open, programme]);

  const handleMenuOpen = (event, classItem) => {
    setAnchorEl(event.currentTarget);
    setSelectedClass(classItem);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedClass(null);
  };

  const handleAttachClassArm = () => {
    setCreateClassArmOpen(true);
  };

  const handleSaveClassArm = (classArmData) => {
    // Create new class entry
    const newClass = {
      id: Date.now(),
      name: classArmData.class,
      order: classes.length + 1,
      arms: classArmData.arms,
      status: classArmData.status
    };
    
    // Add to classes array
    const updatedClasses = [...classes, newClass];
    setClasses(updatedClasses);
    
    // Update parent component
    if (onUpdateClassArms && programme && division) {
      onUpdateClassArms(programme.id, division.id, updatedClasses);
    }
    
    setCreateClassArmOpen(false);
  };

  const handleEditClass = () => {
    setEditClassArmOpen(true);
    handleMenuClose();
  };

  const handleDeleteClass = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleConfirmDelete = () => {
    if (selectedClass) {
      const updatedClasses = classes.filter(c => c.id !== selectedClass.id);
      setClasses(updatedClasses);
      
      // Update parent component
      if (onUpdateClassArms && programme && division) {
        onUpdateClassArms(programme.id, division.id, updatedClasses);
      }

      setSnackbarMessage('Class arm deleted successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    }
    setDeleteDialogOpen(false);
  };

  const handleEditClassArm = (classArmData) => {
    const updatedClasses = classes.map(c => 
      c.id === selectedClass.id 
        ? {
            ...c,
            name: classArmData.class,
            arms: classArmData.arms,
            status: classArmData.status
          }
        : c
    );
    
    setClasses(updatedClasses);
    
    // Update parent component
    if (onUpdateClassArms && programme && division) {
      onUpdateClassArms(programme.id, division.id, updatedClasses);
    }
    
    setEditClassArmOpen(false);
  };

  return (
    <>
      <ReusableModal
        open={open}
        onClose={onClose}
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            Manage Class Arm For
            <Chip
              label={programme?.name || 'KINDERGARTEN'}
              sx={{
                backgroundColor: '#fbbf24',
                color: 'white',
                fontSize: '0.5rem',
                fontWeight: 600,
                height: '15px',
                borderRadius: 0,
                padding: '0 8px',
              }}
            />
            Programme
          </Box>
        }
        size="large"
        maxWidth="lg"
      >
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="body1" sx={{ fontWeight: 400, color: 'text.primary' }}>
              SCHOOL STRUCTURE CLASS
            </Typography>
            <Button
              variant="contained"
              onClick={handleAttachClassArm}
              sx={{
                backgroundColor: '#7C3AED',
                color: 'white',
                textTransform: 'none',
                fontWeight: 500,
                borderRadius: 1,
              }}
            >
              Attach Class Arm
            </Button>
          </Box>
          <Divider sx={{ mb: 2 }} />

          <StyledAlert severity="info">
            Drag the rows to reorder class
          </StyledAlert>

          <StyledTableContainer component={Paper}>
            <Table>
              <StyledTableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Class Name</TableCell>
                  <TableCell>Class Order</TableCell>
                  <TableCell>Class Arms</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </StyledTableHead>
              <TableBody>
                {classes.map((classItem, index) => (
                  <StyledTableRow key={classItem.id}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {index + 1}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {classItem.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {classItem.order}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {classItem.arms.map((arm) => (
                          <ClassArmChip key={arm} label={arm} size="small" />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={classItem.status}
                        size="small"
                        sx={{
                          backgroundColor: classItem.status === 'Active' ? '#22c55e' : '#9e9e9e',
                          color: 'white',
                          fontWeight: 600,
                          borderRadius: 2,
                          fontSize: '0.5em',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={(e) => handleMenuOpen(e, classItem)}>
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </StyledTableContainer>
        </Box>
      </ReusableModal>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleEditClass}>
          Edit Class
        </MenuItem>
        <MenuItem onClick={handleDeleteClass}>
          Delete Class
        </MenuItem>
      </Menu>

      <CreateClassArmModal
        open={createClassArmOpen}
        onClose={() => setCreateClassArmOpen(false)}
        onSave={handleSaveClassArm}
        programme={programme}
      />

      <CreateClassArmModal
        open={editClassArmOpen}
        onClose={() => setEditClassArmOpen(false)}
        onSave={handleEditClassArm}
        programme={programme}
        editMode={true}
        initialData={selectedClass}
      />

      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Class Arm"
        message={`Are you sure you want to delete "${selectedClass?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        severity="error"
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ManageClassArm;
