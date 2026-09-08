import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Button, TextField, Grid, Chip, IconButton,
  FormControl, InputLabel, Select, MenuItem, CircularProgress, Tooltip, Menu,
  MenuItem as MuiMenuItem,
} from '@mui/material';
import { IconEdit } from '@tabler/icons-react';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import EditPromotionDialog from './EditPromotionDialog';

const mockProgrammes = [
  { id: 1, prog_name: 'Junior Secondary' },
  { id: 2, prog_name: 'Senior Secondary' },
];

const mockSessions = [
  { id: 1, sesname: '2025/2026' },
  { id: 2, sesname: '2024/2025' },
];

const mockConfigData = {
  1: {
    1: {
      cummulative_mark: 40,
      compulsory: {
        total_subj: 5,
        pass_mark: 40,
        subjects: [
          { subject_name: 'Mathematics' },
          { subject_name: 'English Language' },
          { subject_name: 'Basic Science' },
          { subject_name: 'Social Studies' },
          { subject_name: 'Civic Education' },
        ],
      },
      elective: {
        total_subj: 3,
        pass_mark: 40,
        subjects: [
          { subject_name: 'Physics' },
          { subject_name: 'Chemistry' },
          { subject_name: 'Biology' },
        ],
      },
      trade: {
        total_subj: 2,
        pass_mark: 35,
        subjects: [
          { subject_name: 'Information Technology' },
        ],
      },
    },
  },
  2: {
    1: {
      cummulative_mark: 45,
      compulsory: {
        total_subj: 6,
        pass_mark: 45,
        subjects: [
          { subject_name: 'Mathematics' },
          { subject_name: 'English Language' },
          { subject_name: 'Civic Education' },
        ],
      },
      elective: {
        total_subj: 4,
        pass_mark: 45,
        subjects: [
          { subject_name: 'Physics' },
          { subject_name: 'Chemistry' },
        ],
      },
      trade: {
        total_subj: 2,
        pass_mark: 40,
        subjects: [
          { subject_name: 'Electrical Installation' },
        ],
      },
    },
  },
};

