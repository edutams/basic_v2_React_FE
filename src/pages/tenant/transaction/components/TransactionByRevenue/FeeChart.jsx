import React, { useState } from 'react';
import {
  Grid,
  Box,
  Typography,
  useTheme,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
} from '@mui/material';
import Chart from 'react-apexcharts';
import StatusBreakdownCard from './StatusBreakdownCard';

const FeeChart = ({
  title = 'Chart',
  chartOptions,
  chartSeries,
  chartType = 'bar',
  // onDurationChange,
  statusData,

  sessions,
  terms,
  sessionId,
  termId,
  onSessionChange,
  onTermChange,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  // const [selectedDuration, setSelectedDuration] = useState('monthly');

  // const handleDurationChange = (event) => {
  //   const newDuration = event.target.value;
  //   setSelectedDuration(newDuration);
  //   if (onDurationChange) onDurationChange(newDuration);
  // };

  return (
    <Grid container spacing={2} mt={3} mb={3}>
      <Grid size={{ xs: 12, md: 7 }}>
        <Box
          sx={{
            border: `1px solid ${isDark ? '#444' : '#E2E8F0'}`,
            borderRadius: '10px',
            bgcolor: isDark ? '#1e1e1e' : 'white',
            p: 2,
          }}
        >
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
          >
            <Typography variant="h6" fontWeight={600} sx={{ color: isDark ? '#fff' : '#1a1a1a' }}>
              {title || 'Transaction Chart'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              {/* <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={selectedDuration}
                  onChange={handleDurationChange}
                  sx={{
                    bgcolor: isDark ? '#2a2a2a' : '#f5f5f5',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: isDark ? '#444' : '#e0e0e0',
                    },
                  }}
                >
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="quarterly">Quarterly</MenuItem>
                  <MenuItem value="yearly">Yearly</MenuItem>
                </Select>
              </FormControl> */}
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Session</InputLabel>
                <Select
                  label="Session"
                  value={sessionId}
                  onChange={(e) => onSessionChange(e.target.value)}
                >
                  <MenuItem value="">All Sessions</MenuItem>

                  {sessions.map((session) => (
                    <MenuItem key={session.id} value={session.id}>
                      {session.sesname}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Term</InputLabel>
                <Select label="Term" value={termId} onChange={(e) => onTermChange(e.target.value)}>
                  <MenuItem value="">All Terms</MenuItem>

                  {terms.map((term) => (
                    <MenuItem key={term.id} value={term.id}>
                      {term.term_name || term.display_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>

          <Chart options={chartOptions} series={chartSeries} type={chartType} height={320} />
        </Box>
      </Grid>

      <Grid size={{ xs: 12, md: 5 }}>
        <Box
          sx={{
            border: `1px solid ${isDark ? '#444' : '#f0f0f0'}`,
            borderRadius: '10px',
            bgcolor: isDark ? theme.palette.background.paper : '#fff',
            p: 2,
            height: '100%',
          }}
        >
          <StatusBreakdownCard
            title={statusData?.title}
            items={statusData?.items}
            metrics={statusData?.metrics}
            minRevenue={statusData?.minRevenue || 0}
            maxRevenue={statusData?.maxRevenue || 0}
            minType={statusData?.minType || ''}
            maxType={statusData?.maxType || ''}
          />
        </Box>
      </Grid>
    </Grid>
  );
};

export default FeeChart;
