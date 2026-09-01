import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  CircularProgress,
  Stack,
  Divider,
  Paper,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined';
import ClassOutlinedIcon from '@mui/icons-material/ClassOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import CloseIcon from '@mui/icons-material/Close';

import tenantApi from '@/api/tenant/tenant_api';
import { TenantAuthContext } from '@/context/TenantContext/auth';

const colorPresets = [
  { color: '#16a34a', bg: '#f0fdf4', trackColor: '#dcfce7', iconBg: '#22c55e' },
  { color: '#2563eb', bg: '#f0f9ff', trackColor: '#dbeafe', iconBg: '#3b82f6' },
  { color: '#7c3aed', bg: '#f5f3ff', trackColor: '#ede9fe', iconBg: '#8b5cf6' },
  { color: '#ea580c', bg: '#fff7ed', trackColor: '#ffedd5', iconBg: '#f97316' },
  { color: '#0d9488', bg: '#ccfbf1', trackColor: '#99f6e4', iconBg: '#14b8a6' },
];

function ClassCard({ cls, idx, isAdmin }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const preset = colorPresets[idx % colorPresets.length];
  const color = cls.color || preset.color;
  const trackColor = cls.trackColor || preset.trackColor;
  const iconBg = cls.iconBg || preset.iconBg;

  const isSubject = cls.isSubject;
  const statVal = isSubject ? cls.performance : cls.attendance;
  const statNum = parseInt(statVal, 10) || 0;
  const displayText = `${statNum}%`;
  const statLabel = isSubject ? 'Class Avg' : 'Attendance';

  const handleMenuOpen = (e) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const handleMenuClose = (e) => {
    if (e) e.stopPropagation();
    setAnchorEl(null);
  };

  const handleNavigate = (path) => {
    handleMenuClose();
    if (path) navigate(path);
  };

  return (
    <>
      <Card
        elevation={0}
        sx={{
          borderRadius: '14px',
          height: '100%',
          bgcolor: isDark ? theme.palette.background.paper : '#ffffff',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          transition: 'transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            borderColor: '#94a3b8',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
          },
        }}
      >
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          {/* Top Header */}
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '10px',
                  bgcolor: iconBg,
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <MenuBookOutlinedIcon sx={{ fontSize: 22 }} />
              </Box>
              <Box>
                <Typography
                  sx={{ fontWeight: 800, fontSize: 17, color: isDark ? '#fff' : '#1e293b', lineHeight: 1.2 }}
                >
                  {cls.code}
                </Typography>
                <Typography sx={{ fontSize: 12.5, color: 'text.secondary', mt: 0.25, fontWeight: 500 }}>
                  {cls.subject}
                </Typography>
                {isAdmin && cls.teacherName && (
                  <Typography
                    sx={{
                      fontSize: 11.5,
                      color: 'text.secondary',
                      mt: 0.5,
                      fontWeight: 600,
                    }}
                  >
                    Teacher: {cls.teacherName}
                  </Typography>
                )}
              </Box>
            </Stack>

            <IconButton
              size="small"
              onClick={handleMenuOpen}
              sx={{ mt: -0.5, mr: -0.5, color: 'text.secondary' }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Stack>

          {/* Bottom Stat Row */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mt: 2.5, pt: 1.75, borderTop: '1px solid', borderTopColor: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9' }}
          >
            {/* Students Column */}
            <Box sx={{ flex: 1 }}>
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <PeopleOutlineIcon sx={{ fontSize: 20, color: isDark ? '#fff' : '#1e1b4b' }} />
                <Typography sx={{ fontWeight: 800, fontSize: 17, color: isDark ? '#fff' : '#0f172a', lineHeight: 1 }}>
                  {cls.students ?? cls.student_count ?? 0}
                </Typography>
              </Stack>
              <Typography
                sx={{ fontSize: 11, color: 'text.secondary', fontWeight: 500, mt: 0.5, pl: 3.5 }}
              >
                Students
              </Typography>
            </Box>

            {/* Vertical Divider */}
            <Divider orientation="vertical" flexItem sx={{ mx: 1, borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0' }} />

            {/* 2nd Stat Column */}
            <Box sx={{ flex: 1, pl: 1 }}>
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <Box sx={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
                  <CircularProgress
                    variant="determinate"
                    value={100}
                    size={20}
                    thickness={5}
                    sx={{ color: trackColor }}
                  />
                  <CircularProgress
                    variant="determinate"
                    value={statNum}
                    size={20}
                    thickness={5}
                    sx={{
                      color: color,
                      position: 'absolute',
                      left: 0,
                      '& .MuiCircularProgress-circle': { strokeLinecap: 'round' },
                    }}
                  />
                </Box>
                <Typography sx={{ fontWeight: 800, fontSize: 17, color: isDark ? '#fff' : '#0f172a', lineHeight: 1 }}>
                  {displayText}
                </Typography>
              </Stack>
              <Typography
                sx={{ fontSize: 11, color: 'text.secondary', fontWeight: 500, mt: 0.5, pl: 3.5 }}
              >
                {statLabel}
              </Typography>
            </Box>
          </Stack>
        </CardContent>

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{ sx: { borderRadius: '12px', minWidth: 170 } }}
        >
          <MenuItem onClick={() => handleNavigate('/attendance-psychomotor')}>
            <ListItemIcon>
              <HowToRegOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Take Attendance" primaryTypographyProps={{ fontSize: 13, fontWeight: 600 }} />
          </MenuItem>
          <MenuItem onClick={() => handleNavigate('/class-register')}>
            <ListItemIcon>
              <ClassOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Class Register" primaryTypographyProps={{ fontSize: 13, fontWeight: 600 }} />
          </MenuItem>
        </Menu>
      </Card>
    </>
  );
}

function AllocationInsightCard() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: '14px',
        height: '100%',
        bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
        border: '1px dashed',
        borderColor: isDark ? 'rgba(255,255,255,0.15)' : '#cbd5e1',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <CardContent sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', '&:last-child': { pb: 2 } }}>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: '10px',
              bgcolor: isDark ? 'rgba(37,99,235,0.2)' : '#dbeafe',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <ClassOutlinedIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: 14, color: isDark ? '#fff' : '#0f172a' }}>
              Teaching Portal
            </Typography>
            <Typography sx={{ fontSize: 11.5, color: 'text.secondary' }}>
              Active Academic Allocation
            </Typography>
          </Box>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12, mt: 0.5, lineHeight: 1.4 }}>
          Track student performance, course materials, and assessment records for your active classes this term.
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function ClassesOverview() {
  const { user } = useContext(TenantAuthContext);

  const isAdmin = user?.roles?.some((role) =>
    ['school_admin', 'super_admin'].includes(typeof role === 'string' ? role : role.name),
  );

  const [classesList, setClassesList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchMyAllocations = async () => {
      try {
        setLoading(true);

        const res = await tenantApi.get('/allocations/my-allocations');
        const allocationsData = res?.data?.data ?? {};

        const rawSubjects = allocationsData.subject_allocations ?? [];
        const rawClasses = allocationsData.class_allocations ?? [];

        const combined = [...rawSubjects, ...rawClasses];

        if (isMounted) {
          const mapped = combined.map((item, index) => {
            const isSubject = Boolean(item.is_subject);
            const className = item.class_name;
            const armName = item.class_arm_names;
            const fullClassName =
              className && armName
                ? `${className} - ${armName}`
                : className || armName || `Class ${index + 1}`;

            const subjectTitle = isSubject ? item.subject_name || 'Subject' : 'Class Teacher';
            const studentCount = Number(item.student_count ?? 0);

            return {
              id: item.id ?? index,
              code: fullClassName,
              subject: subjectTitle,
              teacherName: item.teacher_name ?? '',
              isSubject,
              students: studentCount,
              attendance: item.attendance ?? '92%',
              performance: item.performance ?? '88%',
            };
          });

          setClassesList(mapped);
        }
      } catch (err) {
        console.error('Failed to fetch allocations:', err);
        if (isMounted) setClassesList([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchMyAllocations();
    return () => {
      isMounted = false;
    };
  }, []);

  const [expanded, setExpanded] = useState(false);

  const displayedClasses = expanded ? classesList : classesList.slice(0, 3);
  const showInsightCard = classesList.length < 3;

  return (
    <Box
      sx={{
        bgcolor: (theme) => theme.palette.mode === 'dark' ? theme.palette.background.paper : '#ffffff',
        border: '1px solid',
        borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : '#e2e8f0',
        borderRadius: '14px',
        p: 2,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography sx={{ fontWeight: 800, fontSize: 16, letterSpacing: -0.3, color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#0f172a' }}>
          {isAdmin ? 'Teacher Allocations' : 'My Classes Overview'}
        </Typography>
        {classesList.length > 3 && (
          <Button
            variant="contained"
            size="small"
            onClick={() => setExpanded((prev) => !prev)}
            sx={{
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {expanded ? 'View less' : `View all (${classesList.length})`}
          </Button>
        )}
      </Stack>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" py={4}>
          <CircularProgress size={30} />
        </Box>
      ) : classesList.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: 'center',
            border: '1px dashed',
            borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : '#cbd5e1',
            borderRadius: '14px',
            bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#f8fafc',
          }}
        >
          <ClassOutlinedIcon sx={{ fontSize: 36, color: 'text.disabled', mb: 1 }} />
          <Typography variant="subtitle1" fontWeight={700} color="text.secondary">
            {isAdmin ? 'No Teacher Allocations Yet' : 'No Classes Allocated Yet'}
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
            {isAdmin
              ? 'There are no active subject or class teacher allocations for this session term.'
              : 'You do not have any active subject or class allocations assigned for this session term.'}
          </Typography>
        </Paper>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: classesList.length === 1 ? '1fr 1fr' : 'repeat(3, 1fr)',
            },
            gap: 2,
          }}
        >
          {displayedClasses.map((cls, idx) => (
            <Box key={cls.id || idx} sx={{ minWidth: 0, height: '100%' }}>
              <ClassCard cls={cls} idx={idx} isAdmin={isAdmin} />
            </Box>
          ))}

          {showInsightCard && (
            <Box sx={{ minWidth: 0, height: '100%' }}>
              <AllocationInsightCard />
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
