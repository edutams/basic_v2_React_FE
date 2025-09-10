import React, { useMemo, useState } from 'react';
import PageContainer from '../../components/container/PageContainer';
import Breadcrumb from '../../layouts/full/shared/breadcrumb/Breadcrumb';

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
  // Sample rows to demonstrate the table layout
  const [rows, setRows] = useState([
    {
      id: 1,
      week: 1,
      topic: 'Algebra',
      subtopic: 'Introduction to Algebra',
      resources: ['Textbook', 'Worksheets'],
    },
    {
      id: 2,
      week: 2,
      topic: 'Algebra',
      subtopic: 'Linear Equations',
      resources: ['Slides', 'Practice Problems'],
    },
    {
      id: 3,
      week: 3,
      topic: 'Algebra',
      subtopic: 'Quadratic Functions',
      resources: ['Video', 'Project Task'],
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [termTab, setTermTab] = useState(0);
    const [programme, setProgramme] = useState('');
  const [classLevel, setClassLevel] = useState('');
  const [subject, setSubject] = useState('');

  const filteredRows = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return rows.filter(
      (r) =>
        r.subtopic.toLowerCase().includes(term) ||
        String(r.week).toLowerCase().includes(term) ||
        (Array.isArray(r.resources)
          ? r.resources.join(',').toLowerCase().includes(term)
          : String(r.resources).toLowerCase().includes(term)),
    );
  }, [rows, searchTerm]);

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

  const handleTermTabChange = (event, newValue) => {
    setTermTab(newValue);
    setPage(0);
  };

  const handleAction = (action, row) => {
    console.log(action, row);
    if (action === 'delete') {
      setRows((prev) => prev.filter((r) => r.id !== row.id));
    }
    handleMenuClose();
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

      <Box sx={{ mb: 2 }}>
        <Tabs value={termTab} onChange={handleTermTabChange} aria-label="Term tabs" textColor="primary" indicatorColor="primary">
          <Tab label="1st Term" />
          <Tab label="2nd Term" />
          <Tab label="3rd Term" />
        </Tabs>
      </Box>

      <ParentCard
        title={
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Scheme of Work</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleAction('create')}
              sx={{ minWidth: 120, fontSize: { xs: '0.95rem', md: '1rem' } }}
            >
              Add Item
            </Button>
          </Box>
        }
      >
        <Box sx={{ p: 0 }}>
          {/* <TextField
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          /> */}

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
                            <MenuItem onClick={() => handleAction('delete', row)}>Delete</MenuItem>
                          </Menu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography>No items found</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TablePagination
                      rowsPerPageOptions={[5, 10, 25]}
                      count={filteredRows.length}
                      rowsPerPage={rowsPerPage}
                      page={page}
                      onPageChange={(_, newPage) => setPage(newPage)}
                      onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                      }}
                      colSpan={5}
                    />
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      </ParentCard>
    </PageContainer>
  );
};

export default SchemeOfWork;
