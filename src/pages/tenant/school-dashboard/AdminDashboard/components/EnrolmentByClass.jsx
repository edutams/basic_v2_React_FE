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
  FormControl,
  Select,
  MenuItem,
  Button,
  useTheme,
  CircularProgress,
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
        py: 0.85,
        px: 1.25,
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
  sessionTerms = [],
  sessionTerm = 'all',
  onSessionChange,
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
        p: 2.25,
        borderRadius: '14px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        bgcolor: isDark ? theme.palette.background.paper : '#ffffff',
        border: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0',
        boxShadow: '0 2px 4px rgba(15, 23, 42, 0.04)',
      }}
    >
      <Box>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
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

          <FormControl size="small" sx={{ minWidth: 130 }}>
            <Select
              value={sessionTerm}
              onChange={(e) => onSessionChange?.(e.target.value)}
              sx={{
                fontSize: '11.5px',
                fontWeight: 700,
                borderRadius: '8px',
                height: 30,
                bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0' },
              }}
            >
              {sessionTerms.map((st) => (
                <MenuItem key={st.id} value={st.id} sx={{ fontSize: '11.5px', fontWeight: 600 }}>
                  {st.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Table */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={28} />
          </Box>
        ) : (
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontSize: '11px', fontWeight: 700, color: '#64748b', py: 1, px: 1.25, bgcolor: isDark ? '#1e293b' : '#f8fafc' }}>Class</TableCell>
                <TableCell align="center" sx={{ fontSize: '11px', fontWeight: 700, color: '#64748b', py: 1, px: 1.25, bgcolor: isDark ? '#1e293b' : '#f8fafc' }}>Male</TableCell>
                <TableCell align="center" sx={{ fontSize: '11px', fontWeight: 700, color: '#64748b', py: 1, px: 1.25, bgcolor: isDark ? '#1e293b' : '#f8fafc' }}>Female</TableCell>
                <TableCell align="right" sx={{ fontSize: '11px', fontWeight: 700, color: '#64748b', py: 1, px: 1.25, bgcolor: isDark ? '#1e293b' : '#f8fafc' }}>Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {classData.map((row) => (
                <TableRow key={row.class_code} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell sx={{ fontSize: '12px', fontWeight: 700, color: isDark ? '#fff' : '#1e293b', py: 0.85, px: 1.25 }}>
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
                <TableCell sx={{ fontSize: '12px', fontWeight: 800, color: isDark ? '#fff' : '#0f172a', py: 1, px: 1.25 }}>
                  Total
                </TableCell>
                <TableCell align="center" sx={{ fontSize: '12px', fontWeight: 800, color: isDark ? '#fff' : '#0f172a', py: 1, px: 1.25 }}>
                  {totals.male.toLocaleString()}
                </TableCell>
                <TableCell align="center" sx={{ fontSize: '12px', fontWeight: 800, color: isDark ? '#fff' : '#0f172a', py: 1, px: 1.25 }}>
                  {totals.female.toLocaleString()}
                </TableCell>
                <TableCell align="right" sx={{ fontSize: '12.5px', fontWeight: 800, color: '#2563eb', py: 1, px: 1.25 }}>
                  {totals.total.toLocaleString()}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        )}
      </Box>

      {/* Footer Link */}
      <Box sx={{ pt: 1.5, textAlign: 'center', borderTop: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9', mt: 1.5 }}>
        <Button
          disableRipple
          onClick={() => (onViewEnrolmentReport ? onViewEnrolmentReport() : navigate('/reports/general-report'))}
          endIcon={<ArrowForward sx={{ fontSize: '15px !important' }} />}
        >
          View Enrolment Report
        </Button>
      </Box>
    </Paper>
  );
};

export default EnrolmentByClass;
