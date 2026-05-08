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
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
import { School as SchoolIcon } from '@mui/icons-material';
import ReusableModal from 'src/components/shared/ReusableModal';
import { useNotification } from 'src/hooks/useNotification';

// ── Confirmation dialog ───────────────────────────────────────────────────────
const ConfirmApplyDialog = ({ batch, onConfirm, onCancel }) => {
  if (!batch) return null;
  return (
    <Dialog open onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box
            sx={{
              width: 40, height: 40, borderRadius: '50%',
              bgcolor: 'primary.light',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
          >
            <SchoolIcon sx={{ color: 'primary.main', fontSize: 22 }} />
          </Box>
          <Typography variant="subtitle1" fontWeight={700}>Confirm Application</Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        <Typography variant="body2" color="text.secondary" mb={2}>
          You are about to apply for the following admission batch:
        </Typography>

        <Paper variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Session
          </Typography>
          <Typography variant="subtitle2" fontWeight={700} mb={1.5}>
            {batch.session_term}
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Batch
          </Typography>
          <Typography variant="subtitle2" fontWeight={700} mb={1.5}>
            {batch.application_batch}
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.5 }}>
            Available Classes
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={0.5} mb={1.5}>
            {batch.classes.map((cls) => (
              <Chip key={cls} label={cls} size="small"
                sx={{ bgcolor: 'primary.light', color: 'primary.main', fontWeight: 600, fontSize: 11, height: 22 }} />
            ))}
          </Stack>

          <Divider sx={{ my: 1.5 }} />

          <Box display="flex" justifyContent="space-between" mb={0.75}>
            <Typography variant="body2" color="text.secondary">Pre-Application Fee</Typography>
            <Typography variant="body2" fontWeight={700}>₦{batch.pre_application_fee.toLocaleString()}</Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">Post-Admission Fee</Typography>
            <Typography variant="body2" fontWeight={700}>₦{batch.post_admission_fee.toLocaleString()}</Typography>
          </Box>
        </Paper>

        <Typography variant="caption" color="text.secondary" display="block" mt={2}>
          By proceeding, you confirm that you want to start a new admission application for this batch.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onCancel} color="inherit" sx={{ fontWeight: 600 }}>
          Cancel
        </Button>
        <Button onClick={onConfirm} variant="contained" sx={{ fontWeight: 700, px: 3 }}>
          Yes, Apply Now
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ── Main modal ────────────────────────────────────────────────────────────────
const AdmissionBatchModal = ({ open, onClose, onApply }) => {
  const notify = useNotification();
  const [batches,    setBatches]    = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [confirmBatch, setConfirmBatch] = useState(null); // batch pending confirmation

  useEffect(() => {
    if (open) {
      setSelectedId(null);
      setConfirmBatch(null);
      fetchBatches();
    }
  }, [open]);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      setBatches([
        { id: 1, session_term: '2025 / 2026', application_batch: 'Junior Secondary Admission Batch 1', classes: ['JSS1', 'JSS2', 'JSS3', 'SSS1', 'SSS2', 'SSS3'], pre_application_fee: 5000,  post_admission_fee: 15000 },
        { id: 2, session_term: '2025 / 2026', application_batch: 'Junior Secondary Admission Batch 2', classes: ['JSS1', 'JSS2', 'JSS3', 'SSS1', 'SSS2', 'SSS3'], pre_application_fee: 7000,  post_admission_fee: 17000 },
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

  const handleConfirmed = () => {
    onApply(confirmBatch);
    setConfirmBatch(null);
    onClose();
  };

  return (
    <>
      <ReusableModal open={open} onClose={onClose} title="Select Admission Batch" size="extraLarge">
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
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>{batch.session_term}</Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">{batch.application_batch}</Typography>
                      </TableCell>

                      <TableCell>
                        <Stack direction="row" flexWrap="wrap" gap={0.5}>
                          {batch.classes.map((cls) => (
                            <Chip key={cls} label={cls} size="small"
                              sx={{ bgcolor: '#E8E8E8', color: '#333', fontWeight: 600, fontSize: 11, height: 22 }} />
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
                          onClick={(e) => { e.stopPropagation(); setConfirmBatch(batch); }}
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

      {/* Confirmation dialog — rendered outside the main modal so it stacks on top */}
      {confirmBatch && (
        <ConfirmApplyDialog
          batch={confirmBatch}
          onConfirm={handleConfirmed}
          onCancel={() => setConfirmBatch(null)}
        />
      )}
    </>
  );
};

export default AdmissionBatchModal;
