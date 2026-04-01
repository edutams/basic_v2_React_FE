import React, { useState } from 'react';
import {
    Box, Typography, Paper, Button, Stack, useTheme,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Grid, MenuItem, Divider, TableContainer,
    Table, TableHead, TableRow, TableCell, TableBody,
    Avatar, Chip, IconButton, Menu, Checkbox, ListItemText
} from '@mui/material';
import { IconDotsVertical, IconEdit, IconTrash, IconShieldLock } from '@tabler/icons-react';

const PERMISSIONS = [
    { value: 'manage_commission', label: 'Manage Commission' },
    { value: 'manage_team', label: 'Manage Team' },
    { value: 'manage_schools', label: 'Manage Schools' },
    { value: 'view_reports', label: 'View Reports' },
    { value: 'manage_billing', label: 'Manage Billing' }
];

const mockTeamMembers = [
    { id: 1, name: 'Alice Johnson', email: 'alice.j@example.com', phone: '123-456-7890', roles: ['Manage Team', 'View Reports'], status: 'Active' },
    { id: 2, name: 'Bob Smith', email: 'bob.s@example.com', phone: '098-765-4321', roles: ['Manage Commission'], status: 'Active' },
    { id: 3, name: 'Charlie Brown', email: 'charlie.b@example.com', phone: '555-123-4567', roles: ['Manage Schools', 'Manage Billing'], status: 'Inactive' },
    { id: 4, name: 'Diana Prince', email: 'diana.p@example.com', phone: '444-555-6666', roles: ['Manage Team', 'Manage Schools'], status: 'Active' },
    { id: 5, name: 'Evan Wright', email: 'evan.w@example.com', phone: '333-222-1111', roles: ['Manage Schools'], status: 'Active' }
];

