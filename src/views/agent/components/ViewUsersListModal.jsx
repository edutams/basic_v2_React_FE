import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Stack,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  
 Card,Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import GetAppIcon from '@mui/icons-material/GetApp';
import GridViewIcon from '@mui/icons-material/GridView';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const ViewUsersListModal = ({ open, onClose, schoolName }) => {
  const data = [
    { id: 1, name: 'ABBA Hadiza Mohd', time: 'Tuesday, February 3rd 2026, 12:43:47 pm' },
    { id: 2, name: 'BALA Rabiu R', time: 'Monday, February 2nd 2026, 7:53:18 am' },
    { id: 3, name: 'ABBA Hadiza Mohd', time: 'Tuesday, February 3rd 2026, 12:43:47 pm' },
    { id: 4, name: 'BALA Rabiu R', time: 'Monday, February 2nd 2026, 7:53:18 am' },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '8px' } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2.5, borderBottom: '1px solid #e2e8f0', bgcolor: 'white' }}>
        <Typography variant="subtitle1" fontWeight="700" color="#4a5568">
          Logged in users today for {schoolName || 'FESTIVAL SPECIAL PRIAMRY SCHOOL'}
        </Typography>
        <IconButton onClick={onClose} sx={{ color: '#4a5568' }}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 4, bgcolor: '#f4f6f8' }}>
        <Card sx={{ p: 0, borderRadius: '4px', boxShadow: 'none', border: '1px solid #e2e8f0', bgcolor: 'white', overflow: 'hidden' }}>
           <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
              <Button 
                variant="contained" 
                startIcon={<GetAppIcon />} 
                sx={{ bgcolor: '#2ca87f', '&:hover': { bgcolor: '#238a68' }, textTransform: 'none', fontWeight: 600 }}
              >
                Export to Excel
              </Button>
           </Box>
           <TableContainer>
            <Table>
               <TableHead>
                  <TableRow sx={{ bgcolor: '#f8fafc' }}>
                    <TableCell><Typography fontWeight="700" color="#4a5568">#</Typography></TableCell>
                    <TableCell><Typography fontWeight="700" color="#4a5568">User Details</Typography></TableCell>
                    <TableCell><Typography fontWeight="700" color="#4a5568">Date/Time Logged In</Typography></TableCell>
                    <TableCell align="center"><Typography fontWeight="700" color="#4a5568">Action</Typography></TableCell>
                  </TableRow>
               </TableHead>
               <TableBody>
                  {data.map((row) => (
                    <TableRow key={row.id} sx={{ bgcolor: row.id === 4 ? '#f0fff4' : 'inherit', '&:hover': { bgcolor: '#f8fafc' } }}>
                       <TableCell sx={{ color: '#4a5568', fontWeight: 500 }}>{row.id}</TableCell>
                       <TableCell sx={{ color: '#4a5568', fontWeight: 600 }}>{row.name}</TableCell>
                       <TableCell sx={{ color: '#718096', fontWeight: 500 }}>{row.time}</TableCell>
                       <TableCell align="center">
                          <IconButton size="small" sx={{ bgcolor: row.id === 4 ? 'white' : 'transparent', color: '#444', borderRadius: '4px', border: row.id === 4 ? '1px solid #2ca87f' : 'none' }}>
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                       </TableCell>
                    </TableRow>
                  ))}
               </TableBody>
            </Table>
           </TableContainer>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default ViewUsersListModal;
