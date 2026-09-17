import { useState, useEffect } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, CircularProgress, Autocomplete, Chip,
} from '@mui/material';
import { IconTrash } from '@tabler/icons-react';
import { useTheme } from '@mui/material/styles';
import resultSetupApi from '@/api/tenant/result-setup/resultSetupApi';

const EditPromotionDialog = ({ open, onClose, onSave, subjType, progId, sessionId }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [loading, setLoading] = useState(false);
  const [totalSubj, setTotalSubj] = useState('');
  const [passMark, setPassMark] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [subjectSearch, setSubjectSearch] = useState('');

  // ── Fetch existing settings and available subjects when dialog opens ──
  useEffect(() => {
    if (!open || !progId || !sessionId) return;

    let cancelled = false;

    const loadData = async () => {
      setLoading(true);
      setTotalSubj('');
      setPassMark('');
      setSelectedSubjects([]);
      setAllSubjects([]);

      try {
        // Fetch existing promotion settings for this subject type
        const settingsRes = await resultSetupApi.getPromotionBySubjectSettings({
          prog_id: progId,
          session_id: sessionId,
          subj_type: subjType,
        });

        if (cancelled) return;

        const settings = settingsRes?.data?.data;
        if (settings) {
          setTotalSubj(settings.total_subj?.toString() || '');
          setPassMark(settings.pass_mark?.toString() || '');
          if (settings.subjects && Array.isArray(settings.subjects)) {
            setSelectedSubjects(settings.subjects);
          }
        }

        // Fetch available subjects for this programme
        const subjectsRes = await resultSetupApi.searchSubjects({
          prog_id: progId,
        });

        if (cancelled) return;

        const subjects = subjectsRes?.data?.data ?? [];
        setAllSubjects(subjects);
      } catch (err) {
        console.error('Failed to load promotion data:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadData();

    return () => { cancelled = true; };
  }, [open, progId, sessionId, subjType]);

  // ── Filter subjects based on search input ──────────────────────
  const filteredSubjects = subjectSearch
    ? allSubjects.filter((s) =>
        s.subject_name?.toLowerCase().includes(subjectSearch.toLowerCase()) ||
        s.subject_code?.toLowerCase().includes(subjectSearch.toLowerCase())
      )
    : allSubjects;

  const handleSave = () => {
    if (!totalSubj || !passMark) return;
    onSave({
      total_subj: Number(totalSubj),
      pass_mark: Number(passMark),
      subjects: selectedSubjects,
    });
  };

  const label = subjType ? subjType.charAt(0).toUpperCase() + subjType.slice(1) : '';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>
        Edit Promotion Settings — {label} Subjects
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            <TextField
              label="Total Number Of Subjects"
              fullWidth size="small" type="number"
              value={totalSubj}
              onChange={(e) => setTotalSubj(e.target.value)}
              sx={{ mb: 2 }}
            />

            <TextField
              label="Pass Mark"
              fullWidth size="small" type="number"
              value={passMark}
              onChange={(e) => setPassMark(e.target.value)}
              sx={{ mb: 2 }}
            />

            {/* Subject Autocomplete with Chips */}
            <Autocomplete
              multiple
              options={filteredSubjects}
              getOptionLabel={(s) => s.subject_code ? `${s.subject_code} - ${s.subject_name}` : s.subject_name}
              value={selectedSubjects}
              onChange={(_, selected) => setSelectedSubjects(selected)}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              noOptionsText="No subjects found"
              onInputChange={(_, value) => setSubjectSearch(value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="small"
                  placeholder="Search for subjects..."
                />
              )}
              renderTags={(selected, getTagProps) =>
                selected.map((s, index) => (
                  <Chip
                    key={s.id}
                    label={s.subject_name}
                    size="small"
                    sx={{
                      bgcolor: isDark ? 'primary.light' : '#334155',
                      color: isDark ? 'primary.contrastText' : '#fff',
                    }}
                    {...getTagProps({ index })}
                  />
                ))
              }
              renderOption={(props, option) => (
                <li {...props} key={option.id}>
                  <Typography variant="body2">
                    {option.subject_name}-
                    {option.subject_code && <strong>{option.subject_code}  </strong>}
                  </Typography>
                </li>
              )}
            />

            {/* Selected Subjects Table */}
            {selectedSubjects.length > 0 && (
              <TableContainer sx={{ mt: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Table size="small" sx={{ '& .MuiTableCell-root': { borderRight: '1px solid', borderColor: 'divider' } }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, width: '5%', bgcolor: isDark ? 'grey.900' : 'grey.50' }}>#</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: '15%', bgcolor: isDark ? 'grey.900' : 'grey.50' }}>Code</TableCell>
                      <TableCell sx={{ fontWeight: 700, bgcolor: isDark ? 'grey.900' : 'grey.50' }}>Subject</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: '10%', bgcolor: isDark ? 'grey.900' : 'grey.50' }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedSubjects.map((subject, i) => (
                      <TableRow key={subject.id} hover>
                        <TableCell>{i + 1}</TableCell>
                        <TableCell>{subject.subject_code || '-'}</TableCell>
                        <TableCell>{subject.subject_name || subject}</TableCell>
                        <TableCell>
                          <IconButton size="small" color="error" onClick={() => setSelectedSubjects(selectedSubjects.filter((_, idx) => idx !== i))}>
                            <IconTrash size={16} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button size='small' onClick={handleSave} disabled={!totalSubj || !passMark}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditPromotionDialog;
