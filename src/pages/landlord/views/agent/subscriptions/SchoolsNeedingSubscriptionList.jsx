import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  Typography,
  Skeleton,
  Paper,
} from '@mui/material';
import { IconSearch } from '@tabler/icons-react';
import axios from '@/api/landlord/landlord_api';
import { usePermissions } from '@/context/AgentContext/permissions';
import GrantGraceModal from './GrantGraceModal';

/**
 * Schools with no Subscription row for their OWN currently active term —
 * "Extend Due Date" only works on an existing one, so these never showed
 * up anywhere an agent could act on them. This covers both a school that's
 * never subscribed at all AND one that subscribed before but the rollover
 * to its new term never created a row (see
 * SubscriptionService::getSchoolsNeedingSubscription() for why that
 * happens and why this list can't just check "never had any subscription
 * ever", which is what it used to do).
 */
const SchoolsNeedingSubscriptionList = () => {
  const { can } = usePermissions();
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [modalSchool, setModalSchool] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [total, setTotal] = useState(0);

  const fetchSchools = useCallback(async (searchTerm = '', pageNumber = 0, perPage = 15) => {
    setLoading(true);
    try {
      const res = await axios.get('/v1/landlord/subscriptions/schools-needing-subscription', {
        params: {
          ...(searchTerm ? { search: searchTerm } : {}),
          page: pageNumber + 1,
          per_page: perPage,
        },
      });
      setSchools(res.data?.data || []);
      setTotal(res.data?.meta?.total ?? 0);
    } catch (err) {
      console.error('Failed to fetch schools needing subscription:', err);
      setSchools([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchools(search, page, rowsPerPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage]);

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(0);
    fetchSchools(value, 0, rowsPerPage);
  };

  const handleGranted = () => {
    setModalSchool(null);
    fetchSchools(search, page, rowsPerPage);
  };

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Schools with no subscription for their own active term right now — whether they&apos;ve never
        subscribed at all, or subscribed before and the rollover to their new term never created one.
        Grant them a grace period here to unblock them while they decide on a plan.
      </Typography>

      <TextField
        size="small"
        placeholder="Search school name…"
        value={search}
        onChange={(e) => handleSearchChange(e.target.value)}
        sx={{ mb: 2, width: { xs: '100%', sm: 320 } }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <IconSearch size={16} />
            </InputAdornment>
          ),
        }}
      />

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, width: 48 }}>#</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>School</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Active Term</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              // Shaped like the real rows (same column widths/content
              // types) instead of a single centered spinner.
              Array.from({ length: rowsPerPage > 8 ? 8 : rowsPerPage }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton variant="text" width={20} /></TableCell>
                  <TableCell><Skeleton variant="text" width="70%" /></TableCell>
                  <TableCell><Skeleton variant="rounded" width={64} height={20} /></TableCell>
                  <TableCell><Skeleton variant="text" width="60%" /></TableCell>
                  <TableCell align="right">
                    <Skeleton variant="rounded" width={140} height={30} sx={{ ml: 'auto' }} />
                  </TableCell>
                </TableRow>
              ))
            ) : schools.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No schools currently need a subscription.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              schools.map((school, idx) => (
                <TableRow key={school.id} hover>
                  <TableCell>{page * rowsPerPage + idx + 1}</TableCell>
                  <TableCell>{school.tenant_name}</TableCell>
                  <TableCell sx={{ textTransform: 'capitalize' }}>{school.status}</TableCell>
                  <TableCell>
                    {school.active_session_name && school.active_term_name
                      ? `${school.active_session_name} - ${school.active_term_name}`
                      : '—'}
                  </TableCell>
                  <TableCell align="right">
                    {can('landlord.subscription.extend_due_date') && (
                      <Button size="small" variant="outlined" onClick={() => setModalSchool(school)}>
                        Grant Grace Period
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 15, 25, 50]}
        />
      </TableContainer>

      <GrantGraceModal
        open={Boolean(modalSchool)}
        onClose={() => setModalSchool(null)}
        school={modalSchool}
        onGranted={handleGranted}
      />
    </Box>
  );
};

export default SchoolsNeedingSubscriptionList;
