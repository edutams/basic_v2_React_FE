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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';

const OptionalPaymentTab = ({ showSnackbar }) => {
  const [currentTerm, setCurrentTerm] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    onConfirm: null,
  });

  // Mock data for optional payments
  const [schedules, setSchedules] = useState([
    {
      id: 1,
      paymentName: 'Extra Classes',
      classes: [
        { id: 'JSS1', name: 'JSS1 - [5,000 NGN]', missing: false },
        { id: 'JSS2', name: 'JSS2 - [5,000 NGN]', missing: false },
        { id: 'JSS3', name: 'JSS3', missing: true },
        { id: 'SS1', name: 'SS1', missing: true },
        { id: 'SS2', name: 'SS2', missing: true },
        { id: 'SS3', name: 'SS3', missing: true },
      ],
      allClassesSet: false,
      missingCount: 4,
    },
    {
      id: 2,
      paymentName: 'School Bus',
      classes: [
        { id: 'JSS1', name: 'JSS1 - [15,000 NGN]', missing: false },
        { id: 'JSS2', name: 'JSS2 - [15,000 NGN]', missing: false },
        { id: 'JSS3', name: 'JSS3 - [15,000 NGN]', missing: false },
        { id: 'SS1', name: 'SS1 - [15,000 NGN]', missing: false },
        { id: 'SS2', name: 'SS2 - [15,000 NGN]', missing: false },
        { id: 'SS3', name: 'SS3 - [15,000 NGN]', missing: false },
      ],
      allClassesSet: true,
      missingCount: 0,
    },
  ]);

  const handleAddPaymentItem = () => {
    showSnackbar?.('Add optional payment item clicked');
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

  const handleClassClick = (schedule, cls) => {
    if (cls.missing) {
      // Add payment to class
      setConfirmDialog({
        open: true,
        title: 'Add Payment',
        message: `Are you sure you want to add payment to ${cls.id} for ${schedule.paymentName}?`,
        onConfirm: () => {
          showSnackbar?.(`Payment added to ${cls.id} for ${schedule.paymentName}`);
          setConfirmDialog({ ...confirmDialog, open: false });
        },
      });
    } else {
      // Edit payment for class
      setConfirmDialog({
        open: true,
        title: 'Edit Payment',
        message: `Are you sure you want to edit payment for ${cls.id} in ${schedule.paymentName}?`,
        onConfirm: () => {
          showSnackbar?.(`Payment edited for ${cls.id} in ${schedule.paymentName}`);
          setConfirmDialog({ ...confirmDialog, open: false });
        },
      });
    }
  };

  const handleConfirmDialogClose = () => {
    setConfirmDialog({ ...confirmDialog, open: false });
  };

  return (
    <Stack spacing={3}>
      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2" fontWeight={600} textAlign="center" sx={{ width: '100%' }}>
          Payment Schedules for 2024/2025 - Second Term (New Student Category)
        </Typography>
      </Alert>

      {/* Term Tabs and Search Row */}
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
                bgcolor: 'success.main',
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
                bgcolor: 'warning.main',
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
          Add optional payment item
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
                </TableCell>
                <TableCell>
                  {/* Warning message if not all classes set - Above the chips */}
                  {!schedule.allClassesSet && (
                    <Typography variant="caption" color="warning.main" display="block" mb={1}>
                      You are yet to set Payment for all classes
                    </Typography>
                  )}
                  <Box display="flex" flexWrap="wrap" gap={1} alignItems="center">
                    {schedule.classes.map((cls) => (
                      <Chip
                        key={cls.id}
                        label={cls.name}
                        size="small"
                        onClick={() => handleClassClick(schedule, cls)}
                        sx={{
                          bgcolor: cls.missing ? 'transparent' : 'success.main',
                          color: cls.missing ? 'warning.main' : 'white',
                          border: cls.missing ? '1px dashed' : 'none',
                          borderColor: 'warning.main',
                          fontWeight: 600,
                          fontSize: 11,
                          cursor: 'pointer',
                          '&:hover': {
                            opacity: 0.8,
                          },
                        }}
                      />
                    ))}
                    {schedule.missingCount > 0 && (
                      <Typography variant="caption" color="textSecondary">
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

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleConfirmDialogClose}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <Typography variant="body2">{confirmDialog.message}</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button color="inherit" onClick={handleConfirmDialogClose}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={confirmDialog.onConfirm}
            sx={{ fontWeight: 600 }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default OptionalPaymentTab;
