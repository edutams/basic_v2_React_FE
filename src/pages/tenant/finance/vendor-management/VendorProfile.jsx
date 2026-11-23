import React, { useEffect, useMemo, useState } from 'react';
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
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PageContainer from '@/components/container/PageContainer';
import ParentCard from '@/components/shared/ParentCard';
import ReusableAreaChart from '@/components/shared/charts/ReusableAreaChart';
import {
  IconUsers,
  IconSettings,
  IconUpload,
  IconPlus,
  IconChevronDown,
  IconCircleCheck,
  IconInfoCircle,
  IconCategory,
  IconStar,
  IconSearch,
  IconRefresh,
  IconEye,
  IconEdit,
  IconTrash,
  IconBuildingStore,
  IconArrowRight,
  IconChartBar,
  IconUser,
  IconPhone,
  IconMail,
  IconId,
  IconMapPin,
  IconCalendar,
  IconCoins,
} from '@tabler/icons';
import AddVendorModal from './components/AddVendorModal';
import {
  VENDOR_CATEGORY_META,
  VENDOR_CATEGORIES,
  STATUS_META,
  mockVendors,
  spendTrend,
  quickInsights,
  formatCompact,
} from './constants';

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
  const [vendors, setVendors] = useState(mockVendors);
  const [selectedVendor, setSelectedVendor] = useState(mockVendors[0] || null);

  const [activeTab, setActiveTab] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [page, setPage] = useState(1);
  const rowsPerPage = 8;

  const [anchorEl, setAnchorEl] = useState(null);
  const [menuRow, setMenuRow] = useState(null);
  const [categoriesMenuAnchor, setCategoriesMenuAnchor] = useState(null);

  const [addVendorOpen, setAddVendorOpen] = useState(false);
  const [editVendorOpen, setEditVendorOpen] = useState(false);
  const [vendorToEdit, setVendorToEdit] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(timer);
  }, []);

  const counts = useMemo(() => {
    const total = vendors.length;
    const active = vendors.filter((v) => v.status === 'Active').length;
    return { total, active, inactive: total - active };
  }, [vendors]);

  const handleTabChange = (val) => {
    setActiveTab(val);
    setPage(1);
    if (val === 'active') setStatusFilter('Active');
    else if (val === 'inactive') setStatusFilter('Inactive');
    else if (val === 'all') setStatusFilter('All');
  };

  const filteredData = useMemo(() => {
    const q = searchQuery.toLowerCase();
    let data = vendors.filter((v) => {
      const matchesCategory = categoryFilter === 'All' || v.category === categoryFilter;
      const matchesStatus = statusFilter === 'All' || v.status === statusFilter;
      const matchesSearch =
        !q ||
        v.name.toLowerCase().includes(q) ||
        v.email.toLowerCase().includes(q) ||
        v.phone.toLowerCase().includes(q) ||
        v.tin.toLowerCase().includes(q);
      return matchesCategory && matchesStatus && matchesSearch;
    });

    if (activeTab === 'category') {
      data = [...data].sort((a, b) => a.category.localeCompare(b.category));
    } else if (activeTab === 'rating') {
      data = [...data].sort((a, b) => b.rating - a.rating);
    }
    return data;
  }, [vendors, categoryFilter, statusFilter, searchQuery, activeTab]);

  const pageCount = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));
  const safePage = Math.min(page, pageCount);
  const paginatedData = filteredData.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage);

  const handleResetFilters = () => {
    setCategoryFilter('All');
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

  const handleDeleteClick = (row) => {
    setVendorToDelete(row);
    setDeleteConfirmOpen(true);
    handleMenuClose();
  };

  const handleConfirmDelete = () => {
    setVendors((prev) => prev.filter((v) => v.id !== vendorToDelete.id));
    if (selectedVendor?.id === vendorToDelete.id) {
      const remaining = vendors.filter((v) => v.id !== vendorToDelete.id);
      setSelectedVendor(remaining[0] || null);
    }
    setDeleteConfirmOpen(false);
    setVendorToDelete(null);
  };

  const handleAddVendorSubmit = (data) => {
    const newVendor = {
      ...data,
      id: `${Date.now()}`,
      transactions: 0,
      totalSpend: 0,
      rating: 0,
      yearsActive: 0,
    };
    setVendors((prev) => [newVendor, ...prev]);
    setSelectedVendor(newVendor);
  };

  const handleEditVendorSubmit = (data) => {
    setVendors((prev) =>
      prev.map((v) => (v.id === vendorToEdit.id ? { ...v, ...data } : v)),
    );
    if (selectedVendor?.id === vendorToEdit.id) {
      setSelectedVendor((prev) => ({ ...prev, ...data }));
    }
  };

  const selectedMeta = selectedVendor ? VENDOR_CATEGORY_META[selectedVendor.category] : null;
  const SelectedIcon = selectedMeta?.icon;
  const selectedStatusMeta = selectedVendor ? STATUS_META[selectedVendor.status] : null;

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
              variant="outlined"
              color="inherit"
              onClick={(e) => setCategoriesMenuAnchor(e.currentTarget)}
              startIcon={<IconSettings size={16} />}
              endIcon={<IconChevronDown size={14} />}
              sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, whiteSpace: 'nowrap' }}
            >
              Manage Categories
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<IconUpload size={16} />}
              sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, whiteSpace: 'nowrap' }}
            >
              Import Vendors
            </Button>
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
                  <Tab icon={<IconCategory size={15} />} iconPosition="start" label="By Category" value="category" />
                  <Tab icon={<IconStar size={15} />} iconPosition="start" label="By Rating" value="rating" />
                </Tabs>
              </Box>

              <Grid container spacing={1.5} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, md: 5 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search vendor by name, email, phone or TIN..."
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
                      value={categoryFilter}
                      onChange={(e) => {
                        setCategoryFilter(e.target.value);
                        setPage(1);
                      }}
                      sx={{ borderRadius: '8px' }}
                    >
                      <MenuItem value="All">All Categories</MenuItem>
                      {VENDOR_CATEGORIES.map((cat) => (
                        <MenuItem key={cat} value={cat}>
                          {cat}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
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
                <Grid size={{ xs: 12, md: 2 }}>
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
                <Table size="small" sx={{ minWidth: 900 }}>
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
                      <TableCell sx={thCell}>Category</TableCell>
                      <TableCell sx={thCell}>Contact Person</TableCell>
                      <TableCell sx={thCell}>Phone / Email</TableCell>
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
                          {Array.from({ length: 7 }).map((__, cellIdx) => (
                            <TableCell key={cellIdx} sx={tdCell}>
                              <Skeleton variant="text" height={20} />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : paginatedData.length > 0 ? (
                      paginatedData.map((row, idx) => {
                        const meta = VENDOR_CATEGORY_META[row.category] || {};
                        const Icon = meta.icon;
                        const statusMeta = STATUS_META[row.status];
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
                                    bgcolor: meta.bg,
                                    color: meta.color,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                  }}
                                >
                                  {Icon && <Icon size={14} />}
                                </Box>
                                <Typography sx={{ fontWeight: 600, fontSize: 13 }}>{row.name}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell sx={tdCell}>
                              <Chip
                                label={row.category}
                                size="small"
                                sx={{
                                  bgcolor: meta.bg,
                                  color: meta.color,
                                  fontWeight: 700,
                                  borderRadius: '8px',
                                  fontSize: 11,
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ ...tdCell, fontSize: 12.5 }}>{row.contactPerson}</TableCell>
                            <TableCell sx={tdCell}>
                              <Typography sx={{ fontSize: 12.5 }}>{row.phone}</Typography>
                              <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>{row.email}</Typography>
                            </TableCell>
                            <TableCell sx={tdCell}>
                              <Chip
                                label={row.status}
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
                        <TableCell colSpan={7} align="center">
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
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconBuildingStore size={17} />
                      <Typography sx={{ fontWeight: 700, fontSize: 14 }}>Selected Vendor Information</Typography>
                    </Box>
                    <Button
                      size="small"
                      endIcon={<IconArrowRight size={13} />}
                      sx={{ color: '#fff', textTransform: 'none', fontWeight: 600, fontSize: 12 }}
                    >
                      View All
                    </Button>
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
                          bgcolor: selectedMeta?.bg,
                          color: selectedMeta?.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {SelectedIcon && <SelectedIcon size={22} />}
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography sx={{ fontWeight: 700, fontSize: 14.5 }}>{selectedVendor.name}</Typography>
                          <Chip
                            label={selectedVendor.status}
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
                        <Typography sx={{ fontSize: 11.5, color: 'text.secondary' }}>{selectedVendor.category}</Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.1 }}>
                      <DetailRow icon={IconUser} label="Contact Person" value={selectedVendor.contactPerson} theme={theme} />
                      <DetailRow icon={IconPhone} label="Phone" value={selectedVendor.phone} theme={theme} />
                      <DetailRow icon={IconMail} label="Email" value={selectedVendor.email} theme={theme} />
                      <DetailRow icon={IconId} label="TIN" value={selectedVendor.tin} theme={theme} />
                      <DetailRow icon={IconMapPin} label="Address" value={selectedVendor.address} theme={theme} />
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
                  <Grid size={3}>
                    <MiniStat icon={IconUsers} value={selectedVendor?.transactions ?? 0} label="Transactions" bg="#DBEAFE" color="#2563EB" />
                  </Grid>
                  <Grid size={3}>
                    <MiniStat icon={IconCoins} value={formatCompact(selectedVendor?.totalSpend ?? 0)} label="Total Spend" bg="#DCFCE7" color="#16A34A" />
                  </Grid>
                  <Grid size={3}>
                    <MiniStat icon={IconStar} value={`${selectedVendor?.rating ?? 0}/5`} label="Rating" bg="#F3E8FF" color="#9333EA" />
                  </Grid>
                  <Grid size={3}>
                    <MiniStat icon={IconCalendar} value={selectedVendor?.yearsActive ?? 0} label="Years" bg="#FEF3C7" color="#D97706" />
                  </Grid>
                </Grid>

                <Typography sx={{ fontWeight: 700, fontSize: 12.5, mb: 1 }}>Spend Trend (Last 12 Months)</Typography>
                <ReusableAreaChart
                  data={spendTrend}
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

                <Box sx={{ bgcolor: '#DCFCE7', borderRadius: '10px', p: 1.5, mt: 1.5 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: 12.5, mb: 0.75 }}>Quick Insights</Typography>
                  {quickInsights.map((text) => (
                    <Box key={text} sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75, mb: 0.5, '&:last-of-type': { mb: 0 } }}>
                      <IconCircleCheck size={13} color="#16A34A" style={{ marginTop: 2, flexShrink: 0 }} />
                      <Typography sx={{ fontSize: 11.5 }}>{text}</Typography>
                    </Box>
                  ))}
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
        <MenuItem onClick={() => handleDeleteClick(menuRow)} sx={{ color: 'error.main' }}>
          <IconTrash size={16} style={{ marginRight: 8 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Manage Categories menu — visual placeholder until that flow's design is given */}
      <Menu anchorEl={categoriesMenuAnchor} open={Boolean(categoriesMenuAnchor)} onClose={() => setCategoriesMenuAnchor(null)}>
        <MenuItem onClick={() => setCategoriesMenuAnchor(null)}>Add Category</MenuItem>
        <MenuItem onClick={() => setCategoriesMenuAnchor(null)}>Edit Categories</MenuItem>
        <MenuItem onClick={() => setCategoriesMenuAnchor(null)}>View All Categories</MenuItem>
      </Menu>

      <AddVendorModal open={addVendorOpen} onClose={() => setAddVendorOpen(false)} onSubmit={handleAddVendorSubmit} />
      <AddVendorModal
        open={editVendorOpen}
        onClose={() => setEditVendorOpen(false)}
        onSubmit={handleEditVendorSubmit}
        mode="edit"
        vendor={vendorToEdit}
      />

      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <b>{vendorToDelete?.name}</b>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" size="small" color="inherit" onClick={() => setDeleteConfirmOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" size="small" color="error" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default VendorProfile;
