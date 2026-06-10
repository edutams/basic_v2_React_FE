import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TenantAuthContext } from 'src/context/TenantContext/auth';
import { fetchStudentForInvoiceData } from '@/api/tenant/bursary/bursarySettingsApi';
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
  Select,
  MenuItem,
  Checkbox,
  Menu,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  MoreHoriz as MoreHorizIcon,
} from '@mui/icons-material';

const InvoiceStudentsView = () => {
  const { session_term_id, class_id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [students, setStudents] = useState([]);
  const [sessionLabel, setSessionLabel] = useState('');
  const [termLabel, setTermLabel] = useState('');
  const [className, setClassName] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedStudentCategory, setSelectedStudentCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  useEffect(() => {
    const loadData = async () => {
      if (!session_term_id) return;
      try {
        setLoading(true);
        setError(null);
        const response = await fetchStudentForInvoiceData({
          sessionTermId: session_term_id,
          classId: class_id || undefined,
        });
        const d = response?.data || {};
        setStudents(Array.isArray(d.students) ? d.students : []);
        setSessionLabel(d.session_label || '');
        setTermLabel(d.term_label || '');
        setClassName(d.class_name || '');
        const cats = Array.isArray(d.categories) ? d.categories : [];
        setCategories(cats);
        // Category dropdown will be populated from student data
      } catch (err) {
        console.error('Failed to load student invoice data', err);
        setError(err?.response?.data?.message || 'Failed to load student invoice data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [session_term_id, class_id]);

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

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      setSelectedStudents(filteredStudents.map((n) => n.id));
      return;
    }
    setSelectedStudents([]);
  };

  // Compute filtered student data
  // Derive distinct student categories from data
  const studentCategories = [...new Set(students.map((s) => s.category).filter(Boolean))];

  const filteredStudents = students.filter((student) => {
    const matchesCategory =
      selectedStudentCategory === 'all' ||
      student.category === selectedStudentCategory;
    const matchesSearch =
      !searchQuery ||
      student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.admissionId?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button sx={{ mt: 2 }} onClick={() => navigate('/payment-schedule')}>
          Back to Payment Schedule
        </Button>
      </Box>
    );
  }

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
                <MenuItem value="all">All Categories</MenuItem>
                {studentCategories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              size="small"
              placeholder="Search by name or ID"
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
             Student List Invoice  List for {sessionLabel}{termLabel ? ` - ${termLabel}` : ''} · {className}
            </Typography>
          </Box>
        </Box>

        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{ overflowX: 'auto', borderRadius: 2, borderColor: 'grey.200' }}
        >
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" sx={{ borderBottom: '1px solid', borderColor: 'grey.200' }}>
                  <Checkbox
                    color="primary"
                    indeterminate={
                      selectedStudents.length > 0 &&
                      selectedStudents.length < filteredStudents.length
                    }
                    checked={
                      filteredStudents.length > 0 &&
                      selectedStudents.length === filteredStudents.length
                    }
                    onChange={handleSelectAllClick}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary', borderBottom: '1px solid', borderColor: 'grey.200' }}>Admission ID</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary', borderBottom: '1px solid', borderColor: 'grey.200' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary', borderBottom: '1px solid', borderColor: 'grey.200' }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary', borderBottom: '1px solid', borderColor: 'grey.200' }}>Pay Option</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary', borderBottom: '1px solid', borderColor: 'grey.200' }}>Total Amount</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary', borderBottom: '1px solid', borderColor: 'grey.200' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <Alert severity="info" sx={{ justifyContent: 'center', bgcolor: 'transparent' }}>
                      No students found matching your criteria.
                    </Alert>
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student) => {
                  const isItemSelected = isStudentSelected(student.id);
                  return (
                    <TableRow
                      key={student.id}
                      hover
                      onClick={(event) => handleStudentClick(event, student.id)}
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
                      <TableCell sx={{ fontWeight: 600 }}>{student.admissionId}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{student.name}</TableCell>
                      <TableCell>
                        <Box sx={{ bgcolor: 'primary.light', py: 0.5, borderRadius: 5, display: 'inline-block', px: 1.5 }}>
                          <Typography variant="caption" fontWeight={600} color="primary">
                            {student.category}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {student.pay_option}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ bgcolor: 'primary.light', px: 1.5, py: 0.5, borderRadius: 1, display: 'inline-block' }}>
                          <Typography variant="body2" fontWeight={700}>
                            ₦{Number(student.totalAmount || 0).toLocaleString()}
                          </Typography>
                        </Box>
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
          <Button size="small" sx={{ mr: 2 }} onClick={() => navigate('/payment-schedule')}>
            Back
          </Button>
          <Button size="small">Print Invoice for All</Button>
        </Box>
      </Box>
    </Stack>
  );
};

export default InvoiceStudentsView;
