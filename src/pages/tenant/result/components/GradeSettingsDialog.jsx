import { useState, useEffect } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, IconButton, Typography, Alert,
} from '@mui/material';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useTheme } from '@mui/material/styles';

const emptyGrade = () => ({
  minimumScore: '',
  maximumScore: '',
  grade: '',
  remark: '',
  gradePoint: '',
});

const GradeSettingsDialog = ({ open, onClose, onSave, grades: initialGrades, divisionName }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [editable, setEditable] = useState([]);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (open) {
      if (initialGrades && initialGrades.length > 0) {
        setEditable(
          initialGrades.map((g) => ({
            minimumScore: g.minimumScore ?? g.min_score ?? '',
            maximumScore: g.maximumScore ?? g.max_score ?? '',
            grade: g.grade ?? '',
            remark: g.remark ?? '',
            gradePoint: g.gradePoint ?? g.grade_point ?? '',
          }))
        );
      } else {
        setEditable([emptyGrade()]);
      }
      setErrors([]);
    }
  }, [open, initialGrades]);

  const addRow = () => setEditable([...editable, emptyGrade()]);

  const removeRow = (index) => {
    if (editable.length <= 1) return;
    setEditable(editable.filter((_, i) => i !== index));
  };

  const updateRow = (index, field, value) => {
    const updated = [...editable];
    updated[index] = { ...updated[index], [field]: value };
    setEditable(updated);
    setErrors([]);
  };

  const validate = () => {
    const errs = [];
    for (let i = 0; i < editable.length; i++) {
      const g = editable[i];
      if (g.minimumScore === '' || g.maximumScore === '' || !g.grade || !g.remark || g.gradePoint === '') {
        errs.push(`Row ${i + 1}: All fields are required`);
        break;
      }
      if (Number(g.minimumScore) >= Number(g.maximumScore)) {
        errs.push(`Row ${i + 1}: Minimum score must be less than maximum score`);
        break;
      }
    }
    if (errs.length === 0) {
      const sorted = [...editable].sort((a, b) => Number(b.minimumScore) - Number(a.minimumScore));
      for (let i = 0; i < sorted.length - 1; i++) {
        if (Number(sorted[i].minimumScore) <= Number(sorted[i + 1].maximumScore)) {
          errs.push('Grade ranges cannot overlap');
          break;
        }
      }
    }
    setErrors(errs);
    return errs.length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave(editable);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>
        Grade Configuration — {divisionName}
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
          <Button variant="contained" size="small" startIcon={<IconPlus size={16} />} onClick={addRow}>
            Add More
          </Button>
        </Box>

        {errors.length > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.map((e, i) => <div key={i}>{e}</div>)}
          </Alert>
        )}

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, width: '5%' }}>#</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Min Score</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Max Score</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Grade</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Remark</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Grade Point</TableCell>
                <TableCell sx={{ fontWeight: 700, width: '5%' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {editable.map((g, i) => (
                <TableRow key={i}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>
                    <TextField
                      size="small" type="number" placeholder="Min Score" fullWidth
                      value={g.minimumScore}
                      onChange={(e) => updateRow(i, 'minimumScore', e.target.value)}
                      inputProps={{ step: 0.01, min: 0, max: 100 }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small" type="number" placeholder="Max Score" fullWidth
                      value={g.maximumScore}
                      onChange={(e) => updateRow(i, 'maximumScore', e.target.value)}
                      inputProps={{ step: 0.01, min: 0, max: 100 }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small" placeholder="Grade" fullWidth
                      value={g.grade}
                      onChange={(e) => updateRow(i, 'grade', e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small" placeholder="Remark" fullWidth
                      value={g.remark}
                      onChange={(e) => updateRow(i, 'remark', e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small" type="number" placeholder="Point" fullWidth
                      value={g.gradePoint}
                      onChange={(e) => updateRow(i, 'gradePoint', e.target.value)}
                      inputProps={{ min: 0, max: 5 }}
                    />
                  </TableCell>
                  <TableCell>
                    {i > 0 && (
                      <IconButton size="small" color="error" onClick={() => removeRow(i)}>
                        <IconTrash size={16} />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained" onClick={handleSave}>Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default GradeSettingsDialog;
