import React, { useEffect, useState } from 'react';
import {
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  TableFooter,
  TablePagination,
  useTheme,
  Select,
  MenuItem as MuiMenuItem,
  FormControl,
  InputLabel,
  Button,
} from '@mui/material';
import { useParams } from 'react-router';
import { IconSchool } from '@tabler/icons-react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import BlankCard from '../../../components/shared/BlankCard';
import ReusableModal from '../../../components/shared/ReusableModal';


const ViewSchool = () => {
  const { schoolUrl } = useParams();
  const [school, setSchool] = useState(null);
  const [subSchools, setSubSchools] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeRow, setActiveRow] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openSubscriptionModal, setOpenSubscriptionModal] = useState(false);
  const [selectedSchoolForSubscription, setSelectedSchoolForSubscription] = useState(null);
  const [subscriptionMethod, setSubscriptionMethod] = useState('Plan');
  const theme = useTheme();

  useEffect(() => {
    const schoolList = JSON.parse(localStorage.getItem('schoolList')) || [];
    const sch = schoolList.find((s) => s.schoolUrl === schoolUrl);
    setSchool({
      ...sch,
      administratorEmail: sch?.administratorEmail || 'N/A',
      moduleType: sch?.moduleType || 'N/A',
    });

    // Filter sub-schools by parentSchoolUrl
    const subSchools = schoolList.filter(
      (s) => s.parentSchoolUrl === schoolUrl
    ).map((s) => ({
      ...s,
      administratorEmail: s?.administratorEmail || 'N/A',
      moduleType: s?.moduleType || 'N/A',
    }));
    setSubSchools(subSchools);
  }, [schoolUrl]);

  const handleActionClick = (event, rowId) => {
    setAnchorEl(event.currentTarget);
    setActiveRow(rowId);
  };

  const handleActionClose = () => {
    setAnchorEl(null);
    setActiveRow(null);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenSubscriptionModal = (school) => {
    setSelectedSchoolForSubscription(school);
    setSubscriptionMethod(school.subscriptionMethod || 'Plan');
    setOpenSubscriptionModal(true);
  };

  const handleUpdateSubscriptionMethod = () => {
    // Update in local state and localStorage
    setSubSchools((prev) => prev.map(s =>
      s.id === selectedSchoolForSubscription.id ? { ...s, subscriptionMethod } : s
    ));
    // Also update main school if needed
    if (school && school.id === selectedSchoolForSubscription.id) {
      setSchool({ ...school, subscriptionMethod });
    }
    // Update in localStorage
    const schoolList = JSON.parse(localStorage.getItem('schoolList')) || [];
    const updatedList = schoolList.map(s =>
      s.id === selectedSchoolForSubscription.id ? { ...s, subscriptionMethod } : s
    );
    localStorage.setItem('schoolList', JSON.stringify(updatedList));
    setOpenSubscriptionModal(false);
  };

  // Combine main school and sub-schools for table display
  const allSchools = school ? [school, ...subSchools] : [];
  const paginatedSchools = allSchools.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (!school) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No school data available for URL: {schoolUrl}
        </Typography>
      </Box>
    );
  }

  return (
    <BlankCard>
    <Box sx={{ mb: 3, bgcolor: '#F5F7FA', p: 2, borderRadius: 1 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
         All Sub School in {school.institutionName}
      </Typography>
      <Paper elevation={3}>
        <TableContainer>
          <Box sx={{ p: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Sub School Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Subscription Plan</TableCell>
                  <TableCell>Amount Per User</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedSchools.length > 0 ? (
                  paginatedSchools.map((row, idx) => (
                    <TableRow key={row.id || idx}>
                      <TableCell>{row.institutionName}</TableCell>
                      <TableCell>{row.administratorEmail || '-'}</TableCell>
                      <TableCell>{row.moduleType || '-'}</TableCell>
                      <TableCell>{row.amountPerUser || '-'}</TableCell>
                      <TableCell>
                        <Chip label={row.status || '-'} size="small" />
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={(e) => handleActionClick(e, row.id)}>
                          <MoreVertIcon />
                        </IconButton>
                        <Menu
                          anchorEl={anchorEl}
                          open={Boolean(anchorEl) && activeRow === row.id}
                          onClose={handleActionClose}
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                          PaperProps={{ sx: { minWidth: 120, boxShadow: 3 } }}
                        >
                          <MenuItem onClick={handleActionClose}>View School Stage</MenuItem>
                          <MenuItem onClick={handleActionClose}>Manage subcription</MenuItem>
                          <MenuItem onClick={() => { handleActionClose(); handleOpenSubscriptionModal(row); }}>Update Subscription Method</MenuItem>
                        </Menu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: 'center', padding: '40px 0' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <IconSchool
                          width={48}
                          height={48}
                          color="#757575"
                          sx={{ marginBottom: '16px' }}
                        />
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 'bold', color: '#757575', marginBottom: '8px' }}
                        >
                          No related schools available
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#757575', fontSize: '14px' }}>
                          No related schools found for {school?.institutionName || schoolUrl}.
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
                    count={allSchools.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </TableRow>
              </TableFooter>
            </Table>
          </Box>
        </TableContainer>
      </Paper>
    </Box>
    <ReusableModal
      open={openSubscriptionModal}
      onClose={() => setOpenSubscriptionModal(false)}
      title={`${selectedSchoolForSubscription?.institutionName || ''}. Subscription Method`}
      size="medium"
      showDivider={true}
      showCloseButton={true}
    >
      <Box>
        <FormControl fullWidth>
          <InputLabel id="subscription-method-label">Subscription Method</InputLabel>
          <Select
            labelId="subscription-method-label"
            value={subscriptionMethod}
            label="Subscription Method"
            onChange={e => setSubscriptionMethod(e.target.value)}
            sx={{ mb: 3 }}
          >
            <MuiMenuItem value="Plan">Plan</MuiMenuItem>
            <MuiMenuItem value="Per User">Per User</MuiMenuItem>
          </Select>
        </FormControl>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
  <Button
    onClick={() => setOpenSubscriptionModal(false)}
    sx={{
      color: theme => theme.palette.primary.main, 
      '&:hover': {
        backgroundColor: 'transparent', 
        color: theme => theme.palette.primary.main, 
      },
    }}
  >
    Cancel
  </Button>
  <Button variant="contained" color="primary" onClick={handleUpdateSubscriptionMethod}>
    Update
  </Button>
</Box>
      </Box>
    </ReusableModal>
    </BlankCard>
  );
};

export default ViewSchool;