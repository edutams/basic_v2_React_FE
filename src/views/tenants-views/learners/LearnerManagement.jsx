import React, { useState, useEffect, useCallback } from 'react';
import PageContainer from 'src/components/container/PageContainer';
import Breadcrumb from 'src/layouts/full/shared/breadcrumb/Breadcrumb';
import ParentCard from 'src/components/shared/ParentCard';
import { useNotification } from '../../../hooks/useNotification';

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
  IconButton,
  Menu,
  MenuItem,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  FormControl,
  InputLabel,
  Select,
  Link,
  Avatar,
} from '@mui/material';

import { Search as SearchIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import PeopleIcon from '@mui/icons-material/People';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

import learnerApi from 'src/api/learnerApi';
import { getClassesWithDivisions } from 'src/context/TenantContext/services/tenant.service';

const BCrumb = [{ to: '/school-dashboard', title: 'Home' }, { title: 'Learner Management' }];

const StatCard = ({ count, label, icon: Icon, color = 'primary', loading }) => (
  <Paper
    sx={{
      borderRadius: 2,
      px: 3,
      py: 2,
      flex: 1,
      minWidth: { xs: '100%', sm: 200 },
      bgcolor: 'background.paper',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}
  >
    <Box
      sx={{
        width: 48,
        height: 48,
        borderRadius: '50%',
        bgcolor: 'primary.light',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon sx={{ fontSize: 22, color }} />
    </Box>

    <Box sx={{ textAlign: 'center' }}>
      {loading ? (
        <CircularProgress size={24} />
      ) : (
        <>
          <Typography fontSize={26} fontWeight={700}>
            {count}
          </Typography>
          <Typography fontSize={14} color="text.secondary">
            {label}
          </Typography>
        </>
      )}
    </Box>
  </Paper>
);

const LearnerManagement = () => {
  const notify = useNotification();

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [classId, setClassId] = useState('');

  const [classes, setClasses] = useState([]);

  const [stats, setStats] = useState({ total: 0, active: 0, transferred: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  const fetchLearners = useCallback(async () => {
    try {
      setLoading(true);
      const res = await learnerApi.getAll({
        page: page + 1,
        per_page: rowsPerPage,
        search,
        ...(classId && { class_id: classId }),
      });
      setRows(res?.data?.data ?? []);
      setTotal(res?.data?.meta?.total ?? 0);
    } catch {
      notify.error('Failed to fetch learners');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, classId]);

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const res = await learnerApi.getStats();
      setStats(res?.data?.data ?? { total: 0, active: 0, transferred: 0 });
    } catch {
      notify.error('Failed to fetch stats');
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchClasses = useCallback(async () => {
    try {
      const data = await getClassesWithDivisions();
      const flat = [];
      (data || []).forEach((division) => {
        (division.programmes || []).forEach((programme) => {
          (programme.classes || []).forEach((cls) => {
            flat.push({
              id: cls.id,
              label: `${programme.programme_code} - ${cls.class_code}`,
            });
          });
        });
      });
      setClasses(flat);
    } catch {
      notify.error('Failed to fetch classes');
    }
  }, []);

  useEffect(() => {
    fetchLearners();
  }, [fetchLearners]);
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);
  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const handleMenuOpen = (event, row) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => setAnchorEl(null);

  const hasFilters = search !== '' || classId !== '';

  const resetFilters = () => {
    setSearch('');
    setClassId('');
    setPage(0);
  };

  const getClassArmLabel = (learner) => {
    const arm = learner.class_arm;
    const armNames = arm?.arm_names;
    const armLabel = Array.isArray(armNames) ? armNames.filter(Boolean).join(', ') : armNames || '';
    const className = arm?.programme_class?.class?.class_name || '';
    return [className, armLabel].filter(Boolean).join(' ') || '—';
  };

  return (
    <PageContainer title="Learner Management" description="Manage learners">
      <Breadcrumb title="Learner Management" items={BCrumb} />

      {/* Stats */}
      <Box sx={{ mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <StatCard
            count={stats.total}
            label="Total Learners"
            icon={FamilyRestroomIcon}
            color="primary"
            loading={statsLoading}
          />
          <StatCard
            count={stats.active}
            label="Active Learners"
            icon={PeopleIcon}
            color="primary"
            loading={statsLoading}
          />
          <StatCard
            count={stats.transferred}
            label="Transferred Learners"
            icon={SwapHorizIcon}
            color="primary"
            loading={statsLoading}
          />
        </Stack>
      </Box>

      <ParentCard
        title={
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h5">Learners</Typography>
          </Box>
        }
      >
        {/* Filters */}
        <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search by name, learner ID or email"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              },
            }}
          />

          <FormControl sx={{ minWidth: 220 }}>
            <InputLabel>Filter by Class</InputLabel>
            <Select
              value={classId}
              label="Filter by Class"
              onChange={(e) => {
                setClassId(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="">All Classes</MenuItem>
              {classes.map((cls) => (
                <MenuItem key={cls.id} value={cls.id}>
                  {cls.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {hasFilters && (
            <Button
              variant="outlined"
              onClick={resetFilters}
              sx={{ height: 'fit-content', mb: 0.5 }}
            >
              Clear Filters
            </Button>
          )}
        </Box>

        <Paper variant="outlined">
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>S/N</TableCell>
                  <TableCell>Learner ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Class / Arm</TableCell>
                  <TableCell>Parent</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : rows.length > 0 ? (
                  rows.map((row, index) => (
                    <TableRow key={row.id}>
                      <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                      <TableCell>{row.users?.user_id || '—'}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar
                            src={row.users?.avatar || ''}
                            alt={row.users?.fname}
                            sx={{ width: 36, height: 36 }}
                          >
                            {row.users?.fname?.[0]?.toUpperCase() ?? '?'}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {row.users ? `${row.users.fname} ${row.users.lname}` : '—'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {row.users?.sex || '—'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{getClassArmLabel(row)}</TableCell>
                      <TableCell align="center">
                        <Typography variant="subtitle2">
                          <Link sx={{ cursor: 'pointer' }}>
                            {row.users?.guardians_count ?? 0}
                          </Link>
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton onClick={(e) => handleMenuOpen(e, row)}>
                          <MoreVertIcon />
                        </IconButton>
                        <Menu
                          anchorEl={anchorEl}
                          open={Boolean(anchorEl) && selectedRow?.id === row.id}
                          onClose={handleMenuClose}
                        >
                          <MenuItem onClick={handleMenuClose}>View Details</MenuItem>
                          <MenuItem onClick={handleMenuClose}>Edit</MenuItem>
                          <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
                            Delete
                          </MenuItem>
                        </Menu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Alert
                        severity="info"
                        sx={{
                          mb: 3,
                          justifyContent: 'center',
                          textAlign: 'center',
                          '& .MuiAlert-icon': { mr: 1.5 },
                        }}
                      >
                        {hasFilters
                          ? 'No learners match the current search.'
                          : 'No learners found.'}
                      </Alert>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>

              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50, 100]}
                    count={total}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => {
                      setRowsPerPage(parseInt(e.target.value, 10));
                      setPage(0);
                    }}
                  />
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
        </Paper>
      </ParentCard>
    </PageContainer>
  );
};

export default LearnerManagement;
