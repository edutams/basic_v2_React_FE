import { useState } from 'react';
import {
  Box, Typography, Paper, Grid, FormControl, InputLabel, Select, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Alert, useTheme,
} from '@mui/material';

const dummyClasses = [
  { id: 1, name: 'JSS 1A' }, { id: 2, name: 'JSS 2A' }, { id: 3, name: 'SS 1A' }, { id: 4, name: 'SS 2A' },
];
const dummySubjects = ['ENG', 'MATH', 'PHY', 'CHEM', 'BIO'];
const grades = [
  { grade: 'A+', min: 90, max: 100, color: '#16A34A' },
  { grade: 'A', min: 80, max: 89, color: '#22C55E' },
  { grade: 'B+', min: 70, max: 79, color: '#3B82F6' },
  { grade: 'B', min: 60, max: 69, color: '#60A5FA' },
  { grade: 'C+', min: 50, max: 59, color: '#D97706' },
  { grade: 'C', min: 40, max: 49, color: '#F59E0B' },
  { grade: 'D', min: 30, max: 39, color: '#EA580C' },
  { grade: 'E', min: 20, max: 29, color: '#DC2626' },
  { grade: 'F', min: 0, max: 19, color: '#991B1B' },
];

const generateSummary = () => {
  const summary = {};
  dummySubjects.forEach(subj => {
    summary[subj] = grades.map(() => Math.floor(Math.random() * 8));
  });
  return summary;
};

const SummarySheetTab = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [selectedClass, setSelectedClass] = useState(1);
  const [summary] = useState(() => generateSummary());

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 2 }}>
        View grade distribution summary across subjects for the selected class.
      </Alert>

      <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: '14px', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Class</InputLabel>
              <Select value={selectedClass} label="Class" onChange={e => setSelectedClass(e.target.value)}>
                {dummyClasses.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* ── Grade Distribution Cards ────────────────────────── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {grades.map((g) => {
          const count = dummySubjects.reduce((sum, subj) => sum + (summary[subj]?.[grades.indexOf(g)] || 0), 0);
          return (
            <Grid size={{ xs: 6, sm: 4, md: 3 }} key={g.grade}>
              <Paper elevation={0} sx={{ p: 2, textAlign: 'center', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB', borderRadius: '10px' }}>
                <Typography variant="h4" fontWeight={700} color={g.color}>{count}</Typography>
                <Chip label={`${g.grade} (${g.min}-${g.max})`} size="small" sx={{ mt: 1, fontWeight: 700, color: '#fff', bgcolor: g.color }} />
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {/* ── Breakdown Table ─────────────────────────────────── */}
      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table stickyHeader sx={{ '& .MuiTableCell-root': { py: 0.5, px: 1 }, whiteSpace: 'nowrap' }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Grade</TableCell>
              {dummySubjects.map(s => (
                <TableCell key={s} sx={{ fontWeight: 700 }} align="center">{s}</TableCell>
              ))}
              <TableCell sx={{ fontWeight: 700 }} align="center">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {grades.map((g) => {
              const rowTotal = dummySubjects.reduce((sum, subj) => sum + (summary[subj]?.[grades.indexOf(g)] || 0), 0);
              return (
                <TableRow key={g.grade} hover>
                  <TableCell>
                    <Chip label={g.grade} size="small" sx={{ fontWeight: 700, color: '#fff', bgcolor: g.color }} />
                  </TableCell>
                  {dummySubjects.map(subj => (
                    <TableCell key={subj} align="center">{summary[subj]?.[grades.indexOf(g)] || 0}</TableCell>
                  ))}
                  <TableCell align="center" sx={{ fontWeight: 700 }}>{rowTotal}</TableCell>
                </TableRow>
              );
            })}
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
              {dummySubjects.map(subj => (
                <TableCell key={subj} align="center" sx={{ fontWeight: 700 }}>
                  {grades.reduce((sum, g, i) => sum + (summary[subj]?.[i] || 0), 0)}
                </TableCell>
              ))}
              <TableCell align="center" sx={{ fontWeight: 700 }}>
                {grades.reduce((sum, g) => sum + dummySubjects.reduce((s, subj) => s + (summary[subj]?.[grades.indexOf(g)] || 0), 0), 0)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default SummarySheetTab;
