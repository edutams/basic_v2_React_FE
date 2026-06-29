import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableFooter,
  TablePagination,
  Chip,
  IconButton,
  Menu,
  MenuItem as MenuOption,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Tabs,
  Tab,
  Alert,
  Grid,
} from '@mui/material';
import ParentCard from '@/components/shared/ParentCard';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import EditOptionalPaymentModal from './EditOptionalPaymentModal';
import {
  fetchTermsBySessionTerm,
  fetchPaymentSchedules,
} from '@/api/tenant/bursary/bursarySettingsApi';

const OptionalPaymentTab = ({
  showSnackbar,
  sessionId,
  termId,
  categoryId,
  sessionLabel,
  categoryLabel,
  payOption = 'optional',
  onTermChange,
  refreshStats,
  scheduleRefreshKey = 0,
}) => {
  const [terms, setTerms] = useState([]);
  const [currentTerm, setCurrentTerm] = useState(0);
  const [selectedTermId, setSelectedTermId] = useState(null);
  const [loadingTerms, setLoadingTerms] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [scheduleData, setScheduleData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Load payment schedules when term or sessionId changes
  const loadPaymentSchedules = async (searchTerm = '') => {
    if (!sessionId || !selectedTermId || !categoryId) return;
    try {
      setLoadingTerms(true);
      const data = await fetchPaymentSchedules(
        sessionId,
        selectedTermId,
        categoryId,
        payOption,
        searchTerm,
      );
      console.log('Raw API response:', data);

      if (data?.data && Array.isArray(data.data)) {
        const transformedData = data.data.map((paymentName) => {
          // Group schedules by payment name and collect options
          const schedules = paymentName.payschedules || [];

          const classesSet = new Set();
          const optionsArray = [];
          let totalAmount = 0;

          schedules.forEach((schedule) => {
            const className = schedule.my_class?.class_name || `Class ${schedule.class_id}`;
            classesSet.add(className);

            // If schedule has options, use them; otherwise create option from schedule amount
            if (schedule.options && schedule.options.length > 0) {
              schedule.options.forEach((opt) => {
                optionsArray.push({
                  name: opt.option_name,
                  price: `₦${parseFloat(opt.amount).toLocaleString()}`,
                  amount: parseFloat(opt.amount),
                });
                totalAmount += parseFloat(opt.amount);
              });
            } else if (schedule.amount && schedule.amount > 0) {
              // Fallback: create option from schedule amount
              optionsArray.push({
                name: className,
                price: `₦${parseFloat(schedule.amount).toLocaleString()}`,
                amount: parseFloat(schedule.amount),
              });
              totalAmount += parseFloat(schedule.amount);
            }
          });

          return {
            id: paymentName.id,
            paymentName: paymentName.name,
            description: paymentName.description || '',
            options: optionsArray,
            totalTypes: optionsArray.length,
            totalAmount: `₦${totalAmount.toLocaleString()}`,
            category: categoryLabel || 'N/A',
            classes: Array.from(classesSet).join(', ') || 'All Classes',
            status: 'Active',
            payschedules: schedules,
          };
        });

        console.log('Transformed optional data:', transformedData);
        setScheduleData(transformedData);
      } else {
        setScheduleData([]);
      }
    } catch (err) {
      showSnackbar?.('Failed to load payment schedules', 'error');
      console.error('Error loading schedules:', err);
    } finally {
      setLoadingTerms(false);
    }
  };
  useEffect(() => {
    loadPaymentSchedules();
  }, [sessionId, selectedTermId, categoryId, scheduleRefreshKey]);

  const [detailsDialog, setDetailsDialog] = useState({
    open: false,
    schedule: null,
  });

  const [editModal, setEditModal] = useState({
    open: false,
    schedule: null,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!sessionId || !termId) return;
    const loadTerms = async () => {
      try {
        setLoadingTerms(true);
        const data = await fetchTermsBySessionTerm(sessionId, termId);
        const items = data?.data;
        const list = Array.isArray(items) ? items : [];
        setTerms(list);
        if (list.length > 0) {
          setCurrentTerm(0);
          setSelectedTermId(list[0].term_id);
          // Notify parent of initial term
          onTermChange?.(list[0].term_id);
        }
      } catch (err) {
        showSnackbar?.('Failed to load terms', 'error');
      } finally {
        setLoadingTerms(false);
      }
    };
    loadTerms();
  }, [sessionId, termId]);

  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    onConfirm: null,
  });

  const handleMenuOpen = (event, row) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const handleEditSchedule = () => {
    const scheduleToEdit = selectedRow || detailsDialog.schedule;

    if (!scheduleToEdit) return;

    const rawSchedule = scheduleData.find((s) => s.id === scheduleToEdit.id);
    if (rawSchedule) {
      const originalPaymentName = {
        id: rawSchedule.id,
        name: rawSchedule.paymentName,
        payschedules: rawSchedule.payschedules || [],
      };

      setEditModal({
        open: true,
        schedule: originalPaymentName,
      });
    }
    handleMenuClose();
  };

  const handleToggleStatus = () => {
    const newStatus = selectedRow.status === 'Active' ? 'Inactive' : 'Active';
    setConfirmDialog({
      open: true,
      title: `${newStatus === 'Active' ? 'Activate' : 'Deactivate'} Payment Schedule`,
      message: (
        <>
          Are you sure you want to {newStatus === 'Active' ? 'activate' : 'deactivate'}{' '}
          <Box component="span" sx={{ color: 'primary.main', fontWeight: 700 }}>
            {selectedRow.paymentName} payment
          </Box>
          ?
        </>
      ),
      onConfirm: () => {
        setScheduleData((prev) =>
          prev.map((s) => (s.id === selectedRow.id ? { ...s, status: newStatus } : s)),
        );
        showSnackbar?.(
          `Payment schedule ${newStatus === 'Active' ? 'activated' : 'deactivated'} successfully`,
          'success',
        );
        setConfirmDialog({ ...confirmDialog, open: false });
      },
    });
    handleMenuClose();
  };

  const handleRowClick = (schedule) => {
    setDetailsDialog({
      open: true,
      schedule,
    });
  };

  const handleConfirmDialogClose = () => {
    setConfirmDialog({ ...confirmDialog, open: false });
  };

  const handleDetailsDialogClose = () => {
    setDetailsDialog({ open: false, schedule: null });
  };

  const handleSearch = () => {
    loadPaymentSchedules(searchQuery);
  };

  const handleRefreshSchedules = async () => {
    await loadPaymentSchedules(searchQuery);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedSchedules = scheduleData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  const handleEditModalSave = async (formData) => {
    try {
      console.log('Saving optional payment:', formData);
      showSnackbar?.('Optional payment updated successfully', 'success');
      await loadPaymentSchedules(searchQuery);
      refreshStats?.();
    } catch (err) {
      console.error('Failed to save optional payment:', err);
      showSnackbar?.('Failed to update optional payment', 'error');
    }
  };
  // scheduleData

  return (
    <Stack spacing={3}>
      <Alert severity="info" sx={{ mb: 2, textAlign: 'center', justifyContent: 'center' }}>
        <Typography variant="body2" fontWeight={600} textAlign="center" sx={{ width: '100%' }}>
          Payment Schedules for {sessionLabel || '...'} -{' '}
          {terms[currentTerm]?.display_term.display_name} ({categoryLabel || '...'})
        </Typography>
      </Alert>

      <ParentCard>
        <Box
          mb={3}
          display="flex"
          flexDirection={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', md: 'center' }}
          gap={2}
        >
          <Tabs
            value={currentTerm}
            onChange={(e, val) => {
              setCurrentTerm(val);
              if (terms[val]) {
                const newTermId = terms[val].term_id;
                setSelectedTermId(newTermId);
                onTermChange?.(newTermId);
              }
            }}
            variant="scrollable"
            scrollButtons={false}
            sx={{
              flex: 1,
            }}
          >
            {terms.map((term, idx) => (
              <Tab
                key={idx}
                label={term.display_term.display_name}
                sx={{ textTransform: 'none', fontWeight: 600 }}
                icon={
                  <Box
                    component="span"
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      bgcolor: currentTerm === idx ? 'primary.main' : 'grey.300',
                      color: 'white',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 700,
                      mr: 1,
                    }}
                  >
                    ●
                  </Box>
                }
                iconPosition="start"
              />
            ))}
          </Tabs>

          <Box display="flex" gap={2}>
            <TextField
              placeholder="Search payment items..."
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ width: 300 }}
            />

            <Button variant="contained" size="small" onClick={handleSearch}>
              Search
            </Button>
          </Box>
        </Box>

        <Stack
          mb={3}
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={2}
        >
          <Box>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Optional Services
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Each row is a service with its variants and payment. Click a row to view details.
            </Typography>
          </Box>

          {/* <Button variant="contained" size="small" startIcon={<AddIcon />}
          onClick={handleAddPaymentItem}
          sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}
          fullWidth={{ xs: true, sm: false }}
        >
          Add payment item
        </Button> */}
        </Stack>

        <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 700, width: 60 }}>#</TableCell>
                <TableCell sx={{ fontWeight: 700, minWidth: 200 }}>Payment Name</TableCell>
                <TableCell sx={{ fontWeight: 700, minWidth: 250 }}>Option Name</TableCell>
                <TableCell sx={{ fontWeight: 700, minWidth: 150 }}>Payment Category</TableCell>
                <TableCell sx={{ fontWeight: 700, minWidth: 120 }}>Class</TableCell>
                {/* <TableCell sx={{ fontWeight: 700, width: 100 }}>Status</TableCell> */}
                <TableCell align="center" sx={{ fontWeight: 700, width: 80 }}>
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedSchedules.map((schedule, index) => (
                <TableRow
                  key={schedule.id}
                  hover
                  onClick={() => handleRowClick(schedule)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {schedule.paymentName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {schedule.description}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1} flexWrap="wrap">
                      {schedule.options.map((option, idx) => (
                        <Chip
                          key={idx}
                          label={`${option.name} · ${option.price}`}
                          size="small"
                          sx={{
                            bgcolor: 'primary.light',
                            color: 'primary.main',
                          }}
                        />
                      ))}
                    </Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 1, display: 'block' }}
                    >
                      {schedule.totalTypes} types · Total {schedule.totalAmount}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={schedule.category}
                      size="small"
                      sx={{
                        bgcolor: 'primary.light',
                        color: 'primary.main',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {(schedule.classes?.split(',') || []).map((cls, index) => (
                      <Chip
                        key={index}
                        label={cls.trim()}
                        size="small"
                        sx={{
                          bgcolor: 'primary.light',
                          color: 'primary.main',
                          mr: 0.5,
                          mb: 0.5,
                        }}
                      />
                    ))}
                  </TableCell>
                  {/* <TableCell>
                      <Chip
                        label={schedule.status}
                        size="small"
                        sx={{
                          bgcolor:
                            schedule.status === 'Active'
                              ? 'rgba(76, 175, 80, 0.1)'
                              : 'rgba(244, 67, 54, 0.1)',
                          color: schedule.status === 'Active' ? '#4CAF50' : '#F44336',
                          fontWeight: 600,
                          fontSize: 11,
                        }}
                      />
                    </TableCell> */}
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMenuOpen(e, schedule);
                      }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  colSpan={6}
                  count={scheduleData.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </ParentCard>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuOption onClick={handleEditSchedule}>Set/Edit Schedule</MenuOption>
        {/* <MenuOption onClick={handleToggleStatus}>
          {selectedRow?.status === 'Active' ? 'Deactivate' : 'Activate'}
        </MenuOption> */}
      </Menu>

      <Dialog open={detailsDialog.open} onClose={handleDetailsDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{
            fontWeight: 700,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 2,
          }}
        >
          <Box flex={1}>
            <Typography variant="h6" fontWeight={700} color="primary.main">
              {detailsDialog.schedule?.paymentName}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {detailsDialog.schedule?.description}
            </Typography>
          </Box>

          <IconButton onClick={handleDetailsDialogClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
          <Stack spacing={3}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                  Status
                </Typography>

                <Chip
                  label={detailsDialog.schedule?.status}
                  size="small"
                  sx={{
                    bgcolor:
                      detailsDialog.schedule?.status === 'Active'
                        ? 'rgba(76, 175, 80, 0.1)'
                        : 'rgba(244, 67, 54, 0.1)',
                    color: detailsDialog.schedule?.status === 'Active' ? '#4CAF50' : '#F44336',
                    fontWeight: 600,
                  }}
                />
              </Grid>

              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                  Category
                </Typography>

                <Chip
                  label={detailsDialog.schedule?.category}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(63, 81, 181, 0.08)',
                    color: 'primary.main',
                    fontWeight: 600,
                  }}
                />
              </Grid>
            </Grid>

            <Box>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                Classes
              </Typography>
              <Chip
                label={detailsDialog.schedule?.classes}
                size="small"
                sx={{
                  bgcolor: 'primary.light',
                  color: 'primary.main',
                }}
              />
            </Box>

            <Box>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                Payment Options ({detailsDialog.schedule?.totalTypes} types)
              </Typography>

              <Stack spacing={1.5} mt={2}>
                {detailsDialog.schedule?.options.map((option, idx) => (
                  <Paper
                    key={idx}
                    variant="outlined"
                    sx={{
                      p: 2,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Typography variant="body2" fontWeight={600}>
                      {option.name}
                    </Typography>

                    <Typography variant="body2" fontWeight={700} color="primary.main">
                      {option.price}
                    </Typography>
                  </Paper>
                ))}
              </Stack>

              <Box
                sx={{
                  mt: 2,
                  pt: 2,
                  borderTop: 1,
                  borderColor: 'divider',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography variant="body2" fontWeight={600}>
                  Total Amount
                </Typography>
                <Typography variant="h6" fontWeight={700} color="primary.main">
                  {detailsDialog.schedule?.totalAmount}
                </Typography>
              </Box>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 2 }, gap: 1 }}>
          <Button variant="contained" size="small" onClick={handleDetailsDialogClose} fullWidth={{ xs: true, sm: false }}>
            Close
          </Button>

          <Button variant="contained" size="small" onClick={() => {
              handleDetailsDialogClose();
              handleEditSchedule();
            }}
            fullWidth={{ xs: true, sm: false }}
          >
            Set/Edit Optional Payment
          </Button>
        </DialogActions>
      </Dialog>

      <EditOptionalPaymentModal
        open={editModal.open}
        onClose={() => setEditModal({ open: false, schedule: null })}
        onSave={handleEditModalSave}
        schedule={editModal.schedule}
        sessionId={sessionId}
        termId={selectedTermId}
        categoryId={categoryId}
        onRefresh={handleRefreshSchedules}
      />

      <Dialog
        open={confirmDialog.open}
        onClose={handleConfirmDialogClose}
        maxWidth="xs"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            m: { xs: 2, sm: 2 },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <Typography variant="body2">{confirmDialog.message}</Typography>
        </DialogContent>
        <DialogActions
          sx={{ px: { xs: 2, sm: 3 }, pb: 2, gap: 1, flexDirection: { xs: 'column', sm: 'row' } }}
        >
          <Button variant="contained" size="small" color="inherit" onClick={handleConfirmDialogClose} fullWidth={{ xs: true, sm: false }} sx={{ order: { xs: 2, sm: 1 } }}>
            Cancel
          </Button>
          <Button variant="contained" size="small" onClick={confirmDialog.onConfirm} sx={{ fontWeight: 600, order: { xs: 1, sm: 2 } }} fullWidth={{ xs: true, sm: false }}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default OptionalPaymentTab;
