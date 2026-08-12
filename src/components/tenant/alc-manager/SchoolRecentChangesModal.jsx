import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  CircularProgress,
  Chip,
  Paper,
  IconButton,
  Divider,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { IconHistory, IconSearch, IconX, IconEye } from '@tabler/icons-react';
import aclApi from '@/api/tenant/acl/aclApi';

const SchoolRecentChangesModal = ({ open, onClose }) => {
  const theme = useTheme();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedActivityDetail, setSelectedActivityDetail] = useState(null);

  const fetchLogs = async () => {
    if (!open) return;
    try {
      setLoading(true);
      const res = await aclApi.getSchoolRecentChangesLog({
        page: page + 1,
        per_page: rowsPerPage,
        search: searchQuery,
      });

      let items = [];
      if (Array.isArray(res.data)) {
        items = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        items = res.data.data;
      }

      setLogs(items);
      setTotalCount(res.meta?.total ?? res.total ?? items.length);
    } catch (err) {
      console.error('Failed to fetch recent activity logs:', err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchLogs();
    }
  }, [open, page, rowsPerPage, searchQuery]);

  const handleExecuteSearch = () => {
    setSearchQuery(searchInput.trim());
    setPage(0);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleExecuteSearch();
    }
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    if (!val.trim()) {
      setSearchQuery('');
      setPage(0);
    }
  };

  const formatActivityDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (err) {
      return dateStr;
    }
  };

  return (
    <>
      {/* View Recent Activity Log Modal */}
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
                p: 1,
                borderRadius: 2,
                display: 'flex',
              }}
            >
              <IconHistory size={22} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Recent Changes Activity Log
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Audit trail of system activities, role updates, and user assignments performed in the last 7 days
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small">
            <IconX size={20} />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ p: 3 }}>
          {/* Search bar */}
          <Box mb={2} display="flex" gap={1} alignItems="center">
            <TextField
              size="small"
              fullWidth
              placeholder="Search user activities..."
              value={searchInput}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconSearch size={18} color={theme.palette.text.secondary} />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={handleExecuteSearch}
              startIcon={<IconSearch size={16} />}
              sx={{ height: 38, px: 2.5, fontWeight: 600, flexShrink: 0, borderRadius: '8px', textTransform: 'none' }}
            >
              Search
            </Button>
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" py={6}>
              <CircularProgress size={32} />
            </Box>
          ) : logs.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: 4,
                textAlign: 'center',
                bgcolor: alpha(theme.palette.background.paper, 0.5),
                border: `1px dashed ${theme.palette.divider}`,
                borderRadius: 2,
              }}
            >
              <IconHistory size={40} color={theme.palette.text.disabled} />
              <Typography variant="subtitle1" fontWeight={600} mt={1} color="text.secondary">
                {searchQuery ? `No Activity Records Found for "${searchQuery}"` : 'No Activity Records Found'}
              </Typography>
              <Typography variant="body2" color="text.disabled">
                {searchQuery
                  ? 'Try searching for a different keyword or user name.'
                  : 'There are no recorded system actions for the last 7 days yet.'}
              </Typography>
            </Paper>
          ) : (
            <Paper elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, overflow: 'hidden' }}>
              <TableContainer sx={{ maxHeight: 420 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, width: 60, bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100' }}>
                        S/N
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100' }}>
                        Activity
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100' }}>
                        Date Performed
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100' }}>
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {logs.map((item, idx) => (
                      <TableRow key={item.id || idx} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.8rem' }}>
                          {page * rowsPerPage + idx + 1}
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                            <Chip
                              size="small"
                              label={item.event ? item.event.toUpperCase() : 'SYSTEM'}
                              color="primary"
                              sx={{
                                height: 20,
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                borderRadius: '6px',
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                color: 'primary.main',
                              }}
                            />
                            <Typography variant="body2" fontWeight={600} color="text.primary">
                              {item.description || 'System Activity Executed'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ color: 'text.secondary', fontSize: '0.775rem', whiteSpace: 'nowrap', fontWeight: 500 }}>
                          {formatActivityDate(item.created_at)}
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            size="small"
                            variant="outlined"
                            color="primary"
                            startIcon={<IconEye size={15} />}
                            onClick={() => setSelectedActivityDetail(item)}
                            sx={{
                              borderRadius: '8px',
                              fontSize: '0.725rem',
                              textTransform: 'none',
                              py: 0.25,
                              px: 1.25,
                              fontWeight: 600,
                            }}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={totalCount}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
              />
            </Paper>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Button onClick={onClose} variant="contained" size="small" color="primary" sx={{ px: 2.5 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Activity Log Details Dialog matching UserProfileDrawer.jsx */}
      <Dialog
        open={Boolean(selectedActivityDetail)}
        onClose={() => setSelectedActivityDetail(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Activity Details
          <IconButton onClick={() => setSelectedActivityDetail(null)} size="small">
            <IconX size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedActivityDetail && (
            <Box>
              <Box mb={3}>
                <Typography variant="subtitle2" gutterBottom fontWeight={700}>
                  Basic Information
                </Typography>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, width: '150px' }}>Description</TableCell>
                      <TableCell>{selectedActivityDetail.description || '—'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Action By</TableCell>
                      <TableCell>
                        <Typography component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>
                          {selectedActivityDetail.performed_by || 'Super Admin'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                      <TableCell>{formatActivityDate(selectedActivityDetail.created_at)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Box>

              {selectedActivityDetail.properties && Object.keys(selectedActivityDetail.properties).length > 0 && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom fontWeight={700}>
                    Additional Information
                  </Typography>
                  <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1 }}>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: 'grey.50' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>Field Name</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Value</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(selectedActivityDetail.properties).map(([key, value]) => (
                          <TableRow key={key}>
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>{key}</TableCell>
                            <TableCell>
                              {typeof value === 'object' ? (
                                <Box component="pre" sx={{ m: 0, fontSize: '0.75rem', fontFamily: 'monospace' }}>
                                  {JSON.stringify(value, null, 2)}
                                </Box>
                              ) : (
                                String(value)
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setSelectedActivityDetail(null)} variant="contained" size="small" color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

SchoolRecentChangesModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default SchoolRecentChangesModal;
