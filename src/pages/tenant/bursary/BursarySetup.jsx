import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  MenuItem,
  TextField,
  Tabs,
  Tab,
  Stack,
  Switch,
  Tooltip,
  Alert,
  Snackbar,
  CircularProgress,
  Menu,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  IconSettings,
  IconFileText,
  IconPlus,
  IconEdit,
  IconTrash,
  IconCreditCard,
  IconDotsVertical,
  IconCheck,
  IconX,
} from '@tabler/icons-react';
import {
  Settings as SettingsIcon,
  CreditCard as CreditCardIcon,
  CheckCircle as CheckCircleIcon,
  Category as CategoryIcon,
  Verified as VerifiedIcon,
  Payments as PaymentsIcon,
  TaskAlt as TaskAltIcon,
} from '@mui/icons-material';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import ParentCard from '@/components/shared/ParentCard';
import StatCard from '@/components/shared/StatCard';
import CategoryModal from '@/components/tenant/bursary/CategoryModal';
import InstalmentModal from '@/components/tenant/bursary/InstalmentModal';

const BCrumb = [{ to: '/', title: 'Home' }, { title: 'Bursary Setup' }];

const StatusChip = ({ status }) => {
  const isActive = status === 'active';
  return (
    <Chip
      label={isActive ? 'Active' : 'Inactive'}
      size="small"
      sx={{
        bgcolor: isActive ? 'success.light' : 'error.light',
        color: isActive ? 'success.dark' : 'error.dark',
        fontWeight: 600,
        fontSize: 11,
      }}
    />
  );
};

