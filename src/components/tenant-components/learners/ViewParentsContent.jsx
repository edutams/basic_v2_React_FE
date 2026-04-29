import React, { useState, useEffect } from 'react';
import {
  Box, Button, Typography, TextField, InputAdornment, Chip, CircularProgress, Alert,
  Table, TableContainer, TableHead, TableRow, TableCell, TableBody, TableFooter, TablePagination,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { IconUsersGroup } from '@tabler/icons-react';
import PropTypes from 'prop-types';
import learnerApi from 'src/api/learnerApi';

const ViewParentsContent = ({ learner, onClose }) => {
  const learnerName = learner?.users
    ? `${learner.users.fname} ${learner.users.lname}`
    : 'Learner';

  const [parents, setParents]         = useState([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage]               = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filtered = parents.filter((p) => {
    const name = `${p.user?.fname || ''} ${p.user?.lname || ''}`.trim();
    return (
      !searchInput.trim() ||
      name.toLowerCase().includes(searchInput.toLowerCase()) ||
      p.user?.user_id?.toLowerCase().includes(searchInput.toLowerCase()) ||
      p.user?.phone?.toLowerCase().includes(searchInput.toLowerCase())
    );
  });

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  useEffect(() => {
    if (!learner?.users?.id) return;
    setPage(0); setSearchInput(''); setError(null);
    setLoading(true);
    learnerApi.getParents(learner.users.id)
      .then((res) => setParents(res?.data?.data ?? []))
      .catch(() => setError('Failed to load parents.'))
      .finally(() => setLoading(false));
  }, [learner?.users?.id]);

  const relationshipLabel = (rel) =>
    rel ? rel.charAt(0).toUpperCase() + rel.slice(1) : '—';

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <IconUsersGroup size={20} />
        <Typography variant="h6">
          Parents of —{' '}
          <Typography component="span" color="primary" fontWeight={600}>{learnerName}</Typography>
        </Typography>
        {filtered.length > 0 && !loading && (
          <Chip label={filtered.length} size="small" color="primary" variant="outlined" />
        )}
      </Box>

      <Box sx={{ mb: 2 }}>
        <TextField
          placeholder="Search by name, ID or phone"
          value={searchInput} size="small" sx={{ width: 300 }}
          onChange={(e) => { setSearchInput(e.target.value); setPage(0); }}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
        />
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer sx={{ maxHeight: 420 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Parent ID</TableCell>
              <TableCell>Full Name</TableCell>
              <TableCell>Relationship</TableCell>
              <TableCell>Phone</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center"><CircularProgress size={28} /></TableCell>
              </TableRow>
            ) : paginated.length > 0 ? (
              paginated.map((parent, index) => (
                <TableRow key={parent.user_id || index} hover>
                  <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                  <TableCell>{parent.user?.user_id || '—'}</TableCell>
                  <TableCell>
                    {`${parent.user?.fname || ''} ${parent.user?.lname || ''}`.trim() || '—'}
                  </TableCell>
                  <TableCell>{relationshipLabel(parent.relationship)}</TableCell>
                  <TableCell>{parent.user?.phone || '—'}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Alert severity="info" sx={{ justifyContent: 'center', textAlign: 'center', '& .MuiAlert-icon': { mr: 1.5 } }}>
                    {searchInput ? 'No parents match your search.' : 'No parents linked to this learner yet.'}
                  </Alert>
                </TableCell>
              </TableRow>
            )}
          </TableBody>

          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                count={filtered.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>

      <Box display="flex" justifyContent="flex-end" sx={{ mt: 2 }}>
        <Button variant="outlined" size="small" onClick={onClose}>Close</Button>
      </Box>
    </Box>
  );
};

ViewParentsContent.propTypes = {
  learner: PropTypes.object,
  onClose: PropTypes.func.isRequired,
};

export default ViewParentsContent;
