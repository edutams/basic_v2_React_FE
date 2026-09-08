import { useState } from 'react';
import ReusableModal from '@/components/shared/ReusableModal';
import {
  Box, Button, Typography, FormControl, InputLabel, Select, MenuItem, Alert, useTheme,
} from '@mui/material';
import { IconDownload } from '@tabler/icons-react';

const DownloadCombinedDialog = ({ open, onClose, allocations }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('');

  const className = allocations?.[0]?.className || 'Selected Class';

  const handleDownload = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const fileName = `${className}_${category}_result.xlsx`;
      const link = document.createElement('a');
      link.href = '#';
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onClose();
    }, 1000);
  };

  const handleClose = () => {
    setCategory('');
    onClose();
  };

  return (
    <ReusableModal
      open={open}
      onClose={handleClose}
      title={`Download Bulk — ${className} Combined Subjects`}
      size="small"
    >
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Select a category to download the combined score sheet template.
      </Typography>

      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
        <InputLabel>Category</InputLabel>
        <Select
          value={category}
          label="Category"
          onChange={(e) => setCategory(e.target.value)}
        >
          <MenuItem value="">--Select category--</MenuItem>
          <MenuItem value="ca">CA</MenuItem>
          <MenuItem value="exam">Exam</MenuItem>
        </Select>
      </FormControl>

      {category && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Click download to get the combined Excel template for <strong>{category.toUpperCase()}</strong> scores.
        </Alert>
      )}

      <Box display="flex" justifyContent="flex-end" gap={1} sx={{ mt: 3 }}>
        <Button variant="contained" size="small" color="inherit" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          size="small"
          startIcon={<IconDownload size={16} />}
          disabled={!category || loading}
          onClick={handleDownload}
        >
          {loading ? 'Downloading...' : 'Download'}
        </Button>
      </Box>
    </ReusableModal>
  );
};

export default DownloadCombinedDialog;