const ManageTeamTab = () => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const [openAddModal, setOpenAddModal] = useState(false);
    const [openPermissionModal, setOpenPermissionModal] = useState(false);

    const [anchorEl, setAnchorEl] = useState(null);
    const [activeMember, setActiveMember] = useState(null);

    const [newPermissions, setNewPermissions] = useState([]);
    const [editPermissions, setEditPermissions] = useState([]);

    const handleActionClick = (e, member) => {
        setAnchorEl(e.currentTarget);
        setActiveMember(member);
    };

    const handleOpenManagePermission = () => {
        setAnchorEl(null);
        // Map current string roles to values if editing
        const currentVals = activeMember?.roles?.map(r => PERMISSIONS.find(p => p.label === r)?.value).filter(Boolean) || [];
        setEditPermissions(currentVals);
        setOpenPermissionModal(true);
    };

    return (
        <Box>
            <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" mb={2}>
                <Stack direction="row" spacing={1} alignItems="center">
                    <Box sx={{ width: 24, height: 24, bgcolor: '#2ca87f', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                        <Typography variant="body2" fontWeight="bold">T</Typography>
                    </Box>
                    <Typography variant="h5">Manage Team</Typography>
                </Stack>
                <Button
                    variant="contained"
                    onClick={() => { setNewPermissions([]); setOpenAddModal(true); }}
                    sx={{ bgcolor: '#3949ab', textTransform: 'none', borderRadius: '8px', '&:hover': { bgcolor: '#303f9f' } }}
                >
                    Add Team Member
                </Button>
            </Stack>

            <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'transparent' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: theme.palette.text.secondary }}>S/N</TableCell>
                            <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: theme.palette.text.secondary }}>Member Details</TableCell>
                            <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: theme.palette.text.secondary }}>Permissions</TableCell>
                            <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: theme.palette.text.secondary }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: theme.palette.text.secondary }}>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {mockTeamMembers.map((row, index) => {
                            const initials = (row.name || 'NA').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
                            return (
                                <TableRow key={row.id} hover>
                                    <TableCell sx={{ py: 1.5 }}>
                                        <Typography color="textSecondary" variant="body2" fontWeight={400}>{index + 1}</Typography>
                                    </TableCell>
                                    <TableCell sx={{ py: 1.5 }}>
                                        <Stack direction="row" spacing={1.5} alignItems="flex-start">
                                            <Avatar sx={{ width: 36, height: 36, fontSize: '12px', fontWeight: 700, bgcolor: '#3949ab', flexShrink: 0 }}>
                                                {initials}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="subtitle2" fontWeight={700} sx={{ lineHeight: 1.3 }}>{row.name}</Typography>
                                                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', lineHeight: 1.4 }}>{row.phone}</Typography>
                                                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', lineHeight: 1.4 }}>{row.email}</Typography>
                                            </Box>
                                        </Stack>
                                    </TableCell>
                                    <TableCell sx={{ py: 1.5 }}>
                                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                            {row.roles.map(role => (
                                                <Chip key={role} size="small" label={role} sx={{ bgcolor: '#e8eaf6', color: '#3949ab', fontWeight: 700, borderRadius: '8px' }} />
                                            ))}
                                        </Stack>
                                    </TableCell>
                                    <TableCell sx={{ py: 1.5 }}>
                                        <Chip size="small" label={row.status} sx={{ bgcolor: row.status === 'Active' ? '#dcfee6' : '#ffe4e6', color: row.status === 'Active' ? '#16a34a' : '#e11d48', fontWeight: 600, borderRadius: '6px' }} />
                                    </TableCell>
                                    <TableCell sx={{ py: 1.5 }}>
                                        <IconButton size="small" onClick={(e) => handleActionClick(e, row)}>
                                            <IconDotsVertical size={18} color={theme.palette.text.secondary} />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>

            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)} PaperProps={{ sx: { borderRadius: '8px', minWidth: 160 } }}>
                <MenuItem onClick={handleOpenManagePermission}>
                    <Box component={IconShieldLock} size={18} sx={{ mr: 1, color: theme.palette.text.secondary }} />
                    <Typography variant="body2">Manage Permission</Typography>
                </MenuItem>
                <MenuItem onClick={() => setAnchorEl(null)}>
                    <Box component={IconEdit} size={18} sx={{ mr: 1, color: theme.palette.text.secondary }} />
                    <Typography variant="body2">Edit Member</Typography>
                </MenuItem>
                <MenuItem onClick={() => setAnchorEl(null)} sx={{ color: theme.palette.error.main }}>
                    <Box component={IconTrash} size={18} sx={{ mr: 1, color: theme.palette.error.main }} />
                    <Typography variant="body2">Remove Member</Typography>
                </MenuItem>
            </Menu>

            {/* Add Team Member Modal */}
            <Dialog open={openAddModal} onClose={() => setOpenAddModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>Add Team Member</DialogTitle>
                <Divider />
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth size="small" label="First Name" />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth size="small" label="Last Name" />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField fullWidth size="small" label="Email Address" type="email" />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                size="small"
                                select
                                label="Permissions"
                                value={newPermissions}
                                onChange={(e) => setNewPermissions(e.target.value)}
                                SelectProps={{
                                    multiple: true,
                                    renderValue: (selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((val) => (
                                                <Chip key={val} size="small" label={PERMISSIONS.find(p => p.value === val)?.label || val} />
                                            ))}
                                        </Box>
                                    )
                                }}
                            >
                                {PERMISSIONS.map((perm) => (
                                    <MenuItem key={perm.value} value={perm.value}>
                                        <Checkbox checked={newPermissions.indexOf(perm.value) > -1} />
                                        <ListItemText primary={perm.label} />
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                    </Grid>
                </DialogContent>
                <Divider />
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenAddModal(false)} color="inherit">
                        Cancel
                    </Button>
                    <Button variant="contained" sx={{ bgcolor: '#3949ab' }} onClick={() => setOpenAddModal(false)}>
                        Add Member
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Manage Permissions Modal */}
            <Dialog open={openPermissionModal} onClose={() => setOpenPermissionModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>Manage Permissions</DialogTitle>
                <Divider />
                <DialogContent>
                    <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" mb={2}>
                            Update permissions for <strong>{activeMember?.name}</strong>
                        </Typography>
                        <TextField
                            fullWidth
                            size="small"
                            select
                            label="Permissions"
                            value={editPermissions}
                            onChange={(e) => setEditPermissions(e.target.value)}
                            SelectProps={{
                                multiple: true,
                                renderValue: (selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((val) => (
                                            <Chip key={val} size="small" label={PERMISSIONS.find(p => p.value === val)?.label || val} />
                                        ))}
                                    </Box>
                                )
                            }}
                        >
                            {PERMISSIONS.map((perm) => (
                                <MenuItem key={perm.value} value={perm.value}>
                                    <Checkbox checked={editPermissions.indexOf(perm.value) > -1} />
                                    <ListItemText primary={perm.label} />
                                </MenuItem>
                            ))}
                        </TextField>
                    </Box>
                </DialogContent>
                <Divider />
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenPermissionModal(false)} color="inherit">
                        Cancel
                    </Button>
                    <Button variant="contained" sx={{ bgcolor: '#3949ab' }} onClick={() => setOpenPermissionModal(false)}>
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
};

export default ManageTeamTab;
