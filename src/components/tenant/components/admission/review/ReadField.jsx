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
    sx={{ '& .MuiInputBase-input': { cursor: 'default' } }}
  />
);

ReadField.propTypes = {
  label:     PropTypes.string.isRequired,
  value:     PropTypes.string,
  multiline: PropTypes.bool,
  rows:      PropTypes.number,
};

export default ReadField;
