import React, { useEffect, useMemo, useState } from 'react';
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
  Checkbox,
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
} from '@mui/material';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import ParentCard from '@/components/shared/ParentCard';
import StatCard from '@/components/shared/StatCard';
import {
  IconSearch,
  IconPlus,
  IconLayersIntersect,
  IconCircleCheck,
  IconCircleX,
  IconCirclePlus,
  IconUsers,
  IconLayoutGrid,
  IconEdit,
  IconTrash,
  IconFilter,
  IconArrowUp,
} from '@tabler/icons';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ChartOfAccountModal from './components/ChartOfAccountModal';
import { CATEGORIES, CATEGORY_META, ACCOUNT_TYPE_META, POSTING_ALLOWED_META } from './constants';

const BCrumb = [{ to: '/', title: 'Home' }, { title: 'Chart of Accounts' }];

const CREATORS = ['OA', 'AO'];

const mockAccounts = [
  {
    id: '1',
    code: '1.1',
    name: 'Cash at Bank',
    category: 'Assets',
    type: 'Detail',
    postingAllowed: true,
    description: 'Main school bank account',
    dateCreated: '2025-01-15',
    createdBy: 'OA',
    status: 'Active',
  },
  {
    id: '2',
    code: '1.2',
    name: 'Petty Cash',
    category: 'Assets',
    type: 'Detail',
    postingAllowed: true,
    description: 'Cash for minor operations',
    dateCreated: '2025-01-15',
    createdBy: 'OA',
    status: 'Active',
  },
  {
    id: '3',
    code: '1.3',
    name: 'Accounts Receivable (Student Fees)',
    category: 'Assets',
    type: 'Detail',
    postingAllowed: true,
    description: 'Outstanding student fees',
    dateCreated: '2025-01-16',
    createdBy: 'AO',
    status: 'Active',
  },
  {
    id: '4',
    code: '1.4',
    name: 'Fixed Assets - Furniture',
    category: 'Assets',
    type: 'Detail',
    postingAllowed: true,
    description: 'Furniture and fittings',
    dateCreated: '2025-01-18',
    createdBy: 'OA',
    status: 'Inactive',
  },
  {
    id: '5',
    code: '2.1',
    name: 'Accounts Payable',
    category: 'Liabilities',
    type: 'Detail',
    postingAllowed: true,
    description: 'Amounts owed to suppliers',
    dateCreated: '2025-01-16',
    createdBy: 'OA',
    status: 'Active',
  },
  {
    id: '6',
    code: '2.2',
    name: 'Accrued Expenses',
    category: 'Liabilities',
    type: 'Detail',
    postingAllowed: true,
    description: 'Expenses incurred but not yet paid',
    dateCreated: '2025-01-19',
    createdBy: 'AO',
    status: 'Active',
  },
  {
    id: '7',
    code: '3.1',
    name: 'Staff Salaries',
    category: 'Expenditure',
    type: 'Detail',
    postingAllowed: true,
    description: 'Salaries and related emoluments',
    dateCreated: '2025-01-17',
    createdBy: 'OA',
    status: 'Active',
  },
  {
    id: '8',
    code: '3.2',
    name: 'Pension Contribution',
    category: 'Expenditure',
    type: 'Detail',
    postingAllowed: true,
    description: 'Employer pension contribution',
    dateCreated: '2025-01-17',
    createdBy: 'AO',
    status: 'Active',
  },
  {
    id: '9',
    code: '3.3',
    name: 'Utilities',
    category: 'Expenditure',
    type: 'Detail',
    postingAllowed: true,
    description: 'Electricity, water and internet',
    dateCreated: '2025-01-20',
    createdBy: 'OA',
    status: 'Active',
  },
  {
    id: '10',
    code: '4.1',
    name: 'Tuition Fees',
    category: 'Income',
    type: 'Detail',
    postingAllowed: true,
    description: 'Fees from student tuition',
    dateCreated: '2025-01-17',
    createdBy: 'OA',
    status: 'Active',
  },
  {
    id: '11',
    code: '4.2',
    name: 'Other Income',
    category: 'Income',
    type: 'Detail',
    postingAllowed: true,
    description: 'Other school-generated income',
    dateCreated: '2025-01-18',
    createdBy: 'AO',
    status: 'Active',
  },
  {
    id: '12',
    code: '5.1',
    name: 'Owner Equity',
    category: 'Equity',
    type: 'Detail',
    postingAllowed: false,
    description: 'Proprietor capital contribution',
    dateCreated: '2025-01-15',
    createdBy: 'OA',
    status: 'Active',
  },
];

