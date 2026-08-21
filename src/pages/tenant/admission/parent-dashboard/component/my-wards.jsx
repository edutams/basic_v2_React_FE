import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Stack, Avatar, Card, Button, CircularProgress, IconButton, Skeleton, Tooltip, FormControl, MenuItem, Select } from '@mui/material';
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
  const navigate = useNavigate();

 

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
        {/* Header: Avatar + Name/Class (status sits below, aligned right) */}
        <Stack direction="row" spacing={1.25} alignItems="center">
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
                lineHeight: 1.25,
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
              }}
            >
              {ward.class}
              {/* {ward.admissionNo && ` • ${ward.admissionNo}`} */}
          {ward.age != null && ` • Age: ${ward.age} yrs`}
            </Typography>
            {/* {ward.session && (
                <Typography
                  sx={{
                    fontSize: 9.5,
                    color: '#64748b',
                    fontWeight: 600,
                    mt: 0.25,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {ward.session}
                </Typography>
              )} */}
          </Box>
        </Stack>

        {/* Status — below the class section, aligned right */}
        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 1 }}>
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

        {/* Gauges Row — solid border separator above */}
        <Box sx={{ borderTop: '1px solid #e2e8f0', mt: 1.5, pt: 1.5, mb: 1.5 }}>
          <Stack direction="row" spacing={1}>
            <GaugeRing value={ward.attendance} label="Attendance" color="#16a34a" />
            <Box sx={{ borderLeft: '1px solid #e2e8f0', pl: 1, mx: 0.5 }} />
            <GaugeRing value={ward.averageScore} label="Avg Score" color="#2563eb" />
          </Stack>
        </Box>

        {/* Financial Info — single total payable figure from the wards payload */}
        <Box sx={{ borderTop: '1px solid #e2e8f0', pt: 1.25, mb: 1.5 }}>
          <Typography sx={{ fontSize: 9.5, fontWeight: 700, color: '#64748b', letterSpacing: 0.3 }}>
            TOTAL PAYABLE
          </Typography>
          <Typography
            sx={{
              fontSize: 16,
              fontWeight: 800,
              color: '#16a34a',
              lineHeight: 1.2,
              mt: 0.2,
              whiteSpace: 'nowrap',
            }}
          >
            ₦{Number(ward.paid).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </Typography>
        </Box>

        {ward.walletAccount ? (
          <Box sx={{ mb: 1.5 }}>
            <Stack direction="row" alignItems="stretch" spacing={1.25}>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: 9.5, fontWeight: 700, color: '#64748b', letterSpacing: 0.3 }}>
                  WALLET ACCOUNT
                </Typography>
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: '#1e293b',
                    lineHeight: 1.2,
                    mt: 0.15,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {ward.walletAccount}
                </Typography>
              </Box>
              {ward.walletBalance != null && (
                <>
                  <Box sx={{ alignSelf: 'stretch', borderRight: '1px solid #e2e8f0', my: 0.2, flexShrink: 0 }} />
                  <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
                    <Typography sx={{ fontSize: 10, color: '#64748b', fontWeight: 500, lineHeight: 1.2 }}>
                      ₦{Number(ward.walletBalance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </Typography>
                  </Box>
                </>
              )}
            </Stack>
          </Box>
        ) : (
          <Box
            sx={{
              mb: 1.5,
              bgcolor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '9px',
              px: 1.25,
              py: 0.75,
            }}
          >
            <Typography sx={{ fontSize: 10.5, fontWeight: 600, color: '#1d4ed8', lineHeight: 1.4 }}>
              ℹ️ A wallet account has not been generated for {ward.name.split(' ')[0]} make payment to generate.
            </Typography>
          </Box>
        )}
      </Box>

      {/* Action Buttons */}
      <Stack direction="row" spacing={0.75}>
        <Tooltip
          title={
            ward.invoice_number
              ? `View invoice for ${ward.name}`
              : 'No invoice generated yet. Go to Class Ledger to generate one.'
          }
          placement="top"
          arrow
        >
          <Box sx={{ flex: 1 }}>
            <Button
              variant="outlined"
              size="small"
              disabled={!ward.invoice_number}
              startIcon={<DescriptionOutlinedIcon sx={{ fontSize: 14 }} />}
              onClick={() =>
                ward.invoice_number
                  ? navigate(`/class-ledger/${ward.invoice_number}/${ward.id}/pay-invoice`)
                  : undefined
              }
              sx={{
                width: '100%',
                borderRadius: '7px',
                textTransform: 'none',
                fontSize: 10.5,
                fontWeight: 700,
                color: '#1d4ed8',
                borderColor: '#bfdbfe',
                px: 0.75,
                py: 0.4,
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: '#2563eb',
                  bgcolor: '#eff6ff',
                  color: '#1d4ed8',
                },
                '&.Mui-disabled': {
                  bgcolor: '#f1f5f9',
                  color: '#94a3b8',
                  borderColor: '#e2e8f0',
                },
              }}
            >
              View Invoice
            </Button>
          </Box>
        </Tooltip>
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
            bgcolor: '#2563eb',
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

const MyWards = ({
  wards = [],
  loading = false,
  selectedWard,
  onSelectWard,
  sessionTerms = [],
  selectedSessionTerm = '',
  onSessionTermChange,
}) => {
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
    <Box mb={2.5} height="100%">
      {/* Wrapper panel wrapping the title, session-term filter, prev/next controls and the ward cards */}
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          p: 1.5,
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.08)',
        }}
      >
        {/* Header with Title, Session-Term Filter, and Prev/Next Navigation Controls */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.25}>
            <Typography sx={{ fontWeight: 800, fontSize: 16, color: '#1e293b', letterSpacing: -0.3 }}>
              My Wards
            </Typography>

            <Stack
              direction="row"
              spacing={0.75}
              alignItems="center"
              sx={{ flexWrap: 'wrap', justifyContent: 'flex-end', rowGap: 0.75 }}
            >
              <FormControl size="small" sx={{ minWidth: { xs: 130, sm: 170 }, maxWidth: 230 }}>
                <Select
                  value={selectedSessionTerm}
                  onChange={(e) => onSessionTermChange && onSessionTermChange(e.target.value)}
                  sx={{
                    borderRadius: '7px',
                    fontSize: 11.5,
                    fontWeight: 700,
                    color: '#1e293b',
                    bgcolor: '#ffffff',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#cbd5e1' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#94a3b8' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#2563eb' },
                  }}
                  MenuProps={{ PaperProps: { sx: { maxHeight: 260 } } }}
                >
                  {sessionTerms.map((t) => (
                    <MenuItem key={t.id} value={t.id} sx={{ fontSize: 12.5 }}>
                      {t.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

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

          {wards.length > 0 ? (
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
            {visibleWards.map((ward, index) => (
              <WardCard
                key={`${ward.id}-${ward.className || ward.class || ward.session_term_id || index}`}
                ward={ward}
                isSelected={selectedWard?.id === ward.id && selectedWard?.class === ward.class}
                onSelect={onSelectWard}
              />
            ))}
          </Box>
        ) : (
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
        )}
      </Box>
    </Box>
  );
};

export default MyWards;
