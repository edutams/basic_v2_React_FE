import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Menu,
  MenuItem as MenuOption,
  Paper,
  Alert,
} from '@mui/material';
import ParentCard from '@/components/shared/ParentCard';
import {
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';

const CompulsoryScheduleTab = ({ showSnackbar }) => {
  const [currentTerm, setCurrentTerm] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  // Mock data for schedule
  const [schedules, setSchedules] = useState([
    {
      id: 1,
      paymentName: 'School Fee',
      classes: [
        { id: 'JSS1', name: 'JSS1 - [10,000 NGN]', missing: false },
        { id: 'JSS2', name: 'JSS2', missing: true },
        { id: 'JSS3', name: 'JSS3', missing: true },
        { id: 'SS1', name: 'SS1', missing: true },
        { id: 'SS2', name: 'SS2', missing: true },
        { id: 'SS3', name: 'SS3', missing: true },
      ],
      allClassesSet: false,
      missingCount: 5,
    },
    {
      id: 2,
      paymentName: 'Bag',
      classes: [
        { id: 'JSS1', name: 'JSS1 - [10,000 NGN]', missing: false },
        { id: 'JSS2', name: 'JSS2', missing: true },
        { id: 'JSS3', name: 'JSS3', missing: true },
        { id: 'SS1', name: 'SS1', missing: true },
        { id: 'SS2', name: 'SS2', missing: true },
        { id: 'SS3', name: 'SS3', missing: true },
      ],
      allClassesSet: false,
      missingCount: 5,
    },
  ]);

  const handleAddPaymentItem = () => {
    showSnackbar?.('Add payment item clicked');
  };

  const handleMenuOpen = (event, row) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const handleEditSchedule = () => {
    showSnackbar?.('Edit schedule for ' + selectedRow?.paymentName);
    handleMenuClose();
  };

  const handleDeleteSchedule = () => {
    showSnackbar?.('Delete schedule for ' + selectedRow?.paymentName, 'warning');
    handleMenuClose();
  };

  return (
    <Stack spacing={3}>
      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2" fontWeight={600} textAlign="center" sx={{ width: '100%' }}>
          Payment Schedules for 2024/2025 - Second Term (New Student Category)
        </Typography>
      </Alert>

      {/* Term Tabs and Search Row */}
          <ParentCard> 
      <Box display="flex" justifyContent="space-between" alignItems="center" gap={2}>
        {/* Term Tabs - Left Side */}
        <Tabs
          value={currentTerm}
          onChange={(e, val) => setCurrentTerm(val)}
          sx={{
            minHeight: 40,
            '& .MuiTab-root': {
              minHeight: 40,
            },
          }}
        >
          <Tab
            label="First Term"
            sx={{ textTransform: 'none', fontWeight: 600 }}
            icon={
              <Box
                component="span"
                sx={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  bgcolor: currentTerm === 0 ? 'primary.main' : 'grey.300',
                  color: 'white',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                  mr: 1,
                }}
              >
                ●
              </Box>
            }
            iconPosition="start"
          />
          <Tab
            label="Second Term"
            sx={{ textTransform: 'none', fontWeight: 600 }}
            icon={
              <Box
                component="span"
                sx={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  bgcolor: currentTerm === 1 ? 'primary.main' : 'grey.300',
                  color: 'white',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                  mr: 1,
                }}
              >
                ●
              </Box>
            }
            iconPosition="start"
          />
          <Tab
            label="Third Term"
            sx={{ textTransform: 'none', fontWeight: 600 }}
            icon={
              <Box
                component="span"
                sx={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  bgcolor: currentTerm === 2 ? 'primary.main' : 'grey.300',
                  color: 'white',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                  mr: 1,
                }}
              >
                ●
              </Box>
            }
            iconPosition="start"
          />
        </Tabs>

        {/* Search - Right Side */}
        <Box display="flex" gap={2}>
          <TextField
            placeholder="Search payment items..."
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ width: 300 }}
          />
          <Button variant="contained" startIcon={<SearchIcon />} size="small">
            Search
          </Button>
        </Box>
      </Box>

      {/* Legend and Add Button Row */}
      <Box display="flex" mt={2} mb={2} justifyContent="space-between" alignItems="center">
        {/* Legend - Left Side */}
        <Stack direction="row" spacing={3} alignItems="center">
          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: 'primary.main',
              }}
            />
            <Typography variant="caption">Active Payment Schedules</Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: 'error.main',
              }}
            />
            <Typography variant="caption">Inactive Payment Schedules</Typography>
          </Stack>
        </Stack>

        {/* Add Button - Right Side */}
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddPaymentItem}
          sx={{ fontWeight: 600 }}
        >
          Add payment item
        </Button>
      </Box>

      {/* Schedule Table */}
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell sx={{ fontWeight: 700, width: 60 }}>#</TableCell>
              <TableCell sx={{ fontWeight: 700, minWidth: 180 }}>PAYMENT NAME</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>CLASS</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, width: 100 }}>
                ACTION
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {schedules.map((schedule, index) => (
              <TableRow key={schedule.id} hover>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {schedule.paymentName}
                  </Typography>
                  {!schedule.allClassesSet && (
                    <Typography variant="caption" color="error.main">
                      You are yet to set Bag for all classes
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {schedule.classes.map((cls) => (
                      <Chip
                        key={cls.id}
                        label={cls.name}
                        size="small"
                        sx={{
                          bgcolor: cls.missing ? 'transparent' : 'primary.main',
                          color: cls.missing ? 'error.main' : 'white',
                          border: cls.missing ? '1px dashed' : 'none',
                          borderColor: 'error.main',
                          fontWeight: 600,
                          fontSize: 11,
                        }}
                      />
                    ))}
                    {schedule.missingCount > 0 && (
                      <Typography variant="caption" color="textSecondary" sx={{ ml: 1 }}>
                        {schedule.missingCount} missing
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <IconButton size="small" onClick={(e) => handleMenuOpen(e, schedule)}>
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Action Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuOption onClick={handleEditSchedule}>Edit Schedule</MenuOption>
        <MenuOption onClick={handleDeleteSchedule} sx={{ color: 'error.main' }}>
          Delete Schedule
        </MenuOption>
      </Menu>

      </ParentCard>
    </Stack>
  );
};

export default CompulsoryScheduleTab;
