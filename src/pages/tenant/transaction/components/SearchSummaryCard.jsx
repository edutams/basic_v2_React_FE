import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, LinearProgress, Divider, Skeleton, useTheme } from '@mui/material';

const money = (n) => `₦${Number(n || 0).toLocaleString()}`;

const BreakdownRow = ({ label, color, amount, count, pct }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color }} />
          <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{label}</Typography>
        </Box>
        <Typography sx={{ fontWeight: 700, fontSize: 14, color }}>{pct}%</Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{
          height: 8,
          borderRadius: 10,
          bgcolor: isDark ? '#2A2A2A' : '#E5E7EB',
          mb: 0.75,
          '& .MuiLinearProgress-bar': { borderRadius: 10, bgcolor: color },
        }}
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="caption" color="text.secondary">
          {count} item{count === 1 ? '' : 's'}
        </Typography>
        <Typography variant="caption" fontWeight={600}>
          {money(amount)}
        </Typography>
      </Box>
    </Box>
  );
};

// A side card next to a filterable revenue/settlement/reconciliation table,
// summarizing whatever the current filters/search matched — across the
// whole filtered result set (every page), not just the rows on screen.
const SearchSummaryCard = ({
  title = 'Search Summary',
  totalAmount = 0,
  totalCount = 0,
  totalCountLabel = 'revenue item',
  compulsory = { amount: 0, count: 0, pct: 0 },
  optional = { amount: 0, count: 0, pct: 0 },
  loading = false,
}) => {
  if (loading) {
    return (
      <Box>
        <Skeleton width="60%" height={20} sx={{ mb: 2 }} />
        <Skeleton height={40} sx={{ mb: 2 }} />
        <Skeleton height={60} sx={{ mb: 2 }} />
        <Skeleton height={60} />
      </Box>
    );
  }

  return (
    <Box>
      <Typography
        sx={{ fontSize: 12, letterSpacing: 2, fontWeight: 700, color: '#6B7280', mb: 1.5 }}
      >
        {title.toUpperCase()}
      </Typography>

      <Box sx={{ mb: 2.5 }}>
        <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#6B7280', mb: 0.5 }}>
          TOTAL AMOUNT
        </Typography>
        <Typography variant="h5" fontWeight={700}>
          {money(totalAmount)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {totalCount} {totalCountLabel}
          {totalCount === 1 ? '' : 's'} matched
        </Typography>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <BreakdownRow
        label="Compulsory"
        color="#16A34A"
        amount={compulsory.amount}
        count={compulsory.count}
        pct={compulsory.pct}
      />
      <BreakdownRow
        label="Optional"
        color="#D97706"
        amount={optional.amount}
        count={optional.count}
        pct={optional.pct}
      />
    </Box>
  );
};

SearchSummaryCard.propTypes = {
  title: PropTypes.string,
  totalAmount: PropTypes.number,
  totalCount: PropTypes.number,
  totalCountLabel: PropTypes.string,
  compulsory: PropTypes.shape({
    amount: PropTypes.number,
    count: PropTypes.number,
    pct: PropTypes.number,
  }),
  optional: PropTypes.shape({
    amount: PropTypes.number,
    count: PropTypes.number,
    pct: PropTypes.number,
  }),
  loading: PropTypes.bool,
};

export default SearchSummaryCard;
