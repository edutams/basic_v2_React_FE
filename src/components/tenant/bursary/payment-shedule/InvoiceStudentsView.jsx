import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  fetchStudentForInvoiceData,
  fetchActiveCategories,
  fetchStudentOptionalPayments,
  generateStudentInvoice,
} from '@/api/tenant/bursary/bursarySettingsApi';
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
  Paper,
  FormControl,
  Select,
  MenuItem,
  Checkbox,
  Menu,
  IconButton,
  Alert,
  CircularProgress,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  FormControlLabel,
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreHoriz as MoreHorizIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import ParentCard from '@/components/shared/ParentCard';

const InvoiceStudentsView = () => {
  const { session_term_id, class_id, pay_schedule_id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [students, setStudents] = useState([]);
  const [sessionLabel, setSessionLabel] = useState('');
  const [termLabel, setTermLabel] = useState('');
  const [className, setClassName] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [selectedStudentCategory, setSelectedStudentCategory] = useState(
    searchParams.get('category_id') || 'all',
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [anchorStudent, setAnchorStudent] = useState(null);
  const openMenu = Boolean(anchorEl);

  // ── Optional payments per student ──
  // Stores { [user_id]: totalOptionalAmount }
  const [studentOptionalAmounts, setStudentOptionalAmounts] = useState({});
  // Stores { [user_id]: Set<option_id> } — persists modal checkbox selections per student
  const [studentSelectedOptionIds, setStudentSelectedOptionIds] = useState({});

  // ── Optional payment modal state ──
  const [optionalModalOpen, setOptionalModalOpen] = useState(false);
  const [optionalModalStudent, setOptionalModalStudent] = useState(null);
  const [optionalPaymentList, setOptionalPaymentList] = useState([]);
  const [loadingOptionalPayments, setLoadingOptionalPayments] = useState(false);
  const [selectedOptionalIds, setSelectedOptionalIds] = useState(new Set());

  // Fetch available categories from API for the dropdown filter
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCategoriesLoading(true);
        const res = await fetchActiveCategories();
        const cats = Array.isArray(res?.data) ? res.data : [];
        setCategories(cats);

        if (cats.length > 0 && !searchParams.get('category_id')) {
          const firstCatId = String(cats[0].id);
          setSelectedStudentCategory(firstCatId);
          setSearchParams({ category_id: firstCatId });
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      } finally {
        setCategoriesLoading(false);
      }
    };
    loadCategories();
  }, []);

  const selectedCategoryId =
    selectedStudentCategory !== 'all' ? selectedStudentCategory : undefined;

  // Fetch compulsory student data
  useEffect(() => {
    const loadData = async () => {
      if (!session_term_id) return;
      try {
        setLoading(true);
        setError(null);
        // Clear optional amounts and selections when filters change
        setStudentOptionalAmounts({});
        setStudentSelectedOptionIds({});
        setAnchorStudent(null);
        const response = await fetchStudentForInvoiceData({
          sessionTermId: session_term_id,
          classId: class_id,
          categoryId: selectedCategoryId,
        });
        const d = response?.data || {};
        setStudents(Array.isArray(d.students) ? d.students : []);
        setSessionLabel(d.session_label || '');
        setTermLabel(d.term_label || '');
        setClassName(d.class_name || '');
      } catch (err) {
        console.error('Failed to load student invoice data', err);
        setError(
          err?.response?.data?.message || 'Failed to load student invoice data',
        );
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [session_term_id, class_id, pay_schedule_id, selectedCategoryId]);

  // ── Generate Invoice confirmation state ──
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [generatingInvoice, setGeneratingInvoice] = useState(false);
  const [invoiceResult, setInvoiceResult] = useState(null); // { success, message } or null

  // ── Fetch optional payments when modal opens ──
  const handleOpenOptionalModal = async (student) => {
    setOptionalModalStudent(student);
    setOptionalModalOpen(true);

    // Restore previously selected options for this student, or start fresh
    const storedIds = studentSelectedOptionIds[student.user_id];
    setSelectedOptionalIds(storedIds ? new Set(storedIds) : new Set());

    // Load the optional payments available for this class/session/category
    try {
      setLoadingOptionalPayments(true);
      const res = await fetchStudentOptionalPayments({
        sessionTermId: session_term_id,
        classId: class_id,
        categoryId: selectedCategoryId,
      });
      const list = Array.isArray(res?.data) ? res.data : [];
      setOptionalPaymentList(list);
    } catch (err) {
      console.error('Failed to load optional payments', err);
      setOptionalPaymentList([]);
    } finally {
      setLoadingOptionalPayments(false);
    }
  };

  const handleCloseOptionalModal = () => {
    setOptionalModalOpen(false);
    setOptionalModalStudent(null);
    setOptionalPaymentList([]);
    setSelectedOptionalIds(new Set());
  };

  // Toggle a single optional payment option
  const handleToggleOptionalItem = (optionId) => {
    setSelectedOptionalIds((prev) => {
      const next = new Set(prev);
      if (next.has(optionId)) {
        next.delete(optionId);
      } else {
        next.add(optionId);
      }
      return next;
    });
  };

  // Mark all / unmark all
  const handleToggleAllOptional = () => {
    const allIds = new Set();
    optionalPaymentList.forEach((group) => {
      group.options.forEach((opt) => allIds.add(opt.option_id));
    });

    setSelectedOptionalIds((prev) => {
      // If all are already selected, unselect all
      const isAllSelected =
        prev.size === allIds.size &&
        [...allIds].every((id) => prev.has(id));
      return isAllSelected ? new Set() : allIds;
    });
  };

  // "Add" button: sum selected optional amounts and store for student
  const handleAddOptionalPayments = () => {
    if (!optionalModalStudent) return;

    const allOptions = optionalPaymentList.flatMap((group) => group.options);
    const totalOptional = allOptions
      .filter((opt) => selectedOptionalIds.has(opt.option_id))
      .reduce((sum, opt) => sum + (Number(opt.amount) || 0), 0);

    setStudentOptionalAmounts((prev) => ({
      ...prev,
      [optionalModalStudent.user_id]: totalOptional,
    }));

    // Persist selected option IDs so re-opening the modal restores the checkboxes
    const userId = optionalModalStudent.user_id;
    setStudentSelectedOptionIds((prev) => {
      const next = { ...prev };
      if (selectedOptionalIds.size > 0) {
        next[userId] = [...selectedOptionalIds];
      } else {
        delete next[userId];
      }
      return next;
    });

    handleCloseOptionalModal();
  };

  // Determine if all optional items are selected
  const allOptionalItems = optionalPaymentList.flatMap((g) => g.options);
  const allOptionalSelected =
    allOptionalItems.length > 0 &&
    allOptionalItems.every((opt) => selectedOptionalIds.has(opt.option_id));

  // ── Generate Invoice handler ──
  const handleGenerateInvoiceClick = () => {
    if (selectedStudents.length === 0) {
      setInvoiceResult({
        success: false,
        message: 'Please select at least one student to generate an invoice.',
      });
      return;
    }
    setConfirmDialogOpen(true);
  };

  const handleConfirmGenerateInvoice = async () => {
    setConfirmDialogOpen(false);
    setGeneratingInvoice(true);
    setInvoiceResult(null);

    try {
      const selectedStudentData = filteredStudents.filter((_, idx) =>
        selectedStudents.includes(idx),
      );

      // Build student_data array: [{ user_id, option_payment_ids }, ...]
      const studentData = selectedStudentData.map((s) => ({
        user_id: String(s.user_id),
        option_payment_ids: studentSelectedOptionIds[s.user_id] || [],
      }));

      const payload = {
        session_term_id: Number(session_term_id),
        category_id: Number(selectedStudentCategory),
        class_id: Number(class_id),
        student_data: studentData,
      };

      const res = await generateStudentInvoice(payload);

      if (res?.success) {
        setInvoiceResult({
          success: true,
          message:
            res?.message ||
            `Invoices generated successfully for ${studentData.length} student(s).`,
        });
      } else {
        setInvoiceResult({
          success: false,
          message: res?.message || 'Failed to generate invoices.',
        });
      }
    } catch (err) {
      console.error('Failed to generate invoices', err);
      setInvoiceResult({
        success: false,
        message:
          err?.response?.data?.message ||
          'An error occurred while generating invoices.',
      });
    } finally {
      setGeneratingInvoice(false);
    }
  };

  const handleCloseInvoiceResult = () => {
    setInvoiceResult(null);
  };

  // ── Menu handlers ──
  const handleMenuClick = (event, student) => {
    setAnchorEl(event.currentTarget);
    setAnchorStudent(student);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setAnchorStudent(null);
  };

  // ── Row checkbox handlers ──
  const handleStudentClick = (event, rowIdx) => {
    const selectedIndex = selectedStudents.indexOf(rowIdx);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedStudents, rowIdx);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedStudents.slice(1));
    } else if (selectedIndex === selectedStudents.length - 1) {
      newSelected = newSelected.concat(selectedStudents.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedStudents.slice(0, selectedIndex),
        selectedStudents.slice(selectedIndex + 1),
      );
    }
    setSelectedStudents(newSelected);
  };

  const isStudentSelected = (rowIdx) => selectedStudents.indexOf(rowIdx) !== -1;

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      setSelectedStudents(filteredStudents.map((_, idx) => idx));
      return;
    }
    setSelectedStudents([]);
  };

  // ── Filtered students ──
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      !searchQuery ||
      student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.admissionId?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // ── Render states ──
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="300px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button sx={{ mt: 2 }} onClick={() => navigate('/payment-schedule')}>
          Back to Payment Schedule
        </Button>
      </Box>
    );
  }

  return (
    <>
      <ParentCard
        title={
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h5">
              Student Invoice List {sessionLabel}
              {termLabel ? ` - ${termLabel}` : ''} · {className}
            </Typography>
          </Box>
        }
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Button
            size="small"
            variant="outlined"
            onClick={() => navigate('/payment-schedule')}
          >
            Back
          </Button>
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="contained"
              disabled={selectedStudents.length === 0}
              onClick={handleGenerateInvoiceClick}
              startIcon={
                generatingInvoice ? undefined : <DescriptionIcon />
              }
            >
              {generatingInvoice ? (
                <CircularProgress size={16} sx={{ color: 'inherit', mr: 0.5 }} />
              ) : null}
              Generate Invoice
            </Button>
            <Button size="small" variant="outlined">
              Print Invoice for All
            </Button>
          </Stack>
        </Box>

        <Grid
          container
          spacing={1}
          mb={3}
          alignItems="center"
          justifyContent="flex-end"
        >
          <Grid size={{ xs: 12, md: 'auto' }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <Select
                displayEmpty
                value={selectedStudentCategory}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedStudentCategory(val);
                  if (val && val !== 'all') {
                    setSearchParams({ category_id: val });
                  } else {
                    setSearchParams({});
                  }
                }}
                sx={{ '& .MuiSelect-select': { color: 'text.secondary' } }}
                disabled={categoriesLoading}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={String(cat.id)}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 'auto' }}>
            <TextField
              size="small"
              placeholder="Search by name or ID"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid>
        </Grid>

        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{
            overflowX: 'auto',
            borderRadius: 2,
            borderColor: 'grey.200',
          }}
        >
          <Table sx={{ minWidth: 900 }}>
            <TableHead>
              <TableRow>
                <TableCell
                  padding="checkbox"
                  sx={{
                    borderBottom: '1px solid',
                    borderColor: 'grey.200',
                  }}
                >
                  <Checkbox
                    color="primary"
                    indeterminate={
                      selectedStudents.length > 0 &&
                      selectedStudents.length < filteredStudents.length
                    }
                    checked={
                      filteredStudents.length > 0 &&
                      selectedStudents.length === filteredStudents.length
                    }
                    onChange={handleSelectAllClick}
                  />
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    color: 'text.secondary',
                    borderBottom: '1px solid',
                    borderColor: 'grey.200',
                  }}
                >
                  User ID
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    color: 'text.secondary',
                    borderBottom: '1px solid',
                    borderColor: 'grey.200',
                  }}
                >
                  Student Name
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    color: 'text.secondary',
                    borderBottom: '1px solid',
                    borderColor: 'grey.200',
                  }}
                >
                  Category
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    color: 'text.secondary',
                    borderBottom: '1px solid',
                    borderColor: 'grey.200',
                  }}
                >
                  Total Compulsory Amount
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    color: 'text.secondary',
                    borderBottom: '1px solid',
                    borderColor: 'grey.200',
                  }}
                >
                  Total Optional Amount
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    color: 'text.secondary',
                    borderBottom: '1px solid',
                    borderColor: 'grey.200',
                  }}
                >
                  Total Payable
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    color: 'text.secondary',
                    borderBottom: '1px solid',
                    borderColor: 'grey.200',
                  }}
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                    <Alert
                      severity="info"
                      sx={{ justifyContent: 'center', bgcolor: 'transparent' }}
                    >
                      No students found matching your criteria.
                    </Alert>
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student, idx) => {
                  const isItemSelected = isStudentSelected(idx);
                  const compulsoryAmt =
                    Number(student.total_compulsory_payment) || 0;
                  const optionalAmt =
                    Number(studentOptionalAmounts[student.user_id]) || 0;
                  const totalPayable = compulsoryAmt + optionalAmt;

                  return (
                    <TableRow
                      key={`${student.user_id}-${idx}`}
                      hover
                      onClick={(event) => handleStudentClick(event, idx)}
                      role="checkbox"
                      aria-checked={isItemSelected}
                      selected={isItemSelected}
                      sx={{
                        '& td': {
                          borderBottom: '1px solid',
                          borderColor: 'grey.100',
                        },
                        cursor: 'pointer',
                      }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox checked={isItemSelected} color="primary" />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {student.user_id}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {student.name}
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            bgcolor: 'primary.light',
                            py: 0.5,
                            borderRadius: 5,
                            display: 'inline-block',
                            px: 1.5,
                          }}
                        >
                          <Typography
                            variant="caption"
                            fontWeight={600}
                            color="primary"
                          >
                            {student.category}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        ₦{compulsoryAmt.toLocaleString()}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
  <Box
    display="flex"
    flexDirection="column"
    alignItems="center"
    justifyContent="center"
    gap={1}
  >
    {optionalAmt > 0 ? (
      <Typography
        variant="body2"
        fontWeight={700}
        textAlign="center"
      >
        ₦{optionalAmt.toLocaleString()}
      </Typography>
    ) : (
      <Typography
        variant="body2"
        color="text.secondary"
        textAlign="center"
      >
        -
      </Typography>
    )}

    <Button
      size="small"
      variant="outlined"
      startIcon={<AddIcon fontSize="small" />}
      onClick={(e) => {
        e.stopPropagation();
        handleOpenOptionalModal(student);
      }}
      sx={{
        textTransform: 'none',
        fontWeight: 600,
        fontSize: 12,
        whiteSpace: 'nowrap',
      }}
    >
      Add Optional Pay.
    </Button>
  </Box>
</TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            bgcolor: 'primary.light',
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            display: 'inline-block',
                          }}
                        >
                          <Typography variant="body2" fontWeight={700}>
                            ₦{totalPayable.toLocaleString()}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMenuClick(e, student);
                          }}
                        >
                          <MoreHorizIcon sx={{ color: 'text.secondary' }} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Menu
          anchorEl={anchorEl}
          open={openMenu}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={handleMenuClose}>Print Invoice</MenuItem>
          <MenuItem onClick={handleMenuClose}>Regenerate Invoice</MenuItem>
          <MenuItem onClick={handleMenuClose}>Go to Student Ledger</MenuItem>
        </Menu>
      </ParentCard>

      {/* ─── Optional Payment Modal ─── */}
      <Dialog
        open={optionalModalOpen}
        onClose={handleCloseOptionalModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontWeight: 700,
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Add Optional Payments
            </Typography>
            {optionalModalStudent && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {optionalModalStudent.name} ({optionalModalStudent.user_id})
              </Typography>
            )}
          </Box>
          <IconButton onClick={handleCloseOptionalModal} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
          {loadingOptionalPayments ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              minHeight={200}
            >
              <CircularProgress />
            </Box>
          ) : optionalPaymentList.length === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              No optional payments available for this class/category.
            </Alert>
          ) : (
            <Stack spacing={1} sx={{ mt: 1 }}>
              {/* Mark All / Unmark All */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1,
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={allOptionalSelected}
                      indeterminate={
                        selectedOptionalIds.size > 0 && !allOptionalSelected
                      }
                      onChange={handleToggleAllOptional}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2" fontWeight={600}>
                      {allOptionalSelected
                        ? 'Unmark All'
                        : 'Mark All'}
                    </Typography>
                  }
                />
                <Typography variant="caption" color="text.secondary">
                  {selectedOptionalIds.size} of {allOptionalItems.length} selected
                </Typography>
              </Box>

              <Divider />

              {/* Grouped by payment name */}
              {optionalPaymentList.map((group) => (
                <Box key={group.payment_name_id} sx={{ mt: 1 }}>
                  <Typography
                    variant="subtitle2"
                    fontWeight={700}
                    color="primary.main"
                    gutterBottom
                  >
                    {group.payment_name}
                  </Typography>
                  <Stack spacing={0.5} sx={{ pl: 1 }}>
                    {group.options.map((opt) => (
                      <FormControlLabel
                        key={opt.option_id}
                        control={
                          <Checkbox
                            checked={selectedOptionalIds.has(opt.option_id)}
                            onChange={() =>
                              handleToggleOptionalItem(opt.option_id)
                            }
                            size="small"
                            color="primary"
                          />
                        }
                        label={
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            width="100%"
                            sx={{ minWidth: 250 }}
                          >
                            <Typography variant="body2">
                              {opt.option_name}
                            </Typography>
                            <Typography
                              variant="body2"
                              fontWeight={700}
                              color="text.secondary"
                              sx={{ ml: 2 }}
                            >
                              ₦{(Number(opt.amount) || 0).toLocaleString()}
                            </Typography>
                          </Box>
                        }
                        sx={{
                          mx: 0,
                          '& .MuiFormControlLabel-label': { width: '100%' },
                        }}
                      />
                    ))}
                  </Stack>
                </Box>
              ))}
            </Stack>
          )}
        </DialogContent>

        <Divider />

        {/* Summary footer */}
        {!loadingOptionalPayments && optionalPaymentList.length > 0 && (
          <Box
            sx={{
              px: { xs: 2, sm: 3 },
              py: 1.5,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              bgcolor: 'grey.50',
            }}
          >
            <Typography variant="body2" fontWeight={600}>
              Selected Total:
            </Typography>
            <Typography variant="h6" fontWeight={700} color="primary.main">
              ₦
              {allOptionalItems
                .filter((opt) => selectedOptionalIds.has(opt.option_id))
                .reduce((sum, opt) => sum + (Number(opt.amount) || 0), 0)
                .toLocaleString()}
            </Typography>
          </Box>
        )}

        <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 2 }, gap: 1 }}>
          <Button
            onClick={handleCloseOptionalModal}
            fullWidth={{ xs: true, sm: false }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddOptionalPayments}
            disabled={selectedOptionalIds.size === 0}
            fullWidth={{ xs: true, sm: false }}
            sx={{ fontWeight: 600 }}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── Generate Invoice Confirmation Dialog ─── */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <DescriptionIcon color="primary" />
            <Typography variant="h6" fontWeight={700}>
              Confirm Invoice Generation
            </Typography>
          </Box>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
          <Stack spacing={1.5}>
            <Typography variant="body1">
              You are about to generate an invoice for the following:
            </Typography>

            <Box
              sx={{
                bgcolor: 'grey.50',
                borderRadius: 2,
                p: 2,
                border: '1px solid',
                borderColor: 'grey.200',
              }}
            >
              <Stack spacing={1}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Session Term
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {sessionLabel}
                    {termLabel ? ` - ${termLabel}` : ''}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Class
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {className}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Category
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {categories.find(
                      (c) => String(c.id) === selectedStudentCategory,
                    )?.name || 'N/A'}
                  </Typography>
                </Box>
                <Divider />
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Selected Students
                  </Typography>
                  <Typography variant="body2" fontWeight={700} color="primary.main">
                    {selectedStudents.length} student(s)
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 2 }, gap: 1 }}>
          <Button
            onClick={() => setConfirmDialogOpen(false)}
            fullWidth={{ xs: true, sm: false }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmGenerateInvoice}
            fullWidth={{ xs: true, sm: false }}
            sx={{ fontWeight: 600 }}
            startIcon={<DescriptionIcon />}
          >
            Yes, Generate
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── Invoice Result Alert (Snackbar-style) ─── */}
      <Dialog
        open={Boolean(invoiceResult)}
        onClose={handleCloseInvoiceResult}
        maxWidth="xs"
        fullWidth
      >
        <DialogContent sx={{ textAlign: 'center', py: 3 }}>
          {invoiceResult?.success ? (
            <DescriptionIcon
              sx={{
                fontSize: 48,
                color: 'success.main',
                mb: 1.5,
              }}
            />
          ) : (
            <CloseIcon
              sx={{
                fontSize: 48,
                color: 'error.main',
                mb: 1.5,
              }}
            />
          )}
          <Typography
            variant="h6"
            fontWeight={700}
            color={invoiceResult?.success ? 'success.main' : 'error.main'}
            gutterBottom
          >
            {invoiceResult?.success ? 'Success' : 'Unable to Generate'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {invoiceResult?.message}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button
            variant="contained"
            onClick={handleCloseInvoiceResult}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default InvoiceStudentsView;
