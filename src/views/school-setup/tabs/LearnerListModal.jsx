import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
} from '@mui/material';
import PropTypes from 'prop-types';
import { getLearnersByClass } from '../../../context/TenantContext/services/tenant.service';

const LearnerListModal = ({ open, onClose, classId, className }) => {
  const [learners, setLearners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && classId) {
      fetchLearners();
    }
  }, [open, classId]);

  const fetchLearners = async () => {
    setLoading(true);
    try {
      const data = await getLearnersByClass(classId);
      setLearners(data || []);
    } catch (error) {
      console.error('Failed to fetch learners:', error);
      setLearners([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Learners in {className}</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : learners.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No learners found for this class.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Learner ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Last Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>First Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Middle Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Gender</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Arm</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {learners.map((learner, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{learner.learner_id}</TableCell>
                    <TableCell>{learner.lastname}</TableCell>
                    <TableCell>{learner.firstname}</TableCell>
                    <TableCell>{learner.middlename || '-'}</TableCell>
                    <TableCell>{learner.gender}</TableCell>
                    <TableCell>{learner.arm}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

LearnerListModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  classId: PropTypes.number,
  className: PropTypes.string,
};

export default LearnerListModal;
