import { useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Grid,
  Tabs, Tab, IconButton, Tooltip, Snackbar, Alert, Menu, MenuItem, Switch,
  FormControl, InputLabel, Select, ListItemIcon, ListItemText, Divider, useTheme,
} from '@mui/material';
import {
  IconSettings, IconTemplate, IconAdjustments, IconMoodSmile, IconMessageCircle, IconAward,
  IconPlus, IconEdit, IconTrash, IconCheck, IconX, IconCalendar, IconDotsVertical,
} from '@tabler/icons-react';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import SetupAffectivePsychomotorTab from '@/pages/tenant/attendance/components/SetupAffectivePsychomotorTab';

// ── Dummy Data ──────────────────────────────────────────────────
const gradeOptions = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'E', 'F'];

const initialGrades = [
  { id: 1, min_score: 0, max_score: 20, grade: 'F', remark: 'Fail', point: 0, status: 'active' },
  { id: 2, min_score: 21, max_score: 30, grade: 'E', remark: 'Poor', point: 1, status: 'active' },
  { id: 3, min_score: 31, max_score: 40, grade: 'D', remark: 'Fair', point: 2, status: 'active' },
  { id: 4, min_score: 41, max_score: 50, grade: 'C', remark: 'Average', point: 3, status: 'active' },
  { id: 5, min_score: 51, max_score: 60, grade: 'C+', remark: 'Above Average', point: 4, status: 'active' },
  { id: 6, min_score: 61, max_score: 70, grade: 'B', remark: 'Good', point: 5, status: 'active' },
  { id: 7, min_score: 71, max_score: 80, grade: 'B+', remark: 'Very Good', point: 6, status: 'active' },
  { id: 8, min_score: 81, max_score: 90, grade: 'A', remark: 'Excellent', point: 7, status: 'active' },
  { id: 9, min_score: 91, max_score: 100, grade: 'A+', remark: 'Outstanding', point: 8, status: 'active' },
];

const dummySessionTerms = [
  { id: 1, label: '2025/2026 - First Term' },
  { id: 2, label: '2025/2026 - Second Term' },
];
const dummyProgrammes = [
  { id: 1, name: 'Junior Secondary' }, { id: 2, name: 'Senior Secondary' },
];

const initialMarksConfig = [
  { id: 1, programme: 'Junior Secondary', exam_max_score: 60, ca_max_score: 40, no_of_ca: 2, max_point: 8, use_decimal: 'no', student_position_method: 'arm', result_upload_choice: 'per_subject' },
  { id: 2, programme: 'Senior Secondary', exam_max_score: 60, ca_max_score: 40, no_of_ca: 2, max_point: 8, use_decimal: 'no', student_position_method: 'arm', result_upload_choice: 'per_subject' },
];

const templateSamples = [
  { id: 1, sample: 'Sample 1', image: 'https://i.ibb.co/Pt1LngW/Template01-Screenshot.png' },
  { id: 2, sample: 'Sample 2', image: 'https://i.ibb.co/sJFDMCj/Template02-Screenshot.png' },
  { id: 3, sample: 'Sample 3', image: 'https://i.ibb.co/G01BBMM/Template03-Screenshot.png' },
  { id: 4, sample: 'Sample 4', image: 'https://i.ibb.co/tbDkbP8/Template04-Screenshot.png' },
  { id: 5, sample: 'Sample 5', image: 'https://i.ibb.co/pPv4w6N/Template05-Screenshot.png' },
  { id: 6, sample: 'Sample 6', image: 'https://i.ibb.co/w00w4kt/Template06-Screenshot.png' },
  { id: 7, sample: 'Sample 7', image: 'https://i.ibb.co/88vdsKW/Template07-Screenshot.png' },
  { id: 8, sample: 'Sample 8', image: 'https://i.ibb.co/WnYdb83/Template08-Screenshot.png' },
  { id: 9, sample: 'Sample 9', image: 'https://i.ibb.co/6bdvW2m/Template09-Screenshot.png' },
  { id: 10, sample: 'Sample 10', image: 'https://i.ibb.co/LvHLWyW/Template10-Screenshot.png' },
  { id: 11, sample: 'Sample 11', image: 'https://i.ibb.co/KrpPzsL/Template11-Screenshot.png' },
  { id: 12, sample: 'Sample 12', image: 'https://i.ibb.co/1mPDkpB/Template12-Screenshot.png' },
  { id: 13, sample: 'Sample 13', image: 'https://i.ibb.co/JmkK00t/Template13-Screenshot.png' },
];

