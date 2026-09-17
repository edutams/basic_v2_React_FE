import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Button, TextField, Grid, Tabs, Tab, IconButton, Tooltip, Snackbar, Alert,
  Switch, FormControl, InputLabel, Select, MenuItem, Dialog, DialogTitle, DialogContent,
  DialogActions, Menu, useTheme, Stack,
} from '@mui/material';
import {
  IconSettings, IconTemplate, IconMoodSmile, IconMessageCircle, IconAward,
  IconPlus, IconEdit, IconTrash, IconCheck, IconX,
  IconBook, IconHash, IconSchool, IconFile, IconUsers, IconList, IconStack,
  IconSignature, IconEye,
} from '@tabler/icons-react';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import SetupAffectivePsychomotorTab from '@/pages/tenant/attendance/components/SetupAffectivePsychomotorTab';
import SessionTermSelector from './SessionTermSelector';
import GradeConfiguration from './GradeConfiguration';
import PromotionSettings from './PromotionSettings';
import { useResultTemplate } from '@/context/ResultTemplateContext';
import StatCard from '@/components/shared/StatCard';
import resultSetupApi from '@/api/tenant/result-setup/resultSetupApi';

const dummyProgrammes = [
  { id: 1, name: 'Junior Secondary' }, { id: 2, name: 'Senior Secondary' },
];

