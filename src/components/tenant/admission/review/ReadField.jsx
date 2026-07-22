import { TextField } from '@mui/material';
import PropTypes from 'prop-types';

const ReadField = ({ label, value, multiline = false, rows = 1 }) => (
  <TextField
    label={label}
    value={value ?? ''}
    fullWidth
    multiline={multiline}
    rows={multiline ? rows : undefined}
    slotProps={{ input: { readOnly: true } }}
    sx={{
      '& .MuiInputBase-input': {
        cursor: 'default',
      },
      '& .MuiOutlinedInput-root': {
        bgcolor: (theme) =>
          theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'grey.50',
      },
      '& .MuiInputLabel-root': {
        fontWeight: 600,
        fontSize: '0.75rem',
      },
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: (theme) =>
          theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)',
      },
    }}
  />
);

ReadField.propTypes = {
  label:     PropTypes.string.isRequired,
  value:     PropTypes.string,
  multiline: PropTypes.bool,
  rows:      PropTypes.number,
};

export default ReadField;
