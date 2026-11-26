import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  useTheme,
  Skeleton,
  Menu,
  Tabs,
  Tab,
  Pagination,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PageContainer from '@/components/container/PageContainer';
import ParentCard from '@/components/shared/ParentCard';
import ReusableAreaChart from '@/components/shared/charts/ReusableAreaChart';
import tenantApi from '@/api/tenant/tenant_api';
import {
  IconUsers,
  IconPlus,
  IconCircleCheck,
  IconInfoCircle,
  IconSearch,
  IconRefresh,
  IconEye,
  IconEdit,
  IconBan,
  IconRotate,
  IconBuildingStore,
  IconArrowRight,
  IconChartBar,
  IconFileDescription,
  IconBuildingBank,
  IconCreditCard,
  IconUserCircle,
  IconCoins,
  IconCalendar,
} from '@tabler/icons';
import AddVendorModal from './components/AddVendorModal';
import { STATUS_META, formatCompact } from './constants';

const thCell = { fontWeight: 700, py: 0.75, px: 1.25 };
const tdCell = { py: 0.5, px: 1.25 };

const DetailRow = ({ icon: Icon, label, value, theme }) => (
  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
    <Icon size={14} color={theme.palette.text.disabled} style={{ marginTop: 2, flexShrink: 0 }} />
    <Typography sx={{ fontSize: 12.5, color: 'text.secondary', minWidth: 92, flexShrink: 0 }}>
      {label}
    </Typography>
    <Typography sx={{ fontSize: 12.5, fontWeight: 600, minWidth: 0 }}>: {value || '—'}</Typography>
  </Box>
);

const MiniStat = ({ icon: Icon, value, label, bg, color }) => (
  <Box sx={{ bgcolor: bg, borderRadius: '10px', p: 1, textAlign: 'center' }}>
    <Icon size={16} color={color} style={{ marginBottom: 2 }} />
    <Typography sx={{ fontWeight: 800, fontSize: 13, lineHeight: 1.2 }}>{value}</Typography>
    <Typography sx={{ fontSize: 9.5, color: 'text.secondary' }}>{label}</Typography>
  </Box>
);

