import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography,
  RadioGroup, FormControlLabel, Radio, Paper, IconButton, useTheme,
} from '@mui/material';
import { IconX, IconWand, IconDownload, IconCloudUpload, IconEdit } from '@tabler/icons-react';

const ActionSelectionDialog = ({ open, onClose, allocation, onProceed }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [selectedAction, setSelectedAction] = useState('download');

  if (!allocation) return null;

  const handleProceed = () => {
    onProceed(selectedAction, allocation);
  };

  const options = [
    {
      value: 'download',
      label: 'Download Score Sheet',
      desc: 'Download Excel template for offline score entry',
      icon: <IconDownload size={20} color={theme.palette.primary.main} />,
    },
    {
      value: 'upload',
      label: 'Upload Score Sheet',
      desc: 'Upload completed Excel sheet for CA & Exam scores',
      icon: <IconCloudUpload size={20} color={theme.palette.success.main} />,
    },
    {
      value: 'direct',
      label: 'Direct Score Entry',
      desc: 'Input student scores directly in the web browser',
      icon: <IconEdit size={20} color={theme.palette.warning.main} />,
    },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth paperprops={{ sx: { borderRadius: '12px' } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography variant="h6" fontWeight={700}>
          Action Selection Pop-Up
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <IconX size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ py: 2 }}>
        {/* Subtitle / Question Box */}
        <Paper
          elevation={0}
          sx={{
            p: 1.25,
            mb: 2,
            borderRadius: '6px',
            border: '2px dashed',
            borderColor: isDark ? 'rgba(128, 190, 90, 0.4)' : '#80BE5A',
            backgroundColor: isDark ? 'rgba(128, 190, 90, 0.08)' : '#F9FFF9',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              p: 0.5,
              borderRadius: '6px',
              backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconWand size={20} color="#80BE5A" />
          </Box>
          <Box>
            <Typography variant="subtitle2" fontWeight={700} color="text.primary" sx={{ fontSize: '0.85rem' }}>
              {allocation.subject_name} ({allocation.className})
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.725rem' }}>
              Select an option below to proceed
            </Typography>
          </Box>
        </Paper>

        <RadioGroup value={selectedAction} onChange={(e) => setSelectedAction(e.target.value)}>
          {options.map((opt) => {
            const isSelected = selectedAction === opt.value;
            return (
              <Paper
                key={opt.value}
                elevation={0}
                onClick={() => setSelectedAction(opt.value)}
                sx={{
                  p: 1,
                  px: 1.5,
                  mb: 1,
                  borderRadius: '6px',
                  border: '1px solid',
                  borderColor: isSelected
                    ? theme.palette.primary.main
                    : isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
                  backgroundColor: isSelected
                    ? (isDark ? 'rgba(25, 118, 210, 0.12)' : '#E9F7EF')
                    : (isDark ? 'rgba(255,255,255,0.02)' : '#F9FAFB'),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                  {opt.icon}
                  <Box>
                    <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ fontSize: '0.825rem' }}>
                      {opt.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.725rem' }}>
                      {opt.desc}
                    </Typography>
                  </Box>
                </Box>
                <Radio
                  checked={isSelected}
                  value={opt.value}
                  size="small"
                  sx={{ p: 0.5, color: theme.palette.success.main, '&.Mui-checked': { color: theme.palette.success.main } }}
                />
              </Paper>
            );
          })}
        </RadioGroup>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit" sx={{ textTransform: 'none' }}>
          Cancel
        </Button>
        <Button onClick={handleProceed}  >
          Proceed
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ActionSelectionDialog;
