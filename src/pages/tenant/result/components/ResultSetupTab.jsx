import { useState } from 'react';
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
} from '@tabler/icons-react';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import SetupAffectivePsychomotorTab from '@/pages/tenant/attendance/components/SetupAffectivePsychomotorTab';
import SessionTermSelector from './SessionTermSelector';
import GradeConfiguration from './GradeConfiguration';
import PromotionSettings from './PromotionSettings';
import { useResultTemplate } from '@/context/ResultTemplateContext';
import StatCard from '@/components/shared/StatCard';

const dummySessionTerms = [
  { id: 1, label: '2025/2026 - First Term' },
  { id: 2, label: '2025/2026 - Second Term' },
];
const dummyProgrammes = [
  { id: 1, name: 'Junior Secondary' }, { id: 2, name: 'Senior Secondary' },
];

const initialNomenclature = [
  { id: 1, position_name: '1st', status: 'active' },
  { id: 2, position_name: '2nd', status: 'active' },
  { id: 3, position_name: '3rd', status: 'active' },
  { id: 4, position_name: '4th', status: 'active' },
  { id: 5, position_name: '5th', status: 'active' },
];

// Mock data for stat cards
const mockGradeStats = {
  totalGrades: 12,
  passMark: '40%',
  subjects: 18,
  markRange: '0 - 100',
};

const mockTemplateStats = {
  templates: 13,
  active: 1,
  programmes: 2,
  caReports: 'Enabled',
};

const mockNomenclatureStats = {
  total: 5,
  active: 4,
  inactive: 1,
  positionsUsed: 5,
};

