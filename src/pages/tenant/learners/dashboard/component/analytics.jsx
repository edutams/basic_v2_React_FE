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
  Skeleton,
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
} from '@mui/icons-material';

const cardSx = {
  borderRadius: '8px',
  border: '1px solid',
  borderColor: 'grey.100',
  boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
  bgcolor: '#fff',
};

const SUBJECT_COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#06B6D4', '#F43F5E', '#84CC16', '#6366F1'];

const subjectMeta = (name, index) => {
  const n = String(name || '').toLowerCase();
  let icon = MenuBookOutlined;
  if (n.includes('math')) icon = CalculateOutlined;
  else if (n.includes('english')) icon = MenuBookOutlined;
  else if (n.includes('physic')) icon = ScienceOutlined;
  else if (n.includes('chem')) icon = BiotechOutlined;
  else if (n.includes('bio')) icon = PetsOutlined;
  else if (n.includes('further') || n.includes('addit')) icon = FunctionsOutlined;
  else if (n.includes('civic')) icon = AccountBalanceOutlined;
  else if (n.includes('ict') || n.includes('comput')) icon = ComputerOutlined;
  return { icon, color: SUBJECT_COLORS[index % SUBJECT_COLORS.length] };
};

const GRADE_STYLES = {
  A: { bg: '#DCFCE7', color: '#15803D' },
  B: { bg: '#DBEAFE', color: '#1E40AF' },
  C: { bg: '#FEF3C7', color: '#B45309' },
  D: { bg: '#FFEDD5', color: '#C2410C' },
  F: { bg: '#FEE2E2', color: '#B91C1C' },
};

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

const pctOf = (count, total) => (total > 0 ? Math.round((count / total) * 100) : 0);

// Label for a session term, e.g. "2025/2026 · 1st Term".
const termLabel = (t) =>
  [t?.session?.sesname, t?.display_term?.display_name].filter(Boolean).join(' · ') || 'This Term';

// Controlled term dropdown shared by the chart cards. When no terms have
// loaded yet it shows a single "This Term" placeholder so the layout holds.
const TermSelect = ({ value, onChange, sessionTerms, size = 'small' }) => (
  <Select
    value={String(value || '') || 'this_term'}
    size={size}
    onChange={(e) => onChange(e.target.value)}
    sx={{
      height: size === 'small' ? 26 : 24,
      fontSize: size === 'small' ? '0.7rem' : '0.68rem',
      fontWeight: 600,
      color: '#374151',
      bgcolor: '#F9FAFB',
      borderRadius: '6px',
      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E5E7EB' },
    }}
  >
    {sessionTerms.length === 0 && (
      <MenuItem value="this_term" sx={{ fontSize: '0.7rem' }}>This Term</MenuItem>
    )}
    {sessionTerms.map((t) => (
      <MenuItem key={t.id} value={String(t.id)} sx={{ fontSize: '0.7rem' }}>
        {termLabel(t)}
      </MenuItem>
    ))}
  </Select>
);

// ── Per-card skeletons (mirror the card body while a section loads) ─────
const CardSkeleton = ({ rows = 3 }) => (
  <Stack spacing={1}>
    <Skeleton variant="text" width="45%" height={16} />
    <Skeleton variant="rounded" height={110} sx={{ width: '100%' }} />
    {Array.from({ length: rows }).map((_, i) => (
      <Skeleton key={i} variant="text" width={`${70 - i * 12}%`} height={12} />
    ))}
  </Stack>
);

