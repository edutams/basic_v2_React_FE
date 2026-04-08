import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  TableFooter,
  TablePagination,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Button,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import ParentCard from '../../shared/ParentCard';

const TopicPanel = ({ selectedSubject, topics = [], onAction, isLoading = false }) => {
  // console.log('TopicPanel props:', { selectedSubject, topics, isLoading });
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleMenuOpen = (event, topic) => {
    setAnchorEl(event.currentTarget);
    setSelectedTopic(topic);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTopic(null);
  };

  const handleActionClick = (action) => {
    if (onAction && typeof onAction === 'function') {
      onAction(action, selectedTopic);
    }
    handleMenuClose();
  };

  const filteredTopics = topics.filter((topic) =>
    topic.topic.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const clearFilters = () => {
    setSearchTerm('');
    setPage(0);
  };

  const hasActiveFilters = searchTerm !== '';

  const paginatedTopics = filteredTopics.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  return (
    <ParentCard
      title={
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5">
            {selectedSubject ? (
              <>
                Manage Topics in{' '}
                <Box component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>
                  {selectedSubject.subject_name}
                </Box>
              </>
            ) : (
              'Manage Topics'
            )}
          </Typography>
          {selectedSubject && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => onAction('create')}>
              Add New Topic
            </Button>
          )}
        </Box>
      }
    >
      {!selectedSubject ? (
        <Box sx={{ p: 3, bgcolor: 'info.light', borderRadius: 1 }}>
          <Typography variant="body2" color="textSecondary">
            You need to select a subject on the left to view its topics.
          </Typography>
        </Box>
      ) : isLoading ? (
        <Typography sx={{ p: 2 }}>Loading...</Typography>
      ) : (
        <Box sx={{ p: 0 }}>
          <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              placeholder="Search topics..."
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
            />
            {hasActiveFilters && (
              <Button variant="outlined" onClick={clearFilters} sx={{ height: 'fit-content' }}>
                Clear Filters
              </Button>
            )}
          </Box>

          <Paper variant="outlined">
            <TableContainer>
              <Table sx={{ whiteSpace: 'nowrap' }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>S/N</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Topic</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedTopics.length > 0 ? (
                    paginatedTopics.map((t, index) => (
                      <TableRow key={t.id || index} hover>
                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                        <TableCell>{t.topic}</TableCell>
                        <TableCell>
                          <Chip
                            label={t.status.toUpperCase()}
                            size="small"
                            sx={{
                              bgcolor:
                                t.status === 'active'
                                  ? (theme) => theme.palette.success.light
                                  : (theme) => theme.palette.error.light,
                              color:
                                t.status === 'active'
                                  ? (theme) => theme.palette.success.main
                                  : (theme) => theme.palette.error.main,
                              borderRadius: '8px',
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton onClick={(e) => handleMenuOpen(e, t)}>
                            <MoreVertIcon />
                          </IconButton>
                          <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl) && selectedTopic?.id === t.id}
                            onClose={handleMenuClose}
                          >
                            <MenuItem onClick={() => handleActionClick('update')}>
                              Edit Topic
                            </MenuItem>
                            {/* <MenuItem onClick={() =>
                              handleActionClick(t.status === 'active' ? 'deactivate' : 'activate')
                            }>
                              {t.status === 'active' ? 'Deactivate' : 'Activate'}
                            </MenuItem> */}
                            <MenuItem onClick={() => handleActionClick('delete')}>
                              Delete Topic
                            </MenuItem>
                          </Menu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        <Box sx={{ p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                          <Typography variant="body2" color="textSecondary">
                            No topics found
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
                      colSpan={3}
                      count={filteredTopics.length}
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
      )}
    </ParentCard>
  );
};

TopicPanel.propTypes = {
  selectedSubject: PropTypes.object,
  topics: PropTypes.array,
  onAction: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default TopicPanel;
