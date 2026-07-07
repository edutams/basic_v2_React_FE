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
  Card,
  useTheme,
  ListItemIcon, ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableFooter,
  TablePagination,
  Button,
} from '@mui/material';
import GetAppIcon from '@mui/icons-material/GetApp';
import GridViewIcon from '@mui/icons-material/GridView';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { IconUsers, IconEye, IconEdit, IconTrash, IconFilter, IconChartBar, IconHelpCircle, IconDotsVertical, IconDownload } from '@tabler/icons-react';
import StandardModal from 'src/components/shared/StandardModal';
import StatCard from 'src/components/shared/StatCard';

const predefinedStats = [
  { label: 'Teacher', searchLabels: ['Teacher', 'Staffs'], icon: IconUsers, color: '#3B82F6' },
  { label: 'Student', searchLabels: ['Student'], icon: IconUsers, color: '#10B981' },
  { label: 'SPA', searchLabels: ['SPA'], icon: IconUsers, color: '#F59E0B' },
  { label: 'Agents', searchLabels: ['Agents'], icon: IconUsers, color: '#8B5CF6' },
];

const defaultUsersData = [
  { id: '1', school: 'Evergreen High School', url: 'evergreen.edutams.net', number: '12', agent: 'Agent 1', userType: 'Teacher', date: '2026-07-01' },
  { id: '2', school: 'Oakville Primary', url: 'oakville.edutams.net', number: '5', agent: 'Agent 2', userType: 'Student', date: '2026-07-02' },
  { id: '3', school: 'Springfield Elementary', url: 'springfield.edutams.net', number: '8', agent: 'Agent 1', userType: 'SPA', date: '2026-07-03' },
  { id: '4', school: 'Lincoln Tech Academy', url: 'lincoln.edutams.net', number: '15', agent: 'Agent 2', userType: 'Teacher', date: '2026-07-04' },
];

