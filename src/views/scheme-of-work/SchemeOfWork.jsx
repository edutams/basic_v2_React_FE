import React, { useMemo, useState } from 'react';
import PageContainer from '../../components/container/PageContainer';
import Breadcrumb from '../../layouts/full/shared/breadcrumb/Breadcrumb';
import FilterSideDrawer from '../../components/shared/FilterSideDrawer';

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
  Card,
  Grid,
  Checkbox,
  Tabs,
  Tab,
} from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import {
  IconFolder,
  IconFileDescription,
  IconVideo,
  IconDownload,
  IconUpload,
  IconFilter,
  IconBook2,
  IconArrowRightSquare,
} from '@tabler/icons-react';

const BCrumb = [
  {
    to: '/',
    title: 'School Dashboard',
  },
  { title: 'Scheme Of Work' },
];

const SchemeOfWork = () => {
  const [rows, setRows] = useState([
    {
      id: 1,
      week: '1',
      topic: 'Number',
      subtopic: 'Indices',
      objective: 'Use index notation and laws',
      content: 'Powers and roots',
      video: 'Index Laws',
    },
    {
      id: 2,
      week: '2',
      topic: 'Number',
      subtopic: 'Standard Form',
      objective: 'Convert to and from standard form',
      content: 'Large and small numbers',
      video: 'Standard Form',
    },
    {
      id: 3,
      week: '3',
      topic: 'Algebra',
      subtopic: 'Factorisation',
      objective: 'Factorise expressions',
      content: 'Common factors and brackets',
      video: 'Factorising',
    },
    {
      id: 4,
      week: '4',
      topic: 'Algebra',
      subtopic: 'Quadratics',
      objective: 'Solve quadratic equations',
      content: 'Factorisation method',
      video: 'Quadratic Equations',
    },
    {
      id: 5,
      week: '5',
      topic: 'Geometry',
      subtopic: 'Pythagoras',
      objective: "Apply Pythagoras' theorem",
      content: 'Right-angled triangles',
      video: 'Pythagoras',
    },
    {
      id: 6,
      week: '6',
      topic: 'Geometry',
      subtopic: 'Trigonometry',
      objective: 'Use sin, cos, tan ratios',
      content: 'Finding sides and angles',
      video: 'Trig Ratios',
    },
    {
      id: 7,
      week: '7',
      topic: 'Statistics',
      subtopic: 'Scatter Graphs',
      objective: 'Draw and interpret scatter graphs',
      content: 'Correlation and lines of best fit',
      video: 'Scatter Graphs',
    },
    {
      id: 8,
      week: '8',
      topic: 'Statistics',
      subtopic: 'Cumulative Freq',
      objective: 'Draw cumulative frequency diagrams',
      content: 'Box plots and quartiles',
      video: 'Cumulative Frequency',
    },
    {
      id: 9,
      week: '9',
      topic: 'Measurement',
      subtopic: 'Compound Measures',
      objective: 'Calculate density and pressure',
      content: 'Compound measure formulas',
      video: 'Compound Measures',
    },
    {
      id: 10,
      week: '10',
      topic: 'Geometry',
      subtopic: 'Constructions',
      objective: 'Construct triangles and bisectors',
      content: 'Compass and ruler constructions',
      video: 'Constructions',
    },
  ]);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  const [activeTerm, setActiveTerm] = useState('First');

  // Drawer states
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});

  const paginatedRows = useMemo(() => {
    let filtered = [...rows];
    // Example of filtering logic using drawer results
    if (activeFilters.search) {
      filtered = filtered.filter(
        (r) =>
          r.topic.toLowerCase().includes(activeFilters.search.toLowerCase()) ||
          r.subtopic.toLowerCase().includes(activeFilters.search.toLowerCase()),
      );
    }

    const start = page * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [rows, page, rowsPerPage, activeFilters]);

  const handleMenuOpen = (event, row) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const statCards = [
    { title: 'Topics', value: '123', icon: <IconFolder color="#39b65a" />, bgColor: '#eaf7ee' },
    { title: 'Sub Topics', value: '16', icon: <IconFolder color="#39b65a" />, bgColor: '#eaf7ee' },
    {
      title: 'Lesson Content',
      value: '209',
      icon: <IconFileDescription color="#39b65a" />,
      bgColor: '#eaf7ee',
    },
    {
      title: 'Video Content',
      value: '36',
      icon: <IconVideo color="#39b65a" />,
      bgColor: '#eaf7ee',
    },
  ];

  const drawerFilters = [
    { key: 'search', label: 'Search Scheme of Work', type: 'text', placeholder: 'Search...' },
    {
      key: 'programme',
      label: 'Programme',
      type: 'select',
      options: [
        { value: 'Science', label: 'Science' },
        { value: 'Arts', label: 'Arts' },
        { value: 'Commercial', label: 'Commercial' },
      ],
    },
    {
      key: 'classLevel',
      label: 'Class',
      type: 'select',
      options: [
        { value: 'JSS1', label: 'JSS1' },
        { value: 'JSS2', label: 'JSS2' },
        { value: 'JSS3', label: 'JSS3' },
        { value: 'SSS1', label: 'SSS1' },
        { value: 'SSS2', label: 'SSS2' },
        { value: 'SSS3', label: 'SSS3' },
      ],
    },
    {
      key: 'subject',
      label: 'Subject',
      type: 'select',
      options: [
        { value: 'Mathematics', label: 'Mathematics' },
        { value: 'English', label: 'English' },
        { value: 'Physics', label: 'Physics' },
        { value: 'Chemistry', label: 'Chemistry' },
        { value: 'Biology', label: 'Biology' },
      ],
    },
  ];

  return (
    <PageContainer title="Scheme Of Work" description="Manage Scheme of Work">
      <Breadcrumb title="Scheme Of Work" items={BCrumb} />

      {/* Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((stat, i) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 3,
                border: '1px solid #eee',
                px: 2,
                py: 3,
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)',
              }}
            >
              <Box
                sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    bgColor: stat.bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {stat.icon}
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h2" sx={{ fontWeight: 700 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {stat.title}
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Action Buttons */}
      <Box
        sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 4 }}
      >
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="error"
            startIcon={<IconArrowRightSquare size={18} />}
            sx={{ textTransform: 'none', px: 3, borderRadius: 1.5 }}
          >
            Import scheme of Work
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<IconDownload size={18} />}
            sx={{
              textTransform: 'none',
              px: 3,
              borderRadius: 1.5,
              bgcolor: '#7cb342',
              '&:hover': { bgcolor: '#689f38' },
            }}
          >
            Download Scheme of Work
          </Button>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<IconUpload size={18} />}
            sx={{
              textTransform: 'none',
              px: 3,
              borderRadius: 1.5,
              bgcolor: '#EAEDF2',
              color: '#333',
              '&:hover': { bgcolor: '#e0e0e0' },
              boxShadow: 'none',
            }}
          >
            Upload Scheme Template
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<IconDownload size={18} />}
            sx={{
              textTransform: 'none',
              px: 3,
              borderRadius: 1.5,
              bgcolor: '#7cb342',
              '&:hover': { bgcolor: '#689f38' },
            }}
          >
            Download Scheme Template
          </Button>
        </Box>
      </Box>

      {/* Toggles & Filter Action */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
          mb: 3,
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: 'divider', flex: 1 }}>
          <Tabs
            value={activeTerm}
            onChange={(e, newValue) => setActiveTerm(newValue)}
            aria-label="term tabs"
            sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '15px' } }}
          >
            <Tab label="First Term" value="First" />
            <Tab label="Second Term" value="Second" />
            <Tab label="Third Term" value="Third" />
          </Tabs>
        </Box>
        <Button
          variant="outlined"
          startIcon={<IconFilter size={18} />}
          onClick={() => setFilterDrawerOpen(true)}
          sx={{
            textTransform: 'none',
            px: 3,
            borderRadius: 1.5,
            borderColor: '#e0e0e0',
            color: '#333',
            fontWeight: 600,
          }}
        >
          Filters
        </Button>
      </Box>

      {/* Main Content Area */}
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #eee', overflow: 'hidden' }}>
        <Box
          sx={{
            p: 2,
            borderBottom: '1px solid #f0f0f0',
            bgcolor: '#fff',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Checkbox
            defaultChecked
            size="small"
            sx={{ p: 0.5, mr: 1, color: '#1a237e', '&.Mui-checked': { color: '#1a237e' } }}
          />
          <Typography variant="subtitle2" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
            MANAGE {activeTerm.toUpperCase()} TERM SCHEME OF WORK
          </Typography>
        </Box>

        <TableContainer>
          <Table sx={{ whiteSpace: 'nowrap' }}>
            <TableHead sx={{ bgcolor: '#f4f6f8' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: '#666', borderBottom: '1px solid #eee' }}>
                  Week
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#666', borderBottom: '1px solid #eee' }}>
                  Topic
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#666', borderBottom: '1px solid #eee' }}>
                  Sub-Topic
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#666', borderBottom: '1px solid #eee' }}>
                  Learning Objective
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#666', borderBottom: '1px solid #eee' }}>
                  Learning Content
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#666', borderBottom: '1px solid #eee' }}>
                  Learning Video
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: 600, color: '#666', borderBottom: '1px solid #eee' }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedRows.length > 0 ? (
                paginatedRows.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell sx={{ fontWeight: 700, borderBottom: '1px solid #eee' }}>
                      {row.week}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid #eee' }}>
                      {row.topic}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid #eee' }}>
                      {row.subtopic}
                    </TableCell>
                    <TableCell
                      sx={{ color: '#527c95', fontWeight: 500, borderBottom: '1px solid #eee' }}
                    >
                      {row.objective}
                    </TableCell>
                    <TableCell
                      sx={{ color: '#527c95', fontWeight: 500, borderBottom: '1px solid #eee' }}
                    >
                      {row.content}
                    </TableCell>
                    <TableCell
                      sx={{ color: '#527c95', fontWeight: 500, borderBottom: '1px solid #eee' }}
                    >
                      {row.video}
                    </TableCell>
                    <TableCell align="center" sx={{ borderBottom: '1px solid #eee' }}>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, row)}
                        sx={{ bgcolor: '#f5f5f5' }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3, color: '#666' }}>
                    No records found matching your active filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box
          sx={{ display: 'flex', justifyContent: 'flex-end', p: 2, borderTop: '1px solid #eee' }}
        >
          <TablePagination
            component="div"
            count={rows.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[10, 20, 50]}
            sx={{ border: 'none' }}
          />
        </Box>
      </Card>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleMenuClose}>Edit Record</MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          Delete Record
        </MenuItem>
      </Menu>

      <FilterSideDrawer
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        onApply={(vals) => setActiveFilters(vals)}
        onReset={() => setActiveFilters({})}
        filters={drawerFilters}
        title="Scheme of Work Filters"
        anchor="right"
      />
    </PageContainer>
  );
};

export default SchemeOfWork;
