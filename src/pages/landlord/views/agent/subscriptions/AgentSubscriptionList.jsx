import { useState, useEffect, useCallback } from 'react';
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
  Chip,
  IconButton,
  Menu,
  MenuItem,
  InputAdornment,
  Skeleton,
  Alert,
  Button,
  Avatar,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Grid,
  Link,
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Visibility as ViewIcon,
  LocalOffer as DiscountIcon,
  PersonOutline as PersonOutlineIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

import axios from '@/api/landlord/landlord_api';
import useNotification from 'src/hooks/useNotification';
import ConfirmationDialog from 'src/components/shared/ConfirmationDialog';

// ─── Status Chip ────────────────────────────────────────────────────────────
const StatusChip = ({ status }) => {
  const isActive = status === 'active';
  const isPending = status === 'pending';
  return (
    <Chip
      label={isActive ? 'Active' : isPending ? 'Pending' : 'Expired'}
      size="small"
      sx={{
        bgcolor: isActive ? 'success.light' : isPending ? 'warning.light' : 'error.light',
        color: isActive ? 'success.dark' : isPending ? 'warning.dark' : 'error.dark',
        fontWeight: 600,
        borderRadius: '8px',
        fontSize: 11,
      }}
    />
  );
};

// ─── Table Header Styles ────────────────────────────────────────────────────
const thSx = { fontWeight: 700, fontSize: '13px' };

