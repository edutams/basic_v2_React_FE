import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, Typography, Alert,
  CircularProgress, useTheme,
} from '@mui/material';

const dummyStudents = [
  { id: 1, fullname: 'Adebayo Tunde', reg_id: 'STD/2025/001', ca_details: null, examScores: '', loading: false },
  { id: 2, fullname: 'Chidinma Obi', reg_id: 'STD/2025/002', ca_details: null, examScores: '', loading: false },
  { id: 3, fullname: 'Emeka Uche', reg_id: 'STD/2025/003', ca_details: null, examScores: '', loading: false },
  { id: 4, fullname: 'Aisha Mohammed', reg_id: 'STD/2025/004', ca_details: null, examScores: '', loading: false },
  { id: 5, fullname: 'Fatima Abubakar', reg_id: 'STD/2025/005', ca_details: null, examScores: '', loading: false },
  { id: 6, fullname: 'Ibrahim Musa', reg_id: 'STD/2025/006', ca_details: null, examScores: '', loading: false },
];

const dummyCaType = [
  {
    display_name: 'CA1',
    entities: [
      { display_name: 'Test', max_score: 10 },
    ],
  },
  {
    display_name: 'CA2',
    entities: [
      { display_name: 'Assignment', max_score: 10 },
    ],
  },
];

const dummySettings = { exam_max_score: 60 };

const InputScoreDialog = ({ open, onClose, allocation, filter }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [students, setStudents] = useState([]);
  const [caType] = useState(dummyCaType);
  const [settings] = useState(dummySettings);
  const [caScoreErrors, setCaScoreErrors] = useState([]);
  const [examScoreErrors, setExamScoreErrors] = useState([]);

  useEffect(() => {
    if (open) {
      const initialized = dummyStudents.map((s) => ({
        ...s,
        ca_details: JSON.parse(JSON.stringify(caType)),
        examScores: '',
        loading: false,
      }));
      setStudents(initialized);
      setCaScoreErrors(initialized.map(() => new Array(caType.length).fill(false)));
      setExamScoreErrors(new Array(initialized.length).fill(false));
    }
  }, [open]);

  const getColspan = (ca) => Object.keys(ca.entities).length;

  const handleCaScoreChange = (studentIndex, caIndex, entityIndex, value) => {
    const numeric = value.replace(/[^0-9.]/g, '');
    const maxScore = Number(caType[caIndex].entities[entityIndex].max_score);
    const parsed = parseFloat(numeric);

    const updated = [...students];
    updated[studentIndex] = {
      ...updated[studentIndex],
      ca_details: updated[studentIndex].ca_details.map((ca, ci) => {
        if (ci !== caIndex) return ca;
        return {
          ...ca,
          entities: ca.entities.map((ent, ei) => {
            if (ei !== entityIndex) return ent;
            return { ...ent, score: numeric };
          }),
        };
      }),
    };
    setStudents(updated);

    const newErrors = [...caScoreErrors];
    if (!newErrors[studentIndex]) newErrors[studentIndex] = [];
    newErrors[studentIndex][caIndex] = !isNaN(parsed) && parsed > maxScore;
    setCaScoreErrors(newErrors);
  };

  const handleExamScoreChange = (studentIndex, value) => {
    const numeric = value.replace(/[^0-9.]/g, '');
    const maxScore = settings.exam_max_score;
    const parsed = parseFloat(numeric);

    const updated = [...students];
    updated[studentIndex] = { ...updated[studentIndex], examScores: numeric };
    setStudents(updated);

    const newErrors = [...examScoreErrors];
    newErrors[studentIndex] = !isNaN(parsed) && (parsed < 0 || parsed > maxScore);
    setExamScoreErrors(newErrors);
  };

  const handleSave = (studentIndex) => {
    const student = students[studentIndex];
    const hasFilledCA = student.ca_details?.some((ca) =>
      ca.entities?.some((ent) => ent.score !== '' && ent.score !== undefined)
    );
    const hasFilledExam = student.examScores !== '';

    if (!hasFilledCA && !hasFilledExam) {
      return;
    }

    const updated = [...students];
    updated[studentIndex] = { ...updated[studentIndex], loading: true };
    setStudents(updated);

    setTimeout(() => {
      const final = [...students];
      final[studentIndex] = { ...final[studentIndex], loading: false };
      setStudents(final);
    }, 800);
  };

  const handleClose = () => {
    setStudents([]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        Input Score — {allocation?.subject_name} ({allocation?.className})
      </DialogTitle>
      <DialogContent>
        <TableContainer sx={{ overflowX: 'auto', mt: 1 }}>
          <Table stickyHeader sx={{ '& .MuiTableCell-root': { py: 0.5, px: 1 }, whiteSpace: 'nowrap' }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }} rowSpan={2}>#</TableCell>
                <TableCell sx={{ fontWeight: 700 }} rowSpan={2}>Student Info</TableCell>
                {caType.map((ca) => (
                  <TableCell key={ca.display_name} sx={{ fontWeight: 700 }} colSpan={getColspan(ca)} align="center">
                    {ca.display_name}
                  </TableCell>
                ))}
                <TableCell sx={{ fontWeight: 700 }} rowSpan={2} align="center">
                  Exam Score ({settings.exam_max_score})
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }} rowSpan={2} align="center">Action</TableCell>
              </TableRow>
              <TableRow>
                {caType.map((ca) =>
                  ca.entities.map((entity) => (
                    <TableCell key={entity.display_name} sx={{ fontWeight: 700 }} align="center">
                      {entity.display_name} ({entity.max_score})
                    </TableCell>
                  ))
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((student, si) => (
                <TableRow key={student.id} hover>
                  <TableCell>{si + 1}</TableCell>
                  <TableCell>{student.fullname}</TableCell>
                  {caType.map((ca, ci) =>
                    ca.entities.map((entity, ei) => (
                      <TableCell key={`${ci}-${ei}`} align="center">
                        <TextField
                          size="small"
                          type="number"
                          placeholder="0"
                          sx={{ width: 70 }}
                          value={student.ca_details?.[ci]?.entities?.[ei]?.score || ''}
                          onChange={(e) => handleCaScoreChange(si, ci, ei, e.target.value)}
                          error={caScoreErrors[si]?.[ci] || false}
                          helperText={caScoreErrors[si]?.[ci] ? 'Invalid' : ''}
                        />
                      </TableCell>
                    ))
                  )}
                  <TableCell align="center">
                    <TextField
                      size="small"
                      type="number"
                      placeholder="0"
                      sx={{ width: 70 }}
                      value={student.examScores}
                      onChange={(e) => handleExamScoreChange(si, e.target.value)}
                      error={examScoreErrors[si] || false}
                      helperText={examScoreErrors[si] ? 'Invalid' : ''}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      size="small"
                      disabled={student.loading}
                      onClick={() => handleSave(si)}
                    >
                      {student.loading ? <CircularProgress size={16} color="inherit" /> : 'Save'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default InputScoreDialog;
