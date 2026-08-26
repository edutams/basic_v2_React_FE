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
  LinearProgress,
  FormControl,
  Select,
  MenuItem,
  Button,
  useTheme,
} from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const defaultGradeData = [
  { grade: 'Nursery 1', applicants: 210, admitted: 146, accepted: 132, rate: 90.4 },
  { grade: 'Nursery 2', applicants: 245, admitted: 178, accepted: 156, rate: 87.6 },
  { grade: 'Primary 1', applicants: 620, admitted: 358, accepted: 311, rate: 86.9 },
  { grade: 'Primary 2', applicants: 590, admitted: 331, accepted: 286, rate: 86.4 },
  { grade: 'Primary 3', applicants: 515, admitted: 304, accepted: 263, rate: 86.5 },
  { grade: 'JSS 1', applicants: 980, admitted: 545, accepted: 472, rate: 86.6 },
  { grade: 'SS 1', applicants: 682, admitted: 367, accepted: 314, rate: 85.6 },
];

/**
 * Applications by Grade Level Table Component
 */
const ApplicationsByGrade = ({ gradeData = defaultGradeData, onViewFullReport }) => {
  const [sessionFilter, setSessionFilter] = useState('this_session');
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1.5, sm: 2.25 },
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
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        {/* Header with Title & Filter */}
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
            APPLICATIONS BY GRADE LEVEL
          </Typography>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={sessionFilter}
              onChange={(e) => setSessionFilter(e.target.value)}
              sx={{
                fontSize: '11.5px',
                fontWeight: 700,
                borderRadius: '8px',
                height: 30,
                bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0' },
              }}
            >
              <MenuItem value="this_session" sx={{ fontSize: '11.5px', fontWeight: 600 }}>This Session</MenuItem>
              <MenuItem value="last_session" sx={{ fontSize: '11.5px', fontWeight: 600 }}>Last Session</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Table */}
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontSize: '11px', fontWeight: 700, color: '#64748b', py: 1, px: 1, whiteSpace: 'nowrap' }}>Grade Level</TableCell>
                <TableCell align="center" sx={{ fontSize: '11px', fontWeight: 700, color: '#64748b', py: 1, px: 1, whiteSpace: 'nowrap' }}>Applicants</TableCell>
                <TableCell align="center" sx={{ fontSize: '11px', fontWeight: 700, color: '#64748b', py: 1, px: 1, whiteSpace: 'nowrap' }}>Admitted</TableCell>
                <TableCell align="center" sx={{ fontSize: '11px', fontWeight: 700, color: '#64748b', py: 1, px: 1, whiteSpace: 'nowrap' }}>Accepted</TableCell>
                <TableCell align="right" sx={{ fontSize: '11px', fontWeight: 700, color: '#64748b', py: 1, px: 1, width: { xs: 110, sm: 140 }, whiteSpace: 'nowrap' }}>Acceptance Rate</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {gradeData.map((row) => (
                <TableRow key={row.grade} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell sx={{ fontSize: '12px', fontWeight: 700, color: isDark ? '#fff' : '#1e293b', py: 1, px: 1 }}>
                    {row.grade}
                  </TableCell>
                  <TableCell align="center" sx={{ fontSize: '12px', fontWeight: 600, color: isDark ? '#cbd5e1' : '#334155', py: 1, px: 1 }}>
                    {row.applicants}
                  </TableCell>
                  <TableCell align="center" sx={{ fontSize: '12px', fontWeight: 600, color: isDark ? '#cbd5e1' : '#334155', py: 1, px: 1 }}>
                    {row.admitted}
                  </TableCell>
                  <TableCell align="center" sx={{ fontSize: '12px', fontWeight: 600, color: isDark ? '#cbd5e1' : '#334155', py: 1, px: 1 }}>
                    {row.accepted}
                  </TableCell>
                  <TableCell align="right" sx={{ py: 1, px: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                      <Box sx={{ width: 50, flexShrink: 0 }}>
                        <LinearProgress
                          variant="determinate"
                          value={row.rate}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            bgcolor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: '#16a34a',
                              borderRadius: 3,
                            },
                          }}
                        />
                      </Box>
                      <Typography sx={{ fontSize: '11.5px', fontWeight: 800, color: isDark ? '#fff' : '#0f172a', minWidth: 40, textAlign: 'right' }}>
                        {row.rate}%
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Footer Link */}
      <Box sx={{ pt: 1.5, textAlign: 'center', borderTop: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9', mt: 1.5 }}>
        <Button
          disableRipple
          onClick={() => (onViewFullReport ? onViewFullReport() : navigate('/admission/tracker'))}
          endIcon={<ArrowForward sx={{ fontSize: '15px !important' }} />}
          sx={{
            fontSize: '12px',
            fontWeight: 700,
            color: '#2563eb',
            textTransform: 'none',
            borderRadius: '8px',
            '&:hover': {
              bgcolor: '#EFF6FF',
              color: '#1d4ed8',
              textDecoration: 'underline',
              opacity: 1,
            },
          }}
        >
          View Full Grade Level Report
        </Button>
      </Box>
    </Paper>
  );
};

export default ApplicationsByGrade;
