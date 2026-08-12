import React from 'react';
import {
  Box,
  Card,
  Typography,
  Stack,
  Select,
  MenuItem,
  Divider,
  Button,
} from '@mui/material';
import Chart from 'react-apexcharts';
import {
  CalculateOutlined,
  MenuBookOutlined,
  ScienceOutlined,
  BiotechOutlined,
  PetsOutlined,
  FunctionsOutlined,
  AccountBalanceOutlined,
  ComputerOutlined,
  AccessTimeOutlined,
  CheckCircleOutline,
} from '@mui/icons-material';

const cardSx = {
  borderRadius: '8px',
  border: '1px solid',
  borderColor: 'grey.100',
  boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
  bgcolor: '#fff',
};

// Subject Data for Bar Chart
const subjectsData = [
  { name: 'Mathematics', score: 82, color: '#10B981', icon: CalculateOutlined },
  { name: 'English', score: 74, color: '#3B82F6', icon: MenuBookOutlined },
  { name: 'Physics', score: 88, color: '#8B5CF6', icon: ScienceOutlined },
  { name: 'Chemistry', score: 71, color: '#F59E0B', icon: BiotechOutlined },
  { name: 'Biology', score: 85, color: '#06B6D4', icon: PetsOutlined },
  { name: 'Further Math', score: 65, color: '#F43F5E', icon: FunctionsOutlined },
  { name: 'Civic Edu.', score: 90, color: '#84CC16', icon: AccountBalanceOutlined },
  { name: 'ICT', score: 78, color: '#6366F1', icon: ComputerOutlined },
];

// Recent Results Data
const recentResults = [
  { title: 'Mathematics Test', date: 'May 5, 2025', score: '85%', grade: 'A', gradeBg: '#DCFCE7', gradeColor: '#15803D' },
  { title: 'English Quiz', date: 'May 3, 2025', score: '70%', grade: 'B', gradeBg: '#DBEAFE', gradeColor: '#1E40AF' },
  { title: 'Physics Test', date: 'Apr 30, 2025', score: '88%', grade: 'A', gradeBg: '#DCFCE7', gradeColor: '#15803D' },
  { title: 'Chemistry Quiz', date: 'Apr 28, 2025', score: '65%', grade: 'C', gradeBg: '#FEF3C7', gradeColor: '#B45309' },
  { title: 'Biology Test', date: 'Apr 25, 2025', score: '75%', grade: 'B', gradeBg: '#DBEAFE', gradeColor: '#1E40AF' },
];

const LegendItem = ({ color, label, pct }) => (
  <Stack direction="row" alignItems="center" spacing={1} sx={{ py: 0.1 }}>
    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
    <Typography sx={{ fontSize: '0.72rem', color: '#374151', fontWeight: 500 }}>
      {label}
    </Typography>
    <Typography fontWeight="700" sx={{ fontSize: '0.73rem', color: '#111827', ml: 'auto' }}>
      {pct}
    </Typography>
  </Stack>
);

