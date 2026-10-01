import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  TextField,
  Grid,
  Tabs,
  Tab,
  IconButton,
  Snackbar,
  Alert,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  useTheme,
  Stack,
  Tooltip,
  Collapse,
} from '@mui/material';
import {
  IconSettings,
  IconTemplate,
  IconMoodSmile,
  IconMessageCircle,
  IconAward,
  IconPlus,
  IconEdit,
  IconTrash,
  IconCheck,
  IconX,
  IconBook,
  IconHash,
  IconSchool,
  IconFile,
  IconList,
  IconSignature,
  IconEye,
  IconChevronDown,
  IconChevronRight,
} from '@tabler/icons-react';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import SetupAffectivePsychomotorTab from '@/pages/tenant/attendance/components/SetupAffectivePsychomotorTab';
import SessionTermSelector from './SessionTermSelector';
import GradeConfiguration from './GradeConfiguration';
import PromotionSettings from './PromotionSettings';
import { useResultTemplate } from '@/context/ResultTemplateContext';
import StatCard from '@/components/shared/StatCard';
import resultSetupApi from '@/api/tenant/result-setup/resultSetupApi';

function InnerTabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

const ResultSetupTab = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const {
    activeTemplate,
    selectTemplate,
    setEnableCAReport,
    templateSamples,
    samplesLoading,
    fetchActiveTemplate,
    divisionTemplates,
    fetchTemplateSamples,
    getCAReportForDivision,
  } = useResultTemplate();

  const [innerTab, setInnerTab] = useState(0);
  const [currentSessionTermId, setCurrentSessionTermId] = useState(null);
  const [gradeStats, setGradeStats] = useState({
    total_grades: 0,
    has_config: false,
    pass_mark: '—',
    subjects: 0,
    mark_range: '—',
  });
  const [gradeStatsLoading, setGradeStatsLoading] = useState(false);
  const [promotionStats, setPromotionStats] = useState({
    total_rules: 0,
    programmes: 0,
    subject_types: 0,
    total_subjects: 0,
    pass_mark: '—',
  });
  const [promotionStatsLoading, setPromotionStatsLoading] = useState(false);
  // Real school divisions from /result-setup/divisions (one tab each).
  const [divisions, setDivisions] = useState([]);
  const [divisionsLoading, setDivisionsLoading] = useState(true);
  const [selectedDivisionId, setSelectedDivisionId] = useState(null);
  const [nomenclature, setNomenclature] = useState([]);
  const [nomenclatureLoading, setNomenclatureLoading] = useState(false);

  const [nomenclatureDialog, setNomenclatureDialog] = useState({ open: false, editing: null });
  const [nomenclatureForm, setNomenclatureForm] = useState({ position_name: '', status: 'active' });
  const [nomMenuAnchor, setNomMenuAnchor] = useState(null);
  const [nomMenuRow, setNomMenuRow] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [imagePreview, setImagePreview] = useState({ open: false, src: '' });
  const [signatureDialog, setSignatureDialog] = useState({
    open: false,
    id: null,
    positionName: '',
  });
  const [signaturePreview, setSignaturePreview] = useState({ open: false, src: '' });
  const [signatureFile, setSignatureFile] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    id: null,
    action: '',
    label: '',
  });
  const [syncingConfig, setSyncingConfig] = useState(false);
  const [syncRefreshKey, setSyncRefreshKey] = useState(0);
  const [gradeStatDetail, setGradeStatDetail] = useState(null); // 'total_grades' | 'pass_mark' | 'subjects' | 'mark_range' | null
  const [promotionStatDetail, setPromotionStatDetail] = useState(null); // 'programmes' | 'pass_mark' | 'subject_types' | 'total_subjects' | null
  const [expandedProgramme, setExpandedProgramme] = useState(null);
  const [expandedClass, setExpandedClass] = useState(null);

  const showSnackbar = (message, severity = 'success') =>
    setSnackbar({ open: true, message, severity });

  // ── Comment Nomenclature API ──────────────────────────────
  const fetchNomenclatures = useCallback(async () => {
    setNomenclatureLoading(true);
    try {
      const response = await resultSetupApi.getCommentNomenclatures();
      if (response.data.status) {
        setNomenclature(response.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch nomenclatures:', err);
    } finally {
      setNomenclatureLoading(false);
    }
  }, []);

  // ── Comment Nomenclatures (tab 4 only) ─────────────────────
  useEffect(() => {
    if (innerTab !== 3) return;
    fetchNomenclatures();
  }, [innerTab, fetchNomenclatures]);

  // ── Divisions + template samples catalog (tab 2 only) ───────
  // Per-division template/CA-report values are NOT fetched here — they
  // already live in ResultTemplateContext (divisionTemplates/
  // divisionCAReports), kept correct per-division by the effect below.
  // This used to run its own separate, unscoped getActiveTemplate() call
  // with no division_id, which silently always returned the FIRST active
  // division's data — so the "CA Reports" stat stayed stuck on whichever
  // division loads first even after switching to a different division tab.
  useEffect(() => {
    if (innerTab !== 1) return;
    let cancelled = false;
    setDivisionsLoading(true);
    const loadDivisions = async () => {
      try {
        const res = await resultSetupApi.getDivisions();
        if (cancelled || !res.data?.status) return;
        const list = res.data.data || [];
        setDivisions(list);
        if (list.length > 0) {
          setSelectedDivisionId((prev) => (prev == null ? list[0].id : prev));
          // Pre-fetch every division's active template (not just the
          // selected one) so the "Active Templates" count below is accurate
          // from the start, not just for whichever division happens to be
          // open.
          list.forEach((d) => fetchActiveTemplate(d.id).catch(() => {}));
        }
      } catch (err) {
        console.error('Failed to fetch divisions:', err);
      } finally {
        if (!cancelled) setDivisionsLoading(false);
      }
    };
    loadDivisions();
    fetchTemplateSamples();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [innerTab]);

  // Load the selected division's active template when on the templates tab.
  useEffect(() => {
    if (innerTab !== 1 || selectedDivisionId == null) return;
    fetchActiveTemplate(selectedDivisionId).catch(() => {});
  }, [innerTab, selectedDivisionId, fetchActiveTemplate]);

  // ── Fetch grade config stats when session term changes ──────
  const fetchGradeStats = useCallback(async () => {
    if (!currentSessionTermId) {
      setGradeStats({
        total_grades: 0,
        has_config: false,
        pass_mark: '—',
        subjects: 0,
        mark_range: '—',
      });
      return;
    }

    setGradeStatsLoading(true);
    try {
      const res = await resultSetupApi.getGradeConfigStats(currentSessionTermId);
      if (res.data.status) {
        setGradeStats({ has_config: false, ...res.data.data });
      }
    } catch (err) {
      console.error('Failed to fetch grade stats:', err);
    } finally {
      setGradeStatsLoading(false);
    }
  }, [currentSessionTermId]);

  useEffect(() => {
    fetchGradeStats();
  }, [fetchGradeStats]);

  // ── Fetch promotion stats on mount ──────────────────────────
  const fetchPromotionStats = useCallback(async () => {
    setPromotionStatsLoading(true);
    try {
      const res = await resultSetupApi.getPromotionStats();
      if (res.data.status) {
        setPromotionStats(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch promotion stats:', err);
    } finally {
      setPromotionStatsLoading(false);
    }
  }, []);

  // ── Promotion stats (tab 5 only) ───────────────────────────
  useEffect(() => {
    if (innerTab !== 4) return;
    fetchPromotionStats();
  }, [innerTab, fetchPromotionStats]);

  const innerTabs = [
    { label: '1. Grade & Config. Settings', icon: <IconAward size={16} /> },
    { label: '2. Result Templates', icon: <IconTemplate size={16} /> },
    { label: '3. Affective & Psychomotor', icon: <IconMoodSmile size={16} /> },
    { label: '4. Comment Nomenclature', icon: <IconMessageCircle size={16} /> },
    { label: '5. Promotion Settings', icon: <IconSettings size={16} /> },
  ];

  const handleNomSave = async () => {
    try {
      const payload = {
        position_name: nomenclatureForm.position_name,
        status: nomenclatureForm.status,
      };
      if (nomenclatureDialog.editing) {
        payload.id = nomenclatureDialog.editing.id;
      }
      const response = await resultSetupApi.saveCommentNomenclature(payload);
      if (response.data.status) {
        showSnackbar(response.data.message);
        await fetchNomenclatures();
      }
    } catch (err) {
      console.error('Failed to save nomenclature:', err);
      showSnackbar('Failed to save nomenclature', 'error');
    }
    setNomenclatureDialog({ open: false, editing: null });
    setNomenclatureForm({ position_name: '', status: 'active' });
  };

  const handleNomDelete = async (id) => {
    try {
      const response = await resultSetupApi.deleteCommentNomenclature(id);
      if (response.data.status) {
        showSnackbar(response.data.message);
        await fetchNomenclatures();
      }
    } catch (err) {
      console.error('Failed to delete nomenclature:', err);
      showSnackbar('Failed to delete nomenclature', 'error');
    }
    setNomMenuAnchor(null);
  };

  const handleNomToggleStatus = async (id) => {
    try {
      const response = await resultSetupApi.toggleCommentNomenclatureStatus(id);
      if (response.data.status) {
        showSnackbar(response.data.message);
        await fetchNomenclatures();
      }
    } catch (err) {
      console.error('Failed to toggle nomenclature status:', err);
      showSnackbar('Failed to update status', 'error');
    }
    setConfirmDialog({ open: false, id: null, action: '', label: '' });
    setNomMenuAnchor(null);
  };

  const handleTemplateSelect = async (sample) => {
    try {
      await selectTemplate(sample, selectedDivisionId);
      showSnackbar(`Template "${sample}" selected`);
    } catch (err) {
      console.error('Failed to select template:', err);
      showSnackbar('Failed to select template', 'error');
    }
  };

  // Template currently active for the selected division (falls back to
  // the default active template when no division is selected).
  const currentTemplateForDivision =
    selectedDivisionId != null
      ? divisionTemplates[selectedDivisionId] || activeTemplate
      : activeTemplate;

  // CA Reportsheet flag for the selected division (per-division cache).
  const caReportChecked = getCAReportForDivision(selectedDivisionId);

  // Whether every active division agrees on a given grade-config field —
  // drives the "all divisions match" / "divisions differ" callout at the
  // top of each stat card's drill-down, since the single number on the
  // card itself can't show that on its own.
  const byDivision = gradeStats.by_division || [];
  const divisionsAgreeOn = (key) =>
    byDivision.length > 0 &&
    byDivision.every((d) => JSON.stringify(d[key]) === JSON.stringify(byDivision[0][key]));

  return (
    <Box>
      {/* ── Sub-Tabs Navigation ─────────────────────────────── */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs
          value={innerTab}
          onChange={(_, v) => setInnerTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '13px' } }}
        >
          {innerTabs.map((tab, i) => (
            <Tab key={i} label={tab.label} icon={tab.icon} iconPosition="start" />
          ))}
        </Tabs>
      </Box>

      {/* ════════════════════════════════════════════════════════
          1. GRADE & CONFIG SETTINGS
          ════════════════════════════════════════════════════════ */}
      <InnerTabPanel value={innerTab} index={0}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <StatCard
            count={gradeStats.total_grades}
            label="Total Grades"
            subtitle={`Distinct letters${divisions.length ? ` · ${divisions.length} division${divisions.length === 1 ? '' : 's'}` : ''}`}
            icon={IconAward}
            colorIndex={0}
            loading={gradeStatsLoading}
            tooltip="Click to see each division's grading scale"
            onClick={() => setGradeStatDetail('total_grades')}
          />
          <StatCard
            count={gradeStats.pass_mark}
            label="Pass Mark"
            subtitle={`Minimum passing grade${divisions.length ? ` · ${divisions.length} division${divisions.length === 1 ? '' : 's'}` : ''}`}
            icon={IconCheck}
            colorIndex={1}
            loading={gradeStatsLoading}
            tooltip="Click to compare the pass mark across divisions"
            onClick={() => setGradeStatDetail('pass_mark')}
          />
          <StatCard
            count={gradeStats.subjects}
            label="Subjects"
            subtitle="Distinct, across all programmes & classes"
            icon={IconBook}
            colorIndex={2}
            loading={gradeStatsLoading}
            tooltip="Click to see the subjects by programme, then by class, with each one's real compulsory/optional status"
            onClick={() => setGradeStatDetail('subjects')}
          />
          <StatCard
            count={gradeStats.mark_range}
            label="Mark Range"
            subtitle={`Min - Max scores${divisions.length ? ` · ${divisions.length} division${divisions.length === 1 ? '' : 's'}` : ''}`}
            icon={IconHash}
            colorIndex={3}
            loading={gradeStatsLoading}
            tooltip="Click to see the score range per division"
            onClick={() => setGradeStatDetail('mark_range')}
          />
        </Stack>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: '14px',
            border: '1px solid',
            borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
          }}
        >
          <SessionTermSelector
            onSessionTermChange={setCurrentSessionTermId}
            rightSlot={
              <Tooltip
                title={
                  !currentSessionTermId
                    ? 'Select a session term first'
                    : gradeStats.has_config
                      ? 'This term already has a grading scale, mark configuration and pass mark — sync is disabled to protect them from being overwritten'
                      : "Copy the previous term's grading scale, mark configuration and pass mark into this term"
                }
              >
                <span>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<IconSettings size={16} />}
                    disabled={!currentSessionTermId || syncingConfig || gradeStats.has_config}
                    onClick={async () => {
                      setSyncingConfig(true);
                      try {
                        // Sync the SELECTED term (active or not) — the backend
                        // copies from the nearest term created before it.
                        const res = await resultSetupApi.syncConfig(currentSessionTermId);
                        if (res.data.status) {
                          showSnackbar(res.data.message);
                          // Re-pull the grade/mark config so copied values show immediately.
                          setSyncRefreshKey((k) => k + 1);
                          fetchGradeStats();
                        } else {
                          showSnackbar(res.data.message || 'Failed to sync config', 'error');
                        }
                      } catch (err) {
                        showSnackbar(
                          err?.response?.data?.message || 'Failed to sync config',
                          'error',
                        );
                      } finally {
                        setSyncingConfig(false);
                      }
                    }}
                  >
                    {syncingConfig ? 'Syncing…' : 'Sync previous Term Config to New Term'}
                  </Button>
                </span>
              </Tooltip>
            }
          />
          <GradeConfiguration sessionTermId={currentSessionTermId} refreshKey={syncRefreshKey} />
        </Paper>
      </InnerTabPanel>

      {/* ════════════════════════════════════════════════════════
          2. RESULT TEMPLATES
          ════════════════════════════════════════════════════════ */}
      <InnerTabPanel value={innerTab} index={1}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <StatCard
            count={templateSamples.length}
            label="Templates"
            subtitle="Available report card designs"
            icon={IconTemplate}
            colorIndex={0}
            loading={samplesLoading}
          />
          <StatCard
            count={new Set(divisions.map((d) => divisionTemplates[d.id] || activeTemplate)).size}
            label="Active Templates"
            subtitle="Distinct templates in use"
            icon={IconCheck}
            colorIndex={1}
            loading={divisionsLoading}
          />
          <StatCard
            count={divisions.length}
            label="Divisions"
            subtitle="Configured school divisions"
            icon={IconSchool}
            colorIndex={2}
            loading={divisionsLoading}
          />
          <StatCard
            count={caReportChecked ? 'Enabled' : 'Disabled'}
            label="CA Reports"
            subtitle={
              selectedDivisionId != null
                ? `For ${divisions.find((d) => d.id === selectedDivisionId)?.division_name || 'this division'}`
                : 'Reportsheet status'
            }
            icon={IconFile}
            colorIndex={3}
            loading={divisionsLoading}
          />
        </Stack>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: '14px',
            border: '1px solid',
            borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
          }}
        >
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
          >
            <Typography variant="h6" fontWeight={600}>
              Template Samples
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" fontWeight={600}>
                Enable C.A Reportsheet
              </Typography>
              <Switch
                checked={caReportChecked}
                onChange={async (e) => {
                  const next = e.target.checked;
                  try {
                    await setEnableCAReport(next, selectedDivisionId);
                    showSnackbar(`CA Reportsheet ${next ? 'enabled' : 'disabled'}`);
                  } catch (err) {
                    console.error('Failed to toggle CA report:', err);
                    showSnackbar('Failed to update CA Reportsheet', 'error');
                  }
                }}
                color="primary"
              />
            </Box>
          </Box>
          <Alert severity="info" sx={{ mb: 2 }}>
            The current template is the one with the green outline. To change, click on a template
            image or use the <strong>Select</strong> button. Templates are saved per division.
          </Alert>
          {divisions.length > 0 && (
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs
                value={selectedDivisionId ?? divisions[0]?.id}
                onChange={(_, v) => setSelectedDivisionId(v)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '13px' },
                }}
              >
                {divisions.map((d) => (
                  <Tab key={d.id} label={d.division_name} value={d.id} />
                ))}
              </Tabs>
            </Box>
          )}
          {divisions.length === 0 && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              No school divisions found. Configure divisions in School Setup before assigning
              templates.
            </Alert>
          )}
          <Grid container spacing={2}>
            {samplesLoading ? (
              [...Array(6)].map((_, i) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                  <Skeleton variant="rounded" height={200} sx={{ borderRadius: '12px' }} />
                </Grid>
              ))
            ) : templateSamples.map((t) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={t.id}>
                <Paper
                  elevation={0}
                  sx={{
                    border: '2px solid',
                    borderColor:
                      currentTemplateForDivision === t.sample
                        ? 'success.main'
                        : isDark
                          ? 'rgba(255,255,255,0.12)'
                          : '#E5E7EB',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: 'primary.main',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  <Box sx={{ position: 'relative' }}>
                    {currentTemplateForDivision === t.sample && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 8,
                          left: 8,
                          zIndex: 1,
                          bgcolor: 'success.main',
                          borderRadius: '50%',
                          width: 28,
                          height: 28,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <IconCheck size={16} color="#fff" />
                      </Box>
                    )}
                    <Box
                      component="img"
                      src={t.image}
                      alt={t.sample}
                      sx={{
                        width: '100%',
                        height: 200,
                        objectFit: 'cover',
                        display: 'block',
                        cursor: 'zoom-in',
                      }}
                      onClick={() => setImagePreview({ open: true, src: t.image })}
                    />
                  </Box>
                  <Box
                    sx={{
                      p: 1.5,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight={600}>
                      {t.sample}
                    </Typography>
                    {currentTemplateForDivision !== t.sample ? (
                      <Button
                        size="small"
                        disabled={selectedDivisionId == null}
                        onClick={() => handleTemplateSelect(t.sample)}
                      >
                        Select
                      </Button>
                    ) : (
                      <Chip label="Active" size="small" color="success" />
                    )}
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </InnerTabPanel>

      {/* ════════════════════════════════════════════════════════
          3. AFFECTIVE & PSYCHOMOTOR
          ════════════════════════════════════════════════════════ */}
      <InnerTabPanel value={innerTab} index={2}>
        <SetupAffectivePsychomotorTab showWeeklyReports={false} />
      </InnerTabPanel>

      {/* ════════════════════════════════════════════════════════
          4. COMMENT NOMENCLATURE
          ════════════════════════════════════════════════════════ */}
      <InnerTabPanel value={innerTab} index={3}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <StatCard
            count={nomenclature.length}
            label="Total Positions"
            subtitle="Defined position names"
            icon={IconList}
            colorIndex={0}
            loading={nomenclatureLoading}
          />
          <StatCard
            count={nomenclature.filter((n) => n.status === 'active').length}
            label="Active"
            subtitle="Currently in use"
            icon={IconCheck}
            colorIndex={1}
            loading={nomenclatureLoading}
          />
          <StatCard
            count={nomenclature.filter((n) => n.status === 'inactive').length}
            label="Inactive"
            subtitle="Deactivated positions"
            icon={IconX}
            colorIndex={3}
            loading={nomenclatureLoading}
          />
        </Stack>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: '14px',
            border: '1px solid',
            borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
          }}
        >
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
          >
            <Typography variant="h6" fontWeight={600}>
              Comment Nomenclature
            </Typography>
            <Button
              size="small"
              startIcon={<IconPlus size={16} />}
              onClick={() => {
                setNomenclatureDialog({ open: true, editing: null });
                setNomenclatureForm({ position_name: '', status: 'active' });
              }}
            >
              Add Position Name
            </Button>
          </Box>
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table
              stickyHeader
              sx={{ '& .MuiTableCell-root': { py: 0.5, px: 1 }, whiteSpace: 'nowrap' }}
            >
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Position Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {nomenclature.map((n, i) => (
                  <TableRow key={n.id} hover>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>{n.position_name}</TableCell>
                    <TableCell>
                      <Chip
                        label={n.status}
                        size="small"
                        color={n.status === 'active' ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          setNomMenuAnchor(e.currentTarget);
                          setNomMenuRow(n);
                        }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                      <Menu
                        anchorEl={nomMenuAnchor}
                        open={Boolean(nomMenuAnchor) && nomMenuRow?.id === n.id}
                        onClose={() => {
                          setNomMenuAnchor(null);
                          setNomMenuRow(null);
                        }}
                      >
                        <MenuItem
                          onClick={() => {
                            setNomenclatureDialog({ open: true, editing: n });
                            setNomenclatureForm({
                              position_name: n.position_name,
                              status: n.status,
                            });
                            setNomMenuAnchor(null);
                          }}
                        >
                          <IconEdit size={18} style={{ marginRight: 8 }} /> Edit
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            setNomMenuAnchor(null);
                            const newStatus = n.status === 'active' ? 'inactive' : 'active';
                            setConfirmDialog({
                              open: true,
                              id: n.id,
                              action: newStatus,
                              label: n.position_name,
                            });
                          }}
                        >
                          {n.status === 'active' ? (
                            <>
                              <IconX size={18} style={{ marginRight: 8 }} /> Deactivate
                            </>
                          ) : (
                            <>
                              <IconCheck size={18} style={{ marginRight: 8 }} /> Activate
                            </>
                          )}
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            setNomMenuAnchor(null);
                            setSignatureDialog({
                              open: true,
                              id: n.id,
                              positionName: n.position_name,
                            });
                            setSignatureFile(n.signature || null);
                          }}
                        >
                          <IconSignature size={18} style={{ marginRight: 8 }} /> Change Signature
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            setNomMenuAnchor(null);
                            setSignaturePreview({ open: true, src: n.signature || '' });
                          }}
                        >
                          <IconEye size={18} style={{ marginRight: 8 }} /> Preview Signature
                        </MenuItem>
                        <MenuItem
                          onClick={() => handleNomDelete(n.id)}
                          sx={{ color: 'error.main' }}
                        >
                          <IconTrash size={18} style={{ marginRight: 8 }} /> Delete
                        </MenuItem>
                      </Menu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </InnerTabPanel>

      {/* ════════════════════════════════════════════════════════
          5. PROMOTION SETTINGS
          ════════════════════════════════════════════════════════ */}
      <InnerTabPanel value={innerTab} index={4}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <StatCard
            count={promotionStats.programmes}
            label="Programmes"
            subtitle={`Of ${promotionStats.total_programmes ?? '—'} with promotion rules`}
            icon={IconSchool}
            colorIndex={0}
            loading={promotionStatsLoading}
            tooltip="Click to see which programmes have a promotion rule set, and which don't yet"
            onClick={() => setPromotionStatDetail('programmes')}
          />
          <StatCard
            count={promotionStats.pass_mark}
            label="Pass Mark"
            subtitle="Cumulative minimum · click for by-programme"
            icon={IconCheck}
            colorIndex={1}
            loading={promotionStatsLoading}
            tooltip="This is the mark recommendPromotions() actually uses — click to compare it across programmes"
            onClick={() => setPromotionStatDetail('pass_mark')}
          />
          <StatCard
            count={promotionStats.subject_types}
            label="Subject Types"
            subtitle="Compulsory / Elective / Trade"
            icon={IconSettings}
            colorIndex={2}
            loading={promotionStatsLoading}
            tooltip="These are saved but not yet used by the real promotion calculation — click for details"
            onClick={() => setPromotionStatDetail('subject_types')}
          />
          <StatCard
            count={promotionStats.total_subjects}
            label="Total Subjects"
            subtitle="Assigned across all types"
            icon={IconAward}
            colorIndex={3}
            loading={promotionStatsLoading}
            tooltip="Click to see which subjects are assigned to each type, per programme"
            onClick={() => setPromotionStatDetail('total_subjects')}
          />
        </Stack>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: '14px',
            border: '1px solid',
            borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
          }}
        >
          <Typography variant="h6" fontWeight={600} mb={2}></Typography>
          <PromotionSettings onStatsRefresh={fetchPromotionStats} />
        </Paper>
      </InnerTabPanel>

      {/* ════════════════════════════════════════════════════════
          DIALOGS
          ════════════════════════════════════════════════════════ */}
      <Dialog
        open={nomenclatureDialog.open}
        onClose={() => setNomenclatureDialog({ open: false, editing: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {nomenclatureDialog.editing ? 'Edit Position Name' : 'Add Position Name'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Position Name"
                fullWidth
                size="small"
                value={nomenclatureForm.position_name}
                onChange={(e) =>
                  setNomenclatureForm({ ...nomenclatureForm, position_name: e.target.value })
                }
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={nomenclatureForm.status}
                  label="Status"
                  onChange={(e) =>
                    setNomenclatureForm({ ...nomenclatureForm, status: e.target.value })
                  }
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNomenclatureDialog({ open: false, editing: null })}>
            Cancel
          </Button>
          <Button size="small" onClick={handleNomSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Image Preview Modal ──────────────────────────── */}
      <Dialog
        open={imagePreview.open}
        onClose={() => setImagePreview({ open: false, src: '' })}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Template Preview</DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          <Box sx={{ textAlign: 'center', bgcolor: '#fff' }}>
            <img
              src={imagePreview.src}
              alt="Template Preview"
              style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImagePreview({ open: false, src: '' })}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* ── Change Signature Dialog ──────────────────────────── */}
      <Dialog
        open={signatureDialog.open}
        onClose={() => setSignatureDialog({ open: false, id: null, positionName: '' })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Change Signature — {signatureDialog.positionName}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Box
              component="input"
              type="file"
              accept="image/*"
              id="signature-upload"
              sx={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    setSignatureFile(ev.target.result);
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
            {signatureFile ? (
              <Box sx={{ mb: 2 }}>
                <Box
                  component="img"
                  src={signatureFile}
                  alt="Signature Preview"
                  sx={{
                    maxWidth: '100%',
                    maxHeight: 200,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                />
              </Box>
            ) : (
              <Box
                sx={{
                  mb: 2,
                  py: 4,
                  border: '2px dashed',
                  borderColor: 'divider',
                  borderRadius: 1,
                  bgcolor: 'grey.50',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  No signature uploaded yet
                </Typography>
              </Box>
            )}
            <label htmlFor="signature-upload">
              <Button variant="outlined" component="span" startIcon={<IconPlus size={16} />}>
                {signatureFile ? 'Change Signature' : 'Upload Signature'}
              </Button>
            </label>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSignatureDialog({ open: false, id: null, positionName: '' })}>
            Cancel
          </Button>
          <Button
            size="small"
            disabled={!signatureFile}
            onClick={async () => {
              try {
                const response = await resultSetupApi.saveCommentNomenclature({
                  id: signatureDialog.id,
                  position_name: signatureDialog.positionName,
                  status: nomenclature.find((n) => n.id === signatureDialog.id)?.status,
                  signature: signatureFile,
                });
                if (response.data.status) {
                  showSnackbar('Signature updated successfully');
                  await fetchNomenclatures();
                }
              } catch (err) {
                console.error('Failed to save signature:', err);
                showSnackbar('Failed to save signature', 'error');
              }
              setSignatureDialog({ open: false, id: null, positionName: '' });
              setSignatureFile(null);
            }}
          >
            Save Signature
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Preview Signature Dialog ──────────────────────────── */}
      <Dialog
        open={signaturePreview.open}
        onClose={() => setSignaturePreview({ open: false, src: '' })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Preview Signature</DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          <Box sx={{ textAlign: 'center', py: 4, bgcolor: '#fff' }}>
            {signaturePreview.src ? (
              <Box
                component="img"
                src={signaturePreview.src}
                alt="Signature"
                sx={{ maxWidth: '100%', maxHeight: 300 }}
              />
            ) : (
              <Box sx={{ py: 6 }}>
                <IconSignature size={64} color="#ccc" />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  No signature uploaded yet
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSignaturePreview({ open: false, src: '' })}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* ── Confirm Status Toggle Dialog ──────────────────────── */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, id: null, action: '', label: '' })}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {confirmDialog.action === 'active' ? 'Activate' : 'Deactivate'} Nomenclature
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to {confirmDialog.action === 'active' ? 'activate' : 'deactivate'}{' '}
            <strong>{confirmDialog.label}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmDialog({ open: false, id: null, action: '', label: '' })}
          >
            Cancel
          </Button>
          <Button onClick={() => handleNomToggleStatus(confirmDialog.id)}>
            {confirmDialog.action === 'active' ? 'Activate' : 'Deactivate'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Promotion stat-card drill-down — the top cards show one
          school-wide number each; this shows the real per-programme
          breakdown, and is explicit that the subject-type rows (Compulsory/
          Elective/Trade) are saved but not yet read by the actual promotion
          calculation, which only ever uses the cumulative mark. */}
      <Dialog open={!!promotionStatDetail} onClose={() => setPromotionStatDetail(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {promotionStatDetail === 'programmes' && 'Promotion Rules by Programme'}
          {promotionStatDetail === 'pass_mark' && 'Cumulative Pass Mark by Programme'}
          {promotionStatDetail === 'subject_types' && 'Subject-Type Rules by Programme'}
          {promotionStatDetail === 'total_subjects' && 'Subjects Assigned by Programme'}
        </DialogTitle>
        <DialogContent dividers>
          {(promotionStatDetail === 'subject_types' || promotionStatDetail === 'total_subjects') && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Heads up: the Compulsory/Elective/Trade rows below are saved, but the actual
              promotion calculation currently only reads the cumulative pass mark — these
              subject-type rules don't affect a promotion decision yet.
            </Alert>
          )}
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Programme</TableCell>
                  {promotionStatDetail === 'programmes' && <TableCell align="right" sx={{ fontWeight: 700 }}>Status</TableCell>}
                  {promotionStatDetail === 'pass_mark' && <TableCell align="right" sx={{ fontWeight: 700 }}>Cumulative Mark</TableCell>}
                  {(promotionStatDetail === 'subject_types' || promotionStatDetail === 'total_subjects') && (
                    <TableCell sx={{ fontWeight: 700 }}>Subject Types</TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {(promotionStats.by_programme || []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2}>
                      <Typography variant="body2" color="text.secondary">No programmes found.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  promotionStats.by_programme.map((p) => (
                    <TableRow key={p.programme_id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>{p.programme_name}</Typography>
                      </TableCell>
                      {promotionStatDetail === 'programmes' && (
                        <TableCell align="right">
                          {p.cumulative_mark !== '—' || (p.subject_types || []).length > 0 ? (
                            <Chip label="Configured" size="small" color="success" variant="outlined" />
                          ) : (
                            <Chip label="Not set" size="small" color="warning" variant="outlined" />
                          )}
                        </TableCell>
                      )}
                      {promotionStatDetail === 'pass_mark' && (
                        <TableCell align="right">{p.cumulative_mark}</TableCell>
                      )}
                      {(promotionStatDetail === 'subject_types' || promotionStatDetail === 'total_subjects') && (
                        <TableCell>
                          {(p.subject_types || []).length === 0 ? (
                            <Typography variant="caption" color="text.secondary">None configured</Typography>
                          ) : (
                            <Stack spacing={0.5}>
                              {p.subject_types.map((st) => (
                                <Stack key={st.subject_type} direction="row" justifyContent="space-between" spacing={2}>
                                  <Typography variant="caption">{st.subject_type}</Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {promotionStatDetail === 'total_subjects'
                                      ? `${st.total_subjects} subject(s)`
                                      : `Pass mark ${st.pass_mark}`}
                                  </Typography>
                                </Stack>
                              ))}
                            </Stack>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPromotionStatDetail(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Grade & Config stat-card drill-down — a single aggregated number on
          the card can hide real per-division differences (e.g. Junior A-F
          vs. a Senior WAEC-style scale), so clicking any of the 4 cards
          shows the real breakdown instead of trusting one figure. */}
      <Dialog
        open={!!gradeStatDetail}
        onClose={() => {
          setGradeStatDetail(null);
          setExpandedProgramme(null);
          setExpandedClass(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {gradeStatDetail === 'total_grades' && 'Grades by Division'}
          {gradeStatDetail === 'pass_mark' && 'Pass Mark by Division'}
          {gradeStatDetail === 'mark_range' && 'Mark Range by Division'}
          {gradeStatDetail === 'subjects' && 'Subjects by Programme'}
        </DialogTitle>
        <DialogContent dividers>
          {gradeStatDetail === 'subjects' ? (
            <>
              <Alert severity="info" sx={{ mb: 2 }}>
                These are class subjects: the <strong>{gradeStats.subjects}</strong> card counts
                each distinct subject once. Below, click a programme to see its classes, then a
                class to see its actual subjects — since the same subject can be set up differently
                per class (e.g. compulsory in one, optional in another), each class shows its own
                real status instead of one averaged number.
              </Alert>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Programme</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        Distinct Subjects
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(gradeStats.subjects_by_programme || []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={2}>
                          <Typography variant="body2" color="text.secondary">
                            No subjects registrable this term yet.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      gradeStats.subjects_by_programme.map((row) => {
                        const isOpen = expandedProgramme === row.programme_name;
                        return (
                          <React.Fragment key={row.programme_name}>
                            <TableRow
                              hover
                              onClick={() =>
                                setExpandedProgramme(isOpen ? null : row.programme_name)
                              }
                              sx={{ cursor: 'pointer' }}
                            >
                              <TableCell>
                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                  {isOpen ? (
                                    <IconChevronDown size={16} />
                                  ) : (
                                    <IconChevronRight size={16} />
                                  )}
                                  <Typography variant="body2" fontWeight={600}>
                                    {row.programme_name}
                                  </Typography>
                                </Stack>
                              </TableCell>
                              <TableCell align="right">{row.total}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell
                                colSpan={2}
                                sx={{ p: 0, border: isOpen ? undefined : 'none' }}
                              >
                                <Collapse in={isOpen} timeout="auto" unmountOnExit>
                                  <Box
                                    sx={{
                                      pl: 3,
                                      pr: 1,
                                      py: 1,
                                      bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC',
                                    }}
                                  >
                                    <Table size="small">
                                      <TableBody>
                                        {(row.classes || []).map((cls) => {
                                          const classKey = `${row.programme_name}::${cls.class_name}`;
                                          const isClassOpen = expandedClass === classKey;
                                          return (
                                            <React.Fragment key={classKey}>
                                              <TableRow
                                                hover
                                                onClick={() =>
                                                  setExpandedClass(isClassOpen ? null : classKey)
                                                }
                                                sx={{ cursor: 'pointer' }}
                                              >
                                                <TableCell
                                                  sx={{ border: 'none', fontSize: '0.82rem' }}
                                                >
                                                  <Stack
                                                    direction="row"
                                                    alignItems="center"
                                                    spacing={0.5}
                                                  >
                                                    {isClassOpen ? (
                                                      <IconChevronDown size={14} />
                                                    ) : (
                                                      <IconChevronRight size={14} />
                                                    )}
                                                    <Typography
                                                      variant="body2"
                                                      fontWeight={600}
                                                      sx={{ fontSize: '0.82rem' }}
                                                    >
                                                      {cls.class_name}
                                                    </Typography>
                                                  </Stack>
                                                </TableCell>
                                                <TableCell
                                                  align="right"
                                                  sx={{ border: 'none', fontSize: '0.82rem' }}
                                                >
                                                  {cls.total}
                                                </TableCell>
                                              </TableRow>
                                              <TableRow>
                                                <TableCell
                                                  colSpan={2}
                                                  sx={{ p: 0, border: 'none' }}
                                                >
                                                  <Collapse
                                                    in={isClassOpen}
                                                    timeout="auto"
                                                    unmountOnExit
                                                  >
                                                    <Box sx={{ pl: 3, pr: 1, py: 1 }}>
                                                      <Table size="small">
                                                        <TableHead>
                                                          <TableRow>
                                                            <TableCell
                                                              sx={{
                                                                fontWeight: 700,
                                                                fontSize: '0.7rem',
                                                                border: 'none',
                                                              }}
                                                            >
                                                              Subject
                                                            </TableCell>
                                                            <TableCell
                                                              sx={{
                                                                fontWeight: 700,
                                                                fontSize: '0.7rem',
                                                                border: 'none',
                                                              }}
                                                            >
                                                              Code
                                                            </TableCell>
                                                            <TableCell
                                                              align="right"
                                                              sx={{
                                                                fontWeight: 700,
                                                                fontSize: '0.7rem',
                                                                border: 'none',
                                                              }}
                                                            >
                                                              Status
                                                            </TableCell>
                                                          </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                          {(cls.subjects || []).map((s) => (
                                                            <TableRow
                                                              key={s.subject_code + s.subject_name}
                                                            >
                                                              <TableCell
                                                                sx={{
                                                                  border: 'none',
                                                                  fontSize: '0.78rem',
                                                                }}
                                                              >
                                                                {s.subject_name}
                                                              </TableCell>
                                                              <TableCell
                                                                sx={{
                                                                  border: 'none',
                                                                  fontSize: '0.78rem',
                                                                }}
                                                              >
                                                                {s.subject_code}
                                                              </TableCell>
                                                              <TableCell
                                                                align="right"
                                                                sx={{ border: 'none' }}
                                                              >
                                                                <Chip
                                                                  label={s.status}
                                                                  size="small"
                                                                  color={
                                                                    s.status === 'Compulsory'
                                                                      ? 'primary'
                                                                      : s.status === 'Trade'
                                                                        ? 'secondary'
                                                                        : 'default'
                                                                  }
                                                                  variant="outlined"
                                                                />
                                                              </TableCell>
                                                            </TableRow>
                                                          ))}
                                                        </TableBody>
                                                      </Table>
                                                    </Box>
                                                  </Collapse>
                                                </TableCell>
                                              </TableRow>
                                            </React.Fragment>
                                          );
                                        })}
                                      </TableBody>
                                    </Table>
                                  </Box>
                                </Collapse>
                              </TableCell>
                            </TableRow>
                          </React.Fragment>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          ) : (
            <>
              {byDivision.length > 1 && (
                <Alert
                  severity={
                    (gradeStatDetail === 'total_grades' && divisionsAgreeOn('grades')) ||
                    (gradeStatDetail === 'pass_mark' && divisionsAgreeOn('pass_mark')) ||
                    (gradeStatDetail === 'mark_range' && divisionsAgreeOn('mark_range'))
                      ? 'success'
                      : 'warning'
                  }
                  sx={{ mb: 2 }}
                >
                  {gradeStatDetail === 'total_grades' &&
                    (divisionsAgreeOn('grades')
                      ? `All ${byDivision.length} divisions use the same grading scale.`
                      : 'Divisions use different grading scales — check each row below.')}
                  {gradeStatDetail === 'pass_mark' &&
                    (divisionsAgreeOn('pass_mark')
                      ? `All ${byDivision.length} divisions share the same pass mark.`
                      : 'Divisions have different pass marks — check each row below.')}
                  {gradeStatDetail === 'mark_range' &&
                    (divisionsAgreeOn('mark_range')
                      ? `All ${byDivision.length} divisions use the same mark range.`
                      : 'Divisions use different mark ranges — check each row below.')}
                </Alert>
              )}
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Division</TableCell>
                      {gradeStatDetail === 'total_grades' && (
                        <TableCell sx={{ fontWeight: 700 }}>Grades</TableCell>
                      )}
                      {gradeStatDetail === 'pass_mark' && (
                        <TableCell align="right" sx={{ fontWeight: 700 }}>
                          Pass Mark
                        </TableCell>
                      )}
                      {gradeStatDetail === 'mark_range' && (
                        <TableCell align="right" sx={{ fontWeight: 700 }}>
                          Mark Range
                        </TableCell>
                      )}
                      <TableCell align="center" sx={{ fontWeight: 700 }}>
                        Mark Config
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(gradeStats.by_division || []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3}>
                          <Typography variant="body2" color="text.secondary">
                            No active school divisions found.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      gradeStats.by_division.map((row) => (
                        <TableRow key={row.division_id}>
                          <TableCell>{row.division}</TableCell>
                          {gradeStatDetail === 'total_grades' && (
                            <TableCell>
                              {row.grades && row.grades.length > 0 ? row.grades.join(', ') : '—'}
                            </TableCell>
                          )}
                          {gradeStatDetail === 'pass_mark' && (
                            <TableCell align="right">{row.pass_mark}</TableCell>
                          )}
                          {gradeStatDetail === 'mark_range' && (
                            <TableCell align="right">{row.mark_range}</TableCell>
                          )}
                          <TableCell align="center">
                            {row.has_mark_config ? (
                              <Chip
                                label="Configured"
                                size="small"
                                color="success"
                                variant="outlined"
                              />
                            ) : (
                              <Chip
                                label="Missing"
                                size="small"
                                color="warning"
                                variant="outlined"
                              />
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setGradeStatDetail(null);
              setExpandedProgramme(null);
              setExpandedClass(null);
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
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
    </Box>
  );
};

export default ResultSetupTab;
