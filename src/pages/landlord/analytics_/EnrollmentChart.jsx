import {
  Box,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  MenuItem,
  TextField,
  CircularProgress,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Chip,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

const EnrollmentChart = ({ data, loading, params, onParamChange }) => {
  const trend = data?.trend ?? [];
  const topSchools = data?.top_schools ?? [];
  const totals = data?.totals ?? {};

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        flexWrap="wrap"
        gap={2}
      >
        <Typography variant="h6" fontWeight={700}>
          Enrollment Intelligence
        </Typography>
        <Box display="flex" gap={2}>
          <ToggleButtonGroup
            value={params.period}
            exclusive
            size="small"
            onChange={(_, v) => v && onParamChange({ period: v })}
          >
            {['weekly', 'monthly', 'quarterly'].map((p) => (
              <ToggleButton key={p} value={p} sx={{ textTransform: 'none', px: 2 }}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          <TextField
            select
            size="small"
            value={params.year}
            onChange={(e) => onParamChange({ year: e.target.value })}
            sx={{ minWidth: 100 }}
          >
            {years.map((y) => (
              <MenuItem key={y} value={y}>
                {y}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Summary row */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              overflow: 'hidden',
              mb: 4,
            }}
          >
            {[
              { label: 'Total Students', value: totals.total_students, color: 'text.primary' },
              { label: 'Active Students', value: totals.active_students, color: 'success.main' },
              {
                label: 'Total Enrollments',
                value: totals.total_enrollments,
                color: 'primary.main',
              },
              { label: 'Total Staff', value: totals.total_staff, color: 'info.main' },
            ].map((s, i, arr) => (
              <Box
                key={s.label}
                sx={{
                  p: 2,
                  borderRight: i < arr.length - 1 ? '1px solid' : 'none',
                  borderColor: 'divider',
                }}
              >
                <Typography variant="caption" color="text.secondary" display="block">
                  {s.label}
                </Typography>
                <Typography variant="h5" fontWeight={700} color={s.color}>
                  {(s.value ?? 0).toLocaleString()}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Trend chart */}
          <Box mb={4}>
            <Typography variant="subtitle2" color="text.secondary" mb={2}>
              Enrollment Trend
            </Typography>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total_students"
                  name="Students"
                  stroke="#4A3AFF"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="total_enrollments"
                  name="Enrollments"
                  stroke="#2CA87F"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="total_staff"
                  name="Staff"
                  stroke="#F4A92B"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>

          {/* Top schools table */}
          <Typography variant="subtitle2" color="text.secondary" mb={2}>
            Top 10 Schools by Student Count
          </Typography>
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#fafafa' }}>
                <TableRow>
                  {['#', 'School', 'Type', 'Students', 'Staff', 'Enrollments', 'Guardians'].map(
                    (h) => (
                      <TableCell
                        key={h}
                        sx={{ fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' }}
                      >
                        {h}
                      </TableCell>
                    ),
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {topSchools.map((s, i) => (
                  <TableRow key={i} hover>
                    <TableCell sx={{ color: '#6b7280', fontSize: 13 }}>{i + 1}</TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {s.tenant_name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={s.school_type}
                        size="small"
                        sx={{ fontSize: 10, height: 20, textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} color="primary.main">
                        {(s.total_students ?? 0).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>{(s.total_staff ?? 0).toLocaleString()}</TableCell>
                    <TableCell>{(s.total_enrollments ?? 0).toLocaleString()}</TableCell>
                    <TableCell>{(s.total_guardians ?? 0).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Box>
  );
};

export default EnrollmentChart;
