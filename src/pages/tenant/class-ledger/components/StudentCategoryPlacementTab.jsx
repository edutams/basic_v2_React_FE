import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Chip,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
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

const StudentCategoryPlacementTab = () => {
  const notify = useNotification();

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

  // Direct-assign modal, only used for a student with no approved payments
  // yet — no matching to do, so no need for the remap modal.
  const [directAssignTarget, setDirectAssignTarget] = useState(null); // { userId, fullName, categoryName }
  const [directCategoryId, setDirectCategoryId] = useState('');
  const [savingDirectAssign, setSavingDirectAssign] = useState(false);

  const [remapTarget, setRemapTarget] = useState(null); // { userId, fullName, currentCategoryId }

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

  const handleStartAssign = (student) => {
    setDirectAssignTarget({
      userId: student.user_id,
      fullName: student.full_name,
      admissionNo: student.admission_no,
      currentCategoryId: student.bursary_payment_category_id,
      currentCategoryName: student.category_name,
    });
    setDirectCategoryId(String(student.bursary_payment_category_id));
  };

  const handleSaveDirectAssign = async () => {
    if (!directAssignTarget) return;
    if (!directCategoryId || Number(directCategoryId) === directAssignTarget.currentCategoryId) {
      setDirectAssignTarget(null);
      return;
    }
    setSavingDirectAssign(true);
    try {
      const res = await assignCategory({
        userId: directAssignTarget.userId,
        sessionTermId,
        categoryId: directCategoryId,
      });
      if (res?.status) {
        notify.success('Pay category updated');
        setDirectAssignTarget(null);
        loadStudents();
      } else {
        notify.error(res?.message || 'Failed to update pay category');
      }
    } catch (err) {
      notify.error(err?.response?.data?.message || 'Failed to update pay category');
    } finally {
      setSavingDirectAssign(false);
    }
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

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>S/N</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Admission No.</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Student</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Pay Category</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : !hasFetched ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Alert severity="info" sx={{ justifyContent: 'center' }}>
                      Select a programme and class, then click Fetch.
                    </Alert>
                  </TableCell>
                </TableRow>
              ) : paginatedStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Alert severity="info" sx={{ justifyContent: 'center' }}>
                      No students match this filter.
                    </Alert>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedStudents.map((student, index) => (
                  <TableRow key={student.user_id} hover>
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell>{student.admission_no}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar src={student.avatar} sx={{ width: 32, height: 32 }}>
                          <PersonOutlineIcon sx={{ fontSize: 18 }} />
                        </Avatar>
                        <Typography variant="body2" fontWeight={600}>
                          {student.full_name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={student.category_name}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() =>
                          student.has_payments
                            ? setRemapTarget({
                                userId: student.user_id,
                                fullName: student.full_name,
                                currentCategoryId: student.bursary_payment_category_id,
                              })
                            : handleStartAssign(student)
                        }
                      >
                        Change Category
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

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

      <Dialog open={Boolean(directAssignTarget)} onClose={() => setDirectAssignTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Change Pay Category</DialogTitle>
        <DialogContent>
          {directAssignTarget && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" fontWeight={600}>
                {directAssignTarget.fullName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {directAssignTarget.admissionNo} · Currently: {directAssignTarget.currentCategoryName}
              </Typography>
            </Box>
          )}
          <Alert severity="info" sx={{ mb: 2 }}>
            This student hasn't paid anything yet, so the category just updates directly.
          </Alert>
          <FormControl fullWidth size="small">
            <InputLabel>New Category</InputLabel>
            <Select
              value={directCategoryId}
              label="New Category"
              onChange={(e) => setDirectCategoryId(e.target.value)}
            >
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={String(cat.id)}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDirectAssignTarget(null)} disabled={savingDirectAssign}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSaveDirectAssign} disabled={savingDirectAssign}>
            {savingDirectAssign ? <CircularProgress size={18} color="inherit" /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

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
    </Box>
  );
};

export default StudentCategoryPlacementTab;
