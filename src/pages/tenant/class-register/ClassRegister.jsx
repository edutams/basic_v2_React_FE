import React, { useState } from 'react';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import ParentCard from '@/components/shared/ParentCard';
import {
  Box,
  Typography,
  Paper,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Avatar,
  IconButton,
  Tooltip,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Grid,
  TextField,
  InputAdornment,
  Menu,
  Tabs,
  Tab,
  TablePagination,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  FileDownload as ExportIcon,
  FilterAlt as FilterIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  Phone as PhoneIcon,
  CheckCircle as CheckCircleIcon,
  CancelOutlined as CancelOutlinedIcon,
  VisibilityOutlined as ViewDetailIcon,
  SwapHoriz as ChangeClassIcon,
  Save as SaveIcon,
  School as SchoolIcon,
  Groups as GroupsIcon,
  Class as ClassIcon,
} from '@mui/icons-material';

const BCrumb = [
  { to: '/', title: 'Home' },
  { title: 'Class Manager' },
  { title: 'Class Register' },
];

const INITIAL_CLASS_ENROLLMENT = [
  { id: 'pry1', label: 'PRY 1', count: 102, color: '#1976d2', arms: [ { arm: 'Diamond', count: 34 }, { arm: 'Gold', count: 34 }, { arm: 'Silver', count: 34 } ] },
  { id: 'pry2', label: 'PRY 2', count: 98, color: '#2e7d32', arms: [ { arm: 'Diamond', count: 33 }, { arm: 'Gold', count: 33 }, { arm: 'Silver', count: 32 } ] },
  { id: 'pry3', label: 'PRY 3', count: 115, color: '#ed6c02', arms: [ { arm: 'Diamond', count: 38 }, { arm: 'Gold', count: 38 }, { arm: 'Silver', count: 39 } ] },
  { id: 'pry4', label: 'PRY 4', count: 124, color: '#9c27b0', arms: [ { arm: 'Diamond', count: 42 }, { arm: 'Gold', count: 41 }, { arm: 'Silver', count: 41 } ] },
  { id: 'pry5', label: 'PRY 5', count: 88, color: '#0288d1', arms: [ { arm: 'Diamond', count: 30 }, { arm: 'Gold', count: 29 }, { arm: 'Silver', count: 29 } ] },
  { id: 'pry6', label: 'PRY 6', count: 94, color: '#d32f2f', arms: [ { arm: 'Diamond', count: 32 }, { arm: 'Gold', count: 31 }, { arm: 'Silver', count: 31 } ] },
];

const MOCK_CLASS_STUDENTS = [
  { id: 1, name: 'ABANISE Akorede Micheal', admissionNo: '2019A110510094', gender: 'MALE', arm: 'Diamond' },
  { id: 2, name: 'ABDRAMON Temitope Hasanat', admissionNo: '2020A110510008', gender: 'FEMALE', arm: 'Gold' },
  { id: 3, name: 'ABDUL HAMMED Muhammed', admissionNo: '2020A110510101', gender: 'MALE', arm: 'Diamond' },
  { id: 4, name: 'ADEBAYO Olawalarami Loveth', admissionNo: '2024C1111600021', gender: 'FEMALE', arm: 'Silver' },
  { id: 5, name: 'AKINTOLA Fatimah Oluwaseun', admissionNo: '2021A110510044', gender: 'FEMALE', arm: 'Gold' },
];

const SINGLE_ARM_STUDENTS = [
  {
    id: 1,
    sn: '01',
    name: 'ABANISE Akorede Micheal',
    admissionNo: '2019A110510094',
    gender: 'MALE',
    classArm: 'Pry 4 (Diamond)',
    guardianName: 'Mr. Micheal Abanise',
    guardianPhone: '+234 802 345 6789',
  },
  {
    id: 2,
    sn: '02',
    name: 'ABDRAMON Temitope Hasanat',
    admissionNo: '2020A110510008',
    gender: 'FEMALE',
    classArm: 'Pry 4 (No class arm)',
    guardianName: 'Mrs. Hasanat Abdramon',
    guardianPhone: '+234 809 123 4567',
  },
  {
    id: 3,
    sn: '03',
    name: 'ABDUL HAMMED Muhammed',
    admissionNo: '2020A110510101',
    gender: 'MALE',
    classArm: 'Pry 4 (Diamond)',
    guardianName: 'Alhaji Hammed Abdul',
    guardianPhone: '+234 703 987 6543',
  },
];