const PromotionSettings = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [programmes] = useState(mockProgrammes);
  const [sessions] = useState(mockSessions);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({ prog_id: '', ses_id: '', use_mark: '' });
  const [cummulativeMark, setCummulativeMark] = useState('');
  const [compulsory, setCompulsory] = useState({ total_subj: '', pass_mark: '', subjects: [] });
  const [elective, setElective] = useState({ total_subj: '', pass_mark: '', subjects: [] });
  const [trade, setTrade] = useState({ total_subj: '', pass_mark: '', subjects: [] });

  const [editDialog, setEditDialog] = useState({ open: false, subjType: '' });
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuSubjType, setMenuSubjType] = useState('');

  useEffect(() => {
    if (sessions.length > 0 && !form.ses_id) {
      setForm((prev) => ({ ...prev, ses_id: sessions[0].id }));
    }
    if (programmes.length > 0 && !form.prog_id) {
      setForm((prev) => ({ ...prev, prog_id: programmes[0].id }));
    }
  }, [sessions, programmes]);

  useEffect(() => {
    if (form.ses_id && form.prog_id && form.use_mark) {
      fetchConfig();
    }
  }, [form.ses_id, form.prog_id, form.use_mark]);

  const fetchConfig = useCallback(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      const config = mockConfigData[form.prog_id]?.[form.ses_id];
      if (config) {
        setCummulativeMark(config.cummulative_mark);
        setCompulsory(config.compulsory);
        setElective(config.elective);
        setTrade(config.trade);
      } else {
        setCummulativeMark('');
        setCompulsory({ total_subj: '', pass_mark: '', subjects: [] });
        setElective({ total_subj: '', pass_mark: '', subjects: [] });
        setTrade({ total_subj: '', pass_mark: '', subjects: [] });
      }
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [form.ses_id, form.prog_id]);

  const submitPassmark = () => {
    if (Number(cummulativeMark) > 100) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); }, 300);
  };

  const handleEditSave = (data) => {
    setLoading(true);
    setTimeout(() => {
      const setter = { compulsory: setCompulsory, elective: setElective, trade: setTrade }[editDialog.subjType];
      if (setter) {
        setter({ total_subj: data.total_subj, pass_mark: data.pass_mark, subjects: data.subjects });
      }
      setEditDialog({ open: false, subjType: '' });
      setLoading(false);
    }, 300);
  };

  const openMenu = (e, subjType) => {
    setMenuAnchor(e.currentTarget);
    setMenuSubjType(subjType);
  };

  const closeMenu = () => {
    setMenuAnchor(null);
    setMenuSubjType('');
  };

  const renderSubjects = (subjects) => {
    if (!subjects || subjects.length === 0) {
      return <Chip label="No Subject Selected" size="small" color="warning" />;
    }
    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {subjects.map((sub, i) => (
          <Chip key={i} label={sub.subject_name} size="small" variant="outlined" />
        ))}
      </Box>
    );
  };

  const ready = form.ses_id && form.prog_id;

  return (
    <Box>
      {/* Three Filter Dropdowns */}
      <Grid container spacing={2} sx={{ mb: 1 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Session</InputLabel>
            <Select value={form.ses_id} label="Session" onChange={(e) => setForm({ ...form, ses_id: e.target.value })}>
              {sessions.map((s) => (
                <MenuItem key={s.id} value={s.id}>{s.sesname}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Programme</InputLabel>
            <Select value={form.prog_id} label="Programme" onChange={(e) => setForm({ ...form, prog_id: e.target.value })}>
              {programmes.map((p) => (
                <MenuItem key={p.id} value={p.id}>{p.prog_name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Use cummulative passmark</InputLabel>
            <Select value={form.use_mark} label="Use cummulative passmark" onChange={(e) => setForm({ ...form, use_mark: e.target.value })}>
              <MenuItem value="">-- Select --</MenuItem>
              <MenuItem value="yes">Yes</MenuItem>
              <MenuItem value="no">No</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* ── Cumulative Passmark Form ── */}
          {form.use_mark === 'yes' && ready && (
            <Paper elevation={0} sx={{ p: 2, borderRadius: '14px', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB' }}>
              <Box component="form" onSubmit={(e) => { e.preventDefault(); submitPassmark(); }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField label="Passmark (%)" fullWidth size="small" type="number" value={cummulativeMark} onChange={(e) => setCummulativeMark(e.target.value)} inputProps={{ min: 0, max: 100 }} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Button type="submit"  size="small">Submit</Button>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          )}

          {/* ── Subject-Type Table ── */}
          {form.use_mark === 'no' && ready && (
            <Paper elevation={0} sx={{ p: 3, borderRadius: '14px', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB' }}>
              <TableContainer sx={{ overflowX: 'auto' }}>
                <Table stickyHeader sx={{ '& .MuiTableCell-root': { py: 0.5, px: 1 }, whiteSpace: 'nowrap' }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Subject Type</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Total Subjects</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Pass Mark</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Subjects</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[
                      { num: 1, type: 'Compulsory', data: compulsory },
                      { num: 2, type: 'Elective', data: elective },
                      { num: 3, type: 'Trade', data: trade },
                    ].map((row) => (
                      <TableRow key={row.type} hover>
                        <TableCell>{row.num}</TableCell>
                        <TableCell>{row.type}</TableCell>
                        <TableCell>{row.data.total_subj || '-'}</TableCell>
                        <TableCell>{row.data.pass_mark || '-'}</TableCell>
                        <TableCell>{renderSubjects(row.data.subjects)}</TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={(e) => openMenu(e, row.type.toLowerCase())}>
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}
        </>
      )}

      {/* Action Menu */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
        <MuiMenuItem onClick={() => { setEditDialog({ open: true, subjType: menuSubjType }); closeMenu(); }}>
          <IconEdit size={18} style={{ marginRight: 8 }} /> Edit
        </MuiMenuItem>
      </Menu>

      {/* Edit Dialog */}
      <EditPromotionDialog
        open={editDialog.open}
        onClose={() => setEditDialog({ open: false, subjType: '' })}
        onSave={handleEditSave}
        subjType={editDialog.subjType}
        progId={form.prog_id}
        sessionId={form.ses_id}
      />
    </Box>
  );
};

export default PromotionSettings;
