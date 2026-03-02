import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Menu,
  MenuItem,
  Chip,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import agentApi from '../../../api/agent';
import { AuthContext } from '../../../context/AgentContext/auth';

const SchoolsView = ({ selectedAgent }) => {
  const { user } = React.useContext(AuthContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedSchool, setSelectedSchool] = useState(null);

  const schools = selectedAgent?.schools || [
    // {
    //   id: 1,
    //   schoolName: "Greenwood Elementary",
    //   email: "admin@greenwood.edu",
    //   address: "123 Main St, City",
    //   status: "Active"
    // },
    // {
    //   id: 2,
    //   schoolName: "Riverside High School",
    //   email: "contact@riverside.edu",
    //   address: "456 Oak Ave, Town",
    //   status: "Active"
    // },
    // {
    //   id: 3,
    //   schoolName: "Sunset Academy",
    //   email: "info@sunset.edu",
    //   address: "789 Pine Rd, Village",
    //   status: "Inactive"
    // }
  ];

  const handleActionClick = (event, school) => {
    setAnchorEl(event.currentTarget);
    setSelectedSchool(school);
  };

  const handleActionClose = () => {
    setAnchorEl(null);
    setSelectedSchool(null);
  };

  const manageSubscription = () => {
    console.log('Manage subscription:', selectedSchool);
    handleActionClose();
  };

  const handleLoginAs = async () => {
    if (!selectedSchool) return;
    try {
      const response = await agentApi.impersonateTenant(selectedSchool.id);
      if (response.redirect_url) {
        window.open(response.redirect_url, '_blank');
      } else {
        alert(response.error || "Failed to impersonate tenant");
      }
    } catch (error) {
      console.error("Impersonation error:", error);
      alert("An error occurred during impersonation");
    }
    handleActionClose();
  };


  return (
    <Box>
      <Typography variant="h6" mb={3}>
        Schools managed by {selectedAgent?.organizationName || selectedAgent?.agentDetails}
      </Typography>

      {schools && schools.length > 0 ? (
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{
            width: '100%',
            overflowX: 'auto',
            '& .MuiTable-root': {
              minWidth: { xs: 300, sm: 650 }
            }
          }}
        >
          <Table aria-label="schools table">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>School Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {schools.map((school, index) => (
                <TableRow
                  key={school.id || index}
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                    '&:hover': { bgcolor: 'grey.50' }
                  }}
                >
                  <TableCell component="th" scope="row">
                    <Typography variant="body2" fontWeight="medium">
                      {school.id || index + 1}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {school.schoolName}
                    </Typography>
                    {school.address && (
                      <Typography variant="caption" color="textSecondary">
                        {school.address}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {school.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={school.status || 'Active'}
                      size="small"
                      color={school.status === 'Active' ? 'success' : 'error'}
                      variant={school.status === 'Active' ? 'filled' : 'error'}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={(e) => handleActionClick(e, school)}
                      aria-label="school actions"
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Box sx={{ backgroundColor: 'info.light', p: 2, borderRadius: 1 }}>
          <Typography variant="h6" sx={{ color: '#0B5886', fontWeight: 600 }}>
            No schools registered yet
          </Typography>
        </Box>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleActionClose}
        slotProps={{
          paper: {
            style: {
              maxHeight: 48 * 4.5,
              width: '20ch',
            },
          },
        }}
      >
        <MenuItem onClick={manageSubscription}>
          Manage Subcription
        </MenuItem>
        {user?.access_level === 1 && (
          <MenuItem onClick={handleLoginAs}>
            Login As School
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default SchoolsView;
