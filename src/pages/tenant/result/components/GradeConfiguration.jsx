import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, CircularProgress, Alert, Tooltip, Snackbar,
} from '@mui/material';
import { IconEdit } from '@tabler/icons-react';
import { useTheme } from '@mui/material/styles';
import GradeSettingsDialog from './GradeSettingsDialog';
import MarkConfigDialog from './MarkConfigDialog';
import PassMarkDialog from './PassMarkDialog';
import resultSetupApi from '@/api/tenant/result-setup/resultSetupApi';

const GradeConfiguration = ({ sessionTermId }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Dialog state
  const [gradeDialog, setGradeDialog] = useState({ open: false, division: null, index: -1 });
  const [markDialog, setMarkDialog] = useState({ open: false, division: null, index: -1 });
  const [passMarkDialog, setPassMarkDialog] = useState({ open: false, division: null, index: -1 });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const showSnackbar = (message, severity = 'success') => setSnackbar({ open: true, message, severity });

  const fetchConfigurations = useCallback(async () => {
    if (!sessionTermId) {
      setDivisions([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await resultSetupApi.getConfigurations(sessionTermId);
      if (response.data.status) {
        setDivisions(response.data.data.divisions || []);
      } else {
        setError(response.data.message || 'Failed to fetch configurations');
      }
    } catch (err) {
      console.error('Failed to fetch configurations:', err);
      setError('Failed to load configurations. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [sessionTermId]);

  useEffect(() => {
    fetchConfigurations();
  }, [fetchConfigurations]);

  const handleGradeSave = useCallback(async (grades) => {
    try {
      const response = await resultSetupApi.saveGradeSettings({
        session_term_id: sessionTermId,
        division_id: gradeDialog.division.id,
        grades,
      });

      if (response.data.status) {
        // Refresh configurations
        await fetchConfigurations();
        showSnackbar(response.data.message || 'Grade settings saved successfully');
      } else {
        showSnackbar(response.data.message || 'Failed to save grade settings', 'error');
      }
    } catch (err) {
      console.error('Failed to save grade settings:', err);
      showSnackbar('Failed to save grade settings', 'error');
    }
    setGradeDialog({ open: false, division: null, index: -1 });
  }, [gradeDialog.division, sessionTermId, fetchConfigurations]);

  const handleMarkSave = useCallback(async (markData) => {
    try {
      const response = await resultSetupApi.saveMarkConfiguration({
        session_term_id: sessionTermId,
        division_id: markDialog.division.id,
        examRatio: markData.examRatio,
        caRatio: markData.caRatio,
        numberOfCAs: markData.numberOfCAs,
        maxPoint: markData.maxPoint,
        caContent: markData.caContent,
      });

      if (response.data.status) {
        await fetchConfigurations();
        showSnackbar(response.data.message || 'Mark configuration saved successfully');
      } else {
        showSnackbar(response.data.message || 'Failed to save mark configuration', 'error');
      }
    } catch (err) {
      console.error('Failed to save mark configuration:', err);
      showSnackbar('Failed to save mark configuration', 'error');
    }
    setMarkDialog({ open: false, division: null, index: -1 });
  }, [markDialog.division, sessionTermId, fetchConfigurations]);

  const handleMarkReset = useCallback(async () => {
    try {
      const response = await resultSetupApi.resetMarkConfiguration({
        session_term_id: sessionTermId,
        division_id: markDialog.division.id,
      });

      if (response.data.status) {
        await fetchConfigurations();
        showSnackbar(response.data.message || 'Mark configuration reset successfully');
      } else {
        showSnackbar(response.data.message || 'Failed to reset mark configuration', 'error');
      }
    } catch (err) {
      console.error('Failed to reset mark configuration:', err);
      showSnackbar('Failed to reset mark configuration', 'error');
    }
    setMarkDialog({ open: false, division: null, index: -1 });
  }, [markDialog.division, sessionTermId, fetchConfigurations]);

  const handlePassMarkSave = useCallback(async (passData) => {
    try {
      const response = await resultSetupApi.savePassMark({
        session_term_id: sessionTermId,
        division_id: passMarkDialog.division.id,
        pass_mark: passData.passMark || passData.schoolAdopted,
      });

      if (response.data.status) {
        await fetchConfigurations();
        showSnackbar(response.data.message || 'Pass mark saved successfully');
      } else {
        showSnackbar(response.data.message || 'Failed to save pass mark', 'error');
      }
    } catch (err) {
      console.error('Failed to save pass mark:', err);
      showSnackbar('Failed to save pass mark', 'error');
    }
    setPassMarkDialog({ open: false, division: null, index: -1 });
  }, [passMarkDialog.division, sessionTermId, fetchConfigurations]);

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
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
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
                        <Table
                          size="small"
                          sx={{
                            border: '1px solid',
                            borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
                            '& .MuiTableCell-root': {
                              borderRight: '1px solid',
                              borderBottom: '1px solid',
                              borderColor: 'divider',
                            },
                            '& tbody tr:nth-of-type(odd)': {
                              backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#FAFAFA',
                            },
                          }}
                        >
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

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default GradeConfiguration;
