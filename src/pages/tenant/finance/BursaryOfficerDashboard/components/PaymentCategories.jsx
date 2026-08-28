import React from 'react';
import { Box, Typography, Stack, useTheme } from '@mui/material';
import {
  Groups,
  School,
  PersonAdd,
  CardGiftcard,
  VolunteerActivism,
  FamilyRestroom,
  Loyalty,
  MoreHoriz,
} from '@mui/icons-material';
import { formatCurrency } from '../constants';

const CATEGORY_META = [
  { icon: School, color: '#3B82F6', bg: '#EBF5FF' },
  { icon: PersonAdd, color: '#10B981', bg: '#ECFDF5' },
  { icon: CardGiftcard, color: '#F59E0B', bg: '#FFFBEB' },
  { icon: VolunteerActivism, color: '#8B5CF6', bg: '#F5F3FF' },
  { icon: Groups, color: '#6366F1', bg: '#EEF2FF' },
  { icon: FamilyRestroom, color: '#EC4899', bg: '#FDF2F8' },
  { icon: Loyalty, color: '#EF4444', bg: '#FEF2F2' },
  { icon: MoreHoriz, color: '#6B7280', bg: '#F9FAFB' },
];

/**
 * Payment Categories — list of categories with colored icon, amount and share.
 * Matches the design: clean list with icon circles, bold amounts, and percentages.
 */
const PaymentCategories = ({
  payment_categories = [],
}) => {
  const catData = payment_categories;
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 420,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '14px',
        border: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#cbd5e1',
        bgcolor: isDark ? theme.palette.background.paper : '#fff',
        boxShadow: '0 2px 4px rgba(15, 23, 42, 0.05), 0 12px 24px rgba(15, 23, 42, 0.1)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 1,
          py: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Groups sx={{ fontSize: 18, color: '#6366F1' }} />
          <Typography fontWeight={800} sx={{ fontSize: '0.82rem', color: '#111827', letterSpacing: 0.3 }}>
            Payment Categories
          </Typography>
        </Box>

      </Box>
      <Box sx={{ mx: 1, borderTop: '1px solid #E5E7EB' }} />

      {/* List */}
      <Stack spacing={0} sx={{ flexGrow: 1, px: 1, py: 0.5 }}>
        {catData.length > 0 ? (
          catData.map((cat, i) => {
            const meta = CATEGORY_META[i % CATEGORY_META.length];
            const CatIcon = meta.icon;
            return (
              <Box
                key={i}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  py: 1.25,
                  borderBottom: i < catData.length - 1 ? '1px solid #F3F4F6' : 'none',
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '10px',
                    bgcolor: isDark ? 'rgba(255,255,255,0.08)' : meta.bg,
                    color: isDark ? '#fff' : meta.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <CatIcon sx={{ fontSize: 18 }} />
                </Box>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  noWrap
                  sx={{ flex: 1, minWidth: 0, fontSize: '0.78rem', color: '#374151' }}
                >
                  {cat.category}
                </Typography>
                <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                  <Typography
                    variant="subtitle2"
                    fontWeight={800}
                    whiteSpace="nowrap"
                    sx={{ fontSize: '0.82rem', color: '#111827' }}
                  >
                    {formatCurrency(cat.amount)}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      fontSize: '0.65rem',
                      color: cat.percentage >= 10 ? '#3B82F6' : '#9CA3AF',
                      fontWeight: cat.percentage >= 10 ? 700 : 500,
                    }}
                  >
                    {cat.percentage}%
                  </Typography>
                </Box>
              </Box>
            );
          })
        ) : (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No payment category data available
            </Typography>
          </Box>
        )}
      </Stack>
    </Box>
  );
};

export default PaymentCategories;
