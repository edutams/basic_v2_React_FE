import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableFooter,
  TablePagination,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
} from '@mui/material';
import { Search as SearchIcon, Close as CloseIcon } from '@mui/icons-material';
import { IconUsersGroup } from '@tabler/icons-react';
import PropTypes from 'prop-types';
import guardianApi from 'src/api/parentApi';

const ViewWardsModal = ({ open, onClose, guardian }) => {
  const guardianName = guardian?.user
    ? `${guardian.user.fname} ${guardian.user.lname}`
    : 'Guardian';

  const [wards, setWards]         = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage]           = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // filtered client-side (wards list is small)
  const filtered = wards.filter((w) =>
    !searchInput.trim() ||
    w.name?.toLowerCase().includes(searchInput.toLowerCase()) ||
    w.user_id_code?.toLowerCase().includes(searchInput.toLowerCase())
  );

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  useEffect(() => {
    if (!open || !guardian?.id) return;
    setPage(0);
    setSearchInput('');
    setError(null);
    fetchWards();
  }, [open, guardian?.id]);

  const fetchWards = async () => {
    try {
      setLoading(true);
      const res = await guardianApi.getWards(guardian.id);
      setWards(res?.data?.data ?? []);
    } catch {
      setError('Failed to load wards.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setWards([]);
    setSearchInput('');
    setPage(0);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
      {/* ── title ── */}
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconUsersGroup size={20} />
          <Typography variant="h6" component="span">
            Wards of —{' '}
            <Typography component="span" color="primary" fontWeight={600}>
              {guardianName}
            </Typography>
          </Typography>
          {filtered.length > 0 && !loading && (
            <Chip label={filtered.length} size="small" color="primary" variant="outlined" />
          )}
        </Box>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 2 }}>
        {/* ── search ── */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <TextField
            placeholder="Search by name or learner ID"
            value={searchInput}
            size="small"
            sx={{ width: 300 }}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setPage(0);
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {/* ── table ── */}
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
                  <TableCell colSpan={4} align="center">
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              ) : paginated.length > 0 ? (
                paginated.map((ward, index) => (
                  <TableRow key={ward.id || index} hover>
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell>{ward.user_id_code || '—'}</TableCell>
                    <TableCell>{ward.name || '—'}</TableCell>
                    <TableCell>{ward.class_arm || '—'}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Alert severity="info">
                      {searchInput
                        ? 'No wards match your search.'
                        : 'No wards linked to this guardian yet.'}
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
                  onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                  }}
                />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} variant="outlined" size="small">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

ViewWardsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  guardian: PropTypes.object,
};

export default ViewWardsModal;
