import React, { useState } from 'react';
import {
  Box,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Snackbar,
  Alert,
} from '@mui/material';
import { MoreVert as MoreVertIcon, Add as AddIcon } from '@mui/icons-material';
import ReusableModal from 'src/components/shared/ReusableModal';
import CreateEditClassForm from './CreateEditClassForm';
import ConfirmationDialog from 'src/components/shared/ConfirmationDialog';

const ManageClassesModal = ({ open, onClose, division, onUpdateDivision }) => {
  const [createClassModalOpen, setCreateClassModalOpen] = useState(false);
  const [newClassForm, setNewClassForm] = useState({
    name: '',
    code: '',
    description: '',
    status: '',
  });
  const [editMode, setEditMode] = useState(false);
  const [classMenuAnchorEl, setClassMenuAnchorEl] = useState(null);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const handleOpenCreateClass = () => {
    setNewClassForm({ name: '', code: '', description: '', status: '' });
    setEditMode(false);
    setCreateClassModalOpen(true);
  };

  const handleCloseCreateClass = () => {
    setCreateClassModalOpen(false);
    setEditMode(false);
    setSelectedClassId(null);
  };

  const handleNewClassChange = (e) => {
    const { name, value } = e.target;
    setNewClassForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleClassMenuOpen = (event, classId) => {
    setClassMenuAnchorEl(event.currentTarget);
    setSelectedClassId(classId);
  };

  const handleClassMenuClose = () => {
    setClassMenuAnchorEl(null);
    setSelectedClassId(null);
  };

  const handleEditClass = () => {
    const cls = division?.programmes?.flatMap((prog) => prog.classes || []).find((c) => c.id === selectedClassId);
    if (cls) {
      setNewClassForm({
        name: cls.name,
        code: cls.code,
        description: cls.description,
        status: cls.status,
      });
      setEditMode(true);
      setCreateClassModalOpen(true);
    }
    handleClassMenuClose();
  };

  const handleDeleteClass = () => {
    setDeleteDialogOpen(true);
    handleClassMenuClose();
  };

  const handleConfirmDeleteClass = () => {
    const updatedDivision = { ...division };
    if (updatedDivision.programmes && updatedDivision.programmes[0]) {
      updatedDivision.programmes[0].classes = (updatedDivision.programmes[0].classes || []).filter(
        (c) => c.id !== selectedClassId
      );
    }
    onUpdateDivision(updatedDivision);
    setSnackbarMessage('Class deleted successfully');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
    setDeleteDialogOpen(false);
    setSelectedClassId(null);
  };

  const handleCancelDeleteClass = () => {
    setDeleteDialogOpen(false);
    setSelectedClassId(null);
  };

  const handleCreateClassSubmit = (form) => {
    if (!form.name || !form.code || !form.status) {
      setSnackbarMessage('Please fill all required fields');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    const updatedDivision = { ...division };
    if (!updatedDivision.programmes) updatedDivision.programmes = [{ id: Date.now(), name: '', classes: [] }];
    if (!updatedDivision.programmes[0]) updatedDivision.programmes[0] = { id: Date.now(), name: '', classes: [] };
    
    if (editMode) {
      // Edit existing class
      updatedDivision.programmes[0].classes = updatedDivision.programmes[0].classes.map((c) =>
        c.id === selectedClassId ? { ...c, ...form } : c
      );
      setSnackbarMessage('Class updated successfully');
    } else {
      // Add new class
      const newClass = {
        id: Date.now(),
        name: form.name,
        code: form.code,
        description: form.description,
        status: form.status,
        order: (updatedDivision.programmes[0].classes?.length || 0) + 1,
        arms: [],
      };
      updatedDivision.programmes[0].classes = [...(updatedDivision.programmes[0].classes || []), newClass];
      setSnackbarMessage('Class added successfully');
    }
    
    onUpdateDivision(updatedDivision);
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
    setCreateClassModalOpen(false);
    setEditMode(false);
    setSelectedClassId(null);
  };

  return (
    <ReusableModal
      open={open}
      onClose={onClose}
      title={
        division ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            Manage Class For
            <Chip
              label={division.division.split('(')[0].trim()}
              color="primary"
              size="small"
              sx={{ fontSize: '1rem', fontWeight: 500 }}
            />
            Division
          </Box>
        ) : ''
      }
      size="large"
    >
      {division && (
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenCreateClass}
            >
              Add Class
            </Button>
          </Box>
          <Paper variant="outlined">
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Class Name</TableCell>
                    <TableCell>Class Code</TableCell>
                    <TableCell>Class Order</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {division.programmes?.flatMap((prog) => prog.classes || []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No classes found
                      </TableCell>
                    </TableRow>
                  ) : (
                    division.programmes?.flatMap((prog) => prog.classes || []).map((cls, idx) => (
                      <TableRow key={cls.id}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>{cls.name}</TableCell>
                        <TableCell>{cls.code}</TableCell>
                        <TableCell>{cls.order}</TableCell>
                        <TableCell>{cls.description}</TableCell>
                        <TableCell>{cls.status}</TableCell>
                        <TableCell>
                          <IconButton onClick={(e) => handleClassMenuOpen(e, cls.id)}>
                            <MoreVertIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      )}
      <Menu
        anchorEl={classMenuAnchorEl}
        open={Boolean(classMenuAnchorEl)}
        onClose={handleClassMenuClose}
      >
        <MenuItem onClick={handleEditClass}>Edit Class</MenuItem>
        <MenuItem onClick={handleDeleteClass}>Delete Class</MenuItem>
      </Menu>
      <ReusableModal
        open={createClassModalOpen}
        onClose={handleCloseCreateClass}
        title={editMode ? 'Edit Class' : 'Create Class'}
        size="medium"
      >
        <CreateEditClassForm
          initialValues={newClassForm}
          onSubmit={handleCreateClassSubmit}
          onCancel={handleCloseCreateClass}
          mode={editMode ? 'edit' : 'create'}
        />
      </ReusableModal>
      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={handleCancelDeleteClass}
        onConfirm={handleConfirmDeleteClass}
        title="Delete Class"
        description="Are you sure you want to delete this class? This action cannot be undone."
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
    </ReusableModal>
  );
};

export default ManageClassesModal;