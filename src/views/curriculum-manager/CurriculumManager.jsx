import React, { useState } from 'react';
import PageContainer from '../../components/container/PageContainer';
import Breadcrumb from '../../layouts/full/shared/breadcrumb/Breadcrumb';
import ParentCard from '../../components/shared/ParentCard';

import {
  Box,
  Typography,
  Tabs,
  Tab,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  IconButton,
  Button,
  Chip,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';

const BCrumb = [
  { to: '/', title: 'Home' },
  { title: 'School Dashboard' },
  { title: 'Curriculum Manager' },
];

const TabPanel = ({ children, value, index }) => {
  return value === index && <Box mt={2}>{children}</Box>;
};

const CurriculumManager = () => {
  const [tab, setTab] = useState(0);

  const handleTabChange = (e, newValue) => {
    setTab(newValue);
  };

  // DATA
  const [curriculumData, setCurriculumData] = useState([
    { id: 1, name: 'Old Curriculum', status: 'Inactive' },
    { id: 2, name: 'New Curriculum', status: 'Active' },
    { id: 3, name: 'Just Create Curricu', status: 'Active' },
  ]);

  const [classData, setClassData] = useState([
    { id: 1, className: 'JSS 1', curriculum: 'Old Curriculum' },
    { id: 2, className: 'JSS 2', curriculum: 'Old Curriculum' },
    { id: 3, className: 'JSS 3', curriculum: 'Old Curriculum' },
    { id: 4, className: 'SSS 1', curriculum: 'Old Curriculum' },
  ]);

  return (
    <PageContainer title="Curriculum Manager">
      <Breadcrumb title="Curriculum Manager" items={BCrumb} />

      <Box>
        {/* TABS */}
        <Box
          // sx={{
          //   bgcolor: '#fff',
          //   borderRadius: '12px',
          //   border: '1px solid #e5e7eb',
          //   overflow: 'hidden',
          //   padding: 1,
          //   marginBottom: 2,
          // }}
          sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tabs value={tab} onChange={handleTabChange}>
            <Tab label="Curriculum Setup" />
            <Tab label="Subject Bank" />
            <Tab label="Class Subject" />
          </Tabs>
        </Box>

        {/* TAB CONTENT */}
        <ParentCard>
          <TabPanel value={tab} index={0}>
            <Grid container spacing={3}>
              {/* LEFT CARD */}
              <Grid item xs={12} md={6}>
                <ParentCard
                  title={
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="h5">Curriculum</Typography>

                      <Box display="flex" gap={1}>
                        <Button variant="outlined">Import</Button>
                        <Button variant="contained">Create Curriculum</Button>
                      </Box>
                    </Box>
                  }
                >
                  <Paper variant="outlined">
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>S/N</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Curriculum Name</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                              Actions
                            </TableCell>
                          </TableRow>
                        </TableHead>

                        <TableBody>
                          {curriculumData.map((item, i) => (
                            <TableRow key={item.id} hover>
                              <TableCell>{i + 1}</TableCell>

                              <TableCell>
                                <Box
                                  sx={{
                                    px: 2,
                                    py: 0.5,
                                    bgcolor: '#f1f5f9',
                                    borderRadius: 2,
                                    display: 'inline-block',
                                  }}
                                >
                                  {item.name}
                                </Box>
                              </TableCell>

                              <TableCell>
                                <Chip
                                  label={item.status}
                                  size="small"
                                  sx={{
                                    bgcolor: item.status === 'Active' ? '#dcfce7' : '#fee2e2',
                                    color: item.status === 'Active' ? '#166534' : '#991b1b',
                                  }}
                                />
                              </TableCell>

                              <TableCell align="center">
                                <IconButton size="small">
                                  <MoreVertIcon />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </ParentCard>
              </Grid>

              {/* RIGHT CARD */}
              <Grid item xs={12} md={6}>
                <ParentCard
                  title={
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="h5">Assign to Classes</Typography>

                      <Box display="flex" gap={1}>
                        <Select size="small" defaultValue="2025/2026">
                          <MenuItem value="2025/2026">2025/2026</MenuItem>
                        </Select>

                        <Select size="small" defaultValue="First Term">
                          <MenuItem value="First Term">First Term</MenuItem>
                        </Select>

                        <Button variant="contained">Update</Button>
                      </Box>
                    </Box>
                  }
                >
                  <Paper variant="outlined">
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>S/N</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Class</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Curriculum Name</TableCell>
                          </TableRow>
                        </TableHead>

                        <TableBody>
                          {classData.map((item, i) => (
                            <TableRow key={item.id} hover>
                              <TableCell>{i + 1}</TableCell>

                              <TableCell>
                                <Box
                                  sx={{
                                    px: 2,
                                    py: 0.5,
                                    bgcolor: '#f1f5f9',
                                    borderRadius: 2,
                                    display: 'inline-block',
                                  }}
                                >
                                  {item.className}
                                </Box>
                              </TableCell>

                              <TableCell>
                                <Select
                                  size="small"
                                  value={item.curriculum}
                                  onChange={(e) => {
                                    const updated = classData.map((cls) =>
                                      cls.id === item.id
                                        ? { ...cls, curriculum: e.target.value }
                                        : cls,
                                    );
                                    setClassData(updated);
                                  }}
                                  sx={{
                                    bgcolor: '#f8fafc',
                                    borderRadius: 2,
                                    minWidth: 180,
                                  }}
                                >
                                  {curriculumData.map((cur) => (
                                    <MenuItem key={cur.id} value={cur.name}>
                                      {cur.name}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </ParentCard>
              </Grid>
            </Grid>
          </TabPanel>

          {/* OTHER TAB */}
          <TabPanel value={tab} index={1}>
            <Typography>Other content goes here...</Typography>
          </TabPanel>
        </ParentCard>
      </Box>
    </PageContainer>
  );
};

export default CurriculumManager;
