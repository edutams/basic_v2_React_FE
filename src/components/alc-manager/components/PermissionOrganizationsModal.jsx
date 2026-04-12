import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableFooter,
  TablePagination,
  TableContainer,
  CircularProgress,
  Alert,
  Typography,
  Box,
  Avatar,
  Chip,
  InputAdornment,
  TextField,
  IconButton,
  LinearProgress,
  Tooltip,
  Collapse,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  BusinessOutlined as OrgIcon,
  KeyboardArrowDown as ExpandIcon,
  KeyboardArrowUp as CollapseIconUp,
} from '@mui/icons-material';
import aclApi from 'src/api/aclApi';

/**
 * PermissionOrganizationsModal
 *
 * The API is expected to return a flat list of users (same shape as the role
 * organisations endpoint), each with a nested `organization` object.
 * Users are grouped by organization for display.
 *
 * Props:
 *   open         {boolean}
 *   onClose      {function}
 *   permissionId {number|string|null}
 */
const PermissionOrganizationsModal = ({ open, onClose, permissionId }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [search, setSearch] = useState('');
  const [expandedOrgId, setExpandedOrgId] = useState(null);

  useEffect(() => {
    if (open && permissionId) {
      setPage(0);
      setSearch('');
      setError(null);
      setExpandedOrgId(null);
    }
  }, [open, permissionId]);

  useEffect(() => {
    if (!open || !permissionId) return;
    fetchData();
  }, [open, permissionId, page, search]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await aclApi.getPermissionOrganizations(permissionId, {
        page: page + 1,
        search,
      });

      if (res?.data) {
        const raw = res.data.data ?? res.data ?? [];
        setUsers(Array.isArray(raw) ? raw : []);
        setTotalRows(res.data.total ?? (Array.isArray(raw) ? raw.length : 0));
        setRowsPerPage(res.data.per_page ?? 10);
      }
    } catch (err) {
      console.error('Failed to fetch permission organizations:', err);
      setError('Failed to load organizations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Group flat user list by their nested organization
  const groupedOrgs = useMemo(() => {
    const map = new Map();
    users.forEach((user) => {
      const org = user.organization;
      if (!org) return;
      if (!map.has(org.id)) {
        map.set(org.id, {
          orgId: org.id,
          name: org.organization_name,
          code: org.organization_code,
          logo: org.organization_logo,
          email: org.organization_email,
          accessLevel: org.access_level,
          status: org.status,
          members: [],
        });
      }
      map.get(org.id).members.push(user);
    });
    return Array.from(map.values());
  }, [users]);

  // Client-side filter on top of server search
  const filteredOrgs = useMemo(() => {
    if (!search) return groupedOrgs;
    const lower = search.toLowerCase();
    return groupedOrgs.filter(
      (o) =>
        o.name?.toLowerCase().includes(lower) ||
        o.email?.toLowerCase().includes(lower) ||
        o.code?.toLowerCase().includes(lower),
    );
  }, [groupedOrgs, search]);

  const maxMembers = useMemo(
    () => Math.max(1, ...filteredOrgs.map((o) => o.members.length)),
    [filteredOrgs],
  );

  const handleClose = () => {
    setUsers([]);
    setSearch('');
    setPage(0);
    setError(null);
    setExpandedOrgId(null);
    onClose();
  };

  const toggleExpand = (orgId) => setExpandedOrgId((prev) => (prev === orgId ? null : orgId));

  const getInitials = (name = '') =>
    name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();

  const barColor = (count) => {
    const ratio = count / maxMembers;
    if (ratio >= 0.75) return 'error';
    if (ratio >= 0.4) return 'warning';
    return 'primary';
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <OrgIcon fontSize="small" color="primary" />
          <Typography variant="h6" component="span">
            Organizations with this Permission
          </Typography>
          {filteredOrgs.length > 0 && !loading && (
            <Chip
              label={`${filteredOrgs.length} org${filteredOrgs.length !== 1 ? 's' : ''}`}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
        </Box>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 2 }}>
        <TextField
          placeholder="Search by name, code or email"
          value={search}
          size="small"
          fullWidth
          sx={{ mb: 2 }}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TableContainer sx={{ maxHeight: 480 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '4%' }} />
                <TableCell sx={{ width: '32%' }}>Organization</TableCell>
                <TableCell sx={{ width: '18%' }}>Code</TableCell>
                <TableCell sx={{ width: '14%' }} align="center">
                  Members
                </TableCell>
                <TableCell sx={{ width: '17%' }}>Distribution</TableCell>
                <TableCell sx={{ width: '15%' }} align="center">
                  Status
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              ) : filteredOrgs.length > 0 ? (
                filteredOrgs.map((org) => (
                  <React.Fragment key={org.orgId}>
                    {/* — Org summary row — */}
                    <TableRow
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => toggleExpand(org.orgId)}
                    >
                      <TableCell>
                        <IconButton size="small" tabIndex={-1}>
                          {expandedOrgId === org.orgId ? (
                            <CollapseIconUp fontSize="small" />
                          ) : (
                            <ExpandIcon fontSize="small" />
                          )}
                        </IconButton>
                      </TableCell>

                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar
                            src={org.logo}
                            sx={{
                              width: 30,
                              height: 30,
                              fontSize: 11,
                              bgcolor: 'primary.light',
                              color: 'primary.main',
                            }}
                          >
                            {!org.logo && getInitials(org.name)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={500} noWrap>
                              {org.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {org.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {org.code}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Chip
                          label={org.members.length}
                          size="small"
                          color="primary"
                          variant="filled"
                        />
                      </TableCell>

                      <TableCell>
                        <Tooltip
                          title={`${org.members.length} member${org.members.length !== 1 ? 's' : ''} with this permission`}
                          placement="top"
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={(org.members.length / maxMembers) * 100}
                              color={barColor(org.members.length)}
                              sx={{ flex: 1, height: 6, borderRadius: 4 }}
                            />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ minWidth: 28 }}
                            >
                              {Math.round((org.members.length / maxMembers) * 100)}%
                            </Typography>
                          </Box>
                        </Tooltip>
                      </TableCell>

                      <TableCell align="center">
                        <Chip
                          label={org.status === 'active' ? 'Active' : 'Inactive'}
                          size="small"
                          color={org.status === 'active' ? 'success' : 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>

                    {/* — Expandable members list — */}
                    <TableRow>
                      <TableCell colSpan={6} sx={{ p: 0, border: 0 }}>
                        <Collapse in={expandedOrgId === org.orgId} timeout="auto" unmountOnExit>
                          <Box
                            sx={{
                              mx: 2,
                              mb: 1.5,
                              border: '1px solid',
                              borderColor: 'divider',
                              borderRadius: 1,
                              bgcolor: 'background.default',
                            }}
                          >
                            <Typography
                              variant="caption"
                              fontWeight={500}
                              color="text.secondary"
                              sx={{ px: 2, pt: 1.5, pb: 0.5, display: 'block' }}
                            >
                              Members with this permission in {org.name}
                            </Typography>
                            <List dense disablePadding>
                              {org.members.map((member, i) => (
                                <ListItem
                                  key={member.id}
                                  divider={i < org.members.length - 1}
                                  sx={{ py: 0.75 }}
                                >
                                  <ListItemAvatar sx={{ minWidth: 40 }}>
                                    <Avatar
                                      src={member.avatar}
                                      sx={{ width: 28, height: 28, fontSize: 11 }}
                                    >
                                      {!member.avatar &&
                                        getInitials(
                                          member.full_name ?? `${member.fname} ${member.lname}`,
                                        )}
                                    </Avatar>
                                  </ListItemAvatar>
                                  <ListItemText
                                    primary={
                                      <Box
                                        sx={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: 0.5,
                                        }}
                                      >
                                        <Typography variant="body2" fontWeight={500}>
                                          {member.full_name ?? `${member.fname} ${member.lname}`}
                                        </Typography>
                                        {member.is_lead === 'yes' && (
                                          <Chip
                                            label="Lead"
                                            size="small"
                                            color="warning"
                                            variant="outlined"
                                            sx={{ height: 18, fontSize: 10 }}
                                          />
                                        )}
                                      </Box>
                                    }
                                    secondary={member.email}
                                  />
                                  <Chip
                                    label={member.status === 'active' ? 'Active' : 'Inactive'}
                                    size="small"
                                    color={member.status === 'active' ? 'success' : 'default'}
                                    variant="outlined"
                                    sx={{ fontSize: 11 }}
                                  />
                                </ListItem>
                              ))}
                            </List>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Alert
                      severity="info"
                      sx={{
                        justifyContent: 'center',
                        textAlign: 'center',
                        '& .MuiAlert-icon': { mr: 1 },
                      }}
                    >
                      {search
                        ? 'No organizations match your search.'
                        : 'No organizations have members with this permission yet.'}
                    </Alert>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>

            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[10]}
                  count={totalRows}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={(_, newPage) => setPage(newPage)}
                  colSpan={6}
                />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} variant="outlined" size="small">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PermissionOrganizationsModal;
