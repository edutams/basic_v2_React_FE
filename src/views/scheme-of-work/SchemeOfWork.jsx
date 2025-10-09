import React, { useMemo, useState } from 'react';
import PageContainer from '../../components/container/PageContainer';
import Breadcrumb from '../../layouts/full/shared/breadcrumb/Breadcrumb';
import ConfirmationDialog from '../../components/shared/ConfirmationDialog';
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
  Alert,
} from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import ParentCard from '../../components/shared/ParentCard';

const BCrumb = [
  {
    to: '/school-dashboard',
    title: 'School Dashboard',
  },
  { title: 'Scheme Of Work' },
];

const SchemeOfWork = () => {
  const [rows, setRows] = useState([]);
  const [allSchemeData] = useState([
    // First Term - JSS1 Mathematics
    {
      id: 1,
      week: 1,
      topic: 'Algebra',
      subtopic: 'Introduction to Algebra',
      resources: ['https://youtube//xuyWf5fg'],
      term: 'First',
      programme: 'Science',
      classLevel: 'JSS1',
      subject: 'Mathematics',
    },
    ...Array.from({ length: 14 }, (_, i) => ({
      id: i + 2,
      week: i + 2,
      topic: '',
      subtopic: '',
      resources: [],
      term: 'First',
      programme: 'Science',
      classLevel: 'JSS1',
      subject: 'Mathematics',
    })),

    // First Term - JSS2 English
    {
      id: 16,
      week: 1,
      topic: 'Vocabulary',
      subtopic: 'Speech and Communication',
      resources: ['https://youtube//xuyWf5fg'],
      term: 'First',
      programme: 'Science',
      classLevel: 'JSS2',
      subject: 'English',
    },
    ...Array.from({ length: 14 }, (_, i) => ({
      id: i + 17,
      week: i + 2,
      topic: '',
      subtopic: '',
      resources: [],
      term: 'First',
      programme: 'Science',
      classLevel: 'JSS2',
      subject: 'English',
    })),

    // Second Term - JSS2 Mathematics
    {
      id: 31,
      week: 1,
      topic: 'Algebra',
      subtopic: 'Linear Equations',
      resources: ['https://youtube//xuyehe5fg'],
      term: 'Second',
      programme: 'Science',
      classLevel: 'JSS2',
      subject: 'Mathematics',
    },
    ...Array.from({ length: 14 }, (_, i) => ({
      id: i + 32,
      week: i + 2,
      topic: '',
      subtopic: '',
      resources: [],
      term: 'Second',
      programme: 'Science',
      classLevel: 'JSS2',
      subject: 'Mathematics',
    })),

    // Third Term - SSS1 Mathematics
    {
      id: 46,
      week: 1,
      topic: 'Algebra',
      subtopic: 'Quadratic Functions',
      resources: ['https://youtube//tuyWf5df'],
      term: 'Third',
      programme: 'Arts',
      classLevel: 'SSS1',
      subject: 'Mathematics',
    },
    ...Array.from({ length: 14 }, (_, i) => ({
      id: i + 47,
      week: i + 2,
      topic: '',
      subtopic: '',
      resources: [],
      term: 'Third',
      programme: 'Arts',
      classLevel: 'SSS1',
      subject: 'Mathematics',
    })),
  ]);

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

  const notify = useNotification();

  const allFiltersSelected = programme !== '' && classLevel !== '' && subject !== '';

  const paginatedRows = useMemo(() => {
    const start = page * rowsPerPage;
    return rows.slice(start, start + rowsPerPage);
  }, [rows, page, rowsPerPage]);

  const handleMenuOpen = (event, row) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (action, row) => {
    if (action === 'edit') {
      setModalActionType('update');
      setSelectedRow(row);
      setModalOpen(true);
    } else if (action === 'delete') {
      setRows((prev) => prev.filter((r) => r.id !== row.id));
      notify.success('Item deleted successfully!');
    }
    handleMenuClose();
  };

  const handleItemUpdate = (updatedItem, actionType) => {
    if (actionType === 'update') {
      setRows((prev) => prev.map((row) => (row.id === updatedItem.id ? updatedItem : row)));
      notify.success('updated successfully!');
    } else if (actionType === 'create') {
      const newItem = {
        ...updatedItem,
        id: Math.max(...rows.map((r) => r.id), 0) + 1,
      };
      setRows((prev) => [...prev, newItem]);
      notify.success('Item added successfully!');
    }
  };

  const handleFetchScheme = () => {
    const fetchedData = allSchemeData.filter(
      (item) =>
        item.term === activeTerm &&
        item.programme === programme &&
        item.classLevel === classLevel &&
        item.subject === subject,
    );

    const weeksData = Array.from({ length: 15 }, (_, i) => {
      const weekNumber = i + 1;
      const existingWeek = fetchedData.find((item) => item.week === weekNumber);

      if (existingWeek) {
        return existingWeek;
      } else {
        return {
          id: `${activeTerm}-${programme}-${classLevel}-${subject}-week-${weekNumber}`,
          week: weekNumber,
          topic: '',
          subtopic: '',
          resources: [],
          term: activeTerm,
          programme: programme,
          classLevel: classLevel,
          subject: subject,
        };
      }
    });

    setRows(weeksData);
    setPage(0);

    const filledWeeks = weeksData.filter(
      (item) => item.topic || item.subtopic || item.resources.length > 0,
    ).length;

    if (filledWeeks > 0) {
      notify.success(`Loaded 15-week scheme (${filledWeeks} weeks with content)`);
    }
  };

  const handleLoadSchemeClick = () => {
    setOpenDialog(true);
  };

  const handleConfirmLoad = () => {
    notify.success('Scheme of Work loaded successfully!');
    setOpenDialog(false);
  };

  const handleCancelLoad = () => {
    setOpenDialog(false);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedRow(null);
    setModalActionType('create');
    setConfirmDialogOpen(false);
  };

  const handleConfirmAdd = () => {
    setConfirmDialogOpen(false);
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

      <Box sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeTerm}
          onChange={(e, newValue) => {
            setActiveTerm(newValue);
            setPage(0);
            setProgramme('');
            setClassLevel('');
            setSubject('');
            setRows([]);
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
            <Typography variant="h6">
              Scheme Of Work{' '}
              <Box component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>
                {activeTerm} Term
              </Box>
            </Typography>
            <Button
              variant="contained"
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

            {allFiltersSelected && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleFetchScheme}
                sx={{ height: 'fit-content' }}
              >
                Fetch Scheme of Work
              </Button>
            )}
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
                        {!allFiltersSelected && (
                          <Alert
                            severity="info"
                            sx={{
                              mb: 3,
                              justifyContent: 'center',
                              textAlign: 'center',
                              '& .MuiAlert-icon': {
                                mr: 1.5,
                              },
                            }}
                          >
                            Please select Programme, Class, and Subject, then click "Fetch Scheme of
                            Work"
                          </Alert>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TablePagination
                      rowsPerPageOptions={[5, 10, 25]}
                      count={rows.length}
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
