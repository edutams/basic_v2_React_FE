import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Stack,
  Chip,
  TablePagination,
  Skeleton,
  Alert,
} from '@mui/material';
import StandardModal from '@/components/shared/StandardModal';
import agentApi from '@/api/landlord/organizations/agent';

const categoryLabels = {
  total: 'All Subscriptions',
  active: 'Active Subscriptions',
  secondary: 'Secondary Schools',
  primary: 'Primary Schools',
};

const SubscriptionSchoolsModal = ({ open, onClose, category }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await agentApi.getSubscriptionSchoolsByCategory(category, {
        page: page + 1,
        per_page: rowsPerPage,
      });
      if (res.status && res.data) {
        setData(res.data.data || []);
        setTotalRows(res.data.total || 0);
      }
    } catch (e) {
      console.error('Failed to fetch schools by category', e);
    } finally {
      setLoading(false);
    }
  }, [category, page, rowsPerPage]);

  useEffect(() => {
    if (open && category) {
      setPage(0);
      fetchData();
    }
  }, [open, category]);

  useEffect(() => {
    if (open && category) {
      fetchData();
    }
  }, [page]);

  return (
    <StandardModal
      open={open}
      onClose={onClose}
      title={categoryLabels[category] || 'Schools'}
      maxWidth="md"
      padding={3}
      dividers={false}
    >
      <TableContainer sx={{ maxHeight: 450 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>S/N</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>School</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">
                Type
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">
                Status
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">
                Amount
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(5)].map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton variant="text" width={j === 0 ? 30 : 80} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length > 0 ? (
              data.map((row, index) => (
                <TableRow key={row.tenant_id || index} hover>
                  <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          fontSize: '14px',
                          bgcolor: 'primary.light',
                          color: 'primary.main',
                          fontWeight: 700,
                        }}
                      >
                        {(row.tenant_name || 'NA')
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography fontWeight={700} fontSize="14px">
                          {row.tenant_name}
                        </Typography>
                        <Typography fontSize="12px" color="text.secondary">
                          {row.address || '—'}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={formatSchoolType(row.school_type)}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={row.subscription_status === 'active' ? 'Active' : row.subscription_status === 'pending' ? 'Pending' : 'Expired'}
                      size="small"
                      color={
                        row.subscription_status === 'active'
                          ? 'success'
                          : row.subscription_status === 'pending'
                            ? 'warning'
                            : 'default'
                      }
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight={600} fontSize="14px">
                      ₦{Number(row.amount || 0).toLocaleString()}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Alert severity="info" sx={{ justifyContent: 'center' }}>
                    No schools found for this category.
                  </Alert>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={totalRows}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
      />
    </StandardModal>
  );
};

function formatSchoolType(type) {
  if (!type) return 'N/A';
  if (Array.isArray(type)) {
    return type.map((t) => t.charAt(0).toUpperCase() + t.slice(1)).join(', ');
  }
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export default SubscriptionSchoolsModal;
