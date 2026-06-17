import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  fetchStudentForInvoiceData,
  fetchActiveCategories,
  fetchStudentOptionalPayments,
  generateStudentInvoice,
  saveStudentOptionalPayments,
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
import PrintInvoiceModal from './PrintInvoiceModal';

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

  // ── KEY FIX: track whether categories have been resolved ──
  // This prevents the student fetch from firing before a valid category_id exists.
  const [categoriesReady, setCategoriesReady] = useState(false);

  const [selectedStudentCategory, setSelectedStudentCategory] = useState(
    searchParams.get('category_id') || '',
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [anchorStudent, setAnchorStudent] = useState(null);
  const openMenu = Boolean(anchorEl);

  // ── Optional payments per student ──
  const [studentOptionalAmounts, setStudentOptionalAmounts] = useState({});
  const [studentSelectedOptionIds, setStudentSelectedOptionIds] = useState({});

  // ── Optional payment modal state ──
  const [optionalModalOpen, setOptionalModalOpen] = useState(false);
  const [optionalModalStudent, setOptionalModalStudent] = useState(null);
  const [optionalPaymentList, setOptionalPaymentList] = useState([]);
  const [loadingOptionalPayments, setLoadingOptionalPayments] = useState(false);
  const [selectedOptionalIds, setSelectedOptionalIds] = useState(new Set());

  // ── STEP 1: Fetch categories first, then mark ready ──
  useEffect(() => {
    // Capture the URL param value synchronously before the async work begins
    const urlCategoryId = searchParams.get('category_id') || '';

    const loadCategories = async () => {
      try {
        setCategoriesLoading(true);

        const res = await fetchActiveCategories();
        const cats = Array.isArray(res?.data) ? res.data : [];
        setCategories(cats);

        if (urlCategoryId && cats.some((c) => String(c.id) === urlCategoryId)) {
          // URL param is valid — keep it
          setSelectedStudentCategory(urlCategoryId);
        } else if (cats.length > 0) {
          // Fall back to first category
          const firstCatId = String(cats[0].id);
          setSelectedStudentCategory(firstCatId);
          setSearchParams({ category_id: firstCatId }, { replace: true });
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      } finally {
        setCategoriesLoading(false);
        // Signal that category resolution is complete regardless of outcome
        setCategoriesReady(true);
      }
    };

    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedCategoryId =
    selectedStudentCategory && selectedStudentCategory !== 'all'
      ? selectedStudentCategory
      : undefined;

  // ── STEP 2: Fetch student data only after categories are ready ──
  useEffect(() => {
    // Guard: don't run until category selection is resolved
    if (!categoriesReady) return;
    if (!session_term_id) return;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Clear selections when filters change
        setAnchorStudent(null);
        setSelectedStudents([]);

        await fetchAndSetStudentData();
      } catch (err) {
        console.error('Failed to load student invoice data', err);
        setError(err?.response?.data?.message || 'Failed to load student invoice data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [session_term_id, class_id, pay_schedule_id, selectedCategoryId, categoriesReady]);

  // ── Refetchable helper to load student data from backend ──
  const fetchAndSetStudentData = async () => {
    setError(null);

    const response = await fetchStudentForInvoiceData({
      sessionTermId: session_term_id,
      classId: class_id,
      categoryId: selectedCategoryId,
    });
    const d = response?.data || {};
    const students = Array.isArray(d.students) ? d.students : [];
    setStudents(students);
    setSessionLabel(d.session_label || '');
    setTermLabel(d.term_label || '');
    setClassName(d.class_name || '');

    // ── Populate existing optional payment selections from backend ──
    const optionIdsMap = {};
    const amountsMap = {};
    students.forEach((s) => {
      if (s.existing_optional_option_ids) {
        try {
          const ids =
            typeof s.existing_optional_option_ids === 'string'
              ? JSON.parse(s.existing_optional_option_ids)
              : s.existing_optional_option_ids;
          if (Array.isArray(ids) && ids.length > 0) {
            optionIdsMap[s.user_id] = ids.filter((id) => id !== null);
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
      if (Number(s.total_existing_optional_amount) > 0) {
        amountsMap[s.user_id] = Number(s.total_existing_optional_amount);
      }
    });
    setStudentSelectedOptionIds(optionIdsMap);
    setStudentOptionalAmounts(amountsMap);
  };

  // ── Generate Invoice confirmation state ──
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [generatingInvoice, setGeneratingInvoice] = useState(false);
  const [invoiceResult, setInvoiceResult] = useState(null);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [printStudent, setPrintStudent] = useState(null);
  const [regeneratingStudent, setRegeneratingStudent] = useState(false);
  const [regenerateConfirmOpen, setRegenerateConfirmOpen] = useState(false);
  const [regenerateTargetStudent, setRegenerateTargetStudent] = useState(null);

  // ── Fetch optional payments when modal opens ──
  const handleOpenOptionalModal = async (student) => {
    setOptionalModalStudent(student);
    setOptionalModalOpen(true);

    const storedIds = studentSelectedOptionIds[student.user_id];
    setSelectedOptionalIds(storedIds ? new Set(storedIds) : new Set());

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

  const handleToggleAllOptional = () => {
    const allIds = new Set();
    optionalPaymentList.forEach((group) => {
      group.options.forEach((opt) => allIds.add(opt.option_id));
    });

    setSelectedOptionalIds((prev) => {
      const isAllSelected = prev.size === allIds.size && [...allIds].every((id) => prev.has(id));
      return isAllSelected ? new Set() : allIds;
    });
  };

  const handleAddOptionalPayments = async () => {
    if (!optionalModalStudent) return;

    const student = optionalModalStudent;
    const userId = student.user_id;
    const invoiceNumber = student.compulsory_invoice_number;

    // Check if invoice has been generated (need invoice_number)
    if (!invoiceNumber) {
      handleCloseOptionalModal();
      setInvoiceResult({
        success: false,
        message: 'No invoice generated yet for this student. Please generate an invoice first.',
      });
      return;
    }

    // Close the modal optimistically while the API call runs
    handleCloseOptionalModal();

    try {
      const optionPaymentIds = [...selectedOptionalIds];

      const res = await saveStudentOptionalPayments({
        invoice_number: Number(invoiceNumber),
        user_id: userId,
        option_payment_ids: optionPaymentIds,
      });

      if (res?.success) {
        // Refetch the full student data from backend so the table columns
        // (Total Optional Amount, Total Payable) reflect the persisted state
        try {
          await fetchAndSetStudentData();
        } catch (refetchErr) {
          console.error('Failed to refresh student data after save', refetchErr);
          // Don't surface this to the user — the save itself succeeded
        }

        setInvoiceResult({
          success: true,
          message: res?.message || 'Optional payments saved successfully.',
        });
      } else {
        setInvoiceResult({
          success: false,
          message: res?.message || 'Failed to save optional payments.',
        });
      }
    } catch (err) {
      console.error('Failed to save optional payments', err);
      setInvoiceResult({
        success: false,
        message: err?.response?.data?.message || 'An error occurred while saving optional payments.',
      });
    }
  };

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
        // Refetch student data so the table shows the new invoice status
        try {
          await fetchAndSetStudentData();
        } catch (refetchErr) {
          console.error('Failed to refresh student data after generation', refetchErr);
        }

        setInvoiceResult({
          success: true,
          message:
            res?.message || `Invoices generated successfully for ${studentData.length} student(s).`,
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
        message: err?.response?.data?.message || 'An error occurred while generating invoices.',
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

  const handlePrintInvoice = () => {
    if (!anchorStudent) return;
    handleMenuClose();
    setPrintStudent(anchorStudent);
    setPrintModalOpen(true);
  };

  const handleRegenerateInvoice = () => {
    if (!anchorStudent) return;
    setRegenerateTargetStudent(anchorStudent);
    handleMenuClose();
    setRegenerateConfirmOpen(true);
  };

  const handleCloseRegenerateConfirm = () => {
    setRegenerateConfirmOpen(false);
    setRegenerateTargetStudent(null);
  };

  const handleConfirmRegenerateInvoice = async () => {
    const student = regenerateTargetStudent;
    if (!student) return;

    setRegenerateConfirmOpen(false);
    setRegeneratingStudent(true);

    try {
      const payload = {
        session_term_id: Number(session_term_id),
        category_id: Number(selectedStudentCategory),
        class_id: Number(class_id),
        student_data: [
          {
            user_id: String(student.user_id),
            option_payment_ids: studentSelectedOptionIds[student.user_id] || [],
          },
        ],
      };

      const res = await generateStudentInvoice(payload);

      if (res?.success) {
        // Refetch student data so the table shows the updated invoice status
        try {
          await fetchAndSetStudentData();
        } catch (refetchErr) {
          console.error('Failed to refresh student data after regeneration', refetchErr);
        }

        setInvoiceResult({
          success: true,
          message: `Invoice regenerated successfully for ${student.name || student.user_id}.`,
        });
      } else {
        setInvoiceResult({
          success: false,
          message: res?.message || 'Failed to regenerate invoice.',
        });
      }
    } catch (err) {
      console.error('Failed to regenerate invoice', err);
      setInvoiceResult({
        success: false,
        message: err?.response?.data?.message || 'An error occurred while regenerating the invoice.',
      });
    } finally {
      setRegeneratingStudent(false);
    }
  };

  const handlePrintInvoiceForAll = () => {
    if (filteredStudents.length === 0) return;
    // const userIds = filteredStudents.map((s) => s.id).join(',');
    navigate(
      // `/payment-schedule/invoice/${session_term_id}/${class_id}/${selectedStudentCategory}/view?user_ids=${userIds}`,
      `/payment-schedule/invoice/${session_term_id}/${class_id}/${selectedStudentCategory}/view_class_invoice`,
    );
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
  // Show spinner while categories are still resolving OR students are loading
  if (categoriesLoading || (!categoriesReady && loading)) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
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
          <Box>
            <Typography
              variant="h5"
              sx={{
                fontSize: { xs: '1rem', sm: '1.25rem' },
                wordBreak: 'break-word',
              }}
            >
              Student Invoice List {sessionLabel}
              {termLabel ? ` - ${termLabel}` : ''} · {className}
            </Typography>
          </Box>
        }
      >
        <Box
          display="flex"
          flexDirection={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', sm: 'center' }}
          gap={1.5}
          mb={2}
        >
          <Button
            size="small"
            variant="outlined"
            onClick={() => navigate('/payment-schedule')}
            sx={{ alignSelf: { xs: 'flex-start', sm: 'auto' } }}
          >
            Back
          </Button>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            <Button
              size="small"
              variant="contained"
              disabled={selectedStudents.length === 0 || generatingInvoice}
              onClick={handleGenerateInvoiceClick}
              startIcon={generatingInvoice ? undefined : <DescriptionIcon />}
              sx={{
                width: { xs: '100%', sm: 'auto' },
                whiteSpace: 'nowrap',
              }}
            >
              {generatingInvoice ? (
                <CircularProgress size={16} sx={{ color: 'inherit', mr: 0.5 }} />
              ) : null}
              Generate Invoice
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={handlePrintInvoiceForAll}
              disabled={filteredStudents.length === 0}
              sx={{
                width: { xs: '100%', sm: 'auto' },
                whiteSpace: 'nowrap',
              }}
            >
              View Invoice for All
            </Button>
          </Stack>
        </Box>

        <Grid container spacing={1.5} mb={3} alignItems="center" justifyContent="flex-end">
          <Grid size={{ xs: 12, sm: 6, md: 'auto' }}>
            <FormControl size="small" fullWidth sx={{ minWidth: { xs: 1, sm: 200 } }}>
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
          <Grid size={{ xs: 12, sm: 6, md: 'auto' }}>
            <TextField
              size="small"
              placeholder="Search by name or ID"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              fullWidth
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

        {/* Show inline spinner while students load (after categories are ready) */}
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{
              overflowX: 'auto',
              overflowY: 'auto',
              borderRadius: 2,
              borderColor: 'grey.200',
              '& .MuiTableCell-root': {
                px: { xs: 1, sm: 2 },
                py: { xs: 0.75, sm: 1 },
              },
            }}
          >
            <Table sx={{ minWidth: { xs: 700, sm: 900 } }}>
              <TableHead>
                <TableRow>
                  <TableCell
                    padding="checkbox"
                    sx={{
                      borderBottom: '1px solid',
                      borderColor: 'grey.200',
                      px: { xs: 0.5, sm: 1 },
                    }}
                  >
                    <Checkbox
                      color="primary"
                      size="small"
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
                  {[
                    'User ID',
                    'Student Name',
                    'Category',
                    'Total Compulsory Amount',
                    'Total Optional Amount',
                    'Total Payable',
                    'Action',
                  ].map((header) => (
                    <TableCell
                      key={header}
                      sx={{
                        fontWeight: 600,
                        color: 'text.secondary',
                        borderBottom: '1px solid',
                        borderColor: 'grey.200',
                        fontSize: { xs: '0.7rem', sm: '0.8125rem' },
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {header}
                    </TableCell>
                  ))}
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
                    const compulsoryAmt = Number(student.total_compulsory_payment) || 0;
                    const optionalAmt = Number(studentOptionalAmounts[student.user_id]) || 0;
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
                        <TableCell padding="checkbox" sx={{ px: { xs: 0.5, sm: 1 } }}>
                          <Checkbox checked={isItemSelected} color="primary" size="small" />
                        </TableCell>
                        <TableCell
                          sx={{ fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                        >
                          {student.user_id}
                        </TableCell>
                        <TableCell
                          sx={{ fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                        >
                          {student.name}
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              bgcolor: 'primary.light',
                              py: 0.25,
                              borderRadius: 5,
                              display: 'inline-block',
                              px: { xs: 1, sm: 1.5 },
                            }}
                          >
                            <Typography
                              variant="caption"
                              fontWeight={600}
                              color="primary"
                              sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                            >
                              {student.category}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 600,
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            whiteSpace: 'nowrap',
                          }}
                        >
                          ₦{compulsoryAmt.toLocaleString()}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          <Box
                            display="flex"
                            flexDirection="column"
                            alignItems="center"
                            justifyContent="center"
                            gap={0.5}
                          >
                            {optionalAmt > 0 ? (
                              <Typography
                                variant="body2"
                                fontWeight={700}
                                textAlign="center"
                                sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
                              >
                                ₦{optionalAmt.toLocaleString()}
                              </Typography>
                            ) : (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                textAlign="center"
                                sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
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
                              disabled={!student.compulsory_invoice_number}
                              sx={{
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: { xs: 10, sm: 12 },
                                whiteSpace: 'nowrap',
                                minWidth: { xs: 'auto', sm: 'auto' },
                                px: { xs: 0.75, sm: 1.5 },
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
                              px: { xs: 1, sm: 1.5 },
                              py: 0.25,
                              borderRadius: 1,
                              display: 'inline-block',
                            }}
                          >
                            <Typography
                              variant="body2"
                              fontWeight={700}
                              sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
                            >
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
                            <MoreHorizIcon
                              sx={{ color: 'text.secondary', fontSize: { xs: 18, sm: 24 } }}
                            />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Menu
          anchorEl={anchorEl}
          open={openMenu}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={handlePrintInvoice}>Print Invoice</MenuItem>
          <MenuItem
            onClick={handleRegenerateInvoice}
            disabled={regeneratingStudent}
          >
            {regeneratingStudent ? 'Regenerating...' : 'Regenerate Invoice'}
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>Go to Student Ledger</MenuItem>
        </Menu>
      </ParentCard>

      {/* ─── Print Invoice Modal ─── */}
      <PrintInvoiceModal
        open={printModalOpen}
        onClose={() => {
          setPrintModalOpen(false);
          setPrintStudent(null);
        }}
        student={printStudent}
        sessionTermId={session_term_id}
        classId={class_id}
        categoryId={selectedStudentCategory}
      />

      {/* ─── Optional Payment Modal ─── */}
      <Dialog open={optionalModalOpen} onClose={handleCloseOptionalModal} maxWidth="sm" fullWidth>
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
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
              <CircularProgress />
            </Box>
          ) : optionalPaymentList.length === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              No optional payments available for this class/category.
            </Alert>
          ) : (
            <Stack spacing={1} sx={{ mt: 1 }}>
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
                      indeterminate={selectedOptionalIds.size > 0 && !allOptionalSelected}
                      onChange={handleToggleAllOptional}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2" fontWeight={600}>
                      {allOptionalSelected ? 'Unmark All' : 'Mark All'}
                    </Typography>
                  }
                />
                <Typography variant="caption" color="text.secondary">
                  {selectedOptionalIds.size} of {allOptionalItems.length} selected
                </Typography>
              </Box>

              <Divider />

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
                            onChange={() => handleToggleOptionalItem(opt.option_id)}
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
                            sx={{ minWidth: { xs: 180, sm: 250 } }}
                          >
                            <Typography
                              variant="body2"
                              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, mr: 1 }}
                            >
                              {opt.option_name}
                            </Typography>
                            <Typography
                              variant="body2"
                              fontWeight={700}
                              color="text.secondary"
                              sx={{
                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                whiteSpace: 'nowrap',
                              }}
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
          <Button onClick={handleCloseOptionalModal}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddOptionalPayments}
            disabled={selectedOptionalIds.size === 0}
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
                    {categories.find((c) => String(c.id) === selectedStudentCategory)?.name ||
                      'N/A'}
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
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleConfirmGenerateInvoice}
            sx={{ fontWeight: 600 }}
            startIcon={<DescriptionIcon />}
          >
            Yes, Generate
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── Regenerate Invoice Confirmation Dialog ─── */}
      <Dialog
        open={regenerateConfirmOpen}
        onClose={handleCloseRegenerateConfirm}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <DescriptionIcon color="success" />
            <Typography variant="h6" fontWeight={700}>
              Regenerate Invoice
            </Typography>
          </Box>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
          <Typography variant="body1">
            Are you sure you want to regenerate invoice for this student?
          </Typography>

          {regenerateTargetStudent && (
            <Box
              sx={{
                mt: 2,
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
                    Student
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {regenerateTargetStudent.name} ({regenerateTargetStudent.user_id})
                  </Typography>
                </Box>
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
                    {categories.find((c) => String(c.id) === selectedStudentCategory)?.name || 'N/A'}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          )}

          <Alert severity="info" sx={{ mt: 2 }}>
            This will overwrite any existing invoice for this student.
          </Alert>
        </DialogContent>

        <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 2 }, gap: 1 }}>
          <Button onClick={handleCloseRegenerateConfirm}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleConfirmRegenerateInvoice}
            sx={{ fontWeight: 600 }}
            startIcon={<DescriptionIcon />}
          >
            Yes, Regenerate
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── Invoice Result Alert ─── */}
      <Dialog
        open={Boolean(invoiceResult)}
        onClose={handleCloseInvoiceResult}
        maxWidth="xs"
        fullWidth
      >
        <DialogContent sx={{ textAlign: 'center', py: 3 }}>
          {invoiceResult?.success ? (
            <DescriptionIcon sx={{ fontSize: 48, color: 'success.main', mb: 1.5 }} />
          ) : (
            <CloseIcon sx={{ fontSize: 48, color: 'error.main', mb: 1.5 }} />
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
          <Button variant="contained" onClick={handleCloseInvoiceResult}>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default InvoiceStudentsView;
