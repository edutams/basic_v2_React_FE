import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, CircularProgress, Alert, Tooltip,
} from '@mui/material';
import { IconEdit } from '@tabler/icons-react';
import { useTheme } from '@mui/material/styles';
import GradeSettingsDialog from './GradeSettingsDialog';
import MarkConfigDialog from './MarkConfigDialog';
import PassMarkDialog from './PassMarkDialog';

const mockDivisions = [
  {
    id: 1,
    division_name: 'Junior Secondary',
    examRatio: 70,
    caRatio: 30,
    numberOfCAs: 2,
    maxPoint: 5,
    caContent: [
      { display_name: 'First Test', max_score: 15, entities: [{ display_name: 'Classwork', max_score: 15 }] },
      { display_name: 'Second Test', max_score: 15, entities: [{ display_name: 'Quiz', max_score: 15 }] },
    ],
    statePassMark: 40,
    schoolAdopted: 45,
    grades: [
      { min_score: 0, max_score: 20, grade: 'F', remark: 'Fail', grade_point: 0 },
      { min_score: 21, max_score: 30, grade: 'E', remark: 'Poor', grade_point: 1 },
      { min_score: 31, max_score: 40, grade: 'D', remark: 'Fair', grade_point: 2 },
      { min_score: 41, max_score: 50, grade: 'C', remark: 'Average', grade_point: 3 },
      { min_score: 51, max_score: 60, grade: 'C+', remark: 'Above Average', grade_point: 4 },
      { min_score: 61, max_score: 70, grade: 'B', remark: 'Good', grade_point: 5 },
      { min_score: 71, max_score: 80, grade: 'B+', remark: 'Very Good', grade_point: 6 },
      { min_score: 81, max_score: 90, grade: 'A', remark: 'Excellent', grade_point: 7 },
      { min_score: 91, max_score: 100, grade: 'A+', remark: 'Outstanding', grade_point: 8 },
    ],
  },
  {
    id: 2,
    division_name: 'Senior Secondary',
    examRatio: 60,
    caRatio: 40,
    numberOfCAs: 2,
    maxPoint: 5,
    caContent: [
      { display_name: 'First Test', max_score: 20, entities: [{ display_name: 'Classwork', max_score: 20 }] },
      { display_name: 'Second Test', max_score: 20, entities: [{ display_name: 'Quiz', max_score: 20 }] },
    ],
    statePassMark: 45,
    schoolAdopted: 45,
    grades: [
      { min_score: 0, max_score: 20, grade: 'F', remark: 'Fail', grade_point: 0 },
      { min_score: 21, max_score: 30, grade: 'E', remark: 'Poor', grade_point: 1 },
      { min_score: 31, max_score: 40, grade: 'D', remark: 'Fair', grade_point: 2 },
      { min_score: 41, max_score: 50, grade: 'C', remark: 'Average', grade_point: 3 },
      { min_score: 51, max_score: 60, grade: 'C+', remark: 'Above Average', grade_point: 4 },
      { min_score: 61, max_score: 70, grade: 'B', remark: 'Good', grade_point: 5 },
      { min_score: 71, max_score: 80, grade: 'B+', remark: 'Very Good', grade_point: 6 },
      { min_score: 81, max_score: 90, grade: 'A', remark: 'Excellent', grade_point: 7 },
      { min_score: 91, max_score: 100, grade: 'A+', remark: 'Outstanding', grade_point: 8 },
    ],
  },
];

