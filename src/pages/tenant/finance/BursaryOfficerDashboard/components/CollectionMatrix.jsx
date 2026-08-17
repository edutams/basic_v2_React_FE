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
} from '@mui/material';
import { TableChart, InfoOutlined } from '@mui/icons-material';
import StatusChip from './StatusChip';
import { STATUS_META, formatCurrency } from '../constants';

/**
 * Class-Level Collection Matrix — table of per-class expected/collected/outstanding
 * fees with efficiency progress bars and a totals row.
 */
const CollectionMatrix = ({ matrix = [], totals, totalEfficiency, onRowClick }) => {
  const theme = useTheme();

  const efficiencyColor = (value) =>
    value >= 75
      ? theme.palette.success.main
      : value >= 60
        ? theme.palette.warning.main
        : theme.palette.error.main;

  const efficiencyBadge = (value, fontWeight = 700) => (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 52,
        px: 1,
        py: 0.5,
        borderRadius: 2,
        bgcolor: efficiencyColor(Number(value)),
        color: '#fff',
        fontWeight,
        fontSize: 12,
        lineHeight: 1,
      }}
    >
      {value}%
    </Box>
  );

  return (
    <Paper
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        border: '1px solid',
        borderColor: theme.palette.divider,
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}
    >
      {/* Banner */}
      <Box
        sx={{
          px: 3,
          py: 2.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          color: '#fff',
        }}
      >
        <TableChart sx={{ fontSize: 19 }} />
        <Typography variant="subtitle1" fontWeight={800} sx={{ fontSize: 12.5, letterSpacing: 0.4 }}>
          Class-Level Collection Matrix
        </Typography>
      </Box>

      <TableContainer sx={{ flexGrow: 1 }}>
        <Table sx={{ minWidth: 700 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50' }}>
              <TableCell sx={{ fontWeight: 800, fontSize: 11 }}>Class</TableCell>
              <TableCell align="right" sx={{ fontWeight: 800, fontSize: 11 }}>
                Expected Fees (₦)
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 800, fontSize: 11 }}>
                Collected Fees (₦)
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 800, fontSize: 11 }}>
                Outstanding Fees (₦)
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 800, fontSize: 11, minWidth: 140 }}>
                Efficiency (%)
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 800, fontSize: 11 }}>
                Status
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {matrix.map((row, index) => (
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
                  <Typography color="success.main" fontWeight={700}>
                    {formatCurrency(row.collected_fees)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography color="error.main" fontWeight={700}>
                    {formatCurrency(row.outstanding_fees)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  {efficiencyBadge(row.efficiency)}
                </TableCell>
                <TableCell align="center">
                  <StatusChip status={row.status} />
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
                  Total
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="subtitle2" fontWeight={800}>
                  {formatCurrency(totals.expected)}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="subtitle2" fontWeight={800} color="success.main">
                  {formatCurrency(totals.collected)}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="subtitle2" fontWeight={800} color="error.main">
                  {formatCurrency(totals.outstanding)}
                </Typography>
              </TableCell>
              <TableCell align="right">
                {efficiencyBadge(totalEfficiency, 800)}
              </TableCell>
              <TableCell align="center">
                <StatusChip status={totalEfficiency >= 75 ? 'excellent' : totalEfficiency >= 60 ? 'pending' : 'poor'} />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Box
        sx={{
          px: 3,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
        }}
      >
        <InfoOutlined sx={{ fontSize: 14, color: 'text.secondary' }} />
        <Typography variant="body2" color="text.secondary">
          Click on any class row to view a detailed breakdown of students and transactions.
        </Typography>
      </Box>
    </Paper>
  );
};

export default CollectionMatrix;