const BursarySetup = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Session & Term
  const [sessionTerms, setSessionTerms] = useState([]);
  const [selectedSessionTerm, setSelectedSessionTerm] = useState('');

  // Collection Setup
  const [collectionMethod, setCollectionMethod] = useState('single');
  const [instalmentStyle, setInstalmentStyle] = useState('percentage');
  const [gatewayPayer, setGatewayPayer] = useState('parent');

  // Payment Categories
  const [categories, setCategories] = useState([
    {
      id: 1,
      name: 'Returning Students',
      description: 'Students who are not meant to pay school fees',
      status: 'active',
    },
    {
      id: 2,
      name: 'Scholarship',
      description: 'Students who are not meant to pay school fees',
      status: 'active',
    },
    {
      id: 3,
      name: 'Scholarship',
      description: 'Students who are not meant to pay school fees',
      status: 'inactive',
    },
    { id: 4, name: 'Staff ward', description: 'Staffward', status: 'inactive' },
    { id: 5, name: 'Staff ward', description: 'Staffward', status: 'inactive' },
  ]);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryMenuAnchor, setCategoryMenuAnchor] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [instalments, setInstalments] = useState([
    { id: 1, options: '60 : 40', status: 'active' },
    { id: 2, options: '70 : 30', status: 'active' },
    { id: 3, options: '50 : 50', status: 'active' },
    { id: 4, options: '100 : 0', status: 'active' },
    { id: 5, options: '80 : 20', status: 'inactive' },
  ]);
  const [instalmentModalOpen, setInstalmentModalOpen] = useState(false);
  const [editingInstalment, setEditingInstalment] = useState(null);
  const [instalmentMenuAnchor, setInstalmentMenuAnchor] = useState(null);
  const [selectedInstalment, setSelectedInstalment] = useState(null);

  const [requirePaymentForResults, setRequirePaymentForResults] = useState(true);

  // Stats data for different tabs
  const bursaryStats = {
    totalCategories: categories.length,
    activeCategories: categories.filter((c) => c.status === 'active').length,
    totalInstalments: instalments.length,
    activeInstalments: instalments.filter((i) => i.status === 'active').length,
  };

  const paymentNameStats = {
    totalItems: 164,
    compulsory: 98,
    optional: 66,
    active: 164,
    inactive: 0,
    settlementAccounts: {
      total: 164,
      gtb: 98,
      fcmb: 98,
      wema: 98,
    },
    feeBearer: {
      total: 164,
      client: 400,
      student: 0,
    },
  };

  useEffect(() => {
    loadSessionTerms();
  }, []);

  const loadSessionTerms = () => {
    // Mock data - replace with actual API call
    setSessionTerms([
      { id: 1, label: '2024/2025 - First Term' },
      { id: 2, label: '2024/2025 - Second Term' },
      { id: 3, label: '2024/2025 - Third Term' },
    ]);
    setSelectedSessionTerm(1);
  };

  const showSnackbar = (message, severity = 'success') =>
    setSnackbar({ open: true, message, severity });

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setCategoryModalOpen(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryModalOpen(true);
    setCategoryMenuAnchor(null);
  };

  const handleToggleCategoryStatus = (category) => {
    const newStatus = category.status === 'active' ? 'inactive' : 'active';
    setCategories((prev) =>
      prev.map((c) => (c.id === category.id ? { ...c, status: newStatus } : c)),
    );
    showSnackbar(`Category ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
    setCategoryMenuAnchor(null);
  };

  const handleDeleteCategory = (id) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    showSnackbar('Category deleted successfully');
  };

  const handleSaveCategory = (categoryData) => {
    if (editingCategory) {
      setCategories((prev) =>
        prev.map((c) => (c.id === editingCategory.id ? { ...c, ...categoryData } : c)),
      );
      showSnackbar('Category updated successfully');
    } else {
      setCategories((prev) => [...prev, { id: Date.now(), ...categoryData }]);
      showSnackbar('Category added successfully');
    }
    setCategoryModalOpen(false);
  };

  const handleAddInstalment = () => {
    setEditingInstalment(null);
    setInstalmentModalOpen(true);
  };

  const handleEditInstalment = (instalment) => {
    setEditingInstalment(instalment);
    setInstalmentModalOpen(true);
    setInstalmentMenuAnchor(null);
  };

  const handleToggleInstalmentStatus = (instalment) => {
    const newStatus = instalment.status === 'active' ? 'inactive' : 'active';
    setInstalments((prev) =>
      prev.map((i) => (i.id === instalment.id ? { ...i, status: newStatus } : i)),
    );
    showSnackbar(`Instalment plan ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
    setInstalmentMenuAnchor(null);
  };

  const handleDeleteInstalment = (id) => {
    setInstalments((prev) => prev.filter((i) => i.id !== id));
    showSnackbar('Instalment plan deleted successfully');
  };

  const handleSaveInstalment = (instalmentData) => {
    if (editingInstalment) {
      setInstalments((prev) =>
        prev.map((i) => (i.id === editingInstalment.id ? { ...i, ...instalmentData } : i)),
      );
      showSnackbar('Instalment plan updated successfully');
    } else {
      setInstalments((prev) => [...prev, { id: Date.now(), ...instalmentData }]);
      showSnackbar('Instalment plan added successfully');
    }
    setInstalmentModalOpen(false);
  };

  return (
    <PageContainer title="Bursary Setup" description="Configure fees and payment settings">
      <Breadcrumb
  title="Bursary Setup"
  subtitle="Configure how fees are collected for the current term"
  items={BCrumb}
/>

      {/* <Typography variant="subtitle1" color="textSecondary" mb={3}>
        Configure how fees are collected for the current term
      </Typography> */}

      {/* Stats Cards - Dynamic based on active tab */}
      {currentTab === 0 ? (
        // Bursary Setup Stats
        <Grid container spacing={3} mb={3}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              count={bursaryStats.totalCategories}
              label="Total Categories"
              icon={SettingsIcon}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              count={bursaryStats.activeCategories}
              label="Active Categories"
              icon={CheckCircleIcon}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              count={bursaryStats.totalInstalments}
              label="Instalment Plans"
              icon={CreditCardIcon}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              count={bursaryStats.activeInstalments}
              label="Active Plans"
              icon={CheckCircleIcon}
            />
          </Grid>
        </Grid>
      ) : (
        // Payment Name Stats
        <Grid container spacing={3} mb={3}>
       
          {/* Settlement Accounts Card */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Total Payment Items
              </Typography>
              <Typography variant="h2" fontWeight={700} color="primary.main" mb={2}>
                {paymentNameStats.totalItems}
              </Typography>
              <Grid container spacing={2} mb={2}>
                <Grid size={{ xs: 3 }}>
                  <Typography variant="caption" color="textSecondary">
                    Compulsory
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {paymentNameStats.compulsory}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 3 }}>
                  <Typography variant="caption" color="textSecondary">
                    Optional
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {paymentNameStats.optional}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 3 }}>
                  <Typography variant="caption" color="textSecondary">
                    Active
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {paymentNameStats.active}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 3 }}>
                  <Typography variant="caption" color="textSecondary">
                    Inactive
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {paymentNameStats.inactive}
                  </Typography>
                </Grid>
              </Grid>
              <Box display="flex" alignItems="center" gap={1}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: 'success.main',
                  }}
                />
                <Typography variant="caption" color="textSecondary">
                  All payment items are currently
                </Typography>
              </Box>
            </Paper>
          </Grid>

           <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Settlement Accounts
              </Typography>
              <Typography variant="h2" fontWeight={700} color="primary.main" mb={2}>
                {paymentNameStats.settlementAccounts.total}
              </Typography>
              <Grid container spacing={2} mb={2}>
                <Grid size={{ xs: 4 }}>
                  <Typography variant="caption" color="textSecondary">
                    GTB
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {paymentNameStats.settlementAccounts.gtb} Items
                  </Typography>
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <Typography variant="caption" color="textSecondary">
                    FCMB
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {paymentNameStats.settlementAccounts.fcmb} Items
                  </Typography>
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <Typography variant="caption" color="textSecondary">
                    Wema
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {paymentNameStats.settlementAccounts.wema} Items
                  </Typography>
                </Grid>
              </Grid>
              <Box display="flex" alignItems="center" gap={1}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: 'success.main',
                  }}
                />
                <Typography variant="caption" color="textSecondary">
                  GTB is the most Useeland Settlement account
                </Typography>
              </Box>
            </Paper>
          </Grid>
           <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" fontWeight={600} mb={2}>
               Fee Bearer Distribution
              </Typography>
              <Typography variant="h2" fontWeight={700} color="primary.main" mb={2}>
                {paymentNameStats.feeBearer.total}
              </Typography>
              <Grid container spacing={2} mb={2}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="textSecondary">
                    Client
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {paymentNameStats.feeBearer.client}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="textSecondary">
                    Student
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {paymentNameStats.feeBearer.student}
                  </Typography>
                </Grid>
              </Grid>
              <Box display="flex" alignItems="center" gap={1}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: 'success.main',
                  }}
                />
                <Typography variant="caption" color="textSecondary">
                  GTB is the most Useeland Settlement account
                </Typography>
              </Box>
            </Paper>
          </Grid>

        </Grid>
      )}

      {/* Tab Navigation */}
      <Box sx={{ mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Tab
            label="Bursary Setup"
            icon={<IconSettings size={18} />}
            iconPosition="start"
            sx={{ textTransform: 'none', fontWeight: 600 }}
          />
          <Tab
            label="Payment Name"
            icon={<IconFileText size={18} />}
            iconPosition="start"
            sx={{ textTransform: 'none', fontWeight: 600 }}
          />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {currentTab === 0 && (
        <Stack spacing={3}>
          {/* Session Term Selection */}
          <ParentCard title="Select Session Term">
            <TextField
              select
              label="Select Session Term"
              value={selectedSessionTerm}
              onChange={(e) => setSelectedSessionTerm(e.target.value)}
              size="small"
            >
              {sessionTerms.map((term) => (
                <MenuItem key={term.id} value={term.id}>
                  {term.label}
                </MenuItem>
              ))}
            </TextField>

            <Box display="flex" alignItems="flex-start" gap={2} mb={3} mt={2}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  bgcolor: 'primary.light',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <PaymentsIcon
                  sx={{
                    fontSize: 20,
                    color: 'primary.main',
                  }}
                />
              </Box>

              <Box>
                <Typography variant="h6" fontWeight={600}>
                  How should fees be collected?
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Choose how parents pay and who covers the gateway charges.
                </Typography>
              </Box>
            </Box>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Box
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 3,
                    p: 2,
                    height: '100%',
                  }}
                >
                  <FormControl fullWidth>
                    <FormLabel
                      sx={{
                        fontWeight: 600,
                        color: 'text.primary',
                        mb: 2,
                      }}
                    >
                      Collection method
                    </FormLabel>

                    <RadioGroup
                      value={collectionMethod}
                      onChange={(e) => setCollectionMethod(e.target.value)}
                    >
                      <Stack spacing={2}>
                        <FormControlLabel
                          value="single"
                          control={<Radio />}
                          label={
                            <Box>
                              <Typography variant="h5" fontWeight={600}>
                                Single payment
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                All fees collected together in one transaction.
                              </Typography>
                            </Box>
                          }
                          sx={{
                            m: 0,
                            p: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                            alignItems: 'flex-start',
                          }}
                        />

                        <FormControlLabel
                          value="per_fee"
                          control={<Radio />}
                          label={
                            <Box>
                              <Typography variant="h5" fontWeight={600}>
                                Pay per fee
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Each fee is processed separately.
                              </Typography>
                            </Box>
                          }
                          sx={{
                            m: 0,
                            p: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                            alignItems: 'flex-start',
                          }}
                        />
                      </Stack>
                    </RadioGroup>
                  </FormControl>
                </Box>
              </Grid>

              {/* Installment Style */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Box
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 3,
                    p: 2,
                    height: '100%',
                  }}
                >
                  <FormControl fullWidth>
                    <FormLabel
                      sx={{
                        fontWeight: 600,
                        color: 'text.primary',
                        mb: 2,
                      }}
                    >
                      Installment style
                    </FormLabel>

                    <RadioGroup
                      value={instalmentStyle}
                      onChange={(e) => setInstalmentStyle(e.target.value)}
                    >
                      <Stack spacing={2}>
                        <FormControlLabel
                          value="percentage"
                          control={<Radio />}
                          label={
                            <Box>
                              <Typography variant="h5" fontWeight={600}>
                                By percentage
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                e.g. 60% now, 40% later.
                              </Typography>
                            </Box>
                          }
                          sx={{
                            m: 0,
                            p: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                            alignItems: 'flex-start',
                          }}
                        />

                        <FormControlLabel
                          value="amount"
                          control={<Radio />}
                          label={
                            <Box>
                              <Typography variant="h5" fontWeight={600}>
                                By amount
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Pay any amount, anytime.
                              </Typography>
                            </Box>
                          }
                          sx={{
                            m: 0,
                            p: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                            alignItems: 'flex-start',
                          }}
                        />
                      </Stack>
                    </RadioGroup>
                  </FormControl>
                </Box>
              </Grid>

              {/* Gateway Charges */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Box
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 3,
                    p: 2,
                    height: '100%',
                  }}
                >
                  <FormControl fullWidth>
                    <FormLabel
                      sx={{
                        fontWeight: 600,
                        color: 'text.primary',
                        mb: 2,
                      }}
                    >
                      Who pays gateway charges?
                    </FormLabel>

                    <RadioGroup
                      value={gatewayPayer}
                      onChange={(e) => setGatewayPayer(e.target.value)}
                    >
                      <Stack spacing={2}>
                        <FormControlLabel
                          value="parent"
                          control={<Radio />}
                          label={
                            <Box>
                              <Typography variant="h5" fontWeight={600}>
                                Parent / Student
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Charges added on top of the fee.
                              </Typography>
                            </Box>
                          }
                          sx={{
                            m: 0,
                            p: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                            alignItems: 'flex-start',
                          }}
                        />

                        <FormControlLabel
                          value="school"
                          control={<Radio />}
                          label={
                            <Box>
                              <Typography variant="h5" fontWeight={600}>
                                School
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                School absorbs the charges.
                              </Typography>
                            </Box>
                          }
                          sx={{
                            m: 0,
                            p: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                            alignItems: 'flex-start',
                          }}
                        />
                      </Stack>
                    </RadioGroup>
                  </FormControl>
                </Box>
              </Grid>
            </Grid>
          </ParentCard>

          <Grid container spacing={3}>
            {/* Payment Categories */}
            <Grid size={{ xs: 12, md: 6 }}>
              <ParentCard
                title={
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                          bgcolor: 'primary.light',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'primary.main',
                        }}
                      >
                        <PaymentsIcon size={20} />
                      </Box>

                      <Box>
                        <Typography variant="h6">Payment categories</Typography>

                        <Typography variant="caption" color="text.secondary">
                          Target students for waivers, etc.
                        </Typography>
                      </Box>
                    </Box>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<IconPlus size={18} />}
                      onClick={handleAddCategory}
                      sx={{ fontWeight: 600 }}
                    >
                      Add Category
                    </Button>
                  </Box>
                }
              >
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, width: 60 }}>#</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700, width: 100 }}>
                          Status
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700, width: 60 }}>
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {categories.map((category, index) => (
                        <TableRow key={category.id} hover>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{category.name}</TableCell>
                          <TableCell>{category.description}</TableCell>

                          <TableCell align="center">
                            <StatusChip status={category.status} />
                          </TableCell>

                          <TableCell align="center">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                setCategoryMenuAnchor(e.currentTarget);
                                setSelectedCategory(category);
                              }}
                            >
                              <IconDotsVertical size={18} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </ParentCard>
            </Grid>

            {/* Installment Plans */}
            <Grid size={{ xs: 12, md: 6 }}>
              <ParentCard
                title={
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                          bgcolor: 'primary.light',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'primary.main',
                        }}
                      >
                        <TaskAltIcon size={20} />
                      </Box>

                      <Box>
                        <Typography variant="h6">Installment plans</Typography>

                        <Typography variant="caption" color="text.secondary">
                          Split options parents can pick from.
                        </Typography>
                      </Box>
                    </Box>

                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<IconPlus size={18} />}
                      onClick={handleAddInstalment}
                      sx={{ fontWeight: 600 }}
                    >
                      Add New
                    </Button>
                  </Box>
                }
              >
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, width: 60 }}>#</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Installment Options (%)</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700, width: 100 }}>
                          Status
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700, width: 60 }}>
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {instalments.map((instalment, index) => (
                        <TableRow key={instalment.id} hover>
                          <TableCell>{index + 1}</TableCell>

                          <TableCell>{instalment.options}</TableCell>

                          <TableCell align="center">
                            <StatusChip status={instalment.status} />
                          </TableCell>

                          <TableCell align="center">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                setInstalmentMenuAnchor(e.currentTarget);
                                setSelectedInstalment(instalment);
                              }}
                            >
                              <IconDotsVertical size={18} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </ParentCard>
            </Grid>
          </Grid>

          {/* Result Viewing */}
          <ParentCard>
            <Box display="flex" alignItems="flex-start" gap={2} mb={2}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  bgcolor: 'primary.light',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <PaymentsIcon
                  sx={{
                    fontSize: 20,
                    color: 'primary.main',
                  }}
                />
              </Box>

              <Box>
                <Typography variant="h6" fontWeight={600}>
                  How should fees be collected?
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Choose how parents pay and who covers the gateway charges.
                </Typography>
              </Box>
            </Box>

            

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 2,
                bgcolor: '#f6f6f6',
                borderRadius: 2,
              }}
            >
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  Require payment before students can view results
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  When on, unpaid students will see a payment prompt instead of their results.
                </Typography>
              </Box>
              <Switch
                checked={requirePaymentForResults}
                onChange={(e) => setRequirePaymentForResults(e.target.checked)}
                color="primary"
              />
            </Box>
          </ParentCard>
        </Stack>
      )}

      {/* Tab 2: Payment Name */}
      {currentTab === 1 && (
        <Stack spacing={3}>
          {/* Payment Name Table */}
          <ParentCard
            title={
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h5" fontWeight={600}>
                    Payment Name
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    View fee items a parent can pay for
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<IconPlus size={18} />}
                  sx={{ fontWeight: 600 }}
                >
                  Add New Payment Name
                </Button>
              </Box>
            }
          >
            {/* Search Bar */}
            <Box display="flex" gap={2} mb={3}>
              <TextField
                placeholder="Search Payment Items"
                size="small"
                InputProps={{
                  startAdornment: (
                    <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                      🔍
                    </Box>
                  ),
                }}
              />
              <Button variant="contained" size="small" sx={{ fontWeight: 600, minWidth: 100 }}>
                Search
              </Button>
            </Box>

            {/* Table */}
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell sx={{ fontWeight: 700, width: 60 }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Pay Option</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Settlement Account</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Fee Bearer</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Modules</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>
                      Status
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, width: 80 }}>
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[...Array(15)].map((_, index) => (
                    <TableRow key={index + 1} hover>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Acceptance Fee</TableCell>
                      <TableCell>
                        <Chip
                          label={index % 3 === 0 ? 'OPTIONAL' : 'COMPULSORY'}
                          size="small"
                          sx={{
                            bgcolor:
                              index % 3 === 0 ? 'warning.light' : 'primary.light',
                            color:
                              index % 3 === 0 ? 'warning.dark' : 'primary.dark',
                            fontWeight: 600,
                            fontSize: 10,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            GTB
                          </Typography>
                          <Typography variant="caption" color="error.main">
                            0693040604
                          </Typography>
                          <Typography variant="caption" display="block" color="textSecondary">
                            Ikeyi$30ceTrube$75
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label="CLIENT"
                          size="small"
                          sx={{
                            bgcolor: 'success.light',
                            color: 'success.dark',
                            fontWeight: 600,
                            fontSize: 10,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label="NONE"
                          size="small"
                          sx={{
                            bgcolor: 'secondary.light',
                            color: 'secondary.dark',
                            fontWeight: 600,
                            fontSize: 10,
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label="Active"
                          size="small"
                          sx={{
                            bgcolor: 'success.light',
                            color: 'success.dark',
                            fontWeight: 600,
                            fontSize: 11,
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton size="small">
                          <IconDotsVertical size={18} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </ParentCard>
        </Stack>
      )}

      {/* Action Menus */}
      <Menu
        anchorEl={categoryMenuAnchor}
        open={Boolean(categoryMenuAnchor)}
        onClose={() => {
          setCategoryMenuAnchor(null);
          setSelectedCategory(null);
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem
          onClick={() => selectedCategory && handleToggleCategoryStatus(selectedCategory)}
          sx={{
            color: selectedCategory?.status === 'active' ? 'error.main' : 'success.main',
          }}
        >
          <ListItemIcon>
            {selectedCategory?.status === 'active' ? (
              <IconX size={18} color="currentColor" />
            ) : (
              <IconCheck size={18} color="currentColor" />
            )}
          </ListItemIcon>
          <ListItemText>
            {selectedCategory?.status === 'active' ? 'Deactivate' : 'Activate'}
          </ListItemText>
        </MenuItem>

        <MenuItem onClick={() => selectedCategory && handleEditCategory(selectedCategory)}>
          <ListItemIcon>
            <IconEdit size={18} />
          </ListItemIcon>
          <ListItemText>Edit Description</ListItemText>
        </MenuItem>
      </Menu>

      {/* Instalment Menu */}
      <Menu
        anchorEl={instalmentMenuAnchor}
        open={Boolean(instalmentMenuAnchor)}
        onClose={() => {
          setInstalmentMenuAnchor(null);
          setSelectedInstalment(null);
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem
          onClick={() => selectedInstalment && handleToggleInstalmentStatus(selectedInstalment)}
          sx={{
            color: selectedInstalment?.status === 'active' ? 'error.main' : 'success.main',
          }}
        >
          <ListItemIcon>
            {selectedInstalment?.status === 'active' ? (
              <IconX size={18} color="currentColor" />
            ) : (
              <IconCheck size={18} color="currentColor" />
            )}
          </ListItemIcon>
          <ListItemText>
            {selectedInstalment?.status === 'active' ? 'Deactivate' : 'Activate'}
          </ListItemText>
        </MenuItem>

        <MenuItem onClick={() => selectedInstalment && handleEditInstalment(selectedInstalment)}>
          <ListItemIcon>
            <IconEdit size={18} />
          </ListItemIcon>
          <ListItemText>Edit Installment</ListItemText>
        </MenuItem>
      </Menu>

      {/* Modals */}
      <CategoryModal
        open={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        onSave={handleSaveCategory}
        category={editingCategory}
      />

      <InstalmentModal
        open={instalmentModalOpen}
        onClose={() => setInstalmentModalOpen(false)}
        onSave={handleSaveInstalment}
        instalment={editingInstalment}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
};

export default BursarySetup;
