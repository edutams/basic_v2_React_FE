import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Stack,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Menu,
  MenuItem,
  TablePagination,
  Paper,
  TextField,
  Button,
  InputAdornment,
} from '@mui/material';

import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';

import agentApi from '../../../api/agent';
import { useAuth } from '../../../hooks/useAuth';

const SchoolsView = ({ selectedAgent }) => {
  const { user } = useAuth();

  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedSchool, setSelectedSchool] = useState(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);

  // Search states
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  // Fetch schools
  useEffect(() => {
    const fetchSchools = async () => {
      const agentId = selectedAgent?.id || selectedAgent?.s_n;

      if (!agentId) return;

      setLoading(true);

      try {
        const response = await agentApi.getSchools(agentId);

        setSchools(response?.data || []);
      } catch (error) {
        console.error('Failed to fetch schools:', error);
        setSchools([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSchools();
  }, [selectedAgent]);

  // Search handler
  const handleSearch = () => {
    setSearch(searchInput);
    setPage(0);
  };

  // Enter key search
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Filtered schools
  const filteredSchools = useMemo(() => {
    if (!search) return schools;

    return schools.filter((school) => {
      const schoolName = school?.tenant_short_name || '';
      const email = school?.email || '';

      return (
        schoolName.toLowerCase().includes(search.toLowerCase()) ||
        email.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [schools, search]);

  // Menu handlers
  const handleActionClick = (event, school) => {
    setAnchorEl(event.currentTarget);
    setSelectedSchool(school);
  };

  const handleActionClose = () => {
    setAnchorEl(null);
    setSelectedSchool(null);
  };

  // Actions
  const manageSubscription = () => {
    handleActionClose();
  };

  const handleLoginAs = async () => {
    if (!selectedSchool) return;

    try {
      const response = await agentApi.impersonateTenant(selectedSchool.id);

      if (response?.redirect_url) {
        window.open(response.redirect_url, '_blank');
      } else {
        alert(response?.error || 'Failed to impersonate tenant');
      }
    } catch (error) {
      console.error('Impersonation error:', error);
      alert('An error occurred during impersonation');
    }

    handleActionClose();
  };

  // Pagination
  const paginatedSchools = filteredSchools.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box>
      {/* <Typography variant="h6" mb={3}>
        Schools managed by{' '}
        {selectedAgent?.organizationName || selectedAgent?.agentDetails}
      </Typography> */}

      {/* Search Section */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          alignItems: 'center',
          mb: 2,
          flexWrap: 'wrap',
        }}
      >
        <TextField
          size="small"
          placeholder="Search school name or email"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleKeyPress}
          sx={{ flex: 1, minWidth: 250 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />

        <Button
          variant="contained"
          onClick={handleSearch}
          sx={{ height: 40 }}
        >
          Search
        </Button>
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          maxHeight: 500,
        }}
      >
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>S/N</TableCell>

              <TableCell sx={{ fontWeight: 'bold' }}>
                School Details
              </TableCell>

              <TableCell sx={{ fontWeight: 'bold' }} align="center">
                Status
              </TableCell>

              {/* <TableCell sx={{ fontWeight: 'bold' }} align="center">
                Actions
              </TableCell> */}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 5 }}>
                  <CircularProgress size={30} />
                </TableCell>
              </TableRow>
            ) : paginatedSchools.length > 0 ? (
              paginatedSchools.map((school, index) => (
                <TableRow key={school.id || index} hover>
                  <TableCell>
                    {page * rowsPerPage + index + 1}
                  </TableCell>

                  <TableCell>
                    <Stack
                      direction="row"
                      spacing={1.5}
                      alignItems="center"
                    >
                      <Avatar
                        src={school.school_logo}
                        sx={{
                          width: 36,
                          height: 36,
                          fontSize: '14px',
                          bgcolor: 'primary.light',
                          color: 'primary.main',
                          fontWeight: 700,
                        }}
                      >
                        {school.tenant_short_name
                          ?.split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </Avatar>

                      <Box>
                        <Typography fontWeight={700} fontSize="14px">
                          {school.tenant_short_name}
                        </Typography>

                        <Typography
                          fontSize="12px"
                          color="text.secondary"
                        >
                          {school.email}
                        </Typography>

                        {school.address && (
                          <Typography
                            fontSize="12px"
                            color="text.secondary"
                          >
                            {school.address}
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  </TableCell>

                  <TableCell align="center">
                    <Chip
                      label={school.status || 'Active'}
                      size="small"
                      color={
                        (school.status || 'Active').toLowerCase() === 'active'
                          ? 'success'
                          : 'default'
                      }
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                  <Alert severity="info" sx={{ justifyContent: 'center' }}>
                    {search
                      ? 'No schools match your search.'
                      : 'No schools found.'}
                  </Alert>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[10]}
        component="div"
        count={filteredSchools.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
      />

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleActionClose}
      >
        <MenuItem onClick={manageSubscription}>
          Manage Subscription
        </MenuItem>

        {user?.access_level === 1 && (
          <MenuItem onClick={handleLoginAs}>
            Login As School
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default SchoolsView;