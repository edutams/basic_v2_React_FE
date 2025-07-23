import React, { useState, useEffect } from 'react';
import {
  Box,
  Tab,
  Tabs,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Snackbar,
  Alert
} from '@mui/material';
import { Add as AddIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';
import Breadcrumb from 'src/layouts/full/shared/breadcrumb/Breadcrumb';
import PageContainer from 'src/components/container/PageContainer';
import ParentCard from 'src/components/shared/ParentCard';
import ReusableModal from 'src/components/shared/ReusableModal';
import CreateDivision from './component/CreateDivision';
import CreateCategory from './component/CreateCategory';

const BCrumb = [
  { to: '/', title: 'Home' },
  { title: 'School Structure' },
];

const defaultData = [
  {
    id: 1,
    division: 'Primary',
    programme: 'Basic Education',
    class: 'Class 1',
    description: 'Primary education program',
    status: 'Active',
    categories: { Private: false, Public: true, Unapproved: false, Community: false },
  },
];

const ClassAndDivisionManager = () => {
  const [tab, setTab] = useState('category');
  const [classes, setClasses] = useState([]);
  const [openCreateDivision, setOpenCreateDivision] = useState(false);
  const [divisionForm, setDivisionForm] = useState({
    name: '',
    code: '',
    description: '',
    status: '',
    programme: '', // Added programme to initial state
    categories: {
      Private: false,
      Public: false,
      Unapproved: false,
      Community: false,
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editId, setEditId] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedDivisionId, setSelectedDivisionId] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    try {
      const savedClasses = JSON.parse(localStorage.getItem('classes')) || [];
      if (savedClasses.length === 0) {
        setClasses([]); // Show empty state if no data
      } else {
        setClasses(savedClasses);
      }
    } catch (error) {
      console.error('Failed to load classes from localStorage:', error);
      setClasses([]);
    }
  }, []);

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const handleCreateDivisionChange = (newValue) => {
    setDivisionForm(newValue);
  };

  const handleCreateDivisionCancel = () => {
    setOpenCreateDivision(false);
    setEditId(null);
    setDivisionForm({
      name: '',
      code: '',
      description: '',
      status: '',
      programme: '', // Reset programme
      categories: {
        Private: false,
        Public: false,
        Unapproved: false,
        Community: false,
      },
    });
  };

  const handleCreateDivisionSubmit = (formData) => {
    setIsSubmitting(true);
    const updatedClasses = [...classes];
    const newDivision = {
      id: editId || Date.now(),
      division: formData.name, 
      programme: formData.categoryName, 
      class: formData.code || '',
      description: formData.description,
      status: formData.status,
      categories: formData.categories,
    };

    if (editId) {
      // Update existing division
      const index = updatedClasses.findIndex((c) => c.id === editId);
      updatedClasses[index] = newDivision;
    } else {
      // Add new division
      updatedClasses.push(newDivision);
    }

    setClasses(updatedClasses);
    try {
      localStorage.setItem('classes', JSON.stringify(updatedClasses));
    } catch (error) {
      console.error('Failed to save classes to localStorage:', error);
    }

    setIsSubmitting(false);
    setOpenCreateDivision(false);
    setEditId(null);
    setDivisionForm({
      name: '',
      code: '',
      description: '',
      status: '',
      programme: '',
      categories: {
        Private: false,
        Public: false,
        Unapproved: false,
        Community: false,
      },
    });
    setSnackbarMessage(editId ? 'Category updated successfully' : 'Category added successfully');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const handleActionMenuOpen = (event, id) => {
    setAnchorEl(event.currentTarget);
    setSelectedDivisionId(id);
  };

  const handleActionMenuClose = () => {
    setAnchorEl(null);
    setSelectedDivisionId(null);
  };

  const handleDeleteDivision = () => {
    const updatedClasses = classes.filter((c) => c.id !== selectedDivisionId);
    setClasses(updatedClasses);
    try {
      localStorage.setItem('classes', JSON.stringify(updatedClasses));
    } catch (error) {
      console.error('Failed to save classes to localStorage:', error);
    }
    setSnackbarMessage('Category deleted successfully');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
    handleActionMenuClose();
  };

  const handleEditDivision = () => {
    const division = classes.find((c) => c.id === selectedDivisionId);
    if (division) {
      setDivisionForm({
        name: division.division,
        code: division.class,
        description: division.description,
        status: division.status,
        categories: division.categories,
        programme: division.programme,
      });
      setEditId(division.id);
      setOpenCreateDivision(true);
      handleActionMenuClose();
    }
  };

  return (
    <PageContainer title="Class and Division Manager" description="Manage classes and divisions">
      <Breadcrumb title="School Structure" items={BCrumb} />

      <Box sx={{ borderBottom: 1, borderColor: 'divider', marginBottom: 2 }}>
        <Tabs value={tab} onChange={handleTabChange} aria-label="school structure tabs">
          <Tab label="Category" value="category" />
          <Tab label="Emis Central" value="emis_central" />
        </Tabs>
      </Box>

      {tab === 'category' && (
        <ParentCard
          key="category-card"
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <span>School Structure Category</span>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => setOpenCreateDivision(true)}
                sx={{ ml: 2 }}
                aria-label="Create new category"
              >
                Create Category
              </Button>
            </Box>
          }
        >
          <Paper variant="outlined">
            <TableContainer>
              <Table sx={{ whiteSpace: 'nowrap' }}>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <Typography variant="h6">S/N</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="h6">Programme Name</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="h6">Description</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="h6">Status</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="h6">Action</Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(() => {
                    const validClasses = classes.filter(c => c && c.programme && c.programme.trim() !== '');
                    if (validClasses.length === 0) {
                      return (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ padding: '40px 0' }}>
                            <Typography variant="h6" color="textSecondary">
                              No categories found
                            </Typography>
                          </TableCell>
                        </TableRow>
                      );
                    }
                    return validClasses.map((c, index) => (
                      <TableRow
                        key={c.id}
                        sx={{ '&:hover': { bgcolor: 'grey.50' }, '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell>
                          <Typography variant="subtitle2">{index + 1}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="h6" fontWeight="400">{c.programme}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="h6" fontWeight="400">{c.description}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            sx={{
                              bgcolor: c.status === 'Active' ? (theme) => theme.palette.success.light : (theme) => theme.palette.primary.light,
                              color: c.status === 'Active' ? (theme) => theme.palette.success.main : (theme) => theme.palette.primary.main,
                              borderRadius: '8px',
                            }}
                            size="small"
                            label={c.status || 'Unknown'}
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton onClick={(e) => handleActionMenuOpen(e, c.id)}>
                            <MoreVertIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ));
                  })()}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </ParentCard>
      )}

      {tab === 'emis_central' && (
        <ParentCard
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <span>School Structure</span>
              {/* <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => setOpenCreateDivision(true)}
                sx={{ ml: 2 }}
                aria-label="Create new division"
              >
                Create Division
              </Button> */}
            </Box>
          }
        >
          <Paper variant="outlined">
            <TableContainer>
              <Table sx={{ whiteSpace: 'nowrap' }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Division</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Programme</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Class/Arms</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {classes.map((c, index) => (
                    <TableRow key={c.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{c.division}</TableCell>
                      <TableCell>{c.programme}</TableCell>
                      <TableCell>{c.class}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </ParentCard>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleActionMenuClose}
        aria-label="Division actions menu"
      >
        <MenuItem onClick={handleEditDivision}>Edit</MenuItem>
        <MenuItem onClick={handleDeleteDivision}>Delete</MenuItem>
      </Menu>

      <ReusableModal
        open={openCreateDivision}
        onClose={handleCreateDivisionCancel}
        title={editId ? 'Edit Category' : 'Create Category'}
        size="medium"
      >
        <CreateCategory
          value={divisionForm}
          onChange={handleCreateDivisionChange}
          onCancel={handleCreateDivisionCancel}
          onSubmit={handleCreateDivisionSubmit}
          isSubmitting={isSubmitting}
        />
      </ReusableModal>
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
    </PageContainer>
  );
};

export default ClassAndDivisionManager;