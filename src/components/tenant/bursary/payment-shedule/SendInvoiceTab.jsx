import React, { useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  Chip,
  FormControl,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Button,
  IconButton,
  Menu
} from '@mui/material';
import {
  Search as SearchIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  Refresh as RefreshIcon,
  MoreHoriz as MoreHorizIcon,
  Message as MessageIcon,
  Email as EmailIcon,
  Article as ArticleIcon
} from '@mui/icons-material';
import TiptapEdit from 'src/pages/landlord/views/forms/form-tiptap/TiptapEdit';

const SendInvoiceTab = ({ showSnackbar }) => {
  const [selectedSession, setSelectedSession] = useState('2024/2025 Third Term');
  const [selectedProgramme, setSelectedProgramme] = useState('Programme');
  const [selectedClass, setSelectedClass] = useState('Class');

  const initialParentsList = Array(7).fill({
    name: 'Ada Obi',
    phone: '0904428395'
  }).map((p, i) => ({ ...p, id: i }));

  const [parentsList] = useState(initialParentsList);
  const [selectedParents, setSelectedParents] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedParents(parentsList.map(p => p.id));
    } else {
      setSelectedParents([]);
    }
  };

  const handleSelectParent = (id) => {
    setSelectedParents(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', lg: 'center' },
            mb: 3,
            gap: 2,
          }}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1,
                bgcolor: 'grey.100',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid',
                borderColor: 'grey.200'
              }}
            >
              <AssignmentTurnedInIcon sx={{ color: 'text.secondary' }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>
                Send invoice to parent
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Review the parent's contact, write a message, and choose how to deliver.
              </Typography>
            </Box>
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Chip
              label={
                <Typography variant="body2" fontWeight={600}>
                  <Box component="span" sx={{ fontStyle: 'italic', mr: 0.5 }}>1</Box> Invoice by SMS
                </Typography>
              }
              sx={{ bgcolor: '#a371c6', color: 'white', borderRadius: 2, px: 1 }}
            />
            <Chip
              label={
                <Typography variant="body2" fontWeight={600}>
                  <Box component="span" sx={{ fontStyle: 'italic', mr: 0.5 }}>2</Box> Invoice by Mail
                </Typography>
              }
              sx={{
                bgcolor: 'transparent',
                color: 'text.secondary',
                border: '1px solid',
                borderColor: 'grey.300',
                borderRadius: 2,
                px: 1,
              }}
            />
            <Chip
              label={
                <Typography variant="body2" fontWeight={600}>
                  <Box component="span" sx={{ fontStyle: 'italic', mr: 0.5 }}>3</Box> Invoice by Excel
                </Typography>
              }
              sx={{
                bgcolor: 'transparent',
                color: 'text.secondary',
                border: '1px solid',
                borderColor: 'grey.300',
                borderRadius: 2,
                px: 1,
              }}
            />
          </Stack>
        </Box>

        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2}>
          <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 180 } }}>
            <Select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              displayEmpty
            >
              <MenuItem value="2024/2025 Third Term">Session -Term</MenuItem>
              <MenuItem value="2024/2025 First Term">2024/2025 First Term</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 150 } }}>
            <Select
              value={selectedProgramme}
              onChange={(e) => setSelectedProgramme(e.target.value)}
              displayEmpty
            >
              <MenuItem value="Programme">Programme</MenuItem>
              <MenuItem value="Secondary">Secondary</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 150 } }}>
            <Select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              displayEmpty
            >
              <MenuItem value="Class">Class</MenuItem>
              <MenuItem value="JSS1">JSS1</MenuItem>
              <MenuItem value="JSS2">JSS2</MenuItem>
            </Select>
          </FormControl>
          <TextField
            size="small"
            placeholder="Search"
            sx={{ flexGrow: 1 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>
      </Box>

      <Box sx={{ bgcolor: '#eef2f6', py: 1.5, px: 2, textAlign: 'center', mb: 3, borderRadius: 1 }}>
        <Typography variant="body2" fontWeight={700}>
          Payment Schedule for 2024/2025 Third Term · JSS2
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 5}}>
          <Box display="flex" alignItems="center" mb={2} gap={1}>
            <Typography variant="subtitle1" fontWeight={700}>
              List of Parent in
            </Typography>
            <Chip
              label="JSS2"
              size="small"
              sx={{ bgcolor: '#f4c430', color: 'white', fontWeight: 700 }}
            />
          </Box>

          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ borderRadius: 2, borderColor: 'grey.200' }}
          >
            <Table size="medium">
              <TableHead>
                <TableRow sx={{ bgcolor: '#fafafa' }}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="success"
                      indeterminate={selectedParents.length > 0 && selectedParents.length < parentsList.length}
                      checked={parentsList.length > 0 && selectedParents.length === parentsList.length}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Phone No.</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.secondary', textAlign: 'center' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {parentsList.map((row) => (
                  <TableRow key={row.id} hover selected={selectedParents.includes(row.id)}>
                    <TableCell padding="checkbox">
                      <Checkbox 
                         checked={selectedParents.includes(row.id)}
                         onChange={() => handleSelectParent(row.id)}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{row.name}</TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontWeight: 500 }}>{row.phone}</TableCell>
                    <TableCell align="center">
                      <IconButton size="small" onClick={handleMenuClick}>
                        <MoreHorizIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleMenuClose}>Edit Parent Line</MenuItem>
            <MenuItem onClick={handleMenuClose}>Resend</MenuItem>
          </Menu>
        </Grid>

        <Grid size={{ xs: 12, md: 7}}>
          <Paper
            variant="outlined"
            sx={{
              p: { xs: 2, md: 3 },
              borderRadius: 3,
              borderColor: 'grey.200',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Typography variant="h6" fontWeight={700} mb={3}>
              Send Invoice To Parent
            </Typography>

            <Box
              sx={{
                bgcolor: '#f4f9f9',
                p: 1.5,
                borderRadius: 2,
                display: 'flex',
                gap: 3,
                mb: 3,
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Box display="flex" gap={3} flexWrap="wrap">
                <Box display="flex" alignItems="center" gap={1}>
                  <Box sx={{ bgcolor: '#4154f1', color: 'white', px: 1, py: 0.2, borderRadius: 5, fontSize: '0.75rem', fontWeight: 700 }}>34</Box>
                  <Typography variant="caption" fontWeight={600}>Parent Attached</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Box sx={{ bgcolor: '#2eca6a', color: 'white', px: 1, py: 0.2, borderRadius: 5, fontSize: '0.75rem', fontWeight: 700 }}>24</Box>
                  <Typography variant="caption" fontWeight={600}>Sent</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="caption" fontWeight={600}>Not Sent</Typography>
                  <Box sx={{ bgcolor: '#ffc107', color: 'white', px: 1, py: 0.2, borderRadius: 5, fontSize: '0.75rem', fontWeight: 700 }}>2</Box>
                </Box>
              </Box>
              <Chip
                label="Resend"
                size="small"
                icon={<RefreshIcon fontSize="small" sx={{ color: 'inherit !important' }} />}
                sx={{ bgcolor: '#fffbea', color: '#856404', fontWeight: 600, borderRadius: 5, cursor: 'pointer' }}
                onClick={() => showSnackbar?.('Resending invoices...', 'info')}
              />
            </Box>

            <Box sx={{ border: '1px solid', borderColor: 'grey.300', borderRadius: 2, flexGrow: 1, mb: 3, overflow: 'hidden' }}>
               <TiptapEdit />
            </Box>

            <Box display="flex" justifyContent="flex-end">
              <Button
                variant="contained"
                color="primary"
                sx={{ px: 4, py: 1, fontWeight: 600, textTransform: 'none', bgcolor: '#4154f1' }}
                onClick={() => showSnackbar?.('Invoice sent successfully!', 'success')}
              >
                Send Invoice to Parent
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SendInvoiceTab;
