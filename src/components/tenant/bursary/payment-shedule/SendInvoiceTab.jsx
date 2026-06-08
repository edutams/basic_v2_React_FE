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
  IconButton
} from '@mui/material';
import {
  Search as SearchIcon,
  Assignment as AssignmentIcon,
  Refresh as RefreshIcon,
  MoreHoriz as MoreHorizIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon
} from '@mui/icons-material';

const SendInvoiceTab = ({ showSnackbar }) => {
  const [selectedSession, setSelectedSession] = useState('2024/2025 Third Term');
  const [selectedProgramme, setSelectedProgramme] = useState('Programme');
  const [selectedClass, setSelectedClass] = useState('Class');

  const parentsList = Array(7).fill({
    name: 'Ada Obi',
    phone: '0904428395'
  });

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
              sx={{ bgcolor: 'primary.main', color: 'white', borderRadius: 2, px: 1 }}
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
        <Grid size={{ xs: 12, md: 5 }}>
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
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        bgcolor: 'success.main',
                        borderRadius: 1,
                        ml: 1,
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Phone No.</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.secondary', textAlign: 'center' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {parentsList.map((row, index) => (
                  <TableRow key={index} hover>
                    <TableCell padding="checkbox">
                      <Checkbox />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{row.name}</TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontWeight: 500 }}>{row.phone}</TableCell>
                    <TableCell align="center">
                      <IconButton size="small">
                        <MoreHorizIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
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
                bgcolor: 'info.light',
                p: 1.5,
                borderRadius: 2,
                display: 'flex',
                gap: 3,
                mb: 3,
                flexWrap: 'wrap',
                alignItems: 'center',
              }}
            >
              <Box display="flex" alignItems="center" gap={1}>
                 <Box sx={{ bgcolor: 'primary.main', color: 'white', px: 1, py: 0.2, borderRadius: 5, fontSize: '0.75rem', fontWeight: 700 }}>34</Box>
                 <Typography variant="caption" fontWeight={600}>Parent Attached</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                 <Box sx={{ bgcolor: 'success.main', color: 'white', px: 1, py: 0.2, borderRadius: 5, fontSize: '0.75rem', fontWeight: 700 }}>24</Box>
                 <Typography variant="caption" fontWeight={600}>Sent</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                 <Typography variant="caption" fontWeight={600}>Not Sent</Typography>
                 <Box sx={{ bgcolor: 'warning.main', color: 'white', px: 1, py: 0.2, borderRadius: 5, fontSize: '0.75rem', fontWeight: 700 }}>2</Box>
              </Box>
              <Chip
                label="Resend"
                size="small"
                icon={<RefreshIcon fontSize="small" sx={{ color: 'inherit !important' }} />}
                sx={{ bgcolor: '#fffbea', color: '#856404', fontWeight: 600, borderRadius: 5, cursor: 'pointer' }}
                onClick={() => showSnackbar?.('Resending invoices...', 'info')}
              />
            </Box>

            <Box sx={{ border: '1px solid', borderColor: 'grey.300', borderRadius: 2, flexGrow: 1, mb: 3 }}>
              <Typography variant="caption" fontWeight={600} sx={{ p: 2, display: 'block' }}>
                Message to parent
              </Typography>
            </Box>

            <Box display="flex" justifyContent="flex-end">
              <Button
              size='small'
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
