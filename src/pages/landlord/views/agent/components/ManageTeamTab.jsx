import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Divider,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Avatar,
  Chip,
  IconButton,
  Menu,
  Checkbox,
  CircularProgress,
} from '@mui/material';
import { IconDotsVertical, IconEdit, IconTrash, IconShieldLock } from '@tabler/icons-react';
import agentApi from '@/api/landlord/organizations/agent';
import { IMaskInput } from 'react-imask';
import { useNotification } from '@/hooks/useNotification';

const PhoneMaskCustom = React.forwardRef(function PhoneMaskCustom(props, ref) {
  const { onChange, ...other } = props;
  return (
    <IMaskInput
      {...other}
      mask="00000000000"
      definitions={{ 0: /[0-9]/ }}
      inputRef={ref}
      onAccept={(value) => onChange({ target: { name: props.name, value } })}
      overwrite
    />
  );
});

const ManageTeamTab = ({ accessLevel = 1, isViewingProfile = false }) => {
  const theme = useTheme();
  const isLevelOne = accessLevel === 1;
  const notify = useNotification();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openAddModal, setOpenAddModal] = useState(false);
  const [openPermissionModal, setOpenPermissionModal] = useState(false);

  const [anchorEl, setAnchorEl] = useState(null);
  const [activeMember, setActiveMember] = useState(null);

  const [openEditModal, setOpenEditModal] = useState(false);
  const [openRemoveConfirm, setOpenRemoveConfirm] = useState(false);

  const [newPermissions, setNewPermissions] = useState([]);
  const [editPermissions, setEditPermissions] = useState([]);
  const [availablePermissions, setAvailablePermissions] = useState([]);
  const [permissionSearch, setPermissionSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editMemberData, setEditMemberData] = useState({
    fname: '',
    lname: '',
    email: '',
    phone: '',
  });
  const [formData, setFormData] = useState({
    fname: '',
    lname: '',
    email: '',
    phone: '',
  });
  const getInitials = (name = '') =>
    name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  const fetchTeamMembers = async () => {
    setLoading(true);
    try {
      const res = await agentApi.getTeamMembers();
      if (res.status === true) setMembers(res.data || []);
    } catch (e) {
      console.error('Failed to fetch team members', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const handleOpenAddModal = async () => {
    setNewPermissions([]);
    setOpenAddModal(true);
    if (availablePermissions.length === 0) {
      try {
        const permRes = await agentApi.getLeadPermissions();
        if (permRes.status) {
          setAvailablePermissions(permRes.data || []);
        }
      } catch (e) {
        console.error('Failed to fetch lead permissions', e);
      }
    }
  };

  const handleActionClick = (e, member) => {
    setAnchorEl(e.currentTarget);
    setActiveMember(member);
  };

  const handleOpenManagePermission = async () => {
    setAnchorEl(null);
    setPermissionSearch('');
    // Fetch available permissions if not yet loaded
    let perms = availablePermissions;
    if (perms.length === 0) {
      try {
        const permRes = await agentApi.getLeadPermissions();
        if (permRes.status) {
          perms = permRes.data || [];
          setAvailablePermissions(perms);
        }
      } catch (e) {
        console.error('Failed to fetch permissions', e);
      }
    }

    // Get current permissions - include both direct and role-based permissions
    // but only allow modification of direct permissions
    const currentDirectPermissions = activeMember?.direct_permissions || [];
    const currentRolePermissions = activeMember?.role_permissions || [];

    // Set editPermissions to only include direct permissions (modifiable ones)
    setEditPermissions(currentDirectPermissions);
    setOpenPermissionModal(true);
  };

  const handleOpenEdit = () => {
    setAnchorEl(null);
    if (activeMember) {
      // const nameParts = (activeMember.name || '').split(' ');
      setEditMemberData({
        fname: activeMember.fname || '',
        lname: activeMember.lname || '',
        email: activeMember.email || '',
        phone: activeMember.phone || '',
      });
    }
    setOpenEditModal(true);
  };

  const handleEditMember = async () => {
    if (
      !editMemberData.fname ||
      !editMemberData.lname ||
      !editMemberData.email ||
      !editMemberData.phone
    ) {
      notify.error('Please fill in all details');
      return;
    }
    setSubmitting(true);
    try {
      const res = await agentApi.updateTeamMember(activeMember.id, editMemberData);
      if (res.status) {
        fetchTeamMembers();
        setOpenEditModal(false);
        notify.success('Team member updated successfully!');
      } else {
        notify.error(res.message || 'Error updating member');
      }
    } catch (e) {
      console.error(e);
      // Check if the error response contains a message from the backend
      if (e.response && e.response.data && e.response.data.message) {
        notify.error(e.response.data.message);
      } else {
        notify.error('Failed to update team member');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveMember = async () => {
    setSubmitting(true);
    try {
      const res = await agentApi.removeTeamMember(activeMember.id);
      if (res.status) {
        fetchTeamMembers();
        setOpenRemoveConfirm(false);
        setActiveMember(null);
        notify.success('Team member removed successfully!');
      } else {
        notify.error(res.message || 'Error removing member');
      }
    } catch (e) {
      console.error(e);
      // Check if the error response contains a message from the backend
      if (e.response && e.response.data && e.response.data.message) {
        notify.error(e.response.data.message);
      } else {
        notify.error('Failed to remove member');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSavePermissions = async () => {
    if (!activeMember) return;
    setSubmitting(true);
    try {
      const payload = { permissions: editPermissions };
      const res = await agentApi.syncTeamMemberPermissions(activeMember.id, payload);
      if (res.status) {
        fetchTeamMembers();
        setOpenPermissionModal(false);
      } else {
        notify.error(res.message || 'Error updating permissions');
      }
    } catch (e) {
      console.error(e);
      // Check if the error response contains a message from the backend
      if (e.response && e.response.data && e.response.data.message) {
        notify.error(e.response.data.message);
      } else {
        notify.error('Failed to update permissions');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddMember = async () => {
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.phone) {
      notify.error('Please fill in all details');
      return;
    }
    setSubmitting(true);
    try {
      const payload = { ...formData, permissions: newPermissions };
      const res = await agentApi.addTeamMember(payload);
      if (res.status) {
        fetchTeamMembers();
        setOpenAddModal(false);
        setFormData({ first_name: '', last_name: '', email: '', phone: '' });
        setNewPermissions([]);
        notify.success('Team member added successfully!');
      } else {
        notify.error(res.message || 'Error adding member');
      }
    } catch (e) {
      console.error(e);
      // Check if the error response contains a message from the backend
      if (e.response && e.response.data && e.response.data.message) {
        notify.error(e.response.data.message);
      } else {
        notify.error('Failed to add team member');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" mb={2}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Box
            sx={{
              width: 24,
              height: 24,
              bgcolor: '#2ca87f',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}
          >
            <Typography variant="body2" fontWeight="bold">
              T
            </Typography>
          </Box>
          <Typography variant="h5">Manage Team</Typography>
        </Stack>
        {!(accessLevel === 1 && isViewingProfile) && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenAddModal}
            sx={{ textTransform: 'none', borderRadius: '8px' }}
          >
            Add Team Member
          </Button>
        )}
      </Stack>

      {loading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress size={32} />
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'transparent' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{ fontWeight: 700, fontSize: '12px', color: theme.palette.text.secondary }}
                >
                  S/N
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 700, fontSize: '12px', color: theme.palette.text.secondary }}
                >
                  Member Details
                </TableCell>
                {isLevelOne && (
                  <TableCell
                    sx={{ fontWeight: 700, fontSize: '12px', color: theme.palette.text.secondary }}
                  >
                    Organization
                  </TableCell>
                )}
                <TableCell
                  sx={{ fontWeight: 700, fontSize: '12px', color: theme.palette.text.secondary }}
                >
                  Permissions
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 700, fontSize: '12px', color: theme.palette.text.secondary }}
                >
                  Status
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 700, fontSize: '12px', color: theme.palette.text.secondary }}
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isLevelOne ? 6 : 5} align="center" sx={{ py: 5 }}>
                    <Typography variant="body2" color="text.secondary">
                      No team members found.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                members.map((row, index) => {
                  const initials = (row.full_name || 'NA')
                    .split(' ')
                    .slice(0, 2)
                    .map((w) => w[0])
                    .join('')
                    .toUpperCase();
                  return (
                    <TableRow key={row.id} hover>
                      <TableCell sx={{ py: 1.5 }}>
                        <Typography color="textSecondary" variant="body2" fontWeight={400}>
                          {index + 1}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <Stack direction="row" spacing={1.5} alignItems="flex-start">
                          <Avatar
                            src={row.avatar}
                            sx={{
                              width: 36,
                              height: 36,
                              fontSize: '12px',
                              fontWeight: 700,
                              bgcolor: theme.palette.primary.main,
                              flexShrink: 0,
                            }}
                          >
                            {!row.avatar && initials}
                          </Avatar>
                          <Box>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography
                                variant="subtitle2"
                                fontWeight={700}
                                sx={{ lineHeight: 1.3 }}
                              >
                                {row.full_name}
                              </Typography>
                              {row.is_lead === 'yes' && (
                                <Chip
                                  size="small"
                                  label="Lead"
                                  sx={{
                                    bgcolor: theme.palette.primary.light,
                                    color: theme.palette.primary.main,
                                    fontWeight: 700,
                                    borderRadius: '8px',
                                    height: 18,
                                    fontSize: '10px',
                                  }}
                                />
                              )}
                            </Stack>
                            <Typography
                              variant="caption"
                              color="textSecondary"
                              sx={{ display: 'block', lineHeight: 1.4 }}
                            >
                              {row.phone}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="textSecondary"
                              sx={{ display: 'block', lineHeight: 1.4 }}
                            >
                              {row.email}
                            </Typography>
                            <Box sx={{ mt: 0.5 }}>
                              {(row.roles || []).map((role) => (
                                <Typography
                                  key={typeof role === 'string' ? role : role.name}
                                  variant="caption"
                                  sx={{
                                    fontWeight: 600,
                                    color: theme.palette.primary.main,
                                    mr: 0.5,
                                    bgcolor: theme.palette.primary.light,
                                    px: 0.8,
                                    py: 0.2,
                                    borderRadius: '4px',
                                  }}
                                >
                                  {(typeof role === 'string'
                                    ? role
                                    : role.name || role
                                  ).toUpperCase()}
                                </Typography>
                              ))}
                            </Box>
                          </Box>
                        </Stack>
                      </TableCell>
                      {isLevelOne && (
                        <TableCell sx={{ py: 1.5 }}>
                          {row.organization ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar
                                src={row?.organization?.organization_logo}
                                sx={{
                                  width: 30,
                                  height: 30,
                                  fontSize: 11,
                                  bgcolor: 'primary.light',
                                  color: 'primary.main',
                                }}
                              >
                                {!row?.organization?.organization_logo &&
                                  getInitials(row?.organization?.organization_name)}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight={500} noWrap>
                                  {row?.organization?.organization_name}
                                </Typography>
                                <Typography variant="body2">
                                  {row.organization?.organization_email}
                                </Typography>

                                <Typography variant="body2" color="text.secondary">
                                  {row?.organization?.organization_code}
                                </Typography>
                              </Box>
                            </Box>
                          ) : (
                            <Typography variant="caption" color="textSecondary">
                              —
                            </Typography>
                          )}
                        </TableCell>
                      )}
                      <TableCell sx={{ py: 1.5 }}>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                          {(row.permissions || []).slice(0, 6).map((perm) => (
                            <Chip
                              key={perm.name || perm}
                              size="small"
                              label={perm.name || perm}
                              sx={{
                                bgcolor: theme.palette.primary.light,
                                color: theme.palette.primary.main,
                                fontWeight: 700,
                                borderRadius: '8px',
                              }}
                            />
                          ))}
                          {row.permissions?.length > 6 && (
                            <Chip
                              size="small"
                              label={`+${row.permissions.length - 6}`}
                              sx={{
                                bgcolor: '#f1f5f9',
                                color: '#475569',
                                fontWeight: 700,
                                borderRadius: '8px',
                              }}
                            />
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <Chip
                          size="small"
                          label={row.status}
                          sx={{
                            bgcolor: row.status === 'active' ? '#dcfee6' : '#ffe4e6',
                            color: row.status === 'active' ? '#16a34a' : '#e11d48',
                            fontWeight: 600,
                            borderRadius: '6px',
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <IconButton size="small" onClick={(e) => handleActionClick(e, row)}>
                          <IconDotsVertical size={18} color={theme.palette.text.secondary} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{ sx: { borderRadius: '8px', minWidth: 160 } }}
      >
        <MenuItem onClick={handleOpenManagePermission}>
          <IconShieldLock
            size={18}
            style={{ marginRight: 8, color: theme.palette.text.secondary }}
          />
          <Typography variant="body2">Manage Permission</Typography>
        </MenuItem>
        <MenuItem onClick={handleOpenEdit}>
          <IconEdit size={18} style={{ marginRight: 8, color: theme.palette.text.secondary }} />
          <Typography variant="body2">Edit Member</Typography>
        </MenuItem>
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            setOpenRemoveConfirm(true);
          }}
          sx={{ color: theme.palette.error.main }}
        >
          <IconTrash size={18} style={{ marginRight: 8, color: theme.palette.error.main }} />
          <Typography variant="body2">Remove Member</Typography>
        </MenuItem>
      </Menu>

      {/* Add Team Member Modal */}
      <Dialog open={openAddModal} onClose={() => setOpenAddModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Add Team Member</DialogTitle>
        <Divider />
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                size="small"
                label="First Name"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              />
              <TextField
                fullWidth
                size="small"
                label="Last Name"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              />
            </Stack>
            <TextField
              fullWidth
              size="small"
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <TextField
              fullWidth
              size="small"
              label="Phone Number"
              value={formData.phone}
              name="phone"
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              InputProps={{ inputComponent: PhoneMaskCustom }}
            />
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
                      <Chip
                        key={val}
                        size="small"
                        label={availablePermissions.find((p) => p.value === val)?.label || val}
                      />
                    ))}
                  </Box>
                ),
              }}
            >
              {availablePermissions.map((perm) => (
                <MenuItem
                  key={perm.value}
                  value={perm.value}
                  sx={{ alignItems: 'flex-start', py: 1 }}
                >
                  <Checkbox
                    checked={newPermissions.indexOf(perm.value) > -1}
                    size="small"
                    sx={{ mt: 0.2, mr: 0.5, p: 0.5 }}
                  />
                  <Box>
                    {perm.description && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block', lineHeight: 1.3, mb: 0.2 }}
                      >
                        {perm.description}
                      </Typography>
                    )}
                    <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.3 }}>
                      {perm.label}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenAddModal(false)} color="inherit" disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddMember}
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={24} color="inherit" /> : 'Add Member'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Manage Permissions Modal */}
      <Dialog
        open={openPermissionModal}
        onClose={() => setOpenPermissionModal(false)}
        maxWidth="md"
        fullWidth
      >
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
              placeholder="Search permissions..."
              value={permissionSearch}
              onChange={(e) => setPermissionSearch(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Box
              sx={{
                maxHeight: 300,
                overflowY: 'auto',
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                py: 1,
              }}
            >
              {availablePermissions
                .filter((perm) => perm.label.toLowerCase().includes(permissionSearch.toLowerCase()))
                .map((perm) => {
                  const isChecked = editPermissions.indexOf(perm.value) > -1;
                  // Check if this permission is from a role for the current member
                  const memberPermission = activeMember?.permissions?.find(
                    (p) => p.value === perm.value,
                  );
                  const isFromRole =
                    memberPermission?.source === 'role' || memberPermission?.from_role === true;
                  const isDisabled = isFromRole;

                  return (
                    <MenuItem
                      key={perm.value}
                      onClick={() => {
                        if (!isDisabled) {
                          setEditPermissions((prev) =>
                            isChecked
                              ? prev.filter((v) => v !== perm.value)
                              : [...prev, perm.value],
                          );
                        }
                      }}
                      sx={{
                        alignItems: 'flex-start',
                        py: 1,
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <Checkbox
                        checked={isChecked}
                        disabled={isDisabled}
                        size="small"
                        sx={{ mt: 0.2, mr: 0.5, p: 0.5 }}
                      />
                      <Box sx={{ flex: 1 }}>
                        {perm.description && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'block', lineHeight: 1.3, mb: 0.2 }}
                          >
                            {perm.description}
                          </Typography>
                        )}
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.3 }}>
                            {perm.label}
                          </Typography>
                          {isFromRole && (
                            <Chip
                              size="small"
                              label="From Role"
                              sx={{
                                fontSize: '10px',
                                height: 18,
                              }}
                            />
                          )}
                        </Stack>
                        {isFromRole && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'block', lineHeight: 1.3, mt: 0.2, fontStyle: 'italic' }}
                          >
                            This permission is inherited from the user's role and cannot be removed
                            individually.
                          </Typography>
                        )}
                      </Box>
                    </MenuItem>
                  );
                })}
              {availablePermissions.filter((perm) =>
                perm.label.toLowerCase().includes(permissionSearch.toLowerCase()),
              ).length === 0 && (
                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
                  No permissions found.
                </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setOpenPermissionModal(false)}
            color="inherit"
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSavePermissions}
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Edit Member Modal */}
      <Dialog open={openEditModal} onClose={() => setOpenEditModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Edit Member</DialogTitle>
        <Divider />
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                size="small"
                label="First Name"
                value={editMemberData.fname}
                onChange={(e) => setEditMemberData({ ...editMemberData, fname: e.target.value })}
              />
              <TextField
                fullWidth
                size="small"
                label="Last Name"
                value={editMemberData.lname}
                onChange={(e) => setEditMemberData({ ...editMemberData, lname: e.target.value })}
              />
            </Stack>
            <TextField
              fullWidth
              size="small"
              label="Email Address"
              type="email"
              value={editMemberData.email}
              onChange={(e) => setEditMemberData({ ...editMemberData, email: e.target.value })}
            />
            <TextField
              fullWidth
              size="small"
              label="Phone Number"
              value={editMemberData.phone}
              name="phone"
              onChange={(e) => setEditMemberData({ ...editMemberData, phone: e.target.value })}
              InputProps={{ inputComponent: PhoneMaskCustom }}
            />
          </Stack>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenEditModal(false)} color="inherit" disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleEditMember}
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={24} color="inherit" /> : 'Update Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Remove Member Confirm */}
      <Dialog
        open={openRemoveConfirm}
        onClose={() => setOpenRemoveConfirm(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Remove Member</DialogTitle>
        <Divider />
        <DialogContent>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Are you sure you want to remove <strong>{activeMember?.name}</strong> from the team?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenRemoveConfirm(false)} color="inherit" disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleRemoveMember}
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={24} color="inherit" /> : 'Remove'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageTeamTab;
