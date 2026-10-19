import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PageContainer from '@/components/container/PageContainer';
import { useNotification } from '@/hooks/useNotification';
import timetableApi from '@/api/tenant/timetable/timetableApi';
import {
  Box,
  Stack,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Skeleton,
  Alert,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import ChartBarIcon from '@mui/icons-material/BarChart';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const rateColor = (rate) => (rate >= 70 ? '#16A34A' : rate >= 40 ? '#D97706' : '#DC2626');

/**
 * Principal/school-owner view of who's reliably confirming their classes —
 * every subject teacher's real attended/cancelled/not-confirmed count over
 * the trailing 5-school-week window, worst rate first. Backed by the same
 * timetable_occurrences data each teacher's own My Timetable reports from.
 */
const AttendanceComplianceReport = () => {
  const notify = useNotification();
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const res = await timetableApi.getAttendanceComplianceReport();
      setReport(res.data.data || []);
    } catch {
      notify.error('Failed to load the attendance compliance report');
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const averageRate = useMemo(() => {
    if (!report.length) return 0;
    return Math.round(report.reduce((sum, r) => sum + r.rate, 0) / report.length);
  }, [report]);

  return (
    <PageContainer title="Attendance Compliance Report" description="Which teachers are reliably confirming their scheduled classes.">
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5 }}>
        <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: '#2563EB', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <ChartBarIcon />
        </Box>
        <Box>
          <Typography variant="h5" fontWeight={800}>
            Attendance Compliance Report
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Which teachers are reliably confirming their scheduled classes, over the last 5 school weeks.
          </Typography>
        </Box>
      </Stack>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.5, mb: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="subtitle2" fontWeight={800}>
            School-wide average: {loading ? <Skeleton component="span" width={40} /> : `${averageRate}%`}
          </Typography>
          <Tooltip title="Average of every subject teacher's own attended/(attended+cancelled+not-confirmed) rate over the last 5 school weeks, up to today. Sorted worst rate first below, so whoever needs follow-up is at the top.">
            <InfoOutlinedIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
          </Tooltip>
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.5 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Teacher</TableCell>
              <TableCell align="center">Attended</TableCell>
              <TableCell align="center">Cancelled</TableCell>
              <TableCell align="center">Not Confirmed</TableCell>
              <TableCell align="center">Total</TableCell>
              <TableCell sx={{ minWidth: 160 }}>Rate</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6}>
                    <Skeleton variant="text" height={28} />
                  </TableCell>
                </TableRow>
              ))
            ) : report.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Alert severity="info" sx={{ justifyContent: 'center' }}>
                    No subject teachers have any timetable periods assigned this term yet.
                  </Alert>
                </TableCell>
              </TableRow>
            ) : (
              report.map((row) => (
                <TableRow key={row.user_id}>
                  <TableCell sx={{ fontWeight: 700 }}>{row.teacher_name}</TableCell>
                  <TableCell align="center">{row.attended}</TableCell>
                  <TableCell align="center">{row.cancelled}</TableCell>
                  <TableCell align="center">{row.not_confirmed}</TableCell>
                  <TableCell align="center">{row.total}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <LinearProgress
                        variant="determinate"
                        value={row.rate}
                        sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: 'grey.200', '& .MuiLinearProgress-bar': { bgcolor: rateColor(row.rate), borderRadius: 3 } }}
                      />
                      <Typography variant="caption" fontWeight={800} sx={{ color: rateColor(row.rate), minWidth: 32 }}>
                        {row.rate}%
                      </Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>
    </PageContainer>
  );
};

export default AttendanceComplianceReport;
