import React, { useState, useEffect } from 'react';
import {
    Table, TableBody, TableCell, TableHead, TableRow, Avatar, Chip, Typography, Box,
    TableContainer, Button, IconButton, Menu, ListItemIcon, ListItemText, useTheme,
    MenuItem, Tabs, Tab, Stack, TextField, TablePagination, CircularProgress,
    Dialog, DialogTitle, DialogContent, DialogActions, Divider, Grid, Alert,
} from '@mui/material';
import { IconGridDots, IconPlus, IconDotsVertical, IconEye, IconEdit, IconTrash } from '@tabler/icons-react';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import ReusableModal from '../../../components/shared/ReusableModal';
import RegisterSchoolForm from '../../../components/add-school/component/RegisterSchool';
import {
    getProspectiveTenants,
    approveProspectiveTenant,
    rejectProspectiveTenant,
} from '../../../context/AgentContext/services/school.service';

// ── Status chip ───────────────────────────────────────────────────────────────
const statusChip = (status) => {
    const map = {
        Active: { bg: '#dcfce7', color: '#16a34a' },
        Inactive: { bg: '#ffe4e6', color: '#e11d48' },
        active: { bg: '#dcfce7', color: '#16a34a' },
        inactive: { bg: '#ffe4e6', color: '#e11d48' },
        pending: { bg: '#fef3c7', color: '#d97706' },
        approved: { bg: '#dcfce7', color: '#16a34a' },
        reject: { bg: '#ffe4e6', color: '#e11d48' },
    };
    const s = map[status] || { bg: '#f3f4f6', color: '#6b7280' };
    return (
        <Chip size="small" label={status}
            sx={{ bgcolor: s.bg, color: s.color, fontWeight: 600, borderRadius: '4px', textTransform: 'capitalize' }} />
    );
};

// ── Review Modal ──────────────────────────────────────────────────────────────
const ReviewModal = ({ open, onClose, prospect, onApprove, onReject, loading }) => {
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectInput, setShowRejectInput] = useState(false);

    if (!prospect) return null;

    const field = (label, value) => (
        <Box mb={1.5}>
            <Typography variant="caption" color="textSecondary" fontWeight={600}>{label}</Typography>
            <Typography variant="body2" fontWeight={500}>{value || '—'}</Typography>
        </Box>
    );

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ fontWeight: 700 }}>
                Review Application — {prospect.tenant_name}
                <Chip size="small" label={prospect.status}
                    sx={{
                        ml: 2, textTransform: 'capitalize',
                        bgcolor: prospect.status === 'pending' ? '#fef3c7' : prospect.status === 'approved' ? '#dcfce7' : '#ffe4e6',
                        color: prospect.status === 'pending' ? '#d97706' : prospect.status === 'approved' ? '#16a34a' : '#e11d48',
                        fontWeight: 600,
                    }} />
            </DialogTitle>
            <Divider />
            <DialogContent>
                <Grid container spacing={2} mt={0.5}>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" fontWeight={700} mb={1} color="primary">School Info</Typography>
                        {field('School Name', prospect.tenant_name)}
                        {field('Short Name', prospect.tenant_short_name)}
                        {field('School Email', prospect.tenant_email)}
                        {field('Address', prospect.address)}
                        {field('State / LGA', prospect.state_lga?.state?.stname
                            ? `${prospect.state_lga.state.stname} / ${prospect.state_lga.lganame}`
                            : null)}
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" fontWeight={700} mb={1} color="primary">Owner Details</Typography>
                        {field('Owner Name', `${prospect.owner_fname} ${prospect.owner_lname}`)}
                        {field('Owner Email', prospect.owner_email)}
                        {field('Owner Phone', prospect.owner_phone)}
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" fontWeight={700} mb={1} color="primary">Admin Details</Typography>
                        {field('Admin Name', `${prospect.admin_fname} ${prospect.admin_lname}`)}
                        {field('Admin Email', prospect.admin_email)}
                        {field('Admin Phone', prospect.admin_phone)}
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" fontWeight={700} mb={1} color="primary">Agent</Typography>
                        {field('Agent', prospect.agent?.org_name || prospect.agent?.name)}
                        {field('Agent Email', prospect.agent?.email)}
                        {field('Session Term', prospect.session_term)}
                    </Grid>
                    {prospect.rejection_reason && (
                        <Grid item xs={12}>
                            <Alert severity="error">Rejection reason: {prospect.rejection_reason}</Alert>
                        </Grid>
                    )}
                    {showRejectInput && (
                        <Grid item xs={12}>
                            <TextField fullWidth multiline rows={3} label="Rejection Reason (optional)"
                                value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
                        </Grid>
                    )}
                </Grid>
            </DialogContent>
            <Divider />
            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button onClick={onClose} color="inherit">Close</Button>
                {prospect.status === 'pending' && (
                    <>
                        {!showRejectInput ? (
                            <Button variant="outlined" color="error" startIcon={<CancelOutlinedIcon />}
                                onClick={() => setShowRejectInput(true)} disabled={loading}>
                                Reject
                            </Button>
                        ) : (
                            <Button variant="contained" color="error" startIcon={<CancelOutlinedIcon />}
                                onClick={() => onReject(prospect.id, rejectReason)} disabled={loading}>
                                {loading ? <CircularProgress size={18} /> : 'Confirm Reject'}
                            </Button>
                        )}
                        <Button variant="contained" color="success" startIcon={<CheckCircleOutlineIcon />}
                            onClick={() => onApprove(prospect.id)} disabled={loading}>
                            {loading ? <CircularProgress size={18} /> : 'Submit for Approval'}
                        </Button>
                    </>
                )}
            </DialogActions>
        </Dialog>
    );
};

