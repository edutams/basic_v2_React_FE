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
import {
  Search as SearchIcon,
  Close as CloseIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import PropTypes from 'prop-types';
import { getLearnersByClass } from '../../../context/TenantContext/services/tenant.service';

const LearnerListModal = ({ open, onClose, classId, className }) => {
  const [learners, setLearners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (open && classId) {
      setPage(0);
      setSearch('');
      setSearchInput('');
      setError(null);
    }
  }, [open, classId]);

  useEffect(() => {
    if (!open || !classId) return;
    fetchLearners();
  }, [open, classId, page, rowsPerPage, search]);

  const fetchLearners = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page: page + 1,
        per_page: rowsPerPage,
        search: search,
      };

      const res = await getLearnersByClass(classId, params);

      setLearners(res.data || []);
      setTotalRows(res.total || 0);
    } catch (err) {
      console.error(err);
      setError('Failed to load learners.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(0);

    if (!searchInput.trim()) {
      setSearch('');
    } else {
      setSearch(searchInput);
    }
  };

  const handleClose = () => {
    setLearners([]);
    setSearch('');
    setSearchInput('');
    setPage(0);
    setError(null);
    onClose();
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SchoolIcon fontSize="small" color="primary" />
          <Typography variant="h6" component="span">
            Learners in -{' '}
            <Typography component="span" color="primary" fontWeight={600}>
              {className}
            </Typography>
          </Typography>

          {totalRows > 0 && !loading && (
            <Chip label={totalRows} size="small" color="primary" variant="outlined" />
          )}
        </Box>

        <IconButton onClick={handleClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <TextField
            placeholder="Search by name or ID"
            value={searchInput}
            size="small"
            sx={{ width: 300 }}
            onChange={(e) => {
              const value = e.target.value;
              setSearchInput(value);

              if (!value.trim()) {
                setSearch('');
                setPage(0);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearch();
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          <Button variant="contained" onClick={handleSearch} size="small" disabled={loading}>
            Search
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TableContainer sx={{ maxHeight: 420 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Learner ID</TableCell>
                <TableCell>Last Name</TableCell>
                <TableCell>First Name</TableCell>
                <TableCell>Middle Name</TableCell>
                <TableCell>Gender</TableCell>
                <TableCell>Arm</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              ) : learners.length > 0 ? (
                learners.map((learner, index) => (
                  <TableRow key={learner.id || index} hover>
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>

                    <TableCell>{learner.users?.user_id || '-'}</TableCell>

                    <TableCell>{learner.users?.lname || '-'}</TableCell>

                    <TableCell>{learner.users?.fname || '-'}</TableCell>

                    <TableCell>{learner.users?.mname || '-'}</TableCell>

                    <TableCell>{learner.users?.sex || '-'}</TableCell>

                    <TableCell>{learner.class_arm?.arm_names || '-'}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Alert severity="info">
                      {search
                        ? 'No learners match your search.'
                        : 'No learners found for this class.'}
                    </Alert>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>

            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  count={totalRows}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
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

LearnerListModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  classId: PropTypes.number,
  className: PropTypes.string,
};

export default LearnerListModal;
