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
    getSchoolDivisions,
    storeSchoolDivision,
    updateSchoolDivision,
    deleteSchoolDivision
} from '../../../context/AgentContext/services/school.service';
import useNotification from '../../../hooks/useNotification';
import ConfirmationDialog from '../../../components/shared/ConfirmationDialog';

const DivisionList = () => {
    const [divisions, setDivisions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [editingDivision, setEditingDivision] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '', status: 'active' });
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [divisionToDelete, setDivisionToDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const notify = useNotification();

    const fetchDivisions = async () => {
        setLoading(true);
        try {
            const data = await getSchoolDivisions();
            setDivisions(data || []);
        } catch (err) {
            notify.error('Failed to fetch divisions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDivisions();
    }, []);

    const handleOpenModal = (division = null) => {
        if (division) {
            setEditingDivision(division);
            setFormData({ name: division.name, description: division.description || '', status: division.status });
        } else {
            setEditingDivision(null);
            setFormData({ name: '', description: '', status: 'active' });
        }
        setOpenModal(true);
    };

    const handleCloseModal = () => setOpenModal(false);

    const handleSubmit = async () => {
        try {
            if (editingDivision) {
                await updateSchoolDivision(editingDivision.id, formData);
                notify.success('Division updated successfully');
            } else {
                await storeSchoolDivision(formData);
                notify.success('Division created successfully');
            }
            fetchDivisions();
            handleCloseModal();
        } catch (err) {
            notify.error(err.message || 'Action failed');
        }
    };

    const handleDelete = async () => {
        try {
            await deleteSchoolDivision(divisionToDelete.id);
            notify.success('Division deleted successfully');
            fetchDivisions();
            setOpenDeleteDialog(false);
        } catch (err) {
            notify.error(err.message || 'Delete failed');
        }
    };

    const filteredDivisions = divisions.filter(div => 
        div.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <TextField 
                    size="small" 
                    placeholder="Search divisions..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenModal()}>
                    Add Division
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
                        {filteredDivisions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((div) => (
                            <TableRow key={div.id}>
                                <TableCell>{div.name}</TableCell>
                                <TableCell>{div.description}</TableCell>
                                <TableCell>
                                    <Chip 
                                        label={div.status} 
                                        size="small" 
                                        color={div.status === 'active' ? 'success' : 'default'} 
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton onClick={() => handleOpenModal(div)} color="primary">
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton onClick={() => { setDivisionToDelete(div); setOpenDeleteDialog(true); }} color="error">
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
                    count={filteredDivisions.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                />
            </TableContainer>

            <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="sm">
                <DialogTitle>{editingDivision ? 'Edit Division' : 'Add New Division'}</DialogTitle>
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
                title="Delete Division"
                message={`Are you sure you want to delete ${divisionToDelete?.name}? This cannot be undone if it's in use.`}
                confirmText="Delete"
                severity="error"
            />
        </Box>
    );
};

export default DivisionList;
