import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Button,
  Typography,
  Chip,
  IconButton,
  TableContainer,
  Table,
  TableRow,
  TableCell,
  TableBody,
  TableHead,
  MenuItem,
  Menu,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import ParentCard from 'src/components/shared/ParentCard';
import ReusableModal from 'src/components/shared/ReusableModal';
import ConfirmationDialog from 'src/components/shared/ConfirmationDialog';
import { useNotification } from 'src/hooks/useNotification';
import {
  IconPlus,
  IconDots,
} from '@tabler/icons-react';

const CategorySection = ({ selectedTab = 0 }) => {
  const [categoryAnchorEl, setCategoryAnchorEl] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  
  // Modal states
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editCategoryModalOpen, setEditCategoryModalOpen] = useState(false);
  const [deleteCategoryDialogOpen, setDeleteCategoryDialogOpen] = useState(false);
  const [changeStatusDialogOpen, setChangeStatusDialogOpen] = useState(false);
  
  // Form states
  const [newCategory, setNewCategory] = useState({ name: '', status: 'ACTIVE' });
  const [editCategory, setEditCategory] = useState({ id: '', name: '', status: 'ACTIVE' });
  const [itemToDelete, setItemToDelete] = useState(null);
  const [itemToChangeStatus, setItemToChangeStatus] = useState(null);
  
  // Notification hook
  const notify = useNotification();

  // Get localStorage keys based on selected tab
  const getStorageKeys = (tabIndex) => {
    const tabNames = ['Pry', 'JS', 'SS', 'TVET'];
    const currentTab = tabNames[tabIndex];
    return {
      categories: `subject_categories_${currentTab}`,
      subjects: `subjects_${currentTab}`
    };
  };

  const storageKeys = getStorageKeys(selectedTab);

  // Initialize data from localStorage
  useEffect(() => {
    const savedCategories = localStorage.getItem(storageKeys.categories);
    if (savedCategories) {
      setCategoryData(JSON.parse(savedCategories));
    } else {
      setCategoryData([]);
      localStorage.setItem(storageKeys.categories, JSON.stringify([]));
    }
  }, [selectedTab, storageKeys.categories]);

  // Save categories to localStorage
  const saveCategories = (categories) => {
    setCategoryData(categories);
    localStorage.setItem(storageKeys.categories, JSON.stringify(categories));
    // Dispatch custom event to notify analytics component
    window.dispatchEvent(new CustomEvent('localStorageUpdated', { detail: { tabIndex: selectedTab } }));
  };

  // CRUD functions for Categories
  const addCategory = (newCategory) => {
    const maxId = categoryData.length > 0 ? Math.max(...categoryData.map(cat => cat.id)) : 0;
    const category = { ...newCategory, id: maxId + 1 };
    const updatedCategories = [...categoryData, category];
    saveCategories(updatedCategories);
  };

  const updateCategory = (id, updatedCategory) => {
    const updatedCategories = categoryData.map(cat => 
      cat.id === id ? { ...cat, ...updatedCategory } : cat
    );
    saveCategories(updatedCategories);
  };

  const deleteCategory = (id) => {
    const updatedCategories = categoryData.filter(cat => cat.id !== id);
    saveCategories(updatedCategories);
    // Also remove subjects that belong to this category
    const savedSubjects = localStorage.getItem(storageKeys.subjects);
    if (savedSubjects) {
      const subjectData = JSON.parse(savedSubjects);
      const categoryToDelete = categoryData.find(cat => cat.id === id);
      const updatedSubjects = subjectData.filter(subject => subject.category !== categoryToDelete?.name);
      localStorage.setItem(storageKeys.subjects, JSON.stringify(updatedSubjects));
    }
  };

  const handleCategoryMenuOpen = (event, category) => {
    setCategoryAnchorEl({ element: event.currentTarget, row: category });
  };

  // Menu handlers for Categories
  const handleCategoryEdit = () => {
    if (categoryAnchorEl?.row) {
      setEditCategory({
        id: categoryAnchorEl.row.id,
        name: categoryAnchorEl.row.name,
        status: categoryAnchorEl.row.status
      });
      setEditCategoryModalOpen(true);
    }
    setCategoryAnchorEl(null);
  };

  const handleCategoryStatusChange = () => {
    if (categoryAnchorEl?.row) {
      setItemToChangeStatus(categoryAnchorEl.row);
      setChangeStatusDialogOpen(true);
    }
    setCategoryAnchorEl(null);
  };

  const handleConfirmStatusChange = () => {
    if (itemToChangeStatus) {
      const newStatus = itemToChangeStatus.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      updateCategory(itemToChangeStatus.id, { status: newStatus });
      notify.success(`Category status changed to ${newStatus.toLowerCase()} successfully!`);
    }
    setChangeStatusDialogOpen(false);
    setItemToChangeStatus(null);
  };

  const handleCategoryDelete = () => {
    if (categoryAnchorEl?.row) {
      setItemToDelete(categoryAnchorEl.row);
      setDeleteCategoryDialogOpen(true);
    }
    setCategoryAnchorEl(null);
  };

  const handleConfirmDeleteCategory = () => {
    if (itemToDelete) {
      deleteCategory(itemToDelete.id);
      notify.success('Category deleted successfully!');
    }
    setDeleteCategoryDialogOpen(false);
    setItemToDelete(null);
  };

  // Add button handlers
  const handleAddCategory = () => {
    setNewCategory({ name: '', status: 'ACTIVE' });
    setCategoryModalOpen(true);
  };

  // Modal handlers
  const handleCategorySubmit = () => {
    if (newCategory.name.trim()) {
      addCategory(newCategory);
      setCategoryModalOpen(false);
      notify.success('Category added successfully!');
    }
  };

  const handleEditCategorySubmit = () => {
    if (editCategory.name.trim()) {
      updateCategory(editCategory.id, {
        name: editCategory.name,
        status: editCategory.status
      });
      setEditCategoryModalOpen(false);
      notify.success('Category updated successfully!');
    }
  };

  return (
    <>
      <Grid size={{ xs: 12, md: 5 }}>
        <ParentCard
          title={
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h5">Subject Category</Typography>
              <Button 
                variant="contained"
                color="primary"
                startIcon={<IconPlus />}
                onClick={handleAddCategory}
              >
                Add New
              </Button>
            </Box>
          }
        >
          <Box sx={{ p: 0 }}>
            {/* Table */}
            <Paper variant="outlined">
              <TableContainer>
                <Table sx={{ whiteSpace: 'nowrap' }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>S/N</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Subject Category</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {categoryData.length > 0 ? (
                      categoryData.map((category, index) => (
                        <TableRow key={category.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{category.name}</TableCell>
                          <TableCell>
                            <Chip
                              label={category.status}
                              size="small"
                              sx={{
                                bgcolor: (theme) => theme.palette.success.light,
                                color: (theme) => theme.palette.success.main,
                                borderRadius: '8px',
                              }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCategoryMenuOpen(e, category);
                              }}
                            >
                              <IconDots />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          <Typography variant="body1" color="textSecondary">
                            No categories found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>
        </ParentCard>
      </Grid>

      {/* Context Menu */}
      <Menu
        anchorEl={categoryAnchorEl?.element}
        open={Boolean(categoryAnchorEl)}
        onClose={() => setCategoryAnchorEl(null)}
      >
        <MenuItem onClick={handleCategoryEdit}>Edit Category</MenuItem>
        <MenuItem onClick={handleCategoryStatusChange}>Change Status</MenuItem>
        <MenuItem onClick={handleCategoryDelete}>Delete</MenuItem>
      </Menu>

      {/* Add Category Modal */}
      <ReusableModal
        open={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        title="Add New Category"
        size="medium"
        showDivider={true}
        showCloseButton={true}
      >
        <Box sx={{ pt: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Category Name"
            fullWidth
            variant="outlined"
            value={newCategory.name}
            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={newCategory.status}
              label="Status"
              onChange={(e) => setNewCategory({ ...newCategory, status: e.target.value })}
            >
              <MenuItem value="ACTIVE">Active</MenuItem>
              <MenuItem value="INACTIVE">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 3 }}>
          <Button onClick={() => setCategoryModalOpen(false)}>Cancel</Button>
          <Button onClick={handleCategorySubmit} variant="contained">
            Add Category
          </Button>
        </Box>
      </ReusableModal>

      {/* Edit Category Modal */}
      <ReusableModal
        open={editCategoryModalOpen}
        onClose={() => setEditCategoryModalOpen(false)}
        title="Edit Category"
        size="medium"
        showDivider={true}
        showCloseButton={true}
      >
        <Box sx={{ pt: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Category Name"
            fullWidth
            variant="outlined"
            value={editCategory.name}
            onChange={(e) => setEditCategory({ ...editCategory, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={editCategory.status}
              label="Status"
              onChange={(e) => setEditCategory({ ...editCategory, status: e.target.value })}
            >
              <MenuItem value="ACTIVE">Active</MenuItem>
              <MenuItem value="INACTIVE">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 3 }}>
          <Button onClick={() => setEditCategoryModalOpen(false)}>Cancel</Button>
          <Button onClick={handleEditCategorySubmit} variant="contained">
            Update Category
          </Button>
        </Box>
      </ReusableModal>

      <ConfirmationDialog
        open={deleteCategoryDialogOpen}
        onClose={() => setDeleteCategoryDialogOpen(false)}
        onConfirm={handleConfirmDeleteCategory}
        title="Delete Category"
        message={`Are you sure you want to delete "${itemToDelete?.name}"? This will also delete all subjects in this category.`}
        confirmText="Delete"
        cancelText="Cancel"
        severity="error"
      />

      <ConfirmationDialog
        open={changeStatusDialogOpen}
        onClose={() => setChangeStatusDialogOpen(false)}
        onConfirm={handleConfirmStatusChange}
        title="Change Category Status"
        message={`Are you sure you want to change "${itemToChangeStatus?.name}" status from ${itemToChangeStatus?.status?.toLowerCase()} to ${itemToChangeStatus?.status === 'ACTIVE' ? 'inactive' : 'active'}?`}
        confirmText="Change Status"
        cancelText="Cancel"
        severity="error"
      />
    </>
  );
};

export default CategorySection;