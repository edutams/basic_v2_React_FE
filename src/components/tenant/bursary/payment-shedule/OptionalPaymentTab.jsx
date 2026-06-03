import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  TextField,
  InputAdornment,
  Switch,
  FormControlLabel,
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
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  FileUpload as UploadIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import ParentCard from '@/components/shared/ParentCard';

const OptionalPaymentTab = ({ showSnackbar }) => {
  const [selectedSession, setSelectedSession] = useState('2024/2025 - Second Term');
  const [selectedCategory, setSelectedCategory] = useState('New Student Category');
  const [enableFullSession, setEnableFullSession] = useState(false);
  const [currentTerm, setCurrentTerm] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  // Mock data for optional payments
  const [schedules, setSchedules] = useState([
    {
      id: 1,
      paymentName: 'Extra Classes',
      classes: [
        { id: 'JSS1', name: 'JSS1 - [5,000 NGN]', missing: false },
        { id: 'JSS2', name: 'JSS2 - [5,000 NGN]', missing: false },
        { id: 'JSS3', name: 'JSS3', missing: true },
      ],
      allClassesSet: false,
      missingCount: 1,
    },
    {
      id: 2,
      paymentName: 'School Bus',
      classes: [
        { id: 'JSS1', name: 'JSS1 - [15,000 NGN]', missing: false },
        { id: 'JSS2', name: 'JSS2 - [15,000 NGN]', missing: false },
        { id: 'JSS3', name: 'JSS3 - [15,000 NGN]', missing: false },
        { id: 'SS1', name: 'SS1 - [15,000 NGN]', missing: false },
      ],
      allClassesSet: true,
      missingCount: 0,
    },
  ]);

  const sessions = ['2024/2025 - First Term', '2024/2025 - Second Term', '2024/2025 - Third Term'];
  const categories = ['New Student Category', 'Returning Students', 'Scholarship'];

  const handleAddPaymentItem = () => {
    showSnackbar?.('Add optional payment item clicked');
  };

  const handleImportSchedule = () => {
    showSnackbar?.('Import optional schedule clicked');
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
    <ParentCard>
      <Stack spacing={3}>
        {/* Header Section */}
        <Box>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                bgcolor: 'success.lighter',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="h6" fontWeight={700} color="success.main">
                💰
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Optional Payment Schedule
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Configure optional payment items that parents can choose to pay.
              </Typography>
            </Box>
          </Box>

          {/* Info Alert */}
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Note:</strong> Optional payments are not mandatory. Parents can choose whether
              to pay for these items.
            </Typography>
          </Alert>

          {/* Filters Row */}
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              alignItems: 'center',
              flexWrap: 'wrap',
              mb: 2,
            }}
          >
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Select Session</InputLabel>
              <Select
                value={selectedSession}
                label="Select Session"
                onChange={(e) => setSelectedSession(e.target.value)}
              >
                {sessions.map((session) => (
                  <MenuItem key={session} value={session}>
                    {session}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Student Pay Category</InputLabel>
              <Select
                value={selectedCategory}
                label="Student Pay Category"
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={enableFullSession}
                  onChange={(e) => setEnableFullSession(e.target.checked)}
                />
              }
              label="Enable full-session payment"
            />

            <Box sx={{ marginLeft: 'auto' }}>
              <Button
                variant="contained"
                startIcon={<UploadIcon />}
                onClick={handleImportSchedule}
                size="small"
              >
                Import schedule for current term
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Schedule Info Box */}
        <Paper
          sx={{
            p: 2,
            bgcolor: 'success.lighter',
            border: '1px solid',
            borderColor: 'success.light',
          }}
        >
          <Typography variant="body2" fontWeight={600}>
            Optional Payment Schedules for {selectedSession} ({selectedCategory})
          </Typography>
        </Paper>

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

          {/* Search and Actions */}
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
                placeholder="Search optional payment items..."
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

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddPaymentItem}
              sx={{ fontWeight: 600 }}
            >
              Add optional payment item
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
              {schedules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Alert severity="info" sx={{ justifyContent: 'center' }}>
                      No optional payment items configured yet.
                    </Alert>
                  </TableCell>
                </TableRow>
              ) : (
                schedules.map((schedule, index) => (
                  <TableRow key={schedule.id} hover>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {schedule.paymentName}
                      </Typography>
                      {!schedule.allClassesSet && (
                        <Typography variant="caption" color="warning.main">
                          ⚠️ Not configured for all classes
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
                              bgcolor: cls.missing ? 'transparent' : 'success.main',
                              color: cls.missing ? 'warning.main' : 'white',
                              border: cls.missing ? '1px dashed' : 'none',
                              borderColor: 'warning.main',
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
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>

      {/* Action Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuOption onClick={handleEditSchedule}>Edit Schedule</MenuOption>
        <MenuOption onClick={handleDeleteSchedule} sx={{ color: 'error.main' }}>
          Delete Schedule
        </MenuOption>
      </Menu>
    </ParentCard>
  );
};

export default OptionalPaymentTab;
