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
  Skeleton,
  InputAdornment,
  Alert
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { IconRefresh } from '@tabler/icons-react';
import ParentCard from '../../../../components/shared/ParentCard';

const TopicPanel = ({ selectedSubject, topics = [], onAction, isLoading = false, onFetch }) => {
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
        <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
          <Typography variant="h5" sx={{ minWidth: 0 }}>
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
            <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => onAction('create')} sx={{ ml: 'auto', flexShrink: 0, whiteSpace: 'nowrap' }}>
              Add New Topic
            </Button>
          )}
        </Box>
      }
       sx={{ px: 0, py: 0, '& .MuiCardContent-root': { px: 3,py:0 } }}

    >
      {!selectedSubject ? (
        <Box>
          <Alert severity="info" sx={{ my: 2, width: '100%', justifyContent: 'center', textAlign: 'center' }}>
            You need to select a subject on the left to view its topics.
          </Alert>
        </Box>
      ) : isLoading ? (
        <Box sx={{ p: 0 }}>
          <Box sx={{ mb: 3, display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
            <Skeleton variant="rounded" width={100} height={36} />
            <Skeleton variant="rounded" width={220} height={36} />
            <Skeleton variant="rounded" width={80} height={36} />
          </Box>
          <TableContainer>
            <Table stickyHeader sx={{ '& .MuiTableCell-root': { py: 0.5, px: 1 }, whiteSpace: 'nowrap'  }}>
              <TableHead>
                <TableRow>
                  {['S/N', 'Topic', 'Status', 'Action'].map((h) => (
                    <TableCell key={h} sx={{ fontWeight: 'bold' }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {[...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton variant="text" width={30} /></TableCell>
                    <TableCell><Skeleton variant="text" width={120} /></TableCell>
                    <TableCell><Skeleton variant="rounded" width={60} height={24} /></TableCell>
                    <TableCell><Skeleton variant="circular" width={32} height={32} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ) : (
        <Box sx={{ p: 0 }}>
          <Box sx={{ mb: 3, display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            {hasActiveFilters && (
              <Button variant="outlined" size="small" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
            <TextField
              placeholder="Search topics..."
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
              <Button variant="outlined" size="small" onClick={() => onFetch(selectedSubject?.id)} startIcon={<IconRefresh size={16} />}>
                Fetch
              </Button>
            )}
          </Box>

         <TableContainer>
              <Table stickyHeader sx={{ '& .MuiTableCell-root': { py: 0.5, px: 1 }, whiteSpace: 'nowrap'  }}>
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
                              <EditIcon fontSize="small" sx={{ mr: 1 }} />
                              Edit Topic
                            </MenuItem>
                            {/* <MenuItem onClick={() =>
                              handleActionClick(t.status === 'active' ? 'deactivate' : 'activate')
                            }>
                              {t.status === 'active' ? 'Deactivate' : 'Activate'}
                            </MenuItem> */}
                            <MenuItem onClick={() => handleActionClick('delete')} sx={{ color: 'error.main' }}>
                              <DeleteIcon fontSize="small" sx={{ mr: 1, color: 'error.main' }} />
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
