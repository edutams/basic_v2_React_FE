import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
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
  Alert,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { IconRefresh, IconListDetails, IconCircleCheck, IconCircleX } from '@tabler/icons-react';
import ParentCard from '../../../../components/shared/ParentCard';
import MiniStat from '@/components/shared/stats/MiniStat';

const TopicPanel = ({ selectedSubject, topics = [], stats, onAction, isLoading = false, onFetch }) => {
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

  const handleFetch = () => {
    onFetch?.(selectedSubject?.id, searchTerm);
  };

  // `topics` is already exactly what the backend returned for the currently
  // selected subject + search term — no client-side re-filtering here, only
  // client-side paging over that already-scoped list.
  const paginatedTopics = topics.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Reset to page 1 whenever the underlying list changes (new search results,
  // switching subject, a row added/removed) so pagination never points past
  // the end.
  useEffect(() => {
    setPage(0);
  }, [topics]);

  // Search is subject-scoped, so clear any leftover term when the selected
  // subject changes — otherwise switching subjects silently keeps filtering
  // by a search term that belonged to the previous one.
  useEffect(() => {
    setSearchTerm('');
  }, [selectedSubject?.id]);

  return (
    <ParentCard
      title={
        <Box display="flex" flexDirection="column" gap={1.5}>
          {selectedSubject && stats && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
              <MiniStat label="Total Topics" value={stats.total} loading={isLoading} icon={IconListDetails} />
              <MiniStat
                label="Active"
                value={stats.active}
                loading={isLoading}
                color="success.main"
                icon={IconCircleCheck}
              />
              <MiniStat
                label="Inactive"
                value={stats.inactive}
                loading={isLoading}
                color="error.main"
                icon={IconCircleX}
              />
            </Box>
          )}

          <Box display="flex" alignItems="center" justifyContent="space-between" gap={1} flexWrap="wrap">
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
              <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => onAction('create')} sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}>
                Add New Topic
              </Button>
            )}
          </Box>

          {selectedSubject && (
            <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
              <TextField
                placeholder="Search topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleFetch();
                }}
                size="small"
                sx={{ minWidth: 200 }}
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
                <Button variant="outlined" size="small" onClick={handleFetch} startIcon={<IconRefresh size={16} />}>
                  Fetch
                </Button>
              )}
            </Box>
          )}
        </Box>
      }
      sx={{ px: 0.5, py: 0, '& .MuiCardContent-root': { p: 0, pt: 0 } }}
    >
      {!selectedSubject ? (
        <Box>
          <Alert severity="info" sx={{ my: 2, width: '100%', justifyContent: 'center', textAlign: 'center' }}>
            You need to select a subject on the left to view its topics.
          </Alert>
        </Box>
      ) : isLoading ? (
        <Box sx={{ p: 0 }}>
          <TableContainer>
            <Table size="small" stickyHeader sx={{ '& .MuiTableCell-root': { py: 0.5, px: 1 }, whiteSpace: 'nowrap'  }}>
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
         <TableContainer>
              <Table size="small" stickyHeader sx={{ '& .MuiTableCell-root': { py: 0.5, px: 1 }, whiteSpace: 'nowrap'  }}>
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
                      <TableCell colSpan={4} align="center">
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
                      colSpan={4}
                      count={topics.length}
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
  stats: PropTypes.shape({
    total: PropTypes.number,
    active: PropTypes.number,
    inactive: PropTypes.number,
  }),
  onAction: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  onFetch: PropTypes.func,
};

export default TopicPanel;
