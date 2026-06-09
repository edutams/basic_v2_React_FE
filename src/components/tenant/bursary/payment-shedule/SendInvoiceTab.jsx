import React, { useState } from 'react';
import {
    Box,
    Typography,
    Tabs,
    Tab,
    FormControl,
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

const SendInvoiceTab = ({ showSnackbar }) => {
    const [deliveryTab, setDeliveryTab] = useState(0);
    const [selectedSession, setSelectedSession] = useState('2024/2025 Third Term');
    const [selectedProgramme, setSelectedProgramme] = useState('Programme');
    const [selectedClass, setSelectedClass] = useState('Class');

    const initialParentsList = Array(7)
        .fill({
            name: 'Ada Obi',
            phone: '0904428395',
            email: 'ada.obi@example.com',
        })
        .map((p, i) => ({ ...p, id: i }));

    const [parentsList] = useState(initialParentsList);
    const [selectedParents, setSelectedParents] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

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
            setSelectedParents(parentsList.map((p) => p.id));
        } else {
            setSelectedParents([]);
        }
    };

    const handleSelectParent = (id) => {
        setSelectedParents((prev) =>
            prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
        );
    };

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
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
                    <Chip
                        label="JSS2"
                        size="small"
                        sx={{ bgcolor: 'warning.main', color: 'white', fontWeight: 700 }}
                    />
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
                            {paginatedParentsList.map((row) => (
                                <TableRow key={row.id} hover selected={selectedParents.includes(row.id)}>
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            checked={selectedParents.includes(row.id)}
                                            onChange={() => handleSelectParent(row.id)}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>{row.name}</TableCell>
                                    <TableCell sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                        {deliveryTab === 0 ? row.phone : row.email}
                                    </TableCell>
                                    <TableCell align="center">
                                        <IconButton size="small" onClick={handleMenuClick}>
                                            <MoreVertIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
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
                    <MenuItem onClick={handleMenuClose}>
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
                                    34
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
                                    24
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
                                    2
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
                            onClick={() => showSnackbar?.('Resending invoices...', 'info')}
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
                    <Chip
                        label="JSS2"
                        size="small"
                        sx={{ bgcolor: 'warning.main', color: 'white', fontWeight: 700 }}
                    />
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
                            34
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
                            24
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
                            2
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
                        onClick={() => showSnackbar?.('Regenerating...', 'info')}
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
                        <TableRow >
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
                        {paginatedParentsList.map((row) => (
                            <TableRow key={row.id} hover selected={selectedParents.includes(row.id)}>
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        checked={selectedParents.includes(row.id)}
                                        onChange={() => handleSelectParent(row.id)}
                                    />
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>{row.name}</TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                    {row.phone}
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
                                    <IconButton size="small" onClick={handleMenuClick}>
                                        <MoreVertIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
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
                <MenuItem onClick={handleMenuClose}>Edit Parent Mail</MenuItem>
                <MenuItem onClick={handleMenuClose}>Resend</MenuItem>
            </Menu>
        </Box>
    );

    return (
        <Box>
            <Box sx={{ mb: 4 }}>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', lg: 'row' },
                        justifyContent: 'space-between',
                        alignItems: { xs: 'flex-start', lg: 'center' },
                        mb: 3,
                        gap: 2,
                        borderBottom: '1px solid',
                        borderColor: 'grey.200',
                        pb: 2,
                    }}
                >
                    <Box display="flex" alignItems="center" gap={2}>
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
                    <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 150 } }}>
                        <Select
                            value={selectedSession}
                            onChange={(e) => setSelectedSession(e.target.value)}
                            displayEmpty
                        >
                            <MenuItem value="2024/2025 Third Term">Session</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 120 } }}>
                        <Select value="Term" displayEmpty>
                            <MenuItem value="Term">Term</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 150 } }}>
                        <Select
                            value={selectedProgramme}
                            onChange={(e) => setSelectedProgramme(e.target.value)}
                            displayEmpty
                        >
                            <MenuItem value="Programme">Programme</MenuItem>
                            <MenuItem value="Secondary">Secondary</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 120 } }}>
                        <Select
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            displayEmpty
                        >
                            <MenuItem value="Class">Class</MenuItem>
                            <MenuItem value="JSS1">JSS1</MenuItem>
                            <MenuItem value="JSS2">JSS2</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        size="small"
                        placeholder="Search"
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
        </Box>
    );
};

export default SendInvoiceTab;
