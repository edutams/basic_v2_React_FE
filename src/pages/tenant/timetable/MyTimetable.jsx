import React, { useState, useEffect, useCallback } from 'react';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import ParentCard from '@/components/shared/ParentCard';
import { useNotification } from '@/hooks/useNotification';
import timetableApi from '@/api/tenant/timetable/timetableApi';
import { Typography, Table, TableHead, TableRow, TableCell, TableBody, Chip, Skeleton, Alert } from '@mui/material';

const BCrumb = [{ to: '/school-dashboard', title: 'Home' }, { title: 'My Timetable' }];
const SUBJECT_FALLBACK_COLOR = '#64748B';

/**
 * Shared teacher/learner "my timetable" page — the backend's
 * GET /timetable/my-schedule resolves which one to return server-side.
 * A teacher's schedule is a flat list of their assigned periods (no
 * breaks); a learner's is their class arm's full period grid (including
 * breaks and unassigned periods) — detected here by shape, not by role,
 * so this one page serves both.
 */
const MyTimetable = () => {
  const notify = useNotification();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSchedule = useCallback(async () => {
    setLoading(true);
    try {
      const res = await timetableApi.getMySchedule();
      setRows(res.data.data || []);
    } catch {
      notify.error('Failed to load your timetable');
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const isTeacherShape = rows.length > 0 && 'slot_id' in rows[0];

  return (
    <PageContainer title="My Timetable" description="Your weekly teaching or class schedule.">
      <Breadcrumb title="My Timetable" items={BCrumb} />

      <ParentCard title={<Typography variant="h5">My Timetable</Typography>}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Period</TableCell>
              <TableCell>Subject</TableCell>
              {isTeacherShape && <TableCell>Class</TableCell>}
              <TableCell>Room</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={4}>
                    <Skeleton variant="text" height={28} />
                  </TableCell>
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Alert severity="info" sx={{ justifyContent: 'center' }}>
                    No timetable has been set up for you yet.
                  </Alert>
                </TableCell>
              </TableRow>
            ) : isTeacherShape ? (
              rows.map((row) => (
                <TableRow key={row.slot_id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {row.period.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {row.period.start_time?.slice(0, 5)} - {row.period.end_time?.slice(0, 5)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={row.subject_name} sx={{ bgcolor: row.subject_color || SUBJECT_FALLBACK_COLOR, color: '#fff', fontWeight: 700 }} />
                  </TableCell>
                  <TableCell>{row.class_name}</TableCell>
                  <TableCell>{row.room_name || '—'}</TableCell>
                </TableRow>
              ))
            ) : (
              rows.map((row) =>
                row.period.is_break ? (
                  <TableRow key={row.period.id}>
                    <TableCell colSpan={3} align="center" sx={{ bgcolor: 'warning.light', color: 'warning.dark', fontWeight: 700, py: 0.75 }}>
                      {row.period.label} — {row.period.start_time?.slice(0, 5)} - {row.period.end_time?.slice(0, 5)}
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow key={row.period.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {row.period.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {row.period.start_time?.slice(0, 5)} - {row.period.end_time?.slice(0, 5)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {row.slot ? (
                        <Chip
                          size="small"
                          label={row.slot.subject_name}
                          sx={{ bgcolor: row.slot.subject_color || SUBJECT_FALLBACK_COLOR, color: '#fff', fontWeight: 700 }}
                        />
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          Free period
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{row.slot?.room_name || '—'}</TableCell>
                  </TableRow>
                ),
              )
            )}
          </TableBody>
        </Table>
      </ParentCard>
    </PageContainer>
  );
};

export default MyTimetable;
