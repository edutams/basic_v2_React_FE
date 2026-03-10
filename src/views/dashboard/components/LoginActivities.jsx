import React, { useState } from 'react';
import {
  IconButton,
  Typography,
  Box,
  Grid,
  Stack,
  Select,
  MenuItem,
  TextField,
  Menu,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableFooter,
} from '@mui/material';
import GetAppIcon from '@mui/icons-material/GetApp';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { IconUsers } from '@tabler/icons-react';
import StandardModal from 'src/components/shared/StandardModal';
import PrimaryButton from 'src/components/shared/PrimaryButton';

const loginActivitiesData = [
  {
    id: 1,
    school: 'FESTIVAL SPECIAL PRIAMRY SCHOOL',
    url: 'https://fsps.sef.edutams.net',
    number: 30,
  },
  {
    id: 2,
    school: 'GIDAN MAKAMA SPECIAL PRIMARY SCHOOL',
    url: 'https://gmsps.sef.edutams.net',
    number: 10,
  },
  {
    id: 3,
    school: 'LAURE IBRAHIM KOKI SPECIAL PRIMARY SCHOOL',
    url: 'https://iksps.sef.edutams.net',
    number: 39,
  },
  {
    id: 4,
    school: 'KABIRU KIRU MODEL PRIMARY SCHOOL',
    url: 'https://kkmps.sef.edutams.net',
    number: 13,
  },
  {
    id: 5,
    school: 'KOFAR KUDU SPECIAL PRIMARY SCHOOL',
    url: 'https://kksps.sef.edutams.net',
    number: 33,
  },
  {
    id: 6,
    school: 'KWALLI SPECIAL PRIMARY SCHOOL',
    url: 'https://ksps.sef.edutams.net',
    number: 32,
  },
  {
    id: 7,
    school: 'Lgea Agabija',
    url: 'https://las.sef.edutams.net',
    number: 18,
  },
  {
    id: 8,
    school: 'Lgea Early Child, Mairafi.',
    url: 'https://lecm.sef.edutams.net',
    number: 10,
  },
  {
    id: 9,
    school: 'Lgea Agudu',
    url: 'https://lgag.sef.edutams.net',
    number: 8,
  },
];

const LoggedInUsersModal = ({ open, onClose, onViewUserList }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const openMenu = Boolean(anchorEl);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleClickMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <StandardModal
      open={open}
      onClose={onClose}
      maxWidth="lg"
      padding={4}
      headerBg="#f4f6f8"
      dividers={false}
      title={
        <Typography fontSize={24} fontWeight={700}>
          Logged In Users
        </Typography>
      }
    >
      {/* Top Stat Cards */}
      <Grid container spacing={2} mb={3} mt={2}>
        {[
          { label: 'Teacher', count: 20 },
          { label: 'Student', count: 20 },
          { label: 'SPA', count: 20 },
          { label: 'Parent', count: 20 },
        ].map((stat, idx) => (
          //   <Grid item xs={12} sm={6} md={3} key={idx}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
            <Card
              sx={{
                px: 4,
                py: 3,
                borderRadius: '6px',
                boxShadow: 'none',
                border: '1px solid #E5E7EB',
                bgcolor: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                height: '95px',
                width: '100%',
              }}
            >
              {/* Left Label */}
              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    fontSize: '18px',
                    fontWeight: 300,
                    color: '#240606',
                  }}
                >
                  {stat.label}
                </Typography>
              </Box>

              {/* Divider */}
              <Box
                sx={{
                  height: '40px',
                  width: '1px',
                  bgcolor: '#D1D5DB',
                  mx: 2,
                }}
              />

              {/* Number */}
              <Box sx={{ width: 60, textAlign: 'right' }}>
                <Typography
                  sx={{
                    fontSize: '25px',
                    fontWeight: 700,
                    color: '#2F8F46',
                  }}
                >
                  {stat.count}
                </Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Table Section */}
      <Card
        sx={{
          borderRadius: '4px',
          boxShadow: 'none',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            bgcolor: 'white',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Typography variant="subtitle1" fontWeight="600" color="#4a5568">
              Logged In Users This Week
            </Typography>
          </Stack>

          <PrimaryButton
            startIcon={<GetAppIcon />}
            sx={{
              bgcolor: '#2ca87f',
              '&:hover': { bgcolor: '#238a68' },
            }}
          >
            Export to Excel
          </PrimaryButton>
        </Box>

        {/* Filter Bar */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            p: 2,
            bgcolor: '#f2fdf5',
            borderTop: '1px solid #e2e8f0',
          }}
        >
          {/* Agent */}
          <Box
            sx={{
              display: 'flex',
              border: '1px solid #ddd',
              borderRadius: '4px',
              bgcolor: 'white',
            }}
          >
            <Box sx={{ px: 2, py: 0.8, bgcolor: '#e0f7fa', borderRight: '1px solid #ddd' }}>
              <Typography variant="body2">Agent</Typography>
            </Box>

            <Select size="small" defaultValue="Agent 2" sx={{ minWidth: 120 }}>
              <MenuItem value="Agent 2">Agent 2</MenuItem>
            </Select>
          </Box>

          {/* User Type */}
          <Box
            sx={{
              display: 'flex',
              border: '1px solid #ddd',
              borderRadius: '4px',
              bgcolor: 'white',
            }}
          >
            <Box sx={{ px: 2, py: 0.8, bgcolor: '#e0f7fa', borderRight: '1px solid #ddd' }}>
              <Typography variant="body2">User Type</Typography>
            </Box>

            <Select size="small" defaultValue="Teacher" sx={{ minWidth: 120 }}>
              <MenuItem value="Teacher">Teacher</MenuItem>
            </Select>
          </Box>

          {/* Dates */}
          <TextField size="small" type="date" />
          <TextField size="small" type="date" />

          <PrimaryButton sx={{ bgcolor: '#2ca87f', '&:hover': { bgcolor: '#238a68' } }}>
            Filter
          </PrimaryButton>
        </Box>

        {/* DataTable */}
        <Box sx={{ p: 2 }}>
          <TableContainer>
            <Table sx={{ whiteSpace: 'nowrap' }}>
              <TableHead sx={{ bgcolor: '#F9FAFB' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: '#374151' }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#374151' }}>School</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#374151' }}>URL</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Number</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(rowsPerPage > 0
                  ? loginActivitiesData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  : loginActivitiesData
                ).map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.id}</TableCell>
                    <TableCell>{row.school}</TableCell>
                    <TableCell>{row.url}</TableCell>
                    <TableCell>{row.number}</TableCell>
                    <TableCell>
                      <IconButton onClick={handleClickMenu}>
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    count={loginActivitiesData.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
        </Box>
      </Card>

      {/* Menu */}
      <Menu anchorEl={anchorEl} open={openMenu} onClose={handleCloseMenu}>
        <MenuItem
          onClick={() => {
            handleCloseMenu();
            onViewUserList();
          }}
        >
          View Users List
        </MenuItem>
      </Menu>
    </StandardModal>
  );
};

export default LoggedInUsersModal;
