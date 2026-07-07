import React, { useState } from 'react';
import {
  IconButton,
  Typography,
  Box,
  Grid,
  Stack,
  Select,
  MenuItem,
  TextField,
  Menu,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableFooter,
  useTheme,
  Card,
  Button,
} from '@mui/material';
import GetAppIcon from '@mui/icons-material/GetApp';
import { IconUsers, IconEye, IconEdit, IconTrash, IconFilter, IconChartBar, IconHelpCircle, IconDotsVertical, IconDownload, IconUser, IconSchool, IconUsersGroup } from '@tabler/icons-react';
import ReusableModal from '@/components/shared/ReusableModal';
import StatCard from 'src/components/shared/StatCard';

const predefinedStats = [
  { label: 'Teacher', searchLabels: ['Teacher', 'Staffs'], icon: IconUser, color: '#3B82F6' },
  { label: 'Student', searchLabels: ['Student'], icon: IconSchool, color: '#10B981' },
  { label: 'SPA', searchLabels: ['SPA'], icon: IconUsers, color: '#F59E0B' },
  { label: 'Agents', searchLabels: ['Agents'], icon: IconUsers, color: '#8B5CF6' },
];

const defaultUsersData = [
  { id: '1', school: 'Evergreen High School', url: 'evergreen.edutams.net', number: '12', agent: 'Agent 1', userType: 'Teacher', date: '2026-07-01' },
  { id: '2', school: 'Oakville Primary', url: 'oakville.edutams.net', number: '5', agent: 'Agent 2', userType: 'Student', date: '2026-07-02' },
  { id: '3', school: 'Springfield Elementary', url: 'springfield.edutams.net', number: '8', agent: 'Agent 1', userType: 'SPA', date: '2026-07-03' },
  { id: '4', school: 'Lincoln Tech Academy', url: 'lincoln.edutams.net', number: '15', agent: 'Agent 2', userType: 'Teacher', date: '2026-07-04' },
];

