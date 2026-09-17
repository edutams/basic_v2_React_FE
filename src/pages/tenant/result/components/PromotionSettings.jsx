import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Button, TextField, Grid, Chip, IconButton,
  FormControl, InputLabel, Select, MenuItem, CircularProgress, Tooltip, Menu,
  MenuItem as MuiMenuItem, Alert, Skeleton,
} from '@mui/material';
import { IconEdit } from '@tabler/icons-react';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import EditPromotionDialog from './EditPromotionDialog';
import resultSetupApi from '@/api/tenant/result-setup/resultSetupApi';
import { fetchTenantSessions } from '@/api/tenant/session-term/sessionTermApi';
import tenantApi from '@/api/tenant/tenant_api';

const PromotionSettings = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [programmes, setProgrammes] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dropdownsLoading, setDropdownsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({ prog_id: '', ses_id: '', use_mark: '' });
  const [cummulativeMark, setCummulativeMark] = useState('');
  const [compulsory, setCompulsory] = useState({ total_subj: '', pass_mark: '', subjects: [] });
  const [elective, setElective] = useState({ total_subj: '', pass_mark: '', subjects: [] });
  const [trade, setTrade] = useState({ total_subj: '', pass_mark: '', subjects: [] });

  const [editDialog, setEditDialog] = useState({ open: false, subjType: '' });
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuSubjType, setMenuSubjType] = useState('');

  // ── Fetch dropdown data on mount ────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const fetchDropdowns = async () => {
      setDropdownsLoading(true);
      try {
        const [sesRes, progRes] = await Promise.all([
          fetchTenantSessions({ per_page: 100 }),
          tenantApi.get('/curriculum/programmes'),
        ]);

        if (cancelled) return;

        const sesList = sesRes?.data ?? [];
        setSessions(sesList);

        const progList = progRes?.data?.data ?? [];
        setProgrammes(progList);

        // Auto-select first session
        if (sesList.length > 0) {
          setForm((prev) => ({ ...prev, ses_id: sesList[0].id }));
        }
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to load dropdowns:', err);
        setError('Failed to load sessions or programmes');
      } finally {
        if (!cancelled) setDropdownsLoading(false);
      }
    };
    fetchDropdowns();

    return () => { cancelled = true; };
  }, []);

  // ── Fetch promotion config when filters change ──────────────────
  useEffect(() => {
    if (form.ses_id && form.prog_id && form.use_mark) {
      fetchConfig();
    }
  }, [form.ses_id, form.prog_id, form.use_mark]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await resultSetupApi.getPromotionConfigurations({
        prog_id: form.prog_id,
        session_id: form.ses_id,
      });

      if (response.data.status) {
        const data = response.data.data;
        if (data.cummulative_mark) {
          setCummulativeMark(data.cummulative_mark.cummulative_mark || '');
        } else {
          setCummulativeMark('');
        }
        setCompulsory(data.compulsory || { total_subj: '', pass_mark: '', subjects: [] });
        setElective(data.elective || { total_subj: '', pass_mark: '', subjects: [] });
        setTrade(data.trade || { total_subj: '', pass_mark: '', subjects: [] });
      }
    } catch (err) {
      console.error('Failed to fetch promotion config:', err);
      setError('Failed to load promotion settings');
    } finally {
      setLoading(false);
    }
  }, [form.ses_id, form.prog_id]);

  const submitPassmark = async () => {
    if (Number(cummulativeMark) > 100) return;
    setLoading(true);
    try {
      const response = await resultSetupApi.saveCumulativeMark({
        prog_id: form.prog_id,
        session_id: form.ses_id,
        cummulative_mark: cummulativeMark,
      });

      if (response.data.status) {
        await fetchConfig();
      }
    } catch (err) {
      console.error('Failed to save cumulative mark:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSave = async (data) => {
    setLoading(true);
    try {
      const response = await resultSetupApi.savePromotionBySubjectSettings({
        prog_id: form.prog_id,
        session_id: form.ses_id,
        subj_type: editDialog.subjType,
        total_subj: data.total_subj,
        pass_mark: data.pass_mark,
        subjects: data.subjects?.map(s => s.id || s) || [],
      });

      if (response.data.status) {
        await fetchConfig();
      }
    } catch (err) {
      console.error('Failed to save promotion settings:', err);
    } finally {
      setEditDialog({ open: false, subjType: '' });
      setLoading(false);
    }
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
          <Chip key={i} label={sub.subject_name || sub} size="small" variant="outlined" />
        ))}
      </Box>
    );
  };

  const ready = form.ses_id && form.prog_id;

  return (
    <Box>
      {/* Error Banner */}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      {/* Three Filter Dropdowns */}
      <Grid container spacing={2} sx={{ mb: 1 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Session</InputLabel>
            {dropdownsLoading ? (
              <Skeleton variant="rounded" height={40} />
            ) : (
              <Select value={form.ses_id} label="Session" onChange={(e) => setForm({ ...form, ses_id: e.target.value })}>
                {sessions.map((s) => (
                  <MenuItem key={s.id} value={s.id}>{s.session_name}</MenuItem>
                ))}
              </Select>
            )}
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Programme</InputLabel>
            {dropdownsLoading ? (
              <Skeleton variant="rounded" height={40} />
            ) : (
              <Select value={form.prog_id} label="Programme" onChange={(e) => setForm({ ...form, prog_id: e.target.value })}>
                {programmes.map((p) => (
                  <MenuItem key={p.id} value={p.id}>{p.programme_name || p.programme_title}</MenuItem>
                ))}
              </Select>
            )}
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
                    <Button type="submit" size="small">Submit</Button>
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
