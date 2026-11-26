import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  useTheme,
  TablePagination,
  TableFooter,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Skeleton,
  Menu,
  MenuItem,
  Snackbar,
} from '@mui/material';
import PageContainer from '@/components/container/PageContainer';
import ParentCard from '@/components/shared/ParentCard';
import StatCard from '@/components/shared/StatCard';
import tenantApi from '@/api/tenant/tenant_api';
import {
  IconSearch,
  IconPlus,
  IconLayersIntersect,
  IconCircleCheck,
  IconCircleX,
  IconCirclePlus,
  IconLayoutGrid,
  IconEdit,
  IconBan,
  IconRotate,
  IconUsers,
} from '@tabler/icons';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ChartOfAccountModal from './components/ChartOfAccountModal';
import { CATEGORIES, CATEGORY_META, CATEGORY_LABEL_FROM_API, classificationLabel } from './constants';

// Detail accounts sit directly under their root category now — no
// classification header level to walk through any more (see the backend's
// ChartOfAccountSeeder docblock for why).
const flattenDetailRows = (roots) => {
  const rows = [];
  (roots || []).forEach((root) => {
    const category = CATEGORY_LABEL_FROM_API[root.category];
    (root.children || []).forEach((detail) => {
      rows.push({
        id: detail.id,
        code: detail.code,
        name: detail.name,
        description: detail.description,
        category,
        classificationKey: detail.classification,
        classification: classificationLabel(category, detail.classification),
        nodeType: detail.node_type,
        postingAllowed: detail.posting_allowed,
        isActive: detail.is_active,
        isSystem: detail.is_system,
        createdAt: detail.created_at,
        // Eager-loaded as the `createdBy` relation (see getChartOfAccounts),
        // which Laravel serializes under the same snake_case key as the
        // raw created_by column — the relation object wins that collision,
        // so this is the {id, fname, lname} user, not the bare uuid.
        createdBy: detail.created_by,
      });
    });
  });
  return rows;
};

// { [categoryLabel]: rootNodeId } — the real chart_of_accounts row id for
// each of the 5 seeded root categories, so submitting a new detail account
// can send the right parent category.
const buildCategoryRootMap = (roots) => {
  const map = {};
  (roots || []).forEach((root) => {
    map[CATEGORY_LABEL_FROM_API[root.category]] = root.id;
  });
  return map;
};

function initials(user) {
  if (!user) return '—';
  return `${(user.fname || '').charAt(0)}${(user.lname || '').charAt(0)}`.toUpperCase() || '—';
}

