import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Stack,
  Skeleton,
  Alert,
  Divider,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';
import resultDossierApi from '@/api/tenant/result-dossier/resultDossierApi';

const gradeColor = (grade) => {
  const g = String(grade || '').toUpperCase();
  if (g.startsWith('A')) return 'success';
  if (g.startsWith('B') || g.startsWith('C')) return 'info';
  if (g.startsWith('D') || g.startsWith('E')) return 'warning';
  return 'error';
};

const SummaryStat = ({ label, value }) => (
  <Box sx={{ textAlign: 'center', flex: 1, minWidth: 90 }}>
    <Typography fontWeight={800} sx={{ fontSize: 18, color: '#111827', lineHeight: 1 }}>
      {value}
    </Typography>
    <Typography sx={{ fontSize: '0.65rem', color: '#6B7280', fontWeight: 600, mt: 0.4 }}>
      {label}
    </Typography>
  </Box>
);

const TableSkeleton = () => (
  <Stack spacing={1}>
    {Array.from({ length: 6 }).map((_, i) => (
      <Skeleton key={i} variant="rounded" height={32} />
    ))}
  </Stack>
);

/**
 * Comprehensive subject-by-subject breakdown for the learner's own results —
 * same real data source as the Report Card page (`my-report`), shown here as
 * a plain table instead of a print-style template.
 */
const AcademicPerformanceModal = ({ open, onClose, sessionTermId }) => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    let mounted = true;
    setLoading(true);
    setError('');
    setReport(null);

    resultDossierApi
      .getMyReport(sessionTermId ? { session_term_id: sessionTermId } : {})
      .then((res) => {
        if (!mounted) return;
        if (res.data?.status) {
          setReport(res.data.data);
        } else {
          setError(res.data?.message || 'No report available for this term yet.');
        }
      })
      .catch((err) => {
        if (!mounted) return;
        setError(
          err.response?.data?.message ||
            'You must clear your outstanding fees before you can view your results.',
        );
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [open, sessionTermId]);

  const subjects = report?.subjects || [];
  const summary = report?.summary || {};

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        Detailed Results
        {report?.session_term && (
          <Typography component="span" sx={{ ml: 1, fontSize: '0.78rem', color: '#6B7280' }}>
            {report.session_term.session_name} · {report.session_term.term_name}
          </Typography>
        )}
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <TableSkeleton />
        ) : error ? (
          <Alert severity="warning">{error}</Alert>
        ) : subjects.length === 0 ? (
          <Alert severity="info">No results recorded for this term yet.</Alert>
        ) : (
          <>
            <Stack
              direction="row"
              flexWrap="wrap"
              sx={{
                bgcolor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                py: 1.25,
                px: 1,
                mb: 2,
              }}
            >
              <SummaryStat label="Average Score" value={`${summary.average_score ?? '-'}%`} />
              <SummaryStat label="Overall Position" value={summary.overall_position ?? '-'} />
              <SummaryStat
                label="Subjects Scored"
                value={`${summary.subjects_scored ?? 0}/${summary.subjects_taken ?? 0}`}
              />
              <SummaryStat label="Passed" value={summary.passed_count ?? 0} />
              <SummaryStat label="Failed" value={summary.failed_count ?? 0} />
            </Stack>

            <TableContainer
              elevation={0}
              variant="outlined"
              sx={{ borderRadius: 2, overflowX: 'auto' }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Subject</TableCell>
                    <TableCell align="right">CA</TableCell>
                    <TableCell align="right">Exam</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell align="center">Grade</TableCell>
                    <TableCell align="right">Position</TableCell>
                    <TableCell>Remark</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {subjects.map((s) => (
                    <TableRow key={s.course_registration_id || s.subject_id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {s.subject_name}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">{s.ca_total ?? '-'}</TableCell>
                      <TableCell align="right">{s.exam_score ?? '-'}</TableCell>
                      <TableCell align="right">
                        <Typography fontWeight={700}>{s.overall_total ?? '-'}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={s.grade || '-'}
                          size="small"
                          color={gradeColor(s.grade)}
                          sx={{ fontSize: 10, height: 20, fontWeight: 700 }}
                        />
                      </TableCell>
                      <TableCell align="right">{s.position ?? '-'}</TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: '0.75rem', color: '#6B7280' }}>
                          {s.remark || '-'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Divider sx={{ my: 1.5 }} />
            <Typography sx={{ fontSize: '0.7rem', color: '#9CA3AF' }}>
              This is the same result set shown on your Report Card for this term.
            </Typography>
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 2.5, py: 1.5 }}>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AcademicPerformanceModal;
