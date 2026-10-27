import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Button,
  IconButton,
  Menu,
  Chip,
  TablePagination,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Tooltip,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ParentCard from '@/components/shared/ParentCard';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  GetApp as DownloadIcon,
  GroupsOutlined as GroupsIcon,
  SendOutlined as SendIcon,
  MarkEmailReadOutlined as AlreadySentIcon,
  PersonOffOutlined as MissingContactIcon,
  EmailOutlined as EmailTabIcon,
  SmsOutlined as SmsTabIcon,
  ArticleOutlined as ExcelTabIcon,
  SettingsOutlined as SettingsIcon,
  AutoAwesome as AiIcon,
  RestartAlt as RestoreIcon,
  CheckCircle as ReadyIcon,
  ChecklistOutlined as BulkActionsIcon,
  CloseOutlined as RemoveChipIcon,
  AddOutlined as AddClassesIcon,
} from '@mui/icons-material';
import TiptapEdit from 'src/pages/landlord/views/forms/form-tiptap/TiptapEdit';
import {
  fetchSendInvoiceFilterOptions,
  fetchClassesByProgramme,
  fetchParentsForInvoice,
  updateParentPhoneNumberOrEmail,
  sendInvoiceSms,
  sendInvoiceEmail,
  generateInvoiceExcel,
} from '@/api/tenant/bursary/sendInvoiceApi';
import { fetchActiveTenantSessionTerm } from '@/api/tenant/session-term/sessionTermApi';

const INVOICE_PLACEHOLDER_FIELDS = [
  { label: "Student's First Name", value: '{student_fname}' },
  { label: "Student's Last Name", value: '{student_lname}' },
  { label: "Parent's First Name", value: '{student_parent_fname}' },
  { label: "Parent's Last Name", value: '{student_parent_lname}' },
  { label: 'Term', value: '{term_name}' },
  { label: 'Session', value: '{session_name}' },
  { label: 'School Name', value: '{school_name}' },
];

const DEFAULT_SUBJECT = 'Invoice for {student_fname} {student_lname} — {term_name} {session_name}';
const DEFAULT_EMAIL_BODY = `<p>Dear Parent,</p><p>Please find attached the school invoice for <strong>{student_fname} {student_lname}</strong> for <strong>{term_name} {session_name}</strong>.</p><p>You can view and pay the invoice securely using the button below.</p><p>Best regards,<br><strong>{school_name}</strong></p>`;
const DEFAULT_SMS_BODY =
  'Dear Parent, the invoice for {student_fname} {student_lname} for {term_name} {session_name} is ready. Please check your email or the parent portal to view and pay it. - {school_name}';

const CURRENCY = (value) => `₦${Number(value || 0).toLocaleString()}`;

/** Icon tile + title + subtitle + chevron — the same stat-card header shape
 * used on the Set Schedule and Generate Invoice steps, for visual
 * consistency across all 3 steps of this flow. */
const StatCard = ({ icon: Icon, iconBg, iconColor, title, subtitle, value, loading }) => (
  <Paper
    variant="outlined"
    sx={{ p: 2, borderRadius: '14px', height: '100%', borderColor: '#E5E7EB' }}
  >
    <Box display="flex" alignItems="center" gap={1} mb={1.5}>
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: '8px',
          bgcolor: iconBg,
          color: iconColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon sx={{ fontSize: 18 }} />
      </Box>
      <Box>
        <Typography variant="body2" fontWeight={700}>
          {title}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
      </Box>
    </Box>
    <Typography variant="h4" fontWeight={700} sx={{ color: iconColor, lineHeight: 1 }}>
      {loading ? <CircularProgress size={22} /> : value}
    </Typography>
  </Paper>
);

