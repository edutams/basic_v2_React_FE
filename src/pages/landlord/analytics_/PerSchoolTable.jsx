import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  InputAdornment,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  TableFooter,
  TablePagination,
  Paper,
  Skeleton,
  Chip,
  Stack,
  Alert,
} from '@mui/material';
import { IconSearch } from '@tabler/icons-react';
import { fetchPerSchool } from '../../../api/landlord/analytics/analyticsApi';

const statusColor = (status) =>
  ({
    active: { bg: '#e8f5e9', color: '#2e7d32' },
    inactive: { bg: '#fafafa', color: '#9e9e9e' },
    pending: { bg: '#fff8e1', color: '#f57f17' },
  })[status] ?? { bg: '#f5f5f5', color: '#616161' };

const onboardingColor = (status) =>
  ({
    approved: { bg: '#e8f5e9', color: '#2e7d32' },
    completed: { bg: '#e3f2fd', color: '#1565c0' },
    pending: { bg: '#fff8e1', color: '#f57f17' },
  })[status] ?? { bg: '#f5f5f5', color: '#616161' };

const PerSchoolTable = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [schoolType, setSchoolType] = useState('');
  const [sortBy, setSortBy] = useState('total_students');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchPerSchool({
        search,
        status,
        school_type: schoolType,
        sort_by: sortBy,
        sort_dir: sortDir,
        page,
        per_page: perPage,
      });
      setData(res.data);
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  }, [search, status, schoolType, sortBy, sortDir, page, perPage]);

  useEffect(() => {
    const timeout = setTimeout(load, 400); // debounce search
    return () => clearTimeout(timeout);
  }, [load]);

  const rows = data?.data ?? [];
  const total = data?.total ?? 0;

  const handleSort = (col) => {
    if (sortBy === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(col);
      setSortDir('desc');
    }
    setPage(1);
  };

  const SortableHeader = ({ label, col }) => (
    <TableCell
      onClick={() => handleSort(col)}
      sx={{
        fontWeight: 700,
        fontSize: 11,
        textTransform: 'uppercase',
        cursor: 'pointer',
        userSelect: 'none',
        color: sortBy === col ? 'primary.main' : 'text.secondary',
        '&:hover': { color: 'primary.main' },
      }}
    >
      {label} {sortBy === col ? (sortDir === 'asc' ? '↑' : '↓') : ''}
    </TableCell>
  );

  return (
    <Box>
      <Typography variant="h6" fontWeight={700} mb={3}>
        Per School Breakdown
      </Typography>

      {/* Filters */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={3}>
        <TextField
          size="small"
          placeholder="Search school..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          sx={{ minWidth: 220 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IconSearch size={16} />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          select
          size="small"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          sx={{ minWidth: 140 }}
          label="Status"
        >
          <MenuItem value="">All Statuses</MenuItem>
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="inactive">Inactive</MenuItem>
        </TextField>
        <TextField
          select
          size="small"
          value={schoolType}
          onChange={(e) => {
            setSchoolType(e.target.value);
            setPage(1);
          }}
          sx={{ minWidth: 160 }}
          label="School Type"
        >
          <MenuItem value="">All Types</MenuItem>
          <MenuItem value="primary">Primary</MenuItem>
          <MenuItem value="secondary">Secondary</MenuItem>
        </TextField>
      </Stack>

      <TableContainer component={Paper} sx={{ borderRadius: 2, overflowX: 'auto' }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: '#fafafa' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}>
                #
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}>
                School
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}>
                State
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}>
                Status
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}>
                Onboarding
              </TableCell>
              <SortableHeader label="Students" col="total_students" />
              <SortableHeader label="Staff" col="total_staff" />
              <SortableHeader label="Enrollments" col="total_enrollments" />
              <SortableHeader label="Guardians" col="total_guardians" />
              <TableCell sx={{ fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}>
                Organisation
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(10)].map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton variant="text" width={j === 1 ? 120 : 60} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                  <Alert severity="info" sx={{ width: '100%', justifyContent: 'center' }}>
                    No schools found.
                  </Alert>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, i) => {
                const sc = statusColor(row.status);
                const oc = onboardingColor(row.onboarding_status);
                return (
                  <TableRow key={row.tenant_id} hover>
                    <TableCell sx={{ color: '#6b7280', fontSize: 13 }}>
                      {(page - 1) * perPage + i + 1}
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {row.tenant_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {row.school_type}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{row.state_name ?? '—'}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {row.lga_name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={row.status}
                        size="small"
                        sx={{
                          bgcolor: sc.bg,
                          color: sc.color,
                          fontWeight: 700,
                          fontSize: 10,
                          height: 20,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={row.onboarding_status}
                        size="small"
                        sx={{
                          bgcolor: oc.bg,
                          color: oc.color,
                          fontWeight: 700,
                          fontSize: 10,
                          height: 20,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700} color="primary.main">
                        {(row.total_students ?? 0).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>{(row.total_staff ?? 0).toLocaleString()}</TableCell>
                    <TableCell>{(row.total_enrollments ?? 0).toLocaleString()}</TableCell>
                    <TableCell>{(row.total_guardians ?? 0).toLocaleString()}</TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {row.organization_name ?? '—'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[10, 15, 25, 50]}
                count={total}
                rowsPerPage={perPage}
                page={page - 1}
                onPageChange={(_, p) => setPage(p + 1)}
                onRowsPerPageChange={(e) => {
                  setPerPage(parseInt(e.target.value, 10));
                  setPage(1);
                }}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default PerSchoolTable;
