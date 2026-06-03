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
} from '@mui/material';
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
      {/* Schedule Info Box - Centered */}
      <Box display="flex" justifyContent="center">
        <Typography variant="body2" fontWeight={600} color="textSecondary">
          Payment Schedules for 2024/2025 - Second Term (New Student Category)
        </Typography>
      </Box>

        {/* Term Tabs */}
        <Box>
          <Tabs
            value={currentTerm}
            onChange={(e, val) => setCurrentTerm(val)}
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              mb: 2,
            }}
          >
            <Tab label="First Term" sx={{ textTransform: 'none' }} />
            <Tab label="Second Term" sx={{ textTransform: 'none' }} />
            <Tab label="Third Term" sx={{ textTransform: 'none' }} />
          </Tabs>

          {/* Search and Legend */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Box display="flex" gap={2} flex={1}>
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
                sx={{ minWidth: 300 }}
              />
              <Button variant="contained" startIcon={<SearchIcon />} size="small">
                Search
              </Button>
            </Box>

            <Stack direction="row" spacing={2} alignItems="center">
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

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddPaymentItem}
              sx={{ fontWeight: 600 }}
            >
              Add payment item
            </Button>
          </Box>
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
    </Stack>
  );
};

export default CompulsoryScheduleTab;
