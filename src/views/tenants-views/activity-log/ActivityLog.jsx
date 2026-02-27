import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import Breadcrumb from 'src/layouts/full/shared/breadcrumb/Breadcrumb';
import BlankCard from 'src/components/shared/BlankCard';
import dayjs from 'dayjs';
import tenantApi from 'src/api/tenant_api';
import { CircularProgress, Alert, TablePagination } from '@mui/material';

const BCrumb = [
  {
    to: '/school-dashboard',
    title: 'Home',
  },
  {
    title: 'Activity Log',
  },
];

const ActivityLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [total, setTotal] = useState(0);

  // Statistics
  const [statistics, setStatistics] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const fetchLogs = async (currentPage, limit) => {
    setLoading(true);
    try {
      const response = await tenantApi.get(
        `/activity-logs?page=${currentPage + 1}&per_page=${limit}`,
      );
      const data = response.data;
      setLogs(data.data || []);
      setTotal(data.meta?.total || 0);
      setError(null);
    } catch (err) {
      setError('Failed to fetch activity logs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    setStatsLoading(true);
    try {
      const response = await tenantApi.get('/activity-logs/statistics');
      if (response.data.status === 'success') {
        setStatistics(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch statistics', err);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(page, rowsPerPage);
  }, [page, rowsPerPage]);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <PageContainer title="Activity Log" description="View system activity logs">
      <Breadcrumb title="Activity Log" items={BCrumb} />

      {/* Stats Cards */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          mb: 3,
          flexWrap: 'wrap',
          justifyContent: { xs: 'center', sm: 'flex-start' },
        }}
      >
        {/* {statsLoading ? (
          <Typography>Loading statistics...</Typography>
        ) : statistics ? ( */}
        <>
          <Box
            sx={{
              flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 200px' },
              minWidth: 0,
              maxWidth: { xs: '100%', sm: '250px' },
            }}
          >
            <BlankCard>
              <CardContent>
                <Typography variant="body2" color="textSecondary">
                  Total Activities
                </Typography>
                <Typography variant="h3" fontWeight={600}>
                  {0}
                </Typography>
              </CardContent>
            </BlankCard>
          </Box>
          <Box
            sx={{
              flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 300px' },
              minWidth: 0,
              maxWidth: { xs: '100%', sm: '350px' },
            }}
          >
            <BlankCard>
              <CardContent>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Activities by Log Name
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {/* {statistics.by_log_name?.slice(0, 5).map((item, index) => (
                    <Chip
                      key={index}
                      label={`${item.log_name || 'default'}: ${item.count}`}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  ))} */}
                </Box>
              </CardContent>
            </BlankCard>
          </Box>
        </>
      </Box>

      <BlankCard>
        <CardContent>
          <Typography variant="h5" fontWeight={600} mb={3}>
            System Activity Logs
          </Typography>

          {loading ? (
            <Box display="flex" justifyContent="center" py={5}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : (
            <>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <Typography variant="h6">Description</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="h6">Subject</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="h6">Causer</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="h6">Date</Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {logs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          No activity logs found
                        </TableCell>
                      </TableRow>
                    ) : (
                      logs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            <Typography variant="body1">{log.description}</Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={log.subject_type || 'System'}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body1">
                              {log.causer?.name ||
                                (log.causer?.fname && log.causer?.lname
                                  ? log.causer.fname + ' ' + log.causer.lname
                                  : null) ||
                                'System'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="textSecondary">
                              {dayjs(log.created_at).format('MMM D, YYYY HH:mm')}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[10, 20, 50]}
                component="div"
                count={total}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </>
          )}
        </CardContent>
      </BlankCard>
    </PageContainer>
  );
};

export default ActivityLog;
