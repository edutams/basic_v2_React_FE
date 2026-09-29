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
} from '@mui/material';
import { School as SchoolIcon } from '@mui/icons-material';

import tenantApi from '@/api/tenant/tenant_api';

const StatCardBreakdownModal = ({ open, stat, onClose }) => {
  const [students, setStudents] = useState([]);
  const [classArmsSummary, setClassArmsSummary] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !stat || stat.id !== 'students') return;

    let isMounted = true;
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const res = await tenantApi.get('/allocations/my-allocations');
        const allocationsData = res?.data?.data ?? {};

        const list = allocationsData.students ?? [];
        const count = Number(allocationsData.total_students ?? list.length);

        // Group summary count by class arm
        const armSummaryMap = new Map();
        list.forEach((reg) => {
          const className = reg.class_name ?? '';
          const armName = reg.class_arm_names ?? '';
          const fullArmName =
            className && armName
              ? `${className} - ${armName}`
              : className || armName || 'Class Arm';
          const armId = reg.class_arm_id || fullArmName;

          if (!armSummaryMap.has(armId)) {
            armSummaryMap.set(armId, { arm_name: fullArmName, count: 0 });
          }
          armSummaryMap.get(armId).count += 1;
        });

        if (isMounted) {
          setTotalCount(count);
          setStudents(list);
          setClassArmsSummary(Array.from(armSummaryMap.values()));
        }
      } catch (err) {
        console.error('Failed to fetch breakdown students:', err);
        if (isMounted) {
          setStudents([]);
          setClassArmsSummary([]);
          setTotalCount(0);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchStudents();
    return () => {
      isMounted = false;
    };
  }, [open, stat]);

  if (!stat) return null;
  const isStudentsStat = stat.id === 'students';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
        <SchoolIcon color="primary" />
        {stat.label} Breakdown —{' '}
        <Typography component="span" color="primary" fontWeight={700}>
          {totalCount} Students
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        {isStudentsStat ? (
          <>
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
                    <TableCell>S/N</TableCell>
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
                    students.map((reg, i) => {
                      const gender = reg.sex.toUpperCase();

                      return (
                        <TableRow key={reg.id || i}>
                          <TableCell>{i + 1}</TableCell>
                          <TableCell>{reg?.student_registration_id}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>
                            {reg?.fname} {reg?.lname} {reg?.mname}
                          </TableCell>
                          <TableCell>
                            {reg?.class_name} ({reg?.class_arm_names})
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={gender}
                              size="small"
                              color={gender === 'MALE' ? 'primary' : 'success'}
                              sx={{ fontSize: 10, height: 18, fontWeight: 700 }}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        ) : (
          <Box
            sx={{
              p: 4,
              borderRadius: 2,
              border: '1px dashed rgba(69, 67, 67, 0.3)',
              textAlign: 'center',
              bgcolor: '#fafafa',
            }}
          >
            <Typography sx={{ fontSize: 32, fontWeight: 800, color: stat.color }}>
              {stat.value}
            </Typography>
            <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 1 }}>
              Detailed breakdown for {stat.label} coming soon.
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 2.5, py: 1.5 }}>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default StatCardBreakdownModal;
