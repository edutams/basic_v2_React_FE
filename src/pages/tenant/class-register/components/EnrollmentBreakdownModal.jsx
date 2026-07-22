import React from 'react';
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
} from '@mui/material';
import { School as SchoolIcon } from '@mui/icons-material';

const MOCK_CLASS_STUDENTS = [
  { id: 1, name: 'ABANISE Akorede Micheal', admissionNo: '2019A110510094', gender: 'MALE', arm: 'Diamond' },
  { id: 2, name: 'ABDRAMON Temitope Hasanat', admissionNo: '2020A110510008', gender: 'FEMALE', arm: 'Gold' },
  { id: 3, name: 'ABDUL HAMMED Muhammed', admissionNo: '2020A110510101', gender: 'MALE', arm: 'Diamond' },
  { id: 4, name: 'ADEBAYO Olawalarami Loveth', admissionNo: '2024C1111600021', gender: 'FEMALE', arm: 'Silver' },
  { id: 5, name: 'AKINTOLA Fatimah Oluwaseun', admissionNo: '2021A110510044', gender: 'FEMALE', arm: 'Gold' },
];

const EnrollmentBreakdownModal = ({ selectedClass, onClose }) => {
  if (!selectedClass) return null;

  return (
    <Dialog open={Boolean(selectedClass)} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
        <SchoolIcon color="primary" />
        Class Enrollment Breakdown — {selectedClass.label}
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Total Students in {selectedClass.label}: <strong>{selectedClass.count}</strong>
          </Typography>
          <Stack direction="row" spacing={1.5} flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
            {selectedClass.arms.map((armItem) => (
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
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EnrollmentBreakdownModal;
