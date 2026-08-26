import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Stack,
  Chip,
  Divider,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
  Alert,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  School as SchoolIcon,
  FileDownload as ExportIcon,
  TableChart as TableChartIcon,
  PictureAsPdf as PictureAsPdfIcon,
  ArrowDropDown as ArrowDropDownIcon,
} from '@mui/icons-material';
import classRegisterApi from '@/api/tenant/class-register/classRegisterApi';

const EnrollmentBreakdownModal = ({ selectedClass, onClose }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exportAnchorEl, setExportAnchorEl] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!selectedClass) return;

    const fetchStudents = async () => {
      setLoading(true);
      try {
        const armIds = (selectedClass.arms || []).map((a) => a.arm_id).filter(Boolean);
        const allStudents = [];

        // Fetch students from all arms in parallel
        if (armIds.length > 0) {
          const results = await Promise.allSettled(
            armIds.map((armId) =>
              classRegisterApi.getStudentsByClassArm({ class_arm_id: armId, per_page: 100 }),
            ),
          );

          results.forEach((result) => {
            if (
              result.status === 'fulfilled' &&
              result.value.data?.status &&
              result.value.data?.data
            ) {
              allStudents.push(...result.value.data.data);
            }
          });
        }

        setStudents(allStudents);
      } catch (error) {
        console.error('Failed to fetch students:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [selectedClass]);

  // ── Export Handlers ────────────────────────────────────────────
  const handleExportExcel = async () => {
    setExportAnchorEl(null);
    if (!selectedClass?.class_id) return;
    setExporting(true);
    try {
      const res = await classRegisterApi.exportStudentList({ class_id: selectedClass.class_id });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `student_list_${selectedClass.class_code}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export Excel:', error);
    } finally {
      setExporting(false);
    }
  };

  const handleExportPdf = async () => {
    setExportAnchorEl(null);
    if (!selectedClass?.class_id) return;
    setExporting(true);
    try {
      const res = await classRegisterApi.exportStudentListPdf({ class_id: selectedClass.class_id });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `student_list_${selectedClass.class_code}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export PDF:', error);
    } finally {
      setExporting(false);
    }
  };

  if (!selectedClass) return null;

  return (
    <Dialog open={Boolean(selectedClass)} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
        <SchoolIcon color="primary" />
        Class Enrollment Breakdown —{' '}
        <Typography component="span" color="primary" fontWeight={700}>
          {selectedClass.class_code}
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Total Students in {selectedClass.class_name}: <strong>{selectedClass.total}</strong>
          </Typography>
          <Stack direction="row" spacing={1.5} flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
            {(selectedClass.arms || []).map((armItem) => (
              <Chip
                key={armItem.arm_id}
                label={`Arm ${armItem.arm_name}: ${armItem.count} Students`}
                color="primary"
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />
            ))}
          </Stack>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
          Student List
        </Typography>
        <TableContainer
          elevation={0}
          variant="outlined"
          sx={{ borderRadius: 2, overflowX: 'auto' }}
        >
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Admission No</TableCell>
                <TableCell>Student Name</TableCell>
                <TableCell>Arm</TableCell>
                <TableCell>Gender</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Alert
                      severity="info"
                      sx={{
                        justifyContent: 'center',
                        textAlign: 'center',
                        '& .MuiAlert-icon': { mr: 1.5 },
                      }}
                    >
                      No students found.
                    </Alert>
                  </TableCell>
                </TableRow>
              ) : (
                students.map((st, i) => (
                  <TableRow key={st.student_reg_id || i}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>{st.admission_no}</TableCell>
                    <TableCell fontWeight={600}>{st.name}</TableCell>
                    <TableCell>{st.arm_name ? `Arm ${st.arm_name}` : '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={st.gender}
                        size="small"
                        color={st.gender === 'MALE' ? 'primary' : 'success'}
                        sx={{ fontSize: 10, height: 18, fontWeight: 700 }}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions sx={{ px: 2.5, py: 1.5 }}>
        <Button
          variant="contained"
          size="small"
          startIcon={<ExportIcon />}
          endIcon={<ArrowDropDownIcon />}
          onClick={(e) => setExportAnchorEl(e.currentTarget)}
          disabled={exporting || students.length === 0}
          sx={{ mr: 'auto' }}
        >
          {exporting ? 'Exporting...' : 'Export'}
        </Button>
        <Menu
          anchorEl={exportAnchorEl}
          open={Boolean(exportAnchorEl)}
          onClose={() => setExportAnchorEl(null)}
          PaperProps={{ sx: { borderRadius: 2, minWidth: 160 } }}
        >
          <MenuItem onClick={handleExportExcel} disabled={exporting}>
            <TableChartIcon fontSize="small" sx={{ mr: 1.5, color: 'success.main' }} />
            Export Excel
          </MenuItem>
          <MenuItem onClick={handleExportPdf} disabled={exporting}>
            <PictureAsPdfIcon fontSize="small" sx={{ mr: 1.5, color: 'error.main' }} />
            Export PDF
          </MenuItem>
        </Menu>
        <Button onClick={onClose} disabled={exporting}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EnrollmentBreakdownModal;
