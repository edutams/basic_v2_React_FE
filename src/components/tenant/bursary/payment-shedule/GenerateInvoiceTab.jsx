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
  Checkbox,
} from '@mui/material';
import { Search as SearchIcon, CheckCircle as CheckCircleIcon, Person as PersonIcon, MoreHoriz as MoreHorizIcon } from '@mui/icons-material';

const GenerateInvoiceTab = ({ showSnackbar }) => {
  const [selectedSession, setSelectedSession] = useState('2024/2025 - Third Term');
  const [selectedClass, setSelectedClass] = useState('JSS2');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [viewMode, setViewMode] = useState('schedule');

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

  const [studentsData] = useState([
    { id: 1, admissionId: 'STU-1042', name: 'Ada Obi', category: 'Returning Student', compulsory: 15000, optional: null, totalAmount: 105000 },
    { id: 2, admissionId: 'STU-1042', name: 'Ada Obi', category: 'Returning Student', compulsory: 15000, optional: null, totalAmount: 105000 },
    { id: 3, admissionId: 'STU-1042', name: 'Ada Obi', category: 'Returning Student', compulsory: 15000, optional: null, totalAmount: 105000 },
    { id: 4, admissionId: 'STU-1042', name: 'Ada Obi', category: 'Returning Student', compulsory: 15000, optional: null, totalAmount: 105000 },
    { id: 5, admissionId: 'STU-1042', name: 'Ada Obi', category: 'Returning Student', compulsory: 15000, optional: null, totalAmount: 105000 },
    { id: 6, admissionId: 'STU-1042', name: 'Ada Obi', category: 'Returning Student', compulsory: 15000, optional: null, totalAmount: 105000 },
    { id: 7, admissionId: 'STU-1042', name: 'Ada Obi', category: 'Returning Student', compulsory: 15000, optional: null, totalAmount: 105000 },
    { id: 8, admissionId: 'STU-1042', name: 'Ada Obi', category: 'Returning Student', compulsory: 15000, optional: null, totalAmount: 105000 },
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
    setViewMode('students');
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

  if (viewMode === 'students') {
    return (
      <Stack spacing={3} sx={{ bgcolor: '#fafafa', p: { xs: 1, sm: 2 }, borderRadius: 2 }}>
        <Box>
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1,
                bgcolor: 'grey.200',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PersonIcon />
            </Box>
            <Typography variant="h6" fontWeight={700}>
              Select a student
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'stretch', sm: 'center' },
              gap: 2,
              mb: 4,
            }}
          >
            <FormControl size="small" sx={{ minWidth: 200, bgcolor: 'white' }}>
              <Select displayEmpty defaultValue="" label="" sx={{ '& .MuiSelect-select': { color: 'text.secondary' } }}>
                <MenuItem value="" disabled>Category</MenuItem>
                <MenuItem value="Returning Student">Returning Student</MenuItem>
                <MenuItem value="New Student">New Student</MenuItem>
              </Select>
            </FormControl>

            {/* <FormControl size="small" sx={{ minWidth: 200, bgcolor: 'white' }}>
              <Select value={selectedClass} label="" onChange={(e) => setSelectedClass(e.target.value)}>
                {classes.map(cls => <MenuItem key={cls} value={cls}>{cls}</MenuItem>)}
              </Select>
            </FormControl> */}

            <TextField
              size="small"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Button size='small'>
              Fetch
            </Button>
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
            <Box sx={{ bgcolor: '#EDF2FD', px: 2, py: 1, borderRadius: 1 }}>
              <Typography variant="body2" fontWeight={600}>
                 Payment Schedule for {selectedSession} · {selectedClass}
              </Typography>
            </Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <Button
                size="small"
              >
                View Class Invoice
              </Button>
              <Button variant="outlined" size="small">
                Generate Invoice
              </Button>
            </Stack>
          </Box>

          <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto', borderRadius: 2, borderColor: 'grey.200' }}>
            <Table sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8F9FA' }}>
                  <TableCell padding="checkbox" sx={{ borderBottom: '1px solid', borderColor: 'grey.200' }}>
                    <Checkbox  />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.secondary', borderBottom: '1px solid', borderColor: 'grey.200' }}>Admission ID</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.secondary', borderBottom: '1px solid', borderColor: 'grey.200' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.secondary', borderBottom: '1px solid', borderColor: 'grey.200' }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.secondary', borderBottom: '1px solid', borderColor: 'grey.200' }}>Compulsory</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.secondary', borderBottom: '1px solid', borderColor: 'grey.200' }}>Optional</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.secondary', borderBottom: '1px solid', borderColor: 'grey.200' }}>Total Amount</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.secondary', borderBottom: '1px solid', borderColor: 'grey.200' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.secondary', borderBottom: '1px solid', borderColor: 'grey.200' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {studentsData.map((row) => (
                  <TableRow key={row.id} hover sx={{ '& td': { borderBottom: '1px solid', borderColor: 'grey.100' } }}>
                    <TableCell padding="checkbox">
                      <Checkbox  />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{row.admissionId}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{row.name}</TableCell>
                    <TableCell>
                      <Box sx={{ bgcolor: 'primary.light', px: 1.5, py: 0.5, borderRadius: 5, display: 'inline-block' }}>
                        <Typography variant="caption" fontWeight={600} color="primary">{row.category}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>₦{row.compulsory.toLocaleString()}</TableCell>
                    <TableCell>
                      <Box sx={{ bgcolor: 'primary.light', width: '40px', py: 0.5, borderRadius: 1, display: 'flex', justifyContent: 'center' }}>
                        <Typography variant="body2" color="text.secondary" fontWeight={600}>-</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ bgcolor: 'primary.light', px: 1.5, py: 0.5, borderRadius: 1, display: 'inline-block' }}>
                        <Typography variant="body2" fontWeight={700}>₦{row.totalAmount.toLocaleString()}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant='contained'
                      
                      >
                        Add Optional
                      </Button>
                    </TableCell>
                    <TableCell>
                      <MoreHorizIcon sx={{ color: 'text.secondary', cursor: 'pointer' }} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box display="flex" justifyContent="flex-end" alignItems="center" mt={3}>
            <Button size='small'>
              Print Invoice for All
            </Button>
          </Box>
        </Box>
      </Stack>
    );
  }

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

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', sm: 'center' },
            gap: 2,
            mb: 3,
          }}
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

          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              size="small"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ width: 250 }}
            />

            <Button variant="contained" onClick={handleFetch} sx={{ fontWeight: 600, minWidth: 100 }}>
              Fetch
            </Button>
          </Stack>
        </Box>

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
