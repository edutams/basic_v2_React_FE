import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Box, Typography, Stack, Avatar, Card, IconButton, Skeleton } from '@mui/material';
import { ChevronRight, ChevronLeft } from '@mui/icons-material';

const CARD_WIDTH = 260; // px – each ward card width
const CARD_GAP = 12;   // px – gap between cards

// Visual treatment per ward status (driven by the real backend status).
const STATUS_STYLES = {
  Enrolled:          { bg: '#F0FDF4', border: '#16A34A', pillBg: '#DCFCE7', pillColor: '#166534', pillBorder: '#86EFAC' },
  Admitted:          { bg: '#F0FDF4', border: '#16A34A', pillBg: '#DCFCE7', pillColor: '#166534', pillBorder: '#86EFAC' },
  Accepted:          { bg: '#F0FDF4', border: '#16A34A', pillBg: '#DCFCE7', pillColor: '#166534', pillBorder: '#86EFAC' },
  'Under Review':    { bg: '#FFFBEB', border: '#D97706', pillBg: '#FEF9C3', pillColor: '#854D0E', pillBorder: '#FDE68A' },
  Pending:           { bg: '#FFFBEB', border: '#D97706', pillBg: '#FEF9C3', pillColor: '#854D0E', pillBorder: '#FDE68A' },
  'In Progress':     { bg: '#F0F4FF', border: '#2563EB', pillBg: '#DBEAFE', pillColor: '#1E40AF', pillBorder: '#93C5FD' },
  'Pending Submission': { bg: '#F0F4FF', border: '#2563EB', pillBg: '#DBEAFE', pillColor: '#1E40AF', pillBorder: '#93C5FD' },
  Draft:             { bg: '#F8FAFC', border: '#94A3B8', pillBg: '#E2E8F0', pillColor: '#475569', pillBorder: '#CBD5E1' },
  Rejected:          { bg: '#FEF2F2', border: '#DC2626', pillBg: '#FEE2E2', pillColor: '#991B1B', pillBorder: '#FECACA' },
};
const DEFAULT_STATUS_STYLE = STATUS_STYLES.Draft;

const WardCard = ({ ward }) => {
  const style = STATUS_STYLES[ward.status] || DEFAULT_STATUS_STYLE;
  const balance = Number(ward.balance || 0);

  return (
    <Card
      elevation={0}
      sx={{
        width: { xs: 240, sm: CARD_WIDTH },
        minWidth: { xs: 240, sm: CARD_WIDTH },
        flexShrink: 0,
        borderRadius: '8px',
        bgcolor: style.bg,
        p: '14px',
        border: `1.5px solid ${style.border}`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.25,
        scrollSnapAlign: 'start',
      }}
    >
      {/* Top: avatar + info + badge */}
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <Avatar
          sx={{
            width: 46,
            height: 46,
            flexShrink: 0,
            bgcolor: style.pillBg,
            color: style.pillColor,
            fontWeight: 700,
            fontSize: '1.1rem',
          }}
        >
          {ward.name?.[0] || 'W'}
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
              bgcolor: style.pillBg,
              color: style.pillColor,
              fontSize: '0.68rem',
              fontWeight: 700,
              border: `1px solid ${style.pillBorder}`,
            }}
          >
            {ward.status}
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
          <Typography fontWeight="600" sx={{ fontSize: '0.75rem', color: '#111827' }}>{ward.status}</Typography>
        </Box>
        <Box textAlign="right">
          <Typography sx={{ fontSize: '0.62rem', color: '#9CA3AF', mb: 0.2, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Balance</Typography>
          <Typography fontWeight="700" sx={{ fontSize: '0.82rem', color: balance > 0 ? '#DC2626' : '#16A34A' }}>
            {balance === 0 ? '₦0' : `₦${balance.toLocaleString()}`}
          </Typography>
        </Box>
      </Stack>
    </Card>
  );
};

const MyWards = ({ wards = [], loading = false }) => {
  const [offset, setOffset] = useState(0);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const trackRef = useRef(null);

  // Reset the carousel scroll whenever the ward list changes.
  useEffect(() => {
    setOffset(0);
    if (trackRef.current) trackRef.current.scrollTo({ left: 0 });
  }, [wards.length]);

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
  }, [checkOverflow, wards.length]);

  const maxOffset = Math.max(0, wards.length - 1);

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

  if (loading) {
    return (
      <Box mb={2}>
        <Skeleton variant="text" width={120} height={24} sx={{ mb: 1.25 }} />
        <Box sx={{ display: 'flex', gap: `${CARD_GAP}px` }}>
          {[0, 1].map((i) => (
            <Skeleton key={i} variant="rounded" width={CARD_WIDTH} height={190} sx={{ borderRadius: '8px' }} />
          ))}
        </Box>
      </Box>
    );
  }

  return (
    <Box mb={2}>
      {/* Header */}
      <Typography fontWeight="700" sx={{ fontSize: '0.95rem', color: '#111827', mb: 1.25 }}>
        My Wards
      </Typography>

      {wards.length === 0 ? (
        /* Empty state */
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
        /* Slider */
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
              overflowX: { xs: 'auto', lg: 'hidden' },
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch',
              '&::-webkit-scrollbar': { display: 'none' },
              msOverflowStyle: 'none',
              scrollbarWidth: 'none',
              pb: { xs: 0.5, lg: 0 },
            }}
          >
            {wards.map((ward) => (
              <WardCard key={`${ward.kind}-${ward.id}`} ward={ward} />
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
      )}
    </Box>
  );
};

export default MyWards;
