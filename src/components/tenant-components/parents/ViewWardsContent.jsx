import React, { useState, useEffect } from 'react';
import {
  Box, Button, Typography, TextField, InputAdornment, Chip, CircularProgress, Alert,
  Table, TableContainer, TableHead, TableRow, TableCell, TableBody, TableFooter, TablePagination,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { IconUsersGroup } from '@tabler/icons-react';
import PropTypes from 'prop-types';
import guardianApi from 'src/api/parentApi';

const ViewWardsContent = ({ guardian, onClose }) => {
  const guardianName = guardian?.user
    ? `${guardian.user.fname} ${guardian.user.lname}`
    : 'Guardian';

  const [wards, setWards]             = useState([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage]               = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filtered = wards.filter((w) => {
    const name = `${w.fname || ''} ${w.lname || ''}`.trim();
    return (
      !searchInput.trim() ||
      name.toLowerCase().includes(searchInput.toLowerCase()) ||
      w.user_id?.toLowerCase().includes(searchInput.toLowerCase())
    );
  });

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  useEffect(() => {
    if (!guardian?.user_id) return;
    setPage(0); setSearchInput(''); setError(null);
    setLoading(true);
    guardianApi.getWards(guardian.user_id)
      .then((res) => setWards(res?.data?.data ?? []))
      .catch(() => setError('Failed to load wards.'))
      .finally(() => setLoading(false));
  }, [guardian?.user_id]);

  return (
    <Box>
      {/* header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <IconUsersGroup size={20} />
        <Typography variant="h6">
          Wards of —{' '}
          <Typography component="span" color="primary" fontWeight={600}>{guardianName}</Typography>
        </Typography>
        {filtered.length > 0 && !loading && (
          <Chip label={filtered.length} size="small" color="primary" variant="outlined" />
        )}
      </Box>

      {/* search */}
      <Box sx={{ mb: 2 }}>
        <TextField
          placeholder="Search by name or learner ID"
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
              <TableCell>Learner ID</TableCell>
              <TableCell>Full Name</TableCell>
              <TableCell>Class / Arm</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center"><CircularProgress size={28} /></TableCell>
              </TableRow>
            ) : paginated.length > 0 ? (
              paginated.map((ward, index) => {
                const reg = ward.student_registrations?.[0];
                const arm = reg?.class_arm;
                const armNames = arm?.arm_names;
                const armLabel = Array.isArray(armNames) ? armNames.filter(Boolean).join(', ') : (armNames || '');
                const className = arm?.programme_class?.class?.class_name || '';
                const classArm = [className, armLabel].filter(Boolean).join(' ') || '—';
                const fullName = `${ward.fname || ''} ${ward.lname || ''}`.trim() || '—';
                return (
                  <TableRow key={ward.id || index} hover>
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell>{ward.user_id || '—'}</TableCell>
                    <TableCell>{fullName}</TableCell>
                    <TableCell>{classArm}</TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Alert severity="info">
                    {searchInput ? 'No wards match your search.' : 'No wards linked to this guardian yet.'}
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

ViewWardsContent.propTypes = {
  guardian: PropTypes.object,
  onClose: PropTypes.func.isRequired,
};

export default ViewWardsContent;
