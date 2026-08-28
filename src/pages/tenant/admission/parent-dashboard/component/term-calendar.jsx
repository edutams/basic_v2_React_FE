import React from 'react';
import { Box, Card, Typography, Stack } from '@mui/material';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';

const TermCalendar = ({
  termName = '2024/2025 Harmattan Term',
  daysCount = '120 Days',
  startDate = 'Mon, 28 Oct 2024',
  endDate = 'Fri, 14 Feb 2025',
}) => {
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
        p: 1,
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
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
        <Typography sx={{ fontWeight: 800, fontSize: 12.5, color: '#0f172a', whiteSpace: 'nowrap' }}>
          {termName}
        </Typography>
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
          {daysCount}
        </Box>
      </Stack>

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
          <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap' }}>
            {startDate}
          </Typography>
        </Box>
        <Box sx={{ height: 24, borderRight: '1px solid #cbd5e1' }} />
        <Box textAlign="right">
          <Typography sx={{ fontSize: 10, color: '#64748b', fontWeight: 600, mb: 0.2 }}>
            Expected End Date
          </Typography>
          <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap' }}>
            {endDate}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
};

export default TermCalendar;