const mockTemplateStats = {
  templates: 13,
  active: 1,
  programmes: 2,
  caReports: 'Enabled',
};

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
  const { activeTemplate, selectTemplate, enableCAReport, setEnableCAReport, templateSamples } = useResultTemplate();

  const [innerTab, setInnerTab] = useState(0);
  const [currentSessionTermId, setCurrentSessionTermId] = useState(null);
  const [gradeStats, setGradeStats] = useState({ total_grades: 0, pass_mark: '—', subjects: 0, mark_range: '—' });
  const [gradeStatsLoading, setGradeStatsLoading] = useState(false);
  const [promotionStats, setPromotionStats] = useState({ total_rules: 0, programmes: 0, subject_types: 0, total_subjects: 0, pass_mark: '—' });
  const [promotionStatsLoading, setPromotionStatsLoading] = useState(false);
  const [templateDivFilter, setTemplateDivFilter] = useState(dummyProgrammes[0].name);
  const [nomenclature, setNomenclature] = useState([]);
  const [nomenclatureLoading, setNomenclatureLoading] = useState(false);

  const [nomenclatureDialog, setNomenclatureDialog] = useState({ open: false, editing: null });
  const [nomenclatureForm, setNomenclatureForm] = useState({ position_name: '', status: 'active' });
  const [nomMenuAnchor, setNomMenuAnchor] = useState(null);
  const [nomMenuRow, setNomMenuRow] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [imagePreview, setImagePreview] = useState({ open: false, src: '' });
  const [signatureDialog, setSignatureDialog] = useState({ open: false, id: null, positionName: '' });
  const [signaturePreview, setSignaturePreview] = useState({ open: false, src: '' });
  const [signatureFile, setSignatureFile] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null, action: '', label: '' });

  const showSnackbar = (message, severity = 'success') => setSnackbar({ open: true, message, severity });

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

  useEffect(() => {
    fetchNomenclatures();
  }, [fetchNomenclatures]);

  // ── Fetch grade config stats when session term changes ──────
  useEffect(() => {
    if (!currentSessionTermId) {
      setGradeStats({ total_grades: 0, pass_mark: '—', subjects: 0, mark_range: '—' });
      return;
    }

    let cancelled = false;
    const loadStats = async () => {
      setGradeStatsLoading(true);
      try {
        const res = await resultSetupApi.getGradeConfigStats(currentSessionTermId);
        if (!cancelled && res.data.status) {
          setGradeStats(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch grade stats:', err);
      } finally {
        if (!cancelled) setGradeStatsLoading(false);
      }
    };
    loadStats();
    return () => { cancelled = true; };
  }, [currentSessionTermId]);

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

  useEffect(() => {
    fetchPromotionStats();
  }, [fetchPromotionStats]);

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

  const handleTemplateSelect = (sample) => {
    selectTemplate(sample);
    showSnackbar(`Template "${sample}" selected`);
  };

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 2 }}>
        Configure result grades, marks, templates, affective &amp; psychomotor domains, comment nomenclature, and promotion settings.
      </Alert>

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
            subtitle="Distinct grade letters configured"
            icon={IconAward}
            colorIndex={0}
            loading={gradeStatsLoading}
          />
          <StatCard
            count={gradeStats.pass_mark}
            label="Pass Mark"
            subtitle="Minimum passing grade"
            icon={IconCheck}
            colorIndex={1}
            loading={gradeStatsLoading}
          />
          <StatCard
            count={gradeStats.subjects}
            label="Subjects"
            subtitle="Available for results"
            icon={IconBook}
            colorIndex={2}
            loading={gradeStatsLoading}
          />
          <StatCard
            count={gradeStats.mark_range}
            label="Mark Range"
            subtitle="Min - Max scores"
            icon={IconHash}
            colorIndex={3}
            loading={gradeStatsLoading}
          />
        </Stack>
        <Paper elevation={0} sx={{ p: 3, borderRadius: '14px', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB' }}>
          <SessionTermSelector onSessionTermChange={setCurrentSessionTermId} />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<IconSettings size={16} />}
              disabled={!currentSessionTermId}
              onClick={async () => {
                try {
                  const res = await resultSetupApi.syncConfig();
                  if (res.data.status) {
                    showSnackbar(res.data.message);
                  }
                } catch (err) {
                  showSnackbar('Failed to sync config', 'error');
                }
              }}
            >
              Sync previous Term Config to New Term
            </Button>
          </Box>
          <GradeConfiguration sessionTermId={currentSessionTermId} />
        </Paper>
      </InnerTabPanel>

      {/* ════════════════════════════════════════════════════════
          2. RESULT TEMPLATES
          ════════════════════════════════════════════════════════ */}
      <InnerTabPanel value={innerTab} index={1}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <StatCard
            count={mockTemplateStats.templates}
            label="Templates"
            subtitle="Available report card designs"
            icon={IconTemplate}
            colorIndex={0}
            loading={false}
          />
          <StatCard
            count={mockTemplateStats.active}
            label="Active Template"
            subtitle="Currently selected"
            icon={IconCheck}
            colorIndex={1}
            loading={false}
          />
          <StatCard
            count={mockTemplateStats.programmes}
            label="Programmes"
            subtitle="Junior & Senior Secondary"
            icon={IconSchool}
            colorIndex={2}
            loading={false}
          />
          <StatCard
            count={mockTemplateStats.caReports}
            label="CA Reports"
            subtitle="Reportsheet status"
            icon={IconFile}
            colorIndex={3}
            loading={false}
          />
        </Stack>
        <Paper elevation={0} sx={{ p: 3, borderRadius: '14px', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight={600}>Template Samples</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" fontWeight={600}>Enable C.A Reportsheet</Typography>
              <Switch
                checked={enableCAReport}
                onChange={(e) => { setEnableCAReport(e.target.checked); showSnackbar(`CA Reportsheet ${e.target.checked ? 'enabled' : 'disabled'}`); }}
                color="primary"
              />
            </Box>
          </Box>
          <Alert severity="info" sx={{ mb: 2 }}>
            The current template is the one with the green outline. To change, click on a template image or use the <strong>Select</strong> button.
          </Alert>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs
              value={templateDivFilter}
              onChange={(_, v) => setTemplateDivFilter(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '13px' } }}
            >
              {dummyProgrammes.map(p => (
                <Tab key={p.id} label={p.name} value={p.name} />
              ))}
            </Tabs>
          </Box>
          <Grid container spacing={2}>
            {templateSamples.map((t) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={t.id}>
                <Paper
                  elevation={0}
                  sx={{
                    border: '2px solid',
                    borderColor: activeTemplate === t.sample ? 'success.main' : isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                    '&:hover': { borderColor: 'primary.main', transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
                  }}
                >
                  <Box sx={{ position: 'relative' }}>
                    {activeTemplate === t.sample && (
                      <Box sx={{ position: 'absolute', top: 8, left: 8, zIndex: 1, bgcolor: 'success.main', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <IconCheck size={16} color="#fff" />
                      </Box>
                    )}
                    <Box
                      component="img"
                      src={t.image}
                      alt={t.sample}
                      sx={{ width: '100%', height: 200, objectFit: 'cover', display: 'block', cursor: 'zoom-in' }}
                      onClick={() => setImagePreview({ open: true, src: t.image })}
                    />
                  </Box>
                  <Box sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2" fontWeight={600}>{t.sample}</Typography>
                    {activeTemplate !== t.sample ? (
                      <Button size="small"  onClick={() => handleTemplateSelect(t.sample)}>Select</Button>
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
            count={nomenclature.filter(n => n.status === 'active').length}
            label="Active"
            subtitle="Currently in use"
            icon={IconCheck}
            colorIndex={1}
            loading={nomenclatureLoading}
          />
          <StatCard
            count={nomenclature.filter(n => n.status === 'inactive').length}
            label="Inactive"
            subtitle="Deactivated positions"
            icon={IconX}
            colorIndex={3}
            loading={nomenclatureLoading}
          />
        </Stack>
        <Paper elevation={0} sx={{ p: 3, borderRadius: '14px', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight={600}>Comment Nomenclature</Typography>
            <Button  size="small" startIcon={<IconPlus size={16} />} onClick={() => { setNomenclatureDialog({ open: true, editing: null }); setNomenclatureForm({ position_name: '', status: 'active' }); }}>
              Add Position Name
            </Button>
          </Box>
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table stickyHeader sx={{ '& .MuiTableCell-root': { py: 0.5, px: 1 }, whiteSpace: 'nowrap' }}>
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
                    <TableCell><Chip label={n.status} size="small" color={n.status === 'active' ? 'success' : 'default'} /></TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={(e) => { setNomMenuAnchor(e.currentTarget); setNomMenuRow(n); }}>
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                      <Menu anchorEl={nomMenuAnchor} open={Boolean(nomMenuAnchor) && nomMenuRow?.id === n.id} onClose={() => { setNomMenuAnchor(null); setNomMenuRow(null); }}>
                        <MenuItem onClick={() => {
                          setNomenclatureDialog({ open: true, editing: n });
                          setNomenclatureForm({ position_name: n.position_name, status: n.status });
                          setNomMenuAnchor(null);
                        }}>
                          <IconEdit size={18} style={{ marginRight: 8 }} /> Edit
                        </MenuItem>
                        <MenuItem onClick={() => {
                          setNomMenuAnchor(null);
                          const newStatus = n.status === 'active' ? 'inactive' : 'active';
                          setConfirmDialog({ open: true, id: n.id, action: newStatus, label: n.position_name });
                        }}>
                          {n.status === 'active' ? <><IconX size={18} style={{ marginRight: 8 }} /> Deactivate</> : <><IconCheck size={18} style={{ marginRight: 8 }} /> Activate</>}
                        </MenuItem>
                        <MenuItem onClick={() => { setNomMenuAnchor(null); setSignatureDialog({ open: true, id: n.id, positionName: n.position_name }); setSignatureFile(n.signature || null); }}>
                          <IconSignature size={18} style={{ marginRight: 8 }} /> Change Signature
                        </MenuItem>
                        <MenuItem onClick={() => { setNomMenuAnchor(null); setSignaturePreview({ open: true, src: n.signature || '' }); }}>
                          <IconEye size={18} style={{ marginRight: 8 }} /> Preview Signature
                        </MenuItem>
                        <MenuItem onClick={() => handleNomDelete(n.id)} sx={{ color: 'error.main' }}>
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
            subtitle="With promotion rules"
            icon={IconSchool}
            colorIndex={0}
            loading={promotionStatsLoading}
          />
          <StatCard
            count={promotionStats.pass_mark}
            label="Pass Mark"
            subtitle="Cumulative minimum"
            icon={IconCheck}
            colorIndex={1}
            loading={promotionStatsLoading}
          />
          <StatCard
            count={promotionStats.subject_types}
            label="Subject Types"
            subtitle="Compulsory / Elective / Trade"
            icon={IconSettings}
            colorIndex={2}
            loading={promotionStatsLoading}
          />
          <StatCard
            count={promotionStats.total_subjects}
            label="Total Subjects"
            subtitle="Assigned across all types"
            icon={IconAward}
            colorIndex={3}
            loading={promotionStatsLoading}
          />
        </Stack>
        <Paper elevation={0} sx={{ p: 2, borderRadius: '14px', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB' }}>
          <Typography variant="h6" fontWeight={600} mb={2}></Typography>
          <PromotionSettings onStatsRefresh={fetchPromotionStats} />
        </Paper>
      </InnerTabPanel>

      {/* ════════════════════════════════════════════════════════
          DIALOGS
          ════════════════════════════════════════════════════════ */}
      <Dialog open={nomenclatureDialog.open} onClose={() => setNomenclatureDialog({ open: false, editing: null })} maxWidth="sm" fullWidth>
        <DialogTitle>{nomenclatureDialog.editing ? 'Edit Position Name' : 'Add Position Name'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <TextField label="Position Name" fullWidth size="small" value={nomenclatureForm.position_name} onChange={e => setNomenclatureForm({ ...nomenclatureForm, position_name: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select value={nomenclatureForm.status} label="Status" onChange={e => setNomenclatureForm({ ...nomenclatureForm, status: e.target.value })}>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNomenclatureDialog({ open: false, editing: null })}>Cancel</Button>
          <Button size='small' onClick={handleNomSave}>Save</Button>
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
      <Dialog open={signatureDialog.open} onClose={() => setSignatureDialog({ open: false, id: null, positionName: '' })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Change Signature — {signatureDialog.positionName}</DialogTitle>
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
                <Box component="img" src={signatureFile} alt="Signature Preview" sx={{ maxWidth: '100%', maxHeight: 200, borderRadius: 1, border: '1px solid', borderColor: 'divider' }} />
              </Box>
            ) : (
              <Box sx={{ mb: 2, py: 4, border: '2px dashed', borderColor: 'divider', borderRadius: 1, bgcolor: 'grey.50' }}>
                <Typography variant="body2" color="text.secondary">No signature uploaded yet</Typography>
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
          <Button onClick={() => setSignatureDialog({ open: false, id: null, positionName: '' })}>Cancel</Button>
          <Button size='small' disabled={!signatureFile} onClick={async () => {
            try {
              const response = await resultSetupApi.saveCommentNomenclature({
                id: signatureDialog.id,
                position_name: signatureDialog.positionName,
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
          }}>
            Save Signature
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Preview Signature Dialog ──────────────────────────── */}
      <Dialog open={signaturePreview.open} onClose={() => setSignaturePreview({ open: false, src: '' })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Preview Signature</DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          <Box sx={{ textAlign: 'center', py: 4, bgcolor: '#fff' }}>
            {signaturePreview.src ? (
              <Box component="img" src={signaturePreview.src} alt="Signature" sx={{ maxWidth: '100%', maxHeight: 300 }} />
            ) : (
              <Box sx={{ py: 6 }}>
                <IconSignature size={64} color="#ccc" />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>No signature uploaded yet</Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSignaturePreview({ open: false, src: '' })}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* ── Confirm Status Toggle Dialog ──────────────────────── */}
      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, id: null, action: '', label: '' })} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {confirmDialog.action === 'active' ? 'Activate' : 'Deactivate'} Nomenclature
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to {confirmDialog.action === 'active' ? 'activate' : 'deactivate'} <strong>{confirmDialog.label}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, id: null, action: '', label: '' })}>Cancel</Button>
          <Button   onClick={() => handleNomToggleStatus(confirmDialog.id)}>
            {confirmDialog.action === 'active' ? 'Activate' : 'Deactivate'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={() => setSnackbar(s => ({ ...s, open: false }))} severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default ResultSetupTab;
