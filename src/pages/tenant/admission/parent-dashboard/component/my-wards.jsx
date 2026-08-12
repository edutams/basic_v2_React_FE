import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Box, Typography, Stack, Avatar, Card, Select, MenuItem, IconButton } from '@mui/material';
import { ChevronRight, ChevronLeft } from '@mui/icons-material';

const CARD_WIDTH = 260; // px – each ward card width
const CARD_GAP = 12;   // px – gap between cards

const mockWards = [
  {
    id: '1',
    name: 'Chinedu Adenubi',
    className: 'JSS 2A',
    session: '2024/2025 Session',
    topStatus: 'Active',
    isSuccess: true,
    admissionNo: 'ADM/22/0158',
    bottomStatus: 'Enrolled',
    balance: 35000,
    bgColor: '#F0F4FF',
    borderColor: '#2563EB',
  },
  {
    id: '2',
    name: 'Amaka Adenubi',
    className: 'Primary 4B',
    session: '2024/2025 Session',
    topStatus: 'Pending',
    isSuccess: false,
    admissionNo: 'ADM/24/0784',
    bottomStatus: 'Pending',
    balance: 15000,
    bgColor: '#FFFBEB',
    borderColor: '#D97706',
  },
  {
    id: '3',
    name: 'Kelechi Adenubi',
    className: 'Nursery 2',
    session: '2024/2025 Session',
    topStatus: 'Admitted',
    isSuccess: true,
    admissionNo: 'ADM/25/1021',
    bottomStatus: 'Accepted',
    balance: 0,
    bgColor: '#F0FDF4',
    borderColor: '#16A34A',
  },
];