const GradeConfiguration = ({ sessionTermId }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Dialog state
  const [gradeDialog, setGradeDialog] = useState({ open: false, division: null, index: -1 });
  const [markDialog, setMarkDialog] = useState({ open: false, division: null, index: -1 });
  const [passMarkDialog, setPassMarkDialog] = useState({ open: false, division: null, index: -1 });

  useEffect(() => {
    if (sessionTermId) {
      setLoading(true);
      const timer = setTimeout(() => {
        setDivisions(mockDivisions);
        setLoading(false);
      }, 400);
      return () => clearTimeout(timer);
    } else {
      setDivisions([]);
    }
  }, [sessionTermId]);

  const handleGradeSave = useCallback((grades) => {
    const mapped = grades.map((g) => ({
      min_score: Number(g.minimumScore),
      max_score: Number(g.maximumScore),
      grade: g.grade,
      remark: g.remark,
      grade_point: Number(g.gradePoint),
    }));
    setDivisions((prev) => {
      const updated = [...prev];
      updated[gradeDialog.index] = { ...updated[gradeDialog.index], grades: mapped };
      return updated;
    });
    setGradeDialog({ open: false, division: null, index: -1 });
  }, [gradeDialog.index]);

  const handleMarkSave = useCallback((markData) => {
    setDivisions((prev) => {
      const updated = [...prev];
      updated[markDialog.index] = {
        ...updated[markDialog.index],
        examRatio: markData.examRatio,
        caRatio: markData.caRatio,
        numberOfCAs: markData.numberOfCAs,
        maxPoint: markData.maxPoint,
        caContent: markData.caContent,
      };
      return updated;
    });
    setMarkDialog({ open: false, division: null, index: -1 });
  }, [markDialog.index]);

  const handleMarkReset = useCallback(() => {
    setDivisions((prev) => {
      const updated = [...prev];
      updated[markDialog.index] = {
        ...updated[markDialog.index],
        examRatio: 70,
        caRatio: 30,
        numberOfCAs: 1,
        maxPoint: 5,
        caContent: [{ display_name: 'CA1', max_score: 30, entities: [{ display_name: 'CA1', max_score: 30 }] }],
      };
      return updated;
    });
    setMarkDialog({ open: false, division: null, index: -1 });
  }, [markDialog.index]);

  const handlePassMarkSave = useCallback((passData) => {
    setDivisions((prev) => {
      const updated = [...prev];
      updated[passMarkDialog.index] = {
        ...updated[passMarkDialog.index],
        statePassMark: passData.statePassMark,
        schoolAdopted: passData.schoolAdopted,
      };
      return updated;
    });
    setPassMarkDialog({ open: false, division: null, index: -1 });
  }, [passMarkDialog.index]);

  if (!sessionTermId) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body2" color="text.secondary">
          Please select a session term to view configurations.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : divisions.length === 0 ? (
        <Alert severity="info">No configurations found for this session term.</Alert>
      ) : (
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table stickyHeader size="small" sx={{ border: '1px solid', borderColor: 'divider', '& .MuiTableCell-root': { py: 1, px: 1.5, borderRight: '1px solid', borderColor: 'divider' }, whiteSpace: 'nowrap' }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, width: '20%', bgcolor: isDark ? 'grey.900' : 'grey.50', borderRight: '1px solid', borderColor: 'divider' }}>Division</TableCell>
                <TableCell sx={{ fontWeight: 700, width: '35%', bgcolor: isDark ? 'grey.900' : 'grey.50', borderRight: '1px solid', borderColor: 'divider' }}>Mark Configuration</TableCell>
                <TableCell sx={{ fontWeight: 700, width: '45%', bgcolor: isDark ? 'grey.900' : 'grey.50', borderRight: '1px solid', borderColor: 'divider' }}>Grade Settings</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {divisions.map((division, index) => (
                <TableRow key={division.id} hover>
                  {/* Division Name */}
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>{division.division_name}</Typography>
                  </TableCell>

                  {/* Mark Configuration */}
                  <TableCell>
                    {!division.examRatio && !division.caRatio ? (
                      <Alert severity="info" sx={{ py: 0 }}>
                        No mark configuration set
                        <Tooltip title="Edit Mark Configuration">
                          <IconButton size="small" onClick={() => setMarkDialog({ open: true, division, index })} sx={{ ml: 0.5 }}>
                            <IconEdit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Alert>
                    ) : (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="body2">Exam/C.A Ratio: <strong>{division.examRatio} : {division.caRatio}</strong></Typography>
                          <Typography variant="body2">No of C.As: <strong>{division.numberOfCAs}</strong></Typography>
                        </Box>
                        <Tooltip title="Edit Mark Configuration">
                          <IconButton size="small" onClick={() => setMarkDialog({ open: true, division, index })}>
                            <IconEdit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}
                  </TableCell>

                  {/* Grade Settings */}
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Box sx={{ flex: 1, overflow: 'auto' }}>
                        <Table size="small" sx={{ border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB' }}>
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 700, py: 0.25, px: 0.5, fontSize: '0.75rem' }}>#</TableCell>
                              <TableCell sx={{ fontWeight: 700, py: 0.25, px: 0.5, fontSize: '0.75rem' }}>Min</TableCell>
                              <TableCell sx={{ fontWeight: 700, py: 0.25, px: 0.5, fontSize: '0.75rem' }}>Max</TableCell>
                              <TableCell sx={{ fontWeight: 700, py: 0.25, px: 0.5, fontSize: '0.75rem' }}>Grade</TableCell>
                              <TableCell sx={{ fontWeight: 700, py: 0.25, px: 0.5, fontSize: '0.75rem' }}>Remark</TableCell>
                              <TableCell sx={{ fontWeight: 700, py: 0.25, px: 0.5, fontSize: '0.75rem' }}>Point</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {(!division.grades || division.grades.length === 0) ? (
                              <TableRow>
                                <TableCell colSpan={6} sx={{ py: 1 }}>
                                  <Alert severity="info" sx={{ py: 0 }}>
                                    No grades configured
                                    <Tooltip title="Edit Grade Settings">
                                      <IconButton size="small" onClick={() => setGradeDialog({ open: true, division, index })} sx={{ ml: 0.5 }}>
                                        <IconEdit fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </Alert>
                                </TableCell>
                              </TableRow>
                            ) : (
                              division.grades.map((grade, i) => (
                                <TableRow key={i}>
                                  <TableCell sx={{ py: 0.25, px: 0.5, fontSize: '0.75rem' }}>{i + 1}</TableCell>
                                  <TableCell sx={{ py: 0.25, px: 0.5, fontSize: '0.75rem' }}>{grade.min_score}</TableCell>
                                  <TableCell sx={{ py: 0.25, px: 0.5, fontSize: '0.75rem' }}>{grade.max_score}</TableCell>
                                  <TableCell sx={{ py: 0.25, px: 0.5, fontSize: '0.75rem' }}>{grade.grade}</TableCell>
                                  <TableCell sx={{ py: 0.25, px: 0.5, fontSize: '0.75rem' }}>{grade.remark}</TableCell>
                                  <TableCell sx={{ py: 0.25, px: 0.5, fontSize: '0.75rem' }}>{grade.grade_point}</TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', pt: 0.5 }}>
                        <Tooltip title="Edit Grade Settings">
                          <IconButton size="small" onClick={() => setGradeDialog({ open: true, division, index })}>
                            <IconEdit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <GradeSettingsDialog
        open={gradeDialog.open}
        onClose={() => setGradeDialog({ open: false, division: null, index: -1 })}
        onSave={handleGradeSave}
        grades={gradeDialog.division?.grades}
        divisionName={gradeDialog.division?.division_name}
      />

      <MarkConfigDialog
        open={markDialog.open}
        onClose={() => setMarkDialog({ open: false, division: null, index: -1 })}
        onSave={handleMarkSave}
        onReset={handleMarkReset}
        data={markDialog.division}
        divisionName={markDialog.division?.division_name}
      />

      <PassMarkDialog
        open={passMarkDialog.open}
        onClose={() => setPassMarkDialog({ open: false, division: null, index: -1 })}
        onSave={handlePassMarkSave}
        data={passMarkDialog.division}
        divisionName={passMarkDialog.division?.division_name}
        isSchoolUser={false}
      />
    </Box>
  );
};

export default GradeConfiguration;
