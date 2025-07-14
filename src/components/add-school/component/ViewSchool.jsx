import React, { useEffect, useState } from 'react';
import {
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  TableFooter,
  TablePagination,
} from '@mui/material';
import { useParams } from 'react-router';
import { IconSchool } from '@tabler/icons-react';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const ViewSchool = () => {
  const { schoolUrl } = useParams();
  const [school, setSchool] = useState(null);
  const [subSchools, setSubSchools] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeRow, setActiveRow] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    const schoolList = JSON.parse(localStorage.getItem('schoolList')) || [];
    const sch = schoolList.find((s) => s.schoolUrl === schoolUrl);
    setSchool({
      ...sch,
      administratorEmail: sch?.administratorEmail || 'N/A',
      moduleType: sch?.moduleType || 'N/A',
    });

    // Simulate sub-schools (replace with actual sub-school data if available)
    // Example: Filter schools with the same agent as sub-schools
    const relatedSchools = schoolList.filter(
      (s) => s.agent === sch?.agent && s.schoolUrl !== schoolUrl
    ).map((s) => ({
      ...s,
      administratorEmail: s?.administratorEmail || 'N/A',
      moduleType: s?.moduleType || 'N/A',
    }));
    setSubSchools(relatedSchools);
  }, [schoolUrl]);

  const handleActionClick = (event, rowId) => {
    setAnchorEl(event.currentTarget);
    setActiveRow(rowId);
  };

  const handleActionClose = () => {
    setAnchorEl(null);
    setActiveRow(null);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedSchools = subSchools.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (!school) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No school data available for URL: {schoolUrl}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* <Typography variant="h4" sx={{ mb: 3 }}>
        View School: {school.institutionName}
      </Typography> */}
      <Paper elevation={3}>
        <TableContainer>
          <Box sx={{ p: 2 }}>
            {/* <Typography variant="h5" gutterBottom>
              School Details
            </Typography> */}
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Sub School Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Subscription Plan</TableCell>
                  <TableCell>Amount Per User</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedSchools.length > 0 ? (
                  paginatedSchools.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.institutionName}</TableCell>
                      <TableCell>{row.administratorEmail}</TableCell>
                      <TableCell>{row.moduleType}</TableCell>
                      <TableCell>{row.moduleType}</TableCell>
                      <TableCell>
                        <Chip
                          sx={{
                            bgcolor:
                              row.status === 'Active'
                                ? (theme) => theme.palette.success.light
                                : (theme) => theme.palette.primary.light,
                            color:
                              row.status === 'Active'
                                ? (theme) => theme.palette.success.main
                                : (theme) => theme.palette.primary.main,
                            borderRadius: '8px',
                          }}
                          size="small"
                          label={row.status || 'Unknown'}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={(e) => handleActionClick(e, row.id)}>
                          <MoreVertIcon />
                        </IconButton>
                        <Menu
                          anchorEl={anchorEl}
                          open={Boolean(anchorEl) && activeRow === row.id}
                          onClose={handleActionClose}
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                          PaperProps={{ sx: { minWidth: 120, boxShadow: 3 } }}
                        >
                          <MenuItem onClick={handleActionClose}>View School Stage</MenuItem>
                          <MenuItem onClick={handleActionClose}>Manage Subscription</MenuItem>
                          <MenuItem onClick={handleActionClose}>Update Subscription Method</MenuItem>
                        </Menu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: 'center', padding: '40px 0' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <IconSchool
                          width={48}
                          height={48}
                          color="#757575"
                          sx={{ marginBottom: '16px' }}
                        />
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 'bold', color: '#757575', marginBottom: '8px' }}
                        >
                          No related schools available
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#757575', fontSize: '14px' }}>
                          No related schools found for {school.institutionName}.
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    count={subSchools.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </TableRow>
              </TableFooter>
            </Table>
          </Box>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default ViewSchool;