const VendorProfile = () => {
  const theme = useTheme();

  const [loading, setLoading] = useState(true);
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);

  const [activeTab, setActiveTab] = useState('all');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [page, setPage] = useState(1);
  const rowsPerPage = 8;

  const [anchorEl, setAnchorEl] = useState(null);
  const [menuRow, setMenuRow] = useState(null);

  const [addVendorOpen, setAddVendorOpen] = useState(false);
  const [editVendorOpen, setEditVendorOpen] = useState(false);
  const [vendorToEdit, setVendorToEdit] = useState(null);
  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);
  const [vendorForStatusChange, setVendorForStatusChange] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [intelLoading, setIntelLoading] = useState(false);

  const fetchVendors = useCallback(() => {
    setLoading(true);
    tenantApi
      .get('/vendor_manager/fetch_vendors')
      .then((res) => {
        const data = res.data?.data || [];
        setVendors(data);
        setSelectedVendor((prev) => prev ?? data[0] ?? null);
      })
      .catch(() => setSnackbar({ open: true, message: 'Could not load vendors.', severity: 'error' }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  // Vendor Intelligence (spend trend + insights) is only worth fetching
  // once a vendor is actually selected, and is per-vendor — the list
  // endpoint already carries transactions/total_spend/years_active, this
  // just fills in the 12-month trend and the computed insight sentences.
  useEffect(() => {
    if (!selectedVendor?.id) return;
    setIntelLoading(true);
    tenantApi
      .get(`/vendor_manager/fetch_vendor/${selectedVendor.id}`)
      .then((res) => {
        const detail = res.data?.data;
        if (detail) {
          setSelectedVendor((prev) => (prev && prev.id === detail.id ? { ...prev, ...detail } : prev));
        }
      })
      .catch(() => {})
      .finally(() => setIntelLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVendor?.id]);

  const counts = useMemo(() => {
    const total = vendors.length;
    const active = vendors.filter((v) => v.is_active).length;
    return { total, active, inactive: total - active };
  }, [vendors]);

  const handleTabChange = (val) => {
    setActiveTab(val);
    setPage(1);
    if (val === 'active') setStatusFilter('Active');
    else if (val === 'inactive') setStatusFilter('Inactive');
    else setStatusFilter('All');
  };

  const filteredData = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return vendors.filter((v) => {
      const status = v.is_active ? 'Active' : 'Inactive';
      const matchesStatus = statusFilter === 'All' || status === statusFilter;
      const matchesSearch =
        !q ||
        v.name.toLowerCase().includes(q) ||
        (v.description || '').toLowerCase().includes(q) ||
        (v.account_number || '').toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [vendors, statusFilter, searchQuery]);

  const pageCount = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));
  const safePage = Math.min(page, pageCount);
  const paginatedData = filteredData.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage);

  const handleResetFilters = () => {
    setStatusFilter(activeTab === 'active' ? 'Active' : activeTab === 'inactive' ? 'Inactive' : 'All');
    setSearchQuery('');
    setPage(1);
  };

  const handleMenuOpen = (event, row) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setMenuRow(row);
  };
  const handleMenuClose = () => setAnchorEl(null);

  const handleEditClick = (row) => {
    setVendorToEdit(row);
    setEditVendorOpen(true);
    handleMenuClose();
  };

  const handleStatusClick = (row) => {
    setVendorForStatusChange(row);
    setStatusConfirmOpen(true);
    handleMenuClose();
  };

  const handleConfirmStatusToggle = () => {
    tenantApi
      .put(`/vendor_manager/toggle_vendor_status/${vendorForStatusChange.id}`)
      .then(() => {
        setStatusConfirmOpen(false);
        setSnackbar({
          open: true,
          message: vendorForStatusChange.is_active ? 'Vendor deactivated.' : 'Vendor activated.',
          severity: 'success',
        });
        fetchVendors();
      })
      .catch((err) =>
        setSnackbar({
          open: true,
          message: err.response?.data?.message || 'Something went wrong. Please try again.',
          severity: 'error',
        }),
      );
  };

  const handleAddVendorSubmit = (payload) => {
    setSubmitting(true);
    tenantApi
      .post('/vendor_manager/create_vendor', payload)
      .then((res) => {
        setAddVendorOpen(false);
        setSnackbar({ open: true, message: 'Vendor created.', severity: 'success' });
        setSelectedVendor(res.data?.data || null);
        fetchVendors();
      })
      .catch((err) =>
        setSnackbar({
          open: true,
          message: err.response?.data?.message || 'Something went wrong. Please try again.',
          severity: 'error',
        }),
      )
      .finally(() => setSubmitting(false));
  };

  const handleEditVendorSubmit = (payload) => {
    setSubmitting(true);
    tenantApi
      .put(`/vendor_manager/update_vendor/${vendorToEdit.id}`, payload)
      .then(() => {
        setEditVendorOpen(false);
        setSnackbar({ open: true, message: 'Vendor updated.', severity: 'success' });
        fetchVendors();
      })
      .catch((err) =>
        setSnackbar({
          open: true,
          message: err.response?.data?.message || 'Something went wrong. Please try again.',
          severity: 'error',
        }),
      )
      .finally(() => setSubmitting(false));
  };

  const selectedStatusMeta = selectedVendor ? STATUS_META[selectedVendor.is_active ? 'Active' : 'Inactive'] : null;

  return (
    <PageContainer title="Vendor Profile Management" description="Maintain supplier and service provider records">
      <Box sx={{ mt: 1 }}>
        {/* ===================== Header ===================== */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'flex-start', md: 'center' },
            justifyContent: 'space-between',
            gap: 2,
            mb: 3,
          }}
        >
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                bgcolor: theme.palette.primary.main,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <IconUsers size={24} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: { xs: 18, md: 22 }, fontWeight: 700 }}>
                Vendor Profile Management
              </Typography>
              <Typography sx={{ fontSize: 13.5, color: 'text.secondary' }}>
                Maintain supplier and service provider records for procurement and payment.
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25 }}>
            <Button
              variant="contained"
              onClick={() => setAddVendorOpen(true)}
              startIcon={<IconPlus size={18} />}
              sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700, whiteSpace: 'nowrap' }}
            >
              Add Vendor
            </Button>
          </Box>
        </Box>

        <Grid container spacing={2}>
          {/* ===================== Left: tabs + filters + table ===================== */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <ParentCard
              sx={{
                '& .MuiCardContent-root': { p: 1.5, pt: 1.25, '&:last-child': { pb: 1 } },
              }}
            >
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs
                  value={activeTab}
                  onChange={(e, val) => handleTabChange(val)}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 700, fontSize: 13.5, minHeight: 44 } }}
                >
                  <Tab icon={<IconUsers size={15} />} iconPosition="start" label={`All Vendors (${counts.total})`} value="all" />
                  <Tab icon={<IconCircleCheck size={15} />} iconPosition="start" label={`Active (${counts.active})`} value="active" />
                  <Tab icon={<IconInfoCircle size={15} />} iconPosition="start" label={`Inactive (${counts.inactive})`} value="inactive" />
                </Tabs>
              </Box>

              <Grid container spacing={1.5} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, md: 7 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search vendor by name, description or account number..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(1);
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <IconSearch size={18} />
                        </InputAdornment>
                      ),
                      sx: { borderRadius: '8px' },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <FormControl fullWidth size="small">
                    <Select
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setPage(1);
                      }}
                      sx={{ borderRadius: '8px' }}
                    >
                      <MenuItem value="All">All Status</MenuItem>
                      <MenuItem value="Active">Active</MenuItem>
                      <MenuItem value="Inactive">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="inherit"
                    onClick={handleResetFilters}
                    startIcon={<IconRefresh size={16} />}
                    sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, height: '100%' }}
                  >
                    Reset
                  </Button>
                </Grid>
              </Grid>

              <TableContainer>
                <Table size="small" sx={{ minWidth: 820 }}>
                  <TableHead
                    sx={{
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : theme.palette.action.hover,
                    }}
                  >
                    <TableRow
                      sx={{
                        '& .MuiTableCell-root': { borderBottom: `2px solid ${theme.palette.divider}` },
                      }}
                    >
                      <TableCell sx={thCell}>#</TableCell>
                      <TableCell sx={thCell}>Vendor Name</TableCell>
                      <TableCell sx={thCell}>Description</TableCell>
                      <TableCell sx={thCell}>Bank / Account</TableCell>
                      <TableCell sx={thCell}>Status</TableCell>
                      <TableCell sx={thCell} align="center">
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 6 }).map((_, idx) => (
                        <TableRow key={idx}>
                          {Array.from({ length: 6 }).map((__, cellIdx) => (
                            <TableCell key={cellIdx} sx={tdCell}>
                              <Skeleton variant="text" height={20} />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : paginatedData.length > 0 ? (
                      paginatedData.map((row, idx) => {
                        const statusMeta = STATUS_META[row.is_active ? 'Active' : 'Inactive'];
                        return (
                          <TableRow
                            key={row.id}
                            hover
                            selected={selectedVendor?.id === row.id}
                            onClick={() => setSelectedVendor(row)}
                            sx={{ cursor: 'pointer' }}
                          >
                            <TableCell sx={{ ...tdCell, color: 'text.secondary' }}>
                              {(safePage - 1) * rowsPerPage + idx + 1}
                            </TableCell>
                            <TableCell sx={tdCell}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box
                                  sx={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: '8px',
                                    bgcolor: theme.palette.primary.light,
                                    color: theme.palette.primary.main,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                  }}
                                >
                                  <IconUserCircle size={15} />
                                </Box>
                                <Typography sx={{ fontWeight: 600, fontSize: 13 }}>{row.name}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell sx={{ ...tdCell, fontSize: 12.5, color: 'text.secondary', maxWidth: 220 }}>
                              {row.description || '—'}
                            </TableCell>
                            <TableCell sx={tdCell}>
                              <Typography sx={{ fontSize: 12.5 }}>{row.bank_name || '—'}</Typography>
                              <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>{row.account_number || ''}</Typography>
                            </TableCell>
                            <TableCell sx={tdCell}>
                              <Chip
                                label={row.is_active ? 'Active' : 'Inactive'}
                                size="small"
                                sx={{
                                  bgcolor: statusMeta.bg,
                                  color: statusMeta.color,
                                  fontWeight: 700,
                                  borderRadius: '8px',
                                  fontSize: 11,
                                }}
                              />
                            </TableCell>
                            <TableCell sx={tdCell} align="center">
                              <IconButton size="small" onClick={(e) => handleMenuOpen(e, row)}>
                                <MoreVertIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Alert severity="info" sx={{ my: 2, justifyContent: 'center' }}>
                            {searchQuery
                              ? 'No vendors match the current search.'
                              : 'No vendors found. Add one to get started.'}
                          </Alert>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1.5,
                  px: 1,
                  pt: 1.5,
                }}
              >
                <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                  {filteredData.length === 0
                    ? 'Showing 0 of 0 vendors'
                    : `Showing ${(safePage - 1) * rowsPerPage + 1}–${Math.min(
                        safePage * rowsPerPage,
                        filteredData.length,
                      )} of ${filteredData.length} vendors`}
                </Typography>
                <Pagination
                  count={pageCount}
                  page={safePage}
                  onChange={(_, val) => setPage(val)}
                  shape="rounded"
                  color="primary"
                  size="small"
                />
              </Box>
            </ParentCard>
          </Grid>

          {/* ===================== Right: selected vendor + intelligence ===================== */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <ParentCard
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconBuildingStore size={17} />
                    <Typography sx={{ fontWeight: 700, fontSize: 14 }}>Selected Vendor Information</Typography>
                  </Box>
                }
                sx={{
                  '& .MuiCardHeader-root': {
                    bgcolor: theme.palette.primary.main,
                    color: '#fff',
                    py: 1.1,
                    px: 2,
                  },
                  '& .MuiCardContent-root': { p: 2 },
                }}
              >
                {selectedVendor ? (
                  <>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: '10px',
                          bgcolor: theme.palette.primary.light,
                          color: theme.palette.primary.main,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <IconUserCircle size={22} />
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography sx={{ fontWeight: 700, fontSize: 14.5 }}>{selectedVendor.name}</Typography>
                          <Chip
                            label={selectedVendor.is_active ? 'Active' : 'Inactive'}
                            size="small"
                            sx={{
                              bgcolor: selectedStatusMeta?.bg,
                              color: selectedStatusMeta?.color,
                              fontWeight: 700,
                              height: 19,
                              fontSize: 10.5,
                            }}
                          />
                        </Box>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.1 }}>
                      <DetailRow icon={IconFileDescription} label="Description" value={selectedVendor.description} theme={theme} />
                      <DetailRow icon={IconBuildingBank} label="Bank" value={selectedVendor.bank_name} theme={theme} />
                      <DetailRow icon={IconCreditCard} label="Account No." value={selectedVendor.account_number} theme={theme} />
                      <DetailRow icon={IconUserCircle} label="Account Name" value={selectedVendor.account_name} theme={theme} />
                    </Box>
                  </>
                ) : (
                  <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>
                    Select a vendor from the list to view details.
                  </Typography>
                )}
              </ParentCard>

              <ParentCard
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconChartBar size={17} color={theme.palette.primary.main} />
                      <Typography sx={{ fontWeight: 700, fontSize: 14 }}>Vendor Intelligence</Typography>
                    </Box>
                    <Button
                      size="small"
                      endIcon={<IconArrowRight size={13} />}
                      sx={{ textTransform: 'none', fontWeight: 600, fontSize: 12 }}
                    >
                      View Insights
                    </Button>
                  </Box>
                }
                sx={{
                  '& .MuiCardHeader-root': { pb: 1, pt: 1.5, px: 2 },
                  '& .MuiCardContent-root': { p: 2, '&:last-child': { pb: 2 } },
                }}
              >
                <Grid container spacing={1} sx={{ mb: 1.75 }}>
                  <Grid size={4}>
                    <MiniStat icon={IconUsers} value={selectedVendor?.transactions ?? 0} label="Transactions" bg="#DBEAFE" color="#2563EB" />
                  </Grid>
                  <Grid size={4}>
                    <MiniStat icon={IconCoins} value={formatCompact(selectedVendor?.total_spend ?? 0)} label="Total Spend" bg="#DCFCE7" color="#16A34A" />
                  </Grid>
                  <Grid size={4}>
                    <MiniStat icon={IconCalendar} value={selectedVendor?.years_active ?? 0} label="Years" bg="#FEF3C7" color="#D97706" />
                  </Grid>
                </Grid>

                <Typography sx={{ fontWeight: 700, fontSize: 12.5, mb: 1 }}>Spend Trend (Last 12 Months)</Typography>
                <ReusableAreaChart
                  data={selectedVendor?.spend_trend || []}
                  nameKey="month"
                  dataKey="spend"
                  name="Spend"
                  color={theme.palette.primary.main}
                  height={140}
                  showLabels={false}
                  valueFormatter={formatCompact}
                  xTickFontSize={9}
                  yTickFontSize={9}
                />

                <Box sx={{ bgcolor: '#DCFCE7', borderRadius: '10px', p: 1.5, mt: 1.5, minHeight: 90 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: 12.5, mb: 0.75 }}>Quick Insights</Typography>
                  {(selectedVendor?.quick_insights || []).length === 0 ? (
                    <Typography sx={{ fontSize: 11.5, color: 'text.secondary' }}>
                      {intelLoading ? 'Loading…' : 'No activity with this vendor yet.'}
                    </Typography>
                  ) : (
                    selectedVendor.quick_insights.map((text) => (
                      <Box key={text} sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75, mb: 0.5, '&:last-of-type': { mb: 0 } }}>
                        <IconCircleCheck size={13} color="#16A34A" style={{ marginTop: 2, flexShrink: 0 }} />
                        <Typography sx={{ fontSize: 11.5 }}>{text}</Typography>
                      </Box>
                    ))
                  )}
                </Box>
              </ParentCard>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Row action menu — single shared instance, anchored to whichever row was clicked */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem
          onClick={() => {
            setSelectedVendor(menuRow);
            handleMenuClose();
          }}
        >
          <IconEye size={16} style={{ marginRight: 8 }} />
          View
        </MenuItem>
        <MenuItem onClick={() => handleEditClick(menuRow)}>
          <IconEdit size={16} style={{ marginRight: 8 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={() => handleStatusClick(menuRow)} sx={{ color: menuRow?.is_active ? 'error.main' : 'success.main' }}>
          {menuRow?.is_active ? (
            <IconBan size={16} style={{ marginRight: 8 }} />
          ) : (
            <IconRotate size={16} style={{ marginRight: 8 }} />
          )}
          {menuRow?.is_active ? 'Deactivate' : 'Activate'}
        </MenuItem>
      </Menu>

      <AddVendorModal
        open={addVendorOpen}
        onClose={() => setAddVendorOpen(false)}
        onSubmit={handleAddVendorSubmit}
        submitting={submitting}
      />
      <AddVendorModal
        open={editVendorOpen}
        onClose={() => setEditVendorOpen(false)}
        onSubmit={handleEditVendorSubmit}
        mode="edit"
        vendor={vendorToEdit}
        submitting={submitting}
      />

      <Dialog open={statusConfirmOpen} onClose={() => setStatusConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{vendorForStatusChange?.is_active ? 'Deactivate Vendor' : 'Activate Vendor'}</DialogTitle>
        <DialogContent>
          <Typography>
            {vendorForStatusChange?.is_active
              ? `Once deactivated, "${vendorForStatusChange?.name}" can no longer be selected for new postings anywhere in the app.`
              : `"${vendorForStatusChange?.name}" will become available for new postings again.`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" size="small" color="inherit" onClick={() => setStatusConfirmOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            size="small"
            color={vendorForStatusChange?.is_active ? 'error' : 'success'}
            onClick={handleConfirmStatusToggle}
          >
            {vendorForStatusChange?.is_active ? 'Deactivate' : 'Activate'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
};

export default VendorProfile;
