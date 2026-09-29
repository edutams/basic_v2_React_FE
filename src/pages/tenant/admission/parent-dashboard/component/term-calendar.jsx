import React, { useState, useEffect } from 'react';
import { Box, Card, Typography, Stack, Skeleton } from '@mui/material';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import { fetchActiveSessionTerm } from '@/api/tenant/curriculum/tenantCurriculumApi';
import { getSessionTermWeeks } from '@/api/tenant/admission/admissionApi';

const fmtDate = (d) => {
  if (!d) return '—';
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return String(d);
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const TermCalendar = ({
  termName: propTermName,
  daysCount: propDaysCount,
  startDate: propStartDate,
  endDate: propEndDate,
  loading: propLoading,
}) => {
  const [internalData, setInternalData] = useState(null);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (propTermName) return;

    let mounted = true;
    const load = async () => {
      try {
        setFetching(true);
        const active = await fetchActiveSessionTerm();
        if (!mounted || !active?.status || !active?.data?.session_term_id) return;
        const { session_name, term_name, session_term_id } = active.data;

        const weeksRes = await getSessionTermWeeks(session_term_id);
        const weeks = (weeksRes?.data || []).filter((w) => w.start_date && w.end_date);
        if (!mounted || weeks.length === 0) return;

        const starts = weeks.map((w) => new Date(w.start_date).getTime());
        const ends = weeks.map((w) => new Date(w.end_date).getTime());
        const first = Math.min(...starts);
        const last = Math.max(...ends);
        const schoolDays = weeksRes?.school_days_count ?? 0;

        setInternalData({
          termName: `${session_name || ''} ${term_name || ''}`.trim(),
          daysCount: `${schoolDays} School Days`,
          startDate: fmtDate(
            weeks.find((w) => new Date(w.start_date).getTime() === first)?.start_date,
          ),
          endDate: fmtDate(weeks.find((w) => new Date(w.end_date).getTime() === last)?.end_date),
        });
      } catch (err) {
        console.error('Failed to load term calendar:', err);
      } finally {
        if (mounted) setFetching(false);
      }
    };
    load();

    return () => {
      mounted = false;
    };
  }, [propTermName]);

  const displayTermName = propTermName || internalData?.termName;
  const displayDaysCount = propDaysCount || internalData?.daysCount;
  const displayStartDate = propStartDate || internalData?.startDate;
  const displayEndDate = propEndDate || internalData?.endDate;
  const isLoading = propLoading || (fetching && !displayTermName);

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: '14px',
        bgcolor: '#ffffff',
        border: '1px solid #e2e8f0',
        p: 1.5,
        boxShadow: '0 4px 18px rgba(15, 23, 42, 0.08)',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
        },
      }}
    >
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
        <Box
          sx={{
            width: 30,
            height: 30,
            borderRadius: '7px',
            bgcolor: '#eff6ff',
            color: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CalendarMonthOutlinedIcon sx={{ fontSize: 17 }} />
        </Box>
        <Typography sx={{ fontWeight: 800, fontSize: 14, color: '#1e293b', whiteSpace: 'nowrap' }}>
          Term Calendar
        </Typography>
      </Stack>

      {/* Term Name & Days Badge */}
      {isLoading ? (
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
          <Skeleton variant="text" width={140} height={20} />
          <Skeleton variant="rounded" width={70} height={20} sx={{ borderRadius: '10px' }} />
        </Stack>
      ) : (
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
          <Typography sx={{ fontWeight: 800, fontSize: 12.5, color: '#0f172a', whiteSpace: 'nowrap' }}>
            {displayTermName || 'Current Session Term'}
          </Typography>
          {displayDaysCount && (
            <Box
              sx={{
                bgcolor: '#dcfce7',
                color: '#16a34a',
                px: 1,
                py: 0.25,
                borderRadius: '10px',
                fontSize: 10,
                fontWeight: 700,
                whiteSpace: 'nowrap',
              }}
            >
              {displayDaysCount}
            </Box>
          )}
        </Stack>
      )}

      {/* Start / End Dates Divider Row */}
      <Box
        sx={{
          bgcolor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '9px',
          p: 1.25,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography sx={{ fontSize: 10, color: '#64748b', fontWeight: 600, mb: 0.2 }}>
            Term Starts
          </Typography>
          {isLoading ? (
            <Skeleton variant="text" width={90} height={16} />
          ) : (
            <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap' }}>
              {displayStartDate || '—'}
            </Typography>
          )}
        </Box>
        <Box sx={{ height: 24, borderRight: '1px solid #cbd5e1' }} />
        <Box textAlign="right">
          <Typography sx={{ fontSize: 10, color: '#64748b', fontWeight: 600, mb: 0.2 }}>
            Expected End Date
          </Typography>
          {isLoading ? (
            <Skeleton variant="text" width={90} height={16} />
          ) : (
            <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap' }}>
              {displayEndDate || '—'}
            </Typography>
          )}
        </Box>
      </Box>
    </Card>
  );
};

export default TermCalendar;