const AgentSubscriptionList = ({ status }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [confirm, setConfirm] = useState({ open: false, title: '', message: '', onConfirm: null });
  const notify = useNotification();

  // Discount modal state
  const [discountModalOpen, setDiscountModalOpen] = useState(false);
  const [discountValue, setDiscountValue] = useState(0);
  const [discountSaving, setDiscountSaving] = useState(false);

  // View detail modal state
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailRow, setDetailRow] = useState(null);

  const getSchoolUrl = (row) => {
    const domain = row.tenant?.organization?.organization_domain;
    const shortName = row.tenant?.tenant_short_name;
    if (domain && shortName) return `https://${shortName}.${domain}`;
    return null;
  };

  const fetchSubscriptions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get('/v1/landlord/subscriptions', {
        params: { status, search: searchTerm },
      });
      setRows(res.data.data);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      notify.error('Failed to fetch subscriptions');
    } finally {
      setLoading(false);
    }
  }, [status, searchTerm]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await axios.patch(`/v1/landlord/subscriptions/${id}/status`, { status: newStatus });
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

  // ── Discount Modal ───────────────────────────────────────────────────────
  const handleOpenDiscount = (row) => {
    setSelectedRow(row);
    setDiscountValue(row.discount || 0);
    setDiscountModalOpen(true);
    handleMenuClose();
  };

  const handleSaveDiscount = async () => {
    if (!selectedRow) return;
    setDiscountSaving(true);
    try {
      await axios.patch(`/v1/landlord/subscriptions/${selectedRow.id}/discount`, {
        discount: parseInt(discountValue, 10),
      });
      notify.success('Discount updated successfully');
      setDiscountModalOpen(false);
      fetchSubscriptions();
    } catch (error) {
      console.error('Error updating discount:', error);
      notify.error(error.response?.data?.message || 'Failed to update discount');
    } finally {
      setDiscountSaving(false);
    }
  };

  // ── View Detail ──────────────────────────────────────────────────────────
  const handleViewDetail = (row) => {
    setDetailRow(row);
    setDetailModalOpen(true);
    handleMenuClose();
  };

  // ── Helpers ──────────────────────────────────────────────────────────────
  const formatAmount = (val) => parseFloat(val || 0).toLocaleString();

  const calcAmountDue = (row) => {
    const amount = parseFloat(row.amount) || 0;
    const discountPct = parseFloat(row.discount) || 0;
    const afterDiscount = amount - (amount * discountPct) / 100;
    return afterDiscount;
  };

  const handleMenuOpen = (event, row) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  return (
    <Box>
      {/* ── Search Bar ───────────────────────────────────────────────────── */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search by school, session, or plan..."
          sx={{ width: { xs: '100%', sm: 300, md: 350 } }}
          size="small"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          size="small"
          onClick={() => {
            setSearchTerm(searchInput.trim());
            setPage(0);
          }}
        >
          Search
        </Button>
      </Box>

      {/* ── Table ────────────────────────────────────────────────────────── */}
      {loading ? (
        <Box sx={{ py: 2 }}>
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} variant="text" height={50} sx={{ mb: 1, borderRadius: 1 }} />
          ))}
        </Box>
      ) : (
        <Box>
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table stickyHeader sx={{ '& .MuiTableCell-root': { py: 0.5, px: 1 }, whiteSpace: 'nowrap' }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={thSx}>#</TableCell>
                  <TableCell sx={thSx}>School Info</TableCell>
                  <TableCell sx={thSx}>Session/Term</TableCell>
                  <TableCell sx={thSx}>Plan Details</TableCell>
                  <TableCell sx={thSx}>Amount (₦)</TableCell>
                  <TableCell sx={thSx}>Discount (%)</TableCell>
                  <TableCell sx={thSx}>Amount Due (₦)</TableCell>
                  <TableCell sx={thSx}>Status</TableCell>
                  <TableCell sx={thSx} align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.length > 0 ? (
                  rows.map((row, index) => {
                    const amountNum = parseFloat(row.amount) || 0;
                    const discountPct = parseFloat(row.discount) || 0;
                    const amountDue = calcAmountDue(row);

                    return (
                      <TableRow key={row.id} hover>
                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Avatar
                              src={row.tenant?.school_logo || row.tenant?.image}
                              sx={{ width: 40, height: 40, bgcolor: '#E7E9EB' }}
                            >
                              {!row.tenant?.school_logo && !row.tenant?.image && (
                                <PersonOutlineIcon sx={{ color: '#000', fontSize: 22 }} />
                              )}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" fontWeight={700} sx={{ lineHeight: 1.3 }}>
                                {row.tenant?.tenant_name || '—'}
                              </Typography>
                              {(() => {
                                const url = getSchoolUrl(row);
                                return url ? (
                                  <Link
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    variant="caption"
                                    color="text.secondary"
                                    underline="hover"
                                    sx={{ display: 'block', lineHeight: 1.3 }}
                                  >
                                    {url.replace('https://', '')}
                                  </Link>
                                ) : (
                                  <Typography variant="caption" color="text.secondary">
                                    {row.tenant?.tenant_short_name || '—'}
                                  </Typography>
                                );
                              })()}
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          {row.sessions?.session_name || '—'}
                          <br />
                          <Typography variant="caption" color="textSecondary">
                            {row.terms?.term_name || 'Full Session'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {row.my_plans?.display_name || '—'}
                          <br />
                          <Typography variant="caption" color="textSecondary">
                            {row.plans?.description || ''}
                          </Typography>
                        </TableCell>
                        <TableCell>₦{formatAmount(amountNum)}</TableCell>
                        <TableCell>
                          {discountPct > 0 ? (
                            <Chip
                              label={`${discountPct}%`}
                              size="small"
                              sx={{ bgcolor: 'info.light', color: 'info.dark', fontWeight: 600, borderRadius: '8px', fontSize: 11 }}
                            />
                          ) : (
                            <Typography variant="body2" color="text.secondary">0%</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            ₦{formatAmount(amountDue)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <StatusChip status={row.status} />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton onClick={(e) => handleMenuOpen(e, row)}>
                            <MoreVertIcon fontSize="small" />
                          </IconButton>

                          <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl) && selectedRow?.id === row.id}
                            onClose={handleMenuClose}
                          >
                            {/* <MenuItem onClick={() => handleViewDetail(row)}>
                              <ViewIcon sx={{ mr: 1, fontSize: '18px' }} /> View Details
                            </MenuItem> */}
                            <MenuItem onClick={() => handleOpenDiscount(row)}>
                              <DiscountIcon sx={{ mr: 1, fontSize: '18px' }} /> Set Discount
                            </MenuItem>
                            {/* {row.status !== 'active' && (
                              <MenuItem onClick={() => handleApproveConfirm(row)}>
                                <CheckIcon sx={{ mr: 1, fontSize: '18px' }} /> Approve
                              </MenuItem>
                            )}
                            {row.status !== 'expired' && (
                              <MenuItem onClick={() => handleRejectConfirm(row)}>
                                <CancelIcon sx={{ mr: 1, fontSize: '18px' }} /> Reject/Expire
                              </MenuItem>
                            )} */}
                          </Menu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      <Alert
                        severity="info"
                        sx={{
                          mb: 0,
                          justifyContent: 'center',
                          textAlign: 'center',
                          '& .MuiAlert-icon': { mr: 1.5 },
                        }}
                      >
                        No subscriptions found
                      </Alert>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    colSpan={9}
                    count={rows.length}
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
        </Box>
      )}

      {/* ── Discount Modal ───────────────────────────────────────────────── */}
      <Dialog
        open={discountModalOpen}
        onClose={() => setDiscountModalOpen(false)}
        maxWidth="xs"
        fullWidth
        disableEnforceFocus
        disableAutoFocus
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontWeight: 700,
          }}
        >
          Set Discount
          <IconButton onClick={() => setDiscountModalOpen(false)} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          <Alert severity="info" sx={{ mb: 2, borderRadius: 2, fontSize: '0.8rem' }}>
            Set the percentage discount you want to give to this subschool for the selected subscription
          </Alert>
          <TextField
            fullWidth
            size="small"
            type="number"
            label="Discount"
            value={discountValue}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (val >= 0 && val <= 100) setDiscountValue(val);
            }}
            inputProps={{ min: 0, max: 100, sx: { textAlign: 'center', fontWeight: 600 } }}
            InputProps={{
              startAdornment: <InputAdornment position="start">Set Discount</InputAdornment>,
              endAdornment: <InputAdornment position="end">of 100%</InputAdornment>,
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            variant="contained"
            size="small"
            color="inherit"
            onClick={() => setDiscountModalOpen(false)}
            disabled={discountSaving}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={handleSaveDiscount}
            disabled={discountSaving}
            sx={{ fontWeight: 600, bgcolor: '#f9a825', '&:hover': { bgcolor: '#f57f17' } }}
          >
            {discountSaving ? 'Updating...' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── View Detail Modal ────────────────────────────────────────────── */}
      <Dialog
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        maxWidth="sm"
        fullWidth
        disableEnforceFocus
        disableAutoFocus
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontWeight: 700,
          }}
        >
          Subscription Details
          <IconButton onClick={() => setDetailModalOpen(false)} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          {detailRow && (
            <Stack spacing={2}>
              {/* School Info */}
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar
                  src={detailRow.tenant?.school_logo || detailRow.tenant?.image}
                  sx={{ width: 56, height: 56, bgcolor: '#E7E9EB' }}
                >
                  {!detailRow.tenant?.school_logo && !detailRow.tenant?.image && (
                    <PersonOutlineIcon sx={{ color: '#000', fontSize: 32 }} />
                  )}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {detailRow.tenant?.tenant_name || '—'}
                  </Typography>
                  {(() => {
                    const url = getSchoolUrl(detailRow);
                    return url ? (
                      <Link
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="caption"
                        color="text.secondary"
                        underline="hover"
                      >
                        {url.replace('https://', '')}
                      </Link>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        {detailRow.tenant?.tenant_short_name || '—'}
                      </Typography>
                    );
                  })()}
                </Box>
              </Stack>

              <Divider />

              {/* Details Grid */}
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Session</Typography>
                  <Typography variant="body2" fontWeight={600}>{detailRow.sessions?.session_name || '—'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Term</Typography>
                  <Typography variant="body2" fontWeight={600}>{detailRow.terms?.term_name || 'Full Session'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Plan</Typography>
                  <Typography variant="body2" fontWeight={600}>{detailRow.my_plans?.display_name || '—'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Status</Typography>
                  <Box><StatusChip status={detailRow.status} /></Box>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Amount</Typography>
                  <Typography variant="body2" fontWeight={600}>₦{formatAmount(detailRow.amount)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Discount</Typography>
                  <Typography variant="body2" fontWeight={600}>{detailRow.discount || 0}%</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Amount Due</Typography>
                  <Typography variant="body2" fontWeight={600} color="primary.main">
                    ₦{formatAmount(calcAmountDue(detailRow))}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Subscription Mode</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {detailRow.subscription_mode === 'per_session' ? 'Per Session' : 'Per Term'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Created</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {detailRow.created_at ? new Date(detailRow.created_at).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                    }) : '—'}
                  </Typography>
                </Grid>
              </Grid>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="contained" size="small" color="inherit" onClick={() => setDetailModalOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Status Confirm Dialog ────────────────────────────────────────── */}
      <ConfirmationDialog
        {...confirm}
        onClose={() => setConfirm((prev) => ({ ...prev, open: false }))}
      />
    </Box>
  );
};

export default AgentSubscriptionList;
