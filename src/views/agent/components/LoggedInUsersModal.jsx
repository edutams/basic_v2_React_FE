import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Grid,
  Stack,
  FormControl,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Menu,
  Card,Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import GetAppIcon from '@mui/icons-material/GetApp';
import GridViewIcon from '@mui/icons-material/GridView';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const LoggedInUsersModal = ({ open, onClose, onViewUserList }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const openMenu = Boolean(anchorEl);

  const handleClickMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const stats = [
    { label: 'Teacher', count: 20 },
    { label: 'Student', count: 20 },
    { label: 'SPA', count: 20 },
    { label: 'Parent', count: 20 },
  ];

  const data = [
    { id: 1, school: 'FESTIVAL SPECIAL PRIAMRY SCHOOL', url: 'https://fsps.sef.edutams.net', number: 30 },
    { id: 2, school: 'GIDAN MAKAMA SPECIAL PRIMARY SCHOOL', url: 'https://gmsps.sef.edutams.net', number: 10 },
    { id: 3, school: 'LAURE IBRAHIM KOKI SPECIAL PRIMARY SCHOOL', url: 'https://iksps.sef.edutams.net', number: 39 },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: '4px' } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'flex-end', p: 1, bgcolor: '#f4f6f8' }}>
        <IconButton onClick={onClose} sx={{ color: 'red' }}><CloseIcon fontSize="large" /></IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 4, bgcolor: '#f4f6f8' }}>
        {/* Top Stat Cards */}
        <Grid container spacing={2} mb={3}>
          {stats.map((stat, idx) => (
            <Grid item xs={12} sm={3} key={idx}>
              <Card sx={{ 
                p: '15px 25px', 
                borderRadius: '0', 
                boxShadow: 'none', 
                border: '1px solid #e2e8f0', 
                bgcolor: 'white',
                height: '80px',
                display: 'flex',
                alignItems: 'center'
              }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ width: '100%' }}>
                  <Typography variant="body1" fontWeight="500" sx={{ color: '#333' }}>{stat.label}</Typography>
                  <Divider orientation="vertical" flexItem sx={{ borderRightWidth: 1, borderColor: '#ddd', height: '35px', mx: 2 }} />
                  <Typography variant="h3" fontWeight="800" sx={{ color: '#2ca87f', fontSize: '28px' }}>{stat.count}</Typography>
                </Stack>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Card sx={{ p: 0, borderRadius: '4px', boxShadow: 'none', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
          {/* Header */}
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'white' }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box sx={{ border: '1px solid #cbd5e0', borderRadius: '4px', p: 0.5, display: 'flex' }}>
                <GridViewIcon sx={{ color: '#cbd5e0', fontSize: '24px' }} />
              </Box>
              <Typography variant="subtitle1" fontWeight="600" color="#4a5568">Logged In Users This Week</Typography>
            </Stack>
            <Button 
              variant="contained" 
              startIcon={<GetAppIcon />} 
              sx={{ bgcolor: '#2ca87f', '&:hover': { bgcolor: '#238a68' }, textTransform: 'none', fontWeight: 600, px: 2 }}
            >
              Export to Excel
            </Button>
          </Box>

          {/* Filter Bar */}
          <Box sx={{ display: 'flex', gap: 2, p: 2, alignItems: 'center', flexWrap: 'wrap', bgcolor: '#f2fdf5', borderTop: '1px solid #e2e8f0' }}>
            {/* Agent Filter */}
            <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '4px', bgcolor: 'white', overflow: 'hidden' }}>
              <Box sx={{ px: 2, py: 0.8, bgcolor: '#e0f7fa', borderRight: '1px solid #ddd' }}>
                 <Typography variant="body2" fontWeight="500">Agent</Typography>
              </Box>
              <Select size="small" value="Agent 2" sx={{ border: 'none', '& fieldset': { border: 'none' }, minWidth: 120 }}>
                <MenuItem value="Agent 2">Agent 2</MenuItem>
              </Select>
            </Box>

            {/* User Type Filter */}
            <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '4px', bgcolor: 'white', overflow: 'hidden' }}>
              <Box sx={{ px: 2, py: 0.8, bgcolor: '#e0f7fa', borderRight: '1px solid #ddd' }}>
                 <Typography variant="body2" fontWeight="500">User Type</Typography>
              </Box>
              <Select size="small" value="Teacher" sx={{ border: 'none', '& fieldset': { border: 'none' }, minWidth: 120 }}>
                <MenuItem value="Teacher">Teacher</MenuItem>
              </Select>
            </Box>

            {/* From Filter */}
            <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '4px', bgcolor: 'white', overflow: 'hidden' }}>
              <Box sx={{ px: 1, py: 0.8, bgcolor: '#f4f6f8', borderRight: '1px solid #ddd' }}>
                 <Typography variant="caption" sx={{ fontSize: '10px' }}>From</Typography>
              </Box>
              <TextField 
                size="small" 
                type="date" 
                defaultValue="yyyy-mm-dd"
                sx={{ '& fieldset': { border: 'none' }, '& input': { py: 0.8, fontSize: '13px' } }} 
              />
            </Box>

            {/* To Filter */}
            <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '4px', bgcolor: 'white', overflow: 'hidden' }}>
              <Box sx={{ px: 1, py: 0.8, bgcolor: '#f4f6f8', borderRight: '1px solid #ddd' }}>
                 <Typography variant="caption" sx={{ fontSize: '10px' }}>To</Typography>
              </Box>
              <TextField 
                size="small" 
                type="date" 
                defaultValue="yyyy-mm-dd"
                sx={{ '& fieldset': { border: 'none' }, '& input': { py: 0.8, fontSize: '13px' } }} 
              />
            </Box>

            <Button variant="contained" sx={{ bgcolor: '#2ca87f', '&:hover': { bgcolor: '#238a68' }, textTransform: 'none', height: '35px', px: 4, fontWeight: 700, ml: 'auto' }}>Filter</Button>
          </Box>

          <TableContainer component={Box} sx={{ bgcolor: 'white' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                  <TableCell><Typography fontWeight="700" color="#444" variant="body2">#</Typography></TableCell>
                  <TableCell><Typography fontWeight="700" color="#444" variant="body2">School</Typography></TableCell>
                  <TableCell><Typography fontWeight="700" color="#444" variant="body2">URL</Typography></TableCell>
                  <TableCell><Typography fontWeight="700" color="#444" variant="body2">Number</Typography></TableCell>
                  <TableCell><Typography fontWeight="700" color="#444" variant="body2">Action</Typography></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[
                  { id: 1, school: 'FESTIVAL SPECIAL PRIAMRY SCHOOL', url: 'https://fsps.sef.edutams.net', number: 30 },
                  { id: 2, school: 'GIDAN MAKAMA SPECIAL PRIMARY SCHOOL', url: 'https://gmsps.sef.edutams.net', number: 10 },
                  { id: 3, school: 'LAURE IBRAHIM KOKI SPECIAL PRIMARY SCHOOL', url: 'https://iksps.sef.edutams.net', number: 39 },
                  { id: 4, school: 'KABIRU KIRU MODEL PRIMARY SCHOOL', url: 'https://kkmps.sef.edutams.net', number: 13 },
                  { id: 5, school: 'KOFAR KUDU SPECIAL PRIMARY SCHOOL', url: 'https://kksps.sef.edutams.net', number: 33 },
                  { id: 6, school: 'KWALLI SPECIAL PRIMARY SCHOOL', url: 'https://ksps.sef.edutams.net', number: 32 },
                  { id: 7, school: 'Lgea Agabija', url: 'https://las.sef.edutams.net', number: 18 },
                  { id: 8, school: 'Lgea Early Child, Mairafi.', url: 'https://lecm.sef.edutams.net', number: 10 },
                  { id: 9, school: 'Lgea Agudu', url: 'https://lgag.sef.edutams.net', number: 8 },
                ].map((row) => (
                  <TableRow key={row.id} sx={{ bgcolor: row.id === 1 ? '#f2fdf5' : 'inherit', borderBottom: '1px solid #f1f1f1' }}>
                    <TableCell><Typography fontWeight="700" color="#444" variant="body2">{row.id}</Typography></TableCell>
                    <TableCell sx={{ color: row.id === 1 ? '#2ca87f' : '#333', fontWeight: row.id === 1 ? '700' : '500' }}>
                      <Typography variant="body2" fontWeight="inherit">{row.school}</Typography>
                    </TableCell>
                    <TableCell><Typography sx={{ color: '#2ca87f', fontSize: '13px', fontWeight: 500 }}>{row.url}</Typography></TableCell>
                    <TableCell><Typography variant="body2" color="#333">{row.number}</Typography></TableCell>
                    <TableCell>
                      <IconButton 
                        onClick={handleClickMenu} 
                        size="small"
                        sx={{ bgcolor: row.id === 1 ? 'white' : 'transparent', color: '#444', borderRadius: '4px', border: row.id === 1 ? '1px solid #2ca87f' : 'none' }}
                      >
                         <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        <Menu anchorEl={anchorEl} open={openMenu} onClose={handleCloseMenu}>
          <MenuItem onClick={() => { handleCloseMenu(); onViewUserList(); }}>View Users List</MenuItem>
        </Menu>
      </DialogContent>
    </Dialog>
  );
};

export default LoggedInUsersModal;
