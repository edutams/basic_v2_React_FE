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
  Button,
  Typography,
  CircularProgress,
  Paper,
} from '@mui/material';
import { IconSearch } from '@tabler/icons-react';
import axios from '@/api/landlord/landlord_api';
import { usePermissions } from '@/context/AgentContext/permissions';
import GrantGraceModal from './GrantGraceModal';

/**
 * Schools with literally no Subscription row — "Extend Due Date" only
 * works on an existing one, so these never showed up anywhere an agent
 * could act on their expired free trial. See
 * SubscriptionService::getNeverSubscribedSchools() for why this is a
 * distinct list from the ordinary subscriptions tabs (a school that
 * subscribed before always has a row auto-created for its next term).
 */
const NeverSubscribedSchoolsList = () => {
  const { can } = usePermissions();
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [modalSchool, setModalSchool] = useState(null);

  const fetchSchools = useCallback(async (searchTerm = '') => {
    setLoading(true);
    try {
      const res = await axios.get('/v1/landlord/subscriptions/never-subscribed/schools', {
        params: searchTerm ? { search: searchTerm } : {},
      });
      setSchools(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch never-subscribed schools:', err);
      setSchools([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

  const handleGranted = () => {
    setModalSchool(null);
    fetchSchools(search);
  };

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Schools whose free trial has ended with no subscription ever created for them — they have no
        &quot;Extend Due Date&quot; option yet since there&apos;s nothing to extend. Grant them a grace
        period here to unblock them while they decide on a plan.
      </Typography>

      <TextField
        size="small"
        placeholder="Search school name…"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          fetchSchools(e.target.value);
        }}
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
              <TableCell sx={{ fontWeight: 700 }}>School</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={22} />
                </TableCell>
              </TableRow>
            ) : schools.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No never-subscribed schools found.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              schools.map((school) => (
                <TableRow key={school.id} hover>
                  <TableCell>{school.tenant_name}</TableCell>
                  <TableCell sx={{ textTransform: 'capitalize' }}>{school.status}</TableCell>
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

export default NeverSubscribedSchoolsList;