const WardCard = ({ ward }) => (
  <Card
    elevation={0}
    sx={{
      width: CARD_WIDTH,
      flexShrink: 0,
      borderRadius: '8px',
      bgcolor: ward.bgColor,
      p: '14px',
      border: `1.5px solid ${ward.borderColor}`,
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      display: 'flex',
      flexDirection: 'column',
      gap: 1.25,
    }}
  >
    {/* Top: avatar + info + badge */}
    <Stack direction="row" spacing={1.5} alignItems="flex-start">
      <Avatar
        sx={{
          width: 46,
          height: 46,
          flexShrink: 0,
          bgcolor: '#CBD5E1',
          color: '#1E293B',
          fontWeight: 700,
          fontSize: '1.1rem',
        }}
      >
        {ward.name[0]}
      </Avatar>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography fontWeight="700" sx={{ fontSize: '0.85rem', color: '#111827', lineHeight: 1.3, mb: 0.2 }}>
          {ward.name}
        </Typography>
        <Typography sx={{ fontSize: '0.75rem', color: '#4B5563', mb: 0.15 }}>{ward.className}</Typography>
        <Typography sx={{ fontSize: '0.72rem', color: '#9CA3AF', mb: 0.6 }}>{ward.session}</Typography>
        {/* Status pill */}
        <Box
          component="span"
          sx={{
            display: 'inline-block',
            px: 1,
            py: 0.2,
            borderRadius: '20px',
            bgcolor: ward.isSuccess ? '#DCFCE7' : '#FEF9C3',
            color: ward.isSuccess ? '#166534' : '#854D0E',
            fontSize: '0.68rem',
            fontWeight: 700,
            border: `1px solid ${ward.isSuccess ? '#86EFAC' : '#FDE68A'}`,
          }}
        >
          {ward.topStatus}
        </Box>
      </Box>
    </Stack>

    {/* Divider */}
    <Box sx={{ borderTop: '1px dashed #D1D5DB' }} />

    {/* Bottom stats */}
    <Stack direction="row" justifyContent="space-between">
      <Box>
        <Typography sx={{ fontSize: '0.62rem', color: '#9CA3AF', mb: 0.2, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Admission No.</Typography>
        <Typography fontWeight="600" sx={{ fontSize: '0.75rem', color: '#111827' }}>{ward.admissionNo}</Typography>
      </Box>
      <Box>
        <Typography sx={{ fontSize: '0.62rem', color: '#9CA3AF', mb: 0.2, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Status</Typography>
        <Typography fontWeight="600" sx={{ fontSize: '0.75rem', color: '#111827' }}>{ward.bottomStatus}</Typography>
      </Box>
      <Box textAlign="right">
        <Typography sx={{ fontSize: '0.62rem', color: '#9CA3AF', mb: 0.2, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Balance</Typography>
        <Typography fontWeight="700" sx={{ fontSize: '0.82rem', color: ward.balance > 0 ? '#DC2626' : '#16A34A' }}>
          {ward.balance === 0 ? '₦0' : `₦${ward.balance.toLocaleString()}`}
        </Typography>
      </Box>
    </Stack>
  </Card>
);

const MyWards = () => {
  const [filter, setFilter] = useState('All Wards (3)');
  const [offset, setOffset] = useState(0);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const trackRef = useRef(null);

  // Recompute whether the track overflows its container
  const checkOverflow = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    checkOverflow();
    const ro = new ResizeObserver(checkOverflow);
    ro.observe(el);
    el.addEventListener('scroll', checkOverflow, { passive: true });
    return () => {
      ro.disconnect();
      el.removeEventListener('scroll', checkOverflow);
    };
  }, [checkOverflow]);

  const maxOffset = Math.max(0, mockWards.length - 1);

  const scrollTo = (newOffset) => {
    const clamped = Math.max(0, Math.min(newOffset, maxOffset));
    setOffset(clamped);
    if (trackRef.current) {
      trackRef.current.scrollTo({
        left: clamped * (CARD_WIDTH + CARD_GAP),
        behavior: 'smooth',
      });
    }
  };

  return (
    <Box mb={2}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.25}>
        <Typography fontWeight="700" sx={{ fontSize: '0.95rem', color: '#111827' }}>
          My Wards
        </Typography>
        <Select
          size="small"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          sx={{
            bgcolor: '#fff',
            borderRadius: '8px',
            minWidth: 130,
            height: 30,
            fontSize: '0.78rem',
            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#D1D5DB' },
          }}
        >
          <MenuItem value="All Wards (3)" sx={{ fontSize: '0.78rem' }}>All Wards (3)</MenuItem>
          <MenuItem value="Active" sx={{ fontSize: '0.78rem' }}>Active</MenuItem>
          <MenuItem value="Pending" sx={{ fontSize: '0.78rem' }}>Pending</MenuItem>
        </Select>
      </Stack>

      {/* Slider */}
      <Box sx={{ position: 'relative' }}>
        {/* Left arrow */}
        {offset > 0 && (
          <IconButton
            size="small"
            onClick={() => scrollTo(offset - 1)}
            sx={{
              position: 'absolute',
              left: -14,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              bgcolor: '#fff',
              border: '1.5px solid #E5E7EB',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              width: 28,
              height: 28,
              minWidth: 0,
              p: 0,
              borderRadius: '50%',
              '&:hover': { bgcolor: '#F9FAFB' },
            }}
          >
            <ChevronLeft sx={{ fontSize: 18, color: '#374151' }} />
          </IconButton>
        )}

        {/* Card track — hidden scrollbar, controlled by JS */}
        <Box
          ref={trackRef}
          sx={{
            display: 'flex',
            gap: `${CARD_GAP}px`,
            overflow: 'hidden',
          }}
        >
          {mockWards.map((ward) => (
            <WardCard key={ward.id} ward={ward} />
          ))}
        </Box>

        {/* Right arrow */}
        {canScrollRight && (
          <IconButton
            size="small"
            onClick={() => scrollTo(offset + 1)}
            sx={{
              position: 'absolute',
              right: -14,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              bgcolor: '#fff',
              border: '1.5px solid #E5E7EB',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              width: 28,
              height: 28,
              minWidth: 0,
              p: 0,
              borderRadius: '50%',
              '&:hover': { bgcolor: '#F9FAFB' },
            }}
          >
            <ChevronRight sx={{ fontSize: 18, color: '#374151' }} />
          </IconButton>
        )}
      </Box>
    </Box>
  );
};

export default MyWards;
