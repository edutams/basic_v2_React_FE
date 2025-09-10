import React, { useMemo, useState } from 'react';
import PageContainer from '../../components/container/PageContainer';
import Breadcrumb from '../../layouts/full/shared/breadcrumb/Breadcrumb';
import ConfirmationDialog from '../../components/shared/ConfirmationDialog';
import PropTypes from 'prop-types';
import { useNotification } from '../../hooks/useNotification';
import SchemeOfWorkModal from '../../components/scheme-of-work/components/SchemeOfWorkModal';

import {
  Box,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableFooter,
  TablePagination,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import ParentCard from '../../components/shared/ParentCard';

const BCrumb = [
  {
    to: '/school-dashboard',
    title: 'School Dashboard',
  },
  { title: 'Scheme Of Work' },
];

const SchemeOfWork = () => {
  const [rows, setRows] = useState([
    {
      id: 1,
      week: 1,
      topic: 'Algebra',
      subtopic: 'Introduction to Algebra',
      resources: ['https://youtube//xuyWf5fg'],
      term: 'First',
    },
    {
      id: 2,
      week: 2,
      topic: 'Algebra',
      subtopic: 'Linear Equations',
      resources: ['https://youtube//xuyehe5fg'],
      term: 'Second',
    },
    {
      id: 3,
      week: 3,
      topic: 'Algebra',
      subtopic: 'Quadratic Functions',
      resources: ['https://youtube//tuyWf5df'],
      term: 'Third',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [activeTerm, setActiveTerm] = useState('First');
  const [programme, setProgramme] = useState('');
  const [classLevel, setClassLevel] = useState('');
  const [subject, setSubject] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalActionType, setModalActionType] = useState('create');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const { notify } = useNotification();

  const filteredRows = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return rows.filter(
      (r) =>
        r.term === activeTerm &&
        (r.subtopic.toLowerCase().includes(term) ||
          String(r.week).toLowerCase().includes(term) ||
          (Array.isArray(r.resources)
            ? r.resources.join(',').toLowerCase().includes(term)
            : String(r.resources).toLowerCase().includes(term))),
    );
  }, [rows, searchTerm, activeTerm]);

  const paginatedRows = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredRows.slice(start, start + rowsPerPage);
  }, [filteredRows, page, rowsPerPage]);

  const handleMenuOpen = (event, row) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const handleAction = (action, row) => {
    if (action === 'edit') {
      setModalActionType('update');
      setSelectedRow(row);
      setModalOpen(true);
    } else if (action === 'delete') {
      setRows((prev) => prev.filter((r) => r.id !== row.id));
      notify('Item deleted successfully!', { variant: 'success' });
    }
    handleMenuClose();
  };

  const handleItemUpdate = (updatedItem, actionType) => {
    if (actionType === 'update') {
      setRows((prev) => prev.map((row) => (row.id === updatedItem.id ? updatedItem : row)));
      notify('Item updated successfully!', { variant: 'success' });
    } else if (actionType === 'create') {
      const newItem = {
        ...updatedItem,
        id: rows.length + 1, // Simple ID generation; replace with UUID in production
      };
      setRows((prev) => [...prev, newItem]);
      notify('Item added successfully!', { variant: 'success' });
    }
  };

  const handleLoadSchemeClick = () => {
    setOpenDialog(true);
  };

  const handleConfirmLoad = () => {
    console.log('Loading Scheme of Work...');
    notify('Scheme of Work loaded successfully!', { variant: 'success' });
    setOpenDialog(false);
  };

  const handleCancelLoad = () => {
    setOpenDialog(false);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedRow(null);
    setConfirmDialogOpen(false);
  };

  const handleConfirmAdd = () => {
    setConfirmDialogOpen(false);
    // Proceed with form submission logic in SchemeOfWorkModal
  };

  const renderResources = (resources) => {
    const list = Array.isArray(resources)
      ? resources
      : String(resources)
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
    return (
      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
        {list.map((res, idx) => (
          <Chip key={`${res}-${idx}`} label={res} size="small" sx={{ borderRadius: '8px' }} />
        ))}
      </Box>
    );
  };

  return (
    <PageContainer title="Scheme Of Work" description="Manage Scheme of Work">
      <Breadcrumb title="Scheme Of Work" items={BCrumb} />

      {/* Tabs for Term Selection */}
      <Box sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeTerm}
          onChange={(e, newValue) => {
            setActiveTerm(newValue);
            setPage(0);
          }}
          aria-label="term tabs"
        >
          <Tab label="First Term" value="First" />
          <Tab label="Second Term" value="Second" />
          <Tab label="Third Term" value="Third" />
        </Tabs>
      </Box>

      <ParentCard
        title={
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Scheme Of Work {activeTerm} Term</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleLoadSchemeClick}
              sx={{ minWidth: 120, fontSize: { xs: '0.95rem', md: '1rem' } }}
            >
              Load Scheme Of Work
            </Button>
          </Box>
        }
      >
        <Box sx={{ p: 0 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', mb: 2 }}>
            {/* Programme */}
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Programme</InputLabel>
              <Select
                value={programme}
                onChange={(e) => setProgramme(e.target.value)}
                label="Programme"
              >
                <MenuItem value="Science">Science</MenuItem>
                <MenuItem value="Arts">Arts</MenuItem>
                <MenuItem value="Commercial">Commercial</MenuItem>
              </Select>
            </FormControl>

            {/* Class */}
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Class</InputLabel>
              <Select
                value={classLevel}
                onChange={(e) => setClassLevel(e.target.value)}
                label="Class"
              >
                <MenuItem value="JSS1">JSS1</MenuItem>
                <MenuItem value="JSS2">JSS2</MenuItem>
                <MenuItem value="JSS3">JSS3</MenuItem>
                <MenuItem value="SSS1">SSS1</MenuItem>
                <MenuItem value="SSS2">SSS2</MenuItem>
                <MenuItem value="SSS3">SSS3</MenuItem>
              </Select>
            </FormControl>

            {/* Subject */}
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Subject</InputLabel>
              <Select value={subject} onChange={(e) => setSubject(e.target.value)} label="Subject">
                <MenuItem value="Mathematics">Mathematics</MenuItem>
                <MenuItem value="English">English</MenuItem>
                <MenuItem value="Physics">Physics</MenuItem>
                <MenuItem value="Chemistry">Chemistry</MenuItem>
                <MenuItem value="Biology">Biology</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Paper variant="outlined">
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Weeks</TableCell>
                    <TableCell>Topic</TableCell>
                    <TableCell>Subtopic</TableCell>
                    <TableCell>Resources</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedRows.length > 0 ? (
                    paginatedRows.map((row, index) => (
                      <TableRow key={row.id} hover>
                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                        <TableCell>{`Week ${row.week}`}</TableCell>
                        <TableCell>{row.topic}</TableCell>
                        <TableCell>{row.subtopic}</TableCell>
                        <TableCell>{renderResources(row.resources)}</TableCell>
                        <TableCell align="center">
                          <IconButton onClick={(e) => handleMenuOpen(e, row)}>
                            <MoreVertIcon />
                          </IconButton>
                          <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl) && selectedRow?.id === row.id}
                            onClose={handleMenuClose}
                          >
                            <MenuItem onClick={() => handleAction('edit', row)}>Edit</MenuItem>
                            {/* <MenuItem onClick={() => handleAction('delete', row)}>Delete</MenuItem> */}
                          </Menu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography>No items found</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TablePagination
                      rowsPerPageOptions={[5, 10, 25]} // Wrap the array in curly braces
                      count={filteredRows.length}
                      rowsPerPage={rowsPerPage}
                      page={page}
                      onPageChange={(_, newPage) => setPage(newPage)}
                      onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                      }}
                      colSpan={6}
                    />
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      </ParentCard>

      <ConfirmationDialog
        open={openDialog}
        onConfirm={handleConfirmLoad}
        onClose={handleCancelLoad}
        title="Confirm Load Scheme of Work"
        confirmText="Load"
        cancelText="Cancel"
      />

      <SchemeOfWorkModal
        open={modalOpen}
        onClose={handleModalClose}
        actionType={modalActionType}
        selectedItem={selectedRow}
        onItemUpdate={handleItemUpdate}
        confirmDialogOpen={confirmDialogOpen}
        onConfirmAdd={handleConfirmAdd}
        activeTerm={activeTerm}
      />
    </PageContainer>
  );
};

export default SchemeOfWork;
