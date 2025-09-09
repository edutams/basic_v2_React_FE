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
import CustomSelect from 'src/components/forms/theme-elements/CustomSelect';
import ReusableModal from 'src/components/shared/ReusableModal';
import ConfirmationDialog from 'src/components/shared/ConfirmationDialog';
import { useNotification } from 'src/hooks/useNotification';
import {
  IconPlus,
  IconDots,
} from '@tabler/icons-react';

const SubjectCurriculum = ({ selectedTab = 0 }) => {
  const [categoryAnchorEl, setCategoryAnchorEl] = useState(null);
  const [subjectAnchorEl, setSubjectAnchorEl] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categoryData, setCategoryData] = useState([]);
  const [subjectData, setSubjectData] = useState([]);
  
  // Modal states
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editCategoryModalOpen, setEditCategoryModalOpen] = useState(false);
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [editSubjectModalOpen, setEditSubjectModalOpen] = useState(false);
  const [deleteCategoryDialogOpen, setDeleteCategoryDialogOpen] = useState(false);
  const [deleteSubjectDialogOpen, setDeleteSubjectDialogOpen] = useState(false);
  const [changeStatusDialogOpen, setChangeStatusDialogOpen] = useState(false);
  
  // Form states
  const [newCategory, setNewCategory] = useState({ name: '', status: 'ACTIVE' });
  const [editCategory, setEditCategory] = useState({ id: '', name: '', status: 'ACTIVE' });
  const [newSubject, setNewSubject] = useState({ name: '', category: '', status: 'COMPULSORY' });
  const [editSubject, setEditSubject] = useState({ id: '', name: '', category: '', status: 'COMPULSORY' });
  const [itemToDelete, setItemToDelete] = useState(null);
  const [itemToChangeStatus, setItemToChangeStatus] = useState(null);
  const [statusChangeType, setStatusChangeType] = useState(''); // 'category' or 'subject'
  
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

  // Initialize data from localStorage or set default data
  useEffect(() => {
    // Load categories from localStorage
    const savedCategories = localStorage.getItem(storageKeys.categories);
    if (savedCategories) {
      setCategoryData(JSON.parse(savedCategories));
    } else {
      // Start with empty categories list
      setCategoryData([]);
      localStorage.setItem(storageKeys.categories, JSON.stringify([]));
    }

    // Load subjects from localStorage
    const savedSubjects = localStorage.getItem(storageKeys.subjects);
    if (savedSubjects) {
      setSubjectData(JSON.parse(savedSubjects));
    } else {
      // Start with empty subjects list
      setSubjectData([]);
      localStorage.setItem(storageKeys.subjects, JSON.stringify([]));
    }
  }, [selectedTab, storageKeys.categories, storageKeys.subjects]);

  // Save categories to localStorage
  const saveCategories = (categories) => {
    setCategoryData(categories);
    localStorage.setItem(storageKeys.categories, JSON.stringify(categories));
    // Dispatch custom event to notify analytics component
    window.dispatchEvent(new CustomEvent('localStorageUpdated', { detail: { tabIndex: selectedTab } }));
  };

  // Save subjects to localStorage
  const saveSubjects = (subjects) => {
    setSubjectData(subjects);
    localStorage.setItem(storageKeys.subjects, JSON.stringify(subjects));
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
    const updatedSubjects = subjectData.filter(subject => subject.category !== categoryData.find(cat => cat.id === id)?.name);
    saveSubjects(updatedSubjects);
  };

  // CRUD functions for Subjects
  const addSubject = (newSubject) => {
    const maxId = subjectData.length > 0 ? Math.max(...subjectData.map(sub => sub.id)) : 0;
    const subject = { ...newSubject, id: maxId + 1 };
    const updatedSubjects = [...subjectData, subject];
    saveSubjects(updatedSubjects);
  };

  const updateSubject = (id, updatedSubject) => {
    const updatedSubjects = subjectData.map(sub => 
      sub.id === id ? { ...sub, ...updatedSubject } : sub
    );
    saveSubjects(updatedSubjects);
  };

  const deleteSubject = (id) => {
    const updatedSubjects = subjectData.filter(sub => sub.id !== id);
    saveSubjects(updatedSubjects);
  };

  // Filter logic
  const filteredSubjects = subjectData.filter(subject => {
    const matchesCategory = selectedCategory ? subject.category === selectedCategory : true;
    return matchesCategory;
  });

  const handleCategoryMenuOpen = (event, category) => {
    setCategoryAnchorEl({ element: event.currentTarget, row: category });
  };

  const handleSubjectMenuOpen = (event, subject) => {
    setSubjectAnchorEl({ element: event.currentTarget, row: subject });
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
      setStatusChangeType('category');
      setChangeStatusDialogOpen(true);
    }
    setCategoryAnchorEl(null);
  };

  const handleConfirmStatusChange = () => {
    if (itemToChangeStatus && statusChangeType === 'category') {
      const newStatus = itemToChangeStatus.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      updateCategory(itemToChangeStatus.id, { status: newStatus });
      notify.success(`Category status changed to ${newStatus.toLowerCase()} successfully!`);
    } else if (itemToChangeStatus && statusChangeType === 'subject') {
      const newStatus = itemToChangeStatus.status === 'COMPULSORY' ? 'OPTIONAL' : 'COMPULSORY';
      updateSubject(itemToChangeStatus.id, { status: newStatus });
      notify.success(`Subject status changed to ${newStatus.toLowerCase()} successfully!`);
    }
    setChangeStatusDialogOpen(false);
    setItemToChangeStatus(null);
    setStatusChangeType('');
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

  // Menu handlers for Subjects
  const handleSubjectEdit = () => {
    if (subjectAnchorEl?.row) {
      setEditSubject({
        id: subjectAnchorEl.row.id,
        name: subjectAnchorEl.row.name,
        category: subjectAnchorEl.row.category,
        status: subjectAnchorEl.row.status
      });
      setEditSubjectModalOpen(true);
    }
    setSubjectAnchorEl(null);
  };

  const handleSubjectStatusChange = () => {
    if (subjectAnchorEl?.row) {
      setItemToChangeStatus(subjectAnchorEl.row);
      setStatusChangeType('subject');
      setChangeStatusDialogOpen(true);
    }
    setSubjectAnchorEl(null);
  };

  const handleSubjectDelete = () => {
    if (subjectAnchorEl?.row) {
      setItemToDelete(subjectAnchorEl.row);
      setDeleteSubjectDialogOpen(true);
    }
    setSubjectAnchorEl(null);
  };

  const handleConfirmDeleteSubject = () => {
    if (itemToDelete) {
      deleteSubject(itemToDelete.id);
      notify.success('Subject deleted successfully!');
    }
    setDeleteSubjectDialogOpen(false);
    setItemToDelete(null);
  };

  // Add button handlers
  const handleAddCategory = () => {
    setNewCategory({ name: '', status: 'ACTIVE' });
    setCategoryModalOpen(true);
  };

  const handleAddSubject = () => {
    setNewSubject({ name: '', category: '', status: 'COMPULSORY' });
    setSubjectModalOpen(true);
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

  const handleSubjectSubmit = () => {
    if (newSubject.name.trim() && newSubject.category) {
      addSubject(newSubject);
      setSubjectModalOpen(false);
      notify.success('Subject added successfully!');
    }
  };

  const handleEditSubjectSubmit = () => {
    if (editSubject.name.trim() && editSubject.category) {
      updateSubject(editSubject.id, {
        name: editSubject.name,
        category: editSubject.category,
        status: editSubject.status
      });
      setEditSubjectModalOpen(false);
      notify.success('Subject updated successfully!');
    }
  };

  return (
    <Grid container spacing={3}>
      {/* Subject Category Section */}
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

      {/* Subject Section */}
      <Grid size={{ xs: 12, md: 7 }}>
        <ParentCard
          title={
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h5">Subject</Typography>
              <Button 
                variant="contained"
                color="primary"
                startIcon={<IconPlus />}
                onClick={handleAddSubject}
              >
                Add Subject
              </Button>
            </Box>
          }
        >
          <Box sx={{ p: 0 }}>
            {/* Filter */}
            <Box sx={{ mb: 3 }}>
              <CustomSelect
                labelId="category-select"
                id="category-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                displayEmpty
                size="small"
                sx={{ minWidth: 200 }}
              >
                <MenuItem value="">
                  <em>Filter by Category</em>
                </MenuItem>
                {categoryData.map((category) => (
                  <MenuItem key={category.id} value={category.name}>
                    {category.name}
                  </MenuItem>
                ))}
              </CustomSelect>
            </Box>

            {/* Table */}
            <Paper variant="outlined">
              <TableContainer sx={{ maxHeight: 400 }}>
                <Table sx={{ whiteSpace: 'nowrap' }} stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>S/N</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Subject status</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredSubjects.length > 0 ? (
                      filteredSubjects.map((subject, index) => (
                        <TableRow key={subject.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{subject.name}</TableCell>
                          <TableCell>{subject.category}</TableCell>
                          <TableCell>
                            <Chip
                              label={subject.status}
                              size="small"
                              sx={{
                                bgcolor: subject.status === 'COMPULSORY' 
                                  ? (theme) => theme.palette.success.light
                                  : (theme) => theme.palette.error.light,
                                color: subject.status === 'COMPULSORY'
                                  ? (theme) => theme.palette.success.main
                                  : (theme) => theme.palette.error.main,
                                borderRadius: '8px',
                              }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSubjectMenuOpen(e, subject);
                              }}
                            >
                              <IconDots />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Typography variant="body1" color="textSecondary">
                            No subjects found
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

      {/* Context Menus */}
      <Menu
        anchorEl={categoryAnchorEl?.element}
        open={Boolean(categoryAnchorEl)}
        onClose={() => setCategoryAnchorEl(null)}
      >
        <MenuItem onClick={handleCategoryEdit}>Edit Category</MenuItem>
        <MenuItem onClick={handleCategoryStatusChange}>Change Status</MenuItem>
        <MenuItem onClick={handleCategoryDelete}>Delete</MenuItem>
      </Menu>

      <Menu
        anchorEl={subjectAnchorEl?.element}
        open={Boolean(subjectAnchorEl)}
        onClose={() => setSubjectAnchorEl(null)}
      >
        <MenuItem onClick={handleSubjectEdit}>Edit Subject</MenuItem>
        <MenuItem onClick={handleSubjectStatusChange}>Change Status</MenuItem>
        <MenuItem onClick={handleSubjectDelete}>Delete</MenuItem>
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

      {/* Add Subject Modal */}
      <ReusableModal
        open={subjectModalOpen}
        onClose={() => setSubjectModalOpen(false)}
        title="Add New Subject"
        size="medium"
        showDivider={true}
        showCloseButton={true}
      >
        <Box sx={{ pt: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Subject Name"
            fullWidth
            variant="outlined"
            value={newSubject.name}
            onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={newSubject.category}
              label="Category"
              onChange={(e) => setNewSubject({ ...newSubject, category: e.target.value })}
            >
              {categoryData.map((category) => (
                <MenuItem key={category.id} value={category.name}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={newSubject.status}
              label="Status"
              onChange={(e) => setNewSubject({ ...newSubject, status: e.target.value })}
            >
              <MenuItem value="COMPULSORY">Compulsory</MenuItem>
              <MenuItem value="OPTIONAL">Optional</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 3 }}>
          <Button onClick={() => setSubjectModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSubjectSubmit} variant="contained">
            Add Subject
          </Button>
        </Box>
      </ReusableModal>

      {/* Edit Subject Modal */}
      <ReusableModal
        open={editSubjectModalOpen}
        onClose={() => setEditSubjectModalOpen(false)}
        title="Edit Subject"
        size="medium"
        showDivider={true}
        showCloseButton={true}
      >
        <Box sx={{ pt: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Subject Name"
            fullWidth
            variant="outlined"
            value={editSubject.name}
            onChange={(e) => setEditSubject({ ...editSubject, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={editSubject.category}
              label="Category"
              onChange={(e) => setEditSubject({ ...editSubject, category: e.target.value })}
            >
              {categoryData.map((category) => (
                <MenuItem key={category.id} value={category.name}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={editSubject.status}
              label="Status"
              onChange={(e) => setEditSubject({ ...editSubject, status: e.target.value })}
            >
              <MenuItem value="COMPULSORY">Compulsory</MenuItem>
              <MenuItem value="OPTIONAL">Optional</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 3 }}>
          <Button onClick={() => setEditSubjectModalOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSubjectSubmit} variant="contained">
            Update Subject
          </Button>
        </Box>
      </ReusableModal>

      {/* Delete Category Confirmation Dialog */}
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

      {/* Delete Subject Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteSubjectDialogOpen}
        onClose={() => setDeleteSubjectDialogOpen(false)}
        onConfirm={handleConfirmDeleteSubject}
        title="Delete Subject"
        message={`Are you sure you want to delete "${itemToDelete?.name}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        severity="error"
      />

      {/* Change Status Confirmation Dialog */}
      <ConfirmationDialog
        open={changeStatusDialogOpen}
        onClose={() => setChangeStatusDialogOpen(false)}
        onConfirm={handleConfirmStatusChange}
        title={`Change ${statusChangeType === 'category' ? 'Category' : 'Subject'} Status`}
        message={
          statusChangeType === 'category' 
            ? `Are you sure you want to change "${itemToChangeStatus?.name}" status from ${itemToChangeStatus?.status?.toLowerCase()} to ${itemToChangeStatus?.status === 'ACTIVE' ? 'inactive' : 'active'}?`
            : `Are you sure you want to change "${itemToChangeStatus?.name}" status from ${itemToChangeStatus?.status?.toLowerCase()} to ${itemToChangeStatus?.status === 'COMPULSORY' ? 'optional' : 'compulsory'}?`
        }
        confirmText="Change Status"
        cancelText="Cancel"
        severity="error"
      />
    </Grid>
  );
};

export default SubjectCurriculum;