const Analytics = () => {
  // Attendance Donut Data (Present -> Green, Absent -> Yellow/Orange, Late -> Red)
  const attendancePie = {
    series: [92, 6, 2],
    labels: ['Present', 'Absent', 'Late'],
  };

  // Assignment Donut Data
  const assignmentPie = {
    series: [6, 4, 2],
    labels: ['Completed', 'Pending', 'Overdue'],
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* ─── ROW 1: Academic Performance & Attendance Overview ─── */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems="stretch">
        {/* Academic Performance */}
        <Card elevation={0} sx={{ ...cardSx, flex: { xs: '1 1 100%', md: 1.45 }, p: '12px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
              <Box>
                <Typography fontWeight="700" sx={{ fontSize: '0.88rem', color: '#111827', lineHeight: 1.2 }}>
                  Academic Performance
                </Typography>
                <Typography sx={{ fontSize: '0.7rem', color: '#6B7280', mt: 0.1 }}>
                  Your performance across all subjects
                </Typography>
              </Box>
              <Select
                defaultValue="this_term"
                size="small"
                sx={{
                  height: 26,
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: '#374151',
                  bgcolor: '#F9FAFB',
                  borderRadius: '6px',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E5E7EB' },
                }}
              >
                <MenuItem value="this_term" sx={{ fontSize: '0.7rem' }}>This Term</MenuItem>
                <MenuItem value="last_term" sx={{ fontSize: '0.7rem' }}>Last Term</MenuItem>
              </Select>
            </Stack>

            {/* Custom Subject Vertical Bar Chart Layout */}
            <Box sx={{ position: 'relative', pt: 0.5, pb: 0.5 }}>
              <Box sx={{ position: 'relative', height: 135, mb: 3.5, ml: 3.5 }}>
                {[100, 75, 50, 25, 0].map((val, idx) => (
                  <Box
                    key={val}
                    sx={{
                      position: 'absolute',
                      top: `${idx * 25}%`,
                      left: 0,
                      right: 0,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Typography
                      sx={{
                        position: 'absolute',
                        left: -30,
                        fontSize: '0.62rem',
                        color: '#9CA3AF',
                        fontWeight: 500,
                      }}
                    >
                      {val}%
                    </Typography>
                    <Box
                      sx={{
                        width: '100%',
                        borderTop: '1px dashed #F3F4F6',
                      }}
                    />
                  </Box>
                ))}

                {/* Bars container */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'space-around',
                    px: 0.5,
                  }}
                >
                  {subjectsData.map((subj) => {
                    const IconComponent = subj.icon;
                    return (
                      <Box
                        key={subj.name}
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          height: '100%',
                          justifyContent: 'flex-end',
                          width: { xs: 20, sm: 28, md: 32 },
                          position: 'relative',
                        }}
                      >
                        <Typography
                          fontWeight="700"
                          sx={{
                            fontSize: '0.62rem',
                            color: '#374151',
                            mb: 0.2,
                          }}
                        >
                          {subj.score}%
                        </Typography>

                        <Box
                          sx={{
                            width: { xs: 12, sm: 16, md: 18 },
                            height: `${subj.score}%`,
                            bgcolor: subj.color,
                            borderRadius: '3px 3px 0 0',
                            transition: 'height 0.3s ease',
                          }}
                        />

                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: -30,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 0.1,
                            width: 50,
                          }}
                        >
                          <IconComponent sx={{ fontSize: 11, color: subj.color }} />
                          <Typography
                            noWrap
                            sx={{
                              fontSize: '0.6rem',
                              color: '#4B5563',
                              fontWeight: 600,
                              textAlign: 'center',
                              maxWidth: '100%',
                            }}
                          >
                            {subj.name}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            </Box>
          </Box>

          <Box>
            <Divider sx={{ mt: 1.5, mb: 0.75, borderColor: '#F3F4F6' }} />
            <Typography
              sx={{
                fontSize: '0.72rem',
                color: '#2563EB',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-block',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              View detailed results →
            </Typography>
          </Box>
        </Card>

        {/* Attendance Overview (Tightly coupled with bottom alert card) */}
        <Card elevation={0} sx={{ ...cardSx, flex: { xs: '1 1 100%', md: 1 }, p: '12px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.75}>
              <Typography fontWeight="700" sx={{ fontSize: '0.85rem', color: '#111827' }}>
                Attendance Overview
              </Typography>
              <Select
                defaultValue="this_term"
                size="small"
                sx={{
                  height: 24,
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  color: '#374151',
                  bgcolor: '#F9FAFB',
                  borderRadius: '6px',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E5E7EB' },
                }}
              >
                <MenuItem value="this_term" sx={{ fontSize: '0.68rem' }}>This Term</MenuItem>
              </Select>
            </Stack>

            {/* Centered Donut + Legend Layout with tighter spacing */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                mt: 1.25,
                mb: 1,
                py: 0.5,
              }}
            >
              <Box sx={{ position: 'relative', width: 130, height: 130, flexShrink: 0 }}>
                <Chart
                  type="donut"
                  series={attendancePie.series}
                  width={130}
                  height={130}
                  options={{
                    chart: { type: 'donut', sparkline: { enabled: true } },
                    labels: attendancePie.labels,
                    colors: ['#10B981', '#F59E0B', '#EF4444'],
                    plotOptions: { pie: { donut: { size: '72%' } } },
                    dataLabels: { enabled: false },
                    legend: { show: false },
                    stroke: { show: false },
                    tooltip: { enabled: true },
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%,-50%)',
                    textAlign: 'center',
                    pointerEvents: 'none',
                  }}
                >
                  <Typography fontWeight="800" sx={{ fontSize: '1.1rem', color: '#111827', lineHeight: 1 }}>
                    92%
                  </Typography>
                  <Typography sx={{ fontSize: '0.58rem', color: '#6B7280', fontWeight: 600, mt: 0.1 }}>
                    Present
                  </Typography>
                </Box>
              </Box>

              <Stack spacing={0.6} sx={{ minWidth: 100, justifyContent: 'center' }}>
                <LegendItem color="#10B981" label="Present" pct="92%" />
                <LegendItem color="#F59E0B" label="Absent" pct="6%" />
                <LegendItem color="#EF4444" label="Late" pct="2%" />
              </Stack>
            </Box>
          </Box>

          {/* Bottom Success Alert Box (ParentDashboard2 style: light green bg + green border + green text) */}
          <Box
            sx={{
              bgcolor: '#F0FDF4',
              border: '1px solid #A7F3D0',
              borderRadius: '6px',
              px: 1.25,
              py: 0.75,
              mt: 0.1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography sx={{ fontSize: '0.7rem', color: '#166534', fontWeight: 500 }}>
              You've been present for <b>92%</b> of school days.
            </Typography>
            <Typography fontWeight="700" sx={{ fontSize: '0.7rem', color: '#15803D', whiteSpace: 'nowrap', ml: 1 }}>
              ★ Excellent!
            </Typography>
          </Box>
        </Card>
      </Stack>

      {/* ─── ROW 2: Recent Results & Assignment Summary ─── */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems="stretch">
        {/* Recent Results */}
        <Card elevation={0} sx={{ ...cardSx, flex: 1, p: '12px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
              <Typography fontWeight="700" sx={{ fontSize: '0.88rem', color: '#111827' }}>
                Recent Results
              </Typography>
              <Typography sx={{ fontSize: '0.68rem', color: '#2563EB', fontWeight: 600, cursor: 'pointer' }}>
                View all results
              </Typography>
            </Stack>

            <Stack spacing={0}>
              {recentResults.map((item, idx) => (
                <React.Fragment key={item.title}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ py: 0.6 }}
                  >
                    <Box>
                      <Typography fontWeight="600" sx={{ fontSize: '0.76rem', color: '#111827', lineHeight: 1.2 }}>
                        {item.title}
                      </Typography>
                      <Typography sx={{ fontSize: '0.64rem', color: '#6B7280', mt: 0.1 }}>
                        {item.date}
                      </Typography>
                    </Box>

                    <Stack direction="row" alignItems="center" spacing={1.25}>
                      <Typography fontWeight="800" sx={{ fontSize: '0.8rem', color: '#111827' }}>
                        {item.score}
                      </Typography>
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          borderRadius: '4px',
                          bgcolor: item.gradeBg,
                          color: item.gradeColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.68rem',
                        }}
                      >
                        {item.grade}
                      </Box>
                    </Stack>
                  </Stack>
                  {idx < recentResults.length - 1 && <Divider sx={{ borderColor: '#F3F4F6' }} />}
                </React.Fragment>
              ))}
            </Stack>
          </Box>

          <Box>
            <Divider sx={{ mt: 0.75, mb: 0.75, borderColor: '#F3F4F6' }} />
            <Typography
              sx={{
                fontSize: '0.72rem',
                color: '#2563EB',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-block',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Go to Exams & Results →
            </Typography>
          </Box>
        </Card>

        {/* Assignment Summary (Reduced space between chart & alert box) */}
        <Card elevation={0} sx={{ ...cardSx, flex: 1, p: '12px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
              <Typography fontWeight="700" sx={{ fontSize: '0.85rem', color: '#111827' }}>
                Assignment Summary
              </Typography>
              <Typography sx={{ fontSize: '0.68rem', color: '#2563EB', fontWeight: 600, cursor: 'pointer' }}>
                View all
              </Typography>
            </Stack>

            {/* Centered Donut + Legend Layout with tighter spacing */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                pt: 1.5,
                pb: 0.5,
              }}
            >
              <Box sx={{ position: 'relative', width: 130, height: 130, flexShrink: 0 }}>
                <Chart
                  type="donut"
                  series={assignmentPie.series}
                  width={130}
                  height={130}
                  options={{
                    chart: { type: 'donut', sparkline: { enabled: true } },
                    labels: assignmentPie.labels,
                    colors: ['#10B981', '#3B82F6', '#EF4444'],
                    plotOptions: { pie: { donut: { size: '72%' } } },
                    dataLabels: { enabled: false },
                    legend: { show: false },
                    stroke: { show: false },
                    tooltip: { enabled: true },
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%,-50%)',
                    textAlign: 'center',
                    pointerEvents: 'none',
                  }}
                >
                  <Typography fontWeight="800" sx={{ fontSize: '1.1rem', color: '#111827', lineHeight: 1 }}>
                    12
                  </Typography>
                  <Typography sx={{ fontSize: '0.58rem', color: '#6B7280', fontWeight: 600, mt: 0.1 }}>
                    Total
                  </Typography>
                </Box>
              </Box>

              <Stack spacing={0.6} sx={{ minWidth: 110, justifyContent: 'center' }}>
                <LegendItem color="#10B981" label="Completed" pct="6 (50%)" />
                <LegendItem color="#3B82F6" label="Pending" pct="4 (33%)" />
                <LegendItem color="#EF4444" label="Overdue" pct="2 (17%)" />
              </Stack>
            </Box>
          </Box>

          {/* Overdue Warning Alert Box (ParentDashboard2 style: pink/red tinted bg + border + red text) */}
          <Box
            sx={{
              bgcolor: '#FFF5F5',
              border: '1px solid #FECACA',
              borderRadius: '6px',
              px: 1.25,
              py: 0.75,
              mt: 0.1,
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    bgcolor: '#FEE2E2',
                    color: '#DC2626',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <AccessTimeOutlined sx={{ fontSize: 13 }} />
                </Box>
                <Box>
                  <Typography fontWeight="700" sx={{ fontSize: '0.7rem', color: '#991B1B', lineHeight: 1.2 }}>
                    2 assignments are overdue
                  </Typography>
                  <Typography sx={{ fontSize: '0.63rem', color: '#B91C1C', mt: 0.1 }}>
                    Please submit them as soon as possible.
                  </Typography>
                </Box>
              </Stack>
              <Button
                variant="contained"
                disableElevation
                size="small"
                sx={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  color: '#FFF',
                  bgcolor: '#DC2626',
                  px: 1.1,
                  py: 0.3,
                  minWidth: 0,
                  whiteSpace: 'nowrap',
                  borderRadius: '5px',
                  '&:hover': { bgcolor: '#B91C1C' },
                }}
              >
                View Assignments
              </Button>
            </Stack>
          </Box>
        </Card>
      </Stack>
    </Box>
  );
};

export default Analytics;
