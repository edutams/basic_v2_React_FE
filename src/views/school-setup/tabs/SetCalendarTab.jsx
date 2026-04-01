import React, { useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  TextField,
} from '@mui/material';
import { IconDotsVertical, IconPlus } from '@tabler/icons-react';
import { Add as AddIcon } from '@mui/icons-material';
import ParentCard from 'src/components/shared/ParentCard';

const SetCalendarTab = ({ onSaveAndContinue }) => {
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = () => {
    setHasChanges(true);
  };
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectAll, setSelectAll] = useState(false);
  const [terms, setTerms] = useState([
    { term: 'First Term', start: '2026-01-12', end: '2026-03-21', active: true, selected: false },
    { term: 'Second Term', start: '2026-01-12', end: '2026-03-21', active: false, selected: false },
    { term: 'Third Term', start: '2026-01-12', end: '2026-03-21', active: false, selected: false },
  ]);

  const handleMenuOpen = (event, item) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  const handleToggleActive = (termName) => {
    setTerms(
      terms.map((term) => (term.term === termName ? { ...term, active: !term.active } : term)),
    );
    setHasChanges(true);
    handleMenuClose();
  };

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setTerms(terms.map((term) => ({ ...term, selected: newSelectAll })));
  };

  const handleToggleSelect = (termName) => {
    setTerms(
      terms.map((term) => (term.term === termName ? { ...term, selected: !term.selected } : term)),
    );
    setHasChanges(true);
  };

  const generateWeeks = [
    { week: 'Week 1', start: '2026-01-12', end: '2026-01-18', status: 'Generated' },
    { week: 'Week 2', start: '2026-01-19', end: '2026-01-25', status: 'Generated' },
    { week: 'Week 3', start: '2026-01-26', end: '2026-02-01', status: 'Pending' },
    { week: 'Week 4', start: '2026-02-02', end: '2026-02-08', status: 'Pending' },
    { week: 'Week 5', start: '2026-02-09', end: '2026-02-15', status: 'Pending' },
  ];

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={3}>
        {/* Academic Terms Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <ParentCard
            title={
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h5">Academic Terms</Typography>
                <Button variant="contained" startIcon={<AddIcon />}>
                  Add Term
                </Button>
              </Box>
            }
          >
            <Paper variant="outlined">
              <TableContainer>
                <Table sx={{ whiteSpace: 'nowrap' }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            border: selectAll ? 'none' : '2px solid #cbd5e1',
                            bgcolor: selectAll ? '#1976d2' : '#fff',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            cursor: 'pointer',
                          }}
                          onClick={handleSelectAll}
                        >
                          {selectAll && (
                            <Box sx={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>✓</Box>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Term</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Start Date</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>End Date</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }} align="center">
                        Status
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }} align="center">
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {terms.map((item, i) => (
                      <TableRow key={i} hover>
                        <TableCell>
                          <Box
                            onClick={() => handleToggleSelect(item.term)}
                            sx={{
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              border: item.selected ? 'none' : '2px solid #cbd5e1',
                              bgcolor: item.selected ? '#1976d2' : '#fff',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              cursor: 'pointer',
                            }}
                          >
                            {item.selected && (
                              <Box sx={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>✓</Box>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>{item.term}</TableCell>
                        <TableCell>{item.start}</TableCell>
                        <TableCell>{item.end}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={item.active ? 'Active' : 'Inactive'}
                            size="small"
                            sx={{
                              bgcolor: item.active ? '#dcfce7' : '#fee2e2',
                              color: item.active ? '#166534' : '#991b1b',
                              fontWeight: 500,
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton size="small" onClick={(e) => handleMenuOpen(e, item)}>
                            <IconDotsVertical size={18} />
                          </IconButton>
                          <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl) && selectedItem?.term === item.term}
                            onClose={handleMenuClose}
                          >
                            <MenuItem onClick={() => handleToggleActive(item.term)}>
                              {item.active ? 'Deactivate' : 'Activate'}
                            </MenuItem>
                            <MenuItem onClick={handleMenuClose}>Delete Term</MenuItem>
                          </Menu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </ParentCard>
        </Grid>

        {/* Generate Week Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <ParentCard
            title={
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h5">Generate Week</Typography>

                <Box
                  sx={{
                    ml: 'auto',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'primary.main',
                    color: 'primary.main',
                  }}
                >
                  <Typography variant="caption">13 Weeks • 65 school days</Typography>
                </Box>
              </Box>
            }
          >
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                <TextField
                  label="No. of Weeks"
                  type="number"
                  size="small"
                  sx={{ width: 150 }}
                  onChange={handleChange}
                />
                <TextField
                  label="Select Date"
                  type="date"
                  size="small"
                  sx={{ width: 180 }}
                  InputLabelProps={{ shrink: true }}
                />
                <Button variant="contained">Generate</Button>
              </Box>

              <TableContainer>
                <Table sx={{ whiteSpace: 'nowrap' }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Week</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Start Date</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>End Date</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {generateWeeks.map((item, i) => (
                      <TableRow key={i} hover>
                        <TableCell sx={{ fontWeight: 500 }}>{item.week}</TableCell>
                        <TableCell>{item.start}</TableCell>
                        <TableCell>{item.end}</TableCell>
                        <TableCell>
                          <Chip
                            label={item.status}
                            size="small"
                            sx={{
                              bgcolor: item.status === 'Generated' ? '#dcfce7' : '#fef3c7',
                              color: item.status === 'Generated' ? '#166534' : '#92400e',
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </ParentCard>
        </Grid>
      </Grid>
      <Box mt={2} display="flex" justifyContent="flex-end">
        <Button variant="contained" onClick={onSaveAndContinue} disabled={!hasChanges}>
          Save & Continue
        </Button>
      </Box>
    </Box>
  );
};

export default SetCalendarTab;
