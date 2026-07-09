import React, { useState, useEffect } from 'react';

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
  Alert,
  CircularProgress,
} from '@mui/material';
import GetAppIcon from '@mui/icons-material/GetApp';
import GridViewIcon from '@mui/icons-material/GridView';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { IconUsers, IconDotsVertical } from '@tabler/icons-react';
import ReusableModal from 'src/components/shared/ReusableModal';
import StatCard from 'src/components/shared/StatCard';
import activityLogApi from '@/api/landlord/activity-log/activityLogApi';
import { useNotification } from '@/hooks/useNotification';

const predefinedStats = [
  { label: 'Teacher', searchLabels: ['Teacher'], icon: IconUsers, color: '#3B82F6' },
  { label: 'Learner', searchLabels: ['Learner', 'Student', 'Learners', 'Students'], icon: IconUsers, color: '#10B981' },
  { label: 'SPA', searchLabels: ['SPA'], icon: IconUsers, color: '#F59E0B' },
  { label: 'Agents', searchLabels: ['Agents'], icon: IconUsers, color: '#8B5CF6' },
];



const LoggedInUsersModal = ({ onClose, open, onViewUserList, stats = [] }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const notify = useNotification();
  const [data, setData] = useState([]);
  const [modalStats, setModalStats] = useState(stats);
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const today = new Date().toISOString().split('T')[0];
  const isMenuOpen = Boolean(anchorEl);

  const [filters, setFilters] = useState({
    accessLevel: 'All',
    userType: 'All',
    from: '',
    to: ''
  });

  const [appliedFilters, setAppliedFilters] = useState({
    accessLevel: 'All',
    userType: 'All',
    from: '',
    to: ''
  });

  const [filterOptions, setFilterOptions] = useState({
    accessLevels: [{ label: 'All Levels', value: 'All' }],
    userTypes: [{ label: 'All Users', value: 'All' }]
  });

  useEffect(() => {
    setModalStats(stats);
  }, [stats]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await activityLogApi.getFilterOptions();
        if (response.status) {
          setFilterOptions(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch filter options', error);
      }
    };
    fetchOptions();
  }, []);

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open, appliedFilters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await activityLogApi.getTenantLoginStats({
        role: appliedFilters.userType,
        accessLevel: appliedFilters.accessLevel,
        from: appliedFilters.from,
        to: appliedFilters.to,
      });
      if (response.status) {
        setData(response.data);
      }

      // Fetch dynamic stats card counts matching active filters
      const statsRes = await activityLogApi.getLoginActivities30Days({
        accessLevel: appliedFilters.accessLevel,
        from: appliedFilters.from,
        to: appliedFilters.to,
      });
      if (statsRes.status) {
        setModalStats(statsRes.data);
      }
    } catch (error) {
      console.error('Failed to fetch data', error);
      notify.error('Failed to fetch login statistics.');
    } finally {
      setLoading(false);
    }
  };

  const hasActiveFilters = filters.accessLevel !== 'All' || filters.userType !== 'All' || filters.from !== '' || filters.to !== '';

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleApplyFilter = () => {
    setAppliedFilters(filters);
    setPage(0);
  };

  const handleResetFilter = () => {
    const defaultFilters = {
      accessLevel: 'All',
      userType: 'All',
      from: '',
      to: ''
    };
    setFilters(defaultFilters);
    setAppliedFilters({ accessLevel: 'All', userType: 'All', from: '', to: '' });
    setPage(0);
  };

  const handleExportToExcel = async () => {
    if (!data || data.length === 0) {
      notify.error('No schools found to export.');
      return;
    }

    const headers = ['S/N', 'School Name', 'URL', 'User Type', 'Number of Logged-in Users'];
    const rows = data.map((row, index) => [
      index + 1,
      row.school || '',
      row.url || '',
      appliedFilters.userType || 'All',
      row.number || 0
    ]);

    try {
      const response = await activityLogApi.exportExcel({
        title: 'Logged In Users Report',
        headers: headers,
        rows: rows
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Logged_In_Users_Report.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export excel', error);
      notify.error('Failed to export excel.');
    }
  };

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
      <ReusableModal
        open={open}
        onClose={onClose}
        title="Logged in user"
        size="extraLarge"
        showDivider={false}
      >
        {/* Top Stat Cards */}
        <Grid container spacing={1.5} mb={3}>
          {predefinedStats.map((stat, idx) => {
            const statValue = modalStats?.find(s => stat.searchLabels.includes(s.label))?.value || 0;
            const isAgents = stat.label === 'Agents';
            return (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
                <Box
                  onClick={() => {
                    if (isAgents && onViewUserList) {
                      onViewUserList(
                        { id: 'landlord', school: 'Agents' },
                        {
                          userType: 'All',
                          accessLevel: appliedFilters.accessLevel,
                          from: appliedFilters.from,
                          to: appliedFilters.to
                        }
                      );
                    }
                  }}
                  sx={{ cursor: isAgents ? 'pointer' : 'default', width: '100%' }}
                >
                  <StatCard
                    label={stat.label}
                    count={statValue}
                    icon={stat.icon}
                    color={stat.color}
                  />
                </Box>
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
              <Typography variant="subtitle1" fontWeight="600" color="textPrimary">Logged In Users</Typography>
            </Stack>

            <Button
              variant="contained"
              startIcon={<GetAppIcon />}
              onClick={handleExportToExcel}
              sx={{
                width: { xs: '100%', sm: 'auto' },
              }}
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
                <Typography variant="body2" fontWeight="600" color="textPrimary">Access Level</Typography>
              </Box>
              <Select
                size="small"
                value={filters.accessLevel}
                onChange={(e) => handleFilterChange('accessLevel', e.target.value)}
                sx={{ border: 'none', '& fieldset': { border: 'none' }, minWidth: { xs: 'auto', sm: 120 }, flexGrow: 1 }}
              >
                {filterOptions.accessLevels.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </Box>

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
                {filterOptions.userTypes.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </Box>

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
                inputProps={{ max: today }}
                sx={{
                  '& fieldset': { border: 'none' },
                  '& input': { py: 0.8, fontSize: '13px', color: theme.palette.text.primary },
                  flexGrow: 1
                }}
              />
            </Box>

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
                inputProps={{ max: today }}
                sx={{
                  '& fieldset': { border: 'none' },
                  '& input': { py: 0.8, fontSize: '13px', color: theme.palette.text.primary },
                  flexGrow: 1
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 1, ml: { sm: 'auto' }, width: { xs: '100%', sm: 'auto' } }}>
              {hasActiveFilters && (
                <Button
                  variant="outlined"
                  onClick={handleResetFilter}
                >
                  Clear
                </Button>
              )}

              <Button
                onClick={handleApplyFilter}
                variant="contained"
                color="primary"
                sx={{
                  flex: { xs: 1, sm: 'none' }
                }}
              >
                Fetch
              </Button>
            </Box>
          </Box>

          <Box sx={{ p: 0 }}>
            <TableContainer>
              <Table sx={{ whiteSpace: 'nowrap' }}>
                <TableHead sx={{ bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.02)' : '#F9FAFB' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>S/N</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>School</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>URL</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Number</TableCell>
                    {/* <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary, textAlign: 'right' }}>Action</TableCell> */}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                        <CircularProgress size={24} />
                      </TableCell>
                    </TableRow>
                  ) : data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Alert severity="info" sx={{ mt: 2, mb: 2, justifyContent: 'center' }}>
                          No schools found for the selected filter criteria.
                        </Alert>
                      </TableCell>
                    </TableRow>
                  ) : (
                    (rowsPerPage > 0
                      ? data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      : data
                    ).map((row, index) => (
                      <TableRow
                        key={row.id || index} hover>
                        <TableCell sx={{ color: theme.palette.text.secondary }}>{page * rowsPerPage + index + 1}</TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="600" color="textPrimary">{row.school}</Typography>
                        </TableCell>
                        <TableCell>
                          {row.url ? (
                            <Typography
                              component="a"
                              href={row.url.startsWith('http') ? row.url : `https://${row.url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{
                                color: 'success.main',
                                fontSize: '13px',
                                fontWeight: 600,
                                textDecoration: 'none',
                                '&:hover': { textDecoration: 'underline' }
                              }}
                            >
                              {row.url}
                            </Typography>
                          ) : (
                            <Typography sx={{ color: theme.palette.text.disabled, fontSize: '13px' }}>N/A</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            color="primary"
                            fontWeight="600"
                            sx={{
                              cursor: 'pointer',
                              textDecoration: 'underline',
                              textAlign: 'center',
                              '&:hover': { opacity: 0.8 }
                            }}
                            onClick={() => onViewUserList && onViewUserList(row, appliedFilters)}
                          >
                            {row.number}
                          </Typography>
                        </TableCell>
                        {/* <TableCell align="right">
                          <IconButton size="small" onClick={(e) => handleMenuClick(e, row)}>
                            <IconDotsVertical size={18} color={theme.palette.text.secondary} />
                          </IconButton>
                        </TableCell> */}
                      </TableRow>
                    )))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TablePagination
                      rowsPerPageOptions={[5, 10, 25]}
                      count={data.length}
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
      </ReusableModal>

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
            if (onViewUserList) onViewUserList(selectedRow, appliedFilters);
          }}
        >
          View Users List
        </MenuItem>
      </Menu>


    </>
  );
};

export default LoggedInUsersModal;
