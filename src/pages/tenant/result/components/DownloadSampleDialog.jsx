import { useState } from 'react';
import ReusableModal from '@/components/shared/ReusableModal';
import {
  Box, Button, Typography, FormControl, InputLabel, Select, MenuItem, Alert, useTheme,
} from '@mui/material';
import { IconDownload } from '@tabler/icons-react';

const dummyCaType = [
  { display_name: 'CA1', entities: { entity1: { display_name: 'Test', max_score: 10 } } },
  { display_name: 'CA2', entities: { entity1: { display_name: 'Assignment', max_score: 10 } } },
];

const DownloadSampleDialog = ({ open, onClose, allocation }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({ category: '', type: '' });
  const [caType] = useState(dummyCaType);
  const [displayName, setDisplayName] = useState('');

  const handleCategoryChange = (category) => {
    setFilter({ category, type: '' });
    if (category === 'exam') {
      setDisplayName('Exam');
    } else {
      setDisplayName('');
    }
  };

  const handleTypeChange = (typeIndex) => {
    setFilter({ ...filter, type: typeIndex });
    setDisplayName(caType[typeIndex]?.display_name || '');
  };

  const handleDownload = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const fileName = `${allocation?.className || 'Class'}_${allocation?.subject_name || 'Subject'}_${displayName}_result.xlsx`;
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
    setFilter({ category: '', type: '' });
    setDisplayName('');
    onClose();
  };

  return (
    <ReusableModal
      open={open}
      onClose={handleClose}
      title={`Download Sample — ${allocation?.subject_name} (${allocation?.className})`}
      size="small"
    >
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Select a category and type to download the score sheet template.
      </Typography>

      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
        <InputLabel>Category</InputLabel>
        <Select
          value={filter.category}
          label="Category"
          onChange={(e) => handleCategoryChange(e.target.value)}
        >
          <MenuItem value="">--Select category--</MenuItem>
          <MenuItem value="ca">CA</MenuItem>
          <MenuItem value="exam">Exam</MenuItem>
        </Select>
      </FormControl>

      {filter.category === 'ca' && (
        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={filter.type}
            label="Type"
            onChange={(e) => handleTypeChange(e.target.value)}
          >
            <MenuItem value="">--Select Type--</MenuItem>
            {caType.map((type, index) => (
              <MenuItem key={type.display_name} value={index}>
                {type.display_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {filter.category && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Click download to get the Excel template for <strong>{displayName || filter.category}</strong> scores.
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
          disabled={!filter.category || loading}
          onClick={handleDownload}
        >
          {loading ? 'Downloading...' : 'Download'}
        </Button>
      </Box>
    </ReusableModal>
  );
};

export default DownloadSampleDialog;
