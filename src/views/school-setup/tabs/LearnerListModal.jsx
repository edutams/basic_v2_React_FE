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

/**
 * LearnerListModal
 *
 * A reusable modal component for displaying learners in a class with search and pagination.
 *
 * Props:
 *   open     {boolean}  — controls dialog visibility
 *   onClose  {function} — called when the dialog should close
 *   classId  {number|string|null} — the class ID to fetch learners for
 *   className {string} — the class name to display in the title
 */
const LearnerListModal = ({ open, onClose, classId, className }) => {
  const [learners, setLearners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [search, setSearch] = useState('');

  // Reset state whenever the modal opens with a new classId
  useEffect(() => {
    if (open && classId) {
      setPage(0);
      setSearch('');
      setError(null);
    }
  }, [open, classId]);

  // Fetch learners whenever open, classId, page, or search changes
  useEffect(() => {
    if (!open || !classId) return;
    fetchLearners();
  }, [open, classId, page, search]);

  const fetchLearners = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: page + 1,
        search,
        per_page: rowsPerPage,
      };

      const res = await getLearnersByClass(classId, params);

      if (res?.data) {
        setLearners(res.data || []);
        setTotalRows(res.total || 0);
        setRowsPerPage(res.per_page || 10);
      } else if (Array.isArray(res)) {
        // Fallback for backward compatibility
        setLearners(res);
        setTotalRows(res.length);
      }
    } catch (err) {
      console.error('Failed to fetch learners:', err);
      setError('Failed to load learners. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setLearners([]);
    setSearch('');
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
        {/* Search */}
        <TextField
          placeholder="Search by name or ID"
          value={search}
          size="small"
          // fullWidth
          sx={{ mb: 2 }}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />

        {/* Error */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Table */}
        <TableContainer sx={{ maxHeight: 420 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '5%' }}>#</TableCell>
                <TableCell sx={{ width: '20%' }}>Learner ID</TableCell>
                <TableCell sx={{ width: '20%' }}>Last Name</TableCell>
                <TableCell sx={{ width: '20%' }}>First Name</TableCell>
                <TableCell sx={{ width: '15%' }}>Middle Name</TableCell>
                <TableCell sx={{ width: '10%' }}>Gender</TableCell>
                <TableCell sx={{ width: '10%' }}>Arm</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              ) : learners.length > 0 ? (
                learners.map((learner, index) => (
                  <TableRow key={learner.id || index} hover>
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell>
                      <Typography variant="body2">{learner.learner_id}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{learner.lastname}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{learner.firstname}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {learner.middlename || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{learner.gender}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {learner.arm || '-'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Alert
                      severity="info"
                      sx={{
                        justifyContent: 'center',
                        textAlign: 'center',
                        '& .MuiAlert-icon': { mr: 1 },
                      }}
                    >
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
                  colSpan={7}
                />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
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
