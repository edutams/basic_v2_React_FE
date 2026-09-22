import { useState, useEffect, useCallback, useRef, Fragment } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  FormControl, InputLabel, Select, MenuItem, Menu, Alert, useTheme, Tooltip, Tabs, Tab,
  Card, Button, Avatar, TablePagination, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Snackbar, Alert as MuiAlert, Stack, CircularProgress,
} from '@mui/material';
import { IconCheck, IconX, IconMessage, IconEdit, IconArrowsHorizontal, IconUsers, IconBook, IconChartBar, IconAward } from '@tabler/icons-react';
import StatCard from '@/components/shared/StatCard';
import resultSheetApi from '@/api/tenant/result-sheet/resultSheetApi';
import scoreManagerApi from '@/api/tenant/score-manager/scoreManagerApi';
import { fetchSessionTerms, fetchActiveTenantSessionTerm } from '@/api/tenant/session-term/sessionTermApi';
import {
  fetchSessions, fetchTerms, fetchProgrammes, fetchClassesByProgramme, fetchClassArmsByClass,
} from '@/api/tenant/curriculum/tenantCurriculumApi';
import { fetchClassStructures } from '@/api/tenant/class-structure/classStructureApi';
import { getTenantInfo } from '@/api/tenant/tenant_api';

// Display value: null / undefined / '' render as '-' (0 is a valid score).
const displayScore = (value) => (value === 0 || value ? value : '-');

// Stored `ca` JSON may be an array (manual entry) or a keyed object
// (combined upload) — normalize to an array of CA groups for rendering.
const normalizeCa = (ca) => {
  if (Array.isArray(ca)) return ca;
  if (ca && typeof ca === 'object') return Object.values(ca);
  return [];
};

const normalizeEntities = (entities) => {
  if (Array.isArray(entities)) return entities;
  if (entities && typeof entities === 'object') return Object.values(entities);
  return [];
};

// Grade/remark for an average against the school's configured scale.
const remarkFor = (average, gradeSettings = []) => {
  if (average === null || average === undefined || !gradeSettings.length) return '-';
  const found = gradeSettings.find((g) => average >= g.min_score && average <= g.max_score);
  return found ? found.remark : '-';
};

