import {
  Box,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  MenuItem,
  TextField,
  Skeleton,
} from '@mui/material';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

const SchoolGrowthChart = ({ data, loading, params, onParamChange }) => {
  const chart = data?.chart ?? [];

  return (
    <Box>
      {/* Controls */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        flexWrap="wrap"
        gap={2}
      >
        <Typography variant="h6" fontWeight={700}>
          School Growth
        </Typography>
        <Box display="flex" gap={2} alignItems="center">
          <ToggleButtonGroup
            value={params.period}
            exclusive
            onChange={(_, v) => v && onParamChange({ period: v })}
            size="small"
          >
            {['weekly', 'monthly', 'quarterly', 'yearly'].map((p) => (
              <ToggleButton key={p} value={p} sx={{ textTransform: 'none', px: 2 }}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          {params.period !== 'yearly' && (
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
          )}
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ py: 2 }}>
          <Skeleton variant="rounded" height={280} sx={{ borderRadius: 1, mb: 4 }} />
          <Skeleton variant="rounded" height={280} sx={{ borderRadius: 1 }} />
        </Box>
      ) : (
        <>
          {/* Area Chart — cumulative growth */}
          <Box mb={4}>
            <Typography variant="subtitle2" color="text.secondary" mb={2}>
              Cumulative School Growth
            </Typography>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chart}>
                <defs>
                  <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4A3AFF" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#4A3AFF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="cumulative"
                  name="Total Schools"
                  stroke="#4A3AFF"
                  fill="url(#colorCumulative)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Box>

          {/* Bar Chart — period breakdown */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" mb={2}>
              New Schools vs Applications per Period
            </Typography>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chart} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="schools_created"
                  name="Schools Created"
                  fill="#2CA87F"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="schools_approved"
                  name="Schools Approved"
                  fill="#4A3AFF"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="applications"
                  name="Applications"
                  fill="#F4A92B"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </>
      )}
    </Box>
  );
};

export default SchoolGrowthChart;
