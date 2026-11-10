import React, { useEffect, useState } from 'react';
import { Alert, Box, Button, InputAdornment, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
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

  const load = (term = '') => {
    setLoading(true);
    setError('');
    fetchMigrationSchools(term)
      .then((res) => {
        if (res?.status) {
          setSchools(res.data?.data || []);
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
    load(search);
  };

  if (error) {
    return (
      <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => load(search)}>Retry</Button>}>
        {error}
      </Alert>
    );
  }

  return (
    <SectionPaper title="Choose a school" subtitle="Pick which school's V1 data you want to bring into V2.">
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
            <TableCell sx={{ fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>SCHOOL</TableCell>
            <TableCell sx={{ fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>STATUS</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {!loading && schools.length === 0 && (
            <TableRow>
              <TableCell colSpan={3}>
                <Typography sx={{ fontSize: 13, color: '#64748b', py: 2, textAlign: 'center' }}>No schools found.</Typography>
              </TableCell>
            </TableRow>
          )}
          {schools.map((school) => (
            <TableRow key={school.id}>
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
    </SectionPaper>
  );
};

export default SchoolPickerTab;
