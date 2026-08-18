import React, { useState } from 'react';
import { Box, Typography, Stack, Avatar, Card, Button, CircularProgress, IconButton, Skeleton } from '@mui/material';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

function GaugeRing({ value, label, color }) {
  return (
    <Stack direction="row" alignItems="center" spacing={0.8} sx={{ flex: 1, minWidth: 0 }}>
      <Box sx={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
        <CircularProgress
          variant="determinate"
          value={100}
          size={32}
          thickness={4.5}
          sx={{ color: '#e2e8f0' }}
        />
        <CircularProgress
          variant="determinate"
          value={value}
          size={32}
          thickness={4.5}
          sx={{
            color,
            position: 'absolute',
            left: 0,
            '& .MuiCircularProgress-circle': { strokeLinecap: 'round' },
          }}
        />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: 9.5,
            color: '#64748b',
            fontWeight: 600,
            lineHeight: 1.1,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {label}
        </Typography>
        <Typography sx={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a', lineHeight: 1.1, mt: 0.1 }}>
          {value}%
        </Typography>
      </Box>
    </Stack>
  );
}

const initialsOf = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'W';

const WardCard = ({ ward, onSelect, isSelected }) => {
  return (
    <Card
      elevation={0}
      onClick={() => onSelect && onSelect(ward)}
      sx={{
        width: '100%',
        borderRadius: '12px',
        border: '1.5px solid',
        borderColor: isSelected ? '#dc2626' : '#e2e8f0',
        bgcolor: isSelected ? '#fff5f5' : '#ffffff',
        p: 1.75,
        boxShadow: isSelected ? '0 4px 16px rgba(220, 38, 38, 0.12)' : '0 4px 16px rgba(15, 23, 42, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
        },
      }}
    >
      <Box>
        {/* Header: Avatar, Name, Class/Age, Status */}
        <Stack direction="row" spacing={1.25} alignItems="flex-start" justifyContent="space-between">
          <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
            <Avatar
              src={ward.avatar}
              alt={ward.name}
              sx={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                flexShrink: 0,
                border: isSelected ? '2px solid #dc2626' : '2px solid transparent',
                bgcolor: ward.statusBg || '#dbeafe',
                color: ward.statusColor || '#2563eb',
                fontSize: 15,
                fontWeight: 700,
              }}
            >
              {!ward.avatar && initialsOf(ward.name)}
            </Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: 13.5,
                  color: '#1e293b',
                  lineHeight: 1.2,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {ward.name}
              </Typography>
              <Typography
                sx={{
                  fontSize: 11,
                  color: '#64748b',
                  fontWeight: 500,
                  mt: 0.2,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {ward.class}
                {ward.age != null ? ` &nbsp;•&nbsp; Age: ${ward.age} years` : ''}
              </Typography>
            </Box>
          </Stack>
          <Box
            sx={{
              bgcolor: ward.statusBg,
              color: ward.statusColor,
              px: 1,
              py: 0.2,
              borderRadius: '10px',
              fontSize: 10.5,
              fontWeight: 700,
              flexShrink: 0,
              whiteSpace: 'nowrap',
            }}
          >
            {ward.status}
          </Box>
        </Stack>

        {/* Gauges Row */}
        <Stack direction="row" spacing={1} sx={{ mt: 1.75, mb: 1.5 }}>
          <GaugeRing value={ward.attendance ?? 0} label="Attendance" color={ward.attendanceColor} />
          <GaugeRing value={ward.averageScore ?? 0} label="Average Score" color={ward.scoreColor} />
        </Stack>

        {/* Financial Info */}
        <Box sx={{ borderTop: '1px dashed #e2e8f0', pt: 1.25, mb: 1.5 }}>
          <Typography sx={{ fontSize: 9.5, fontWeight: 700, color: '#64748b', letterSpacing: 0.3 }}>
            TOTAL PAYABLE
          </Typography>
          <Typography
            sx={{
              fontSize: 16,
              fontWeight: 800,
              color: Number(ward.totalPayable || 0) > 0 ? '#ea580c' : '#16a34a',
              lineHeight: 1.2,
              mt: 0.2,
              whiteSpace: 'nowrap',
            }}
          >
            ₦{Number(ward.totalPayable || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </Typography>
          {ward.walletAccount || ward.bank ? (
            <Typography
              sx={{
                fontSize: 10,
                color: '#64748b',
                fontWeight: 500,
                mt: 0.4,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              Wallet Account: <Box component="span" sx={{ color: '#1e293b', fontWeight: 600 }}>{ward.walletAccount}</Box>
              {ward.bank ? ` &nbsp;|&nbsp; ${ward.bank}` : ''}
            </Typography>
          ) : null}
        </Box>
      </Box>

      {/* Action Buttons */}
      <Stack direction="row" spacing={0.75}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<DescriptionOutlinedIcon sx={{ fontSize: 14 }} />}
          sx={{
            flex: 1,
            borderRadius: '7px',
            textTransform: 'none',
            fontSize: 10.5,
            fontWeight: 700,
            color: '#334155',
            borderColor: '#cbd5e1',
            px: 0.75,
            py: 0.4,
            whiteSpace: 'nowrap',
            '&:hover': { borderColor: '#94a3b8', bgcolor: '#f8fafc' },
          }}
        >
          View Invoice
        </Button>
        <Button
          variant="contained"
          size="small"
          disableElevation
          startIcon={<AddCircleOutlineIcon sx={{ fontSize: 14 }} />}
          sx={{
            flex: 1,
            borderRadius: '7px',
            textTransform: 'none',
            fontSize: 10.5,
            fontWeight: 700,
            bgcolor: ward.buttonColor,
            color: '#ffffff',
            px: 0.75,
            py: 0.4,
            whiteSpace: 'nowrap',
            '&:hover': { opacity: 0.9 },
          }}
        >
          Fund Wallet
        </Button>
      </Stack>
    </Card>
  );
};

const MyWards = ({ wards = [], loading = false, selectedWard, onSelectWard }) => {
  const [startIndex, setStartIndex] = useState(0);

  const VISIBLE_COUNT = 3;
  const canPrev = startIndex > 0;
  const canNext = startIndex + VISIBLE_COUNT < wards.length;

  const handlePrev = () => {
    if (canPrev) setStartIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    if (canNext) setStartIndex((prev) => prev + 1);
  };

  const visibleWards = wards.slice(startIndex, startIndex + VISIBLE_COUNT);

  if (loading) {
    return (
      <Box mb={2.5}>
        <Skeleton variant="text" width={120} height={24} sx={{ mb: 1.5 }} />
        <Stack direction="row" spacing={2}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} variant="rounded" width="33%" height={240} sx={{ borderRadius: '12px' }} />
          ))}
        </Stack>
      </Box>
    );
  }

  return (
    <Box mb={2.5}>
      {/* Header with Title and Prev/Next Navigation Controls */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.25}>
        <Typography sx={{ fontWeight: 800, fontSize: 16, color: '#1e293b', letterSpacing: -0.3 }}>
          My Wards
        </Typography>

        <Stack direction="row" spacing={0.75} alignItems="center">
          <IconButton
            size="small"
            onClick={handlePrev}
            disabled={!canPrev}
            sx={{
              width: 30,
              height: 30,
              borderRadius: '7px',
              bgcolor: '#ffffff',
              border: '1px solid #cbd5e1',
              color: canPrev ? '#1e293b' : '#94a3b8',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              '&:hover': { bgcolor: '#f8fafc' },
              '&.Mui-disabled': { opacity: 0.4 },
            }}
          >
            <ChevronLeftIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <IconButton
            size="small"
            onClick={handleNext}
            disabled={!canNext}
            sx={{
              width: 30,
              height: 30,
              borderRadius: '7px',
              bgcolor: '#ffffff',
              border: '1px solid #cbd5e1',
              color: canNext ? '#1e293b' : '#94a3b8',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              '&:hover': { bgcolor: '#f8fafc' },
              '&.Mui-disabled': { opacity: 0.4 },
            }}
          >
            <ChevronRightIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Stack>
      </Stack>

      {wards.length === 0 ? (
        /* Empty state — never show mock data */
        <Box
          sx={{
            border: '1.5px dashed #D1D5DB',
            borderRadius: '10px',
            py: 5,
            textAlign: 'center',
            bgcolor: '#F9FAFB',
          }}
        >
          <Typography sx={{ fontSize: '0.85rem', color: '#6B7280', fontWeight: 600 }}>
            No wards here yet
          </Typography>
          <Typography sx={{ fontSize: '0.72rem', color: '#9CA3AF', mt: 0.25 }}>
            Wards linked to your account will appear here.
          </Typography>
        </Box>
      ) : (
        /* Grid displaying exactly 3 ward cards per view */
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            },
            gap: 1.5,
          }}
        >
          {visibleWards.map((ward) => (
            <WardCard
              key={ward.id}
              ward={ward}
              isSelected={selectedWard?.id === ward.id}
              onSelect={onSelectWard}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default MyWards;
