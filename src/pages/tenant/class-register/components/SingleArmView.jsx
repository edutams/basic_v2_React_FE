import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Avatar,
  IconButton,
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
  TablePagination,
  useTheme,
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  FileDownload as ExportIcon,
  FilterAlt as FilterIcon,
  Phone as PhoneIcon,
  VisibilityOutlined as ViewDetailIcon,
  SwapHoriz as ChangeClassIcon,
} from '@mui/icons-material';
import StudentDetailModal from './StudentDetailModal';
import ChangeClassModal from './ChangeClassModal';

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

const SingleArmView = () => {
  const theme = useTheme();

  // ── Filter States ─────────────────────────────────────────
  const [saSession, setSaSession] = useState('2024/2025');
  const [saTerm, setSaTerm] = useState('Third Term');
  const [saProgramme, setSaProgramme] = useState('Primary');
  const [saClass, setSaClass] = useState('Pry 4');
  const [saArm, setSaArm] = useState('A (Diamond)');
  const [saSearch, setSaSearch] = useState('');

  // ── Menu / Modal States ───────────────────────────────────
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [changeClassModalOpen, setChangeClassModalOpen] = useState(false);

  // ── Pagination ────────────────────────────────────────────
  const [saPage, setSaPage] = useState(0);
  const [saRowsPerPage, setSaRowsPerPage] = useState(10);

  // ── Filtered Students ─────────────────────────────────────
  const filteredStudents = SINGLE_ARM_STUDENTS.filter(
    (s) =>
      saSearch === '' ||
      s.name.toLowerCase().includes(saSearch.toLowerCase()) ||
      s.admissionNo.includes(saSearch),
  );

  // ── Handlers ──────────────────────────────────────────────
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
    setChangeClassModalOpen(true);
  };

  const handleApplyFilter = () => {
    // Will integrate with API in future implementation
    // Fetches students based on filter params
  };

  const handleExport = () => {
    // Will integrate with API export endpoint
  };

  return (
    <Box sx={{ pt: 1 }}>
      {/* ── Filter Row ────────────────────────────────────── */}
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

      {/* ── Search & Action Row ──────────────────────────── */}
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
            <Button variant="contained" size="small" fullWidth={{ xs: true, sm: false }} startIcon={<FilterIcon />} onClick={handleApplyFilter}>
              Apply Filter
            </Button>
            <Button variant="outlined" size="small" fullWidth={{ xs: true, sm: false }} startIcon={<ExportIcon />} onClick={handleExport}>
              Export List
            </Button>
          </Stack>
        </Grid>
      </Grid>

      {/* ── Table ────────────────────────────────────────── */}
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
            {filteredStudents.map((student) => (
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

      {/* ── Pagination ──────────────────────────────────── */}
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

      {/* ── Context Menu ────────────────────────────────── */}
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

      {/* ── Modals ──────────────────────────────────────── */}
      <StudentDetailModal
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        student={selectedRow}
      />
      <ChangeClassModal
        open={changeClassModalOpen}
        onClose={() => setChangeClassModalOpen(false)}
        student={selectedRow}
      />
    </Box>
  );
};

export default SingleArmView;
