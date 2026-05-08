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
  Grid
} from '@mui/material';
import aclApi from 'src/api/aclApi';
import { Search as SearchIcon } from '@mui/icons-material';
import SchoolTotalPermissionModal from './SchoolTotalPermissionModal';
import SchoolTotalUsersModal from './SchoolTotalUsersModal';

const SchoolPermissionBased = () => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [nameFilter, setNameFilter] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [permissionModalOpen, setPermissionModalOpen] = useState(false);
  const [usersModalOpen, setUsersModalOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState(null);

  useEffect(() => {
    fetchPermissions();
  }, [page, rowsPerPage, nameFilter]);

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1,
        per_page: rowsPerPage,
        search: nameFilter,
      };
      const res = await aclApi.getSchoolPermissionAnalytics(params);

      if (res?.data?.data) {
        setPermissions(res.data.data || []);
        setTotalRows(res.data.total || 0);
      } else if (res?.current_page) {
        setPermissions(res.data || []);
        setTotalRows(res.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
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

  const handleTotalRoleClick = (permission) => {
    setSelectedPermission(permission);
    setPermissionModalOpen(true);
  };

  const handleTotalUsersClick = (permission) => {
    setSelectedPermission(permission);
    setUsersModalOpen(true);
  };

  const hasFilters = nameFilter !== '';

  return (
    <Box>
      <Box sx={{ p: 0 }}>

        <Grid container spacing={1} mb={3} alignItems="center">
          <Grid size={{ xs: 12, md: 'auto' }}>
            <TextField
              placeholder="Search by permission"
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
            <Button
              variant="contained"
              size="small"
              onClick={handleSearch}
              sx={{ height: 35 }}
            >
              Search
            </Button>
          </Grid>
        </Grid>

        <Paper variant="outlined">
          <TableContainer>
            <Table sx={{ tableLayout: 'fixed' }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: '10%' }}>S/N</TableCell>
                  <TableCell sx={{ width: '35%' }}>Permissions</TableCell>
                  <TableCell sx={{ width: '35%' }} align="center">
                    Total Role
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
                ) : permissions.length > 0 ? (
                  permissions.map((item, index) => (
                    <TableRow key={item.id} hover>
                      <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2">{item.name}</Typography>
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
                              '&:hover': { color: 'primary.dark' }
                            }}
                            onClick={() => handleTotalRoleClick(item)}
                          >
                            {item.roles_count}
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
                            '&:hover': { color: 'primary.dark' }
                          }}
                          onClick={() => handleTotalUsersClick(item)}
                        >
                          {item.users_count}
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
                        {hasFilters
                          ? 'No permissions match the current filters.'
                          : 'No permissions available.'}
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

      <SchoolTotalPermissionModal
        open={permissionModalOpen}
        onClose={() => setPermissionModalOpen(false)}
        permission={selectedPermission}
      />

      <SchoolTotalUsersModal
        open={usersModalOpen}
        onClose={() => setUsersModalOpen(false)}
        permission={selectedPermission}
      />
    </Box>
  );
};

export default SchoolPermissionBased;
