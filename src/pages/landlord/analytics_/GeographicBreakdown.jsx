import {
  Box,
  Typography,
  CircularProgress,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  LinearProgress,
  Tabs,
  Tab,
} from '@mui/material';
import { useState } from 'react';

const GeographicBreakdown = ({ data, loading }) => {
  const [tab, setTab] = useState(0);

  if (loading)
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    );
  if (!data) return null;

  const byState = data.by_state ?? [];
  const byLga = data.by_lga ?? [];
  const appsByState = data.applications_by_state ?? [];
  const studentsByState = data.students_by_state ?? [];

  const maxSchools = Math.max(...byState.map((s) => s.total_schools), 1);

  return (
    <Box>
      <Typography variant="h6" fontWeight={700} mb={3}>
        Geographic Distribution
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 } }}
        >
          <Tab label="Schools by State" />
          <Tab label="Top LGAs" />
          <Tab label="Applications by State" />
          <Tab label="Students by State" />
        </Tabs>
      </Box>

      {tab === 0 && (
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#fafafa' }}>
              <TableRow>
                {['State', 'Total Schools', 'Active', 'Fully Onboarded', 'Distribution'].map(
                  (h) => (
                    <TableCell
                      key={h}
                      sx={{ fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}
                    >
                      {h}
                    </TableCell>
                  ),
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {byState.map((s) => (
                <TableRow key={s.state_id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {s.state_name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={700} color="primary.main">
                      {s.total_schools}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="success.main">
                      {s.active_schools}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="info.main">
                      {s.fully_onboarded}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ minWidth: 150 }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <LinearProgress
                        variant="determinate"
                        value={(s.total_schools / maxSchools) * 100}
                        sx={{ flex: 1, height: 6, borderRadius: 3 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {Math.round((s.total_schools / maxSchools) * 100)}%
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {tab === 1 && (
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#fafafa' }}>
              <TableRow>
                {['#', 'LGA', 'State', 'Schools'].map((h) => (
                  <TableCell
                    key={h}
                    sx={{ fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}
                  >
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {byLga.map((l, i) => (
                <TableRow key={l.lga_id} hover>
                  <TableCell sx={{ color: '#6b7280', fontSize: 13 }}>{i + 1}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {l.lga_name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {l.state_name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={700} color="primary.main">
                      {l.total_schools}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {tab === 2 && (
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#fafafa' }}>
              <TableRow>
                {['State', 'Total', 'Approved', 'Pending', 'Rejected'].map((h) => (
                  <TableCell
                    key={h}
                    sx={{ fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}
                  >
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {appsByState.map((s) => (
                <TableRow key={s.state_name} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {s.state_name}
                    </Typography>
                  </TableCell>
                  <TableCell>{s.total_applications}</TableCell>
                  <TableCell>
                    <Typography variant="body2" color="success.main">
                      {s.approved}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="warning.main">
                      {s.pending}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="error.main">
                      {s.rejected}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {tab === 3 && (
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#fafafa' }}>
              <TableRow>
                {['#', 'State', 'Total Students', 'Total Staff'].map((h) => (
                  <TableCell
                    key={h}
                    sx={{ fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}
                  >
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {studentsByState.map((s, i) => (
                <TableRow key={s.state_name} hover>
                  <TableCell sx={{ color: '#6b7280', fontSize: 13 }}>{i + 1}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {s.state_name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={700} color="primary.main">
                      {(s.total_students ?? 0).toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="info.main">
                      {(s.total_staff ?? 0).toLocaleString()}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default GeographicBreakdown;