const BroadsheetTab = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // ── Dropdown data ───────────────────────────────────────────
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [sessionTermsData, setSessionTermsData] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [classArms, setClassArms] = useState([]);
  const [allArms, setAllArms] = useState([]);
  const [schoolInfo, setSchoolInfo] = useState(null);
  const activeSessionTermRef = useRef(null);

  const [activeTab, setActiveTab] = useState(0);
  const [filters, setFilters] = useState({
    session_id: '', term_id: '', programme_id: '', class_id: '', class_arm_id: '', perf_range: '',
  });

  const [loading, setLoading] = useState(false);
  const [sheet, setSheet] = useState(null);
  const [showData, setShowData] = useState(false);
  const [loadedQuery, setLoadedQuery] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [commentDialog, setCommentDialog] = useState({ open: false, student: null, mode: 'teacher' });
  const [commentForm, setCommentForm] = useState({ teacher_comment: '', hos_comment: '' });
  const [addEditMenu, setAddEditMenu] = useState({ rowId: null, anchorEl: null });
  const [editScoresDialog, setEditScoresDialog] = useState({ open: false, student: null });
  const [scoreForm, setScoreForm] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [filterError, setFilterError] = useState('');

  const showSnackbar = (message, severity = 'success') => setSnackbar({ open: true, message, severity });

  // ── Load dropdowns + school info on mount ───────────────────
  useEffect(() => {
    let cancelled = false;

    const loadDropdowns = async () => {
      try {
        const [sessRes, progRes, activeRes, stRes, classStructuresRes] = await Promise.all([
          fetchSessions(),
          fetchProgrammes(),
          fetchActiveTenantSessionTerm(),
          fetchSessionTerms(),
          fetchClassStructures(),
        ]);

        if (cancelled) return;

        const sessionList = Array.isArray(sessRes.data?.data || sessRes.data)
          ? sessRes.data?.data || sessRes.data
          : [];
        setSessions(sessionList);

        const stData = stRes?.data ?? [];
        setSessionTermsData(stData);

        const programmesData = Array.isArray(progRes.data?.data || progRes.data)
          ? progRes.data?.data || progRes.data
          : [];
        setProgrammes(programmesData);

        // Every arm in the school — only used by the promotion "Next Class" picker
        const armsList = [];
        (classStructuresRes?.data ?? []).forEach((division) => {
          (division.programmes ?? []).forEach((prog) => {
            (prog.classes ?? []).forEach((cls) => {
              (cls.class_arms ?? []).forEach((arm) => {
                armsList.push({ ...arm, programme_id: prog.id, class_id: cls.id, class_name: cls.class_name });
              });
            });
          });
        });
        setAllArms(armsList);

        const activeSessionTerm = activeRes?.status ? activeRes.data : null;
        activeSessionTermRef.current = activeSessionTerm;

        // Preselect the active session (the term effect below picks its term).
        const defaultSession =
          (activeSessionTerm && sessionList.find((s) => s.id === activeSessionTerm.session_id)) ||
          sessionList[0];
        if (defaultSession) {
          setFilters((prev) => ({ ...prev, session_id: defaultSession.id }));
        }
      } catch (err) {
        console.error('Failed to load broadsheet dropdowns:', err);
        if (!cancelled) showSnackbar('Failed to load filter options', 'error');
      }
    };

    loadDropdowns();
    getTenantInfo()
      .then((data) => { if (!cancelled) setSchoolInfo(data?.data || null); })
      .catch(() => { if (!cancelled) setSchoolInfo(null); });

    return () => { cancelled = true; };
  }, []);

  // ── Terms for the selected session (defaults to the active term) ──
  useEffect(() => {
    if (!filters.session_id) {
      setTerms([]);
      return;
    }
    fetchTerms(filters.session_id)
      .then((res) => {
        const data = Array.isArray(res.data?.data || res.data) ? res.data?.data || res.data : [];
        setTerms(data);
        const activeSessionTerm = activeSessionTermRef.current;
        const activeTermId =
          activeSessionTerm?.session_id === filters.session_id ? activeSessionTerm.term_id : null;
        const active = (activeTermId && data.find((t) => t.id === activeTermId)) || data[0];
        if (active) setFilters((prev) => ({ ...prev, term_id: active.id }));
      })
      .catch(console.error);
  }, [filters.session_id]);

  // ── Classes for the selected programme ─────────────────────
  useEffect(() => {
    if (!filters.programme_id) {
      setClasses([]);
      return;
    }
    fetchClassesByProgramme(filters.programme_id)
      .then((res) => {
        const data = Array.isArray(res.data?.data || res.data) ? res.data?.data || res.data : [];
        setClasses(data);
      })
      .catch(console.error);
  }, [filters.programme_id]);

  // ── Class arms for the selected class ──────────────────────
  useEffect(() => {
    if (!filters.class_id) {
      setClassArms([]);
      return;
    }
    fetchClassArmsByClass(filters.class_id, filters.programme_id ? { programme_id: filters.programme_id } : {})
      .then((res) => {
        const data = Array.isArray(res.data?.data || res.data) ? res.data?.data || res.data : [];
        setClassArms(data);
      })
      .catch(console.error);
  }, [filters.class_id, filters.programme_id]);

  const filteredClasses = classes;
  const filteredClassArms = classArms;

  const sessionTermId = (() => {
    if (!filters.session_id || !filters.term_id) return null;
    const match = sessionTermsData.find(
      (st) => String(st.session?.id) === String(filters.session_id) && String(st.term?.id) === String(filters.term_id)
    );
    return match?.id ?? null;
  })();

  // ── Data loading ────────────────────────────────────────────
  const loadSheet = useCallback(async (payload, mode) => {
    setLoading(true);
    setFilterError('');
    try {
      const res = mode === 'term'
        ? await resultSheetApi.getBroadsheet(payload)
        : await resultSheetApi.getTermCumulative(payload);
      const data = res?.data?.data;
      if (!data) throw new Error('Empty response');
      setSheet({ ...data, mode });
      setLoadedQuery({ payload, mode });
      setShowData(true);
      setPage(0);
    } catch (err) {
      console.error('Failed to fetch broadsheet:', err);
      setShowData(false);
      setSheet(null);
      setFilterError(err?.response?.data?.message || 'Failed to fetch broadsheet data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    if (loadedQuery) loadSheet(loadedQuery.payload, loadedQuery.mode);
  }, [loadedQuery, loadSheet]);

  const handleFilter = () => {
    if (activeTab === 0) {
      if (!filters.session_id || !filters.term_id || !filters.programme_id || !filters.class_id || !filters.class_arm_id) {
        setFilterError('Select Session, Term, Programme, Class and Class Arm, then click Fetch.');
        return;
      }
      if (!sessionTermId) {
        setFilterError('No session-term found for the selected session and term.');
        return;
      }
      loadSheet({ class_arm_id: filters.class_arm_id, session_term_id: sessionTermId }, 'term');
    } else {
      if (!filters.session_id || !filters.programme_id || !filters.class_id || !filters.class_arm_id) {
        setFilterError('Select Session, Programme, Class and Class Arm, then click Fetch.');
        return;
      }
      loadSheet({ class_arm_id: filters.class_arm_id, session_id: filters.session_id }, 'cumulative');
    }
  };

  // ── Derived rows ────────────────────────────────────────────
  const visibleStudents = (() => {
    if (!sheet?.students) return [];
    let rows = sheet.students;
    if (filters.perf_range) {
      const count = parseInt(filters.perf_range, 10);
      rows = rows.filter((s) => {
        const pos = activeTab === 0 ? s.position : s.all_term_overall_class_position;
        return pos !== null && pos !== undefined && pos <= count;
      });
    }
    return rows;
  })();

  const showPromotionButtons = activeTab === 0 && showData && Boolean(sheet?.is_third_term);
  const stats = sheet?.stats ?? {};
  const gradeSettings = sheet?.grade_settings ?? [];
  const markConfig = sheet?.mark_config;
  const caMax = markConfig?.ca_max_score ?? 20;
  const examMax = markConfig?.exam_max_score ?? 60;
  const totalMax = caMax + examMax;
  const subjects = sheet?.subjects ?? [];

  const summaryColSpan = activeTab === 1 ? 11 : (showPromotionButtons ? 10 : 7);

  const borderColor = isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB';

  const schoolName = schoolInfo?.tenant_name || schoolInfo?.name || '';

  // ── Comments ────────────────────────────────────────────────
  const handleOpenComment = (student, mode = 'teacher') => {
    setCommentForm({
      teacher_comment: student.class_teachers_comment || '',
      hos_comment: student.hos_comment || '',
    });
    setCommentDialog({ open: true, student, mode });
  };

  const closeCommentDialog = () => setCommentDialog({ open: false, student: null, mode: 'teacher' });

  const handleSaveComment = async () => {
    const { student, mode } = commentDialog;
    if (!student) return;
    const comment = mode === 'hos' ? commentForm.hos_comment : commentForm.teacher_comment;
    try {
      await resultSheetApi.saveComment({
        student_registration_id: student.student_registration_id,
        type: mode === 'hos' ? 'hos' : 'teacher',
        comment,
      });
      setSheet((prev) => prev && ({
        ...prev,
        students: prev.students.map((row) => {
          if (row.student_registration_id !== student.student_registration_id) return row;
          return mode === 'hos'
            ? { ...row, hos_comment: comment }
            : { ...row, class_teachers_comment: comment };
        }),
      }));
      showSnackbar('Comment saved successfully');
      closeCommentDialog();
    } catch (err) {
      console.error('Failed to save comment:', err);
      showSnackbar(err?.response?.data?.message || 'Failed to save comment', 'error');
    }
  };

  // ── Score editing ───────────────────────────────────────────
  const isScoreInvalid = (value, max) => {
    if (value === '' || value === null || value === undefined) return true;
    const n = Number(value);
    if (Number.isNaN(n) || n < 0) return true;
    if (max !== null && max !== undefined && n > max) return true;
    return false;
  };

  const handleAddEditClick = (e, row) => {
    setAddEditMenu({ rowId: row.student_registration_id, anchorEl: e.currentTarget });
  };

  const closeAddEditMenu = () => setAddEditMenu({ rowId: null, anchorEl: null });

  const handleOpenEditScores = (row) => {
    const form = (row.results || [])
      .filter((r) => r.course_registration_id)
      .map((r) => {
        let groups = normalizeCa(r.ca).map((g) => ({
          display_name: g.display_name || g.name || 'CA',
          entities: normalizeEntities(g.entities).map((e) => ({
            display_name: e.display_name || e.name || 'Test',
            max_score: e.max_score ?? g.max_score ?? null,
            score: String(e.score ?? 0),
          })),
        }));

        // No stored CA JSON yet — synthesize the groups from the mark config.
        if (groups.length === 0 && markConfig?.ca_content?.length) {
          groups = markConfig.ca_content.map((g) => ({
            display_name: g.display_name || 'CA',
            entities: normalizeEntities(g.entities).map((e) => ({
              display_name: e.display_name || 'Test',
              max_score: e.max_score ?? null,
              score: '0',
            })),
          }));
        }

        return {
          subject_id: r.subject_id,
          subject_name: r.subject_name,
          course_registration_id: r.course_registration_id,
          ca_breakdown: groups,
          exam_score: String(r.exam_score ?? ''),
        };
      });

    setScoreForm(form);
    setEditScoresDialog({ open: true, student: row });
  };

  const handleCloseEditScores = () => {
    setEditScoresDialog({ open: false, student: null });
    setScoreForm([]);
  };

  const handleScoreChange = (subjectIdx, groupIdx, entityIdx, value) => {
    setScoreForm((prev) => prev.map((subj, i) => {
      if (i !== subjectIdx) return subj;
      return {
        ...subj,
        ca_breakdown: subj.ca_breakdown.map((g, gi) => (gi !== groupIdx ? g : {
          ...g,
          entities: g.entities.map((e, ei) => (ei !== entityIdx ? e : { ...e, score: value })),
        })),
      };
    }));
  };

  const handleExamChange = (subjectIdx, value) => {
    setScoreForm((prev) => prev.map((subj, i) => (i !== subjectIdx ? subj : { ...subj, exam_score: value })));
  };

  const handleSaveScoreRow = async (subjectIdx) => {
    const subj = scoreForm[subjectIdx];
    const student = editScoresDialog.student;
    if (!subj || !student) return;

    const invalidEntity = subj.ca_breakdown.some((g) => g.entities.some((e) => isScoreInvalid(e.score, e.max_score)));
    const invalidExam = subj.exam_score === '' || isScoreInvalid(subj.exam_score, examMax);
    if (invalidEntity || invalidExam) {
      showSnackbar('Fix invalid scores before saving', 'error');
      return;
    }

    const caTotal = subj.ca_breakdown.reduce(
      (sum, g) => sum + g.entities.reduce((s, e) => s + (Number(e.score) || 0), 0),
      0
    );
    const examScore = Number(subj.exam_score) || 0;

    try {
      await scoreManagerApi.editResult({
        user_id: student.user_id,
        course_registration_id: subj.course_registration_id,
        ca_total: caTotal,
        exam_score: examScore,
        session_term_id: loadedQuery?.payload?.session_term_id,
      });
      showSnackbar(`${subj.subject_name} score updated`);
      handleCloseEditScores();
      // Refetch so grades, averages and positions are recomputed server-side.
      refetch();
    } catch (err) {
      console.error('Failed to save score:', err);
      showSnackbar(err?.response?.data?.message || err?.response?.data?.error || 'Failed to save score', 'error');
    }
  };

  // ── Promotion ───────────────────────────────────────────────
  const [recMenu, setRecMenu] = useState({ rowId: null, anchorEl: null });

  const handleRecommendPromotions = async () => {
    setLoading(true);
    try {
      const res = await resultSheetApi.recommendPromotions({
        class_arm_id: filters.class_arm_id,
        session_id: filters.session_id,
      });
      showSnackbar(res?.data?.message || 'Recommendations computed');
      await refetch();
    } catch (err) {
      console.error('Failed to recommend promotions:', err);
      showSnackbar(err?.response?.data?.message || 'Failed to compute recommendations', 'error');
      setLoading(false);
    }
  };

  const handlePostRecommendations = async () => {
    setLoading(true);
    try {
      const res = await resultSheetApi.postRecommendations({
        class_arm_id: filters.class_arm_id,
        session_id: filters.session_id,
      });
      showSnackbar(res?.data?.message || 'Recommendations posted');
      await refetch();
    } catch (err) {
      console.error('Failed to post recommendations:', err);
      showSnackbar(err?.response?.data?.message || 'Failed to post recommendations', 'error');
      setLoading(false);
    }
  };

  const handleSetRecommendation = async (row, recommendation) => {
    setRecMenu({ rowId: null, anchorEl: null });
    try {
      await resultSheetApi.savePromotion({
        student_registration_id: row.student_registration_id,
        promotion_recommendation: recommendation,
      });
      setSheet((prev) => prev && ({
        ...prev,
        students: prev.students.map((r) => (
          r.student_registration_id === row.student_registration_id
            ? { ...r, promotion_recommendation: recommendation }
            : r
        )),
      }));
      showSnackbar('Recommendation updated');
    } catch (err) {
      console.error('Failed to save recommendation:', err);
      showSnackbar(err?.response?.data?.message || 'Failed to update recommendation', 'error');
    }
  };

  const handleSetNextClass = async (row, nextClassArmId) => {
    if (!nextClassArmId) return;
    try {
      await resultSheetApi.savePromotion({
        student_registration_id: row.student_registration_id,
        next_class_arm_id: nextClassArmId,
      });
      setSheet((prev) => prev && ({
        ...prev,
        students: prev.students.map((r) => (
          r.student_registration_id === row.student_registration_id
            ? { ...r, next_class_arm_id: nextClassArmId }
            : r
        )),
      }));
      showSnackbar('Next class updated');
    } catch (err) {
      console.error('Failed to save next class:', err);
      showSnackbar(err?.response?.data?.message || 'Failed to update next class', 'error');
    }
  };

  // ── CSV export (opens in Excel) ──────────────────────────────
  const handleExport = () => {
    if (!sheet || visibleStudents.length === 0) {
      showSnackbar('No broadsheet data to export', 'warning');
      return;
    }

    const isCumulative = sheet.mode === 'cumulative';
    const header = [
      'S/N', 'Student ID', 'Name', 'Sex',
      ...subjects.flatMap((s) => [
        `${s.subject_name} CA (${caMax})`,
        `${s.subject_name} EXAM (${examMax})`,
        `${s.subject_name} TOTAL (${totalMax})`,
        `${s.subject_name} GRADE`,
      ]),
      ...(isCumulative ? ['1ST TERM', '2ND TERM', '3RD TERM', 'CUM AVG'] : []),
      'CWA', 'POSITION', 'NO. SUBJ', 'REMARK',
      ...(showPromotionButtons ? ['RECOMMENDATION', 'NEXT CLASS'] : []),
      'CLASS TEACHER COMMENT', 'HEAD OF SCHOOL COMMENT',
    ];

    const rows = visibleStudents.map((row, index) => {
      const resultMap = {};
      (row.results || []).forEach((r) => { resultMap[r.subject_id] = r; });
      const cwa = isCumulative ? row.all_term_average : row.student_average;
      const armName = allArms.find((a) => a.id === row.next_class_arm_id)?.class_arm_names || '';

      return [
        index + 1,
        row.user?.user_id ?? '',
        `${row.user?.lname ?? ''} ${row.user?.fname ?? ''} ${row.user?.mname ?? ''}`.trim(),
        row.user?.sex === 'female' ? 'F' : 'M',
        ...subjects.flatMap((s) => {
          const result = resultMap[s.subject_id];
          return [
            result?.ca_total ?? '',
            result?.exam_score ?? '',
            result?.overall_total ?? '',
            result?.grade ?? '',
          ];
        }),
        ...(isCumulative
          ? [row.first_term_average ?? '', row.second_term_average ?? '', row.third_term_average ?? '', row.all_term_average ?? '']
          : []),
        cwa ?? '',
        isCumulative ? (row.all_term_overall_class_position ?? '') : (row.position ?? ''),
        row.total_subjects ?? '',
        remarkFor(cwa, gradeSettings),
        ...(showPromotionButtons ? [row.promotion_recommendation || '', armName] : []),
        row.class_teachers_comment || '',
        row.hos_comment || '',
      ];
    });

    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `broadsheet-${isCumulative ? 'cumulative' : 'termly'}-${sheet.class_arm?.class_name ?? 'class'}-${sheet.class_arm?.arm_name ?? ''}.csv`.replace(/\s+/g, '-');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showSnackbar('Broadsheet exported');
  };

  const promotionIcon = (recommendation) => {
    if (recommendation === 'promoted') return <IconCheck size={18} color="#16A34A" style={{ cursor: 'pointer' }} />;
    if (recommendation === 'promoted on trial') return <IconCheck size={18} color="#D97706" style={{ cursor: 'pointer' }} />;
    if (recommendation === 'graduated') return <IconCheck size={18} color="#2563EB" style={{ cursor: 'pointer' }} />;
    return <IconX size={18} color="#DC2626" style={{ cursor: 'pointer' }} />;
  };

  const avatarInitials = (user) => `${user?.lname?.[0] ?? ''}${user?.fname?.[0] ?? ''}`;

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <StatCard count={stats.total_students ?? 0} label="Total Students" subtitle="In this class" icon={IconUsers} colorIndex={0} loading={loading} />
        <StatCard count={stats.total_subjects ?? subjects.length} label="Total Subjects" subtitle="Across all departments" icon={IconBook} colorIndex={1} loading={loading} />
        <StatCard count={`${stats.class_average ?? 0}%`} label="Average Score" subtitle="Class average" icon={IconChartBar} colorIndex={2} loading={loading} />
        <StatCard count={stats.pass_rate !== null && stats.pass_rate !== undefined ? `${stats.pass_rate}%` : '—'} label="Pass Rate" subtitle={stats.pass_mark ? `Students at/above ${stats.pass_mark}%` : 'Pass mark not set'} icon={IconAward} colorIndex={3} loading={loading} />
      </Stack>

      <Card elevation={0} sx={{ border: `1px solid ${borderColor}`, borderRadius: 1 }}>
        {/* ── Nested Tabs ────────────────────────────────────── */}
        <Box sx={{ px: 2 }}>
          <Tabs
            value={activeTab}
            onChange={(_, v) => { setActiveTab(v); setShowData(false); setFilterError(''); }}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Termly" />
            <Tab label="Term Cummulative" />
          </Tabs>
        </Box>

        {/* ── Shared Filters ─────────────────────────────────── */}
        <Box sx={{ px: 2, pt: 2, pb: 2 }}>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 1, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 0', minWidth: 150 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Session</InputLabel>
                <Select value={filters.session_id} label="Session" onChange={(e) => setFilters({ ...filters, session_id: e.target.value, term_id: activeTab === 0 ? '' : filters.term_id })}>
                  <MenuItem value="">-- choose --</MenuItem>
                  {sessions.map((s) => <MenuItem key={s.id} value={s.id}>{s.session_name}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
            {activeTab === 0 && (
              <Box sx={{ flex: '1 1 0', minWidth: 150 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Term</InputLabel>
                  <Select value={filters.term_id} label="Term" onChange={(e) => setFilters({ ...filters, term_id: e.target.value })}>
                    <MenuItem value="">-- choose --</MenuItem>
                    {terms.map((t) => <MenuItem key={t.id} value={t.id}>{t.term_name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Box>
            )}
            <Box sx={{ flex: '1 1 0', minWidth: 150 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Programme</InputLabel>
                <Select value={filters.programme_id} label="Programme" onChange={(e) => setFilters({ ...filters, programme_id: e.target.value, class_id: '', class_arm_id: '' })}>
                  <MenuItem value="">--Select Programme--</MenuItem>
                  {programmes.map((p) => <MenuItem key={p.id} value={p.id}>{p.programme_name || p.programme_title}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: '1 1 0', minWidth: 150 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Class</InputLabel>
                <Select value={filters.class_id} label="Class" onChange={(e) => setFilters({ ...filters, class_id: e.target.value, class_arm_id: '' })}>
                  <MenuItem value="">-- Select Class --</MenuItem>
                  {filteredClasses.map((c) => <MenuItem key={c.id} value={c.id}>{c.class_name}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: '1 1 0', minWidth: 150 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Class Arm</InputLabel>
                <Select value={filters.class_arm_id} label="Class Arm" onChange={(e) => setFilters({ ...filters, class_arm_id: e.target.value })}>
                  <MenuItem value="">-- Select Arm --</MenuItem>
                  {filteredClassArms.map((a) => <MenuItem key={a.id} value={a.id}>{a.class_arm_names}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
            {showData && (
              <Box sx={{ flex: '1 1 0', minWidth: 150 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Performance</InputLabel>
                  <Select value={filters.perf_range} label="Performance" onChange={(e) => { setFilters({ ...filters, perf_range: e.target.value }); setPage(0); }}>
                    <MenuItem value="">-- Select Range --</MenuItem>
                    <MenuItem value="3">Best 3</MenuItem>
                    <MenuItem value="5">Best 5</MenuItem>
                    <MenuItem value="10">Best 10</MenuItem>
                    <MenuItem value="15">Best 15</MenuItem>
                    <MenuItem value="20">Best 20</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            )}
            <Box sx={{ flex: '1 1 0', minWidth: 120 }}>
              <Button variant="contained" fullWidth onClick={handleFilter} disabled={loading}>
                {loading ? <CircularProgress size={18} color="inherit" /> : 'Fetch'}
              </Button>
            </Box>
            {showData && (
              <Box sx={{ flex: '1 1 0', minWidth: 130 }}>
                <Button variant="outlined" color="success" fullWidth onClick={handleExport} disabled={loading}>
                  Export CSV
                </Button>
              </Box>
            )}
          </Box>

          {showData && showPromotionButtons && (
            <Box sx={{ mb: 2, display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              <Button variant="outlined" color="primary" size="small" onClick={handleRecommendPromotions} disabled={loading}>
                Recommend Promotion
              </Button>
              <Button variant="outlined" color="secondary" size="small" onClick={handlePostRecommendations} disabled={loading}>
                Post Recommendation
              </Button>
            </Box>
          )}

          {/* ── School Info Header ─────────────────────────────── */}
          {showData && sheet && (
            <Box sx={{ mb: 2, border: `1px solid ${borderColor}`, borderRadius: '8px', overflow: 'hidden' }}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, borderBottom: `1px solid ${borderColor}` }}>
                <Box sx={{ flex: 1, p: 1, borderRight: { xs: 'none', sm: `1px solid ${borderColor}` }, borderBottom: { xs: `1px solid ${borderColor}`, sm: 'none' }, fontWeight: 700, bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f8f9fa' }}>Name Of School</Box>
                <Box sx={{ flex: 3, p: 1, fontWeight: 600 }}>{schoolName || '-'}</Box>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' } }}>
                <Box sx={{ flex: 1, p: 1, borderRight: { xs: 'none', sm: `1px solid ${borderColor}` }, borderBottom: { xs: `1px solid ${borderColor}`, sm: 'none' }, fontWeight: 700, bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f8f9fa' }}>Session</Box>
                <Box sx={{ flex: 2, p: 1, fontWeight: 600, borderRight: { xs: 'none', sm: `1px solid ${borderColor}` }, borderBottom: { xs: `1px solid ${borderColor}`, sm: 'none' } }}>
                  {sheet.mode === 'cumulative' ? sheet.session?.session_name : sheet.session_term?.session_name}
                </Box>
                {activeTab === 0 && (
                  <>
                    <Box sx={{ flex: 1, p: 1, borderRight: { xs: 'none', sm: `1px solid ${borderColor}` }, fontWeight: 700, bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f8f9fa' }}>Term</Box>
                    <Box sx={{ flex: 2, p: 1, fontWeight: 600 }}>{sheet.session_term?.term_name}</Box>
                  </>
                )}
              </Box>
            </Box>
          )}

          {/* ── Broadsheet Table ───────────────────────────────── */}
          {showData && sheet && (
            <>
              <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'flex', sm: 'none' }, alignItems: 'center', gap: 0.5, mb: 1 }}>
                <IconArrowsHorizontal size={14} /> Swipe horizontally to view all columns
              </Typography>
              <TableContainer sx={{ overflowX: 'auto' }}>
                <Table stickyHeader sx={{ '& .MuiTableCell-root': { py: { xs: 0.25, sm: 0.5 }, px: { xs: 0.5, sm: 1 } }, whiteSpace: 'nowrap', minWidth: 1200 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell rowSpan={2} sx={{ position: 'sticky', left: 0, zIndex: 3, bgcolor: '#fc9d49', color: '#fff', fontWeight: 700, minWidth: { xs: 150, sm: 250 }, verticalAlign: 'middle', borderRight: `1px solid ${borderColor}` }}>
                        Student Info
                      </TableCell>
                      {subjects.map((subj) => (
                        <TableCell key={subj.subject_id} colSpan={4} align="center" sx={{ bgcolor: '#ffcb15', fontWeight: 700, borderRight: `1px solid ${borderColor}`, minWidth: 200 }}>
                          {subj.subject_name}
                        </TableCell>
                      ))}
                      <TableCell colSpan={summaryColSpan} align="center" sx={{ bgcolor: '#ffcb15', fontWeight: 700, borderRight: `1px solid ${borderColor}` }}>
                        SUMMARY
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      {subjects.map((subj) => (
                        <Fragment key={`sub-${subj.subject_id}`}>
                          <TableCell align="center" sx={{ bgcolor: '#c3dfe3', fontWeight: 700, minWidth: { xs: 40, sm: 48 } }}>
                            <Typography variant="caption" sx={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', display: 'inline-block' }}>CA ({caMax})</Typography>
                          </TableCell>
                          <TableCell align="center" sx={{ bgcolor: '#c3dfe3', fontWeight: 700, minWidth: { xs: 40, sm: 48 } }}>
                            <Typography variant="caption" sx={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', display: 'inline-block' }}>EXAM ({examMax})</Typography>
                          </TableCell>
                          <TableCell align="center" sx={{ bgcolor: '#0ca6e8', fontWeight: 700, color: '#fff', minWidth: { xs: 40, sm: 48 } }}>
                            <Typography variant="caption" sx={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', display: 'inline-block' }}>TOTAL ({totalMax})</Typography>
                          </TableCell>
                          <TableCell align="center" sx={{ bgcolor: '#0ca6e8', fontWeight: 700, color: '#fff', minWidth: { xs: 40, sm: 48 } }}>
                            <Typography variant="caption" sx={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', display: 'inline-block' }}>GRADE</Typography>
                          </TableCell>
                        </Fragment>
                      ))}
                      {activeTab === 1 && (
                        <>
                          {['1ST TERM', '2ND TERM', '3RD TERM', 'CUM AVG'].map((label) => (
                            <TableCell key={label} align="center" sx={{ bgcolor: '#ffcb15', fontWeight: 700, minWidth: { xs: 44, sm: 60 } }}>
                              <Typography variant="caption" sx={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', display: 'inline-block' }}>{label}</Typography>
                            </TableCell>
                          ))}
                        </>
                      )}
                      <TableCell align="center" sx={{ bgcolor: '#ffcb15', fontWeight: 700, minWidth: { xs: 44, sm: 60 } }}>
                        <Typography variant="caption" sx={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', display: 'inline-block' }}>CWA</Typography>
                      </TableCell>
                      <TableCell align="center" sx={{ bgcolor: '#ffcb15', fontWeight: 700, minWidth: { xs: 40, sm: 50 } }}>
                        <Typography variant="caption" sx={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', display: 'inline-block' }}>POSITION</Typography>
                      </TableCell>
                      <TableCell align="center" sx={{ bgcolor: '#ffcb15', fontWeight: 700, minWidth: { xs: 40, sm: 50 } }}>
                        <Typography variant="caption" sx={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', display: 'inline-block' }}>NO. SUBJ</Typography>
                      </TableCell>
                      <TableCell align="center" sx={{ bgcolor: '#ffcb15', fontWeight: 700, minWidth: { xs: 40, sm: 50 } }}>
                        <Typography variant="caption" sx={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', display: 'inline-block' }}>REMARK</Typography>
                      </TableCell>
                      {showPromotionButtons && (
                        <>
                          <TableCell align="center" sx={{ bgcolor: '#ffcb15', fontWeight: 700, minWidth: { xs: 40, sm: 50 } }}>
                            <Typography variant="caption" sx={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', display: 'inline-block' }}>RECOMMENDATION</Typography>
                          </TableCell>
                          <TableCell align="center" sx={{ bgcolor: '#ffcb15', fontWeight: 700, minWidth: { xs: 40, sm: 50 } }}>
                            <Typography variant="caption" sx={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', display: 'inline-block' }}>PROMOTION</Typography>
                          </TableCell>
                          <TableCell align="center" sx={{ bgcolor: '#0ca6e8', fontWeight: 700, color: '#fff', minWidth: { xs: 72, sm: 80 } }}>NEXT CLASS</TableCell>
                        </>
                      )}
                      <TableCell align="center" sx={{ bgcolor: '#ffcb15', fontWeight: 700, minWidth: { xs: 110, sm: 120 } }}>
                        <Typography variant="caption" sx={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', display: 'inline-block' }}>CLASS TEACHER COMMENT</Typography>
                      </TableCell>
                      <TableCell align="center" sx={{ bgcolor: '#ffcb15', fontWeight: 700, minWidth: { xs: 110, sm: 120 } }}>
                        <Typography variant="caption" sx={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', display: 'inline-block' }}>HEAD OF SCHOOL COMMENT</Typography>
                      </TableCell>
                      <TableCell align="center" sx={{ bgcolor: '#ffcb15', fontWeight: 700, minWidth: { xs: 96, sm: 100 } }}>
                        <Typography variant="caption" sx={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', display: 'inline-block' }}>ACTION</Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8 + summaryColSpan} align="center" sx={{ py: 6 }}>
                          <CircularProgress size={28} />
                          <Typography variant="body2" sx={{ mt: 1 }}>Loading broadsheet...</Typography>
                        </TableCell>
                      </TableRow>
                    ) : visibleStudents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8 + summaryColSpan} align="center" sx={{ py: 5 }}>
                          <Typography variant="body2" color="text.secondary">
                            No students match this filter for the selected class arm.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : visibleStudents.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                      const resultMap = {};
                      (row.results || []).forEach((r) => { resultMap[r.subject_id] = r; });
                      return (
                        <TableRow key={row.student_registration_id} hover>
                          <TableCell sx={{ position: 'sticky', left: 0, zIndex: 2, bgcolor: 'background.paper', borderRight: `1px solid ${borderColor}`, minWidth: { xs: 150, sm: 250 }, p: { xs: 0.5, sm: 1 } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
                              <Avatar src={row.user?.avatar} sx={{ width: { xs: 28, sm: 36 }, height: { xs: 28, sm: 36 }, bgcolor: 'primary.main', fontSize: { xs: 12, sm: 14 } }}>
                                {avatarInitials(row.user)}
                              </Avatar>
                              <Box sx={{ minWidth: 0 }}>
                                <Typography variant="body2" fontWeight={600} sx={{ fontSize: { xs: 12, sm: 14 }, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {row.user?.lname} {row.user?.fname} {row.user?.mname}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                                  {row.user?.sex === 'female' ? 'F' : 'M'} &middot; {row.user?.user_id}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          {subjects.map((subj) => {
                            const result = resultMap[subj.subject_id];
                            return (
                              <Fragment key={`sub-${subj.subject_id}`}>
                                <TableCell align="center" sx={{ bgcolor: '#b0cbcf', fontWeight: 600, minWidth: { xs: 40, sm: 48 } }}>
                                  {displayScore(result?.ca_total ?? null)}
                                </TableCell>
                                <TableCell align="center" sx={{ bgcolor: '#b0cbcf', fontWeight: 600, minWidth: { xs: 40, sm: 48 } }}>
                                  {displayScore(result?.exam_score ?? null)}
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600, minWidth: { xs: 40, sm: 48 } }}>
                                  {displayScore(result?.overall_total ?? null)}
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600, minWidth: { xs: 40, sm: 48 } }}>
                                  {result?.grade ?? '-'}
                                </TableCell>
                              </Fragment>
                            );
                          })}
                          {activeTab === 1 && (
                            <>
                              <TableCell align="center" sx={{ bgcolor: '#ffcb15', fontWeight: 600, minWidth: { xs: 44, sm: 60 } }}>{displayScore(row.first_term_average ?? null)}</TableCell>
                              <TableCell align="center" sx={{ bgcolor: '#ffcb15', fontWeight: 600, minWidth: { xs: 44, sm: 60 } }}>{displayScore(row.second_term_average ?? null)}</TableCell>
                              <TableCell align="center" sx={{ bgcolor: '#ffcb15', fontWeight: 600, minWidth: { xs: 44, sm: 60 } }}>{displayScore(row.third_term_average ?? null)}</TableCell>
                              <TableCell align="center" sx={{ bgcolor: '#ffcb15', fontWeight: 600, minWidth: { xs: 44, sm: 60 } }}>{displayScore(row.all_term_average ?? null)}</TableCell>
                            </>
                          )}
                          <TableCell align="center" sx={{ bgcolor: '#ffcb15', fontWeight: 600, minWidth: { xs: 44, sm: 60 } }}>
                            {displayScore(activeTab === 0 ? row.student_average : row.all_term_average)}
                          </TableCell>
                          <TableCell align="center" sx={{ bgcolor: '#ffcb15', fontWeight: 600, minWidth: { xs: 40, sm: 50 } }}>
                            {activeTab === 0 ? (row.position ?? '-') : (row.all_term_overall_class_position ?? '-')}
                          </TableCell>
                          <TableCell align="center" sx={{ bgcolor: '#ffcb15', fontWeight: 600, minWidth: { xs: 40, sm: 50 } }}>{row.total_subjects ?? '-'}</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600, minWidth: { xs: 40, sm: 50 } }}>
                            {remarkFor(activeTab === 0 ? row.student_average : row.all_term_average, gradeSettings)}
                          </TableCell>
                          {showPromotionButtons && (
                            <>
                              <TableCell align="center" sx={{ fontWeight: 600, minWidth: { xs: 40, sm: 50 }, textTransform: 'capitalize' }}>
                                {row.promotion_recommendation || '-'}
                              </TableCell>
                              <TableCell align="center" sx={{ minWidth: { xs: 40, sm: 50 } }}>
                                <Tooltip title="Click to change recommendation">
                                  <Box
                                    component="span"
                                    onClick={(e) => setRecMenu({ rowId: row.student_registration_id, anchorEl: e.currentTarget })}
                                    sx={{ display: 'inline-flex', cursor: 'pointer' }}
                                  >
                                    {promotionIcon(row.promotion_recommendation)}
                                  </Box>
                                </Tooltip>
                                <Menu
                                  anchorEl={recMenu.anchorEl}
                                  open={Boolean(recMenu.anchorEl) && recMenu.rowId === row.student_registration_id}
                                  onClose={() => setRecMenu({ rowId: null, anchorEl: null })}
                                >
                                  {['promoted', 'promoted on trial', 'not promoted', 'advised to repeat'].map((opt) => (
                                    <MenuItem
                                      key={opt}
                                      dense
                                      selected={row.promotion_recommendation === opt}
                                      onClick={() => handleSetRecommendation(row, opt)}
                                    >
                                      {opt}
                                    </MenuItem>
                                  ))}
                                </Menu>
                              </TableCell>
                              <TableCell align="center" sx={{ minWidth: { xs: 72, sm: 80 } }}>
                                {(row.promotion_recommendation === 'promoted' || row.promotion_recommendation === 'promoted on trial' || row.promotion_recommendation === 'graduated') ? (
                                  <FormControl size="small" fullWidth>
                                    <Select
                                      value={row.next_class_arm_id || ''}
                                      onChange={(e) => handleSetNextClass(row, e.target.value)}
                                      sx={{ fontSize: 12 }}
                                    >
                                      <MenuItem value=""><em>-</em></MenuItem>
                                      {allArms.map((arm) => (
                                        <MenuItem key={arm.id} value={arm.id}>
                                          {arm.class_name ? `${arm.class_name} - ${arm.class_arm_names}` : arm.class_arm_names}
                                        </MenuItem>
                                      ))}
                                    </Select>
                                  </FormControl>
                                ) : '-'}
                              </TableCell>
                            </>
                          )}
                          <TableCell sx={{ minWidth: { xs: 110, sm: 120 }, fontSize: 12 }}>{row.class_teachers_comment || '-'}</TableCell>
                          <TableCell sx={{ minWidth: { xs: 110, sm: 120 }, fontSize: 12 }}>{row.hos_comment || '-'}</TableCell>
                          <TableCell sx={{ minWidth: { xs: 96, sm: 100 } }}>
                            <Button size="small" variant="contained" color="primary" sx={{ fontSize: 12, px: 1, minWidth: 0, textTransform: 'none' }} onClick={(e) => handleAddEditClick(e, row)}>
                              Add/Edit
                            </Button>
                            <Menu anchorEl={addEditMenu.anchorEl} open={Boolean(addEditMenu.anchorEl) && addEditMenu.rowId === row.student_registration_id} onClose={closeAddEditMenu}>
                              <MenuItem dense onClick={() => { closeAddEditMenu(); handleOpenComment(row, 'teacher'); }}>
                                <IconMessage size={16} style={{ marginRight: 8 }} /> Class Teacher
                              </MenuItem>
                              <MenuItem dense onClick={() => { closeAddEditMenu(); handleOpenComment(row, 'hos'); }}>
                                <IconMessage size={16} style={{ marginRight: 8 }} /> HoS Comment
                              </MenuItem>
                              {activeTab === 0 && (
                                <MenuItem dense onClick={() => { closeAddEditMenu(); handleOpenEditScores(row); }}>
                                  <IconEdit size={16} style={{ marginRight: 8 }} /> Edit Scores
                                </MenuItem>
                              )}
                            </Menu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={visibleStudents.length}
                page={page}
                onPageChange={(_, p) => setPage(p)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                rowsPerPageOptions={[5, 10, 25]}
                sx={{
                  '& .MuiTablePagination-toolbar': { flexWrap: 'wrap', justifyContent: { xs: 'center', sm: 'flex-end' }, gap: 0.5 },
                  '& .MuiTablePagination-selectLabel': { display: { xs: 'none', sm: 'block' } },
                }}
              />
            </>
          )}

          {!showData && !loading && (
            <Alert severity={filterError ? 'error' : 'info'} sx={{ mt: 1 }} onClose={filterError ? () => setFilterError('') : undefined}>
              {filterError || (activeTab === 0
                ? 'Select Session, Term, Programme, Class and Class Arm, then click Fetch to view the broadsheet.'
                : 'Select Session, Programme, Class and Class Arm, then click Fetch to view the term cumulative broadsheet.')}
            </Alert>
          )}
        </Box>
      </Card>

      {/* ── Comment Dialog ──────────────────────────────────── */}
      <Dialog open={commentDialog.open} onClose={closeCommentDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {commentDialog.mode === 'hos' ? 'Head of School Comment' : 'Class Teacher Comment'} — {commentDialog.student?.user?.lname} {commentDialog.student?.user?.fname}
        </DialogTitle>
        <DialogContent dividers>
          {commentDialog.mode === 'hos' ? (
            <TextField
              label="Head of School Comment" fullWidth multiline rows={4}
              value={commentForm.hos_comment}
              onChange={(e) => setCommentForm({ ...commentForm, hos_comment: e.target.value })}
            />
          ) : (
            <TextField
              label="Class Teacher Comment" fullWidth multiline rows={4}
              value={commentForm.teacher_comment}
              onChange={(e) => setCommentForm({ ...commentForm, teacher_comment: e.target.value })}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeCommentDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveComment}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* ── Edit Scores Dialog ─────────────────────────────── */}
      <Dialog open={editScoresDialog.open} onClose={handleCloseEditScores} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Edit Scores — {editScoresDialog.student?.user?.lname} {editScoresDialog.student?.user?.fname}
        </DialogTitle>
        <DialogContent dividers>
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table size="small" sx={{ whiteSpace: 'nowrap' }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Subject</TableCell>
                  {scoreForm[0]?.ca_breakdown.map((g) => (
                    <TableCell key={g.display_name} colSpan={Math.max(g.entities.length, 1)} align="center" sx={{ fontWeight: 700 }}>
                      {g.display_name}
                    </TableCell>
                  ))}
                  <TableCell align="center" sx={{ fontWeight: 700 }}>CA Total</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Exam Score</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Action</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={2} />
                  {scoreForm[0]?.ca_breakdown.map((g) => g.entities.map((e) => (
                    <TableCell key={e.display_name} align="center" sx={{ fontSize: 12, color: 'text.secondary' }}>
                      {e.display_name}{e.max_score != null ? `(${e.max_score})` : ''}
                    </TableCell>
                  )))}
                  <TableCell align="center" sx={{ fontSize: 12, color: 'text.secondary' }}>
                    (Max {caMax})
                  </TableCell>
                  <TableCell align="center" sx={{ fontSize: 12, color: 'text.secondary' }}>
                    (Max {examMax})
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {scoreForm.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No registered subjects available to edit for this student.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : scoreForm.map((subj, i) => {
                  const caTotal = subj.ca_breakdown.reduce((sum, g) => sum + g.entities.reduce((s, e) => s + (Number(e.score) || 0), 0), 0);
                  return (
                    <TableRow key={subj.subject_id} hover>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{subj.subject_name}</TableCell>
                      {subj.ca_breakdown.map((g, gi) => g.entities.map((e, ei) => (
                        <TableCell key={`${gi}-${ei}`} align="center">
                          <TextField
                            size="small"
                            type="number"
                            value={e.score}
                            onChange={(ev) => handleScoreChange(i, gi, ei, ev.target.value)}
                            error={isScoreInvalid(e.score, e.max_score)}
                            helperText={isScoreInvalid(e.score, e.max_score) ? 'Invalid score' : ' '}
                            inputProps={{ min: 0, max: e.max_score ?? undefined, style: { textAlign: 'center', width: 64, padding: '6px 4px' } }}
                            sx={{ '& .MuiFormHelperText-root': { m: 0, fontSize: 10 } }}
                          />
                        </TableCell>
                      )))}
                      <TableCell align="center" sx={{ fontWeight: 700 }}>{caTotal}</TableCell>
                      <TableCell align="center">
                        <TextField
                          size="small"
                          type="number"
                          value={subj.exam_score}
                          onChange={(ev) => handleExamChange(i, ev.target.value)}
                          error={subj.exam_score === '' || isScoreInvalid(subj.exam_score, examMax)}
                          helperText={subj.exam_score === '' || isScoreInvalid(subj.exam_score, examMax) ? 'Invalid score' : ' '}
                          inputProps={{ min: 0, max: examMax, style: { textAlign: 'center', width: 64, padding: '6px 4px' } }}
                          sx={{ '& .MuiFormHelperText-root': { m: 0, fontSize: 10 } }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Button size="small" onClick={() => handleSaveScoreRow(i)}>
                          Save
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditScores}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* ── Snackbar ─────────────────────────────────────────── */}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <MuiAlert onClose={() => setSnackbar((s) => ({ ...s, open: false }))} severity={snackbar.severity} variant="filled">{snackbar.message}</MuiAlert>
      </Snackbar>
    </Box>
  );
};

export default BroadsheetTab;
