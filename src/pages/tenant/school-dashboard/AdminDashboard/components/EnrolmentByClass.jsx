import React from 'react';
import {
  Box,
  Typography,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  useTheme,
  Skeleton,
} from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const ClickableCell = ({ value, onClick, align = 'center', fontWeight = 600, color }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <TableCell
      align={align}
      onClick={onClick}
      sx={{
        fontSize: '12px',
        fontWeight,
        color: color || (isDark ? '#cbd5e1' : '#334155'),
        py: 0.5,
        px: 1,
        cursor: 'pointer',
        borderRadius: '4px',
        transition: 'all 0.15s ease',
        '&:hover': {
          bgcolor: isDark ? 'rgba(37, 99, 235, 0.15)' : 'rgba(37, 99, 235, 0.08)',
          color: '#2563eb',
          fontWeight: 700,
          transform: 'scale(1.05)',
        },
      }}
    >
      {value}
    </TableCell>
  );
};

const EnrolmentByClass = ({
  classData = [],
  loading = false,
  onCellClick,
  onViewEnrolmentReport,
}) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const totals = classData.reduce(
    (acc, item) => ({
      male: acc.male + (item.male || 0),
      female: acc.female + (item.female || 0),
      total: acc.total + (item.total || 0),
    }),
    { male: 0, female: 0, total: 0 }
  );

  return (
    <Paper
      elevation={0}
      sx={{
        p: 0.75,
        borderRadius: '14px',
        maxHeight: 250,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: isDark ? theme.palette.background.paper : '#ffffff',
        border: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0',
        boxShadow: '0 2px 4px rgba(15, 23, 42, 0.04)',
      }}
    >
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5, flexShrink: 0 }}>
          <Typography
            sx={{
              fontSize: '11px',
              fontWeight: 800,
              color: isDark ? 'rgba(255,255,255,0.6)' : '#64748b',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            ENROLMENT BY CLASS
          </Typography>
          <Button
            size="small"
            onClick={() => (onViewEnrolmentReport ? onViewEnrolmentReport() : navigate('/reports/general-report'))}
            endIcon={<ArrowForward sx={{ fontSize: '14px !important' }} />}
            sx={{ fontSize: '12px' }}
          >
            View Report
          </Button>
        </Box>

        {/* Table */}
        {loading ? (
          <Box sx={{ py: 1 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 1.5, px: 1.25, py: 0.85 }}>
                <Skeleton variant="text" width="30%" height={20} />
                <Skeleton variant="text" width="15%" height={20} />
                <Skeleton variant="text" width="15%" height={20} />
                <Skeleton variant="text" width="15%" height={20} sx={{ ml: 'auto' }} />
              </Box>
            ))}
          </Box>
        ) : (
        <TableContainer sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontSize: '11px', fontWeight: 700, color: '#64748b', py: 0.5, px: 1, bgcolor: isDark ? '#1e293b' : '#f8fafc' }}>Class</TableCell>
                <TableCell align="center" sx={{ fontSize: '11px', fontWeight: 700, color: '#64748b', py: 0.5, px: 1, bgcolor: isDark ? '#1e293b' : '#f8fafc' }}>Male</TableCell>
                <TableCell align="center" sx={{ fontSize: '11px', fontWeight: 700, color: '#64748b', py: 0.5, px: 1, bgcolor: isDark ? '#1e293b' : '#f8fafc' }}>Female</TableCell>
                <TableCell align="right" sx={{ fontSize: '11px', fontWeight: 700, color: '#64748b', py: 0.5, px: 1, bgcolor: isDark ? '#1e293b' : '#f8fafc' }}>Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {classData.map((row) => (
                <TableRow key={row.class_code} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell sx={{ fontSize: '12px', fontWeight: 700, color: isDark ? '#fff' : '#1e293b', py: 0.5, px: 1 }}>
                    {row.class_code}
                  </TableCell>
                  <ClickableCell
                    value={row.male}
                    onClick={() => onCellClick?.(row.class_code, 'male')}
                  />
                  <ClickableCell
                    value={row.female}
                    onClick={() => onCellClick?.(row.class_code, 'female')}
                  />
                  <ClickableCell
                    value={row.total}
                    align="right"
                    fontWeight={800}
                    color="#2563eb"
                    onClick={() => onCellClick?.(row.class_code, 'total')}
                  />
                </TableRow>
              ))}

              {/* Summary Total Row */}
              <TableRow sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9' }}>
                <TableCell sx={{ fontSize: '12px', fontWeight: 800, color: isDark ? '#fff' : '#0f172a', py: 0.5, px: 1 }}>
                  Total
                </TableCell>
                <TableCell align="center" sx={{ fontSize: '12px', fontWeight: 800, color: isDark ? '#fff' : '#0f172a', py: 0.5, px: 1 }}>
                  {totals.male.toLocaleString()}
                </TableCell>
                <TableCell align="center" sx={{ fontSize: '12px', fontWeight: 800, color: isDark ? '#fff' : '#0f172a', py: 0.5, px: 1 }}>
                  {totals.female.toLocaleString()}
                </TableCell>
                <TableCell align="right" sx={{ fontSize: '12.5px', fontWeight: 800, color: '#2563eb', py: 0.5, px: 1 }}>
                  {totals.total.toLocaleString()}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        )}
      </Box>
    </Paper>
  );
};

export default EnrolmentByClass;
