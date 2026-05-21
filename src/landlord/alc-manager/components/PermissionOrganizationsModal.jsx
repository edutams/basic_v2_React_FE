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
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  BusinessOutlined as OrgIcon,
  PeopleAltOutlined as AgentsIcon,
  KeyboardArrowDown as ExpandIcon,
  KeyboardArrowUp as CollapseIconUp,
} from '@mui/icons-material';
import aclApi from '@/api/landlord/acl/aclApi';

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
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    if (open && permissionId) {
      setPage(0);
      setSearch('');
      setSearchInput('');
      setError(null);
    }
  }, [open, permissionId]);

  useEffect(() => {
    if (!open || !permissionId) return;
    fetchData();
  }, [open, permissionId, page, search, rowsPerPage]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await aclApi.getPermissionOrganizations(permissionId, {
        page: page + 1,
        per_page: rowsPerPage,
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
      setError('Failed to load agents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setUsers([]);
    setSearch('');
    setSearchInput('');
    setPage(0);
    setError(null);
    onClose();
  };

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(0);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getInitials = (name = '') =>
    name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();

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
          <AgentsIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6" component="span">
            Organization with this Permission
          </Typography>
          {totalRows > 0 && !loading && (
            <Chip
              label={`${totalRows} agent${totalRows !== 1 ? 's' : ''}`}
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
        <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'center' }}>
          <TextField
            placeholder="Search by name or email"
            value={searchInput}
            size="small"
            fullWidth
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={handleKeyPress}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <Button variant="contained" onClick={handleSearch} sx={{ minWidth: 'auto', px: 2 }}>
            Search
          </Button>
          {search && (
            <Button
              variant="outlined"
              onClick={() => {
                setSearch('');
                setSearchInput('');
                setPage(0);
              }}
              sx={{ minWidth: 'auto', px: 2 }}
            >
              Clear
            </Button>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TableContainer sx={{ maxHeight: 480 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '5%' }}>#</TableCell>
                <TableCell sx={{ width: '35%' }}>Organization Name</TableCell>
                <TableCell sx={{ width: '25%' }}>Organization</TableCell>
                <TableCell sx={{ width: '20%' }}>Email</TableCell>
                <TableCell sx={{ width: '15%' }} align="center">
                  Status
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              ) : users.length > 0 ? (
                users.map((user, index) => (
                  <TableRow key={user.id} hover>
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar
                          src={user.avatar}
                          sx={{
                            width: 30,
                            height: 30,
                            fontSize: 11,
                            bgcolor: 'primary.light',
                            color: 'primary.main',
                          }}
                        >
                          {!user.avatar &&
                            getInitials(user.full_name ?? `${user.fname} ${user.lname}`)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={500} noWrap>
                            {user.full_name ?? `${user.fname} ${user.lname}`}
                          </Typography>
                          {user.is_lead === 'yes' && (
                            <Chip
                              label="Lead"
                              size="small"
                              color="warning"
                              variant="outlined"
                              sx={{ height: 18, fontSize: 10 }}
                            />
                          )}
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {user.organization?.organization_name || '—'}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {user.email}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Chip
                        label={user.status === 'active' ? 'Active' : 'Inactive'}
                        size="small"
                        color={user.status === 'active' ? 'success' : 'default'}
                        variant="outlined"
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Alert
                      severity="info"
                      sx={{
                        justifyContent: 'center',
                        textAlign: 'center',
                        '& .MuiAlert-icon': { mr: 1 },
                      }}
                    >
                      {search
                        ? 'No agents match your search.'
                        : 'No agents have this permission yet.'}
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
                  colSpan={5}
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
