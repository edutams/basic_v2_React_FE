import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableFooter,
  TablePagination,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  InputAdornment,
  CircularProgress,
  Alert,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import { 
  Search as SearchIcon, 
  MoreVert as MoreVertIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';

import axios from 'src/api/auth';
import useNotification from 'src/hooks/useNotification';

// ─── Confirmation Dialog ───────────────────────────────────────────────────
function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography sx={{ pt: 1 }}>{message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button variant="contained" color="primary" onClick={onConfirm}>Yes, Proceed</Button>
      </DialogActions>
    </Dialog>
  );
}

const AgentSubscriptionList = ({ status }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [confirm, setConfirm] = useState({ open: false, title: '', message: '', onConfirm: null });
  const notify = useNotification();


  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/agent/subscriptions', {
        params: { status }
      });
      setRows(res.data.data);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      notify.error('Failed to fetch subscriptions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [status]);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await axios.patch(`/agent/subscriptions/${id}/status`, { status: newStatus });
      notify.success(`Subscription successfully ${newStatus === 'active' ? 'approved' : 'updated'}`);
      fetchSubscriptions();
      handleMenuClose();
    } catch (error) {
      console.error('Error updating status:', error);
      notify.error('Failed to update subscription status');
    }
  };

  const handleApproveConfirm = (row) => {
    setConfirm({
      open: true,
      title: 'Approve Subscription',
      message: `Are you sure you want to approve the subscription for "${row.tenant?.tenant_name}"?`,
      onConfirm: () => {
        setConfirm((prev) => ({ ...prev, open: false }));
        handleUpdateStatus(row.id, 'active');
      },
    });
  };

  const handleRejectConfirm = (row) => {
    setConfirm({
      open: true,
      title: 'Reject/Expire Subscription',
      message: `Are you sure you want to reject or expire the subscription for "${row.tenant?.tenant_name}"?`,
      onConfirm: () => {
        setConfirm((prev) => ({ ...prev, open: false }));
        handleUpdateStatus(row.id, 'expired');
      },
    });
  };

  const filteredRows = rows.filter((row) => {
    const searchStr = `${row.tenant?.tenant_name || ''} ${row.sessions?.sesname || ''} ${row.terms?.term_name || ''} ${row.my_plans?.display_name || ''}`.toLowerCase();
    return searchStr.includes(searchTerm.toLowerCase());
  });

  const paginatedRows = filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleMenuOpen = (event, row) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'expired': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <TextField
          placeholder="Search by school, session, or plan..."
          fullWidth
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(0);
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={5}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper variant="outlined">
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>School</TableCell>
                  <TableCell>Session/Term</TableCell>
                  <TableCell>Plan Details</TableCell>
                  <TableCell>Amount (₦)</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedRows.length > 0 ? (
                  paginatedRows.map((row, index) => (
                    <TableRow key={row.id} hover>
                      <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {row.tenant?.tenant_name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {row.tenant?.id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {row.sessions?.sesname} <br />
                        <Typography variant="caption" color="textSecondary">
                          {row.terms?.term_name || 'Full Session'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {row.my_plans?.display_name} <br />
                        <Typography variant="caption" color="textSecondary">
                          {row.plans?.description}
                        </Typography>
                      </TableCell>
                      <TableCell>{row.amount}</TableCell>
                      <TableCell>
                        <Chip
                          label={row.status.toUpperCase()}
                          size="small"
                          color={getStatusColor(row.status)}
                          sx={{ borderRadius: '6px' }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box display="flex" justifyContent="center" alignItems="center">
                          {row.status === 'pending' && (
                            <Button
                              size="small"
                              variant="outlined"
                              color="success"
                              sx={{ mr: 1 }}
                              onClick={() => handleApproveConfirm(row)}
                            >
                              Approve
                            </Button>
                          )}
                          <IconButton onClick={(e) => handleMenuOpen(e, row)}>
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </Box>

                        <Menu
                          anchorEl={anchorEl}
                          open={Boolean(anchorEl) && selectedRow?.id === row.id}
                          onClose={handleMenuClose}
                        >
                          <MenuItem onClick={() => {/* TODO: Implement detail view */}}>
                            <ViewIcon sx={{ mr: 1, fontSize: '18px' }} /> View Details
                          </MenuItem>
                          {row.status !== 'active' && (
                            <MenuItem onClick={() => handleApproveConfirm(row)}>
                              <CheckIcon sx={{ mr: 1, fontSize: '18px' }} /> Approve
                            </MenuItem>
                          )}
                          {row.status !== 'expired' && (
                            <MenuItem onClick={() => handleRejectConfirm(row)}>
                              <CancelIcon sx={{ mr: 1, fontSize: '18px' }} /> Reject/Expire
                            </MenuItem>
                          )}
                        </Menu>
                      </TableCell>

                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Alert severity="info">No subscriptions found</Alert>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    colSpan={7}
                    count={filteredRows.length}
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
        </Paper>
      )}
      <ConfirmDialog 
        {...confirm} 
        onCancel={() => setConfirm((prev) => ({ ...prev, open: false }))} 
      />
    </Box>
  );
};


export default AgentSubscriptionList;
