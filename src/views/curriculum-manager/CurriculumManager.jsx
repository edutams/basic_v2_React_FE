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
  Checkbox,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
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

  // Checkbox state for second tab - left section (Curriculum with Checkbox)
  const [checkedCurriculum, setCheckedCurriculum] = useState([]);
  const [selectAllCurriculum, setSelectAllCurriculum] = useState(false);

  const [program, setProgram] = useState('Junior Secondary');
  const [selectedClass, setSelectedClass] = useState(3);

  const handleTabChange = (e, newValue) => {
    setTab(newValue);
  };

  // Handle checking a single curriculum
  const handleCurriculumCheck = (id) => {
    const newChecked = checkedCurriculum.includes(id)
      ? checkedCurriculum.filter((itemId) => itemId !== id)
      : [...checkedCurriculum, id];
    setCheckedCurriculum(newChecked);
    setSelectAllCurriculum(newChecked.length === curriculumData.length);
  };

  // Handle select all curriculum
  const handleSelectAllCurriculum = () => {
    if (selectAllCurriculum) {
      setCheckedCurriculum([]);
    } else {
      setCheckedCurriculum(curriculumData.map((item) => item.id));
    }
    setSelectAllCurriculum(!selectAllCurriculum);
  };

  // DATA
  const [curriculumData] = useState([
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

  const [subjectData, setSubjectData] = useState([
    { id: 1, name: 'Mathematics', code: 'Math3023', program: 'JSS' },
    { id: 2, name: 'English Language', code: 'Eng1023', program: 'JSS' },
    { id: 3, name: 'Science', code: 'Sci2023', program: 'JSS' },
    { id: 4, name: 'English Language', code: 'Eng1023', program: 'JSS' },
    { id: 5, name: 'English Language', code: 'Eng1023', program: 'JSS' },
  ]);

  const classes = [
    { id: 1, name: 'JSS1' },
    { id: 2, name: 'JSS2' },
    { id: 3, name: 'JSS3' },
  ];

  const [subjects, setSubjects] = useState([
    { id: 1, name: 'Mathematics', passmark: 50, unit: 2, status: 'Compulsory' },
    { id: 2, name: 'English Language', passmark: 50, unit: 2, status: 'Compulsory' },
    { id: 3, name: 'Science', passmark: 50, unit: 2, status: 'Compulsory' },
    { id: 4, name: 'Biology', passmark: 50, unit: 2, status: 'Optional' },
  ]);

  const [subjectGroups, setSubjectGroups] = useState([
    { id: 1, groupName: 'Sciences', subject: 'Biology', passmark: 50, status: 'Compulsory' },
    { id: 2, groupName: 'Languages', subject: 'English', passmark: 50, status: 'Optional' },
  ]);

  return (
    <PageContainer title="Curriculum Manager">
      <Breadcrumb title="Curriculum Manager" items={BCrumb} />

      <Box>
        {/* TABS */}
        <Box sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tab} onChange={handleTabChange}>
            <Tab label="Curriculum Setup" />
            <Tab label="Subject Bank" />
            <Tab label="Class Subject" />
          </Tabs>
        </Box>

        {/* CONTENT */}
        <ParentCard>
          <TabPanel value={tab} index={0}>
            <Box
              sx={{
                display: 'flex',
                gap: 3,
                flexDirection: { xs: 'column', md: 'row' },
                width: '100%',
              }}
            >
              {/* LEFT */}
              <Box sx={{ flex: { md: 5 }, width: '100%' }}>
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
                      <Table sx={{ tableLayout: 'fixed' }}>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 'bold', width: '10%' }}>S/N</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', width: '40%' }}>
                              Curriculum Name
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>Status</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold', width: '20%' }}>
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
              </Box>

              {/* RIGHT */}
              <Box sx={{ flex: { md: 7 }, width: '100%' }}>
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
                      <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 'bold', width: '10%' }}>S/N</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>Class</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', width: '60%' }}>
                              Curriculum Name
                            </TableCell>
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
                                    width: '100%',
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
              </Box>
            </Box>
          </TabPanel>

          <TabPanel value={tab} index={1}>
            <Box
              sx={{
                display: 'flex',
                gap: 3,
                flexDirection: { xs: 'column', md: 'row' },
                width: '100%',
              }}
            >
              <Box sx={{ flex: { md: 5 }, width: '100%' }}>
                <ParentCard>
                  <TableContainer>
                    <Table sx={{ tableLayout: 'fixed' }}>
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#eef2f7' }}>
                          <TableCell sx={{ fontWeight: 'bold', width: '10%' }}>
                            <Checkbox
                              checked={selectAllCurriculum}
                              onChange={handleSelectAllCurriculum}
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'bold', width: '40%' }}>
                            Curriculum Name
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>Status</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold', width: '20%' }}>
                            Actions
                          </TableCell>
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {curriculumData.map((item, i) => (
                          <TableRow
                            key={item.id}
                            hover
                            sx={{
                              '&:hover': { bgcolor: '#f9fafb' },
                            }}
                          >
                            <TableCell>
                              <Checkbox
                                size="small"
                                checked={checkedCurriculum.includes(item.id)}
                                onChange={() => handleCurriculumCheck(item.id)}
                              />
                            </TableCell>

                            <TableCell>
                              <Box
                                sx={{
                                  px: 2,
                                  py: 0.5,
                                  bgcolor: '#f5f7fa',
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
                </ParentCard>
              </Box>
              {/* RIGHT (SUBJECT BANK)*/}
              <Box sx={{ flex: { md: 7 }, width: '100%' }}>
                <ParentCard
                  title={
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Subject Bank
                      </Typography>

                      <Button variant="contained">Add Subject</Button>
                    </Box>
                  }
                >
                  <TableContainer>
                    <Table sx={{ tableLayout: 'fixed' }}>
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#eef2f7' }}>
                          <TableCell width="10%">S/N</TableCell>
                          <TableCell width="30%">Subject</TableCell>
                          <TableCell width="25%">Subject Code</TableCell>
                          <TableCell width="20%">Program</TableCell>
                          <TableCell width="15%" />
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {subjectData.map((item, i) => (
                          <TableRow
                            key={item.id}
                            hover
                            sx={{
                              '&:hover': { bgcolor: '#f9fafb' },
                              '&:hover .actions': { opacity: 1 },
                            }}
                          >
                            <TableCell>{i + 1}</TableCell>

                            {/* SUBJECT */}
                            <TableCell>
                              <Box
                                sx={{
                                  px: 2,
                                  py: 0.5,
                                  bgcolor: '#f5f7fa',
                                  borderRadius: 2,
                                  display: 'inline-block',
                                }}
                              >
                                {item.name}
                              </Box>
                            </TableCell>

                            {/* CODE */}
                            <TableCell>
                              <Box
                                sx={{
                                  px: 2,
                                  py: 0.5,
                                  bgcolor: '#eef2f7',
                                  borderRadius: 2,
                                  fontWeight: 600,
                                  display: 'inline-block',
                                }}
                              >
                                {item.code}
                              </Box>
                            </TableCell>

                            {/* PROGRAM */}
                            <TableCell>
                              <Box
                                sx={{
                                  px: 2,
                                  py: 0.5,
                                  bgcolor: '#f5f7fa',
                                  borderRadius: 2,
                                  display: 'inline-block',
                                }}
                              >
                                {item.program}
                              </Box>
                            </TableCell>

                            {/* ACTIONS */}
                            <TableCell align="right">
                              <Box
                                className="actions"
                                sx={{
                                  opacity: 0,
                                  transition: '0.2s',
                                  display: 'flex',
                                  justifyContent: 'flex-end',
                                  gap: 1,
                                }}
                              >
                                <IconButton size="small" sx={{ color: '#3b82f6' }}>
                                  ✏️
                                </IconButton>

                                <IconButton size="small" sx={{ color: '#ef4444' }}>
                                  🗑️
                                </IconButton>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </ParentCard>
              </Box>
            </Box>
          </TabPanel>

          {/* <TabPanel value={tab} index={2}>
            <Typography>Tab 3 content goes here...</Typography>
          </TabPanel> */}
          <TabPanel value={tab} index={2}>
            <Box
              sx={{
                display: 'flex',
                gap: 3,
                flexDirection: { xs: 'column', md: 'row' },
                width: '100%',
              }}
            >
              {/* LEFT: Classes */}
              <Box sx={{ flex: { md: 4 }, width: '100%' }}>
                <ParentCard
                  title={
                    <Select
                      size="small"
                      value={program}
                      onChange={(e) => setProgram(e.target.value)}
                      fullWidth
                    >
                      <MenuItem value="Junior Secondary">Junior Secondary</MenuItem>
                      <MenuItem value="Senior Secondary">Senior Secondary</MenuItem>
                    </Select>
                  }
                >
                  <Box mt={2}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Classes
                    </Typography>

                    <RadioGroup
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(Number(e.target.value))}
                    >
                      {classes.map((cls) => (
                        <Box
                          key={cls.id}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            px: 1,
                            py: 0.8,
                            borderRadius: 2,
                            bgcolor: selectedClass === cls.id ? '#eef2ff' : 'transparent',
                          }}
                        >
                          <FormControlLabel
                            value={cls.id}
                            control={<Radio size="small" />}
                            label={cls.name}
                            sx={{ width: '100%' }}
                          />
                        </Box>
                      ))}
                    </RadioGroup>
                  </Box>
                </ParentCard>
              </Box>

              {/* RIGHT: Subjects */}
              <Box sx={{ flex: { md: 8 }, width: '100%' }}>
                <ParentCard
                  title={
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box display="flex" gap={1}>
                        <TextField size="small" placeholder="Search" />
                        <Select size="small" defaultValue="Curriculum">
                          <MenuItem value="Curriculum">Curriculum</MenuItem>
                        </Select>
                        <Select size="small" defaultValue="Term">
                          <MenuItem value="Term">Term</MenuItem>
                        </Select>
                      </Box>

                      <Button variant="contained">Add Subject to Class</Button>
                    </Box>
                  }
                >
                  <Paper variant="outlined">
                    <TableContainer>
                      <Table sx={{ tableLayout: 'fixed' }}>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 'bold', width: '5%' }}>S/N</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>Subject</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', width: '15%' }}>
                              Passmark
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'bold', width: '15%' }}>Unit</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', width: '20%' }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', width: '15%' }} align="center">
                              Action
                            </TableCell>
                          </TableRow>
                        </TableHead>

                        <TableBody>
                          {subjects.map((item, i) => (
                            <TableRow key={item.id} hover>
                              <TableCell>{i + 1}</TableCell>

                              <TableCell>{item.name}</TableCell>

                              <TableCell>
                                <TextField size="small" value={item.passmark} />
                              </TableCell>

                              <TableCell>
                                <TextField size="small" value={item.unit} />
                              </TableCell>

                              <TableCell>
                                <Chip
                                  label={item.status}
                                  size="small"
                                  sx={{
                                    bgcolor: item.status === 'Compulsory' ? '#dcfce7' : '#fef3c7',
                                    color: item.status === 'Compulsory' ? '#166534' : '#92400e',
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

                {/* SUBJECT GROUP */}
                <Box mt={3}>
                  <ParentCard
                    title={
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <TextField size="small" placeholder="Search" />
                        <Button variant="contained">Add Subject Group</Button>
                      </Box>
                    }
                  >
                    <Paper variant="outlined">
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 'bold' }}>S/N</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Group Name</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Subject</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Passmark</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                                Action
                              </TableCell>
                            </TableRow>
                          </TableHead>

                          <TableBody>
                            {subjectGroups.map((item, i) => (
                              <TableRow key={item.id} hover>
                                <TableCell>{i + 1}</TableCell>
                                <TableCell>{item.groupName}</TableCell>
                                <TableCell>{item.subject}</TableCell>
                                <TableCell>{item.passmark}</TableCell>

                                <TableCell>
                                  <Chip
                                    label={item.status}
                                    size="small"
                                    sx={{
                                      bgcolor: item.status === 'Compulsory' ? '#dcfce7' : '#fef3c7',
                                      color: item.status === 'Compulsory' ? '#166534' : '#92400e',
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
                </Box>
              </Box>
            </Box>
          </TabPanel>
        </ParentCard>
      </Box>
    </PageContainer>
  );
};

export default CurriculumManager;
