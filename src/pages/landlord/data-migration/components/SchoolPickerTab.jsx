import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  InputAdornment,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { IconSearch } from '@tabler/icons-react';
import SectionPaper from '@/pages/tenant/data-migration/components/SectionPaper';
import { fetchMigrationSchools } from '@/api/landlord/dataMigration/dataMigrationApi';

/** First step on the agent side, which the tenant-side wizard never
 * needed — an agent has to pick *which* school before scanning/migrating
 * anything, unlike a school admin who's always implicitly working on their
 * own tenant. */
const SchoolPickerTab = ({ onSelect }) => {
  const [schools, setSchools] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(20);

  const load = (term = '', pageNumber = 1) => {
    setLoading(true);
    setError('');
    fetchMigrationSchools(term, pageNumber)
      .then((res) => {
        if (res?.status) {
          setSchools(res.data?.data || []);
          setPage(res.data?.current_page || 1);
          setLastPage(res.data?.last_page || 1);
          setTotal(res.data?.total || 0);
          setPerPage(res.data?.per_page || 20);
        } else {
          setError(res?.message || 'Failed to load schools.');
        }
      })
      .catch((err) => {
        setError(err?.response?.data?.message || 'Failed to load schools.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    load(search, 1);
  };

  const handlePageChange = (event, value) => {
    load(search, value);
  };

  if (error) {
    return (
      <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => load(search, page)}>Retry</Button>}>
        {error}
      </Alert>
    );
  }

  return (
    <SectionPaper title="Choose a school" subtitle="Pick which school's V1 data you want to bring into V2. Only schools linked to a V1 school are shown.">
      <Box component="form" onSubmit={handleSearchSubmit} sx={{ mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search schools by name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><IconSearch size={16} /></InputAdornment> }}
        />
      </Box>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', width: 40 }}>#</TableCell>
            <TableCell sx={{ fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>SCHOOL</TableCell>
            <TableCell sx={{ fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>STATUS</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {!loading && schools.length === 0 && (
            <TableRow>
              <TableCell colSpan={4}>
                <Typography sx={{ fontSize: 13, color: '#64748b', py: 2, textAlign: 'center' }}>No schools found.</Typography>
              </TableCell>
            </TableRow>
          )}
          {schools.map((school, index) => (
            <TableRow key={school.id}>
              <TableCell sx={{ fontSize: 12.5, color: '#94a3b8' }}>{(page - 1) * perPage + index + 1}</TableCell>
              <TableCell sx={{ fontSize: 13.5, fontWeight: 600 }}>{school.tenant_name}</TableCell>
              <TableCell sx={{ fontSize: 12.5, color: '#64748b', textTransform: 'capitalize' }}>{school.status}</TableCell>
              <TableCell align="right">
                <Button size="small" variant="outlined" onClick={() => onSelect(school)} sx={{ textTransform: 'none', fontWeight: 600 }}>
                  Select
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {!loading && total > 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mt: 2 }}>
          <Typography sx={{ fontSize: 12.5, color: '#64748b' }}>
            Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} of {total} schools
          </Typography>
          {lastPage > 1 && (
            <Pagination count={lastPage} page={page} onChange={handlePageChange} size="small" color="primary" />
          )}
        </Box>
      )}
    </SectionPaper>
  );
};

export default SchoolPickerTab;
