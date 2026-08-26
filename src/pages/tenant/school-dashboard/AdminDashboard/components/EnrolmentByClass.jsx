import React, { useState } from 'react';
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
} from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const defaultClassData = [
  { className: 'Pre-K', male: 78, female: 64, total: 142 },
  { className: 'Nursery 1', male: 72, female: 66, total: 138 },
  { className: 'Nursery 2', male: 75, female: 70, total: 145 },
  { className: 'Primary 1', male: 96, female: 90, total: 186 },
  { className: 'Primary 2', male: 102, female: 96, total: 198 },
  { className: 'Primary 3', male: 105, female: 100, total: 205 },
  { className: 'Primary 4', male: 110, female: 100, total: 210 },
  { className: 'Primary 5', male: 104, female: 98, total: 202 },
  { className: 'JSS 1', male: 112, female: 108, total: 220 },
  { className: 'JSS 2', male: 105, female: 110, total: 215 },
  { className: 'JSS 3', male: 107, female: 101, total: 208 },
  { className: 'SS 1', male: 100, female: 95, total: 195 },
  { className: 'SS 2', male: 98, female: 90, total: 188 },
  { className: 'SS 3', male: 92, female: 92, total: 184 },
];

/**
 * Enrolment By Class Component
 */
const EnrolmentByClass = ({ classData = defaultClassData, onViewEnrolmentReport }) => {
  const [filter, setFilter] = useState('this_term');
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const totals = classData.reduce(
    (acc, item) => ({
      male: acc.male + item.male,
      female: acc.female + item.female,
      total: acc.total + item.total,
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

          <FormControl size="small" sx={{ minWidth: 110 }}>
            <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              sx={{
                fontSize: '11.5px',
                fontWeight: 700,
                borderRadius: '8px',
                height: 30,
                bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0' },
              }}
            >
              <MenuItem value="this_term" sx={{ fontSize: '11.5px', fontWeight: 600 }}>This Term</MenuItem>
              <MenuItem value="last_term" sx={{ fontSize: '11.5px', fontWeight: 600 }}>Last Term</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Table */}
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
                <TableRow key={row.className} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell sx={{ fontSize: '12px', fontWeight: 700, color: isDark ? '#fff' : '#1e293b', py: 0.85, px: 1.25 }}>
                    {row.className}
                  </TableCell>
                  <TableCell align="center" sx={{ fontSize: '12px', fontWeight: 600, color: isDark ? '#cbd5e1' : '#334155', py: 0.85, px: 1.25 }}>
                    {row.male}
                  </TableCell>
                  <TableCell align="center" sx={{ fontSize: '12px', fontWeight: 600, color: isDark ? '#cbd5e1' : '#334155', py: 0.85, px: 1.25 }}>
                    {row.female}
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: '12px', fontWeight: 800, color: isDark ? '#fff' : '#0f172a', py: 0.85, px: 1.25 }}>
                    {row.total}
                  </TableCell>
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
      </Box>

      {/* Footer Link */}
      <Box sx={{ pt: 1.5, textAlign: 'center', borderTop: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9', mt: 1.5 }}>
        <Button
          onClick={() => (onViewEnrolmentReport ? onViewEnrolmentReport() : navigate('/reports/general-report'))}
          endIcon={<ArrowForward sx={{ fontSize: '15px !important' }} />}
          sx={{
            fontSize: '12px',
            fontWeight: 700,
            color: '#2563eb',
            textTransform: 'none',
            '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
          }}
        >
          View Enrolment Report
        </Button>
      </Box>
    </Paper>
  );
};

export default EnrolmentByClass;
