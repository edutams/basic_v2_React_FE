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
  Alert,
  Skeleton
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { IconList, IconRefresh } from '@tabler/icons-react';
import ParentCard from '../../../../components/shared/ParentCard';

const SubjectTable = ({ subjects = [], onSelect, selectedId, onAddSubject, onSubjectAction, loading = false, onFetch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const filteredSubjects = subjects.filter((subj) =>
    subj.subject_name.toLowerCase().includes(searchTerm.toLowerCase()),
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

  const clearFilters = () => {
    setSearchTerm('');
    setPage(0);
  };

  const hasActiveFilters = searchTerm !== '';

  return (
    <ParentCard
      title={
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5"></Typography>
          <Button variant="contained" size="small" onClick={onAddSubject}>Add New Subject</Button>
        </Box>
      }
       sx={{ px: 0, py: 0, '& .MuiCardContent-root': { px: 3,py:0 } }}
    >
      <Box sx={{ p: 0 }}>
        <Box sx={{ mb: 2, display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          {loading ? (
            <>
              <Skeleton variant="rounded" width={100} height={36} />
              <Skeleton variant="rounded" width={220} height={36} />
              <Skeleton variant="rounded" width={80} height={36} />
            </>
          ) : (
            <>
              {hasActiveFilters && (
                <Button variant="outlined" size="small" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
              <TextField
                placeholder="Search subjects..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(0);
                }}
                size="small"
                sx={{ minWidth: 220 }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  },
                }}
              />
              {onFetch && (
                <Button variant="outlined" size="small" onClick={onFetch} startIcon={<IconRefresh size={16} />}>
                  Fetch
                </Button>
              )}
            </>
          )}
        </Box>

          <TableContainer>
            <Table stickyHeader sx={{ '& .MuiTableCell-root': { py: 0.5, px: 1 }, whiteSpace: 'nowrap'  }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>S/N</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Subject Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      {[...Array(4)].map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton variant="text" width={j === 0 ? 30 : j === 3 ? 40 : 100} />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : paginatedSubjects.length > 0 ? (
                  paginatedSubjects.map((subject, index) => (
                    <TableRow key={subject.id || index} hover>
                      <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                      <TableCell>{subject.subject_name}</TableCell>
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
                          <MenuItem
                            onClick={() => {
                              onSelect(subject);
                              handleMenuClose();
                            }}
                          >
                            <IconList size={16} style={{ marginRight: 8 }} />
                            Manage Topics
                          </MenuItem>
                          <MenuItem onClick={() => handleAction('edit', subject)}>
                            <EditIcon fontSize="small" sx={{ mr: 1 }} />
                            Edit Subject
                          </MenuItem>
                          <MenuItem onClick={() => handleAction('delete', subject)} sx={{ color: 'error.main' }}>
                            <DeleteIcon fontSize="small" sx={{ mr: 1, color: 'error.main' }} />
                            Delete Subject
                          </MenuItem>
                        </Menu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Alert severity="info" sx={{ justifyContent: 'center', textAlign: 'center' }}>
                        No subjects found
                      </Alert>
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