const Analytics = ({
  academics = {},
  attendance = {},
  assignments = {},
  loading = false,
  sessionTerms = [],
  academicTermId = '',
  attendanceTermId = '',
  onAcademicTermChange = () => {},
  onAttendanceTermChange = () => {},
}) => {
  const subjects = Array.isArray(academics.subjects) ? academics.subjects : [];
  const recentResults = Array.isArray(academics.recent_results) ? academics.recent_results : [];

  const attTotal = Number(attendance.total || 0);
  const attPresent = Number(attendance.present || 0);
  const attAbsent = Number(attendance.absent || 0);
  const attLate = Number(attendance.late || 0);
  const attRate = Number(attendance.rate || 0);

  const asgTotal = Number(assignments.total || 0);
  const asgCompleted = Number(assignments.completed || 0);
  const asgPending = Number(assignments.pending || 0);
  const asgOverdue = Number(assignments.overdue || 0);

  const attendancePie = {
    series: [attPresent, attAbsent, attLate],
    labels: ['Present', 'Absent', 'Late'],
  };

  const assignmentPie = {
    series: [asgCompleted, asgPending, asgOverdue],
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
              <TermSelect
                value={academicTermId}
                onChange={onAcademicTermChange}
                sessionTerms={sessionTerms}
              />
            </Stack>

            {loading ? (
              <CardSkeleton rows={4} />
            ) : subjects.length === 0 ? (
              <Typography sx={{ fontSize: '0.72rem', color: '#9CA3AF', py: 4, textAlign: 'center' }}>
                No results recorded for this term yet.
              </Typography>
            ) : (
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
                    {subjects.map((subj, index) => {
                      const meta = subjectMeta(subj.subject, index);
                      const IconComponent = meta.icon;
                      return (
                        <Box
                          key={subj.subject}
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
                            {Math.round(Number(subj.score || 0))}%
                          </Typography>

                          <Box
                            sx={{
                              width: { xs: 12, sm: 16, md: 18 },
                              height: `${Math.min(100, Number(subj.score || 0))}%`,
                              bgcolor: meta.color,
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
                            <IconComponent sx={{ fontSize: 11, color: meta.color }} />
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
                              {subj.subject}
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              </Box>
            )}
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

        {/* Attendance Overview */}
        <Card elevation={0} sx={{ ...cardSx, flex: { xs: '1 1 100%', md: 1 }, p: '12px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.75}>
              <Typography fontWeight="700" sx={{ fontSize: '0.85rem', color: '#111827' }}>
                Attendance Overview
              </Typography>
              <TermSelect
                value={attendanceTermId}
                onChange={onAttendanceTermChange}
                sessionTerms={sessionTerms}
                size="xs"
              />
            </Stack>

            {loading ? (
              <CardSkeleton rows={3} />
            ) : attTotal === 0 ? (
              <Typography sx={{ fontSize: '0.72rem', color: '#9CA3AF', py: 4, textAlign: 'center' }}>
                No attendance recorded for this term yet.
              </Typography>
            ) : (
              <>
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
                        {attRate}%
                      </Typography>
                      <Typography sx={{ fontSize: '0.58rem', color: '#6B7280', fontWeight: 600, mt: 0.1 }}>
                        Present
                      </Typography>
                    </Box>
                  </Box>

                  <Stack spacing={0.6} sx={{ minWidth: 100, justifyContent: 'center' }}>
                    <LegendItem color="#10B981" label="Present" pct={`${pctOf(attPresent, attTotal)}%`} />
                    <LegendItem color="#F59E0B" label="Absent" pct={`${pctOf(attAbsent, attTotal)}%`} />
                    <LegendItem color="#EF4444" label="Late" pct={`${pctOf(attLate, attTotal)}%`} />
                  </Stack>
                </Box>

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
                    You've been present for <b>{attRate}%</b> of school days.
                  </Typography>
                  <Typography fontWeight="700" sx={{ fontSize: '0.7rem', color: '#15803D', whiteSpace: 'nowrap', ml: 1 }}>
                    {attRate >= 75 ? '★ Excellent!' : attRate >= 50 ? 'Good job!' : 'Keep going!'}
                  </Typography>
                </Box>
              </>
            )}
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

            {loading ? (
              <CardSkeleton rows={5} />
            ) : recentResults.length === 0 ? (
              <Typography sx={{ fontSize: '0.72rem', color: '#9CA3AF', py: 4, textAlign: 'center' }}>
                No results yet this term.
              </Typography>
            ) : (
              <Stack spacing={0}>
                {recentResults.map((item, idx) => {
                  const gradeStyle = GRADE_STYLES[item.grade] || GRADE_STYLES.C;
                  return (
                    <React.Fragment key={`${item.title}-${item.date}-${idx}`}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ py: 0.6 }}
                      >
                        <Box sx={{ minWidth: 0 }}>
                          <Typography fontWeight="600" sx={{ fontSize: '0.76rem', color: '#111827', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.title}
                          </Typography>
                          <Typography sx={{ fontSize: '0.64rem', color: '#6B7280', mt: 0.1 }}>
                            {item.type ? `${item.type} · ` : ''}{item.date}
                          </Typography>
                        </Box>

                        <Stack direction="row" alignItems="center" spacing={1.25} flexShrink={0}>
                          <Typography fontWeight="800" sx={{ fontSize: '0.8rem', color: '#111827' }}>
                            {Math.round(Number(item.score || 0))}%
                          </Typography>
                          <Box
                            sx={{
                              width: 20,
                              height: 20,
                              borderRadius: '4px',
                              bgcolor: gradeStyle.bg,
                              color: gradeStyle.color,
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
                  );
                })}
              </Stack>
            )}
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

        {/* Assignment Summary */}
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

            {loading ? (
              <CardSkeleton rows={3} />
            ) : asgTotal === 0 ? (
              <Typography sx={{ fontSize: '0.72rem', color: '#9CA3AF', py: 4, textAlign: 'center' }}>
                No assignments posted for this term yet.
              </Typography>
            ) : (
              <>
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
                        {asgTotal}
                      </Typography>
                      <Typography sx={{ fontSize: '0.58rem', color: '#6B7280', fontWeight: 600, mt: 0.1 }}>
                        Total
                      </Typography>
                    </Box>
                  </Box>

                  <Stack spacing={0.6} sx={{ minWidth: 110, justifyContent: 'center' }}>
                    <LegendItem color="#10B981" label="Completed" pct={`${asgCompleted} (${pctOf(asgCompleted, asgTotal)}%)`} />
                    <LegendItem color="#3B82F6" label="Pending" pct={`${asgPending} (${pctOf(asgPending, asgTotal)}%)`} />
                    <LegendItem color="#EF4444" label="Overdue" pct={`${asgOverdue} (${pctOf(asgOverdue, asgTotal)}%)`} />
                  </Stack>
                </Box>

                {asgOverdue > 0 && (
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
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
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
                        <Box sx={{ minWidth: 0 }}>
                          <Typography fontWeight="700" sx={{ fontSize: '0.7rem', color: '#991B1B', lineHeight: 1.2 }}>
                            {asgOverdue} {asgOverdue === 1 ? 'assignment is' : 'assignments are'} overdue
                          </Typography>
                          <Typography sx={{ fontSize: '0.63rem', color: '#B91C1C', mt: 0.1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {assignments.overdue_list?.[0]?.title || 'Please submit them as soon as possible.'}
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
                          ml: 1,
                        }}
                      >
                        View Assignments
                      </Button>
                    </Stack>
                  </Box>
                )}
              </>
            )}
          </Box>
        </Card>
      </Stack>
    </Box>
  );
};

export default Analytics;