const initialNomenclature = [
  { id: 1, position_name: '1st', status: 'active' },
  { id: 2, position_name: '2nd', status: 'active' },
  { id: 3, position_name: '3rd', status: 'active' },
  { id: 4, position_name: '4th', status: 'active' },
  { id: 5, position_name: '5th', status: 'active' },
];

const dummyPromotions = [
  { id: 1, from_class: 'JSS 1', to_class: 'JSS 2', criteria: 'Average score >= 40%', status: 'active' },
  { id: 2, from_class: 'JSS 2', to_class: 'JSS 3', criteria: 'Average score >= 40%', status: 'active' },
  { id: 3, from_class: 'JSS 3', to_class: 'SS 1', criteria: 'Average score >= 45%', status: 'active' },
  { id: 4, from_class: 'SS 1', to_class: 'SS 2', criteria: 'Average score >= 45%', status: 'active' },
  { id: 5, from_class: 'SS 2', to_class: 'SS 3', criteria: 'Average score >= 50%', status: 'active' },
];

// ── Inner TabPanel ──────────────────────────────────────────────
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

  const [innerTab, setInnerTab] = useState(0);
  const [grades, setGrades] = useState(initialGrades);
  const [marksConfig, setMarksConfig] = useState(initialMarksConfig);
  const [activeTemplate, setActiveTemplate] = useState('Sample 1');
  const [enableCAReport, setEnableCAReport] = useState(false);
  const [templateDivFilter, setTemplateDivFilter] = useState('');
  const [nomenclature, setNomenclature] = useState(initialNomenclature);
  const [promotions, setPromotions] = useState(dummyPromotions);

  // Marks config detail view
  const [marksDetailRow, setMarksDetailRow] = useState(null);
  const [marksMenuAnchor, setMarksMenuAnchor] = useState(null);
  const [marksMenuRow, setMarksMenuRow] = useState(null);
  const [termPercentage, setTermPercentage] = useState({ first_term: '', second_term: '', third_term: '' });
  const [caItems, setCaItems] = useState([]);
  const [marksErrors, setMarksErrors] = useState({ total: '', ca: '', entity: '', term: '' });

  // Promotion menu state
  const [promoMenuAnchor, setPromoMenuAnchor] = useState(null);
  const [promoMenuRow, setPromoMenuRow] = useState(null);

  // Grade filters
  const [gradeFilter, setGradeFilter] = useState({ session_term: '', programme: '' });

  // Dialog states
  const [gradeDialog, setGradeDialog] = useState({ open: false, editing: null });
  const [gradeForm, setGradeForm] = useState({ session_term: '', programme: '', min_score: '', max_score: '', grade: '', remark: '', point: '' });
  const [resumptionDialog, setResumptionDialog] = useState(false);
  const [resumptionForm, setResumptionForm] = useState({ closing_date: '', resumption_date: '', boarding_resumption_date: '' });
  const [nomenclatureDialog, setNomenclatureDialog] = useState({ open: false, editing: null });
  const [nomenclatureForm, setNomenclatureForm] = useState({ position_name: '', status: 'active' });

  // Nomenclature menu state
  const [nomMenuAnchor, setNomMenuAnchor] = useState(null);
  const [nomMenuRow, setNomMenuRow] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Action menu state
  const [gradeMenuAnchor, setGradeMenuAnchor] = useState(null);
  const [gradeMenuRow, setGradeMenuRow] = useState(null);

  // Add button dropdown
  const [addMenuAnchor, setAddMenuAnchor] = useState(null);

  const showSnackbar = (message, severity = 'success') => setSnackbar({ open: true, message, severity });

  const innerTabs = [
    { label: '1. Grade Settings', icon: <IconAward size={16} /> },
    { label: '2. Result Templates', icon: <IconTemplate size={16} /> },
    { label: '3. Marks Configuration', icon: <IconAdjustments size={16} /> },
    { label: '4. Affective & Psychomotor', icon: <IconMoodSmile size={16} /> },
    { label: '5. Comment Nomenclature', icon: <IconMessageCircle size={16} /> },
    { label: '6. Promotion Settings', icon: <IconSettings size={16} /> },
  ];

  // ── Grade CRUD ─────────────────────────────────────────────
  const handleGradeSave = () => {
    if (gradeDialog.editing) {
      setGrades(grades.map(g => g.id === gradeDialog.editing.id ? { ...g, ...gradeForm, min_score: Number(gradeForm.min_score), max_score: Number(gradeForm.max_score), point: Number(gradeForm.point) } : g));
      showSnackbar('Grade updated successfully');
    } else {
      const newGrade = { id: Date.now(), ...gradeForm, min_score: Number(gradeForm.min_score), max_score: Number(gradeForm.max_score), point: Number(gradeForm.point), status: 'active' };
      setGrades([...grades, newGrade]);
      showSnackbar('Grade created successfully');
    }
    setGradeDialog({ open: false, editing: null });
    setGradeForm({ session_term: '', programme: '', min_score: '', max_score: '', grade: '', remark: '', point: '' });
  };

  const handleGradeDelete = (id) => {
    setGrades(grades.filter(g => g.id !== id));
    showSnackbar('Grade deleted');
    setGradeMenuAnchor(null);
  };

  const handleGradeStatusToggle = (id) => {
    setGrades(grades.map(g => g.id === id ? { ...g, status: g.status === 'active' ? 'inactive' : 'active' } : g));
    showSnackbar('Grade status updated');
    setGradeMenuAnchor(null);
  };

  const handleResumptionSave = () => {
    setResumptionDialog(false);
    showSnackbar('Resumption dates saved successfully');
  };

  // ── Nomenclature CRUD ──────────────────────────────────────
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

  // ── Template ───────────────────────────────────────────────
  const handleTemplateSelect = (sample) => {
    setActiveTemplate(sample);
    showSnackbar(`Template "${sample}" selected`);
  };

  // ── Marks Config Helpers ────────────────────────────────────
  const openMarksDetail = (row) => {
    setMarksDetailRow({ ...row });
    const numCA = row.no_of_ca || 2;
    const items = [];
    for (let i = 0; i < numCA; i++) {
      items.push({ display_name: `CA${i + 1}`, max_score: Math.round(row.ca_max_score / numCA), entities: [{ display_name: `CA${i + 1}`, max_score: Math.round(row.ca_max_score / numCA) }] });
    }
    setCaItems(items);
    setTermPercentage({ first_term: '', second_term: '', third_term: '' });
    setMarksErrors({ total: '', ca: '', entity: '', term: '' });
  };

  const addCAMore = () => {
    const newRow = { ...marksDetailRow, no_of_ca: marksDetailRow.no_of_ca + 1 };
    setMarksDetailRow(newRow);
    setCaItems([...caItems, { display_name: `CA${newRow.no_of_ca}`, max_score: 0, entities: [{ display_name: `CA${newRow.no_of_ca}`, max_score: 0 }] }]);
  };

  const addEntity = (caIndex) => {
    const updated = [...caItems];
    updated[caIndex].entities = [...updated[caIndex].entities, { display_name: '', max_score: 0 }];
    setCaItems(updated);
  };

  const updateCAItem = (caIndex, field, value) => {
    const updated = [...caItems];
    updated[caIndex] = { ...updated[caIndex], [field]: value };
    setCaItems(updated);
  };

  const updateEntity = (caIndex, entIndex, field, value) => {
    const updated = [...caItems];
    updated[caIndex].entities = [...updated[caIndex].entities];
    updated[caIndex].entities[entIndex] = { ...updated[caIndex].entities[entIndex], [field]: value };
    setCaItems(updated);
  };

  const checkTotalScore = (exam, ca) => {
    const calc = Number(exam) + Number(ca);
    if (calc < 100) return 'The overall score can not be less than 100';
    if (calc > 100) return 'The overall score can not be greater than 100';
    return '';
  };

  const checkCATotal = (caItemsArr, caMax) => {
    const tot = caItemsArr.reduce((sum, c) => sum + Number(c.max_score), 0);
    if (tot < Number(caMax)) return 'The sum of all C.As can not be less than the overall C.A score';
    if (tot > Number(caMax)) return 'The sum of all C.As can not be greater than the overall C.A score';
    return '';
  };

  const checkEntityTotal = (entities, caMaxScore) => {
    const tot = entities.reduce((sum, e) => sum + Number(e.max_score), 0);
    if (tot < Number(caMaxScore)) return 'The sum of all breakdown can not be less than the total C.A score';
    if (tot > Number(caMaxScore)) return 'The sum of all breakdown can not be greater than the total C.A score';
    return '';
  };

  const checkTermPerc = (tp) => {
    const total = Number(tp.first_term || 0) + Number(tp.second_term || 0) + Number(tp.third_term || 0);
    if (total > 100) return 'Term Percentage total should not be greater than 100%';
    return '';
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
          1. GRADE SETTINGS
          ════════════════════════════════════════════════════════ */}
      <InnerTabPanel value={innerTab} index={0}>
        <Paper elevation={0} sx={{ p: 3, borderRadius: '14px', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB' }}>
          {/* ── Filters Row ──────────────────────────────────── */}
          <Grid container spacing={2} sx={{ mb: 2 }} alignItems="center">
            <Grid size={{ xs: 12, sm: 5 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Session/Term</InputLabel>
                <Select value={gradeFilter.session_term} label="Session/Term" onChange={e => setGradeFilter({ ...gradeFilter, session_term: e.target.value })}>
                  <MenuItem value="">All</MenuItem>
                  {dummySessionTerms.map(s => <MenuItem key={s.id} value={s.id}>{s.label}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 5 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Programme</InputLabel>
                <Select value={gradeFilter.programme} label="Programme" onChange={e => setGradeFilter({ ...gradeFilter, programme: e.target.value })}>
                  <MenuItem value="">All</MenuItem>
                  {dummyProgrammes.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }}>
              {/* ── Dropdown Add Button ──────────────────────── */}
              <Button
                variant="contained"
                size="small"
                fullWidth
                endIcon={<IconX size={14} />}
                onClick={(e) => setAddMenuAnchor(e.currentTarget)}
                sx={{ height: 40 }}
              >
                <IconPlus size={16} style={{ marginRight: 4 }} /> Add
              </Button>
              <Menu anchorEl={addMenuAnchor} open={Boolean(addMenuAnchor)} onClose={() => setAddMenuAnchor(null)}>
                <MenuItem onClick={() => { setAddMenuAnchor(null); setGradeDialog({ open: true, editing: null }); setGradeForm({ session_term: '', programme: '', min_score: '', max_score: '', grade: '', remark: '', point: '' }); }}>
                  <ListItemIcon><IconAward size={18} /></ListItemIcon>
                  <ListItemText>Set New Grade</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => { setAddMenuAnchor(null); setResumptionDialog(true); }}>
                  <ListItemIcon><IconCalendar size={18} /></ListItemIcon>
                  <ListItemText>Set Resumption</ListItemText>
                </MenuItem>
              </Menu>
            </Grid>
          </Grid>

          {/* ── Grades Table ─────────────────────────────────── */}
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table stickyHeader sx={{ '& .MuiTableCell-root': { py: 0.5, px: 1 }, whiteSpace: 'nowrap' }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Max Score</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Min Score</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Grade</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Remark</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Point</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {grades.map((g, i) => (
                  <TableRow key={g.id} hover>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>{g.max_score}</TableCell>
                    <TableCell>{g.min_score}</TableCell>
                    <TableCell><Chip label={g.grade} size="small" color="primary" /></TableCell>
                    <TableCell>{g.remark}</TableCell>
                    <TableCell>{g.point}</TableCell>
                    <TableCell><Chip label={g.status} size="small" color={g.status === 'active' ? 'success' : 'default'} /></TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={(e) => { setGradeMenuAnchor(e.currentTarget); setGradeMenuRow(g); }}>
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                      <Menu anchorEl={gradeMenuAnchor} open={Boolean(gradeMenuAnchor) && gradeMenuRow?.id === g.id} onClose={() => { setGradeMenuAnchor(null); setGradeMenuRow(null); }}>
                        <MenuItem onClick={() => {
                          setGradeDialog({ open: true, editing: g });
                          setGradeForm({ session_term: g.session_term || '', programme: g.programme || '', min_score: g.min_score, max_score: g.max_score, grade: g.grade, remark: g.remark, point: g.point });
                          setGradeMenuAnchor(null);
                        }}>
                          <IconEdit size={18} style={{ marginRight: 8 }} /> Edit
                        </MenuItem>
                        <MenuItem onClick={() => handleGradeStatusToggle(g.id)}>
                          {g.status === 'active' ? <><IconX size={18} style={{ marginRight: 8 }} /> Deactivate</> : <><IconCheck size={18} style={{ marginRight: 8 }} /> Activate</>}
                        </MenuItem>
                        <MenuItem onClick={() => handleGradeDelete(g.id)} sx={{ color: 'error.main' }}>
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
          2. RESULT TEMPLATES
          ════════════════════════════════════════════════════════ */}
      <InnerTabPanel value={innerTab} index={1}>
        <Paper elevation={0} sx={{ p: 3, borderRadius: '14px', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB' }}>
          {/* ── Top Row: Enable CA Report ────────────────────── */}
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

          {/* ── Programme Filter ─────────────────────────────── */}
          <FormControl size="small" sx={{ minWidth: 200, mb: 2 }}>
            <InputLabel>Programme</InputLabel>
            <Select value={templateDivFilter} label="Programme" onChange={e => setTemplateDivFilter(e.target.value)}>
              <MenuItem value="">All Programmes</MenuItem>
              {dummyProgrammes.map(p => <MenuItem key={p.id} value={p.name}>{p.name}</MenuItem>)}
            </Select>
          </FormControl>

          {/* ── Template Grid ────────────────────────────────── */}
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
                      sx={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }}
                      onClick={() => handleTemplateSelect(t.sample)}
                    />
                  </Box>
                  <Box sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2" fontWeight={600}>{t.sample}</Typography>
                    {activeTemplate !== t.sample && (
                      <Button size="small" variant="contained" onClick={() => handleTemplateSelect(t.sample)}>
                        Select
                      </Button>
                    )}
                    {activeTemplate === t.sample && (
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
          3. MARKS CONFIGURATION
          ════════════════════════════════════════════════════════ */}
      <InnerTabPanel value={innerTab} index={2}>
        {marksDetailRow ? (
          /* ── Marks Config Detail View (matching ConfigureMark.vue) ── */
          <Paper elevation={0} sx={{ p: 3, borderRadius: '14px', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB' }}>
            {/* ── Header Bar ─────────────────────────────────── */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, pb: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconAdjustments size={22} color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  Marks Configuration For {marksDetailRow.programme} Programme
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="outlined" color="warning" size="small" onClick={() => {
                  setMarksDetailRow({ ...marksDetailRow, exam_max_score: 70, ca_max_score: 30, no_of_ca: 1, max_point: 5, use_decimal: 'no', student_position_method: 'arm', result_upload_choice: 'per_subject' });
                  setCaItems([{ display_name: 'CA1', max_score: 30, entities: [{ display_name: 'CA1', max_score: 30 }] }]);
                  setTermPercentage({ first_term: '', second_term: '', third_term: '' });
                  setMarksErrors({ total: '', ca: '', entity: '', term: '' });
                }}>Reset</Button>
                <Button variant="outlined" size="small" onClick={() => setMarksDetailRow(null)}>Return To Settings</Button>
              </Box>
            </Box>

            {/* ── Exam/C.A Ratio Card ────────────────────────── */}
            <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB', borderRadius: '12px' }}>
              <Typography fontWeight={700} sx={{ mb: 2 }}>
                EXAM/C.A RATIO <Typography component="span" variant="body2" fontStyle="italic" color="text.secondary">(Enter the maximum obtainable score for C.A and Exam)</Typography>
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Exam (Max. Obtainable Score)"
                    fullWidth size="small" type="number" placeholder="70"
                    value={marksDetailRow.exam_max_score}
                    onChange={e => {
                      const val = Number(e.target.value);
                      const updated = { ...marksDetailRow, exam_max_score: val };
                      setMarksDetailRow(updated);
                      setMarksErrors({ ...marksErrors, total: checkTotalScore(val, updated.ca_max_score) });
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="C.A (Max. Obtainable Score)"
                    fullWidth size="small" type="number" placeholder="30"
                    value={marksDetailRow.ca_max_score}
                    onChange={e => {
                      const val = Number(e.target.value);
                      const updated = { ...marksDetailRow, ca_max_score: val };
                      setMarksDetailRow(updated);
                      setMarksErrors({ ...marksErrors, total: checkTotalScore(updated.exam_max_score, val), ca: checkCATotal(caItems, val) });
                    }}
                  />
                  {marksErrors.total && <Typography variant="caption" color="error">{marksErrors.total}</Typography>}
                </Grid>

                {/* ── CGPA Info + Max Point + Position By ──────── */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Alert severity="info" sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
                    You need to Specify the maximum obtainable Point if you want to implement <strong>&nbsp;CGPA</strong> system.
                  </Alert>
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField
                    label="Maximum Obtainable Point"
                    fullWidth size="small" type="number"
                    value={marksDetailRow.max_point}
                    onChange={e => setMarksDetailRow({ ...marksDetailRow, max_point: Number(e.target.value) })}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Student Position By</InputLabel>
                    <Select value={marksDetailRow.student_position_method} label="Student Position By"
                      onChange={e => setMarksDetailRow({ ...marksDetailRow, student_position_method: e.target.value })}>
                      <MenuItem value="arm">Class Arm</MenuItem>
                      <MenuItem value="class">Class</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* ── Term Percentage ──────────────────────────── */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Alert severity="info" sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
                    Specify the percentage of each term you want to use for the computation of third term result <strong>(starting from 1st term to 2nd term and finally 3rd term)</strong>
                  </Alert>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="1st Term %" fullWidth size="small" type="number" sx={{ mb: 1 }}
                    value={termPercentage.first_term}
                    onChange={e => {
                      const updated = { ...termPercentage, first_term: e.target.value };
                      setTermPercentage(updated);
                      setMarksErrors({ ...marksErrors, term: checkTermPerc(updated) });
                    }} />
                  <TextField label="2nd Term %" fullWidth size="small" type="number" sx={{ mb: 1 }}
                    value={termPercentage.second_term}
                    onChange={e => {
                      const updated = { ...termPercentage, second_term: e.target.value };
                      setTermPercentage(updated);
                      setMarksErrors({ ...marksErrors, term: checkTermPerc(updated) });
                    }} />
                  <TextField label="3rd Term %" fullWidth size="small" type="number"
                    value={termPercentage.third_term}
                    onChange={e => {
                      const updated = { ...termPercentage, third_term: e.target.value };
                      setTermPercentage(updated);
                      setMarksErrors({ ...marksErrors, term: checkTermPerc(updated) });
                    }} />
                  {marksErrors.term && <Typography variant="caption" color="error">{marksErrors.term}</Typography>}
                </Grid>

                {/* ── Use Decimals + Result Upload ─────────────── */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Alert severity="info" sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
                    Specify if you want to use <strong>decimal or whole numbers</strong> in result computation
                  </Alert>
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Use Decimals</InputLabel>
                    <Select value={marksDetailRow.use_decimal} label="Use Decimals"
                      onChange={e => setMarksDetailRow({ ...marksDetailRow, use_decimal: e.target.value })}>
                      <MenuItem value="yes">Yes</MenuItem>
                      <MenuItem value="no">No</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Result Upload</InputLabel>
                    <Select value={marksDetailRow.result_upload_choice} label="Result Upload"
                      onChange={e => setMarksDetailRow({ ...marksDetailRow, result_upload_choice: e.target.value })}>
                      <MenuItem value="per_subject">Per Subject</MenuItem>
                      <MenuItem value="combined_subject">Combined Subject</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* ── Number of CAs ────────────────────────────── */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Alert severity="info" sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
                    To add more C.As, click on the appended <strong>&nbsp;Add More&nbsp;</strong> button beside the input field.
                  </Alert>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TextField label="Number of C.As" fullWidth size="small" type="number" disabled
                      value={marksDetailRow.no_of_ca} />
                    <Button variant="contained" size="small" onClick={addCAMore} sx={{ whiteSpace: 'nowrap', minWidth: 100, height: 40 }}>Add More</Button>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* ── Dynamic CA Cards ───────────────────────────── */}
            {caItems.map((ca, caIndex) => (
              <Paper key={caIndex} elevation={0} sx={{ p: 3, mb: 2, border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB', borderRadius: '12px' }}>
                <Typography variant="subtitle1" fontWeight={700} mb={2}>C.A {caIndex + 1}</Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField label="Display Name" fullWidth size="small" placeholder="Enter Display Name"
                      value={ca.display_name}
                      onChange={e => updateCAItem(caIndex, 'display_name', e.target.value)} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField label="Max. Score" fullWidth size="small" type="number" placeholder="Enter Maximum Obtainable Score"
                      value={ca.max_score}
                      onChange={e => {
                        updateCAItem(caIndex, 'max_score', Number(e.target.value));
                        setMarksErrors({ ...marksErrors, ca: checkCATotal(caItems.map((c, i) => i === caIndex ? { ...c, max_score: Number(e.target.value) } : c), marksDetailRow.ca_max_score) });
                      }} />
                    {marksErrors.ca && <Typography variant="caption" color="error">{marksErrors.ca}</Typography>}
                  </Grid>

                  {/* ── Breakdown ──────────────────────────────── */}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TextField label="Breakdown" fullWidth size="small" disabled value={`${ca.entities.length} item(s)`} />
                      <Button variant="contained" size="small" onClick={() => addEntity(caIndex)} sx={{ whiteSpace: 'nowrap', minWidth: 100, height: 40 }}>Add More</Button>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    {ca.entities.map((ent, entIndex) => (
                      <Grid container spacing={2} key={entIndex} sx={{ mb: 1 }}>
                        <Grid size={{ xs: 12, sm: 5 }}>
                          <TextField label="Display Name" fullWidth size="small" placeholder="Enter Display Name"
                            value={ent.display_name}
                            onChange={e => updateEntity(caIndex, entIndex, 'display_name', e.target.value)} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 5 }}>
                          <TextField label="Max. Score" fullWidth size="small" type="number" placeholder="Enter Max. Score"
                            value={ent.max_score}
                            onChange={e => {
                              updateEntity(caIndex, entIndex, 'max_score', Number(e.target.value));
                              const updatedEntities = ca.entities.map((en, ei) => ei === entIndex ? { ...en, max_score: Number(e.target.value) } : en);
                              setMarksErrors({ ...marksErrors, entity: checkEntityTotal(updatedEntities, ca.max_score) });
                            }} />
                          {marksErrors.entity && <Typography variant="caption" color="error">{marksErrors.entity}</Typography>}
                        </Grid>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              </Paper>
            ))}

            {/* ── Submit Button ─────────────────────────────── */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Button variant="contained" size="large" sx={{ width: 220, height: 50 }}
                onClick={() => {
                  const totalErr = checkTotalScore(marksDetailRow.exam_max_score, marksDetailRow.ca_max_score);
                  const caErr = checkCATotal(caItems, marksDetailRow.ca_max_score);
                  if (totalErr || caErr) {
                    setMarksErrors({ ...marksErrors, total: totalErr, ca: caErr });
                    return;
                  }
                  setMarksConfig(marksConfig.map(m => m.id === marksDetailRow.id ? { ...marksDetailRow, ca_content: caItems } : m));
                  showSnackbar('Marks configuration saved successfully');
                  setMarksDetailRow(null);
                }}>
                SUBMIT CONFIGURATION
              </Button>
            </Box>
          </Paper>
        ) : (
          /* ── Marks Config Table ──────────────────────────── */
          <Paper elevation={0} sx={{ p: 3, borderRadius: '14px', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB' }}>
            <Typography variant="h6" fontWeight={600} mb={2}>Marks Configuration</Typography>
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table stickyHeader sx={{ '& .MuiTableCell-root': { py: 0.5, px: 1 }, whiteSpace: 'nowrap' }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Programme</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Exam/CA Ratio</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>No. of CAs</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Max Point</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {marksConfig.map((m, i) => (
                    <TableRow key={m.id} hover>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell>{m.programme}</TableCell>
                      <TableCell>{m.exam_max_score} : {m.ca_max_score}</TableCell>
                      <TableCell>{m.no_of_ca}</TableCell>
                      <TableCell>{m.max_point}</TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={(e) => { setMarksMenuAnchor(e.currentTarget); setMarksMenuRow(m); }}>
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                        <Menu anchorEl={marksMenuAnchor} open={Boolean(marksMenuAnchor) && marksMenuRow?.id === m.id} onClose={() => { setMarksMenuAnchor(null); setMarksMenuRow(null); }}>
                          <MenuItem onClick={() => {
                            openMarksDetail(m);
                            setMarksMenuAnchor(null);
                          }}>
                            <IconAdjustments size={18} style={{ marginRight: 8 }} /> Adjust Settings
                          </MenuItem>
                          <MenuItem onClick={() => {
                            setMarksConfig(marksConfig.map(mc => mc.id === m.id ? { ...mc, exam_max_score: 70, ca_max_score: 30, no_of_ca: 1, max_point: 5, use_decimal: 'no', student_position_method: 'arm', result_upload_choice: 'per_subject' } : mc));
                            setMarksMenuAnchor(null);
                            showSnackbar('Configuration reset to defaults');
                          }}>
                            <IconSettings size={18} style={{ marginRight: 8 }} /> Reset to Defaults
                          </MenuItem>
                        </Menu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </InnerTabPanel>

      {/* ════════════════════════════════════════════════════════
          4. AFFECTIVE & PSYCHOMOTOR
          ════════════════════════════════════════════════════════ */}
      <InnerTabPanel value={innerTab} index={3}>
        <SetupAffectivePsychomotorTab showWeeklyReports={false} />
      </InnerTabPanel>

      {/* ════════════════════════════════════════════════════════
          5. COMMENT NOMENCLATURE
          ════════════════════════════════════════════════════════ */}
      <InnerTabPanel value={innerTab} index={4}>
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
          6. PROMOTION SETTINGS
          ════════════════════════════════════════════════════════ */}
      <InnerTabPanel value={innerTab} index={5}>
        <Paper elevation={0} sx={{ p: 3, borderRadius: '14px', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB' }}>
          <Typography variant="h6" fontWeight={600} mb={2}>Promotion Settings</Typography>
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table stickyHeader sx={{ '& .MuiTableCell-root': { py: 0.5, px: 1 }, whiteSpace: 'nowrap' }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>From Class</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>To Class</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Criteria</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {promotions.map((p, i) => (
                  <TableRow key={p.id} hover>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>{p.from_class}</TableCell>
                    <TableCell>{p.to_class}</TableCell>
                    <TableCell>{p.criteria}</TableCell>
                    <TableCell><Chip label={p.status} size="small" color={p.status === 'active' ? 'success' : 'default'} /></TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={(e) => { setPromoMenuAnchor(e.currentTarget); setPromoMenuRow(p); }}>
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                      <Menu anchorEl={promoMenuAnchor} open={Boolean(promoMenuAnchor) && promoMenuRow?.id === p.id} onClose={() => { setPromoMenuAnchor(null); setPromoMenuRow(null); }}>
                        <MenuItem onClick={() => {
                          setPromotions(promotions.map(pr => pr.id === p.id ? { ...pr, status: pr.status === 'active' ? 'inactive' : 'active' } : pr));
                          setPromoMenuAnchor(null);
                          showSnackbar('Promotion status updated');
                        }}>
                          {p.status === 'active' ? <><IconX size={18} style={{ marginRight: 8 }} /> Deactivate</> : <><IconCheck size={18} style={{ marginRight: 8 }} /> Activate</>}
                        </MenuItem>
                        <MenuItem onClick={() => {
                          setPromotions(promotions.filter(pr => pr.id !== p.id));
                          setPromoMenuAnchor(null);
                          showSnackbar('Promotion deleted');
                        }} sx={{ color: 'error.main' }}>
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
          DIALOGS
          ════════════════════════════════════════════════════════ */}

      {/* ── Grade Dialog ────────────────────────────────────── */}
      <Dialog open={gradeDialog.open} onClose={() => setGradeDialog({ open: false, editing: null })} maxWidth="sm" fullWidth>
        <DialogTitle>{gradeDialog.editing ? 'Edit Grade' : 'Set New Grade'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Session/Term</InputLabel>
                <Select value={gradeForm.session_term} label="Session/Term" onChange={e => setGradeForm({ ...gradeForm, session_term: e.target.value })}>
                  {dummySessionTerms.map(s => <MenuItem key={s.id} value={s.id}>{s.label}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Programme</InputLabel>
                <Select value={gradeForm.programme} label="Programme" onChange={e => setGradeForm({ ...gradeForm, programme: e.target.value })}>
                  {dummyProgrammes.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField label="Min Score" fullWidth size="small" type="number" value={gradeForm.min_score} onChange={e => setGradeForm({ ...gradeForm, min_score: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField label="Max Score" fullWidth size="small" type="number" value={gradeForm.max_score} onChange={e => setGradeForm({ ...gradeForm, max_score: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Grade</InputLabel>
                <Select value={gradeForm.grade} label="Grade" onChange={e => setGradeForm({ ...gradeForm, grade: e.target.value })}>
                  {gradeOptions.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField label="Point" fullWidth size="small" type="number" value={gradeForm.point} onChange={e => setGradeForm({ ...gradeForm, point: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField label="Remark" fullWidth size="small" value={gradeForm.remark} onChange={e => setGradeForm({ ...gradeForm, remark: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGradeDialog({ open: false, editing: null })}>Cancel</Button>
          <Button variant="contained" onClick={handleGradeSave}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* ── Resumption Dialog ───────────────────────────────── */}
      <Dialog open={resumptionDialog} onClose={() => setResumptionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Set Resumption & Closing Dates</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <TextField label="This Term Ends On" type="date" fullWidth size="small" InputLabelProps={{ shrink: true }} value={resumptionForm.closing_date} onChange={e => setResumptionForm({ ...resumptionForm, closing_date: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField label="Next Term Begins On" type="date" fullWidth size="small" InputLabelProps={{ shrink: true }} value={resumptionForm.resumption_date} onChange={e => setResumptionForm({ ...resumptionForm, resumption_date: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField label="Boarding Students Returns On" type="date" fullWidth size="small" InputLabelProps={{ shrink: true }} value={resumptionForm.boarding_resumption_date} onChange={e => setResumptionForm({ ...resumptionForm, boarding_resumption_date: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResumptionDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleResumptionSave}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* ── Nomenclature Dialog ─────────────────────────────── */}
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

      {/* ── Snackbar ────────────────────────────────────────── */}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={() => setSnackbar(s => ({ ...s, open: false }))} severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default ResultSetupTab;
