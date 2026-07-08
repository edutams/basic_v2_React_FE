import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Card,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableFooter,
  TablePagination,
  IconButton,
  CircularProgress,
  Alert,
  useTheme
} from '@mui/material';
import GetAppIcon from '@mui/icons-material/GetApp';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ReusableModal from 'src/components/shared/ReusableModal';
import activityLogApi from '@/api/landlord/activity-log/activityLogApi';
import { useNotification } from '@/hooks/useNotification';

const ViewUsersListModal = ({ open, onClose, schoolId, schoolName, filters }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const notify = useNotification();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    if (open && schoolId) {
      setPage(0);
      fetchUsers();
    }
  }, [open, schoolId, filters]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await activityLogApi.getTenantLoggedInUsers(schoolId, {
        role: filters?.userType,
        from: filters?.from,
        to: filters?.to
      });
      if (response.status) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error('Error fetching tenant users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleExportToExcel = async () => {
    if (!users || users.length === 0) {
      notify.error('No users found to export.');
      return;
    }

    const isAgentsList = schoolId === 'landlord';
    const headers = isAgentsList
      ? ['S/N', 'User Details', 'Date/Time Logged In']
      : ['S/N', 'User Details', 'User Type', 'Date/Time Logged In'];

    const rows = users.map((row, index) => {
      const rowData = [index + 1, row.name || ''];
      if (!isAgentsList) {
        rowData.push(row.user_type || 'N/A');
      }
      rowData.push(row.time || '');
      return rowData;
    });

    try {
      const response = await activityLogApi.exportExcel({
        title: `Logged In Users - ${schoolName || 'School'}`,
        headers: headers,
        rows: rows
      });

      console.log('Export API responded with blob size:', response.data.size);

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Logged_In_Users_${(schoolName || 'School').replace(/\s+/g, '_')}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export excel', error);
      notify.error('Failed to export excel.');
    }
  };

  return (
    <ReusableModal
      open={open}
      onClose={onClose}
      title={
        <>
          Logged in users today for{' '}
          <Box component="span" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
            {schoolName || 'Selected School'}
          </Box>
        </>
      }
      size="large"
      showDivider={false}
    >
      <Card
        sx={{
          p: 0,
          borderRadius: '4px',
          boxShadow: 'none',
          border: '1px solid #e2e8f0',
          bgcolor: 'white',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<GetAppIcon />}
            onClick={handleExportToExcel}
            sx={{
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            Export to Excel
          </Button>
        </Box>
        <Box sx={{ p: 0 }}>
          <TableContainer>
            <Table sx={{ whiteSpace: 'nowrap' }}>
              <TableHead sx={{ bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.02)' : '#F9FAFB' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>S/N</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>User Details</TableCell>
                  {schoolId !== 'landlord' && (
                    <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>User Type</TableCell>
                  )}
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Date/Time Logged In</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary, textAlign: 'right' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={schoolId === 'landlord' ? 4 : 5} align="center" sx={{ py: 3 }}>
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={schoolId === 'landlord' ? 4 : 5} align="center">
                      <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
                        No users logged in for this school matching criteria.
                      </Alert>
                    </TableCell>
                  </TableRow>
                ) : (
                  (rowsPerPage > 0
                    ? users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    : users
                  ).map((row, index) => (
                    <TableRow key={row.id || index} hover>
                      <TableCell sx={{ color: theme.palette.text.secondary }}>
                        {page * rowsPerPage + index + 1}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="600" color="#4a5568">
                          {row.name}
                        </Typography>
                      </TableCell>
                      {schoolId !== 'landlord' && (
                        <TableCell>
                          <Typography variant="body2" sx={{ color: '#4a5568', fontWeight: 500 }}>
                            {row.user_type || 'N/A'}
                          </Typography>
                        </TableCell>
                      )}
                      <TableCell>
                        <Typography sx={{ color: '#718096', fontWeight: 500, fontSize: '13px' }}>
                          {row.time}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small">
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    count={users.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    sx={{ borderBottom: 'none' }}
                  />
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
        </Box>
      </Card>
    </ReusableModal>
  );
};

export default ViewUsersListModal;
