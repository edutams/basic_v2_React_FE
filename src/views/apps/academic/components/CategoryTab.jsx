import React, { useState, useEffect } from 'react';
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
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  School as SchoolIcon,
  GridView as GridViewIcon,  
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import CreateCategory from '../components/CreateCategory';
import ConfirmationDialog from '../../../../components/shared/ConfirmationDialog';
import { useSnackbar } from '../../../../context/SnackbarContext';

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: 'none',
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  backgroundColor: theme.palette.grey[50],
  '& .MuiTableCell-head': {
    fontWeight: 600,
    color: theme.palette.text.primary,
    fontSize: '0.875rem',
    padding: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  '& .MuiTableCell-root': {
    padding: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}));

const SectionHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(2),
  padding: theme.spacing(1),
  backgroundColor: theme.palette.grey[50],
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
}));

const ActionMenuButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.primary.main,
  '&:hover': {
    backgroundColor: theme.palette.primary.light + '20',
  },
}));

// Mock data matching the image
const mockCategories = [
  {
    id: 1,
    sn: 1,
    programmeName: 'Private',
    description: 'Approved Private Schools',
    status: 'ACTIVE',
  },
  {
    id: 2,
    sn: 2,
    programmeName: 'Public',
    description: 'Government Owned Schools',
    status: 'ACTIVE',
  },
  {
    id: 3,
    sn: 3,
    programmeName: 'Unapproved',
    description: 'Unapproved Private Schools',
    status: 'ACTIVE',
  },
  {
    id: 4,
    sn: 4,
    programmeName: 'Community',
    description: 'Community Run Schools',
    status: 'ACTIVE',
  },
];

const CategoryTab = () => {
  const [categories, setCategories] = useState(() => {
    const stored = localStorage.getItem('categories');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create');
  const [formData, setFormData] = useState({
    programmeName: '',
    description: '',
    status: 'ACTIVE',
  });
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const { showSuccess } = useSnackbar();

  const handleMenuClick = (event, category) => {
    setAnchorEl(event.currentTarget);
    setSelectedCategory(category);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    // Do not reset selectedCategory here!
  };

  const handleDialogOpen = (mode, category = null) => {
    setDialogMode(mode);
    if (category) {
      setFormData({
        programmeName: category.programmeName,
        description: category.description,
        status: category.status,
      });
      setSelectedCategory(category);
    } else {
      setFormData({
        programmeName: '',
        description: '',
        status: 'ACTIVE',
      });
    }
    setOpenDialog(true);
    handleMenuClose();
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedCategory(null);
    setFormData({
      programmeName: '',
      description: '',
      status: 'ACTIVE',
    });
  };

  const handleFormSubmit = () => {
    if (dialogMode === 'create') {
      const newCategory = {
        id: Date.now(),
        sn: categories.length + 1,
        ...formData,
      };
      setCategories([...categories, newCategory]);
    } else if (dialogMode === 'edit') {
      setCategories(
        categories.map((cat) => (cat.id === selectedCategory.id ? { ...cat, ...formData } : cat)),
      );
    }
    handleDialogClose();
  };

  const handleDelete = () => {
    setCategories(categories.filter((cat) => cat.id !== selectedCategory.id));
    handleMenuClose();
    setConfirmDeleteOpen(false);
    showSuccess('Category deleted successfully');
  };

  return (
    <Box sx={{ p: 3, }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          mb: 3,
        }}
      >
        <span>Category</span>
        <Button
          variant="contained"
          color="primary"
          // startIcon={<AddIcon />}
          onClick={() => handleDialogOpen('create')}
          sx={{ ml: 2 }}
          aria-label="Create new category"
        >
          Create Category
        </Button>
      </Box>

      {/* Table */}
      <StyledTableContainer component={Paper}>
        <Table>
          <StyledTableHead>
            <TableRow>
              <TableCell>S/N</TableCell>
              <TableCell>Programme Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Action</TableCell>
            </TableRow>
          </StyledTableHead>
          <TableBody>
            {categories.map((category) => (
              <StyledTableRow key={category.id}>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {category.sn}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {category.programmeName}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {category.description}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={category.status}
                    size="small"
                    sx={{
                      backgroundColor: 'success.main',
                      color: 'white',
                      fontWeight: 500,
                      fontSize: '0.75rem',
                      borderRadius: '12px',
                      minWidth: '60px',
                    }}
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton onClick={(e) => handleMenuClick(e, category)}>
                    <MoreVertIcon sx={{ fontSize: 25 }} />
                  </IconButton>
                </TableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </StyledTableContainer>
      {categories.length === 0 && (
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No categories exist yet. Click <b>Create Category</b> to add your first category.
          </Typography>
        </Box>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        aria-label="Category actions menu"
      >
        <MenuItem onClick={() => handleDialogOpen('edit', selectedCategory)}>
          Edit Category
        </MenuItem>
        <MenuItem onClick={() => setConfirmDeleteOpen(true)}>
          Delete
        </MenuItem>
      </Menu>
      <ConfirmationDialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Category"
        message="Are you sure you want to delete this category? This action cannot be undone."
        confirmText="Delete"
        confirmColor="error"
        severity="error"
      />

      {/* Dialog */}
      <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'create' && 'Add New Category'}
          {dialogMode === 'edit' && 'Edit Category'}
          {dialogMode === 'view' && 'Category Details'}
        </DialogTitle>
        <DialogContent>
          {dialogMode === 'view' ? (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Programme Name"
                  value={formData.programmeName}
                  disabled
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={formData.description}
                  disabled
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth disabled>
                  <InputLabel>Status</InputLabel>
                  <Select value={formData.status} label="Status">
                    <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                    <MenuItem value="INACTIVE">INACTIVE</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          ) : (
            <CreateCategory
              value={{
                categoryName: formData.programmeName || '',
                description: formData.description || '',
                status: formData.status === 'ACTIVE' ? 'Active' : (formData.status === 'INACTIVE' ? 'Inactive' : formData.status),
                id: selectedCategory?.id
              }}
              isEditing={dialogMode === 'edit'}
              onSubmit={(data) => {
                // Convert status back to original format
                const status = data.status === 'Active' ? 'ACTIVE' : (data.status === 'Inactive' ? 'INACTIVE' : data.status);
                if (dialogMode === 'create') {
                  const newCategory = {
                    id: Date.now(),
                    sn: categories.length + 1,
                    programmeName: data.categoryName,
                    description: data.description,
                    status,
                  };
                  setCategories([...categories, newCategory]);
                  showSuccess('Category created successfully');
                } else if (dialogMode === 'edit') {
                  setCategories(
                    categories.map((cat) =>
                      cat.id === selectedCategory.id
                        ? { ...cat, programmeName: data.categoryName, description: data.description, status, sn: cat.sn }
                        : cat
                    )
                  );
                  showSuccess('Category updated successfully');
                }
                handleDialogClose();
              }}
              onCancel={handleDialogClose}
            />
          )}
        </DialogContent>
        {dialogMode === 'view' && (
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleDialogClose}>Close</Button>
          </DialogActions>
        )}
      </Dialog>
    </Box>
  );
};

export default CategoryTab;
