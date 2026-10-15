import { useState, useEffect } from 'react';
import { Box, Typography, Chip, Stack, Skeleton, Alert, Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material';
import PropTypes from 'prop-types';
import resultDossierApi from '@/api/tenant/result-dossier/resultDossierApi';

/** Real current-term academic snapshot for one learner — subjects/CA/exam
 * scores, grades, and attendance — reusing the same staff-facing
 * student-report endpoint the Student Dossier page already calls. Scoped
 * to whichever registration is the learner's current one; a learner with
 * no current-term registration (graduated/withdrawn) shows an honest empty
 * state rather than stale or fabricated data. */
const LearnerAcademicsContent = ({ learner }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [report, setReport] = useState(null);

  const registrationId = learner?.current_registration?.id;

  useEffect(() => {
    if (!registrationId) return;
    setLoading(true);
    setError(null);
    resultDossierApi
      .getStudentReport({ student_registration_id: registrationId })
      .then((res) => {
        if (res?.data?.status) {
          setReport(res.data.data);
        } else {
          setError(res?.data?.message || 'Failed to load academic report');
        }
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load academic report'))
      .finally(() => setLoading(false));
  }, [registrationId]);

  if (!registrationId) {
    return (
      <Alert severity="info">No current-term registration — nothing to show for this session.</Alert>
    );
  }

  if (loading) {
    return (
      <Stack spacing={1}>
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} variant="rounded" height={32} />
        ))}
      </Stack>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  const subjects = report?.subjects ?? [];
  const attendance = report?.attendance;
  const summary = report?.summary;

  return (
    <Box>
      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1.5 }}>
        {summary?.average_score != null && <Chip size="small" label={`Average: ${summary.average_score}`} />}
        {summary?.overall_position && <Chip size="small" label={`Position: ${summary.overall_position}`} />}
        {attendance && (
          <Chip size="small" label={`Attendance: ${attendance.present ?? 0}/${attendance.opened ?? 0}`} />
        )}
      </Stack>
      {subjects.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No subject results published for this term yet.
        </Typography>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Subject</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">
                Total
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">
                Grade
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {subjects.map((s, i) => (
              <TableRow key={s.subject_id || i}>
                <TableCell>{s.subject_name || '—'}</TableCell>
                <TableCell align="right">{s.overall_total ?? '—'}</TableCell>
                <TableCell align="center">
                  <Chip size="small" label={s.grade || '—'} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Box>
  );
};

LearnerAcademicsContent.propTypes = {
  learner: PropTypes.object,
};

export default LearnerAcademicsContent;