function formatDateShort(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

const ChartOfAccounts = () => {
  const theme = useTheme();

  const [loading, setLoading] = useState(true);
  const [roots, setRoots] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  const [openAccountModal, setOpenAccountModal] = useState(false);
  const [openStatusModal, setOpenStatusModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchTree = useCallback(() => {
    setLoading(true);
    tenantApi
      .get('/chart_of_accounts/fetch_tree')
      .then((res) => setRoots(res.data?.data || []))
      .catch(() =>
        setSnackbar({ open: true, message: 'Could not load the chart of accounts.', severity: 'error' }),
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  const accountsData = useMemo(() => flattenDetailRows(roots), [roots]);
  const categoryRootMap = useMemo(() => buildCategoryRootMap(roots), [roots]);

  const handleMenuOpen = (event, row) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => setAnchorEl(null);

  const handleOpenAdd = () => {
    setModalMode('create');
    setSelectedRow(null);
    setOpenAccountModal(true);
  };

  const handleOpenEdit = () => {
    setModalMode('edit');
    setOpenAccountModal(true);
    handleMenuClose();
  };

  const handleOpenStatusConfirm = () => {
    setOpenStatusModal(true);
    handleMenuClose();
  };

  const handleAccountSubmit = (payload) => {
    setSubmitting(true);
    const request =
      modalMode === 'create'
        ? tenantApi.post('/chart_of_accounts/create_account', payload)
        : tenantApi.put(`/chart_of_accounts/update_account/${payload.id}`, {
            name: payload.name,
            description: payload.description,
            posting_allowed: payload.posting_allowed,
            is_active: payload.is_active,
          });

    request
      .then(() => {
        setOpenAccountModal(false);
        setSnackbar({
          open: true,
          message: modalMode === 'create' ? 'Account created.' : 'Account updated.',
          severity: 'success',
        });
        fetchTree();
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

  const handleConfirmStatusToggle = () => {
    tenantApi
      .put(`/chart_of_accounts/toggle_account_status/${selectedRow.id}`)
      .then(() => {
        setOpenStatusModal(false);
        setSnackbar({
          open: true,
          message: selectedRow.isActive ? 'Account deactivated.' : 'Account activated.',
          severity: 'success',
        });
        fetchTree();
      })
      .catch((err) =>
        setSnackbar({
          open: true,
          message: err.response?.data?.message || 'Something went wrong. Please try again.',
          severity: 'error',
        }),
      );
  };

  // ==================== Stats ====================
  const stats = useMemo(() => {
    const total = accountsData.length;
    const active = accountsData.filter((a) => a.isActive).length;
    const inactive = total - active;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentlyCreated = accountsData.filter(
      (a) => a.createdAt && new Date(a.createdAt) >= thirtyDaysAgo,
    ).length;
    const creators = new Set(accountsData.filter((a) => a.createdBy?.id).map((a) => a.createdBy.id)).size;
    return { total, active, inactive, recentlyCreated, creators };
  }, [accountsData]);

  const categoryCounts = useMemo(() => {
    const counts = { All: accountsData.length };
    CATEGORIES.forEach((cat) => {
      counts[cat] = accountsData.filter((a) => a.category === cat).length;
    });
    return counts;
  }, [accountsData]);

  // ==================== Filtering ====================
  const filteredData = accountsData.filter((item) => {
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.code.toLowerCase().includes(q) ||
      (item.description || '').toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const columnCount = 10;

  return (
    <PageContainer title="Chart of Accounts" description="Manage Chart of Accounts">
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
              <IconLayersIntersect size={24} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: { xs: 18, md: 22 }, fontWeight: 700 }}>
                Chart of Accounts
              </Typography>
              <Typography sx={{ fontSize: 13.5, color: 'text.secondary' }}>
                Set up and manage the school&apos;s list of accounts for financial posting and
                reporting.
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            onClick={handleOpenAdd}
            startIcon={<IconPlus size={18} />}
            sx={{
              borderRadius: '8px',
              px: 2.5,
              py: 1,
              textTransform: 'none',
              fontWeight: 700,
              whiteSpace: 'nowrap',
            }}
          >
            Add Account
          </Button>
        </Box>

        {/* ===================== Stat cards ===================== */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
            <StatCard
              loading={loading}
              label="Total Accounts"
              count={stats.total}
              icon={IconLayersIntersect}
              colorIndex={0}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
            <StatCard
              loading={loading}
              label="Active Accounts"
              count={stats.active}
              icon={IconCircleCheck}
              colorIndex={1}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
            <StatCard
              loading={loading}
              label="Inactive Accounts"
              count={stats.inactive}
              icon={IconCircleX}
              colorIndex={4}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
            <StatCard
              loading={loading}
              label="Recently Created"
              subtitle="Last 30 days"
              count={stats.recentlyCreated}
              icon={IconCirclePlus}
              colorIndex={2}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
            <StatCard
              loading={loading}
              label="Account Creators"
              count={stats.creators}
              icon={IconUsers}
              colorIndex={3}
            />
          </Grid>
        </Grid>

        <ParentCard
          title={
            <Box>
              {/* ===================== Category filter pills ===================== */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25, mb: 2 }}>
                <Chip
                  icon={
                    <IconLayoutGrid
                      size={16}
                      color={categoryFilter === 'All' ? '#fff' : theme.palette.text.secondary}
                    />
                  }
                  label={`All Accounts (${categoryCounts.All})`}
                  onClick={() => setCategoryFilter('All')}
                  sx={{
                    height: 38,
                    px: 0.5,
                    fontWeight: 700,
                    fontSize: 13.5,
                    borderRadius: '10px',
                    bgcolor:
                      categoryFilter === 'All'
                        ? theme.palette.primary.main
                        : theme.palette.action.hover,
                    color: categoryFilter === 'All' ? '#fff' : 'text.primary',
                    '&:hover': {
                      bgcolor:
                        categoryFilter === 'All'
                          ? theme.palette.primary.dark
                          : theme.palette.action.selected,
                    },
                  }}
                />
                {CATEGORIES.map((cat) => {
                  const meta = CATEGORY_META[cat];
                  const Icon = meta.icon;
                  const selected = categoryFilter === cat;
                  return (
                    <Chip
                      key={cat}
                      icon={<Icon size={16} color={meta.color} />}
                      label={`${cat} (${categoryCounts[cat]})`}
                      onClick={() => setCategoryFilter(cat)}
                      sx={{
                        height: 38,
                        px: 0.5,
                        fontWeight: 700,
                        fontSize: 13.5,
                        borderRadius: '10px',
                        bgcolor: meta.bg,
                        color: meta.color,
                        border: selected ? `2px solid ${meta.color}` : '2px solid transparent',
                        '&:hover': { bgcolor: meta.bg },
                      }}
                    />
                  );
                })}
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: { xs: 'flex-start', md: 'center' },
                  flexDirection: { xs: 'column', md: 'row' },
                  justifyContent: 'space-between',
                  gap: 2,
                }}
              >
                <Typography sx={{ fontWeight: 700, fontSize: 17 }}>
                  Accounts List ({filteredData.length})
                </Typography>

                <TextField
                  variant="outlined"
                  size="small"
                  placeholder="Search by code, name or description..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(0);
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconSearch size={18} />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: '8px', minWidth: '280px' },
                  }}
                />
              </Box>
            </Box>
          }
          sx={{
            '& .MuiCardHeader-root': { pb: 1, pt: 1.5, px: 2 },
            '& .MuiCardContent-root': { p: 1.5, '&:last-child': { pb: 1.5 } },
          }}
        >
          <Box>
            <TableContainer>
              <Table sx={{ minWidth: 900 }}>
                <TableHead>
                  <TableRow
                    sx={{
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#F8FAFC',
                      '& .MuiTableCell-root': {
                        borderBottom: `2px solid ${theme.palette.divider}`,
                      },
                    }}
                  >
                    <TableCell sx={{ fontWeight: 700 }}>Code</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Account Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Account Type</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Posting Allowed</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Date Created</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Created By</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="center">
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 6 }).map((_, idx) => (
                      <TableRow key={idx}>
                        {Array.from({ length: columnCount }).map((__, cellIdx) => (
                          <TableCell key={cellIdx}>
                            <Skeleton variant="text" height={24} />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : paginatedData.length > 0 ? (
                    paginatedData.map((row) => {
                      const meta = CATEGORY_META[row.category] || {};
                      return (
                        <TableRow key={row.id} hover>
                          <TableCell sx={{ fontWeight: 600 }}>{row.code}</TableCell>
                          <TableCell>
                            <Typography sx={{ fontWeight: 600, fontSize: 13.5 }}>{row.name}</Typography>
                            <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>{row.classification}</Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={row.category}
                              size="small"
                              sx={{ bgcolor: meta.bg, color: meta.color, fontWeight: 700, borderRadius: '8px' }}
                            />
                          </TableCell>
                          <TableCell sx={{ color: 'text.secondary' }}>
                            {row.nodeType === 'detail' ? 'Detail' : 'Header'}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={row.postingAllowed ? 'Yes' : 'No'}
                              size="small"
                              sx={{
                                bgcolor: row.postingAllowed ? '#DCFCE7' : '#F1F5F9',
                                color: row.postingAllowed ? '#15803D' : '#64748B',
                                fontWeight: 700,
                                borderRadius: '8px',
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ color: 'text.secondary', maxWidth: 220 }}>
                            {row.description || '—'}
                          </TableCell>
                          <TableCell sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
                            {formatDateShort(row.createdAt)}
                          </TableCell>
                          <TableCell sx={{ color: 'text.secondary' }}>{initials(row.createdBy)}</TableCell>
                          <TableCell>
                            <Chip
                              label={row.isActive ? 'Active' : 'Inactive'}
                              size="small"
                              color={row.isActive ? 'success' : 'default'}
                              sx={{ fontWeight: 700, borderRadius: '8px' }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <IconButton onClick={(e) => handleMenuOpen(e, row)}>
                              <MoreVertIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columnCount} align="center">
                        <Alert
                          severity="info"
                          sx={{
                            mb: 3,
                            justifyContent: 'center',
                            textAlign: 'center',
                            '& .MuiAlert-icon': { mr: 1.5 },
                          }}
                        >
                          {searchQuery
                            ? 'No records match the current search.'
                            : 'No accounts found. Add one to get started.'}
                        </Alert>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>

                <TableFooter>
                  <TableRow>
                    <TablePagination
                      colSpan={columnCount}
                      rowsPerPageOptions={[5, 10, 25]}
                      count={filteredData.length}
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
        </ParentCard>
      </Box>

      {/* Row action menu — single shared instance, anchored to whichever row was clicked */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleOpenEdit}>
          <IconEdit size={18} style={{ marginRight: 8 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleOpenStatusConfirm} sx={{ color: selectedRow?.isActive ? 'error.main' : 'success.main' }}>
          {selectedRow?.isActive ? (
            <IconBan size={18} style={{ marginRight: 8 }} />
          ) : (
            <IconRotate size={18} style={{ marginRight: 8 }} />
          )}
          {selectedRow?.isActive ? 'Deactivate' : 'Activate'}
        </MenuItem>
      </Menu>

      <ChartOfAccountModal
        open={openAccountModal}
        onClose={() => setOpenAccountModal(false)}
        mode={modalMode}
        selectedRow={selectedRow}
        onSubmit={handleAccountSubmit}
        categoryRootMap={categoryRootMap}
        submitting={submitting}
      />

      <Dialog
        open={openStatusModal}
        onClose={() => setOpenStatusModal(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>{selectedRow?.isActive ? 'Deactivate Account' : 'Activate Account'}</DialogTitle>
        <DialogContent>
          <Typography>
            {selectedRow?.isActive
              ? `Once deactivated, "${selectedRow?.name}" can no longer be used for new postings anywhere in the app. Existing postings are unaffected.`
              : `"${selectedRow?.name}" will become available for new postings again.`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" size="small" onClick={() => setOpenStatusModal(false)} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            size="small"
            color={selectedRow?.isActive ? 'error' : 'success'}
            onClick={handleConfirmStatusToggle}
          >
            {selectedRow?.isActive ? 'Deactivate' : 'Activate'}
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

export default ChartOfAccounts;
