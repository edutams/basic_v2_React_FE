import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Button,
  Chip,
  Stack,
  Checkbox,
  CircularProgress,
  Alert,
} from '@mui/material';
import ReusableModal from 'src/components/shared/ReusableModal';
import { useNotification } from 'src/hooks/useNotification';


const AdmissionBatchModal = ({ open, onClose, onApply }) => {
  const notify = useNotification();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    if (open) {
      setSelectedId(null);
      fetchBatches();
    }
  }, [open]);

  const fetchBatches = async () => {
    try {
      setLoading(true);

      setBatches([
        { id: 1, session_term: '2025 / 2026', application_batch: 'Junior Secondary Admission Batch 1', classes: ['JSS1', 'JSS2', 'JSS3', 'SSS1', 'SSS2', 'SSS3'], pre_application_fee: 5000, post_admission_fee: 15000 },
        { id: 2, session_term: '2025 / 2026', application_batch: 'Junior Secondary Admission Batch 2', classes: ['JSS1', 'JSS2', 'JSS3', 'SSS1', 'SSS2', 'SSS3'], pre_application_fee: 7000, post_admission_fee: 17000 },
        { id: 3, session_term: '2025 / 2026', application_batch: 'Junior Secondary Admission Batch 3', classes: ['JSS1', 'JSS2', 'JSS3', 'SSS1', 'SSS2', 'SSS3'], pre_application_fee: 10000, post_admission_fee: 20000 },
        { id: 4, session_term: '2025 / 2026', application_batch: 'Junior Secondary Admission Batch 4', classes: ['JSS1', 'JSS2', 'JSS3', 'SSS1', 'SSS2', 'SSS3'], pre_application_fee: 15000, post_admission_fee: 25000 },
        { id: 5, session_term: '2025 / 2026', application_batch: 'Junior Secondary Admission Batch 5', classes: ['JSS1', 'JSS2', 'JSS3', 'SSS1', 'SSS2', 'SSS3'], pre_application_fee: 20000, post_admission_fee: 30000 },
      ]);
    } catch (error) {
      notify.error('Failed to fetch admission batches');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyRow = (batch) => {
    onApply(batch);
    onClose();
  };

  return (
    <ReusableModal
      open={open}
      onClose={onClose}
      title="Select Admission Batch"
      size="extraLarge"
    >
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : batches.length === 0 ? (
        <Alert severity="info">No admission batches available at the moment.</Alert>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell padding="checkbox" />
                <TableCell sx={{ fontWeight: 600, width: '15%' }}>Session Term</TableCell>
                <TableCell sx={{ fontWeight: 700, width: '30%' }}>Application Batch</TableCell>
                <TableCell sx={{ fontWeight: 700, width: '20%' }}>Classes</TableCell>
                <TableCell sx={{ fontWeight: 700, width: '25%' }}>Fee</TableCell>
                <TableCell sx={{ fontWeight: 700, width: '10%' }} align="center">Action</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {batches.map((batch) => {
                const isSelected = selectedId === batch.id;
                return (
                  <TableRow
                    key={batch.id}
                    hover
                    selected={isSelected}
                    onClick={() => setSelectedId(isSelected ? null : batch.id)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isSelected}
                        onChange={() => setSelectedId(isSelected ? null : batch.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {batch.session_term}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">
                        {batch.application_batch}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Stack direction="row" flexWrap="wrap" gap={0.5}>
                        {batch.classes.map((cls) => (
                          <Chip
                            key={cls}
                            label={cls}
                            size="small"
                            sx={{
                              bgcolor: '#E8E8E8',
                              color: '#333',
                              fontWeight: 600,
                              fontSize: 11,
                              height: 22,
                            }}
                          />
                        ))}
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Typography variant="caption" color="primary.main" display="block" fontWeight={600}>
                        Pre-Application :{' '}
                        <strong style={{ color: '#000', fontWeight: 600 }}>₦ {batch.pre_application_fee.toLocaleString()}</strong>
                      </Typography>
                      <Typography variant="caption" color="primary.main" display="block" fontWeight={600} mt={0.3}>
                        Post-Admission :{' '}
                        <strong style={{ color: '#000', fontWeight: 600 }}>₦ {batch.post_admission_fee.toLocaleString()}</strong>
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Button
                        variant="contained"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplyRow(batch);
                        }}
                        sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}
                      >
                        Apply Now
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </ReusableModal>
  );
};

export default AdmissionBatchModal;
