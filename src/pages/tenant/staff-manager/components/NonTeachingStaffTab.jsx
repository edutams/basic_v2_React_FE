import React from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  CircularProgress,
  TextField,
  InputAdornment,
  Button,
  ButtonGroup,
  TablePagination,
  Avatar,
} from '@mui/material';
import {
  IconSearch,
  IconPlus,
  IconDotsVertical,
  IconChevronDown,
  IconUsers,
} from '@tabler/icons-react';

const NonTeachingStaffTab = ({
  loading,
  staff,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  page,
  rowsPerPage,
  total,
  handleChangePage,
  handleChangeRowsPerPage,
  handleAddStaff,
  handleBulkMenuOpen,
  handleUploadStaff,
  handleMenuOpen,
  getStatusColor,
}) => {
  return (
    <Box>
      {/* Toolbar */}
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            alignItems: 'center',
            flexWrap: 'wrap',
            width: { xs: '100%', sm: 'auto' },
          }}
        >
          <TextField
            size="small"
            placeholder="Search staff..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconSearch size={20} />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 200, flex: 1 }}
          />

          <TextField
            select
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 130, width: { xs: '100%', sm: 'auto' } }}
            SelectProps={{ native: true }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="leave">On Leave</option>
          </TextField>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', width: { xs: '100%', sm: 'auto' } }}>
          <Button variant="contained" size="small" startIcon={<IconPlus />}
            onClick={handleAddStaff}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            Add Non-Teaching Staff
          </Button>
          <ButtonGroup sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <Button variant="contained" size="small" startIcon={<IconPlus />}
              sx={{ textTransform: 'none', flex: 1 }}
              onClick={handleUploadStaff}
            >
              Multiple Non-Teaching Staff Upload
            </Button>
            <Button variant="contained" size="small" onClick={handleBulkMenuOpen} sx={{ px: 1 }}>
              <IconChevronDown size={16} />
            </Button>
          </ButtonGroup>
        </Box>
      </Box>

      {/* Table */}
      <TableContainer>
        <Table>
          <TableHead sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : '#fafafa' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Staff Id</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>FullName</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Contact</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>
                Action
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 10 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : staff.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 10 }}>
                  <Typography color="textSecondary">No staff found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              staff.map((staffMember, index) => (
                <TableRow key={staffMember.id} hover>
                  <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {staffMember.staff_id || staffMember.user?.user_id || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar
                        src={staffMember.user.avatar}
                        alt={staffMember.user.lname[0]}
                        sx={{
                          width: 30,
                          height: 30,
                          fontSize: '12px',
                          fontWeight: 700,
                          bgcolor: 'primary.main',
                          flexShrink: 0,
                        }}
                      >
                      </Avatar>
                      <Typography variant="body2">{staffMember.user?.full_name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{staffMember.user?.email || 'N/A'}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      {staffMember.user?.phone || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={staffMember.role || 'N/A'}
                      size="small"
                      sx={{
                        bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : '#f5f5f5',
                        color: (theme) => theme.palette.mode === 'dark' ? 'text.secondary' : '#666',
                        textTransform: 'capitalize',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={staffMember.staff_status}
                      color={getStatusColor(staffMember.staff_status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={(e) => handleMenuOpen(e, staffMember)}>
                      <IconDotsVertical size={18} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 20, 50]}
        component="div"
        count={total}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
};

export default NonTeachingStaffTab;
