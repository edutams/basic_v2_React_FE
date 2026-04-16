import React, { useState, useMemo, useEffect } from 'react';
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
} from '@mui/material';
import { Search as SearchIcon, Add as AddIcon } from '@mui/icons-material';
import {
  getClassesWithDivisions,
  createLearner,
  getStudentCountByClass,
} from '../../../context/TenantContext/services/tenant.service';
import api from '../../../api/tenant_api';
import AddLearnerModal from './AddLearnerModal';
import LearnerListModal from './LearnerListModal';

const UploadLearnersTab = ({ onSaveAndContinue }) => {
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classesData, countsData] = await Promise.all([
          getClassesWithDivisions(),
          getStudentCountByClass(),
        ]);
        const activeClasses = (classesData || []).filter((cls) => cls.status === 'active');
        setClasses(activeClasses);
        const countsObj = {};
        (countsData || []).forEach((item) => { countsObj[item.class_id] = item.count; });
        setStudentCounts(countsObj);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddNewLearner = (classItem) => {
    setSelectedClass(classItem);
    setModalOpen(true);
  };

  const handleViewLearners = (classItem) => {
    setSelectedClass(classItem);
    setLearnerListModalOpen(true);
  };

  const handleSaveLearner = async (data) => {
    try {
      await createLearner(data);
      const countsData = await getStudentCountByClass();
      const countsObj = {};
      (countsData || []).forEach((item) => { countsObj[item.class_id] = item.count; });
      setStudentCounts(countsObj);
    } catch (error) {
      console.error('Failed to save learner:', error);
    }
  };

  const handleDownloadTemplate = async (classId) => {
    try {
      const response = await api.get('school_setup/learner_template', {
        params: { class_id: classId },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'learner_upload_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download template:', error);
    }
  };

  const handleUploadTemplate = async (classId, file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('school_setup/learners', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data.status) {
        alert(response.data.message);
        const countsData = await getStudentCountByClass();
        const countsObj = {};
        (countsData || []).forEach((item) => { countsObj[item.class_id] = item.count; });
        setStudentCounts(countsObj);
      } else {
        alert(response.data.message || 'Upload failed');
      }
    } catch (error) {
      alert('Failed to upload template');
      console.error(error);
    }
  };

  const handleUploadClick = (classId) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) handleUploadTemplate(classId, file);
    };
    input.click();
  };

  const handleChange = () => setHasChanges(true);

  const filteredClasses = useMemo(
    () => classes.filter((cls) => cls.class_name?.toLowerCase().includes(searchTerm.toLowerCase())),
    [classes, searchTerm],
  );

  const paginatedClasses = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredClasses.slice(start, start + rowsPerPage);
  }, [filteredClasses, page, rowsPerPage]);

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); };

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
          onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
          size="small"
          sx={{ width: 300 }}
          InputProps={{ startAdornment: <SearchIcon style={{ marginRight: 8, color: '#9e9e9e' }} /> }}
        />
      </Box>

      <TableContainer>
        <Table sx={{ borderCollapse: 'separate', borderSpacing: '12px 10px' }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, width: '25%' }}>Classes</TableCell>
              <TableCell sx={{ fontWeight: 600, width: '15%' }}>No. Uploaded</TableCell>
              <TableCell sx={{ fontWeight: 600, width: '20%' }}>Upload Using Forms</TableCell>
              <TableCell sx={{ fontWeight: 600, width: '40%' }}>Upload Using Excel File</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedClasses.map((item, index) => {
              const isHighlighted = iconHovered === index || iconClicked === index;
              const cellBg = isHighlighted ? '#fbe4e4' : '#f6f7f9';

              return (
                <TableRow key={index}>
                  <TableCell sx={{ bgcolor: cellBg, borderRadius: 2, p: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                        defaultValue={item.class_name}
                        onChange={handleChange}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: '#fff',
                            borderRadius: '8px',
                            '& fieldset': { borderColor: '#e5e7eb' },
                            '&:hover fieldset': { borderColor: '#cbd5e1' },
                            '&.Mui-focused fieldset': { borderColor: '#1976d2', borderWidth: '2px' },
                          },
                        }}
                      />
                    </Box>
                  </TableCell>

                  <TableCell sx={{ bgcolor: cellBg, borderRadius: 2, p: 1 }} align="center">
                    <Typography variant="subtitle2" align="center">
                      <Link sx={{ cursor: 'pointer' }} onClick={() => handleViewLearners(item)}>
                        {studentCounts[item.id] || 0}
                      </Link>
                    </Typography>
                  </TableCell>

                  <TableCell sx={{ bgcolor: cellBg, borderRadius: 2, p: 1 }} align="center">
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => handleAddNewLearner(item)}
                      sx={{ bgcolor: '#EDF3FF', color: '#000000' }}
                    >
                      Add New Learner
                    </Button>
                  </TableCell>

                  <TableCell sx={{ bgcolor: cellBg, borderRadius: 2, p: 1 }} align="center">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<span>↓</span>}
                        onClick={() => handleDownloadTemplate(item.id)}
                      >
                        Download Template
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<span>↑</span>}
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
    </Box>
  );
};

export default UploadLearnersTab;
