import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Box,
    Typography,
    Tabs,
    Tab,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    InputAdornment,
    Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Checkbox,
    Button,
    IconButton,
    Menu,
    Chip,
    TablePagination,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import {
    Search as SearchIcon,
    AssignmentTurnedIn as AssignmentTurnedInIcon,
    Refresh as RefreshIcon,
    MoreVert as MoreVertIcon,
    GetApp as DownloadIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import TiptapEdit from 'src/pages/landlord/views/forms/form-tiptap/TiptapEdit';
import {
    fetchSendInvoiceFilterOptions,
    fetchClassesByProgramme,
    fetchParentsForInvoice,
    fetchSendInvoiceStats,
    updateParentPhoneNumberOrEmail,
} from '@/api/tenant/bursary/sendInvoiceApi';

const SendInvoiceTab = ({ showSnackbar }) => {
    const [deliveryTab, setDeliveryTab] = useState(0);

    const [sessionTerms, setSessionTerms] = useState([]);
    const [programmes, setProgrammes] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loadingFilters, setLoadingFilters] = useState(false);

    const [selectedSessionTermId, setSelectedSessionTermId] = useState('');
    const [selectedProgrammeId, setSelectedProgrammeId] = useState('');
    const [selectedClassId, setSelectedClassId] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const [programmeClasses, setProgrammeClasses] = useState([]);
    const [loadingProgrammeClasses, setLoadingProgrammeClasses] = useState(false);

    const [parentsList, setParentsList] = useState([]);
    const [loadingParents, setLoadingParents] = useState(false);

    const [stats, setStats] = useState({ total_parents: 0, sent: 0, not_sent: 0 });

    const [selectedParents, setSelectedParents] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [menuParent, setMenuParent] = useState(null); // the row the menu was opened on
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    // Edit contact dialog state
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editParent, setEditParent] = useState(null);  // { guardian_user_id, guardian_name, guardian_phone/email }
    const [editField, setEditField] = useState('');       // 'phone' | 'email'
    const [editValue, setEditValue] = useState('');
    const [savingEdit, setSavingEdit] = useState(false);
    const [editError, setEditError] = useState('');

    // Debounce ref for search
    const searchTimerRef = useRef(null);

    const selectedClassName =
        programmeClasses.find((c) => String(c.id) === String(selectedClassId))?.class_name ||
        classes.find((c) => String(c.id) === String(selectedClassId))?.class_name ||
        '';

    useEffect(() => {
        const load = async () => {
            try {
                setLoadingFilters(true);
                const res = await fetchSendInvoiceFilterOptions();
                if (res?.success && res.data) {
                    const { session_terms, programmes: progs, classes: cls } = res.data;

                    setSessionTerms(session_terms || []);
                    setProgrammes(progs || []);
                    setClasses(cls || []);

                    if (session_terms?.length > 0) {
                        setSelectedSessionTermId(session_terms[0].id);
                    }
                    if (progs?.length > 0) {
                        setSelectedProgrammeId(String(progs[0].id));
                    }
                    if (cls?.length > 0) {
                        setSelectedClassId(String(cls[0].id));
                    }
                }
            } catch (err) {
                console.error('Failed to load filter options', err);
                showSnackbar?.('Failed to load filter options', 'error');
            } finally {
                setLoadingFilters(false);
            }
        };
        load();
    }, []);

    // --- Load classes when programme changes ---
    useEffect(() => {
        if (!selectedProgrammeId) return;

        const load = async () => {
            try {
                setLoadingProgrammeClasses(true);
                const res = await fetchClassesByProgramme(selectedProgrammeId);
                if (res?.success && res.data) {
                    setProgrammeClasses(res.data);
                    if (res.data.length > 0) {
                        setSelectedClassId(String(res.data[0].id));
                    }
                }
            } catch (err) {
                console.error('Failed to load programme classes', err);
                showSnackbar?.('Failed to load classes', 'error');
            } finally {
                setLoadingProgrammeClasses(false);
            }
        };
        load();
    }, [selectedProgrammeId]);

    const loadParents = useCallback(async () => {
        if (!selectedSessionTermId) return;
        try {
            setLoadingParents(true);
            const res = await fetchParentsForInvoice({
                sessionTermId: selectedSessionTermId,
                classId: selectedClassId || undefined,
                programmeId: selectedProgrammeId || undefined,
                search: searchQuery || undefined,
            });
            if (res?.success) {
                setParentsList(res.data || []);
            }
        } catch (err) {
            console.error('Failed to load parents', err);
            showSnackbar?.('Failed to load parents', 'error');
        } finally {
            setLoadingParents(false);
        }
    }, [selectedSessionTermId, selectedClassId, selectedProgrammeId, searchQuery, showSnackbar]);

    useEffect(() => {
        loadParents();
    }, [loadParents]);

    useEffect(() => {
        if (!selectedSessionTermId) return;
        const load = async () => {
            try {
                const res = await fetchSendInvoiceStats({
                    sessionTermId: selectedSessionTermId,
                    classId: selectedClassId || undefined,
                    programmeId: selectedProgrammeId || undefined,
                });
                if (res?.success && res.data) {
                    setStats(res.data);
                }
            } catch (err) {
                console.error('Failed to load stats', err);
            }
        };
        load();
    }, [selectedSessionTermId, selectedClassId, selectedProgrammeId]);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setPage(0);
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        searchTimerRef.current = setTimeout(() => {
            setSearchQuery(value);
        }, 400);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const paginatedParentsList = parentsList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const handleSelectAll = (event) => {
        if (event.target.checked) {
            setSelectedParents(parentsList.map((p) => p.guardian_user_id));
        } else {
            setSelectedParents([]);
        }
    };

    const handleSelectParent = (id) => {
        setSelectedParents((prev) =>
            prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
        );
    };

    const handleMenuClick = (event, row) => {
        setAnchorEl(event.currentTarget);
        setMenuParent(row);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setMenuParent(null);
    };

    const handleOpenEditDialog = (field) => {
        handleMenuClose();
        if (!menuParent) return;
        setEditParent(menuParent);
        setEditField(field);
        setEditValue(field === 'phone' ? menuParent.guardian_phone || '' : menuParent.guardian_email || '');
        setEditError('');
        setEditDialogOpen(true);
    };

    const handleCloseEditDialog = () => {
        setEditDialogOpen(false);
        setEditParent(null);
        setEditValue('');
        setEditError('');
    };

    const handleSaveEdit = async () => {
        if (!editValue.trim()) {
            setEditError(editField === 'email' ? 'Email is required' : 'Phone number is required');
            return;
        }
        if (editField === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editValue)) {
            setEditError('Please enter a valid email address');
            return;
        }
        try {
            setSavingEdit(true);
            const res = await updateParentPhoneNumberOrEmail(editParent.guardian_user_id, editField, editValue.trim());
            if (res?.success) {
                showSnackbar?.(`${editField === 'phone' ? 'Phone' : 'Email'} updated successfully`, 'success');
                handleCloseEditDialog();
                loadParents(); // refresh list
            } else {
                setEditError(res?.message || 'Failed to update');
            }
        } catch (err) {
            setEditError(err?.response?.data?.message || 'Something went wrong');
        } finally {
            setSavingEdit(false);
        }
    };

    const handleDeliveryTabChange = (event, newValue) => {
        setDeliveryTab(newValue);
        setSelectedParents([]);
    };

    const renderSmsMailContent = () => (
        <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 5 }}>
                <Box display="flex" alignItems="center" mb={2} gap={1}>
                    <Typography variant="subtitle1" fontWeight={700}>
                        List of Parent in
                    </Typography>
                    {selectedClassName && (
                        <Chip
                            label={selectedClassName}
                            size="small"
                            sx={{ bgcolor: 'warning.main', color: 'white', fontWeight: 700 }}
                        />
                    )}
                </Box>

                <TableContainer
                    component={Paper}
                    variant="outlined"
                    sx={{ borderRadius: 2, borderColor: 'grey.200' }}
                >
                    <Table size="medium">
                        <TableHead>
                            <TableRow>
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        indeterminate={
                                            selectedParents.length > 0 && selectedParents.length < parentsList.length
                                        }
                                        checked={
                                            parentsList.length > 0 && selectedParents.length === parentsList.length
                                        }
                                        onChange={handleSelectAll}
                                    />
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Name</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>
                                    {deliveryTab === 0 ? 'Phone No.' : 'Email'}
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary', textAlign: 'center' }}>
                                    Action
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loadingParents ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                                        <CircularProgress size={24} />
                                    </TableCell>
                                </TableRow>
                            ) : paginatedParentsList.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                        <Alert severity="info">
                                            No parents found
                                        </Alert>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedParentsList.map((row) => (
                                    <TableRow key={row.guardian_user_id} hover selected={selectedParents.includes(row.guardian_user_id)}>
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                checked={selectedParents.includes(row.guardian_user_id)}
                                                onChange={() => handleSelectParent(row.guardian_user_id)}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>{row.guardian_name}</TableCell>
                                        <TableCell sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                            {deliveryTab === 0 ? row.guardian_phone : row.guardian_email}
                                        </TableCell>
                                        <TableCell align="center">
                                            <IconButton size="small" onClick={(e) => handleMenuClick(e, row)}>
                                                <MoreVertIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                    <TablePagination
                        component="div"
                        count={parentsList.length}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        rowsPerPageOptions={[5, 10, 25]}
                    />
                </TableContainer>

                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                    <MenuItem onClick={() => handleOpenEditDialog(deliveryTab === 0 ? 'phone' : 'email')}>
                        {deliveryTab === 0 ? 'Edit Parent Line' : 'Edit Email'}
                    </MenuItem>
                    <MenuItem onClick={handleMenuClose}>Resend</MenuItem>
                </Menu>
            </Grid>

            <Grid size={{ xs: 12, md: 7 }}>
                <Paper
                    variant="outlined"
                    sx={{
                        p: { xs: 2, md: 3 },
                        borderRadius: 3,
                        borderColor: 'grey.200',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <Typography variant="h6" fontWeight={700} mb={3}>
                        Send Invoice To Parent
                    </Typography>

                    <Box
                        sx={{
                            bgcolor: 'info.light',
                            p: 1.5,
                            borderRadius: 2,
                            display: 'flex',
                            gap: 3,
                            mb: 3,
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                    >
                        <Box display="flex" gap={3} flexWrap="wrap">
                            <Box display="flex" alignItems="center" gap={1}>
                                <Box
                                    sx={{
                                        bgcolor: 'primary.main',
                                        color: 'white',
                                        px: 1,
                                        py: 0.2,
                                        borderRadius: 5,
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                    }}
                                >
                                    {stats.total_parents}
                                </Box>
                                <Typography variant="caption" fontWeight={600}>
                                    Parent Attached
                                </Typography>
                            </Box>
                            <Box display="flex" alignItems="center" gap={1}>
                                <Box
                                    sx={{
                                        bgcolor: 'success.main',
                                        color: 'white',
                                        px: 1,
                                        py: 0.2,
                                        borderRadius: 5,
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                    }}
                                >
                                    {stats.sent}
                                </Box>
                                <Typography variant="caption" fontWeight={600}>
                                    Sent
                                </Typography>
                            </Box>
                            <Box display="flex" alignItems="center" gap={1}>
                                <Typography variant="caption" fontWeight={600}>
                                    Not Sent
                                </Typography>
                                <Box
                                    sx={{
                                        bgcolor: 'warning.main',
                                        color: 'white',
                                        px: 1,
                                        py: 0.2,
                                        borderRadius: 5,
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                    }}
                                >
                                    {stats.not_sent}
                                </Box>
                            </Box>
                        </Box>
                        <Chip
                            label="Resend"
                            size="small"
                            icon={<RefreshIcon fontSize="small" sx={{ color: 'inherit !important' }} />}
                            sx={{
                                bgcolor: '#fffbea',
                                color: '#856404',
                                fontWeight: 600,
                                borderRadius: 5,
                                cursor: 'pointer',
                            }}
                        />
                    </Box>

                    <Box sx={{ mb: 5, overflow: 'hidden' }}>
                        <TiptapEdit />
                    </Box>

                    <Box display="flex" justifyContent="flex-end">
                        <Button
                            size="small"
                            color="primary"
                            onClick={() => showSnackbar?.('Invoice sent successfully!', 'success')}
                        >
                            Send Invoice to Parent
                        </Button>
                    </Box>
                </Paper>
            </Grid>
        </Grid>
    );

    const renderExcelContent = () => (
        <Box>
            <Box
                sx={{
                    bgcolor: 'info.light',
                    py: 1.5,
                    px: 2,
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', md: 'center' },
                    mb: 3,
                    borderRadius: 1,
                    gap: 2,
                }}
            >
                <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="subtitle2" fontWeight={700}>
                        List of Parent in
                    </Typography>
                    {selectedClassName && (
                        <Chip
                            label={selectedClassName}
                            size="small"
                            sx={{ bgcolor: 'warning.main', color: 'white', fontWeight: 700 }}
                        />
                    )}
                </Box>

                <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
                    <Box display="flex" alignItems="center" gap={1}>
                        <Box
                            sx={{
                                bgcolor: 'primary.main',
                                color: 'white',
                                px: 1,
                                py: 0.2,
                                borderRadius: 5,
                                fontSize: '0.75rem',
                                fontWeight: 700,
                            }}
                        >
                            {stats.total_parents}
                        </Box>
                        <Typography variant="caption" fontWeight={600}>
                            Parent Attached
                        </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                        <Box
                            sx={{
                                bgcolor: 'success.main',
                                color: 'white',
                                px: 1,
                                py: 0.2,
                                borderRadius: 5,
                                fontSize: '0.75rem',
                                fontWeight: 700,
                            }}
                        >
                            {stats.sent}
                        </Box>
                        <Typography variant="caption" fontWeight={600}>
                            Invoice Generate
                        </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="caption" fontWeight={600}>
                            Not Generate
                        </Typography>
                        <Box
                            sx={{
                                bgcolor: 'warning.main',
                                color: 'white',
                                px: 1,
                                py: 0.2,
                                borderRadius: 5,
                                fontSize: '0.75rem',
                                fontWeight: 700,
                            }}
                        >
                            {stats.not_sent}
                        </Box>
                    </Box>
                    <Chip
                        label="Regenerate"
                        size="small"
                        icon={<RefreshIcon fontSize="small" sx={{ color: 'inherit !important' }} />}
                        sx={{
                            bgcolor: '#fffbea',
                            color: '#856404',
                            fontWeight: 600,
                            borderRadius: 5,
                            cursor: 'pointer',
                        }}
                        // onClick={() => showSnackbar?.('Regenerating...', 'info')}
                    />
                </Box>
            </Box>

            <TableContainer
                component={Paper}
                variant="outlined"
                sx={{ borderRadius: 2, borderColor: 'grey.200' }}
            >
                <Table size="medium">
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox">
                                <Checkbox
                                    indeterminate={
                                        selectedParents.length > 0 && selectedParents.length < parentsList.length
                                    }
                                    checked={parentsList.length > 0 && selectedParents.length === parentsList.length}
                                    onChange={handleSelectAll}
                                />
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>
                                Name
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>
                                Phone No
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>
                                Status
                            </TableCell>
                            <TableCell
                                sx={{
                                    fontWeight: 600,
                                    color: 'text.secondary',
                                    textAlign: 'center',
                                    fontSize: '1rem',
                                }}
                            >
                                Action
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loadingParents ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                    <CircularProgress size={24} />
                                </TableCell>
                            </TableRow>
                        ) : paginatedParentsList.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                    <Alert severity="info">
                                        No parents found
                                    </Alert>
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedParentsList.map((row) => (
                                <TableRow key={row.guardian_user_id} hover selected={selectedParents.includes(row.guardian_user_id)}>
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            checked={selectedParents.includes(row.guardian_user_id)}
                                            onChange={() => handleSelectParent(row.guardian_user_id)}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>{row.guardian_name}</TableCell>
                                    <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                        {row.guardian_phone}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label="Generate"
                                            size="small"
                                            sx={{
                                                bgcolor: 'primary.light',
                                                color: 'primary.main',
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <IconButton size="small" onClick={(e) => handleMenuClick(e, row)}>
                                            <MoreVertIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
                <TablePagination
                    component="div"
                    count={parentsList.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25]}
                />
            </TableContainer>

            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem onClick={() => handleOpenEditDialog('phone')}>Edit Parent Line</MenuItem>
                <MenuItem onClick={handleMenuClose}>Resend</MenuItem>
            </Menu>
        </Box>
    );

    return (
        <Box>
            <Box sx={{ mb: 4 }}>
                <Box
                    sx={{
                        // display: 'flex',
                        // flexDirection: { xs: 'column', lg: 'row' },
                        // justifyContent: 'space-between',
                        // alignItems: { xs: 'flex-start', lg: 'center' },
                        mb: 3,
                        gap: 2,
                        borderBottom: '1px solid',
                        borderColor: 'grey.200',
                        pb: 2,
                    }}
                >
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 1,
                                bgcolor: 'primary.light',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid',
                                borderColor: 'grey.200',
                            }}
                        >
                            <AssignmentTurnedInIcon sx={{ color: 'primary.main' }} />
                        </Box>
                        <Box>
                            <Typography variant="subtitle1" fontWeight={700}>
                                Send invoice to parent
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Review the parent's contact, write a message, and choose how to deliver.
                            </Typography>
                        </Box>
                    </Box>

                    <Tabs value={deliveryTab} onChange={handleDeliveryTabChange} variant="scrollable">
                        <Tab
                            label={
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Box
                                        sx={{
                                            width: 20,
                                            height: 20,
                                            borderRadius: '50%',
                                            bgcolor: deliveryTab === 0 ? 'primary.main' : 'grey.300',
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: 12,
                                            fontWeight: 700,
                                        }}
                                    >
                                        1
                                    </Box>
                                    <span>Invoice by SMS</span>
                                </Box>
                            }
                        />

                        <Tab
                            label={
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Box
                                        sx={{
                                            width: 20,
                                            height: 20,
                                            borderRadius: '50%',
                                            bgcolor: deliveryTab === 1 ? 'primary.main' : 'grey.300',
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: 12,
                                            fontWeight: 700,
                                        }}
                                    >
                                        2
                                    </Box>
                                    <span>Invoice by Mail</span>
                                </Box>
                            }
                        />

                        <Tab
                            label={
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Box
                                        sx={{
                                            width: 20,
                                            height: 20,
                                            borderRadius: '50%',
                                            bgcolor: deliveryTab === 2 ? 'primary.main' : 'grey.300',
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: 12,
                                            fontWeight: 700,
                                        }}
                                    >
                                        3
                                    </Box>
                                    <span>Invoice by Excel</span>
                                </Box>
                            }
                        />
                    </Tabs>
                </Box>

                <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2}>
                    <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 220 } }}>
                        <InputLabel>Session Term</InputLabel>
                        <Select
                            value={selectedSessionTermId}
                            label="Session Term"
                            onChange={(e) => setSelectedSessionTermId(e.target.value)}
                            disabled={loadingFilters}
                        >
                            {loadingFilters ? (
                                <MenuItem disabled>
                                    <CircularProgress size={16} />
                                </MenuItem>
                            ) : (
                                sessionTerms.map((item) => (
                                    <MenuItem key={item.id} value={item.id}>
                                        {item.session?.sesname} - {item.display_term?.display_name}
                                    </MenuItem>
                                ))
                            )}
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 150 } }}>
                        <InputLabel>Programme</InputLabel>
                        <Select
                            value={selectedProgrammeId}
                            label="Programme"
                            onChange={(e) => setSelectedProgrammeId(e.target.value)}
                            disabled={loadingFilters}
                        >
                            {loadingFilters ? (
                                <MenuItem disabled>
                                    <CircularProgress size={16} />
                                </MenuItem>
                            ) : (
                                programmes.map((prog) => (
                                    <MenuItem key={prog.id} value={String(prog.id)}>
                                        {prog.programme_name}
                                    </MenuItem>
                                ))
                            )}
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 120 } }}>
                        <InputLabel>Class</InputLabel>
                        <Select
                            value={selectedClassId}
                            label="Class"
                            onChange={(e) => setSelectedClassId(e.target.value)}
                            disabled={loadingProgrammeClasses}
                        >
                            {loadingProgrammeClasses ? (
                                <MenuItem disabled>
                                    <CircularProgress size={16} />
                                </MenuItem>
                            ) : (
                                programmeClasses.map((cls) => (
                                    <MenuItem key={cls.id} value={String(cls.id)}>
                                        {cls.class_name}
                                    </MenuItem>
                                ))
                            )}
                        </Select>
                    </FormControl>

                    <TextField
                        size="small"
                        placeholder="Search parents..."
                        onChange={handleSearchChange}
                        sx={{ flexGrow: 1 }}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon fontSize="small" />
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />
                </Box>

                {deliveryTab === 2 && (
                    <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
                        <Button
                            size='small'
                        >
                            Generate
                        </Button>
                        <Button
                            endIcon={<DownloadIcon />}
                        >
                            Downloaded
                        </Button>
                    </Box>
                )}
            </Box>

            {deliveryTab === 0 && renderSmsMailContent()}
            {deliveryTab === 1 && renderSmsMailContent()}
            {deliveryTab === 2 && renderExcelContent()}

            {/* Edit Parent Contact Dialog */}
            <Dialog
                open={editDialogOpen}
                onClose={handleCloseEditDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    {editField === 'phone' ? 'Edit Parent Phone Number' : 'Edit Parent Email'}
                </DialogTitle>
                <DialogContent>
                    {editParent && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Editing contact for: <strong>{editParent.guardian_name}</strong>
                        </Typography>
                    )}
                    <TextField
                        autoFocus
                        fullWidth
                        size="small"
                        label={editField === 'phone' ? 'Phone Number' : 'Email Address'}
                        type={editField === 'phone' ? 'tel' : 'email'}
                        value={editValue}
                        onChange={(e) => {
                            setEditValue(e.target.value);
                            if (editError) setEditError('');
                        }}
                        error={Boolean(editError)}
                        helperText={editError}
                        sx={{ mt: 1 }}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleCloseEditDialog} disabled={savingEdit}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSaveEdit}
                        disabled={savingEdit}
                        startIcon={savingEdit ? <CircularProgress size={14} /> : null}
                    >
                        {savingEdit ? 'Saving...' : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default SendInvoiceTab;
