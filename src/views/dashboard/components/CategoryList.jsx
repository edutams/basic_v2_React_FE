import React, { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Button,
    Typography,
    Box,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    MenuItem,
    Chip,
    TablePagination,
    Stack,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import {
    getSchoolCategories,
    storeSchoolCategory,
    updateSchoolCategory,
    deleteSchoolCategory
} from '../../../context/AgentContext/services/school.service';
import useNotification from '../../../hooks/useNotification';
import ConfirmationDialog from '../../../components/shared/ConfirmationDialog';

const CategoryList = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '', status: 'active' });
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const notify = useNotification();

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const data = await getSchoolCategories();
            setCategories(data || []);
        } catch (err) {
            notify.error('Failed to fetch categories');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleOpenModal = (category = null) => {
        if (category) {
            setEditingCategory(category);
            setFormData({ name: category.name, description: category.description || '', status: category.status });
        } else {
            setEditingCategory(null);
            setFormData({ name: '', description: '', status: 'active' });
        }
        setOpenModal(true);
    };

    const handleCloseModal = () => setOpenModal(false);

    const handleSubmit = async () => {
        try {
            if (editingCategory) {
                await updateSchoolCategory(editingCategory.id, formData);
                notify.success('Category updated successfully');
            } else {
                await storeSchoolCategory(formData);
                notify.success('Category created successfully');
            }
            fetchCategories();
            handleCloseModal();
        } catch (err) {
            notify.error(err.message || 'Action failed');
        }
    };

    const handleDelete = async () => {
        try {
            await deleteSchoolCategory(categoryToDelete.id);
            notify.success('Category deleted successfully');
            fetchCategories();
            setOpenDeleteDialog(false);
        } catch (err) {
            notify.error(err.message || 'Delete failed');
        }
    };

    const filteredCategories = categories.filter(cat => 
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <TextField 
                    size="small" 
                    placeholder="Search categories..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenModal()}>
                    Add Category
                </Button>
            </Stack>

            <TableContainer component={Paper} variant="outlined">
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredCategories.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((cat) => (
                            <TableRow key={cat.id}>
                                <TableCell>{cat.name}</TableCell>
                                <TableCell>{cat.description}</TableCell>
                                <TableCell>
                                    <Chip 
                                        label={cat.status} 
                                        size="small" 
                                        color={cat.status === 'active' ? 'success' : 'default'} 
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton onClick={() => handleOpenModal(cat)} color="primary">
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton onClick={() => { setCategoryToDelete(cat); setOpenDeleteDialog(true); }} color="error">
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredCategories.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                />
            </TableContainer>

            <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="sm">
                <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            fullWidth
                            label="Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                        <TextField
                            fullWidth
                            label="Description"
                            multiline
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                        <TextField
                            select
                            fullWidth
                            label="Status"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        >
                            <MenuItem value="active">Active</MenuItem>
                            <MenuItem value="inactive">Inactive</MenuItem>
                        </TextField>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>

            <ConfirmationDialog 
                open={openDeleteDialog}
                onClose={() => setOpenDeleteDialog(false)}
                onConfirm={handleDelete}
                title="Delete Category"
                message={`Are you sure you want to delete ${categoryToDelete?.name}? This cannot be undone if it's in use.`}
                confirmText="Delete"
                severity="error"
            />
        </Box>
    );
};

export default CategoryList;