const LoggedInUsersModal = ({ onClose, open, onViewUserList, stats = [], usersData = [] }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const isMenuOpen = Boolean(anchorEl);

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

  const handleMenuClick = (event, row) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };




  return (
    <>
      <StandardModal
        open={open}
        onClose={onClose}
        maxWidth="lg"
        padding={4}
        headerBg={isDarkMode ? theme.palette.background.paper : '#f4f6f8'}
        sx={{ bgcolor: isDarkMode ? theme.palette.background.default : '#f4f6f8' }}
        dividers={false}
        actions={
          <Stack direction="row" spacing={2} justifyContent="flex-end" width="100%">
            <Button variant="contained" onClick={onClose}>Cancel</Button>
            <Button onClick={onClose}>Save</Button>
          </Stack>
        }
      >
        {/* Top Stat Cards */}
        <Grid container spacing={1.5} mb={3}>
          {predefinedStats.map((stat, idx) => {
            const statValue = stats?.find(s => stat.searchLabels.includes(s.label))?.value || 0;
            return (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
                <StatCard
                  label={stat.label}
                  count={statValue}
                  icon={stat.icon}
                  color={stat.color}
                />
              </Grid>
            );
          })}
        </Grid>

        <Card sx={{
          p: 0,
          borderRadius: '4px',
          boxShadow: 'none',
          overflow: 'hidden',
          border: `1px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.background.paper
        }}>
          {/* Header */}
          <Box sx={{
            p: 2,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            bgcolor: 'transparent',
            gap: 2
          }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: '4px', p: 0.5, display: 'flex' }}>
                <GridViewIcon sx={{ color: theme.palette.text.disabled, fontSize: '24px' }} />
              </Box>
              <Typography variant="subtitle1" fontWeight="600" color="textPrimary">Logged In Users This Week</Typography>
            </Stack>
            <Button
              startIcon={<GetAppIcon />}
              variant='contained'
            >
              Export to Excel
            </Button>
          </Box>

          {/* Filter Bar */}
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            p: 2,
            alignItems: { xs: 'stretch', sm: 'center' },
            flexWrap: 'wrap',
            bgcolor: isDarkMode ? 'rgba(44, 168, 127, 0.05)' : '#f2fdf5',
            borderTop: `1px solid ${theme.palette.divider}`
          }}>
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

            {/* From Filter */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: '6px',
              bgcolor: theme.palette.background.paper,
              overflow: 'hidden',
              flex: { xs: '1 1 auto', sm: '0 0 auto' }
            }}>
              <Box sx={{ px: 1, py: 0.8, bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#f4f6f8', borderRight: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="caption" sx={{ fontSize: '10px', color: 'textSecondary' }}>From</Typography>
              </Box>
              <TextField
                size="small"
                type="date"
                value={filters.from}
                onChange={(e) => handleFilterChange('from', e.target.value)}
                sx={{
                  '& fieldset': { border: 'none' },
                  '& input': { py: 0.8, fontSize: '13px', color: theme.palette.text.primary },
                  flexGrow: 1
                }}
              />
            </Box>

            {/* To Filter */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: '6px',
              bgcolor: theme.palette.background.paper,
              overflow: 'hidden',
              flex: { xs: '1 1 auto', sm: '0 0 auto' }
            }}>
              <Box sx={{ px: 1, py: 0.8, bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#f4f6f8', borderRight: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="caption" sx={{ fontSize: '10px', color: 'textSecondary' }}>To</Typography>
              </Box>
              <TextField
                size="small"
                type="date"
                value={filters.to}
                onChange={(e) => handleFilterChange('to', e.target.value)}
                sx={{
                  '& fieldset': { border: 'none' },
                  '& input': { py: 0.8, fontSize: '13px', color: theme.palette.text.primary },
                  flexGrow: 1
                }}
              />
            </Box>

            <Button
              onClick={handleApplyFilter}
              sx={{
                color: '#ffffff !important',
                bgcolor: '#2ca87f !important',
                '&:hover': { bgcolor: '#238a68 !important' },
                ml: { sm: 'auto' }
              }}
            >
              Filter
            </Button>
          </Box>

          <Box sx={{ p: 0 }}>
            <TableContainer>
              <Table sx={{ whiteSpace: 'nowrap' }}>
                <TableHead sx={{ bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.02)' : '#F9FAFB' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>School</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>URL</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Number</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary, textAlign: 'right' }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(rowsPerPage > 0
                    ? filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    : filteredData
                  ).map((row, index) => (
                    <TableRow
                      key={row.id || index} hover>
                      <TableCell sx={{ color: theme.palette.text.secondary }}>{row.id}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="600" color="textPrimary">{row.school}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ color: '#2ca87f', fontSize: '13px', fontWeight: 600 }}>{row.url}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="textSecondary" fontWeight="600">{row.number}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={(e) => handleMenuClick(e, row)}>
                          <IconDotsVertical size={18} color={theme.palette.text.secondary} />
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
                      sx={{ borderBottom: 'none' }}
                    />
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
          </Box>
        </Card>
      </StandardModal>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: 180,
            bgcolor: theme.palette.background.paper,
            boxShadow: theme.shadows[3],
            borderRadius: '12px',
            border: `1px solid ${theme.palette.divider}`,
            '& .MuiMenuItem-root': {
              fontSize: '14px',
              fontWeight: 600,
              color: theme.palette.text.secondary,
              py: 1,
              px: 2,
              '&:hover': {
                bgcolor: isDarkMode ? theme.palette.action.hover : '#F8FAFC',
                color: theme.palette.primary.main
              }
            }
          }
        }}
      >
        <MenuItem
          onClick={() => {
            handleMenuClose();
            if (onViewUserList) onViewUserList();
          }}
        >
          View Users List
        </MenuItem>
      </Menu>


    </>
  );
};

export default LoggedInUsersModal;
