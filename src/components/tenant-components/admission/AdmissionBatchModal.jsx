import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Stack,
  IconButton,
  CircularProgress,
  Alert,
  Checkbox,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useNotification } from '../../../hooks/useNotification';

/**
 * AdmissionBatchModal
 * 
 * Displays available admission batches with session, classes, and fees.
 * User can select a batch and click "Apply Now" to proceed with application.
 */
const AdmissionBatchModal = ({ open, onClose, onApply }) => {
  const notify = useNotification();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);

  useEffect(() => {
    if (open) {
      fetchBatches();
    }
  }, [open]);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const res = await admissionApi.getBatches();
      // setBatches(res?.data?.data ?? []);
      
      // Mock data for now
      const mockBatches = [
        {
          id: 1,
          session_term: '2025 / 2026',
          application_batch: 'Junior Secondary Admission Batch 1',
          classes: ['JSS1', 'JSS2', 'JSS3', 'SSS1', 'SSS2', 'SSS3'],
          pre_application_fee: 5000,
          post_admission_fee: 15000,
          is_active: false,
        },
        {
          id: 2,
          session_term: '2025 / 2026',
          application_batch: 'Junior Secondary Admission Batch 1',
          classes: ['JSS1', 'JSS2', 'JSS3', 'SSS1', 'SSS2', 'SSS3'],
          pre_application_fee: 5000,
          post_admission_fee: 15000,
          is_active: true,
        },
        {
          id: 3,
          session_term: '2025 / 2026',
          application_batch: 'Junior Secondary Admission Batch 1',
          classes: ['JSS1', 'JSS2', 'JSS3', 'SSS1', 'SSS2', 'SSS3'],
          pre_application_fee: 5000,
          post_admission_fee: 15000,
          is_active: false,
        },
        {
          id: 4,
          session_term: '2025 / 2026',
          application_batch: 'Junior Secondary Admission Batch 1',
          classes: ['JSS1', 'JSS2', 'JSS3', 'SSS1', 'SSS2', 'SSS3'],
          pre_application_fee: 5000,
          post_admission_fee: 15000,
          is_active: false,
        },
        {
          id: 5,
          session_term: '2025 / 2026',
          application_batch: 'Junior Secondary Admission Batch 1',
          classes: ['JSS1', 'JSS2', 'JSS3', 'SSS1', 'SSS2', 'SSS3'],
          pre_application_fee: 5000,
          post_admission_fee: 15000,
          is_active: false,
        },
        {
          id: 6,
          session_term: '2025 / 2026',
          application_batch: 'Junior Secondary Admission Batch 1',
          classes: ['JSS1', 'JSS2', 'JSS3', 'SSS1', 'SSS2', 'SSS3'],
          pre_application_fee: 5000,
          post_admission_fee: 15000,
          is_active: false,
        },
        {
          id: 7,
          session_term: '2025 / 2026',
          application_batch: 'Junior Secondary Admission Batch 1',
          classes: ['JSS1', 'JSS2', 'JSS3', 'SSS1', 'SSS2', 'SSS3'],
          pre_application_fee: 5000,
          post_admission_fee: 15000,
          is_active: false,
        },
        {
          id: 8,
          session_term: '2025 / 2026',
          application_batch: 'Junior Secondary Admission Batch 1',
          classes: ['JSS1', 'JSS2', 'JSS3', 'SSS1', 'SSS2', 'SSS3'],
          pre_application_fee: 5000,
          post_admission_fee: 15000,
          is_active: false,
        },
      ];
      
      setBatches(mockBatches);
    } catch (error) {
      notify.error('Failed to fetch admission batches');
      console.error('Error fetching batches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBatch = (batch) => {
    setSelectedBatch(batch.id === selectedBatch ? null : batch.id);
  };

  const handleApplyNow = () => {
    const batch = batches.find((b) => b.id === selectedBatch);
    if (!batch) {
      notify.error('Please select an admission batch');
      return;
    }
    onApply(batch);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="h5" fontWeight={700}>
          Select Admission Batch
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : batches.length === 0 ? (
          <Alert severity="info">No admission batches available at the moment.</Alert>
        ) : (
          <Box>
            {/* Header Row */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '60px 1fr 1fr 2fr 1.5fr 120px',
                gap: 2,
                pb: 2,
                mb: 2,
                borderBottom: '2px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="subtitle2" fontWeight={700} color="text.secondary">
                {/* Checkbox column */}
              </Typography>
              <Typography variant="subtitle2" fontWeight={700} color="text.secondary">
                Session Term
              </Typography>
              <Typography variant="subtitle2" fontWeight={700} color="text.secondary">
                Application Batch
              </Typography>
              <Typography variant="subtitle2" fontWeight={700} color="text.secondary">
                Classes
              </Typography>
              <Typography variant="subtitle2" fontWeight={700} color="text.secondary">
                Fee
              </Typography>
              <Typography variant="subtitle2" fontWeight={700} color="text.secondary">
                Action
              </Typography>
            </Box>

            {/* Batch Rows */}
            <Stack spacing={1.5} sx={{ maxHeight: '50vh', overflowY: 'auto', pr: 1 }}>
              {batches.map((batch) => (
                <Paper
                  key={batch.id}
                  variant="outlined"
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '60px 1fr 1fr 2fr 1.5fr 120px',
                    gap: 2,
                    p: 2,
                    alignItems: 'center',
                    cursor: 'pointer',
                    bgcolor: batch.is_active ? 'primary.lighter' : 'background.paper',
                    borderColor: batch.is_active ? 'primary.main' : 'divider',
                    borderWidth: batch.is_active ? 2 : 1,
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: batch.is_active ? 'primary.lighter' : 'action.hover',
                      borderColor: 'primary.main',
                    },
                  }}
                  onClick={() => handleSelectBatch(batch)}
                >
                  {/* Checkbox */}
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Checkbox
                      checked={selectedBatch === batch.id}
                      onChange={() => handleSelectBatch(batch)}
                      sx={{
                        '& .MuiSvgIcon-root': {
                          fontSize: 24,
                        },
                      }}
                    />
                  </Box>

                  {/* Session Term */}
                  <Typography variant="body2" fontWeight={600}>
                    {batch.session_term}
                  </Typography>

                  {/* Application Batch */}
                  <Typography variant="body2" fontWeight={500}>
                    {batch.application_batch}
                  </Typography>

                  {/* Classes */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {batch.classes.slice(0, 3).map((cls, idx) => (
                      <Chip
                        key={idx}
                        label={cls}
                        size="small"
                        sx={{
                          bgcolor: '#E8E8E8',
                          color: '#000',
                          fontWeight: 600,
                          fontSize: 11,
                          height: 24,
                        }}
                      />
                    ))}
                    {batch.classes.slice(3).map((cls, idx) => (
                      <Chip
                        key={idx + 3}
                        label={cls}
                        size="small"
                        sx={{
                          bgcolor: '#E8E8E8',
                          color: '#000',
                          fontWeight: 600,
                          fontSize: 11,
                          height: 24,
                        }}
                      />
                    ))}
                  </Box>

                  {/* Fee */}
                  <Box>
                    <Typography variant="caption" color="primary.main" display="block">
                      Pre-Application: <strong>₦ {batch.pre_application_fee.toLocaleString()}</strong>
                    </Typography>
                    <Typography variant="caption" color="secondary.main" display="block" mt={0.3}>
                      Post-Admission: <strong>₦ {batch.post_admission_fee.toLocaleString()}</strong>
                    </Typography>
                  </Box>

                  {/* Action */}
                  <Button
                    variant="contained"
                    size="small"
                    disabled={!batch.is_active && selectedBatch !== batch.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedBatch(batch.id);
                      handleApplyNow();
                    }}
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Apply Now
                  </Button>
                </Paper>
              ))}
            </Stack>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AdmissionBatchModal;
