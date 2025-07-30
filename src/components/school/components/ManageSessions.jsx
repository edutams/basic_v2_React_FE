import React, { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  TablePagination,
} from '@mui/material';
import { IconDots } from '@tabler/icons-react';

const ManageSessions = ({ activeTab, onSessionAction }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const sessions = [
    { id: 1, name: '2020/2021', status: 'INACTIVE' },
    { id: 2, name: '2021/2022', status: 'INACTIVE' },
    { id: 3, name: '2022/2023', status: 'INACTIVE' },
    { id: 4, name: '2023/2024', status: 'ACTIVE' },
    { id: 5, name: '2024/2025', status: 'INACTIVE' },
    { id: 6, name: '2025/2026', status: 'ACTIVE' },
  ];

  const sessionTerms = [
    { id: 1, sessionTerm: '2023/2024 - First Term', status: 'ACTIVE' },
    { id: 2, sessionTerm: '2023/2024 - Second Term', status: 'INACTIVE' },
    { id: 3, sessionTerm: '2023/2024 - Third Term', status: 'INACTIVE' },
    { id: 4, sessionTerm: '2024/2025 - First Term', status: 'INACTIVE' },
    { id: 5, sessionTerm: '2024/2025 - Second Term', status: 'INACTIVE' },
  ];

  const currentData = activeTab === 0 ? sessions : sessionTerms;
  const paginatedData = currentData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleMenuClick = (event, session) => {
    setAnchorEl(event.currentTarget);
    setSelectedSession(session);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedSession(null);
  };

  const handleAction = (action, session) => {
    if (onSessionAction) {
      onSessionAction(action, session);
    }
    handleMenuClose();
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (activeTab !== 0 && activeTab !== 1) return null;

  return (
    <Box>
      <Paper variant="outlined">
        <TableContainer>
          <Table sx={{ whiteSpace: 'nowrap' }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>#</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>
                  {activeTab === 0 ? 'Session Name' : 'Session/Term'}
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((item, index) => (
                  <TableRow key={item.id} sx={{ '&:hover': { bgcolor: 'grey.50' } }}>
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell>
                      {activeTab === 0 ? item.name : item.sessionTerm}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={String(item.status || 'UNKNOWN')}
                        color={item.status === 'ACTIVE' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuClick(e, item)}
                      >
                        <IconDots size={16} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography>
                      {activeTab === 0 ? 'No sessions found' : 'No session/terms found'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          component="div"
          count={currentData.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleAction('edit', selectedSession)}>
          Edit
        </MenuItem>
        <MenuItem onClick={() => handleAction('delete', selectedSession)}>
          Delete
        </MenuItem>
        <MenuItem onClick={() => handleAction(
          selectedSession?.status === 'ACTIVE' ? 'deactivate' : 'activate', 
          selectedSession
        )}>
          {selectedSession?.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ManageSessions;
