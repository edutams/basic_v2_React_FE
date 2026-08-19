import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  LinearProgress,
} from '@mui/material';
import { TableChart, InfoOutlined } from '@mui/icons-material';
import { formatCurrency } from '../constants';
import SessionSelect from './SessionSelect';

// Mocked data shown when the API returns empty.
const MOCK_MATRIX = [
  { class: 'SSS 3', expected_fees: 38450000, collected_fees: 24680000, outstanding_fees: 13770000, efficiency: 35.8 },
  { class: 'SSS 2', expected_fees: 35250000, collected_fees: 22410000, outstanding_fees: 12840000, efficiency: 36.5 },
  { class: 'SSS 1', expected_fees: 30800000, collected_fees: 20150000, outstanding_fees: 10650000, efficiency: 34.6 },
  { class: 'JSS 3', expected_fees: 28900000, collected_fees: 18760000, outstanding_fees: 10140000, efficiency: 35.1 },
  { class: 'JSS 2', expected_fees: 27400000, collected_fees: 17930000, outstanding_fees: 9470000, efficiency: 34.6 },
  { class: 'JSS 1', expected_fees: 26300000, collected_fees: 16630000, outstanding_fees: 9670000, efficiency: 36.8 },
];

/**
 * Outstanding Balance by Class — table of per-class expected/collected/outstanding
 * fees with the efficiency percentage and a visual progress bar per row.
 */
const CollectionMatrix = ({
  matrix = [],
  totals,
  totalEfficiency,
  onRowClick,
  session = 'This Session',
  sessions = [],
  onSessionChange,
}) => {
  const theme = useTheme();
  const displayMatrix = matrix.length > 0 ? matrix : MOCK_MATRIX;

  // Compute totals from display data when not provided
  const computedTotals = totals || displayMatrix.reduce(
    (acc, row) => ({
      expected: acc.expected + (row.expected_fees || 0),
      collected: acc.collected + (row.collected_fees || 0),
      outstanding: acc.outstanding + (row.outstanding_fees || 0),
    }),
    { expected: 0, collected: 0, outstanding: 0 },
  );
  const computedEfficiency = totalEfficiency || (computedTotals.expected
    ? ((computedTotals.collected / computedTotals.expected) * 100).toFixed(1)
    : '0.0');

  return (
    <Paper
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '14px',
        border: '1px solid',
        borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : '#cbd5e1',
        overflow: 'hidden',
        boxShadow: '0 2px 4px rgba(15, 23, 42, 0.05), 0 12px 24px rgba(15, 23, 42, 0.1)',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2.5,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TableChart sx={{ fontSize: 18, color: theme.palette.primary.main }} />
          <Typography fontWeight={800} sx={{ fontSize: '0.82rem', color: '#111827', letterSpacing: 0.3 }}>
            Outstanding Balance by Class
          </Typography>
          <InfoOutlined sx={{ fontSize: 14, color: '#9CA3AF', ml: 0.5 }} />
        </Box>
        <SessionSelect value={session} options={sessions} onChange={onSessionChange} />
      </Box>
      <Box sx={{ mx: 2.5, borderTop: '1px solid #E5E7EB' }} />

      <TableContainer sx={{ flexGrow: 1 }}>
        <Table sx={{ minWidth: 700 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50' }}>
              <TableCell sx={{ fontWeight: 800, fontSize: 11 }}>Class</TableCell>
              <TableCell align="right" sx={{ fontWeight: 800, fontSize: 11 }}>
                Total Payable (₦)
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 800, fontSize: 11 }}>
                Collected (₦)
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 800, fontSize: 11 }}>
                Outstanding (₦)
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 800, fontSize: 11 }}>
                Outstanding (%)
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 800, fontSize: 11, minWidth: 140 }}>
                Visual Progress
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayMatrix.map((row, index) => (
              <TableRow
                key={index}
                hover
                sx={{ cursor: 'pointer', '&:last-of-type td': { borderBottom: 'none' } }}
                onClick={() => onRowClick(row.class)}
              >
                <TableCell>
                  <Chip
                    label={row.class}
                    size="small"
                    sx={{
                      bgcolor:
                        theme.palette.mode === 'dark'
                          ? theme.palette.grey[800]
                          : theme.palette.grey[100],
                      fontWeight: 700,
                    }}
                  />
                </TableCell>
                <TableCell align="right">{formatCurrency(row.expected_fees)}</TableCell>
                <TableCell align="right">
                  <Typography fontWeight={700}>
                    {formatCurrency(row.collected_fees)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography color="error.main" fontWeight={700}>
                    {formatCurrency(row.outstanding_fees)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight={700}>
                    {row.efficiency}%
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(row.efficiency, 100)}
                      sx={{
                        flex: 1,
                        height: 8,
                        borderRadius: 4,
                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: row.efficiency >= 80 
                            ? theme.palette.success.main
                            : row.efficiency >= 50
                            ? theme.palette.warning.main
                            : theme.palette.error.main,
                          borderRadius: 4,
                        },
                      }}
                    />
                  </Box>
                </TableCell>
              </TableRow>
            ))}

            {/* Totals row */}
            <TableRow
              sx={{
                bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
                '& td': { borderTop: `2px solid ${theme.palette.divider}` },
              }}
            >
              <TableCell>
                <Typography variant="subtitle2" fontWeight={800}>
                  TOTAL
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="subtitle2" fontWeight={800}>
                  {formatCurrency(computedTotals.expected)}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="subtitle2" fontWeight={800}>
                  {formatCurrency(computedTotals.collected)}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="subtitle2" fontWeight={800} color="error.main">
                  {formatCurrency(computedTotals.outstanding)}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="subtitle2" fontWeight={800}>
                  {computedEfficiency}%
                </Typography>
              </TableCell>
              <TableCell align="center">
                <LinearProgress
                  variant="determinate"
                  value={Math.min(parseFloat(computedEfficiency), 100)}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: parseFloat(totalEfficiency) >= 80
                        ? theme.palette.success.main
                        : parseFloat(totalEfficiency) >= 50
                        ? theme.palette.warning.main
                        : theme.palette.error.main,
                      borderRadius: 4,
                    },
                  }}
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>


    </Paper>
  );
};

export default CollectionMatrix;
