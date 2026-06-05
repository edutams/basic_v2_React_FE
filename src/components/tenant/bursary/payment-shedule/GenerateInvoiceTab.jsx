import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  TablePagination,
  Alert,
} from '@mui/material';
import { Search as SearchIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';

const GenerateInvoiceTab = ({ showSnackbar }) => {
  const [selectedSession, setSelectedSession] = useState('2024/2025 - Third Term');
  const [selectedClass, setSelectedClass] = useState('JSS2');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const classes = ['JSS1', 'JSS2', 'JSS3', 'SSS1', 'SSS2', 'SSS3', 'SSS3'];

  const [scheduleData] = useState([
    {
      id: 1,
      paymentName: 'School Fee',
      beneficiary: 10000,
      newStudent: 2000,
      returningStudent: 47000,
      scholarship: 7000,
      staffWard: 7000,
      transportation: 7000,
    },
    {
      id: 2,
      paymentName: 'Bag',
      beneficiary: 7000,
      newStudent: 7000,
      returningStudent: 7000,
      scholarship: 7000,
      staffWard: 7000,
      transportation: 7000,
    },
    {
      id: 3,
      paymentName: 'Bag',
      beneficiary: 7000,
      newStudent: 7000,
      returningStudent: 7000,
      scholarship: '----',
      staffWard: 7000,
      transportation: 7000,
    },
    {
      id: 4,
      paymentName: 'Bag',
      beneficiary: 7000,
      newStudent: 7000,
      returningStudent: 7000,
      scholarship: 7000,
      staffWard: 7000,
      transportation: 7000,
    },
    {
      id: 5,
      paymentName: 'Bag',
      beneficiary: 7000,
      newStudent: 7000,
      returningStudent: 7000,
      scholarship: 7000,
      staffWard: 7000,
      transportation: 7000,
    },
    {
      id: 6,
      paymentName: 'Bag',
      beneficiary: 7000,
      newStudent: 7000,
      returningStudent: 7000,
      scholarship: 7000,
      staffWard: 7000,
      transportation: 7000,
    },
    {
      id: 7,
      paymentName: 'Bag',
      beneficiary: 7000,
      newStudent: 7000,
      returningStudent: 7000,
      scholarship: 7000,
      staffWard: 7000,
      transportation: 7000,
    },
    {
      id: 8,
      paymentName: 'Bag',
      beneficiary: 7000,
      newStudent: 7000,
      returningStudent: 7000,
      scholarship: 7000,
      staffWard: 7000,
      transportation: 7000,
    },
  ]);

  const calculateTotal = (column) => {
    return scheduleData
      .reduce((sum, row) => {
        const value = row[column];
        return sum + (typeof value === 'number' ? value : 0);
      }, 0)
      .toLocaleString();
  };

  const handleFetch = () => {
    showSnackbar?.(`Fetching data for ${selectedClass}...`, 'info');
  };

  const handleGenerateInvoice = () => {
    showSnackbar?.(`Generating invoice for ${selectedClass}...`, 'success');
  };

  const handleViewClassInvoice = () => {
    showSnackbar?.('Viewing class invoice...', 'info');
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Paginate data
  const paginatedData = scheduleData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Stack spacing={3}>
      <Box>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1,
              bgcolor: 'grey.100',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="h6">📄</Typography>
          </Box>
          <Typography variant="h6" fontWeight={600}>
            Generate Invoice
          </Typography>
        </Box>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          mb={3}
        >
          <FormControl size="small" sx={{ minWidth: { sm: 200 } }}>
            <InputLabel>Select Session Term</InputLabel>
            <Select
              value={selectedSession}
              label="Select Session Term"
              onChange={(e) => setSelectedSession(e.target.value)}
            >
              <MenuItem value="2024/2025 - First Term">2024/2025 - First Term</MenuItem>
              <MenuItem value="2024/2025 - Second Term">2024/2025 - Second Term</MenuItem>
              <MenuItem value="2024/2025 - Third Term">2024/2025 - Third Term</MenuItem>
            </Select>
          </FormControl>

          <TextField
            size="small"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <Button onClick={handleFetch} sx={{ fontWeight: 600, minWidth: 100 }}>
            Fetch
          </Button>
        </Stack>

        <Box
          sx={{
            bgcolor: 'rgba(255, 152, 0, 0.08)',
            p: 2,
            borderRadius: 1,
            mb: 3,
            overflowX: 'auto',
            '&::-webkit-scrollbar': {
              height: 6,
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(0,0,0,0.2)',
              borderRadius: 3,
            },
          }}
        >
          <Stack direction="row" spacing={1} sx={{ minWidth: 'max-content' }}>
            {classes.map((cls) => (
              <Chip
                key={cls}
                label={cls}
                onClick={() => setSelectedClass(cls)}
                icon={selectedClass === cls ? <CheckCircleIcon sx={{ fontSize: 18 }} /> : undefined}
                sx={{
                  bgcolor: selectedClass === cls ? 'primary.main' : 'white',
                  color: selectedClass === cls ? 'white' : 'text.primary',
                  fontWeight: 600,
                  border: '1px solid',
                  borderColor: selectedClass === cls ? 'primary.main' : 'divider',
                  '&:hover': {
                    bgcolor: selectedClass === cls ? 'primary.dark' : 'grey.100',
                  },
                }}
              />
            ))}
          </Stack>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', sm: 'center' },
            mb: 2,
            gap: 2,
          }}
        >
          <Alert severity="info">
            Payment Schedule for {selectedSession} - {selectedClass}
          </Alert>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button
              variant="contained"
              size="small"
              onClick={handleGenerateInvoice}
              sx={{ fontWeight: 600 }}
            >
              Generate Invoice / {selectedClass}
            </Button>
            <Button size="small" onClick={handleViewClassInvoice}>
              View Class Invoice
            </Button>
          </Stack>
        </Box>

        {/* Payment Schedule Table */}
        <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 700, width: 60 }}>#</TableCell>
                <TableCell sx={{ fontWeight: 700, minWidth: 150 }}>PAYMENT NAME</TableCell>
                <TableCell sx={{ fontWeight: 700, minWidth: 120 }}>
                  <Box>
                    <Typography variant="caption" fontWeight={700} display="block">
                      Beneficiary
                    </Typography>
                    <Chip
                      label="Update"
                      size="small"
                      sx={{
                        bgcolor: 'primary.light',
                        color: 'primary.main',
                      }}
                    />
                  </Box>
                </TableCell>
                <TableCell sx={{ fontWeight: 700, minWidth: 120 }}>
                  <Box>
                    <Typography variant="caption" fontWeight={700} display="block">
                      New Student
                    </Typography>
                    <Chip
                      label="Update"
                      size="small"
                      sx={{
                        bgcolor: 'primary.light',
                        color: 'primary.main',
                      }}
                    />
                  </Box>
                </TableCell>
                <TableCell sx={{ fontWeight: 700, minWidth: 140 }}>
                  <Box>
                    <Typography variant="caption" fontWeight={700} display="block">
                      Returning Student
                    </Typography>
                    <Chip
                      label="Update"
                      size="small"
                      sx={{
                        bgcolor: 'primary.light',
                        color: 'primary.main',
                      }}
                    />
                  </Box>
                </TableCell>
                <TableCell sx={{ fontWeight: 700, minWidth: 120 }}>
                  <Box>
                    <Typography variant="caption" fontWeight={700} display="block">
                      Scholarship
                    </Typography>
                    <Chip
                      label="Update"
                      size="small"
                      sx={{
                        bgcolor: 'primary.light',
                        color: 'primary.main',
                      }}
                    />
                  </Box>
                </TableCell>
                <TableCell sx={{ fontWeight: 700, minWidth: 120 }}>
                  <Box>
                    <Typography variant="caption" fontWeight={700} display="block">
                      Staff Ward
                    </Typography>
                    <Chip
                      label="Update"
                      size="small"
                      sx={{
                        bgcolor: 'primary.light',
                        color: 'primary.main',
                      }}
                    />
                  </Box>
                </TableCell>
                <TableCell sx={{ fontWeight: 700, minWidth: 140 }}>
                  <Box>
                    <Typography variant="caption" fontWeight={700} display="block">
                      Transportation
                    </Typography>
                    <Chip
                      label="Update"
                      size="small"
                      sx={{
                        bgcolor: 'primary.light',
                        color: 'primary.main',
                      }}
                    />
                  </Box>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {row.paymentName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {typeof row.beneficiary === 'number'
                        ? row.beneficiary.toLocaleString()
                        : row.beneficiary}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {typeof row.newStudent === 'number'
                        ? row.newStudent.toLocaleString()
                        : row.newStudent}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {typeof row.returningStudent === 'number'
                        ? row.returningStudent.toLocaleString()
                        : row.returningStudent}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {typeof row.scholarship === 'number'
                        ? row.scholarship.toLocaleString()
                        : row.scholarship}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {typeof row.staffWard === 'number'
                        ? row.staffWard.toLocaleString()
                        : row.staffWard}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {typeof row.transportation === 'number'
                        ? row.transportation.toLocaleString()
                        : row.transportation}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
              {/* Total Row */}
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell colSpan={2}>
                  <Typography variant="body2" fontWeight={700}>
                    Total
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={700}>
                    {calculateTotal('beneficiary')}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={700}>
                    {calculateTotal('newStudent')}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={700}>
                    {calculateTotal('returningStudent')}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={700}>
                    {calculateTotal('scholarship')}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={700}>
                    {calculateTotal('staffWard')}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={700}>
                    {calculateTotal('transportation')}
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={scheduleData.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </TableContainer>
      </Box>
    </Stack>
  );
};

export default GenerateInvoiceTab;