const LoggedInUsersModal = ({ open, onClose, onViewUserList, stats = [], usersData = [] }) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const openMenu = Boolean(anchorEl);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const isMenuOpen = Boolean(anchorEl);
  const isDarkMode = theme.palette.mode === 'dark';

  const [filters, setFilters] = useState({
    agent: 'All',
    userType: 'All',
    from: '',
    to: ''
  });

  const [appliedFilters, setAppliedFilters] = useState({
    agent: 'All',
    userType: 'All',
    from: '',
    to: ''
  });

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleApplyFilter = () => {
    setAppliedFilters(filters);
    setPage(0);
  };

  const dataToUse = usersData.length > 0 ? usersData : defaultUsersData;
  const filteredData = dataToUse.filter(row => {
    let match = true;
    if (appliedFilters.agent !== 'All' && row.agent !== appliedFilters.agent) match = false;
    if (appliedFilters.userType !== 'All' && row.userType !== appliedFilters.userType) match = false;
    if (appliedFilters.from && row.date && row.date < appliedFilters.from) match = false;
    if (appliedFilters.to && row.date && row.date > appliedFilters.to) match = false;
    return match;
  });

  const handleClickMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <ReusableModal
      open={open}
      onClose={onClose}
      size="extraLarge"
      padding={4}
      headerBg="#f4f6f8"
      dividers={false}
      title={
        <Typography fontSize={24} fontWeight={700}>
          Logged In Users
        </Typography>
      }
    >
      {/* Top Stat Cards */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 2, sm: 3 }} mb={3} mt={2}>
        {predefinedStats.map((stat, idx) => {
          const statValue = stats?.find(s => stat.searchLabels.includes(s.label))?.value || 0;
          return (
            <Box key={idx} sx={{ width: { xs: '100%', sm: '25%' } }}>
              <StatCard
                label={stat.label}
                count={statValue}
                icon={stat.icon}
                color={stat.color}
              />
            </Box>
          );
        })}
      </Stack>

      {/* Table Section */}
      <Card
        sx={{
          borderRadius: '4px',
          boxShadow: 'none',
          overflow: 'hidden',
          border: theme.palette.mode === 'dark' ? '1px solid #444' : '1px solid #e2e8f0',
          background: theme.palette.mode === 'dark' ? '#1e1e1e' : '#fff',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            bgcolor: theme.palette.mode === 'dark' ? '#1e1e1e' : 'white',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Typography
              variant="subtitle1"
              fontWeight="600"
              sx={{ color: theme.palette.mode === 'dark' ? '#fff' : '#4a5568' }}
            >
              Logged In Users This Week
            </Typography>
          </Stack>

          <Button variant="contained" size="small" color="primary" onClick={handleApplyFilter}>
            Export to Excel
          </Button>
        </Box>

        {/* Filter Bar */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            p: 2,
            bgcolor: theme.palette.mode === 'dark' ? '#2d2d2d' : '#F9F9F9',
            borderTop: theme.palette.mode === 'dark' ? '1px solid #444' : '1px solid #e2e8f0',
          }}
        >
          {/* Agent Filter */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: '6px',
            bgcolor: theme.palette.background.paper,
            overflow: 'hidden',
            flex: { xs: '1 1 auto', sm: '0 0 auto' }
          }}>
            <Box sx={{ px: 2, py: 0.8, bgcolor: isDarkMode ? 'rgba(0, 188, 212, 0.1)' : '#e0f7fa', borderRight: `1px solid ${theme.palette.divider}` }}>
              <Typography variant="body2" fontWeight="600" color="textPrimary">Agent</Typography>
            </Box>
            <Select 
              size="small" 
              value={filters.agent}
              onChange={(e) => handleFilterChange('agent', e.target.value)}
              sx={{ border: 'none', '& fieldset': { border: 'none' }, minWidth: { xs: 'auto', sm: 120 }, flexGrow: 1 }}
            >
              <MenuItem value="All">All Agents</MenuItem>
              <MenuItem value="Agent 1">Agent 1</MenuItem>
              <MenuItem value="Agent 2">Agent 2</MenuItem>
            </Select>
          </Box>

          {/* User Type Filter */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: '6px',
            bgcolor: theme.palette.background.paper,
            overflow: 'hidden',
            flex: { xs: '1 1 auto', sm: '0 0 auto' }
          }}>
            <Box sx={{ px: 2, py: 0.8, bgcolor: isDarkMode ? 'rgba(0, 188, 212, 0.1)' : '#e0f7fa', borderRight: `1px solid ${theme.palette.divider}` }}>
              <Typography variant="body2" fontWeight="600" color="textPrimary">User Type</Typography>
            </Box>
            <Select 
              size="small" 
              value={filters.userType}
              onChange={(e) => handleFilterChange('userType', e.target.value)}
              sx={{ border: 'none', '& fieldset': { border: 'none' }, minWidth: { xs: 'auto', sm: 120 }, flexGrow: 1 }}
            >
              <MenuItem value="All">All Users</MenuItem>
              <MenuItem value="Teacher">Teacher</MenuItem>
              <MenuItem value="Student">Student</MenuItem>
              <MenuItem value="SPA">SPA</MenuItem>
            </Select>
          </Box>

          {/* Dates */}
          <TextField 
            size="small" 
            type="date"
            value={filters.from}
            onChange={(e) => handleFilterChange('from', e.target.value)}
          />
          <TextField 
            size="small" 
            type="date"
            value={filters.to}
            onChange={(e) => handleFilterChange('to', e.target.value)}
          />

          <button
            onClick={handleApplyFilter}
            style={{
              backgroundColor: [theme.palette.primary.main],
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              padding: '6px 12px',
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            Filter
          </button>
        </Box>

        {/* DataTable */}
        <Box
          sx={{
            p: 2,
            background: theme.palette.mode === 'dark' ? '#1e1e1e' : '#fff',
          }}
        >
          <TableContainer
            sx={{
              background: theme.palette.mode === 'dark' ? '#1e1e1e' : '#fff',
            }}
          >
            <Table sx={{ whiteSpace: 'nowrap' }}>
              <TableHead sx={{ bgcolor: theme.palette.mode === 'dark' ? '#2d2d2d' : '#F9FAFB' }}>
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: theme.palette.mode === 'dark' ? '#fff' : '#374151',
                    }}
                  >
                    #
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: theme.palette.mode === 'dark' ? '#fff' : '#374151',
                    }}
                  >
                    School
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: theme.palette.mode === 'dark' ? '#fff' : '#374151',
                    }}
                  >
                    URL
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: theme.palette.mode === 'dark' ? '#fff' : '#374151',
                    }}
                  >
                    Number
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: theme.palette.mode === 'dark' ? '#fff' : '#374151',
                    }}
                  >
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(rowsPerPage > 0
                  ? filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  : filteredData
                ).map((row, index) => (
                  <TableRow
                    key={row.id || index}
                    hover
                    sx={{ color: theme.palette.mode === 'dark' ? '#fff' : '#333' }}
                  >
                    <TableCell sx={{ color: theme.palette.mode === 'dark' ? '#fff' : '#333' }}>
                      {row.id}
                    </TableCell>
                    <TableCell sx={{ color: theme.palette.mode === 'dark' ? '#fff' : '#333' }}>
                      {row.school}
                    </TableCell>
                    <TableCell sx={{ color: theme.palette.mode === 'dark' ? '#fff' : '#333' }}>
                      {row.url}
                    </TableCell>
                    <TableCell sx={{ color: theme.palette.mode === 'dark' ? '#fff' : '#333' }}>
                      {row.number}
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={handleClickMenu}>
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    count={filteredData.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
        </Box>
      </Card>

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handleCloseMenu}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem
          onClick={() => {
            handleCloseMenu();
            onViewUserList();
          }}
        >
          View Users List
        </MenuItem>
      </Menu>
    </ReusableModal>
  );
};

export default LoggedInUsersModal;