const ARMS = [
  { id: 'A', label: 'A', count: 109 },
  { id: 'B', label: 'B', count: 98 },
  { id: 'C', label: 'C', count: 5 },
];

const MULTI_ARM_STUDENTS = [
  {
    id: 1,
    name: 'ABDULMOJEED Hikmot Oluwakemi',
    info: 'Female • Junior Secondary 1 (A)',
    admissionNo: '2019C111340051',
    arms: { A: true, B: false, C: false },
  },
  {
    id: 2,
    name: 'ABUDAZEEZ Abudqudiri Oluwadamilare',
    info: 'Male • Junior Secondary 1 (A)',
    admissionNo: '2019C111340059',
    arms: { A: true, B: false, C: false },
  },
  {
    id: 3,
    name: 'ADEBAYO Olawalarami Loveth',
    info: 'Female • Junior Secondary 1 (A)',
    admissionNo: '2024C1111600021',
    arms: { A: true, B: false, C: false },
  },
];

const ClassRegister = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  // Modals for actions
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [changeClassModalOpen, setChangeClassModalOpen] = useState(false);
  const [newClass, setNewClass] = useState('');

  // Class breakdown modal
  const [selectedEnrollmentClass, setSelectedEnrollmentClass] = useState(null);

  // Single Arm View filters
  const [saSession, setSaSession] = useState('2024/2025');
  const [saTerm, setSaTerm] = useState('Third Term');
  const [saProgramme, setSaProgramme] = useState('Primary');
  const [saClass, setSaClass] = useState('Pry 4');
  const [saArm, setSaArm] = useState('A (Diamond)');
  const [saSearch, setSaSearch] = useState('');

  // Multiple Arm View filters
  const [maSession, setMaSession] = useState('2025/2026');
  const [maTerm, setMaTerm] = useState('Third Term');
  const [maProgramme, setMaProgramme] = useState('Junior Secondary');
  const [maClass, setMaClass] = useState('Junior Secondary 1');
  const [maSearch, setMaSearch] = useState('');

  const [multiStudents, setMultiStudents] = useState(MULTI_ARM_STUDENTS);

  // Dynamic stats calculated from active filters
  const [totalStudentsCount, setTotalStudentsCount] = useState(1284);
  const [maleCount, setMaleCount] = useState(642);
  const [femaleCount, setFemaleCount] = useState(642);

  // Pagination states
  const [saPage, setSaPage] = useState(0);
  const [saRowsPerPage, setSaRowsPerPage] = useState(10);
  const [maPage, setMaPage] = useState(0);
  const [maRowsPerPage, setMaRowsPerPage] = useState(10);

  const toggleArmEnrollment = (studentId, armId) => {
    setMultiStudents((prev) =>
      prev.map((s) =>
        s.id === studentId ? { ...s, arms: { ...s.arms, [armId]: !s.arms[armId] } } : s,
      ),
    );
  };

  const handleMenuOpen = (e, row) => {
    setAnchorEl(e.currentTarget);
    setSelectedRow(row);
  };
  const handleMenuClose = () => setAnchorEl(null);

  const handleOpenDetail = () => {
    handleMenuClose();
    setDetailModalOpen(true);
  };

  const handleOpenChangeClass = () => {
    handleMenuClose();
    setNewClass(selectedRow?.classArm || '');
    setChangeClassModalOpen(true);
  };

  const handleApplySingleFilter = () => {
    const multiplier = saProgramme === 'Primary' ? 1 : 0.85;
    const newTotal = Math.round(1284 * multiplier);
    setTotalStudentsCount(newTotal);
    setMaleCount(Math.round(newTotal / 2));
    setFemaleCount(newTotal - Math.round(newTotal / 2));
  };

  const handleApplyMultiFilter = () => {
    const multiplier = maProgramme === 'Junior Secondary' ? 1 : 1.1;
    const newTotal = Math.round(1284 * multiplier);
    setTotalStudentsCount(newTotal);
    setMaleCount(Math.round(newTotal / 2));
    setFemaleCount(newTotal - Math.round(newTotal / 2));
  };

  return (
    <PageContainer title="Class Register" description="Manage class register and student enrollments">
      <Breadcrumb title="Class Register" items={BCrumb} />

      {/* ── Analytics Header (Grid layout) ─────────────────────────────── */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Total Students Card */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '16px',
              bgcolor: '#1a2e4a',
              color: '#fff',
              height: '100%',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: isDark
                ? '0 10px 30px rgba(0,0,0,0.35)'
                : '0 0 20px rgba(0,0,0,.10)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                right: -15,
                bottom: -15,
                opacity: 0.1,
              }}
            >
              <PeopleIcon sx={{ fontSize: 150, color: '#fff' }} />
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700 }}>
                Total Students
              </Typography>
              <Typography variant="h2" fontWeight={800} sx={{ my: 1, lineHeight: 1, fontSize: { xs: 36, md: 44 } }}>
                {totalStudentsCount.toLocaleString()}
              </Typography>
            </Box>

            <Box sx={{ zIndex: 1, mt: 2 }}>
              <Stack direction="row" spacing={3} sx={{ mb: 1.5 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', fontWeight: 600 }}>MALE</Typography>
                  <Typography variant="h6" fontWeight={700}>{maleCount.toLocaleString()}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', fontWeight: 600 }}>FEMALE</Typography>
                  <Typography variant="h6" fontWeight={700}>{femaleCount.toLocaleString()}</Typography>
                </Box>
              </Stack>
              <Stack direction="row" alignItems="center" gap={0.5}>
                <TrendingUpIcon sx={{ fontSize: 18, color: '#4caf50' }} />
                <Typography variant="body2" sx={{ color: '#4caf50', fontWeight: 600 }}>
                  +12% from last term
                </Typography>
              </Stack>
            </Box>
          </Paper>
        </Grid>

        {/* Class Enrollment Breakdown Grid */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '16px',
              border: `2px solid ${isDark ? 'rgba(91, 38, 38, 0.08)' : theme.palette.grey[100]}`,
              bgcolor: isDark ? 'background.paper' : '#fff',
              boxShadow: isDark
                ? '0 10px 30px rgba(0,0,0,0.35)'
                : '0 0 20px rgba(0,0,0,.10)',
              height: '100%',
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h6" fontWeight={700} color="text.primary">
                Class Enrollment Breakdown
              </Typography>
              <Button size="small" variant="text" sx={{ fontWeight: 600, color: 'primary.main', textTransform: 'none' }}>
                View Detailed Report
              </Button>
            </Stack>

            <Grid container spacing={2}>
              {INITIAL_CLASS_ENROLLMENT.map((cls) => (
                <Grid size={{ xs: 6, sm: 4 }} key={cls.label}>
                  <Box
                    onClick={() => setSelectedEnrollmentClass(cls)}
                    sx={{
                      p: 2,
                      borderRadius: '12px',
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : theme.palette.grey[200]}`,
                      bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#f9fafb',
                      cursor: 'pointer',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        borderColor: cls.color || 'primary.main',
                      },
                    }}
                  >
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ letterSpacing: 0.5 }}>
                        {cls.label}
                      </Typography>
                      <Typography variant="h5" fontWeight={700} color="text.primary" sx={{ my: 0.5 }}>
                        {cls.count}
                      </Typography>
                      <Box sx={{ height: 3, width: '45%', bgcolor: cls.color || 'primary.main', borderRadius: 2 }} />
                    </Box>

                    {/* Floated right colored icon (no arrow) */}
                    <Box
                      sx={{
                        width: 38,
                        height: 38,
                        borderRadius: '10px',
                        bgcolor: `${cls.color || '#1976d2'}15`,
                        color: cls.color || 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        ml: 1,
                      }}
                    >
                      <GroupsIcon sx={{ fontSize: 22 }} />
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* ── Tabs & Content wrapped in ParentCard ─────────────────────────────── */}
      <ParentCard
        title={
          <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '15px',
                  py: 1.5,
                },
              }}
            >
              <Tab label="Single Arm View" />
              <Tab label="Multiple Arm View" />
            </Tabs>
          </Box>
        }
      >
        {/* ── SINGLE ARM VIEW TAB ────────────────────────────────────────── */}
        {activeTab === 0 && (
          <Box sx={{ pt: 1 }}>
            {/* Filters */}
            <Grid container spacing={2} sx={{ mb: 3 }} alignItems="center">
              <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Session</InputLabel>
                  <Select value={saSession} label="Session" onChange={(e) => setSaSession(e.target.value)}>
                    <MenuItem value="2024/2025">2024/2025</MenuItem>
                    <MenuItem value="2025/2026">2025/2026</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Term</InputLabel>
                  <Select value={saTerm} label="Term" onChange={(e) => setSaTerm(e.target.value)}>
                    <MenuItem value="Third Term">Third Term</MenuItem>
                    <MenuItem value="Second Term">Second Term</MenuItem>
                    <MenuItem value="First Term">First Term</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Programme</InputLabel>
                  <Select value={saProgramme} label="Programme" onChange={(e) => setSaProgramme(e.target.value)}>
                    <MenuItem value="Primary">Primary</MenuItem>
                    <MenuItem value="Junior Secondary">Junior Secondary</MenuItem>
                    <MenuItem value="Senior Secondary">Senior Secondary</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Class</InputLabel>
                  <Select value={saClass} label="Class" onChange={(e) => setSaClass(e.target.value)}>
                    {['Pry 1', 'Pry 2', 'Pry 3', 'Pry 4', 'Pry 5', 'Pry 6'].map((c) => (
                      <MenuItem key={c} value={c}>{c}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Arm</InputLabel>
                  <Select value={saArm} label="Arm" onChange={(e) => setSaArm(e.target.value)}>
                    <MenuItem value="A (Diamond)">A (Diamond)</MenuItem>
                    <MenuItem value="B (Gold)">B (Gold)</MenuItem>
                    <MenuItem value="C (Silver)">C (Silver)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Filter Action & Search Row */}
            <Grid container spacing={2} sx={{ mb: 3 }} alignItems="center">
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search by learner name or ID..."
                  value={saSearch}
                  onChange={(e) => setSaSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                  <Button variant="contained" size="small" fullWidth={{ xs: true, sm: false }} startIcon={<FilterIcon />} onClick={handleApplySingleFilter}>
                    Apply Filter
                  </Button>
                  <Button variant="outlined" size="small" fullWidth={{ xs: true, sm: false }} startIcon={<ExportIcon />}>
                    Export List
                  </Button>
                </Stack>
              </Grid>
            </Grid>

            {/* Table */}
            <TableContainer elevation={0} variant="outlined" sx={{ borderRadius: 2, overflowX: 'auto' }}>
              <Table sx={{ minWidth: 700 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>S/N</TableCell>
                    <TableCell>Student Info</TableCell>
                    <TableCell>Gender</TableCell>
                    <TableCell>Class/Arm</TableCell>
                    <TableCell>Parent / Guardian</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {SINGLE_ARM_STUDENTS.filter(
                    (s) =>
                      saSearch === '' ||
                      s.name.toLowerCase().includes(saSearch.toLowerCase()) ||
                      s.admissionNo.includes(saSearch),
                  ).map((student) => (
                    <TableRow key={student.id} hover>
                      <TableCell>{student.sn}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 38, height: 38, bgcolor: 'primary.light', color: 'primary.main', fontWeight: 700 }}>
                            {student.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {student.name}
                            </Typography>
                            <Chip
                              label={student.admissionNo}
                              size="small"
                              color="success"
                              variant="outlined"
                              sx={{ height: 20, fontSize: '11px', fontWeight: 600, mt: 0.25 }}
                            />
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {/* Gender chip WITHOUT inner icon as requested */}
                        <Chip
                          label={student.gender}
                          size="small"
                          color={student.gender === 'MALE' ? 'primary' : 'success'}
                          variant="soft"
                          sx={{ fontWeight: 700, px: 0.5 }}
                        />
                      </TableCell>
                      <TableCell>{student.classArm}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {student.guardianName}
                        </Typography>
                        <Stack direction="row" alignItems="center" gap={0.5}>
                          <PhoneIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {student.guardianPhone}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={(e) => handleMenuOpen(e, student)}>
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ pt: 2 }}>
              <TablePagination
                component="div"
                count={42}
                page={saPage}
                onPageChange={(_, newPage) => setSaPage(newPage)}
                rowsPerPage={saRowsPerPage}
                onRowsPerPageChange={(e) => {
                  setSaRowsPerPage(parseInt(e.target.value, 10));
                  setSaPage(0);
                }}
              />
            </Box>
          </Box>
        )}

        {/* ── MULTIPLE ARM VIEW TAB ──────────────────────────────────────── */}
        {activeTab === 1 && (
          <Box sx={{ pt: 1 }}>
            {/* Filters: SESSION, TERM, PROGRAMME, CLASS (NO ARM DROPDOWN) */}
            <Grid container spacing={2} sx={{ mb: 3 }} alignItems="center">
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Session</InputLabel>
                  <Select value={maSession} label="Session" onChange={(e) => setMaSession(e.target.value)}>
                    <MenuItem value="2025/2026">2025/2026</MenuItem>
                    <MenuItem value="2024/2025">2024/2025</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Term</InputLabel>
                  <Select value={maTerm} label="Term" onChange={(e) => setMaTerm(e.target.value)}>
                    <MenuItem value="Third Term">Third Term</MenuItem>
                    <MenuItem value="Second Term">Second Term</MenuItem>
                    <MenuItem value="First Term">First Term</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Programme</InputLabel>
                  <Select value={maProgramme} label="Programme" onChange={(e) => setMaProgramme(e.target.value)}>
                    <MenuItem value="Junior Secondary">Junior Secondary</MenuItem>
                    <MenuItem value="Senior Secondary">Senior Secondary</MenuItem>
                    <MenuItem value="Primary">Primary</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Class</InputLabel>
                  <Select value={maClass} label="Class" onChange={(e) => setMaClass(e.target.value)}>
                    <MenuItem value="Junior Secondary 1">Junior Secondary 1</MenuItem>
                    <MenuItem value="Junior Secondary 2">Junior Secondary 2</MenuItem>
                    <MenuItem value="Junior Secondary 3">Junior Secondary 3</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Action Row */}
            <Grid container spacing={2} sx={{ mb: 3 }} alignItems="center">
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search learner..."
                  value={maSearch}
                  onChange={(e) => setMaSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                  <Button variant="contained" size="small" fullWidth={{ xs: true, sm: false }} startIcon={<FilterIcon />} onClick={handleApplyMultiFilter}>
                    Filter Results
                  </Button>
                  <Button variant="contained" color="success" size="small" fullWidth={{ xs: true, sm: false }} startIcon={<SaveIcon />}>
                    Submit Changes
                  </Button>
                </Stack>
              </Grid>
            </Grid>

            {/* Table */}
            <TableContainer elevation={0} variant="outlined" sx={{ borderRadius: 2, overflowX: 'auto' }}>
              <Table sx={{ minWidth: 600 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ minWidth: 280 }}>Student Basic Info</TableCell>
                    {ARMS.map((arm) => (
                      <TableCell key={arm.id} align="center" sx={{ minWidth: 120 }}>
                        <Typography variant="subtitle2" fontWeight={700}>
                          Arm {arm.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          ({arm.count} Learners)
                        </Typography>
                        <Stack direction="row" spacing={0.5} justifyContent="center" mt={0.5}>
                          <Tooltip title="Check All">
                            <IconButton size="small">
                              <CheckCircleIcon color="success" fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Uncheck All">
                            <IconButton size="small">
                              <CancelOutlinedIcon color="error" fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {multiStudents
                    .filter((s) => maSearch === '' || s.name.toLowerCase().includes(maSearch.toLowerCase()))
                    .map((student, idx) => (
                      <TableRow key={student.id} hover>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={1.5}>
                            <Typography variant="body2" color="text.secondary" fontWeight={600}>
                              {idx + 1}
                            </Typography>
                            <Avatar sx={{ width: 36, height: 36, fontSize: 12 }}>
                              {student.name.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                {student.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" display="block">
                                {student.info}
                              </Typography>
                              <Chip
                                label={student.admissionNo}
                                size="small"
                                color="error"
                                variant="outlined"
                                sx={{ height: 18, fontSize: '10px', mt: 0.25 }}
                              />
                            </Box>
                          </Stack>
                        </TableCell>
                        {ARMS.map((arm) => (
                          <TableCell key={arm.id} align="center">
                            <IconButton
                              size="small"
                              onClick={() => toggleArmEnrollment(student.id, arm.id)}
                            >
                              {student.arms[arm.id] ? (
                                <CheckCircleIcon color="success" fontSize="medium" />
                              ) : (
                                <CancelOutlinedIcon color="error" fontSize="medium" />
                              )}
                            </IconButton>
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ pt: 2 }}>
              <TablePagination
                component="div"
                count={212}
                page={maPage}
                onPageChange={(_, newPage) => setMaPage(newPage)}
                rowsPerPage={maRowsPerPage}
                onRowsPerPageChange={(e) => {
                  setMaRowsPerPage(parseInt(e.target.value, 10));
                  setMaPage(0);
                }}
              />
            </Box>
          </Box>
        )}
      </ParentCard>

      {/* ── Single Arm View Context Menu (View Detail & Change Class) ─── */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{ sx: { borderRadius: 2, minWidth: 160 } }}
      >
        <MenuItem onClick={handleOpenDetail}>
          <ViewDetailIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1.5 }} />
          View Detail
        </MenuItem>
        <MenuItem onClick={handleOpenChangeClass}>
          <ChangeClassIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1.5 }} />
          Change Class
        </MenuItem>
      </Menu>

      {/* ── Class Enrollment Breakdown Modal ──────────────────────────────── */}
      <Dialog
        open={Boolean(selectedEnrollmentClass)}
        onClose={() => setSelectedEnrollmentClass(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <SchoolIcon color="primary" />
          Class Enrollment Breakdown — {selectedEnrollmentClass?.label}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Total Students in {selectedEnrollmentClass?.label}: <strong>{selectedEnrollmentClass?.count}</strong>
            </Typography>
            <Stack direction="row" spacing={1.5} flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
              {selectedEnrollmentClass?.arms.map((armItem) => (
                <Chip
                  key={armItem.arm}
                  label={`Arm ${armItem.arm}: ${armItem.count} Students`}
                  color="primary"
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
              ))}
            </Stack>
          </Box>

          <Divider sx={{ my: 1.5 }} />

          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
            Student List by Arms
          </Typography>
          <TableContainer elevation={0} variant="outlined" sx={{ borderRadius: 2, overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Student Name</TableCell>
                  <TableCell>Admission No</TableCell>
                  <TableCell>Arm</TableCell>
                  <TableCell>Gender</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {MOCK_CLASS_STUDENTS.map((st, i) => (
                  <TableRow key={st.id}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell fontWeight={600}>{st.name}</TableCell>
                    <TableCell>{st.admissionNo}</TableCell>
                    <TableCell>Arm {st.arm}</TableCell>
                    <TableCell>
                      {/* Gender chip without icon */}
                      <Chip
                        label={st.gender}
                        size="small"
                        color={st.gender === 'MALE' ? 'primary' : 'success'}
                        sx={{ fontSize: 10, height: 18, fontWeight: 700 }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedEnrollmentClass(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* ── Student Detail Modal ────────────────────────────────────────── */}
      <Dialog open={detailModalOpen} onClose={() => setDetailModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Student Details</DialogTitle>
        <DialogContent dividers>
          {selectedRow && (
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontSize: 20 }}>
                  {selectedRow.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    {selectedRow.name}
                  </Typography>
                  <Chip label={selectedRow.admissionNo} size="small" color="success" sx={{ mt: 0.5 }} />
                </Box>
              </Box>
              <Typography variant="body2">
                <strong>Gender:</strong> {selectedRow.gender}
              </Typography>
              <Typography variant="body2">
                <strong>Current Class/Arm:</strong> {selectedRow.classArm}
              </Typography>
              <Typography variant="body2">
                <strong>Parent/Guardian:</strong> {selectedRow.guardianName} ({selectedRow.guardianPhone})
              </Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* ── Change Class Modal ─────────────────────────────────────────── */}
      <Dialog open={changeClassModalOpen} onClose={() => setChangeClassModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Change Student Class</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Transfer <strong>{selectedRow?.name}</strong> to a different class or arm.
            </Typography>
            <FormControl fullWidth size="small">
              <InputLabel>New Class</InputLabel>
              <Select value={newClass} label="New Class" onChange={(e) => setNewClass(e.target.value)}>
                <MenuItem value="Pry 1">Pry 1</MenuItem>
                <MenuItem value="Pry 2">Pry 2</MenuItem>
                <MenuItem value="Pry 3">Pry 3</MenuItem>
                <MenuItem value="Pry 4 (Diamond)">Pry 4 (Diamond)</MenuItem>
                <MenuItem value="Pry 5">Pry 5</MenuItem>
                <MenuItem value="Pry 6">Pry 6</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChangeClassModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setChangeClassModalOpen(false)}>
            Save Change
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default ClassRegister;