const SendInvoiceTab = ({ showSnackbar }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const navigate = useNavigate();
  // 0 = Email, 1 = SMS, 2 = Excel — Email leads since it's the primary channel.
  const [channelTab, setChannelTab] = useState(0);

  const [sessionTerms, setSessionTerms] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loadingFilters, setLoadingFilters] = useState(false);

  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [selectedTermId, setSelectedTermId] = useState('');
  const [selectedProgrammeId, setSelectedProgrammeId] = useState('');
  // Multi-select — the filter bar now shows removable chips for each.
  const [selectedClassIds, setSelectedClassIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [tableSearch, setTableSearch] = useState('');

  const [programmeClasses, setProgrammeClasses] = useState([]);
  const [loadingProgrammeClasses, setLoadingProgrammeClasses] = useState(false);

  const [parentsList, setParentsList] = useState([]);
  const [loadingParents, setLoadingParents] = useState(false);

  const [selectedParents, setSelectedParents] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuParent, setMenuParent] = useState(null);
  const [bulkMenuAnchor, setBulkMenuAnchor] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editParent, setEditParent] = useState(null);
  const [editField, setEditField] = useState('');
  const [editValue, setEditValue] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState('');
  const [sendingInvoice, setSendingInvoice] = useState(false);
  const [previewRecipientsOpen, setPreviewRecipientsOpen] = useState(false);
  const [addClassAnchorEl, setAddClassAnchorEl] = useState(null);
  const [composeView, setComposeView] = useState('compose'); // 'compose' | 'preview'

  const [emailSubject, setEmailSubject] = useState(DEFAULT_SUBJECT);
  const [emailBody, setEmailBody] = useState(DEFAULT_EMAIL_BODY);
  const [smsBody, setSmsBody] = useState(DEFAULT_SMS_BODY);
  const [editorKey, setEditorKey] = useState(0);

  const [generatingExcel, setGeneratingExcel] = useState(false);
  const [excelBlobUrl, setExcelBlobUrl] = useState(null);

  const searchTimerRef = useRef(null);
  const tiptapEditorRef = useRef(null);
  const smsTextRef = useRef(null);

  const handleInsertPlaceholder = (value) => {
    if (channelTab === 0) {
      if (tiptapEditorRef.current) {
        tiptapEditorRef.current.chain().focus().insertContent(value).run();
      }
    } else if (channelTab === 1) {
      const el = smsTextRef.current;
      if (el) {
        const start = el.selectionStart ?? smsBody.length;
        const end = el.selectionEnd ?? smsBody.length;
        const next = smsBody.slice(0, start) + value + smsBody.slice(end);
        setSmsBody(next);
      } else {
        setSmsBody((prev) => prev + value);
      }
    }
  };

  const selectedClassName =
    selectedClassIds.length === 1
      ? programmeClasses.find((c) => String(c.id) === String(selectedClassIds[0]))?.class_name ||
        classes.find((c) => String(c.id) === String(selectedClassIds[0]))?.class_name ||
        ''
      : '';

  const distinctSessions = useMemo(() => {
    const bySessionId = new Map();
    sessionTerms.forEach((item) => {
      if (!bySessionId.has(item.session_id)) {
        bySessionId.set(item.session_id, item);
      }
    });
    return Array.from(bySessionId.values());
  }, [sessionTerms]);

  const termsForSelectedSession = useMemo(
    () => sessionTerms.filter((item) => item.session_id === selectedSessionId),
    [sessionTerms, selectedSessionId],
  );

  const selectedSessionTermId =
    sessionTerms.find(
      (item) => item.session_id === selectedSessionId && item.term_id === selectedTermId,
    )?.id || '';

  const loadFilterOptions = useCallback(async () => {
    try {
      setLoadingFilters(true);
      const [res, activeRes] = await Promise.all([
        fetchSendInvoiceFilterOptions(),
        fetchActiveTenantSessionTerm(),
      ]);
      if (res?.success && res.data) {
        const { session_terms, programmes: progs, classes: cls } = res.data;

        setSessionTerms(session_terms || []);
        setProgrammes(progs || []);
        setClasses(cls || []);

        if (session_terms?.length > 0 && !selectedSessionId) {
          const activeSessionTerm = activeRes?.status ? activeRes.data : null;
          const defaultTerm =
            (activeSessionTerm && session_terms.find((st) => st.id === activeSessionTerm.id)) ||
            session_terms[0];
          setSelectedSessionId(defaultTerm.session_id);
          setSelectedTermId(defaultTerm.term_id);
        }
        if (progs?.length > 0 && !selectedProgrammeId) {
          setSelectedProgrammeId(String(progs[0].id));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingFilters(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadClassesByProgramme = useCallback(async () => {
    if (!selectedProgrammeId) {
      setProgrammeClasses([]);
      return;
    }
    try {
      setLoadingProgrammeClasses(true);
      const res = await fetchClassesByProgramme(selectedProgrammeId);
      if (res?.success && res.data) {
        setProgrammeClasses(res.data || []);
        setSelectedClassIds((prev) => {
          const stillValid = prev.filter((id) => res.data.some((c) => String(c.id) === String(id)));
          if (stillValid.length > 0) return stillValid;
          return res.data.length > 0 ? [String(res.data[0].id)] : [];
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingProgrammeClasses(false);
    }
  }, [selectedProgrammeId]);

  useEffect(() => {
    loadFilterOptions();
  }, [loadFilterOptions]);

  useEffect(() => {
    if (!selectedSessionId || termsForSelectedSession.length === 0) return;
    const stillValid = termsForSelectedSession.some((item) => item.term_id === selectedTermId);
    if (!stillValid) {
      setSelectedTermId(termsForSelectedSession[0].term_id);
    }
  }, [selectedSessionId, termsForSelectedSession, selectedTermId]);

  useEffect(() => {
    loadClassesByProgramme();
  }, [loadClassesByProgramme]);

  const loadParents = useCallback(async () => {
    if (!selectedSessionTermId) return;
    try {
      setLoadingParents(true);
      const res = await fetchParentsForInvoice({
        sessionTermId: selectedSessionTermId,
        classIds: selectedClassIds,
        programmeId: selectedProgrammeId || undefined,
        search: searchQuery || undefined,
      });
      if (res?.success) {
        setParentsList(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load parents', err);
      showSnackbar?.('Failed to load parents', 'error');
    } finally {
      setLoadingParents(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSessionTermId, selectedClassIds, selectedProgrammeId, searchQuery, showSnackbar]);

  useEffect(() => {
    loadParents();
  }, [loadParents]);

  const handleRefresh = () => {
    setPage(0);
    setSelectedParents([]);
    loadParents();
  };

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // ---- Per-channel status helpers — the same 3-way split (Ready / Sent /
  // Missing contact) drives the top stat cards, the mini-badges and the
  // table's own Status column, so none of them can disagree. ----
  const statusField =
    channelTab === 0 ? 'email_status' : channelTab === 1 ? 'sms_status' : 'excel_status';
  const contactField =
    channelTab === 2 ? 'guardian_email' : channelTab === 0 ? 'guardian_email' : 'guardian_phone';
  const sentValue = channelTab === 2 ? 'generated' : 'sent';

  const rowState = (p) => {
    if (!p[contactField]) return 'missing';
    if (p[statusField] === sentValue) return 'sent';
    return 'ready';
  };

  const filteredParentsList = useMemo(() => {
    if (!tableSearch.trim()) return parentsList;
    const q = tableSearch.trim().toLowerCase();
    return parentsList.filter(
      (p) =>
        p.student_name?.toLowerCase().includes(q) ||
        p.guardian_name?.toLowerCase().includes(q) ||
        p.guardian_email?.toLowerCase().includes(q),
    );
  }, [parentsList, tableSearch]);

  const readyCount = parentsList.filter((p) => rowState(p) === 'ready').length;
  const sentCount = parentsList.filter((p) => rowState(p) === 'sent').length;
  const missingCount = parentsList.filter((p) => rowState(p) === 'missing').length;

  const paginatedParentsList = filteredParentsList.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedParents(
        filteredParentsList.filter((p) => rowState(p) !== 'missing').map((p) => p.guardian_user_id),
      );
    } else {
      setSelectedParents([]);
    }
  };

  const handleSelectParent = (p) => {
    if (rowState(p) === 'missing') return;
    setSelectedParents((prev) =>
      prev.includes(p.guardian_user_id)
        ? prev.filter((id) => id !== p.guardian_user_id)
        : [...prev, p.guardian_user_id],
    );
  };

  const handleBulkSelectReady = () => {
    setSelectedParents(
      parentsList.filter((p) => rowState(p) === 'ready').map((p) => p.guardian_user_id),
    );
    setBulkMenuAnchor(null);
  };
  const handleBulkDeselectAll = () => {
    setSelectedParents([]);
    setBulkMenuAnchor(null);
  };
  const handleBulkSelectPage = () => {
    setSelectedParents((prev) => {
      const next = new Set(prev);
      paginatedParentsList
        .filter((p) => rowState(p) !== 'missing')
        .forEach((p) => next.add(p.guardian_user_id));
      return [...next];
    });
    setBulkMenuAnchor(null);
  };

  const handleMenuClick = (event, row) => {
    setAnchorEl(event.currentTarget);
    setMenuParent(row);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuParent(null);
  };

  const handleOpenEditDialog = (field) => {
    handleMenuClose();
    if (!menuParent) return;
    setEditParent(menuParent);
    setEditField(field);
    setEditValue(
      field === 'phone' ? menuParent.guardian_phone || '' : menuParent.guardian_email || '',
    );
    setEditError('');
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setEditParent(null);
    setEditValue('');
    setEditError('');
  };

  const handleSaveEdit = async () => {
    if (!editValue.trim()) {
      setEditError(editField === 'email' ? 'Email is required' : 'Phone number is required');
      return;
    }
    if (editField === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editValue)) {
      setEditError('Please enter a valid email address');
      return;
    }
    try {
      setSavingEdit(true);
      const res = await updateParentPhoneNumberOrEmail(
        editParent.guardian_user_id,
        editField,
        editValue.trim(),
      );
      if (res?.success) {
        showSnackbar?.(
          `${editField === 'phone' ? 'Phone' : 'Email'} updated successfully`,
          'success',
        );
        handleCloseEditDialog();
        loadParents();
      } else {
        setEditError(res?.message || 'Failed to update');
      }
    } catch (err) {
      setEditError(err?.response?.data?.message || 'Something went wrong');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleChannelTabChange = (event, newValue) => {
    setChannelTab(newValue);
    setSelectedParents([]);
    setPage(0);
    setComposeView('compose');
  };

  const handleRestoreTemplate = () => {
    if (channelTab === 0) {
      setEmailSubject(DEFAULT_SUBJECT);
      setEmailBody(DEFAULT_EMAIL_BODY);
      setEditorKey((k) => k + 1);
    } else if (channelTab === 1) {
      setSmsBody(DEFAULT_SMS_BODY);
    }
    showSnackbar?.('Template restored', 'success');
  };

  const handleEditorUpdate = useCallback(({ editor }) => {
    tiptapEditorRef.current = editor;
    setEmailBody(editor.getHTML());
  }, []);

  const resolvePreview = (template) => {
    const sample =
      parentsList.find((p) => selectedParents.includes(p.guardian_user_id)) || parentsList[0];
    if (!sample) return template;
    const [sfname, ...rest] = (sample.student_name || '').split(' ');
    const [gfname, ...grest] = (sample.guardian_name || '').split(' ');
    return template
      .replaceAll('{student_fname}', sfname || 'Student')
      .replaceAll('{student_lname}', rest.join(' ') || '')
      .replaceAll('{student_parent_fname}', gfname || 'Parent')
      .replaceAll('{student_parent_lname}', grest.join(' ') || '')
      .replaceAll('{term_name}', 'First Term')
      .replaceAll('{session_name}', '2025/2026')
      .replaceAll('{school_name}', 'Your School');
  };

  const handleSendInvoice = async () => {
    if (selectedParents.length === 0) {
      showSnackbar?.('Please select at least one parent', 'warning');
      return;
    }
    try {
      setSendingInvoice(true);
      const action = channelTab === 0 ? sendInvoiceEmail : sendInvoiceSms;
      const res = await action({
        sessionTermId: selectedSessionTermId,
        parentIds: selectedParents,
        customMessage: channelTab === 0 ? emailBody : smsBody,
        ...(channelTab === 0 && { subject: emailSubject }),
      });

      if (res?.success) {
        showSnackbar?.(
          `Successfully queued ${res.sent_count} ${channelTab === 0 ? 'emails' : 'SMS messages'}.`,
          'success',
        );
        loadParents();
      } else {
        showSnackbar?.(res?.message || 'Failed to send invoice.', 'error');
      }
      setSelectedParents([]);
    } catch (err) {
      console.error('Send invoice error:', err);
      showSnackbar?.(err?.response?.data?.message || 'Failed to send invoices.', 'error');
    } finally {
      setSendingInvoice(false);
    }
  };

  const handleGenerateExcelInvoice = async () => {
    const excelClassId = selectedClassIds[0];
    if (!selectedSessionTermId || !excelClassId) {
      showSnackbar?.('Please select a session term and a class.', 'warning');
      return;
    }
    try {
      setGeneratingExcel(true);
      const res = await generateInvoiceExcel({
        session_term_id: selectedSessionTermId,
        class_id: excelClassId,
        programme_id: selectedProgrammeId || undefined,
      });
      if (res) {
        const url = window.URL.createObjectURL(new Blob([res]));
        setExcelBlobUrl(url);
        showSnackbar?.('Excel invoice generated successfully. You can now download it.', 'success');
        loadParents();
      }
    } catch (err) {
      showSnackbar?.('Failed to generate Excel invoice.', 'error');
    } finally {
      setGeneratingExcel(false);
    }
  };

  const handleRemoveClassChip = (id) => {
    setSelectedClassIds((prev) => prev.filter((cid) => String(cid) !== String(id)));
  };

  const classOptionsForFilter = programmeClasses.length > 0 ? programmeClasses : classes;

  const channelLabel = channelTab === 0 ? 'email' : channelTab === 1 ? 'SMS' : 'Excel';

  const statCards = [
    {
      icon: GroupsIcon,
      iconBg: isDark ? 'rgba(79,70,229,0.18)' : '#EEF2FF',
      iconColor: '#4F46E5',
      title: 'Parents in Scope',
      // Counted the same unit as Ready/Sent/Missing below (one row per
      // guardian-student pair, since an invoice email/SMS goes out per
      // student, not once per guardian) — so the 4 cards always add up.
      subtitle: 'Invoices in scope for this term',
      value: parentsList.length,
    },
    {
      icon: SendIcon,
      iconBg: isDark ? 'rgba(22,163,74,0.18)' : '#ECFDF5',
      iconColor: 'success.main' === 'success.main' ? '#16A34A' : '#16A34A',
      title: 'Ready to Send',
      subtitle: `Invoices ready to be sent by ${channelLabel}`,
      value: readyCount,
    },
    {
      icon: AlreadySentIcon,
      iconBg: isDark ? 'rgba(147,51,234,0.18)' : '#F3E8FF',
      iconColor: '#9333EA',
      title: 'Already Sent',
      subtitle: `Invoices sent successfully by ${channelLabel}`,
      value: sentCount,
    },
    {
      icon: MissingContactIcon,
      iconBg:
        missingCount > 0
          ? isDark
            ? 'rgba(220,38,38,0.18)'
            : '#FEF2F2'
          : isDark
            ? 'rgba(22,163,74,0.18)'
            : '#ECFDF5',
      iconColor: missingCount > 0 ? 'error.main' : 'success.main',
      title: 'Missing Contact',
      subtitle: `Students without a ${channelTab === 1 ? 'phone number' : 'parent email'} on file`,
      value: missingCount,
    },
  ];

  const renderStatusChip = (p) => {
    const state = rowState(p);
    if (state === 'sent') {
      return (
        <Chip
          label={channelTab === 2 ? 'Generated' : 'Sent'}
          size="small"
          sx={{ bgcolor: '#DCFCE7', color: '#15803D', fontWeight: 700 }}
        />
      );
    }
    if (state === 'missing') {
      return (
        <Chip
          label={`Missing ${channelTab === 1 ? 'phone' : 'email'}`}
          size="small"
          sx={{ bgcolor: '#FFEDD5', color: '#C2410C', fontWeight: 700 }}
        />
      );
    }
    return (
      <Chip
        label="Ready"
        size="small"
        sx={{ bgcolor: '#DBEAFE', color: '#1D4ED8', fontWeight: 700 }}
      />
    );
  };

  const renderRecipientsAndMessage = () => (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 5 }}>
        <ParentCard sx={{ '& .MuiCardContent-root': { p: 2, '&:last-child': { pb: 2 } } }}>
          <Box mb={1.5}>
            <Typography variant="subtitle1" fontWeight={700}>
              Recipients ({parentsList.length} parents)
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Select the parents to send invoice {channelTab === 0 ? 'emails' : 'SMS messages'}.
              Each selected parent will receive one invoice for their child.
            </Typography>
          </Box>

          <TextField
            size="small"
            fullWidth
            placeholder="Search by student name, parent name or email..."
            value={tableSearch}
            onChange={(e) => setTableSearch(e.target.value)}
            sx={{ mb: 1.5 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />

          <Stack direction="row" spacing={1.5} mb={1.5} flexWrap="wrap" useFlexGap>
            <Chip
              label={`${readyCount} Ready to Send`}
              size="small"
              sx={{ bgcolor: '#DBEAFE', color: '#1D4ED8', fontWeight: 700 }}
            />
            <Chip
              label={`${sentCount} Already Sent`}
              size="small"
              sx={{ bgcolor: '#DCFCE7', color: '#15803D', fontWeight: 700 }}
            />
            <Chip
              label={`${missingCount} Missing Contact`}
              size="small"
              sx={{ bgcolor: '#FFEDD5', color: '#C2410C', fontWeight: 700 }}
            />
          </Stack>

          <TableContainer sx={{ maxHeight: 420, overflowY: 'auto' }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      size="small"
                      indeterminate={
                        selectedParents.length > 0 && selectedParents.length < parentsList.length
                      }
                      checked={
                        parentsList.length > 0 && selectedParents.length === parentsList.length
                      }
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Student Name (Admission No.)</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>
                    Parent Name ({channelTab === 1 ? 'Phone' : 'Email'})
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">
                    Invoice Amount
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingParents ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : paginatedParentsList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Alert severity="info" sx={{ justifyContent: 'center' }}>
                        No parents found for the selected filters.
                      </Alert>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedParentsList.map((row) => {
                    const state = rowState(row);
                    return (
                      <TableRow
                        key={`${row.guardian_user_id}-${row.student_registration_id}`}
                        hover
                        selected={selectedParents.includes(row.guardian_user_id)}
                        sx={{ opacity: state === 'missing' ? 0.6 : 1 }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            size="small"
                            checked={selectedParents.includes(row.guardian_user_id)}
                            disabled={state === 'missing'}
                            onChange={() => handleSelectParent(row)}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={700}>
                            {row.student_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {row.admission_no}
                            {row.class_name ? ` • ${row.class_name}` : ''}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {row.guardian_name}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ wordBreak: 'break-all' }}
                          >
                            {channelTab === 1
                              ? row.guardian_phone || '—'
                              : row.guardian_email || '—'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={700}>
                            {CURRENCY(row.invoice_amount)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={0.5}>
                            {renderStatusChip(row)}
                            <IconButton size="small" onClick={(e) => handleMenuClick(e, row)}>
                              <MoreVertIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={filteredParentsList.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />

          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem onClick={() => handleOpenEditDialog(channelTab === 1 ? 'phone' : 'email')}>
              {channelTab === 1 ? 'Edit Parent Line' : 'Edit Email'}
            </MenuItem>
          </Menu>

          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            mt={1.5}
            flexWrap="wrap"
            gap={1}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                size="small"
                variant="outlined"
                startIcon={<BulkActionsIcon fontSize="small" />}
                onClick={(e) => setBulkMenuAnchor(e.currentTarget)}
                sx={{ fontWeight: 600, textTransform: 'none' }}
              >
                Bulk Actions ({selectedParents.length} selected)
              </Button>
              <Menu
                anchorEl={bulkMenuAnchor}
                open={Boolean(bulkMenuAnchor)}
                onClose={() => setBulkMenuAnchor(null)}
              >
                <MenuItem onClick={handleBulkSelectReady}>
                  Select all ready to send ({readyCount})
                </MenuItem>
                <MenuItem onClick={handleBulkSelectPage}>Select all on this page</MenuItem>
                <MenuItem onClick={handleBulkDeselectAll}>Deselect all</MenuItem>
              </Menu>
            </Stack>
            <Typography variant="caption" color="text.secondary">
              {selectedParents.length} parent{selectedParents.length === 1 ? '' : 's'} selected
            </Typography>
          </Box>

          {missingCount > 0 && (
            <Alert
              severity="warning"
              variant="outlined"
              sx={{ mt: 1.5, py: 0.5 }}
              action={
                <Button
                  size="small"
                  onClick={() => setTableSearch('') || setPreviewRecipientsOpen(true)}
                >
                  View details →
                </Button>
              }
            >
              Some students have no parent contact details. They will be excluded from sending.
            </Alert>
          )}
        </ParentCard>
      </Grid>

      <Grid size={{ xs: 12, md: 7 }}>
        <ParentCard
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            '& .MuiCardContent-root': {
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              '&:last-child': { pb: 2 },
            },
          }}
        >
          <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={1}>
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>
                {channelTab === 0 ? 'Email Message' : 'SMS Message'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                This message will be personalised for each student using their details.
              </Typography>
            </Box>
            <Box textAlign="right" flexShrink={0}>
              <Typography variant="caption" color="text.secondary" display="block">
                Sending to
              </Typography>
              <Typography variant="body2" fontWeight={700} color="primary.main">
                {selectedParents.length || readyCount} parents
              </Typography>
            </Box>
          </Box>

          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            mb={1.5}
            flexWrap="wrap"
            gap={1}
          >
            <Tabs
              value={composeView}
              onChange={(e, v) => setComposeView(v)}
              sx={{
                minHeight: 32,
                '& .MuiTab-root': {
                  minHeight: 32,
                  py: 0.5,
                  textTransform: 'none',
                  fontWeight: 600,
                },
              }}
            >
              <Tab value="compose" label="Compose" />
              <Tab value="preview" label="Preview" />
            </Tabs>
            <Stack direction="row" spacing={1}>
              <Tooltip title="AI rewriting isn't connected yet — coming soon">
                <span>
                  <Button
                    size="small"
                    startIcon={<AiIcon fontSize="small" />}
                    disabled
                    sx={{ textTransform: 'none' }}
                  >
                    Improve message (AI)
                  </Button>
                </span>
              </Tooltip>
              <Button
                size="small"
                startIcon={<RestoreIcon fontSize="small" />}
                onClick={handleRestoreTemplate}
                sx={{ textTransform: 'none' }}
              >
                Restore template
              </Button>
            </Stack>
          </Box>

          {composeView === 'compose' ? (
            <>
              {channelTab === 0 && (
                <TextField
                  size="small"
                  fullWidth
                  label="Email Subject"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  sx={{ mb: 1.5 }}
                />
              )}

              {channelTab === 0 ? (
                <Box sx={{ overflow: 'hidden', mb: 1.5 }}>
                  <TiptapEdit
                    key={editorKey}
                    initialContent={emailBody}
                    onUpdate={handleEditorUpdate}
                  />
                </Box>
              ) : (
                <TextField
                  inputRef={smsTextRef}
                  multiline
                  minRows={6}
                  fullWidth
                  value={smsBody}
                  onChange={(e) => setSmsBody(e.target.value)}
                  sx={{ mb: 0.5 }}
                />
              )}
              {channelTab === 1 && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  sx={{ mb: 1.5 }}
                >
                  {smsBody.length} characters · {Math.ceil(smsBody.length / 160) || 1} SMS segment
                  {Math.ceil(smsBody.length / 160) === 1 ? '' : 's'} per message
                </Typography>
              )}

              <Typography
                variant="caption"
                fontWeight={700}
                color="text.secondary"
                display="block"
                mb={0.75}
              >
                Available merge tags
              </Typography>
              <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mb: 1.5 }}>
                {INVOICE_PLACEHOLDER_FIELDS.map((field) => (
                  <Chip
                    key={field.value}
                    label={field.label}
                    size="small"
                    onClick={() => handleInsertPlaceholder(field.value)}
                    sx={{ cursor: 'pointer', fontWeight: 600 }}
                  />
                ))}
              </Stack>

              {channelTab === 0 && (
                <Alert severity="info" icon={false} sx={{ mb: 1.5, py: 0.5, fontSize: 12 }}>
                  An <strong>Invoice Button</strong> is automatically included in every email — no
                  need to add a link manually.
                </Alert>
              )}
            </>
          ) : (
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 1.5, flex: 1 }}>
              {channelTab === 0 && (
                <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>
                  Subject: {resolvePreview(emailSubject)}
                </Typography>
              )}
              {channelTab === 0 ? (
                <Box
                  sx={{ '& p': { mt: 0 } }}
                  dangerouslySetInnerHTML={{ __html: resolvePreview(emailBody) }}
                />
              ) : (
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {resolvePreview(smsBody)}
                </Typography>
              )}
            </Paper>
          )}

          <Box sx={{ flex: 1 }} />

          <Divider sx={{ my: 1.5 }} />
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={1.5}
          >
            <Box display="flex" alignItems="flex-start" gap={1}>
              <ReadyIcon sx={{ color: 'success.main', fontSize: 18, mt: 0.2 }} />
              <Box>
                <Typography variant="body2" fontWeight={700}>
                  Ready to send
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  You are about to send invoice {channelTab === 0 ? 'emails' : 'SMS messages'} to{' '}
                  {selectedParents.length || readyCount} parents.{' '}
                  {sentCount > 0 &&
                    `${sentCount} parents have already been sent invoices for this term.`}
                </Typography>
              </Box>
            </Box>
            <Stack direction="row" spacing={1} flexShrink={0}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  try {
                    localStorage.setItem(
                      `send_invoice_draft_${channelTab}`,
                      JSON.stringify({
                        subject: emailSubject,
                        body: channelTab === 0 ? emailBody : smsBody,
                      }),
                    );
                    showSnackbar?.('Draft saved on this device', 'success');
                  } catch {
                    showSnackbar?.('Could not save draft', 'error');
                  }
                }}
                sx={{ fontWeight: 600, textTransform: 'none' }}
              >
                Save Draft
              </Button>
              <Button
                size="small"
                variant="contained"
                startIcon={!sendingInvoice && <SendIcon fontSize="small" />}
                onClick={handleSendInvoice}
                disabled={sendingInvoice || selectedParents.length === 0}
                sx={{ fontWeight: 700, textTransform: 'none' }}
              >
                {sendingInvoice ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  `Send to ${selectedParents.length || 0} parents`
                )}
              </Button>
            </Stack>
          </Stack>
        </ParentCard>
      </Grid>
    </Grid>
  );

  const renderExcelContent = () => (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 7 }}>
        <ParentCard sx={{ '& .MuiCardContent-root': { p: 2, '&:last-child': { pb: 2 } } }}>
          <Box mb={1.5}>
            <Typography variant="subtitle1" fontWeight={700}>
              Recipients ({parentsList.length} parents)
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Excel invoices are generated one workbook per class — using{' '}
              <strong>{selectedClassName || 'the first selected class'}</strong>. Select just one
              class above for a different one.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} mb={1.5} flexWrap="wrap" useFlexGap>
            <Chip
              label={`${readyCount} Pending`}
              size="small"
              sx={{ bgcolor: '#DBEAFE', color: '#1D4ED8', fontWeight: 700 }}
            />
            <Chip
              label={`${sentCount} Generated`}
              size="small"
              sx={{ bgcolor: '#DCFCE7', color: '#15803D', fontWeight: 700 }}
            />
            <Chip
              label={`${missingCount} Missing Email`}
              size="small"
              sx={{ bgcolor: '#FFEDD5', color: '#C2410C', fontWeight: 700 }}
            />
          </Stack>

          <TableContainer sx={{ maxHeight: 420, overflowY: 'auto' }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Student Name (Admission No.)</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Class / Arm</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">
                    Invoice Amount
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingParents ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : paginatedParentsList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                      <Alert severity="info">No parents found</Alert>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedParentsList.map((row) => (
                    <TableRow key={`${row.guardian_user_id}-${row.student_registration_id}`} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={700}>
                          {row.student_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {row.admission_no}
                        </Typography>
                      </TableCell>
                      <TableCell>{row.class_name}</TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={700}>
                          {CURRENCY(row.invoice_amount)}
                        </Typography>
                      </TableCell>
                      <TableCell>{renderStatusChip(row)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={filteredParentsList.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </ParentCard>
      </Grid>

      <Grid size={{ xs: 12, md: 5 }}>
        <ParentCard
          sx={{ height: '100%', '& .MuiCardContent-root': { p: 2, '&:last-child': { pb: 2 } } }}
        >
          <Typography variant="subtitle1" fontWeight={700} mb={0.5}>
            Generate Excel Invoice
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" mb={2}>
            Downloads one spreadsheet containing every student's invoice summary for the selected
            class and term.
          </Typography>
          <Stack spacing={1.5}>
            <Button
              variant="contained"
              onClick={handleGenerateExcelInvoice}
              disabled={generatingExcel || !selectedSessionTermId || selectedClassIds.length === 0}
              sx={{ fontWeight: 700 }}
            >
              {generatingExcel ? <CircularProgress size={20} color="inherit" /> : 'Generate Excel'}
            </Button>
            {excelBlobUrl && (
              <Button
                variant="outlined"
                startIcon={<DownloadIcon fontSize="small" />}
                component="a"
                href={excelBlobUrl}
                download={`Invoices_${selectedClassName || 'Class'}.xlsx`}
              >
                Download
              </Button>
            )}
          </Stack>
        </ParentCard>
      </Grid>
    </Grid>
  );

  return (
    <Box>
      <Grid container spacing={2} mb={2}>
        {statCards.map((card, idx) => (
          <Grid key={idx} size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard {...card} loading={loadingParents && idx > 0} />
          </Grid>
        ))}
      </Grid>

      <Box
        p={1}
        mb={1}
        sx={{
          borderBottom: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
        }}
      >
        <Box
          display="flex"
          flexDirection={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
          gap={2}
          mb={2}
          pb={2}
          sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
        >
          <Tabs
            value={channelTab}
            onChange={handleChannelTabChange}
            sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, minHeight: 40 } }}
          >
            <Tab icon={<EmailTabIcon fontSize="small" />} iconPosition="start" label="Email" />
            <Tab icon={<SmsTabIcon fontSize="small" />} iconPosition="start" label="SMS" />
            <Tab icon={<ExcelTabIcon fontSize="small" />} iconPosition="start" label="Excel" />
          </Tabs>
          <Button
            variant="outlined"
            size="small"
            startIcon={<SettingsIcon fontSize="small" />}
            onClick={() => navigate('/communications')}
            sx={{ fontWeight: 600, textTransform: 'none', whiteSpace: 'nowrap' }}
          >
            Communication Channel & Credits
          </Button>
        </Box>

        <Box
          display="flex"
          flexDirection={{ xs: 'column', md: 'row' }}
          gap={2}
          alignItems={{ xs: 'stretch', md: 'center' }}
          mb={1.5}
        >
          <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 150 } }}>
            <InputLabel>Academic Session</InputLabel>
            <Select
              value={selectedSessionId}
              label="Academic Session"
              onChange={(e) => setSelectedSessionId(e.target.value)}
              disabled={loadingFilters}
            >
              {distinctSessions.map((item) => (
                <MenuItem key={item.session_id} value={item.session_id}>
                  {item.session?.session_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 120 } }}>
            <InputLabel>Term</InputLabel>
            <Select
              value={selectedTermId}
              label="Term"
              onChange={(e) => setSelectedTermId(e.target.value)}
              disabled={loadingFilters || termsForSelectedSession.length === 0}
            >
              {termsForSelectedSession.map((item) => (
                <MenuItem key={item.term_id} value={item.term_id}>
                  {item.term?.term_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 150 } }}>
            <InputLabel>Programme</InputLabel>
            <Select
              value={selectedProgrammeId}
              label="Programme"
              onChange={(e) => setSelectedProgrammeId(e.target.value)}
              disabled={loadingFilters}
            >
              {programmes.map((prog) => (
                <MenuItem key={prog.id} value={String(prog.id)}>
                  {prog.programme_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {channelTab === 2 && (
            <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 160 } }}>
              <InputLabel shrink>Class</InputLabel>
              <Select
                notched
                value={selectedClassIds[0] || ''}
                label="Class"
                onChange={(e) => setSelectedClassIds(e.target.value ? [e.target.value] : [])}
                disabled={loadingProgrammeClasses}
                renderValue={(selected) =>
                  classOptionsForFilter.find((c) => String(c.id) === String(selected))
                    ?.class_name || 'Select class'
                }
              >
                {classOptionsForFilter.map((cls) => (
                  <MenuItem key={cls.id} value={String(cls.id)}>
                    {cls.class_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <TextField
            size="small"
            placeholder="Search parents or students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRefresh()}
            sx={{ flexGrow: 1 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
          <Tooltip title="Refresh">
            <IconButton
              onClick={handleRefresh}
              sx={{ border: '1px solid', borderColor: 'divider' }}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        {channelTab !== 2 && (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap mb={2}>
            {selectedClassIds.map((id) => {
              const cls = classOptionsForFilter.find((c) => String(c.id) === String(id));
              if (!cls) return null;
              return (
                <Chip
                  key={id}
                  label={cls.class_name}
                  size="small"
                  onDelete={() => handleRemoveClassChip(id)}
                  deleteIcon={<RemoveChipIcon fontSize="small" />}
                  sx={{ fontWeight: 600 }}
                />
              );
            })}
            <Chip
              label="Add Classes"
              size="small"
              variant="outlined"
              icon={<AddClassesIcon fontSize="small" />}
              onClick={(e) => setAddClassAnchorEl(e.currentTarget)}
            />
            <Menu
              anchorEl={addClassAnchorEl}
              open={Boolean(addClassAnchorEl)}
              onClose={() => setAddClassAnchorEl(null)}
            >
              {classOptionsForFilter.filter(
                (cls) => !selectedClassIds.some((id) => String(id) === String(cls.id)),
              ).length === 0 ? (
                <MenuItem disabled>
                  {selectedProgrammeId
                    ? 'No more classes in this programme'
                    : 'Select a programme first'}
                </MenuItem>
              ) : (
                classOptionsForFilter
                  .filter((cls) => !selectedClassIds.some((id) => String(id) === String(cls.id)))
                  .map((cls) => (
                    <MenuItem
                      key={cls.id}
                      onClick={() => {
                        setSelectedClassIds((prev) => [...prev, String(cls.id)]);
                        setAddClassAnchorEl(null);
                      }}
                    >
                      {cls.class_name}
                    </MenuItem>
                  ))
              )}
            </Menu>
          </Stack>
        )}
      </Box>

      {channelTab === 2 ? renderExcelContent() : renderRecipientsAndMessage()}

      {/* Edit Parent Contact Dialog */}
      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editField === 'phone' ? 'Edit Parent Phone Number' : 'Edit Parent Email'}
        </DialogTitle>
        <DialogContent>
          {editParent && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Editing contact for: <strong>{editParent.guardian_name}</strong>
            </Typography>
          )}
          <TextField
            autoFocus
            fullWidth
            size="small"
            label={editField === 'phone' ? 'Phone Number' : 'Email Address'}
            type={editField === 'phone' ? 'tel' : 'email'}
            value={editValue}
            onChange={(e) => {
              setEditValue(e.target.value);
              if (editError) setEditError('');
            }}
            error={Boolean(editError)}
            helperText={editError}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            variant="contained"
            size="small"
            onClick={handleCloseEditDialog}
            disabled={savingEdit}
          >
            Cancel
          </Button>
          <Button
            size="small"
            onClick={handleSaveEdit}
            disabled={savingEdit}
            startIcon={savingEdit ? <CircularProgress size={16} /> : null}
          >
            {savingEdit ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Recipients */}
      <Dialog
        open={previewRecipientsOpen}
        onClose={() => setPreviewRecipientsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Recipients who will receive this {channelTab === 0 ? 'email' : 'message'}
        </DialogTitle>
        <DialogContent dividers sx={{ maxHeight: 420 }}>
          {parentsList.filter((p) => rowState(p) !== 'missing').length === 0 ? (
            <Alert severity="info">
              No recipients with a valid contact in the current filters.
            </Alert>
          ) : (
            <List dense>
              {parentsList
                .filter((p) => rowState(p) !== 'missing')
                .map((p) => (
                  <ListItem
                    key={`${p.guardian_user_id}-${p.student_registration_id}`}
                    disableGutters
                  >
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      {selectedParents.includes(p.guardian_user_id) ? (
                        <ReadyIcon fontSize="small" sx={{ color: 'success.main' }} />
                      ) : null}
                    </ListItemIcon>
                    <ListItemText
                      primary={`${p.guardian_name} — ${p.student_name}`}
                      secondary={channelTab === 1 ? p.guardian_phone : p.guardian_email}
                    />
                  </ListItem>
                ))}
            </List>
          )}
          {missingCount > 0 && (
            <>
              <Divider sx={{ my: 1.5 }} />
              <Typography
                variant="caption"
                fontWeight={700}
                color="error.main"
                display="block"
                mb={1}
              >
                Excluded — missing {channelTab === 1 ? 'phone number' : 'email'}
              </Typography>
              <List dense>
                {parentsList
                  .filter((p) => rowState(p) === 'missing')
                  .map((p) => (
                    <ListItem
                      key={`${p.guardian_user_id}-${p.student_registration_id}`}
                      disableGutters
                    >
                      <ListItemText primary={`${p.guardian_name} — ${p.student_name}`} />
                    </ListItem>
                  ))}
              </List>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewRecipientsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SendInvoiceTab;
