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
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableFooter,
  useTheme,
  Card,
  Button,
} from '@mui/material';
import GetAppIcon from '@mui/icons-material/GetApp';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { IconUsers, IconUser, IconSchool, IconUsersGroup } from '@tabler/icons-react';
import ReusableModal from 'src/components/shared/ReusableModal';
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
];

const LoggedInUsersModal = ({ open, onClose, onViewUserList }) => {
  const theme = useTheme();
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
    <ReusableModal
      open={open}
      onClose={onClose}
      size="extraLarge"
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
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 2, sm: 3 }} mb={3} mt={2}>
        {[
          { label: 'Teacher', count: 20, icon: IconUser, bgColor: '#E3E8F8', iconColor: '#3B5BDB' },
          {
            label: 'Student',
            count: 20,
            icon: IconSchool,
            bgColor: '#DCFCE7',
            iconColor: '#22C55E',
          },
          { label: 'SPA', count: 20, icon: IconUsers, bgColor: '#FEF3C7', iconColor: '#F59E0B' },
          {
            label: 'Parent',
            count: 20,
            icon: IconUsersGroup,
            bgColor: '#FCE7F3',
            iconColor: '#EC4899',
          },
        ].map((stat, idx) => (
          <Paper
            key={idx}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 2,
              width: { xs: '100%', sm: 320 },
              background: theme.palette.mode === 'dark' ? '#1e1e1e' : '#FFFFF',
              border: theme.palette.mode === 'dark' ? '1px solid #444' : '1px solid #E5E7EB',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: stat.bgColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <stat.icon size={22} color={stat.iconColor} />
            </Box>

            <Box>
              <Typography fontSize={26} fontWeight={700}>
                {stat.count}
              </Typography>
              <Typography fontSize={14} color="#6B7280">
                {stat.label}
              </Typography>
            </Box>
          </Paper>
        ))}
      </Stack>

      {/* Table Section */}
      <Card
        sx={{
          borderRadius: '4px',
          boxShadow: 'none',
          overflow: 'hidden',
          border: theme.palette.mode === 'dark' ? '1px solid #444' : '1px solid #e2e8f0',
          background: theme.palette.mode === 'dark' ? '#1e1e1e' : '#fff',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            bgcolor: theme.palette.mode === 'dark' ? '#1e1e1e' : 'white',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Typography
              variant="subtitle1"
              fontWeight="600"
              sx={{ color: theme.palette.mode === 'dark' ? '#fff' : '#4a5568' }}
            >
              Logged In Users This Week
            </Typography>
          </Stack>

          {/* <PrimaryButton
            startIcon={<GetAppIcon />}
            sx={{
              bgcolor: '#2ca87f',
              '&:hover': { bgcolor: '#238a68' },
              color: '#ffffff !important',
            }}
          >
            Export to Excel
          </PrimaryButton> */}

          <Button
            variant="contained"
            color="primary"
            // onClick={handleOpen}
            startIcon={<GetAppIcon size={18} />}
          >
            Export to Excel
          </Button>
        </Box>

        {/* Filter Bar */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            p: 2,
            bgcolor: theme.palette.mode === 'dark' ? '#2d2d2d' : '#F9F9F9',
            borderTop: theme.palette.mode === 'dark' ? '1px solid #444' : '1px solid #e2e8f0',
          }}
        >
          {/* Agent */}
          <Box
            sx={{
              display: 'flex',
              border: theme.palette.mode === 'dark' ? '1px solid #444' : '1px solid #ddd',
              borderRadius: '4px',
              bgcolor: theme.palette.mode === 'dark' ? '#333' : 'white',
            }}
          >
            <Select
              size="small"
              defaultValue="Agent 2"
              sx={{ minWidth: 120, color: theme.palette.mode === 'dark' ? '#fff' : '#333' }}
            >
              <MenuItem value="Agent 2">Agent 2</MenuItem>
            </Select>
          </Box>

          {/* User Type */}
          <Box
            sx={{
              display: 'flex',
              border: theme.palette.mode === 'dark' ? '1px solid #444' : '1px solid #ddd',
              borderRadius: '4px',
              bgcolor: theme.palette.mode === 'dark' ? '#333' : 'white',
            }}
          >
            <Select size="small" defaultValue="Teacher" sx={{ minWidth: 120 }}>
              <MenuItem value="Teacher">Teacher</MenuItem>
            </Select>
          </Box>

          {/* Dates */}
          <TextField size="small" type="date" />
          <TextField size="small" type="date" />

          <button
            style={{
              backgroundColor: [theme.palette.primary.main],
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              padding: '6px 12px',
              fontSize: 14,
              cursor: 'pointer',
            }}
            onClick={() => console.log('Filter applied')}
          >
            Filter
          </button>
        </Box>

        {/* DataTable */}
        <Box
          sx={{
            p: 2,
            background: theme.palette.mode === 'dark' ? '#1e1e1e' : '#fff',
          }}
        >
          <TableContainer
            sx={{
              background: theme.palette.mode === 'dark' ? '#1e1e1e' : '#fff',
            }}
          >
            <Table sx={{ whiteSpace: 'nowrap' }}>
              <TableHead sx={{ bgcolor: theme.palette.mode === 'dark' ? '#2d2d2d' : '#F9FAFB' }}>
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: theme.palette.mode === 'dark' ? '#fff' : '#374151',
                    }}
                  >
                    #
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: theme.palette.mode === 'dark' ? '#fff' : '#374151',
                    }}
                  >
                    School
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: theme.palette.mode === 'dark' ? '#fff' : '#374151',
                    }}
                  >
                    URL
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: theme.palette.mode === 'dark' ? '#fff' : '#374151',
                    }}
                  >
                    Number
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: theme.palette.mode === 'dark' ? '#fff' : '#374151',
                    }}
                  >
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(rowsPerPage > 0
                  ? loginActivitiesData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  : loginActivitiesData
                ).map((row) => (
                  <TableRow
                    key={row.id}
                    hover
                    sx={{ color: theme.palette.mode === 'dark' ? '#fff' : '#333' }}
                  >
                    <TableCell sx={{ color: theme.palette.mode === 'dark' ? '#fff' : '#333' }}>
                      {row.id}
                    </TableCell>
                    <TableCell sx={{ color: theme.palette.mode === 'dark' ? '#fff' : '#333' }}>
                      {row.school}
                    </TableCell>
                    <TableCell sx={{ color: theme.palette.mode === 'dark' ? '#fff' : '#333' }}>
                      {row.url}
                    </TableCell>
                    <TableCell sx={{ color: theme.palette.mode === 'dark' ? '#fff' : '#333' }}>
                      {row.number}
                    </TableCell>
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
      <Menu
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handleCloseMenu}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem
          onClick={() => {
            handleCloseMenu();
            onViewUserList();
          }}
        >
          View Users List
        </MenuItem>
      </Menu>
    </ReusableModal>
  );
};

export default LoggedInUsersModal;
