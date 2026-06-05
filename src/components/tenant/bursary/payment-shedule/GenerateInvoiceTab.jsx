import { useState, useContext } from 'react';
import { TenantAuthContext } from 'src/context/TenantContext/auth';
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
  Menu,
  IconButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
  MoreHoriz as MoreHorizIcon,
} from '@mui/icons-material';

const GenerateInvoiceTab = ({ showSnackbar }) => {
  const { tenantInfo } = useContext(TenantAuthContext) || {};
  const schoolLogo = tenantInfo?.logo_url || tenantInfo?.logo || '/Edutams.png';
  const schoolName =
    tenantInfo?.school_name || tenantInfo?.name || tenantInfo?.tenant_name || 'School Name';
  const schoolAddress = tenantInfo?.address || '';
  const schoolEmail = tenantInfo?.administrator_info?.school_owner?.school_owner_email || '';
  const schoolPhone = tenantInfo?.administrator_info?.school_owner?.school_owner_phone || '';

  const [selectedSession, setSelectedSession] = useState('2024/2025 - Third Term');
  const [selectedClass, setSelectedClass] = useState('JSS2');
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedSearchQuery, setAppliedSearchQuery] = useState('');
  const [selectedStudentCategory, setSelectedStudentCategory] = useState('category');
  const [appliedStudentCategory, setAppliedStudentCategory] = useState('category');
  const [isInvoiceGenerated, setIsInvoiceGenerated] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [viewMode, setViewMode] = useState('schedule');
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);
  const [selectedStudents, setSelectedStudents] = useState([]);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleStudentClick = (event, id) => {
    const selectedIndex = selectedStudents.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedStudents, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedStudents.slice(1));
    } else if (selectedIndex === selectedStudents.length - 1) {
      newSelected = newSelected.concat(selectedStudents.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedStudents.slice(0, selectedIndex),
        selectedStudents.slice(selectedIndex + 1),
      );
    }
    setSelectedStudents(newSelected);
  };

  const isStudentSelected = (id) => selectedStudents.indexOf(id) !== -1;

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
    {
      id: 1,
      admissionId: 'STU-1042',
      name: 'Ada Obi',
      category: 'Returning Student',
      compulsory: 15000,
      optional: null,
      totalAmount: 105000,
    },
    {
      id: 2,
      admissionId: 'STU-1043',
      name: 'Adejoke Mojisola',
      category: 'New Student',
      compulsory: 15000,
      optional: null,
      totalAmount: 105000,
    },
    {
      id: 3,
      admissionId: 'STU-1044',
      name: 'Lawal Romota',
      category: 'Returning Student',
      compulsory: 15000,
      optional: null,
      totalAmount: 105000,
    },
    {
      id: 4,
      admissionId: 'STU-1045',
      name: 'Kehinde Dada',
      category: 'Returning Student',
      compulsory: 15000,
      optional: null,
      totalAmount: 105000,
    },
    {
      id: 5,
      admissionId: 'STU-1046',
      name: 'Adejumobi Johnson',
      category: 'Returning Student',
      compulsory: 15000,
      optional: null,
      totalAmount: 105000,
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

  const filteredStudentsData = studentsData.filter((student) => {
    let match = true;
    if (appliedSearchQuery) {
      const lowerQuery = appliedSearchQuery.toLowerCase();
      match =
        match &&
        (student.name.toLowerCase().includes(lowerQuery) ||
          student.admissionId.toLowerCase().includes(lowerQuery) ||
          student.category.toLowerCase().includes(lowerQuery));
    }
    if (appliedStudentCategory && appliedStudentCategory !== 'category') {
      match = match && student.category === appliedStudentCategory;
    }
    return match;
  });

  const paginatedStudentsData = filteredStudentsData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  const handleStudentFetch = () => {
    setAppliedSearchQuery(searchQuery);
    setAppliedStudentCategory(selectedStudentCategory);
    setPage(0);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = filteredStudentsData.map((n) => n.id);
      setSelectedStudents(newSelecteds);
      return;
    }
    setSelectedStudents([]);
  };

  if (viewMode === 'students') {
    return (
      <Stack spacing={3} sx={{ p: { xs: 1, sm: 2 }, borderRadius: 2 }}>
        <Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'stretch', md: 'center' },
              gap: 2,
              mb: 4,
            }}
          >
            <Box display="flex" alignItems="center" gap={2}>
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
              }}
            >
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <Select
                  displayEmpty
                  value={selectedStudentCategory}
                  onChange={(e) => setSelectedStudentCategory(e.target.value)}
                  sx={{ '& .MuiSelect-select': { color: 'text.secondary' } }}
                >
                  <MenuItem value="category">Category</MenuItem>
                  <MenuItem value="Returning Student">Returning Student</MenuItem>
                  <MenuItem value="New Student">New Student</MenuItem>
                </Select>
              </FormControl>

              <TextField
                size="small"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchQuery(val);
                  if (val === '') {
                    setAppliedSearchQuery('');
                    setPage(0);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleStudentFetch();
                  }
                }}
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

              <Button size="small" onClick={handleStudentFetch}>
                Fetch
              </Button>
            </Box>
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
            <Box sx={{ bgcolor: 'info.light', px: 2, py: 1, borderRadius: 1 }}>
              <Typography variant="body2" fontWeight={600}>
                Payment Schedule for {selectedSession} · {selectedClass}
              </Typography>
            </Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  setIsInvoiceGenerated(true);
                  showSnackbar?.('Invoice generated successfully', 'success');
                }}
              >
                Generate Invoice
              </Button>
              {isInvoiceGenerated && (
                <Button size="small" onClick={() => setViewMode('invoice')}>
                  View Class Invoice
                </Button>
              )}
            </Stack>
          </Box>

          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ overflowX: 'auto', borderRadius: 2, borderColor: 'grey.200' }}
          >
            <Table sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow>
                  <TableCell
                    padding="checkbox"
                    sx={{ borderBottom: '1px solid', borderColor: 'grey.200' }}
                  >
                    <Checkbox
                      color="primary"
                      indeterminate={
                        selectedStudents.length > 0 &&
                        selectedStudents.length < filteredStudentsData.length
                      }
                      checked={
                        filteredStudentsData.length > 0 &&
                        selectedStudents.length === filteredStudentsData.length
                      }
                      onChange={handleSelectAllClick}
                    />
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: 'text.secondary',
                      borderBottom: '1px solid',
                      borderColor: 'grey.200',
                    }}
                  >
                    Admission ID
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: 'text.secondary',
                      borderBottom: '1px solid',
                      borderColor: 'grey.200',
                    }}
                  >
                    Name
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: 'text.secondary',
                      borderBottom: '1px solid',
                      borderColor: 'grey.200',
                    }}
                  >
                    Category
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: 'text.secondary',
                      borderBottom: '1px solid',
                      borderColor: 'grey.200',
                    }}
                  >
                    Compulsory
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: 'text.secondary',
                      borderBottom: '1px solid',
                      borderColor: 'grey.200',
                    }}
                  >
                    Optional
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: 'text.secondary',
                      borderBottom: '1px solid',
                      borderColor: 'grey.200',
                    }}
                  >
                    Total Amount
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: 'text.secondary',
                      borderBottom: '1px solid',
                      borderColor: 'grey.200',
                    }}
                  >
                    Status
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: 'text.secondary',
                      borderBottom: '1px solid',
                      borderColor: 'grey.200',
                    }}
                  >
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedStudentsData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                      <Alert
                        severity="info"
                        sx={{ justifyContent: 'center', bgcolor: 'transparent' }}
                      >
                        No students found matching your criteria.
                      </Alert>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedStudentsData.map((row) => {
                    const isItemSelected = isStudentSelected(row.id);
                    return (
                      <TableRow
                        key={row.id}
                        hover
                        onClick={(event) => handleStudentClick(event, row.id)}
                        role="checkbox"
                        aria-checked={isItemSelected}
                        selected={isItemSelected}
                        sx={{
                          '& td': { borderBottom: '1px solid', borderColor: 'grey.100' },
                          cursor: 'pointer',
                        }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox checked={isItemSelected} color="primary" />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{row.admissionId}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{row.name}</TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              bgcolor: 'primary.light',
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 5,
                              display: 'inline-block',
                            }}
                          >
                            <Typography variant="caption" fontWeight={600} color="primary">
                              {row.category}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          ₦{row.compulsory.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              bgcolor: 'primary.light',
                              width: '40px',
                              py: 0.5,
                              borderRadius: 1,
                              display: 'flex',
                              justifyContent: 'center',
                            }}
                          >
                            <Typography variant="body2" color="text.secondary" fontWeight={600}>
                              -
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              bgcolor: 'primary.light',
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 1,
                              display: 'inline-block',
                            }}
                          >
                            <Typography variant="body2" fontWeight={700}>
                              ₦{row.totalAmount.toLocaleString()}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Button size="small" variant="contained">
                            Add Optional
                          </Button>
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={handleMenuClick}>
                            <MoreHorizIcon sx={{ color: 'text.secondary' }} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={filteredStudentsData.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
            />
          </TableContainer>

          <Menu
            anchorEl={anchorEl}
            open={openMenu}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={handleMenuClose}>Print Invoice</MenuItem>
            <MenuItem onClick={handleMenuClose}>Regenerate Invoice</MenuItem>
            <MenuItem onClick={handleMenuClose}>Go to Student Ledger</MenuItem>
          </Menu>

          <Box display="flex" justifyContent="flex-end" alignItems="center" mt={3}>
            <Button size="small" sx={{ mr: 2 }} onClick={() => setViewMode('schedule')}>
              Back
            </Button>
            <Button size="small">Print Invoice for All</Button>
          </Box>
        </Box>
      </Stack>
    );
  }

  if (viewMode === 'invoice') {
    return (
      <Stack spacing={3} sx={{ p: { xs: 1, sm: 2 }, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={700}>
          Class Invoice ·{' '}
          <Box component="span" color="primary.main">
            {selectedClass}
          </Box>
        </Typography>

        {studentsData.slice(0, 2).map((student, index) => (
          <Box key={index} sx={{ mb: 4 }}>
            {/* Learner Info Card */}
            <Box
              sx={{
                mb: 2,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'grey.200',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  bgcolor: 'primary.light',
                  p: 3,
                  m: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                }}
              >
                <Box
                  component="img"
                  src={schoolLogo}
                  alt="School Logo"
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: 2,
                    bgcolor: 'white',
                    objectFit: 'contain',
                    p: 1,
                    flexShrink: 0,
                  }}
                />

                {/* School Details */}
                <Box flex={1} textAlign="center">
                  <Typography variant="h4" fontWeight={800} color="text.primary">
                    {schoolName}
                  </Typography>

                  {schoolAddress && (
                    <Typography variant="body2" color="text.secondary" fontWeight={700}>
                      {schoolAddress}
                    </Typography>
                  )}

                  <Box display="flex" flexWrap="wrap" gap={3} mt={1} justifyContent="center">
                    {schoolEmail && (
                      <Typography variant="h6" color="text.secondary" fontWeight={700}>
                        {schoolEmail}
                      </Typography>
                    )}

                    {schoolPhone && (
                      <Typography variant="h6" color="text.secondary" fontWeight={700}>
                        {schoolPhone}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>

              {/* White Learner Area */}
              <Box sx={{ p: 4 }}>
                <Typography
                  variant="h5"
                  fontWeight={800}
                  textAlign="center"
                  mb={4}
                  color="text.primary"
                >
                  2024/2025 Third Term Invoice
                </Typography>

                <Box
                  display="flex"
                  flexDirection={{ xs: 'column', sm: 'row' }}
                  justifyContent="space-between"
                  width="100%"
                  gap={4}
                >
                  <Box>
                    <Typography variant="subtitle1" fontWeight={800} color="text.primary">
                      Learner Details
                    </Typography>
                    <Typography variant="body1" color="text.secondary" mb={0.5}>
                      {student.name}
                    </Typography>
                    <Typography variant="body1" fontWeight={700} mb={2}>
                      Class:{' '}
                      <Box component="span" fontWeight={400} color="text.secondary">
                        {selectedClass} a
                      </Box>
                    </Typography>
                    <Button size="small">PROCEED TO PAY</Button>
                  </Box>
                  <Box textAlign={{ xs: 'left', sm: 'right' }}>
                    <Typography variant="subtitle1" fontWeight={700} color="text.primary" mb={1}>
                      Invoice Number:{' '}
                      <Box component="span" fontWeight={400} color="text.secondary">
                        36056531
                      </Box>
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={700} color="text.primary" mb={2}>
                      Balance Due:{' '}
                      <Typography
                        component="span"
                        variant="h5"
                        fontWeight={800}
                        color="text.primary"
                      >
                        ₦{student.totalAmount?.toLocaleString() || '230,010'}
                      </Typography>
                    </Typography>
                    <Button size="small">UPDATE INVOICE</Button>
                  </Box>
                </Box>
              </Box>

              {/* White Table Card */}
              <Box
                sx={{
                  p: { xs: 2, sm: 4 },
                  m: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'grey.200',
                }}
              >
                <Box
                  display="flex"
                  flexDirection={{ xs: 'column', sm: 'row' }}
                  justifyContent="space-between"
                  mb={3}
                  gap={1}
                >
                  <Box>
                    <Typography variant="caption" fontWeight={800} color="text.secondary">
                      INVOICE FOR
                    </Typography>
                    <Typography variant="h6" fontWeight={800}>
                      {student.name}
                    </Typography>
                    <Typography variant="caption" fontWeight={600} color="text.secondary">
                      {student.admissionId} - {selectedClass}
                    </Typography>
                  </Box>
                  <Typography
                    variant="caption"
                    fontWeight={600}
                    color="text.secondary"
                    textAlign={{ xs: 'left', sm: 'right' }}
                  >
                    2024/2025 Third Term
                  </Typography>
                </Box>

                <TableContainer
                  component={Paper}
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    overflow: 'hidden',
                    borderColor: 'grey.200',
                    boxShadow: 'none',
                  }}
                >
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell
                          sx={{
                            py: 2,
                            fontWeight: 500,
                            borderColor: 'grey.200',
                            color: 'text.primary',
                          }}
                        >
                          School fee
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            py: 2,
                            fontWeight: 700,
                            borderColor: 'grey.200',
                            color: 'text.primary',
                          }}
                        >
                          ₦6,000
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          sx={{
                            py: 2,
                            fontWeight: 500,
                            borderColor: 'grey.200',
                            color: 'text.primary',
                          }}
                        >
                          Text book
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            py: 2,
                            fontWeight: 700,
                            borderColor: 'grey.200',
                            color: 'text.primary',
                          }}
                        >
                          ₦15,000
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          sx={{
                            py: 2,
                            fontWeight: 500,
                            borderColor: 'grey.200',
                            color: 'text.primary',
                          }}
                        >
                          Inter house sport
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            py: 2,
                            fontWeight: 700,
                            borderColor: 'grey.200',
                            color: 'text.primary',
                          }}
                        >
                          ₦25,000
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          sx={{
                            py: 2,
                            fontWeight: 500,
                            borderColor: 'grey.200',
                            color: 'text.primary',
                          }}
                        >
                          Portal Fee
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            py: 2,
                            fontWeight: 700,
                            borderColor: 'grey.200',
                            color: 'text.primary',
                          }}
                        >
                          ₦2,000
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          sx={{
                            py: 2,
                            fontWeight: 500,
                            borderColor: 'grey.200',
                            color: 'text.primary',
                          }}
                        >
                          CARDIGAN
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            py: 2,
                            fontWeight: 700,
                            borderColor: 'grey.200',
                            color: 'text.primary',
                          }}
                        >
                          ₦7,000
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          sx={{
                            py: 2,
                            fontWeight: 500,
                            borderColor: 'grey.200',
                            color: 'text.primary',
                          }}
                        >
                          Tie
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            py: 2,
                            fontWeight: 700,
                            borderColor: 'grey.200',
                            color: 'text.primary',
                          }}
                        >
                          ₦3,000
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          sx={{
                            py: 2,
                            fontWeight: 500,
                            borderColor: 'grey.200',
                            color: 'text.primary',
                          }}
                        >
                          Transport
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            py: 2,
                            fontWeight: 700,
                            borderColor: 'grey.200',
                            color: 'text.primary',
                          }}
                        >
                          ₦20,000
                        </TableCell>
                      </TableRow>
                      <TableRow sx={{ bgcolor: 'grey.50' }}>
                        <TableCell
                          sx={{
                            py: 2,
                            fontWeight: 800,
                            borderColor: 'grey.200',
                            color: 'text.primary',
                          }}
                        >
                          Total
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            py: 2,
                            fontWeight: 800,
                            borderColor: 'grey.200',
                            color: 'text.primary',
                          }}
                        >
                          ₦78,000
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Box>
          </Box>
        ))}
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

            <Button
              variant="contained"
              onClick={handleFetch}
              sx={{ fontWeight: 600, minWidth: 100 }}
            >
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
            {isInvoiceGenerated && (
              <Button size="small" onClick={() => setViewMode('invoice')}>
                View Class Invoice
              </Button>
            )}
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
