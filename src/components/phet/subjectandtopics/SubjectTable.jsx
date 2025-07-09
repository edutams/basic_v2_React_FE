import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  TextField,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableFooter,
  TablePagination,
  Paper,
  Chip,
  Button,
  IconButton,
  Menu,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import ParentCard from '../../shared/ParentCard';

const SubjectTable = ({ subjects = [], onSelect, selectedId, onAddSubject, onSubjectAction }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const filteredSubjects = subjects.filter((subj) =>
    subj.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const paginatedSubjects = filteredSubjects.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  const handleMenuOpen = (event, subject) => {
    setAnchorEl(event.currentTarget);
    setSelectedSubject(subject);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedSubject(null);
  };

  const handleAction = (action, subject) => {
    onSubjectAction?.(action, subject);
    handleMenuClose();
  };

  return (
    <ParentCard
      title={
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5">Manage Subjects</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={onAddSubject}>
            Add New Subject
          </Button>
        </Box>
      }
    >
      <Box sx={{ p: 0 }}>
        <Box sx={{ mb: 3 }}>
          <TextField
            placeholder="Search subjects..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ flexGrow: 1 }}
          />
        </Box>

        <Paper variant="outlined">
          <TableContainer>
            <Table sx={{ whiteSpace: 'nowrap' }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Subject Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedSubjects.length > 0 ? (
                  paginatedSubjects.map((subject, index) => (
                    <TableRow>
                      <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                      <TableCell>{subject.name}</TableCell>
                      <TableCell>
                        <Chip
                          label={subject.status.toUpperCase()}
                          size="small"
                          sx={{
                            bgcolor:
                              subject.status === 'active'
                                ? (theme) => theme.palette.success.light
                                : (theme) => theme.palette.error.light,
                            color:
                              subject.status === 'active'
                                ? (theme) => theme.palette.success.main
                                : (theme) => theme.palette.error.main,
                            borderRadius: '8px',
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMenuOpen(e, subject);
                          }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                        <Menu
                          anchorEl={anchorEl}
                          open={Boolean(anchorEl) && selectedSubject?.id === subject.id}
                          onClose={handleMenuClose}
                        >
                          <MenuItem>
                           Manage Topics
                          </MenuItem>
                          <MenuItem>
                            Edit Subject
                          </MenuItem>
                          <MenuItem onClick={() => handleAction('delete', subject)}>
                            Delete Subject
                          </MenuItem>
                        </Menu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography variant="body1" color="textSecondary">
                        No subjects found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    colSpan={4}
                    count={filteredSubjects.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => {
                      setRowsPerPage(parseInt(e.target.value, 10));
                      setPage(0);
                    }}
                  />
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </ParentCard>
  );
};

SubjectTable.propTypes = {
  subjects: PropTypes.array.isRequired,
  onSelect: PropTypes.func.isRequired,
  selectedId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onAddSubject: PropTypes.func.isRequired,
  onSubjectAction: PropTypes.func,
};

export default SubjectTable;