// ── Main Component ────────────────────────────────────────────────────────────
const SchoolsTab = ({ schools = [], onAddSchool }) => {
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';

    const [activeTab, setActiveTab] = useState(0);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [prospectList, setProspectList] = useState([]);
    const [prospectLoading, setProspectLoading] = useState(true); // true = show spinner on first mount
    const [actionLoading, setActionLoading] = useState(false);

    const [reviewOpen, setReviewOpen] = useState(false);
    const [reviewProspect, setReviewProspect] = useState(null);
    const [openAddModal, setOpenAddModal] = useState(false);

    const [anchorEl, setAnchorEl] = useState(null);

    const [feedback, setFeedback] = useState(null);
    const notify = (msg, severity = 'success') => {
        setFeedback({ msg, severity });
        setTimeout(() => setFeedback(null), 3500);
    };

    const fetchProspects = async () => {
        setProspectLoading(true);
        try {
            const data = await getProspectiveTenants();
            console.log('[SchoolsTab] prospective data:', data);
            setProspectList(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('[SchoolsTab] fetch error:', err);
            setFeedback({ msg: err?.message || err?.error || 'Failed to fetch applications', severity: 'error' });
        } finally {
            setProspectLoading(false);
        }
    };

    useEffect(() => {
        fetchProspects();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleApprove = async (id) => {
        setActionLoading(true);
        try {
            await approveProspectiveTenant(id);
            await fetchProspects();
            setReviewOpen(false);
            setFeedback({ msg: 'School approved and provisioned successfully', severity: 'success' });
        } catch (err) {
            setFeedback({ msg: err?.message || 'Approval failed', severity: 'error' });
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async (id, reason) => {
        setActionLoading(true);
        try {
            await rejectProspectiveTenant(id, reason);
            await fetchProspects();
            setReviewOpen(false);
            setFeedback({ msg: 'Application rejected', severity: 'success' });
        } catch (err) {
            setFeedback({ msg: err?.message || 'Rejection failed', severity: 'error' });
        } finally {
            setActionLoading(false);
        }
    };

    const pendingProspects = prospectList.filter((p) => p.status === 'pending');

    const filteredAll = prospectList.filter((p) =>
        !search || p.tenant_name?.toLowerCase().includes(search.toLowerCase())
    );
    const filteredPending = pendingProspects.filter((p) =>
        !search || p.tenant_name?.toLowerCase().includes(search.toLowerCase())
    );
    const filteredApproved = schools.filter((s) =>
        !search || s.school?.toLowerCase().includes(search.toLowerCase())
    );

    const paginate = (arr) => arr.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    const thSx = { fontWeight: 700, fontSize: '12px', color: theme.palette.text.secondary };

    // Shared school row renderer
    const SchoolRow = ({ row, idx }) => (
        <TableRow hover>
            <TableCell>{page * rowsPerPage + idx + 1}</TableCell>
            <TableCell>
                <Box display="flex" alignItems="center" gap={1.5}>
                    <Avatar sx={{ width: 40, height: 40 }} />
                    <Typography variant="subtitle2" fontWeight={700} sx={{ color: theme.palette.text.primary }}>{row.school}</Typography>
                </Box>
            </TableCell>
            <TableCell>
                <Typography variant="subtitle2" fontWeight={700} sx={{ color: theme.palette.text.primary }}>{row.contact}</Typography>
                <Typography variant="caption" color="textSecondary">{row.email}</Typography>
            </TableCell>
            <TableCell>
                <Box display="flex" alignItems="center" gap={1.5}>
                    <Avatar sx={{ width: 32, height: 32 }} />
                    <Box>
                        <Typography variant="caption" fontWeight={700} display="block" sx={{ fontSize: '10px', color: theme.palette.text.primary }}>{row.agent}</Typography>
                        <Typography variant="caption" color="textSecondary" sx={{ fontSize: '9px' }}>{row.agentEmail}</Typography>
                        <Typography variant="caption" color="textSecondary" sx={{ fontSize: '9px' }}>{row.agentContact}</Typography>
                    </Box>
                </Box>
            </TableCell>
            <TableCell>
                <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="caption" fontWeight={700} sx={{ color: theme.palette.text.primary }}>{row.plan}</Typography>
                    <Chip label={row.population} size="small"
                        sx={{ bgcolor: isDarkMode ? 'rgba(34,197,94,0.1)' : '#EAFDF6', color: isDarkMode ? '#4ade80' : '#10B981', fontWeight: 700, borderRadius: '4px' }} />
                </Box>
            </TableCell>
            <TableCell>{statusChip(row.status)}</TableCell>
            <TableCell>
                <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
                    <IconDotsVertical size={18} color={theme.palette.text.secondary} />
                </IconButton>
            </TableCell>
        </TableRow>
    );

    const SchoolTableHead = () => (
        <TableHead>
            <TableRow>
                <TableCell sx={thSx}>S/N</TableCell>
                <TableCell sx={thSx}>School Name</TableCell>
                <TableCell sx={thSx}>Contact Details</TableCell>
                <TableCell sx={thSx}>Agent</TableCell>
                <TableCell sx={thSx}>Plan (Population)</TableCell>
                <TableCell sx={thSx}>Status</TableCell>
                <TableCell sx={thSx}>Action</TableCell>
            </TableRow>
        </TableHead>
    );

    return (
        <Box>
            {feedback && (
                <Alert severity={feedback.severity} sx={{ mb: 2 }} onClose={() => setFeedback(null)}>
                    {feedback.msg}
                </Alert>
            )}

            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box display="flex" alignItems="center" gap={1}>
                    <Box sx={{ width: 24, height: 24, bgcolor: '#2ca87f', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                        <IconGridDots size={16} />
                    </Box>
                    <Typography variant="h5" fontWeight={700}>List Of School</Typography>
                </Box>
                {activeTab === 0 && (
                    <Button variant="contained" startIcon={<IconPlus size={16} />}
                        onClick={() => setOpenAddModal(true)}
                        sx={{ bgcolor: '#3949ab', textTransform: 'none', borderRadius: '8px', '&:hover': { bgcolor: '#303f9f' } }}>
                        Add New School
                    </Button>
                )}
            </Box>

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs value={activeTab}
                    onChange={(_, v) => { setActiveTab(v); setPage(0); setSearch(''); }}
                    sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '13px' } }}>
                    <Tab label="Application" />
                    <Tab label={
                        <Stack direction="row" spacing={1} alignItems="center">
                            <span>Pending Approvals</span>
                            {pendingProspects.length > 0 && (
                                <Chip size="small" label={pendingProspects.length}
                                    sx={{ bgcolor: '#fef3c7', color: '#d97706', fontWeight: 700, height: 20, fontSize: '11px' }} />
                            )}
                        </Stack>
                    } />
                    <Tab label="Approved" />
                </Tabs>
            </Box>

            {/* Search */}
            <Box mb={2}>
                <TextField size="small" label="Search by name" value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                    sx={{ minWidth: 260 }} />
            </Box>

            {/* Tab 0: Application */}
            {activeTab === 0 && (
                prospectLoading ? (
                    <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>
                ) : (
                    <TableContainer sx={{ bgcolor: 'transparent' }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={thSx}>S/N</TableCell>
                                    <TableCell sx={thSx}>School Name</TableCell>
                                    <TableCell sx={thSx}>Admin Contact</TableCell>
                                    <TableCell sx={thSx}>Agent</TableCell>
                                    <TableCell sx={thSx}>Submitted</TableCell>
                                    <TableCell sx={thSx}>Status</TableCell>
                                    <TableCell sx={thSx} align="right">Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginate(filteredAll).map((row, idx) => (
                                    <TableRow key={row.id} hover>
                                        <TableCell>{page * rowsPerPage + idx + 1}</TableCell>
                                        <TableCell>
                                            <Typography variant="subtitle2" fontWeight={700}>{row.tenant_name}</Typography>
                                            <Typography variant="caption" color="textSecondary">{row.tenant_short_name}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="caption" display="block">{row.admin_email}</Typography>
                                            <Typography variant="caption" color="textSecondary">{row.admin_phone}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">{row.agent?.org_name || row.agent?.name || '—'}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="caption">
                                                {row.created_at ? new Date(row.created_at).toLocaleDateString() : '—'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>{statusChip(row.status)}</TableCell>
                                        <TableCell align="right">
                                            <Button size="small" variant="outlined" startIcon={<IconEye size={14} />}
                                                onClick={() => { setReviewProspect(row); setReviewOpen(true); }}
                                                sx={{ textTransform: 'none', borderRadius: '6px' }}>
                                                View / Review
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredAll.length === 0 && (
                                    <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>No applications found</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                        <TablePagination rowsPerPageOptions={[5, 10, 25]} component="div"
                            count={filteredAll.length} rowsPerPage={rowsPerPage} page={page}
                            onPageChange={(_, p) => setPage(p)}
                            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} />
                    </TableContainer>
                )
            )}

            {/* Tab 1: Pending Approvals */}
            {activeTab === 1 && (
                prospectLoading ? (
                    <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>
                ) : (
                    <TableContainer sx={{ bgcolor: 'transparent' }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={thSx}>S/N</TableCell>
                                    <TableCell sx={thSx}>School Name</TableCell>
                                    <TableCell sx={thSx}>Admin Contact</TableCell>
                                    <TableCell sx={thSx}>Agent</TableCell>
                                    <TableCell sx={thSx}>Submitted</TableCell>
                                    <TableCell sx={thSx}>Status</TableCell>
                                    <TableCell sx={thSx} align="right">Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginate(filteredPending).map((row, idx) => (
                                    <TableRow key={row.id} hover>
                                        <TableCell>{page * rowsPerPage + idx + 1}</TableCell>
                                        <TableCell>
                                            <Typography variant="subtitle2" fontWeight={700}>{row.tenant_name}</Typography>
                                            <Typography variant="caption" color="textSecondary">{row.tenant_short_name}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="caption" display="block">{row.admin_email}</Typography>
                                            <Typography variant="caption" color="textSecondary">{row.admin_phone}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">{row.agent?.org_name || row.agent?.name || '—'}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="caption">
                                                {row.created_at ? new Date(row.created_at).toLocaleDateString() : '—'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>{statusChip(row.status)}</TableCell>
                                        <TableCell align="right">
                                            <Button size="small" variant="outlined" startIcon={<IconEye size={14} />}
                                                onClick={() => { setReviewProspect(row); setReviewOpen(true); }}
                                                sx={{ textTransform: 'none', borderRadius: '6px' }}>
                                                View / Review
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredPending.length === 0 && (
                                    <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>No pending applications</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                        <TablePagination rowsPerPageOptions={[5, 10, 25]} component="div"
                            count={filteredPending.length} rowsPerPage={rowsPerPage} page={page}
                            onPageChange={(_, p) => setPage(p)}
                            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} />
                    </TableContainer>
                )
            )}

            {/* Tab 2: Approved */}
            {activeTab === 2 && (
                <TableContainer sx={{ bgcolor: 'transparent' }}>
                    <Table>
                        <SchoolTableHead />
                        <TableBody>
                            {paginate(filteredApproved).map((row, idx) => <SchoolRow key={idx} row={row} idx={idx} />)}
                            {filteredApproved.length === 0 && (
                                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>No approved schools yet</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                    <TablePagination rowsPerPageOptions={[5, 10, 25]} component="div"
                        count={filteredApproved.length} rowsPerPage={rowsPerPage} page={page}
                        onPageChange={(_, p) => setPage(p)}
                        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} />
                </TableContainer>
            )}

            {/* Action Menu */}
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
                PaperProps={{
                    elevation: 0,
                    sx: {
                        borderRadius: '8px', border: `1px solid ${theme.palette.divider}`,
                        bgcolor: theme.palette.background.paper, boxShadow: theme.shadows[3], minWidth: 150,
                        '& .MuiMenuItem-root': {
                            fontSize: '14px', fontWeight: 600, color: theme.palette.text.secondary, py: 1, px: 2,
                            '&:hover': { bgcolor: isDarkMode ? theme.palette.action.hover : '#F8FAFC', color: theme.palette.primary.main },
                        },
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <MenuItem onClick={() => setAnchorEl(null)}>
                    <ListItemIcon><IconEye size={18} /></ListItemIcon>
                    <ListItemText primary="View Detail" />
                </MenuItem>
                <MenuItem onClick={() => setAnchorEl(null)}>
                    <ListItemIcon><IconEdit size={18} /></ListItemIcon>
                    <ListItemText primary="Edit Record" />
                </MenuItem>
                <MenuItem onClick={() => setAnchorEl(null)} sx={{ color: `${theme.palette.error.main} !important` }}>
                    <ListItemIcon sx={{ color: theme.palette.error.main }}><IconTrash size={18} /></ListItemIcon>
                    <ListItemText primary="Delete" />
                </MenuItem>
            </Menu>

            {/* Review Modal */}
            <ReviewModal open={reviewOpen} onClose={() => setReviewOpen(false)}
                prospect={reviewProspect} onApprove={handleApprove} onReject={handleReject} loading={actionLoading} />

            <ReusableModal open={openAddModal} onClose={() => setOpenAddModal(false)} title="Register School" size="large">
                <RegisterSchoolForm
                    actionType="create"
                    onSubmit={() => { setOpenAddModal(false); fetchProspects(); }}
                    onCancel={() => setOpenAddModal(false)}
                    useProspective
                />
            </ReusableModal>
        </Box>
    );
};

export default SchoolsTab;
