import React, { useState, useEffect, useContext, useMemo } from 'react';
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
  useTheme,
  TextField,
  InputAdornment,
  TablePagination,
  CircularProgress,
  Alert,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { IconSearch } from '@tabler/icons-react';
import StandardModal from 'src/components/shared/StandardModal';
import agentApi from '@/api/landlord/organizations/agent';
import { AuthContext } from 'src/context/AgentContext/auth';

const TotalSubAgentModal = ({ open, onClose, orgId }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [level, setLevel] = useState('');
  const [levelInput, setLevelInput] = useState('');

  const { user } = useContext(AuthContext);
  const userLevel = parseInt(user?.organization?.access_level || 1);

  // Dynamic levels based on logged in organization level
  const levelOptions = useMemo(() => {
    const options = [];
    for (let i = userLevel + 1; i <= 5; i++) {
      options.push({ value: i.toString(), label: `Level ${i}` });
    }
    return options;
  }, [userLevel]);

  useEffect(() => {
    // if (open && orgId) {
    fetchOrganizations();
    // }
  }, [open, orgId, page, search, level]);

  const handleSearch = () => {
    setSearch(searchInput);
    setLevel(levelInput);
    setPage(0);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1,
        search,
      };

      // Add level parameter if it's set
      if (level) {
        params.access_level = level;
      }

      const res = await agentApi.getSubOrganizations(params);
      if (res.status) {
        setData(res.data.data || []);
        setTotalRows(res.data.total || 0);
        setRowsPerPage(res.data.per_page || 10);
      }
    } catch (e) {
      console.error('Failed to fetch sub organizations', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StandardModal
      open={open}
      onClose={onClose}
      title="Total Organizations"
      maxWidth="md"
      padding={3}
      dividers={false}
      headerBg={isDark ? theme.palette.background.paper : '#F8FAFC'}
      sx={{ bgcolor: isDark ? theme.palette.background.default : '#fff' }}
    >
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', mb: 2 }}>
        <TextField
          size="small"
          placeholder="Search by organization name or code"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyPress={handleKeyPress}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IconSearch size={18} />
              </InputAdornment>
            ),
          }}
          sx={{ flex: 1 }}
        />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Level</InputLabel>
          <Select value={levelInput} label="Level" onChange={(e) => setLevelInput(e.target.value)}>
            <MenuItem value="">All Levels</MenuItem>
            {levelOptions.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="contained" size="small" onClick={handleSearch} sx={{ height: 40 }}>
          Search
        </Button>
      </Box>

      <TableContainer sx={{ maxHeight: 450 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>S/N</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Organization Details</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">
                Access Level
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">
                Status
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 5 }}>
                  <CircularProgress size={30} />
                </TableCell>
              </TableRow>
            ) : data.length > 0 ? (
              data.map((org, index) => (
                <TableRow key={org.id} hover>
                  <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar
                        src={org.organization_logo}
                        sx={{
                          width: 36,
                          height: 36,
                          fontSize: '14px',
                          bgcolor: 'primary.light',
                          color: 'primary.main',
                          fontWeight: 700,
                        }}
                      >
                        {org.organization_name
                          ?.split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography fontWeight={700} fontSize="14px">
                          {org.organization_name}
                        </Typography>
                        <Typography fontSize="12px" color="text.secondary">
                          {org.organization_code} | {org.organization_email}
                        </Typography>
                        <Typography fontSize="12px" color="text.secondary">
                          {org.organization_phone}
                        </Typography>
                        <Typography fontSize="12px" color="text.secondary">
                          {org.organization_domain}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={`Level ${org.access_level}`}
                      size="small"
                      sx={{ fontWeight: 600, bgcolor: 'primary.light', color: 'primary.main' }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={org.status === 'active' ? 'Active' : 'Inactive'}
                      size="small"
                      color={org.status === 'active' ? 'success' : 'default'}
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
                    {search ? 'No organizations match your search.' : 'No organizations found.'}
                  </Alert>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[10]}
        component="div"
        count={totalRows}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
      />
    </StandardModal>
  );
};

export default TotalSubAgentModal;
