import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableFooter,
  TablePagination,
  TextField,
  IconButton,
  Button,
  CircularProgress,
  Link,
  Typography,
  Snackbar,
  Alert,
  useTheme,
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  CloudUpload as UploadIcon,
  Download as DownloadIcon, 
} from '@mui/icons-material';
import { IconDotsVertical } from '@tabler/icons-react';
import {
  getClassesWithDivisions,
  createLearner,
  getStudentCountByClass,
} from '../../../context/TenantContext/services/tenant.service';
import api from '../../../api/tenant_api';
import AddLearnerModal from './AddLearnerModal';
import LearnerListModal from './LearnerListModal';
import UploadLearnerModal from 'src/components/tenant-components/learners/UploadLearnerModal';

const UploadLearnersTab = ({ onSaveAndContinue, onLearnerAdded }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [hasChanges, setHasChanges] = useState(false);
  const [iconHovered, setIconHovered] = useState(null);
  const [iconClicked, setIconClicked] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [studentCounts, setStudentCounts] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [learnerListModalOpen, setLearnerListModalOpen] = useState(false);
  const [uploadClassId, setUploadClassId] = useState(null);
  const fileInputRef = useRef(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleAddNewLearner = (classItem) => {
    setSelectedClass(classItem);
    setModalOpen(true);
  };

  // const handleSaveLearner = async (data) => {
  //   try {
  //     await createLearner(data);

  //     const countsData = await getStudentCountByClass();
  //     const countsObj = {};
  //     (countsData || []).forEach((item) => {
  //       countsObj[item.class_id] = item.count;
  //     });
  //     setStudentCounts(countsObj);

  //     // Tell parent to refresh its stats — this is the Vue $emit equivalent
  //     onLearnerAdded?.();
  //   } catch (error) {
  //     console.error('Failed to save learner:', error);
  //   }
  // };
const handleSaveLearner = async (data) => {
  try {
    const response = await createLearner(data);

    if (response?.status) {
      setNotification({
        open: true,
        message: response.message,
        severity: 'success',
      });

      const countsData = await getStudentCountByClass();
      const countsObj = {};
      (countsData || []).forEach((item) => {
        countsObj[item.class_id] = item.count;
      });
      setStudentCounts(countsObj);

      onLearnerAdded?.();
    } else {
      setNotification({
        open: true,
        message: response?.message || 'Something went wrong',
        severity: 'error',
      });
    }
  } catch (error) {
    setNotification({
      open: true,
      message: error?.message || 'Failed to save learner',
      severity: 'error',
    });

    console.error(error);
  }
};
  
  const handleUploadClick = (classId) => {
    setUploadClassId(classId);
    setUploadModalOpen(true);
  };

  const handleUploadLearners = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('school_setup/learners', formData);
    if (!response.data.status) throw new Error(response.data.message || 'Upload failed');
    const countsData = await getStudentCountByClass();
    const countsObj = {};
    (countsData || []).forEach((item) => { countsObj[item.class_id] = item.count; });
    setStudentCounts(countsObj);
    onLearnerAdded?.();
    return response.data.message || 'Upload complete';
  };

  const handleDownloadTemplate = async (programmeClassId) => {
    try {
      const response = await api.get('school_setup/learner_template', {
        params: { programme_class_id: programmeClassId },
        responseType: 'blob',
      });

      // Create blob and download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `learner_upload_template_${programmeClassId}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

       setNotification({
      open: true,
      message: 'Template downloaded successfully',
      severity: 'success',
    });

    } catch (error) {
        setNotification({
      open: true,
      message: 'Failed to download template',
      severity: 'error',
    });
    }
  };

  // Fetch active classes and student counts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classesData, countsData] = await Promise.all([
          getClassesWithDivisions(),
          getStudentCountByClass(),
        ]);
        const flatClasses = [];
        (classesData || []).forEach((division) => {
          (division.programmes || []).forEach((programme) => {
            (programme.classes || []).forEach((cls) => {
              if (cls.status === 'active' && cls.pivot?.status === 'active') {
                flatClasses.push({
                  ...cls,
                  unique_key: `${programme.id}_${cls.id}`,
                  programme_id: programme.id,
                  programme_code: programme.programme_code,
                  division_name: division.division_name,
                  programme_class_id: cls.pivot?.id,
                });
              }
            });
          });
        });

        setClasses(flatClasses);

        // Transform counts array - simple mapping by class_id
        const countsObj = {};
        (countsData || []).forEach((item) => {
          countsObj[item.class_id] = item.count;
        });
        setStudentCounts(countsObj);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleViewLearners = (classItem) => {
    setSelectedClass(classItem);
    setLearnerListModalOpen(true);
  };

  const handleChange = () => {
    setHasChanges(true);
  };

  const filteredClasses = useMemo(() => {
    return classes.filter(
      (cls) =>
        cls.class_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.programme_name?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [classes, searchTerm]);

  const paginatedClasses = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredClasses.slice(start, start + rowsPerPage);
  }, [filteredClasses, page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
        <TextField
          placeholder="Search classes..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(0);
          }}
          size="small"
          sx={{ width: 300 }}
          InputProps={{
            startAdornment: <SearchIcon style={{ marginRight: 8, color: theme.palette.text.disabled }} />,
          }}
        />
      </Box>

      <TableContainer>
        <Table
          sx={{
            borderCollapse: 'separate',
            borderSpacing: '12px 10px',
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, width: '25%' }}>Classes</TableCell>

              <TableCell sx={{ fontWeight: 600, width: '15%' }}>No. Uploaded</TableCell>

              <TableCell sx={{ fontWeight: 600, width: '20%' }}>Upload Using Forms</TableCell>

              <TableCell sx={{ fontWeight: 600, width: '40%' }}>Upload Using Excel File </TableCell>
            </TableRow>
          </TableHead>

          {/* Body */}
          <TableBody>
            {paginatedClasses.map((item, index) => {
              const isHighlighted = iconHovered === index || iconClicked === index;
              const cellBg = isHighlighted
                ? isDark ? 'rgba(211,47,47,0.15)' : '#fbe4e4'
                : isDark ? 'action.hover' : '#f6f7f9';

              return (
                <TableRow key={item.unique_key || index}>
                  <TableCell
                    sx={{
                      bgcolor: cellBg,
                      borderRadius: 2,
                      p: 1,
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <IconButton
                        size="small"
                        color="error"
                        onMouseEnter={() => setIconHovered(index)}
                        onMouseLeave={() => setIconHovered(null)}
                        onClick={() => setIconClicked(iconClicked === index ? null : index)}
                      >
                        ✕
                      </IconButton>

                      <TextField
                        size="small"
                        defaultValue={`${item.programme_code} - ${item.class_code}`}
                        // defaultValue={item.class_code}
                        disabled
                        onChange={handleChange}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: 'background.paper',
                            borderRadius: '8px',
                            '& fieldset': { borderColor: 'divider' },
                            '&:hover fieldset': { borderColor: 'text.disabled' },
                            '&.Mui-focused fieldset': { borderColor: 'primary.main', borderWidth: '2px' },
                          },
                        }}
                      />
                    </Box>
                  </TableCell>

                  <TableCell
                    sx={{
                      bgcolor: cellBg,
                      borderRadius: 2,
                      p: 1,
                    }}
                    align="center"
                  >
                    <Box>
                      <Typography variant="subtitle2" align="center">
                        <Link sx={{ cursor: 'pointer' }} onClick={() => handleViewLearners(item)}>
                          {studentCounts[item.id] || 0}
                        </Link>
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell
                    sx={{
                      bgcolor: cellBg,
                      borderRadius: 2,
                      p: 1,
                    }}
                    align="center"
                  >
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => handleAddNewLearner(item)}
                    >
                      Add New Learner
                    </Button>
                  </TableCell>

                  {/* Upload Using Excel File */}
                  <TableCell
                    sx={{
                      bgcolor: cellBg,
                      borderRadius: 2,
                      p: 1,
                    }}
                    align="center"
                  >
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<DownloadIcon />}
                        onClick={() => handleDownloadTemplate(item.programme_class_id)}
                      >
                        Download Template
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<UploadIcon />}
                        onClick={() => handleUploadClick(item.id)}
                      >
                        Upload Template
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>

          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                count={filteredClasses.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>

      <UploadLearnerModal
        open={uploadModalOpen}
        onClose={() => { setUploadModalOpen(false); setUploadClassId(null); }}
        onUpload={handleUploadLearners}
      />

      <Box mt={2} display="flex" justifyContent="flex-end">
        <Button variant="contained" onClick={onSaveAndContinue} disabled={!hasChanges}>
          Save & Continue
        </Button>
      </Box>

      <AddLearnerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveLearner}
        classId={selectedClass?.id}
        className={selectedClass?.class_name}
      />

      <LearnerListModal
        open={learnerListModalOpen}
        onClose={() => setLearnerListModalOpen(false)}
        classId={selectedClass?.id}
        className={selectedClass?.class_name}
      />

      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UploadLearnersTab;
