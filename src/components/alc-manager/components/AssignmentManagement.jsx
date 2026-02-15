import React, { useState, useMemo } from 'react';
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
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Alert,
} from '@mui/material';
import { Search as SearchIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';
import ParentCard from 'src/components/shared/ParentCard';

const AssignmentManagement = () => {
  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      userType: 'Admin',
      assignedRole: 'Super_Admin',
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      userType: 'User',
      assignedRole: 'User',
    },
    {
      id: 3,
      name: 'Bob Johnson',
      email: 'bob@example.com',
      userType: 'Manager',
      assignedRole: 'Customer',
    },
    {
      id: 4,
      name: 'Alice Williams',
      email: 'alice@example.com',
      userType: 'User',
      assignedRole: 'Suoer_Agent',
    },
    {
      id: 5,
      name: 'Charlie Brown',
      email: 'charlie@example.com',
      userType: 'Admin',
      assignedRole: 'Super_Admin',
    },
  ]);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [nameFilter, setNameFilter] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState('');

  const paginatedUsers = useMemo(() => {
    const start = page * rowsPerPage;
    return users.slice(start, start + rowsPerPage);
  }, [users, page, rowsPerPage]);

  const handleMenuOpen = (event, row) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (action, row) => {
    console.log(`${action} action for user:`, row);
    handleMenuClose();
  };

  const filteredUsers = users.filter((user) => {
    const matchesName = user.name.toLowerCase().includes(nameFilter.toLowerCase());
    const matchesUserType = userTypeFilter ? user.userType === userTypeFilter : true;
    return matchesName && matchesUserType;
  });

  const paginatedFilteredUsers = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredUsers.slice(start, start + rowsPerPage);
  }, [filteredUsers, page, rowsPerPage]);

  const resetFilters = () => {
    setNameFilter('');
    setUserTypeFilter('');
    setPage(0);
  };

  const hasFilters = nameFilter !== '' || userTypeFilter !== '';

  return (
    <ParentCard
      title={
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h5">Assign Roles to Users</Typography>
        </Box>
      }
    >
      <Box sx={{ p: 0 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', mb: 2 }}>
          <TextField
            placeholder="Search by Name"
            value={nameFilter}
            onChange={(e) => {
              setNameFilter(e.target.value);
              setPage(0);
            }}
            sx={{ mb: 2, flex: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            select
            // label="User Type"
            value={userTypeFilter}
            onChange={(e) => {
              setUserTypeFilter(e.target.value);
              setPage(0);
            }}
            sx={{ mb: 2, minWidth: 150 }}
            SelectProps={{
              native: true,
            }}
          >
            <option value="">All Types</option>
            <option value="Admin">Admin</option>
            <option value="Manager">Manager</option>
            <option value="User">User</option>
          </TextField>

          {hasFilters && (
            <Button variant="outlined" onClick={resetFilters} sx={{ height: 'fit-content', mb: 2 }}>
              Clear Filters
            </Button>
          )}
        </Box>

        <Paper variant="outlined">
          <TableContainer>
            <Table sx={{ tableLayout: 'fixed' }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: '15%' }}>#</TableCell>
                  <TableCell sx={{ width: '35%' }}>User Details</TableCell>
                  <TableCell sx={{ width: '35%' }}>Assigned Role</TableCell>
                  <TableCell sx={{ width: '15%' }} align="center">
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedFilteredUsers.length > 0 ? (
                  paginatedFilteredUsers.map((user, index) => (
                    <TableRow key={user.id} hover>
                      <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <img
                            src={user.avatar || '/src/assets/images/users/default-avatar.png'}
                            alt={user.name}
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              objectFit: 'cover',
                            }}
                          />
                          <Box>
                            <Typography variant="subtitle2">{user.name}</Typography>
                            <Typography variant="caption" color="textSecondary">
                              {user.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={user.assignedRole}
                          size="small"
                          variant="outlined"
                          color="primary"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton onClick={(e) => handleMenuOpen(e, user)}>
                          <MoreVertIcon />
                        </IconButton>
                        <Menu
                          anchorEl={anchorEl}
                          open={Boolean(anchorEl) && selectedRow?.id === user.id}
                          onClose={handleMenuClose}
                        >
                          <MenuItem onClick={() => handleAction('edit', user)}>
                            Change Role
                          </MenuItem>
                          <MenuItem onClick={() => handleAction('view', user)}>
                            View Details
                          </MenuItem>
                          <MenuItem onClick={() => handleAction('remove', user)}>
                            Remove Role
                          </MenuItem>
                        </Menu>
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
                          ? 'No users match the current filters.'
                          : 'No users available. Add new users or adjust filters.'}
                      </Alert>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    count={filteredUsers.length}
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
    </ParentCard>
  );
};

export default AssignmentManagement;
