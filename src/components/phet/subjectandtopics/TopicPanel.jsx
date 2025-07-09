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

const TopicPanel = ({
  selectedSubject,
  topics = [],
  onAction,
  isLoading = false,
}) => {
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
    onAction(action, selectedTopic);
    handleMenuClose();
  };

  const filteredTopics = topics.filter((topic) =>
    topic.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedTopics = filteredTopics.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <ParentCard
      title={
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5">Manage Topics</Typography>
          {selectedSubject && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => onAction('create')}
            >
              Add New Topic
            </Button>
          )}
        </Box>
      }
    >
      {!selectedSubject ? (
        <Box sx={{ p: 3, bgcolor: '#e3f2fd', borderRadius: 1 }}>
          <Typography variant="body2" color="textSecondary">
            You need to select a subject on the left to view its topics.
          </Typography>
        </Box>
      ) : isLoading ? (
        <Typography sx={{ p: 2 }}>Loading...</Typography>
      ) : (
        <Box sx={{ p: 0 }}>
          <Box sx={{ mb: 3 }}>
            <TextField
              placeholder="Search topics..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
              fullWidth
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Paper variant="outlined">
            <TableContainer>
              <Table sx={{ whiteSpace: 'nowrap' }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Topic</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Subject</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedTopics.length > 0 ? (
                    paginatedTopics.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell>{t.name}</TableCell>
                        <TableCell>{selectedSubject?.name || 'N/A'}</TableCell>
                        <TableCell>
                          <Chip
                            label={t.status.toUpperCase()}
                            size="small"
                            sx={{
                              bgcolor: t.status === 'active'
                                ? (theme) => theme.palette.success.light
                                : (theme) => theme.palette.error.light,
                              color: t.status === 'active'
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
                              Edit
                            </MenuItem>
                            <MenuItem onClick={() =>
                              handleActionClick(t.status === 'active' ? 'deactivate' : 'activate')
                            }>
                              {t.status === 'active' ? 'Deactivate' : 'Activate'}
                            </MenuItem>
                            <MenuItem onClick={() => handleActionClick('delete')}>
                              Delete
                            </MenuItem>
                          </Menu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography variant="body2" color="textSecondary">
                          No topics found
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