const mockPromotionStats = {
  classes: 6,
  autoPromo: 'Enabled',
  criteria: 3,
  passMark: '40%',
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
  const [templateDivFilter, setTemplateDivFilter] = useState(1);
  const [nomenclature, setNomenclature] = useState(initialNomenclature);

  const [nomenclatureDialog, setNomenclatureDialog] = useState({ open: false, editing: null });
  const [nomenclatureForm, setNomenclatureForm] = useState({ position_name: '', status: 'active' });
  const [nomMenuAnchor, setNomMenuAnchor] = useState(null);
  const [nomMenuRow, setNomMenuRow] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [imagePreview, setImagePreview] = useState({ open: false, src: '' });

  const showSnackbar = (message, severity = 'success') => setSnackbar({ open: true, message, severity });

  const innerTabs = [
    { label: '1. Grade & Config. Settings', icon: <IconAward size={16} /> },
    { label: '2. Result Templates', icon: <IconTemplate size={16} /> },
    { label: '3. Affective & Psychomotor', icon: <IconMoodSmile size={16} /> },
    { label: '4. Comment Nomenclature', icon: <IconMessageCircle size={16} /> },
    { label: '5. Promotion Settings', icon: <IconSettings size={16} /> },
  ];

  const handleNomSave = () => {
    if (nomenclatureDialog.editing) {
      setNomenclature(nomenclature.map(n => n.id === nomenclatureDialog.editing.id ? { ...n, ...nomenclatureForm } : n));
      showSnackbar('Nomenclature updated');
    } else {
      setNomenclature([...nomenclature, { id: Date.now(), ...nomenclatureForm, status: 'active' }]);
      showSnackbar('Nomenclature added');
    }
    setNomenclatureDialog({ open: false, editing: null });
    setNomenclatureForm({ position_name: '', status: 'active' });
  };

  const handleNomDelete = (id) => {
    setNomenclature(nomenclature.filter(n => n.id !== id));
    showSnackbar('Nomenclature deleted');
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
            count={mockGradeStats.totalGrades}
            label="Total Grades"
            subtitle="A1, B2, B3, C4, C5, C6, D7, E8, F9"
            icon={IconAward}
            colorIndex={0}
            loading={false}
          />
          <StatCard
            count={mockGradeStats.passMark}
            label="Pass Mark"
            subtitle="Minimum passing grade"
            icon={IconCheck}
            colorIndex={1}
            loading={false}
          />
          <StatCard
            count={mockGradeStats.subjects}
            label="Subjects"
            subtitle="Configured for results"
            icon={IconBook}
            colorIndex={2}
            loading={false}
          />
          <StatCard
            count={mockGradeStats.markRange}
            label="Mark Range"
            subtitle="Min - Max marks"
            icon={IconHash}
            colorIndex={3}
            loading={false}
          />
        </Stack>
        <Paper elevation={0} sx={{ p: 3, borderRadius: '14px', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB' }}>
          <SessionTermSelector onSessionTermChange={setCurrentSessionTermId} />
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
          <FormControl size="small" sx={{ minWidth: 200, mb: 2 }}>
            <InputLabel>Programme</InputLabel>
            <Select value={templateDivFilter} label="Programme" onChange={e => setTemplateDivFilter(e.target.value)}>
              <MenuItem value="">All Programmes</MenuItem>
              {dummyProgrammes.map(p => <MenuItem key={p.id} value={p.name}>{p.name}</MenuItem>)}
            </Select>
          </FormControl>
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
                      <Button size="small" variant="contained" onClick={() => handleTemplateSelect(t.sample)}>Select</Button>
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
            count={mockNomenclatureStats.total}
            label="Total Positions"
            subtitle="Defined position names"
            icon={IconList}
            colorIndex={0}
            loading={false}
          />
          <StatCard
            count={mockNomenclatureStats.active}
            label="Active"
            subtitle="Currently in use"
            icon={IconCheck}
            colorIndex={1}
            loading={false}
          />
          <StatCard
            count={mockNomenclatureStats.inactive}
            label="Inactive"
            subtitle="Deactivated positions"
            icon={IconX}
            colorIndex={3}
            loading={false}
          />
          <StatCard
            count={mockNomenclatureStats.positionsUsed}
            label="Positions Used"
            subtitle="Mapped to students"
            icon={IconAward}
            colorIndex={2}
            loading={false}
          />
        </Stack>
        <Paper elevation={0} sx={{ p: 3, borderRadius: '14px', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight={600}>Comment Nomenclature</Typography>
            <Button variant="contained" size="small" startIcon={<IconPlus size={16} />} onClick={() => { setNomenclatureDialog({ open: true, editing: null }); setNomenclatureForm({ position_name: '', status: 'active' }); }}>
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
                          setNomenclature(nomenclature.map(nm => nm.id === n.id ? { ...nm, status: nm.status === 'active' ? 'inactive' : 'active' } : nm));
                          setNomMenuAnchor(null);
                          showSnackbar('Nomenclature status updated');
                        }}>
                          {n.status === 'active' ? <><IconX size={18} style={{ marginRight: 8 }} /> Deactivate</> : <><IconCheck size={18} style={{ marginRight: 8 }} /> Activate</>}
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
            count={mockPromotionStats.classes}
            label="Classes"
            subtitle="With promotion rules"
            icon={IconSchool}
            colorIndex={0}
            loading={false}
          />
          <StatCard
            count={mockPromotionStats.autoPromo}
            label="Auto-Promotion"
            subtitle="Status"
            icon={IconCheck}
            colorIndex={1}
            loading={false}
          />
          <StatCard
            count={mockPromotionStats.criteria}
            label="Criteria"
            subtitle="Promotion requirements"
            icon={IconSettings}
            colorIndex={2}
            loading={false}
          />
          <StatCard
            count={mockPromotionStats.passMark}
            label="Pass Mark"
            subtitle="Minimum for promotion"
            icon={IconAward}
            colorIndex={3}
            loading={false}
          />
        </Stack>
        <Paper elevation={0} sx={{ p: 2, borderRadius: '14px', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB' }}>
          <Typography variant="h6" fontWeight={600} mb={2}></Typography>
          <PromotionSettings />
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
          <Button variant="contained" onClick={handleNomSave}>Save</Button>
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

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={() => setSnackbar(s => ({ ...s, open: false }))} severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default ResultSetupTab;
