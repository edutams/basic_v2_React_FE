import { useState, useEffect } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, CircularProgress, Autocomplete, Chip,
} from '@mui/material';
import { IconTrash } from '@tabler/icons-react';
import { useTheme } from '@mui/material/styles';

const mockSubjectSearchResults = {
  compulsory: [
    { id: 1, subject_code: 'MTH', subject_name: 'Mathematics' },
    { id: 2, subject_code: 'ENG', subject_name: 'English Language' },
    { id: 3, subject_code: 'SCI', subject_name: 'Basic Science' },
    { id: 4, subject_code: 'SOC', subject_name: 'Social Studies' },
    { id: 5, subject_code: 'CIV', subject_name: 'Civic Education' },
  ],
  elective: [
    { id: 6, subject_code: 'PHY', subject_name: 'Physics' },
    { id: 7, subject_code: 'CHM', subject_name: 'Chemistry' },
    { id: 8, subject_code: 'BIO', subject_name: 'Biology' },
    { id: 9, subject_code: 'ECO', subject_name: 'Economics' },
    { id: 10, subject_code: 'LIT', subject_name: 'Literature' },
  ],
  trade: [
    { id: 11, subject_code: 'WLD', subject_name: 'Welding' },
    { id: 12, subject_code: 'ELC', subject_name: 'Electrical Installation' },
    { id: 13, subject_code: 'COS', subject_name: 'Cosmetology' },
    { id: 14, subject_code: 'ATM', subject_name: 'Automobile Mechanics' },
    { id: 15, subject_code: 'ICT', subject_name: 'Information Technology' },
  ],
};

const EditPromotionDialog = ({ open, onClose, onSave, subjType, progId, sessionId }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [loading, setLoading] = useState(false);
  const [totalSubj, setTotalSubj] = useState('');
  const [passMark, setPassMark] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);

  useEffect(() => {
    if (open) {
      setLoading(true);
      const timer = setTimeout(() => {
        setAllSubjects(mockSubjectSearchResults[subjType] || []);
        setTotalSubj('');
        setPassMark('');
        setSelectedSubjects([]);
        setLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open, subjType, progId, sessionId]);

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
              options={allSubjects}
              getOptionLabel={(s) => `${s.subject_code} - ${s.subject_name}`}
              value={selectedSubjects}
              onChange={(_, selected) => setSelectedSubjects(selected)}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              noOptionsText="No subjects found"
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
                    <strong>{option.subject_code}</strong> — {option.subject_name}
                  </Typography>
                </li>
              )}
            />

            {/* Selected Subjects Table */}
            {selectedSubjects.length > 0 && (
              <TableContainer sx={{ mt: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, width: '5%', borderBottom: 'none' }}>#</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: '15%', borderBottom: 'none' }}>Code</TableCell>
                      <TableCell sx={{ fontWeight: 700, borderBottom: 'none' }}>Subject</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: '10%', borderBottom: 'none' }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedSubjects.map((subject, i) => (
                      <TableRow key={subject.id}>
                        <TableCell sx={{ borderBottom: 'none' }}>{i + 1}</TableCell>
                        <TableCell sx={{ borderBottom: 'none' }}>{subject.subject_code}</TableCell>
                        <TableCell sx={{ borderBottom: 'none' }}>{subject.subject_name}</TableCell>
                        <TableCell sx={{ borderBottom: 'none' }}>
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
        <Button variant="contained" onClick={handleSave} disabled={!totalSubj || !passMark}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditPromotionDialog;
