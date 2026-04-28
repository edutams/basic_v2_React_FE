import React, { useState } from 'react';
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  useTheme,
  Stack,
  IconButton,
  Menu,
  MenuItem,
  TableFooter,
  TablePagination,
  CircularProgress,
  Avatar,
  Link,
} from '@mui/material';
import { IconDotsVertical, IconEye } from '@tabler/icons-react';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import BusinessIcon from '@mui/icons-material/Business';
import { getSpaContact, formatDate, StatusChip } from './Schooltabhelpers';

const AllApplicationsTab = ({
  prospectList,
  prospectLoading,
  page,
  setPage,
  rowsPerPage,
  setRowsPerPage,
  nameValue,
  activeFilters,
  onReview,
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeRow, setActiveRow] = useState(null);

  const thSx = {
    fontWeight: 700,
    fontSize: '11px',
    color: theme.palette.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    py: 1.5,
  };

  const filter = (arr) => {
    let result = arr;
    if (nameValue) {
      result = result.filter((r) =>
        (r.tenant_name || r.institutionName || '').toLowerCase().includes(nameValue.toLowerCase()),
      );
    }
    if (activeFilters.name) {
      result = result.filter((r) =>
        (r.tenant_name || r.institutionName || '')
          .toLowerCase()
          .includes(activeFilters.name.toLowerCase()),
      );
    }
    if (activeFilters.status) {
      result = result.filter((r) => r.status === activeFilters.status);
    }
    if (activeFilters.date_from) {
      result = result.filter((r) => r.created_at && r.created_at >= activeFilters.date_from);
    }
    if (activeFilters.date_to) {
      result = result.filter((r) => r.created_at && r.created_at <= activeFilters.date_to);
    }
    return result;
  };

  const paginate = (arr) => arr.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const filtered = filter(prospectList);

  if (prospectLoading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <TableContainer component={Paper} elevation={0} variant="outlined" sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#fafafa' }}>
            <TableRow>
              <TableCell sx={thSx}>#</TableCell>
              <TableCell sx={thSx}>School</TableCell>
              <TableCell sx={thSx}>Admin Contact (SPA)</TableCell>
              <TableCell sx={thSx}>Organisation</TableCell>
              <TableCell sx={thSx}>Submitted</TableCell>
              <TableCell sx={thSx}>Status</TableCell>
              <TableCell sx={thSx} align="right">
                Action
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginate(filtered).length > 0 ? (
              paginate(filtered).map((row, i) => {
                const spa = getSpaContact(row);
                const agent = row.agent;
                const domainHost = agent?.organization_domain
                  ? `${row.tenant_short_name}.${agent.organization_domain}`
                  : row.tenant_short_name || '';
                const prospectiveUrl = domainHost ? `https://${domainHost}` : null;

                return (
                  <TableRow key={row.id} hover sx={{ '&:hover': { bgcolor: '#fafafa' } }}>
                    <TableCell sx={{ color: '#6b7280', fontSize: '13px' }}>
                      {page * rowsPerPage + i + 1}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar
                          src={row.logo || row.image}
                          sx={{ width: 44, height: 44, bgcolor: '#E7E9EB' }}
                        >
                          {!row.logo && !row.image && (
                            <PersonOutlineIcon sx={{ color: '#000', fontSize: 28 }} />
                          )}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={700} sx={{ lineHeight: 1.3 }}>
                            {row.tenant_name}
                          </Typography>
                          {prospectiveUrl ? (
                            <Link
                              href={prospectiveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              variant="caption"
                              color="text.secondary"
                              underline="hover"
                            >
                              {domainHost}
                            </Link>
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              —
                            </Typography>
                          )}
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar src={spa.image} sx={{ width: 44, height: 44, bgcolor: '#E7E9EB' }}>
                          {!spa.image && <PersonOutlineIcon sx={{ color: '#000', fontSize: 28 }} />}
                        </Avatar>
                        <Box>
                          <Typography variant="caption" fontWeight={600} display="block">
                            {spa.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {spa.email}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {spa.phone}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar
                          src={agent?.organization_logo}
                          sx={{ width: 44, height: 44, bgcolor: '#E7E9EB' }}
                        >
                          {!agent?.organization_logo && <BusinessIcon sx={{ color: '#000' }} />}
                        </Avatar>
                        <Box>
                          <Typography variant="caption" fontWeight={600} display="block">
                            {agent?.organization_name || '—'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {agent?.organization_email || ''}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(row.created_at)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <StatusChip status={row.status} />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          setAnchorEl(e.currentTarget);
                          setActiveRow(row);
                        }}
                      >
                        <IconDotsVertical size={18} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">No applications found.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                count={filtered.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(_, p) => setPage(p)}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{ sx: { borderRadius: 2, minWidth: 170 } }}
      >
        <MenuItem
          onClick={() => {
            onReview(activeRow);
            setAnchorEl(null);
          }}
        >
          Review Application
        </MenuItem>
      </Menu>
    </>
  );
};

export default AllApplicationsTab;
