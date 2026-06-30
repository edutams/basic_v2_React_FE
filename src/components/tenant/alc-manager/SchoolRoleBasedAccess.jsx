import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableFooter,
  TablePagination,
  Paper,
  TextField,
  InputAdornment,
  Button,
  Alert,
  CircularProgress,
  Grid,
} from '@mui/material';
import aclApi from '@/api/tenant/acl/aclApi';
import { Search as SearchIcon } from '@mui/icons-material';
import SchoolRolePermissionsModal from './SchoolRolePermissionsModal';
import SchoolRoleUsersModal from './SchoolRoleUsersModal';

const SchoolRoleBasedAccess = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [nameFilter, setNameFilter] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [permissionModalOpen, setPermissionModalOpen] = useState(false);
  const [usersModalOpen, setUsersModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  useEffect(() => {
    fetchRoles();
  }, [page, rowsPerPage, nameFilter]);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1,
        per_page: rowsPerPage,
        search: nameFilter,
      };
      const res = await aclApi.getSchoolRoleAnalytics(params);

      if (res?.data) {
        setRoles(res.data.data || []);
        setTotalRows(res.data.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setNameFilter(searchInput);
    setPage(0);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const resetFilters = () => {
    setNameFilter('');
    setSearchInput('');
    setPage(0);
  };

  const handleTotalPermissionClick = (role) => {
    setSelectedRole(role);
    setPermissionModalOpen(true);
  };

  const handleTotalUsersClick = (role) => {
    setSelectedRole(role);
    setUsersModalOpen(true);
  };

  const hasFilters = nameFilter !== '';

  return (
    <Box>
      <Box sx={{ p: 0 }}>
        <Grid container spacing={1} mb={3} alignItems="center">
          <Grid size={{ xs: 12, md: 'auto' }}>
            <TextField
              placeholder="Search by role"
              size="small"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleKeyPress}
              sx={{ minWidth: 250 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid size="auto">
            <Button variant="contained" size="small" onClick={handleSearch} sx={{ height: 35 }}>
              Search
            </Button>
          </Grid>
        </Grid>

        <Paper>
          <TableContainer>
            <Table sx={{ tableLayout: 'fixed' }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: '10%' }}>S/N</TableCell>
                  <TableCell sx={{ width: '35%' }}>Roles</TableCell>
                  <TableCell sx={{ width: '35%' }} align="center">
                    Total Permission
                  </TableCell>
                  <TableCell sx={{ width: '15%' }} align="center">
                    Total Users
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : roles.length > 0 ? (
                  roles.map((row, index) => (
                    <TableRow key={row.id} hover>
                      <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2">{row.role}</Typography>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Box>
                          <Typography
                            variant="subtitle2"
                            align="center"
                            sx={{
                              cursor: 'pointer',
                              color: 'primary.main',
                              textDecoration: 'underline',
                              '&:hover': { color: 'primary.dark' },
                            }}
                            onClick={() => handleTotalPermissionClick(row)}
                          >
                            {row.totalPermissions}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="subtitle2"
                          align="center"
                          sx={{
                            cursor: 'pointer',
                            color: 'primary.main',
                            textDecoration: 'underline',
                            '&:hover': { color: 'primary.dark' },
                          }}
                          onClick={() => handleTotalUsersClick(row)}
                        >
                          {row.totalUsers}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Alert
                        severity="info"
                        sx={{
                          mb: 3,
                          justifyContent: 'center',
                          textAlign: 'center',
                          '& .MuiAlert-icon': {
                            mr: 1.5,
                          },
                        }}
                      >
                        {hasFilters ? 'No roles match the current filters.' : 'No roles available.'}
                      </Alert>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50, 100]}
                    count={totalRows}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => {
                      setRowsPerPage(parseInt(e.target.value, 10));
                      setPage(0);
                    }}
                    colSpan={5}
                  />
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
        </Paper>
      </Box>

      <SchoolRolePermissionsModal
        open={permissionModalOpen}
        onClose={() => setPermissionModalOpen(false)}
        role={selectedRole}
      />

      <SchoolRoleUsersModal
        open={usersModalOpen}
        onClose={() => setUsersModalOpen(false)}
        role={selectedRole}
      />
    </Box>
  );
};

export default SchoolRoleBasedAccess;
