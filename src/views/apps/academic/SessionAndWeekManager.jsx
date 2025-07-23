
import React, { useState, useEffect } from 'react';
import {
  Box,
  Tab,
  Tabs,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Button,
 
} from '@mui/material';
import { Add as AddIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';
import Breadcrumb from 'src/layouts/full/shared/breadcrumb/Breadcrumb';
import PageContainer from 'src/components/container/PageContainer';
import ParentCard from 'src/components/shared/ParentCard';


const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: 'School Structure',
  },
];

const SessionAndWeekManager = () => {
  const [tab, setTab] = useState('emis_central');
  const [classes, setClasses] = useState([]);
  const [openCreateDivision, setOpenCreateDivision] = useState(false);
  const [divisionForm, setDivisionForm] = useState({
    name: '',
    code: '',
    description: '',
    status: '',
    categories: {
      Private: false,
      Public: false,
      Unapproved: false,
      Community: false,
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Load data from localStorage on component mount
    const savedClasses = JSON.parse(localStorage.getItem('classes')) || [];
    if (savedClasses.length === 0) {
      // Initialize with some default data if localStorage is empty
    // ,
      localStorage.setItem('classes', JSON.stringify(defaultData));
      setClasses(defaultData);
    } else {
      setClasses(savedClasses);
    }
  }, []);

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const handleCreateDivisionChange = (newValue) => {
    setDivisionForm(newValue);
  };

  const handleCreateDivisionCancel = () => {
    setOpenCreateDivision(false);
    setDivisionForm({
      name: '',
      code: '',
      description: '',
      status: '',
      categories: {
        Private: false,
        Public: false,
        Unapproved: false,
        Community: false,
      },
    });
  };

  const handleCreateDivisionSubmit = (formData) => {
    setIsSubmitting(true);
    // Create a new division object with a unique id
    const newDivision = {
      id: Date.now(),
      division: formData.name, // or formData.division if you want to use a separate field
      programme: formData.programme || '',
      class: formData.code || '', // You can adjust this mapping as needed
      description: formData.description,
      status: formData.status,
      categories: formData.categories,
    };
    // Add to table (state)
    const updatedClasses = [...classes, newDivision];
    setClasses(updatedClasses);
    // Save to localStorage
    localStorage.setItem('classes', JSON.stringify(updatedClasses));
    // Reset and close modal
    setTimeout(() => {
      setIsSubmitting(false);
      setOpenCreateDivision(false);
      setDivisionForm({
        name: '',
        code: '',
        description: '',
        status: '',
        categories: {
          Private: false,
          Public: false,
          Unapproved: false,
          Community: false,
        },
      });
    }, 500);
  };

  return (
    <PageContainer title="Class and Division Manager" description="Manage classes and divisions">
      <Breadcrumb title="School Structure" items={BCrumb} />

      <Box sx={{ borderBottom: 1, borderColor: 'divider', marginBottom: 2 }}>
        <Tabs value={tab} onChange={handleTabChange} aria-label="school structure tabs">
          <Tab label="Category" value="category" />
          <Tab label="Emis Central" value="emis_central" />
        </Tabs>
      </Box>

      {tab === 'emis_central' && (
        <ParentCard
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <span>School Structure</span>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => setOpenCreateDivision(true)}
                sx={{ ml: 2 }}
              >
                Create Division
              </Button>
            </Box>
          }
        >
          <Paper variant="outlined">
            <TableContainer>
              <Table sx={{ whiteSpace: 'nowrap' }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Division</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Programme</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Class/Arms</TableCell>
                    {/* <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                      Actions
                    </TableCell> */}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {classes.map((c, index) => (
                    <TableRow key={c.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{c.division}</TableCell>
                      <TableCell>{c.programme}</TableCell>
                      <TableCell>{c.class}</TableCell>
                      {/* <TableCell align="center">
                        <IconButton>
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell> */}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </ParentCard>
      )}

      {tab === 'category' && (
        <Box sx={{ padding: 2 }}>
          <Typography variant="h6">Category Management</Typography>
          <Typography>UI for Category will be implemented here.</Typography>
        </Box>
      )}
    </PageContainer>
  );
};

export default SessionAndWeekManager;

