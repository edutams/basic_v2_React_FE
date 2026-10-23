import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Grid,
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Avatar,
  Button,
  TextField,
  MenuItem,
  Radio,
  Checkbox,
  CircularProgress,
  Alert,
  Tooltip,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
  List,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import StatCard from './StatCard';
import CategoryRemapModal from './CategoryRemapModal';
import {
  fetchClassAndArmsByProgramme,
  fetchProgrammes,
} from '@/api/tenant/curriculum/tenantCurriculumApi';
import { fetchActiveTenantSessionTerm } from '@/api/tenant/session-term/sessionTermApi';
import { fetchActiveCategories } from '@/api/tenant/bursary/bursarySettingsApi';
import { fetchStudentsForClass, assignCategory } from '@/api/tenant/bursary/paymentCategory';
import { useNotification } from '@/hooks/useNotification';

const SN_WIDTH = 50;
const STUDENT_COL_WIDTH = 260;
const CATEGORY_COL_WIDTH = 150;

const StudentCategoryPlacementTab = () => {
  const notify = useNotification();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [programmes, setProgrammes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [programme, setProgramme] = useState('');
  const [classArmId, setClassArmId] = useState('');
  const [sessionTermId, setSessionTermId] = useState(null);
  const [categories, setCategories] = useState([]);

  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    placed: 0,
    not_placed: 0,
    default_category_id: null,
    by_category: [],
  });
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  // Which stat card is active — filters the table. Clicking the same card
  // again clears the filter.
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // user_id of the row currently saving a direct assign — disables its
  // radios and shows a spinner in place of the S/N so a second click can't
  // race the first while the request is in flight.
  const [savingUserId, setSavingUserId] = useState(null);

  const [remapTarget, setRemapTarget] = useState(null); // { userId, fullName, currentCategoryId, newCategoryId }

  // Confirmation before a single student's placement actually applies —
  // { student, category } | null.
  const [placementConfirm, setPlacementConfirm] = useState(null);

  // Confirmation + progress for a whole column's "place everyone" action —
  // { category, eligible, skipped } | null while confirming, bulkAssigning
  // true only once the bursar has actually confirmed.
  const [bulkConfirm, setBulkConfirm] = useState(null);
  const [bulkAssigning, setBulkAssigning] = useState(false);

  // ── Horizontal scroll indicator for the category columns ─────────────
  const scrollRef = useRef(null);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollShadow = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollRight(el.scrollWidth - el.clientWidth - el.scrollLeft > 4);
  }, []);

  useEffect(() => {
    updateScrollShadow();
    window.addEventListener('resize', updateScrollShadow);
    return () => window.removeEventListener('resize', updateScrollShadow);
  }, [updateScrollShadow, categories, students]);

  useEffect(() => {
    fetchProgrammes()
      .then((res) => {
        const list = Array.isArray(res?.data) ? res.data : [];
        setProgrammes(list.map((p) => ({ value: p.id, label: p.programme_name })));
        if (list.length > 0) {
          setProgramme(list[0].id);
        }
      })
      .catch(() => notify.error('Failed to load programmes'));

    fetchActiveTenantSessionTerm()
      .then((res) => setSessionTermId(res?.status ? res.data?.id : null))
      .catch(() => notify.error('Failed to load active session term'));

    fetchActiveCategories()
      .then((res) => setCategories(Array.isArray(res?.data) ? res.data : []))
      .catch(() => notify.error('Failed to load pay categories'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!programme) return;
    fetchClassAndArmsByProgramme(programme)
      .then((res) => {
        const list = Array.isArray(res?.data) ? res.data : [];
        setClasses(
          list.map((c) => ({
            value: c.class_arm_id,
            label: `${c.class_code}${c.class_arm_names ? ` ${c.class_arm_names}` : ''}`,
          })),
        );
        setClassArmId(list.length > 0 ? list[0].class_arm_id : '');
      })
      .catch(() => notify.error('Failed to load classes'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programme]);

  const loadStudents = useCallback(async () => {
    if (!classArmId || !sessionTermId) {
      notify.warning('Please select a programme and class');
      return;
    }
    setLoading(true);
    try {
      const res = await fetchStudentsForClass({ classArmId, sessionTermId });
      if (res?.status) {
        setStudents(res.data.students || []);
        setStats(res.data.stats ? { ...res.data.stats, by_category: res.data.by_category || [] } : stats);
        setPage(0);
        setFilterStatus('all');
        setHasFetched(true);
      }
    } catch (err) {
      notify.error('Failed to load students');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classArmId, sessionTermId, notify]);

  // Clicking a radio never applies right away — placing a student is a real
  // billing decision, so it always goes through a confirmation step first,
  // same as every other mutating action in this app.
  const handleSelectCategory = (student, category) => {
    if (student.bursary_payment_category_id === category.id || savingUserId) return;
    setPlacementConfirm({ student, category });
  };

  // A student with approved payments already needs the remap flow — moving
  // them straight over would leave their existing invoice lines pointing at
  // the old category's schedule. A student with none yet has nothing to
  // remap, so confirming here applies it directly.
  const applyPlacement = async (student, category) => {
    if (student.has_payments) {
      setRemapTarget({
        userId: student.user_id,
        fullName: student.full_name,
        currentCategoryId: student.bursary_payment_category_id,
        newCategoryId: category.id,
      });
      return;
    }

    setSavingUserId(student.user_id);
    // Optimistic update so the radio moves instantly — reconciled against
    // the server's own stats/by_category breakdown right after.
    setStudents((prev) =>
      prev.map((s) =>
        s.user_id === student.user_id
          ? { ...s, bursary_payment_category_id: category.id, category_name: category.name }
          : s,
      ),
    );
    try {
      const res = await assignCategory({
        userId: student.user_id,
        sessionTermId,
        categoryId: category.id,
      });
      if (res?.status) {
        notify.success(`${student.full_name} placed in ${category.name}`);
        loadStudents();
      } else {
        notify.error(res?.message || 'Failed to update pay category');
        loadStudents();
      }
    } catch (err) {
      notify.error(err?.response?.data?.message || 'Failed to update pay category');
      loadStudents();
    } finally {
      setSavingUserId(null);
    }
  };

  const handleConfirmPlacement = () => {
    if (!placementConfirm) return;
    const { student, category } = placementConfirm;
    setPlacementConfirm(null);
    applyPlacement(student, category);
  };

  // "Select all" in a category column header — places every student in this
  // class/arm into that category in one go, except those with existing
  // approved payments (they need the remap flow individually, one at a time,
  // since it involves matching their specific old/new invoice lines).
  const handleOpenBulkAssign = (category) => {
    const eligible = students.filter(
      (s) => s.bursary_payment_category_id !== category.id && !s.has_payments,
    );
    const skipped = students.filter(
      (s) => s.bursary_payment_category_id !== category.id && s.has_payments,
    );

    if (eligible.length === 0 && skipped.length === 0) {
      notify.warning(`Everyone in this class is already in ${category.name}`);
      return;
    }

    setBulkConfirm({ category, eligible, skipped });
  };

  const handleConfirmBulkAssign = async () => {
    if (!bulkConfirm) return;
    const { category, eligible, skipped } = bulkConfirm;
    setBulkConfirm(null);
    setBulkAssigning(true);

    try {
      const results = await Promise.all(
        eligible.map((student) =>
          assignCategory({ userId: student.user_id, sessionTermId, categoryId: category.id }).catch(
            () => ({ status: false }),
          ),
        ),
      );
      const succeeded = results.filter((r) => r?.status).length;
      const failed = eligible.length - succeeded;

      let message = `${succeeded} student(s) placed in ${category.name}`;
      if (failed > 0) message += ` — ${failed} failed`;
      if (skipped.length > 0) message += ` — ${skipped.length} skipped (already have payments)`;

      notify[failed > 0 ? 'warning' : 'success'](message);
      loadStudents();
    } catch (err) {
      notify.error('Failed to place students');
    } finally {
      setBulkAssigning(false);
    }
  };

  // Jump straight into the remap flow for a student skipped by a bulk
  // placement — same modal a single radio click opens for anyone who
  // already has payments, just triggered from here instead.
  const handleRemapFromBulkSkip = (student, category) => {
    setBulkConfirm(null);
    setRemapTarget({
      userId: student.user_id,
      fullName: student.full_name,
      currentCategoryId: student.bursary_payment_category_id,
      newCategoryId: category.id,
    });
  };

  const filteredStudents = useMemo(() => {
    if (filterStatus === 'all') return students;
    if (filterStatus === 'placed') {
      return students.filter((s) => s.bursary_payment_category_id !== stats.default_category_id);
    }
    return students.filter((s) => s.bursary_payment_category_id === stats.default_category_id);
  }, [students, filterStatus, stats.default_category_id]);

  const paginatedStudents = filteredStudents.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const toggleFilter = (status) => {
    setFilterStatus((prev) => (prev === status ? 'all' : status));
    setPage(0);
  };

  const cardSx = (status) => ({
    border: filterStatus === status ? '2px solid' : '1px solid transparent',
    borderColor: filterStatus === status ? 'primary.main' : 'transparent',
  });

  const stickyHeaderSx = {
    bgcolor: `${isDark ? '#1e293b' : '#f1f5f9'} !important`,
    fontWeight: 700,
  };

  return (
    <Box>
      <Grid container spacing={3} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, lg: 4 }}>
          <StatCard
            title="Total Students"
            value={stats.total}
            colorIndex={0}
            loading={loading}
            onClick={() => toggleFilter('all')}
            sx={cardSx('all')}
            subStats={
              stats.by_category.length > 0
                ? stats.by_category.map((c) => ({ label: c.category_name, value: c.count }))
                : [{ label: 'Meaning', value: 'Everyone in this class this term' }]
            }
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <StatCard
            title="Placed"
            value={stats.placed}
            colorIndex={1}
            loading={loading}
            onClick={() => toggleFilter('placed')}
            sx={cardSx('placed')}
            subStats={[{ label: 'Meaning', value: 'Reviewed & assigned a category' }]}
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <StatCard
            title="Not Yet Placed"
            value={stats.not_placed}
            colorIndex={4}
            loading={loading}
            onClick={() => toggleFilter('not_placed')}
            sx={cardSx('not_placed')}
            subStats={[{ label: 'Meaning', value: 'Still on default — needs review' }]}
          />
        </Grid>
      </Grid>

      <Paper sx={{ p: 1.5 }}>
        <Grid container spacing={2} sx={{ mb: 2 }} alignItems="center">
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              select
              fullWidth
              label="Programme"
              size="small"
              value={programme}
              onChange={(e) => setProgramme(e.target.value)}
            >
              {programmes.map((p) => (
                <MenuItem key={p.value} value={p.value}>
                  {p.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              select
              fullWidth
              label="Class"
              size="small"
              value={classArmId}
              onChange={(e) => setClassArmId(e.target.value)}
            >
              {classes.map((c) => (
                <MenuItem key={c.value} value={c.value}>
                  {c.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <Button
              variant="contained"
              size="small"
              fullWidth
              onClick={loadStudents}
              disabled={!classArmId || loading}
            >
              {loading ? <CircularProgress size={18} color="inherit" /> : 'Fetch'}
            </Button>
          </Grid>
        </Grid>

        {hasFetched && categories.length > 1 && (
          <Alert severity="info" sx={{ mb: 1.5 }}>
            Click the radio button in a student&apos;s row to place them in that category, or use the
            checkbox at the top of a column to place everyone in the class into it at once. Scroll
            right to see every category if the class has more than fit on screen.
          </Alert>
        )}

        <Box sx={{ position: 'relative' }}>
          <TableContainer
            ref={scrollRef}
            onScroll={updateScrollShadow}
            sx={{ maxHeight: 560, overflowX: 'auto' }}
          >
            <Table size="small" stickyHeader sx={{ tableLayout: 'fixed' }}>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      width: SN_WIDTH,
                      minWidth: SN_WIDTH,
                      maxWidth: SN_WIDTH,
                      ...stickyHeaderSx,
                      ...(!isMobile && { position: 'sticky', left: 0, zIndex: 4 }),
                      borderRight: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : '#cbd5e1'}`,
                    }}
                  >
                    S/N
                  </TableCell>
                  <TableCell
                    sx={{
                      width: STUDENT_COL_WIDTH,
                      minWidth: STUDENT_COL_WIDTH,
                      maxWidth: STUDENT_COL_WIDTH,
                      ...stickyHeaderSx,
                      ...(!isMobile && { position: 'sticky', left: SN_WIDTH, zIndex: 4 }),
                      borderRight: `2px solid ${isDark ? 'rgba(255,255,255,0.2)' : '#cbd5e1'}`,
                    }}
                  >
                    Student
                  </TableCell>
                  {categories.map((cat) => (
                    <TableCell
                      key={cat.id}
                      align="center"
                      sx={{
                        width: CATEGORY_COL_WIDTH,
                        minWidth: CATEGORY_COL_WIDTH,
                        ...stickyHeaderSx,
                      }}
                    >
                      <Tooltip title={cat.description || ''}>
                        <Typography
                          variant="caption"
                          fontWeight={700}
                          sx={{ display: 'block', whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.2 }}
                        >
                          {cat.name}
                        </Typography>
                      </Tooltip>
                      <Tooltip title={`Place every student in this class into ${cat.name}`}>
                        <span>
                          <Checkbox
                            size="small"
                            checked={false}
                            disabled={!hasFetched || loading || bulkAssigning || students.length === 0}
                            onChange={() => handleOpenBulkAssign(cat)}
                            sx={{ p: 0.25 }}
                          />
                        </span>
                      </Tooltip>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={`skeleton-${i}`}>
                      <TableCell
                        sx={{
                          width: SN_WIDTH,
                          minWidth: SN_WIDTH,
                          maxWidth: SN_WIDTH,
                          ...(!isMobile && { position: 'sticky', left: 0, zIndex: 2 }),
                          bgcolor: `${isDark ? '#1e293b' : '#f1f5f9'} !important`,
                        }}
                      >
                        <Skeleton variant="text" width={16} />
                      </TableCell>
                      <TableCell
                        sx={{
                          width: STUDENT_COL_WIDTH,
                          minWidth: STUDENT_COL_WIDTH,
                          maxWidth: STUDENT_COL_WIDTH,
                          ...(!isMobile && { position: 'sticky', left: SN_WIDTH, zIndex: 2 }),
                          bgcolor: `${isDark ? '#1e293b' : '#f1f5f9'} !important`,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Skeleton variant="circular" width={32} height={32} />
                          <Box sx={{ flex: 1 }}>
                            <Skeleton variant="text" width="70%" />
                            <Skeleton variant="text" width="40%" />
                          </Box>
                        </Box>
                      </TableCell>
                      {categories.map((cat) => (
                        <TableCell key={cat.id} align="center">
                          <Skeleton variant="circular" width={20} height={20} sx={{ mx: 'auto' }} />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : !hasFetched ? (
                  <TableRow>
                    <TableCell colSpan={2 + categories.length} align="center" sx={{ py: 4 }}>
                      <Alert severity="info" sx={{ justifyContent: 'center' }}>
                        Select a programme and class, then click Fetch.
                      </Alert>
                    </TableCell>
                  </TableRow>
                ) : paginatedStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2 + categories.length} align="center" sx={{ py: 4 }}>
                      <Alert severity="info" sx={{ justifyContent: 'center' }}>
                        No students match this filter.
                      </Alert>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedStudents.map((student, index) => {
                    const isSaving = savingUserId === student.user_id;

                    return (
                      <TableRow key={student.user_id} hover>
                        <TableCell
                          sx={{
                            width: SN_WIDTH,
                            minWidth: SN_WIDTH,
                            maxWidth: SN_WIDTH,
                            ...(!isMobile && { position: 'sticky', left: 0, zIndex: 2 }),
                            bgcolor: `${isDark ? '#1e293b' : '#f1f5f9'} !important`,
                            borderRight: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : '#cbd5e1'}`,
                          }}
                        >
                          {isSaving ? (
                            <CircularProgress size={14} />
                          ) : (
                            page * rowsPerPage + index + 1
                          )}
                        </TableCell>
                        <TableCell
                          sx={{
                            width: STUDENT_COL_WIDTH,
                            minWidth: STUDENT_COL_WIDTH,
                            maxWidth: STUDENT_COL_WIDTH,
                            ...(!isMobile && { position: 'sticky', left: SN_WIDTH, zIndex: 2 }),
                            bgcolor: `${isDark ? '#1e293b' : '#f1f5f9'} !important`,
                            borderRight: `2px solid ${isDark ? 'rgba(255,255,255,0.18)' : '#cbd5e1'}`,
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar src={student.avatar} sx={{ width: 32, height: 32, flexShrink: 0 }}>
                              <PersonOutlineIcon sx={{ fontSize: 18 }} />
                            </Avatar>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography
                                variant="body2"
                                fontWeight={600}
                                sx={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.25 }}
                              >
                                {student.full_name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {student.admission_no}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        {categories.map((cat) => (
                          <TableCell key={cat.id} align="center">
                            <Tooltip title={`Place ${student.full_name} in ${cat.name}`}>
                              <span>
                                <Radio
                                  size="small"
                                  checked={student.bursary_payment_category_id === cat.id}
                                  disabled={isSaving}
                                  onChange={() => handleSelectCategory(student, cat)}
                                  sx={{ p: 0.5 }}
                                />
                              </span>
                            </Tooltip>
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Fades in over the right edge of the category columns whenever
              there's more to scroll to — disappears once fully scrolled,
              so it never lingers as a false "there's more" signal. */}
          {canScrollRight && !loading && hasFetched && paginatedStudents.length > 0 && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 0,
                width: 36,
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                background: isDark
                  ? 'linear-gradient(to right, transparent, rgba(15,23,42,0.85))'
                  : 'linear-gradient(to right, transparent, rgba(255,255,255,0.95))',
              }}
            >
              <ChevronRightIcon sx={{ color: 'text.secondary', mr: 0.25 }} />
            </Box>
          )}
        </Box>

        {hasFetched && filteredStudents.length > 0 && (
          <TablePagination
            component="div"
            count={filteredStudents.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[10, 20, 50]}
          />
        )}
      </Paper>

      <CategoryRemapModal
        open={Boolean(remapTarget)}
        target={remapTarget}
        sessionTermId={sessionTermId}
        categories={categories}
        onClose={() => setRemapTarget(null)}
        onSuccess={() => {
          setRemapTarget(null);
          loadStudents();
        }}
      />

      {/* Confirm a single student's placement before it applies */}
      <Dialog open={Boolean(placementConfirm)} onClose={() => setPlacementConfirm(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Confirm Placement</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Place <strong>{placementConfirm?.student.full_name}</strong> in{' '}
            <strong>{placementConfirm?.category.name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setPlacementConfirm(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleConfirmPlacement}>
            Yes, place
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm a whole column's "place everyone" bulk action */}
      <Dialog open={Boolean(bulkConfirm)} onClose={() => setBulkConfirm(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Place Everyone?</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Place <strong>{bulkConfirm?.eligible.length}</strong> student(s) in this class into{' '}
            <strong>{bulkConfirm?.category.name}</strong>?
          </Typography>
          {bulkConfirm?.skipped.length > 0 && (
            <Box
              sx={{
                mt: 2,
                p: 1.5,
                borderRadius: 2,
                border: '2px solid #f57c00',
                bgcolor: isDark ? 'rgba(245,124,0,0.15)' : '#fff3e0',
              }}
            >
              <Typography variant="subtitle2" fontWeight={800} sx={{ color: '#e65100', mb: 0.5 }}>
                {bulkConfirm.skipped.length} student(s) will be SKIPPED — already have approved
                payments
              </Typography>
              <Typography variant="body2" sx={{ color: isDark ? '#ffb74d' : '#7a3e00', mb: 1 }}>
                They can&apos;t be moved automatically. Click a name below to review and move them
                individually instead:
              </Typography>
              <List dense disablePadding sx={{ bgcolor: isDark ? 'rgba(0,0,0,0.2)' : '#fff', borderRadius: 1 }}>
                {bulkConfirm.skipped.map((student) => (
                  <ListItemButton
                    key={student.user_id}
                    onClick={() => handleRemapFromBulkSkip(student, bulkConfirm.category)}
                    sx={{ borderRadius: 1 }}
                  >
                    <ListItemText
                      primary={student.full_name}
                      secondary={student.admission_no}
                      primaryTypographyProps={{ fontWeight: 600 }}
                    />
                  </ListItemButton>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setBulkConfirm(null)} disabled={bulkAssigning}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmBulkAssign}
            disabled={bulkAssigning}
            startIcon={bulkAssigning ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {bulkAssigning ? 'Placing...' : 'Yes, place all'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentCategoryPlacementTab;