const ChartOfAccounts = () => {
  const theme = useTheme();

  const [loading, setLoading] = useState(true);
  const [accountsData, setAccountsData] = useState(mockAccounts);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  const [openAccountModal, setOpenAccountModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(timer);
  }, []);

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

  const handleOpenDelete = () => {
    setOpenDeleteModal(true);
    handleMenuClose();
  };

  const handleAccountSubmit = (data) => {
    if (modalMode === 'create') {
      setAccountsData([
        {
          ...data,
          id: `${Date.now()}`,
          dateCreated: new Date().toISOString().slice(0, 10),
          createdBy: 'OA',
        },
        ...accountsData,
      ]);
    } else {
      setAccountsData(
        accountsData.map((item) => (item.id === selectedRow.id ? { ...item, ...data } : item)),
      );
    }
  };

  const handleConfirmDelete = () => {
    setAccountsData(accountsData.filter((item) => item.id !== selectedRow.id));
    setOpenDeleteModal(false);
  };

  // ==================== Stats ====================
  const stats = useMemo(() => {
    const total = accountsData.length;
    const active = accountsData.filter((a) => a.status === 'Active').length;
    const inactive = total - active;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentlyCreated = accountsData.filter(
      (a) => new Date(a.dateCreated) >= thirtyDaysAgo,
    ).length;
    const creators = new Set(accountsData.map((a) => a.createdBy)).size;
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
      item.description.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const columnCount = 10;

  return (
    <PageContainer title="Chart of Accounts" description="Manage Chart of Accounts">
      <Box sx={{ mt: 1 }}>
        {/* <Breadcrumb title="Chart of Accounts" items={BCrumb} /> */}

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
              iconBg="#E2E8F0"
              iconColor="#475569"
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

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
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
                  <Button
                    variant="outlined"
                    color="inherit"
                    startIcon={<IconFilter size={16} />}
                    sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
                  >
                    Filter
                  </Button>
                </Box>
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
              <Table sx={{ minWidth: 1100 }}>
                <TableHead>
                  <TableRow
                    sx={{
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#F8FAFC',
                      '& .MuiTableCell-root': {
                        borderBottom: `2px solid ${theme.palette.divider}`,
                      },
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox size="small" />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        Code <IconArrowUp size={14} />
                      </Box>
                    </TableCell>
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
                      const typeMeta = ACCOUNT_TYPE_META[row.type] || ACCOUNT_TYPE_META.Detail;
                      const postingMeta = POSTING_ALLOWED_META[String(row.postingAllowed)];
                      return (
                        <TableRow key={row.id} hover>
                          <TableCell padding="checkbox">
                            <Checkbox size="small" />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{row.code}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{row.name}</TableCell>
                          <TableCell>
                            <Chip
                              label={row.category}
                              size="small"
                              sx={{
                                bgcolor: meta.bg,
                                color: meta.color,
                                fontWeight: 700,
                                borderRadius: '8px',
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={row.type}
                              size="small"
                              sx={{
                                bgcolor: typeMeta.bg,
                                color: typeMeta.color,
                                fontWeight: 700,
                                borderRadius: '8px',
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={row.postingAllowed ? 'Yes' : 'No'}
                              size="small"
                              sx={{
                                bgcolor: postingMeta.bg,
                                color: postingMeta.color,
                                fontWeight: 700,
                                borderRadius: '8px',
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ color: 'text.secondary', maxWidth: 220 }}>
                            {row.description}
                          </TableCell>
                          <TableCell sx={{ color: 'text.secondary' }}>
                            {new Date(row.dateCreated).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{row.createdBy}</TableCell>
                          <TableCell>
                            <Chip
                              label={row.status}
                              size="small"
                              color={row.status === 'Active' ? 'success' : 'default'}
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
                      colSpan={columnCount + 1}
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
        <MenuItem onClick={handleOpenDelete} sx={{ color: 'error.main' }}>
          <IconTrash size={18} style={{ marginRight: 8 }} />
          Delete
        </MenuItem>
      </Menu>

      <ChartOfAccountModal
        open={openAccountModal}
        onClose={() => setOpenAccountModal(false)}
        mode={modalMode}
        selectedRow={selectedRow}
        onSubmit={handleAccountSubmit}
        existingAccounts={accountsData}
      />

      <Dialog
        open={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this account? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            size="small"
            onClick={() => setOpenDeleteModal(false)}
            color="inherit"
          >
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

export default ChartOfAccounts;
