import { useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Grid, FormControl, InputLabel, Select, MenuItem, Avatar, useTheme,
} from '@mui/material';
import { IconPrinter } from '@tabler/icons-react';

const dummyStudent = {
  user_id: 'STD/2025/001', fname: 'Adebayo', lname: 'Tunde', mname: '',
  class_name: 'JSS 1', arm_name: 'A', programme_id: 1,
};

const dummySchoolInfo = {
  name: 'Tai Solarin University of Education Secondary School',
  address: '123 Education Avenue, Lagos, Nigeria',
  phone: '+234 801 234 5678',
  logo: '',
};

const dummyCaType = [
  { display_name: 'CA1', max_score: 20, entities: [{ display_name: 'CA1', max_score: 10 }] },
  { display_name: 'CA2', max_score: 20, entities: [{ display_name: 'CA2', max_score: 10 }] },
];

const dummySubjects = [
  { subject_name: 'Mathematics', ca: { entities: [{ score: 18 }], total: 18, percent: 90, grade: 'A' } },
  { subject_name: 'English Language', ca: { entities: [{ score: 15 }], total: 15, percent: 75, grade: 'B' } },
  { subject_name: 'Physics', ca: { entities: [{ score: 12 }], total: 12, percent: 60, grade: 'C+' } },
  { subject_name: 'Chemistry', ca: { entities: [{ score: 16 }], total: 16, percent: 80, grade: 'B+' } },
  { subject_name: 'Biology', ca: { entities: [{ score: 10 }], total: 10, percent: 50, grade: 'C' } },
  { subject_name: 'Civic Education', ca: { entities: [{ score: 14 }], total: 14, percent: 70, grade: 'B' } },
];

const cellBorderSx = { borderRight: '1px solid', borderColor: 'divider' };

const CaBreakdownTab = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [selectedCaType, setSelectedCaType] = useState('');

  const student = dummyStudent;
  const caConfig = dummyCaType[selectedCaType];

  const totalScore = caConfig
    ? dummySubjects.reduce((sum, s) => sum + (s.ca?.total || 0), 0)
    : 0;
  const average = caConfig && dummySubjects.length
    ? +(Math.round((totalScore / dummySubjects.length) * 100) / 100)
    : 0;

  const handlePrint = () => window.print();

  return (
    <Paper elevation={0} sx={{ borderRadius: '14px', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB' }}>
      {/* ── Card Header ─────────────────────────────────────── */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h6" fontWeight={600}>
          {caConfig
            ? `CA Report — ${student.class_name} ${student.arm_name} • ${student.lname} ${student.fname}`
            : 'Student C.A Scores'}
        </Typography>
        {caConfig && (
          <Button variant="contained" size="small" startIcon={<IconPrinter size={16} />} onClick={handlePrint}>
            Print C.A Result
          </Button>
        )}
      </Box>

      {/* ── School Info Header ──────────────────────────────── */}
      <Box sx={{ p: 2, pb: 2, display: 'flex', justifyContent: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {dummySchoolInfo.logo ? (
            <Avatar src={dummySchoolInfo.logo} sx={{ width: 64, height: 64 }} variant="rounded" />
          ) : (
            <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontSize: 20 }} variant="rounded">
              {dummySchoolInfo.name?.[0]}
            </Avatar>
          )}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h2" fontWeight={900} sx={{ textTransform: 'uppercase' }}>
              {dummySchoolInfo.name}
            </Typography>
            <Typography variant="h6" fontWeight={800} color="text.secondary">
              {dummySchoolInfo.address}  |  Phone: {dummySchoolInfo.phone}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ── Student Info ────────────────────────────────────── */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 5 }}>
            <Typography variant="h6"  color="text.dark" fontWeight={800}>
              Name Of Student: <strong>{student.lname} {student.fname} {student.mname}</strong>
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="h6"  color="text.dark" fontWeight={800}>
              Student Class: <strong>{student.class_name} {student.arm_name}</strong>
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Typography variant="h6" color="text.dark" fontWeight={800}>
              Student ID: <strong>{student.user_id}</strong>
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* ── CA Type Filter ──────────────────────────────────── */}
      <Box sx={{ p: 2, borderBottom: caConfig ? 1 : 0, borderColor: 'divider' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>CA Type</InputLabel>
              <Select value={selectedCaType} label="CA Type"
                onChange={e => setSelectedCaType(e.target.value)}>
                <MenuItem value="">--Select Type--</MenuItem>
                {dummyCaType.map((ca, i) => (
                  <MenuItem key={ca.display_name} value={i}>{ca.display_name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {/* ── Subjects Table ──────────────────────────────────── */}
      {caConfig && (
        <Box sx={{ p: 3 }}>
          <TableContainer sx={{ overflowX: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <Table stickyHeader size="small" sx={{ whiteSpace: 'nowrap' }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, bgcolor: isDark ? 'grey.900' : 'grey.50', ...cellBorderSx, width: '3%' }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: isDark ? 'grey.900' : 'grey.50', ...cellBorderSx }}>Subjects</TableCell>
                  {caConfig.entities.map((ent) => (
                    <TableCell key={ent.display_name} sx={{ fontWeight: 700, bgcolor: isDark ? 'grey.900' : 'grey.50', ...cellBorderSx }} align="center">
                      {ent.display_name}({ent.max_score})
                    </TableCell>
                  ))}
                  <TableCell sx={{ fontWeight: 700, bgcolor: isDark ? 'grey.900' : 'grey.50', ...cellBorderSx }} align="center">
                    Total({caConfig.max_score})
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: isDark ? 'grey.900' : 'grey.50', ...cellBorderSx }} align="center">
                    Percentage(100%)
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: isDark ? 'grey.900' : 'grey.50' }} align="center">Grade</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dummySubjects.map((sub, i) => (
                  <TableRow key={i} hover>
                    <TableCell sx={cellBorderSx}>{i + 1}</TableCell>
                    <TableCell sx={{ ...cellBorderSx, fontWeight: 500 }}>{sub.subject_name}</TableCell>
                    {(sub.ca?.entities || []).map((ent, ei) => (
                      <TableCell key={ei} align="center" sx={cellBorderSx}>
                        {ent.score ?? '-'}
                      </TableCell>
                    ))}
                    <TableCell align="center" sx={{ ...cellBorderSx, fontWeight: 700 }}>
                      {sub.ca?.total ?? '-'}
                    </TableCell>
                    <TableCell align="center" sx={cellBorderSx}>
                      {sub.ca?.percent ?? '-'}
                    </TableCell>
                    <TableCell align="center">
                      <strong>{sub.ca?.grade ?? '-'}</strong>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* ── Total & Average ────────────────────────────── */}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
            <Typography variant="h6" fontWeight={700} color="primary">
              Total Score: {totalScore}
            </Typography>
            <Typography variant="h6" fontWeight={700} color="primary">
              Average Score: {average}
            </Typography>
          </Box>
        </Box>
      )}

      {/* ── Empty State ─────────────────────────────────────── */}
      {!caConfig && (
        <Box sx={{ p: 5, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" fontWeight={600}>
            Please select a CA type to view result
          </Typography>
        </Box>
      )}

      {/* ── Bottom Print Button ─────────────────────────────── */}
      {caConfig && (
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', borderTop: 1, borderColor: 'divider' }}>
          <Button variant="contained" size="small" startIcon={<IconPrinter size={16} />} onClick={handlePrint}>
            Print C.A Result
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default CaBreakdownTab;
