import { useState, useMemo, useEffect, useLayoutEffect, useRef } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  IconButton,
  Button,
  Menu,
  MenuItem,
  Typography,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  useTheme,
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  CloudUpload as UploadIcon,
  Download as DownloadIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import ArrowHint from '../../../components/shared/ArrowHint';
import AddTeacherModal from './AddTeacherModal';
import UploadTeacherModal from 'src/components/tenant-components/staff/UploadTeacherModal';
import {
  getAllStaff,
  createStaff,
  updateStaff,
  deleteStaff,
  downloadTeacherTemplate,
  uploadTeachers,
} from '../../../context/TenantContext/services/tenant.service';

// Hints fire in sequence: 0 = Download, 1 = Upload, 2 = Add New Teacher
const HINT_SEQUENCE = ['download', 'upload', 'add'];
const HINT_DURATION = 5000; // 5s each

const UploadTeachersTab = ({ onTeacherAdded }) => {
  const theme = useTheme();

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [isLoading, setIsLoading] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [teachersLoading, setTeachersLoading] = useState(false);
  const [error, setError] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, teacher: null });
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  // ── Sequential hint state ──────────────────────────────────────────────────
  const [activeHint, setActiveHint] = useState(null);
  const hintTimerRef = useRef(null);

  // Refs for the three toolbar buttons
  const downloadBtnRef = useRef(null);
  const uploadBtnRef   = useRef(null);
  const addBtnRef      = useRef(null);

  // The toolbar Box is the position:relative anchor
  const toolbarRef = useRef(null);

  // Measured hint positions (top/left relative to toolbar)
  const [downloadHintStyle, setDownloadHintStyle] = useState(null);
  const [uploadHintStyle,   setUploadHintStyle]   = useState(null);
  const [addHintStyle,      setAddHintStyle]      = useState(null);

  // Measure a button relative to the toolbar anchor
  const measureBelow = (btnRef, anchorRef) => {
    const btn    = btnRef.current;
    const anchor = anchorRef.current;
    if (!btn || !anchor) return null;
    const btnRect    = btn.getBoundingClientRect();
    const anchorRect = anchor.getBoundingClientRect();
    return {
      top:   btnRect.bottom - anchorRect.top + 6,
      left:  btnRect.left   - anchorRect.left,
      width: btnRect.width,
    };
  };

  // Recalculate all three positions whenever layout changes
  useLayoutEffect(() => {
    const calc = () => {
      setDownloadHintStyle(measureBelow(downloadBtnRef, toolbarRef));
      setUploadHintStyle(measureBelow(uploadBtnRef, toolbarRef));
      setAddHintStyle(measureBelow(addBtnRef, toolbarRef));
    };
    calc();
    const ro = new ResizeObserver(calc);
    if (toolbarRef.current) ro.observe(toolbarRef.current);
    return () => ro.disconnect();
  }, [teachersLoading]);

  // Start the sequence only when there are no teachers yet
  useEffect(() => {
    if (teachers.length > 0) {
      clearTimeout(hintTimerRef.current);
      setActiveHint(null);
      return;
    }

    let step = 0;
    const next = () => {
      if (step >= HINT_SEQUENCE.length) { setActiveHint(null); return; }
      setActiveHint(HINT_SEQUENCE[step]);
      step += 1;
      hintTimerRef.current = setTimeout(next, HINT_DURATION);
    };
    // Small delay so layout settles and refs are measured
    hintTimerRef.current = setTimeout(next, 800);
    return () => clearTimeout(hintTimerRef.current);
  }, [teachers.length]);

  // ── Hint renderer ──────────────────────────────────────────────────────────
  // Replaced by <ArrowHint> component — thin wrapper kept for call-site compat
  const renderHint = (key, hintStyle, label) => {
    if (activeHint !== key || !hintStyle) return null;
    return (
      <ArrowHint
        show
        label={label}
        direction="up-right"
        mode="timed"
        delay="0s"
        position={{
          position: 'absolute',
          top:      hintStyle.top,
          left:     hintStyle.left,
          width:    hintStyle.width,
          zIndex:   20,
        }}
      />
    );
  };

  // ── Data handlers (unchanged) ──────────────────────────────────────────────
  const handleDownloadTemplate = async () => {
    try {
      setIsLoading(true);
      await downloadTeacherTemplate();
      setNotification({ open: true, message: 'Template downloaded. Fill and upload to continue.', severity: 'success' });
    } catch (err) {
      setNotification({ open: true, message: err.response?.data?.message || 'Failed to download template', severity: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadTeachers = async (file) => {
    const result = await uploadTeachers(file);
    const logs = result.data?.logs || [];
    const failedCount = logs.filter((l) => l.status === 'failed').length;
    let message = result.message || 'Upload complete';
    if (failedCount > 0) message += ` (${failedCount} failed)`;
    fetchTeachers(page, rowsPerPage, searchTerm);
    onTeacherAdded?.();
    return message;
  };

  const fetchTeachers = async (pageNum = 0, perPage = 10, search = '') => {
    setTeachersLoading(true);
    setError(null);
    try {
      const response = await getAllStaff({ page: pageNum + 1, per_page: perPage, search });
      const transformedTeachers = (response.data || []).map((teacher) => ({
        id: teacher.id,
        staff_id: teacher.staff_id || teacher.user?.user_id,
        surname: teacher.user?.lname || '',
        first_name: teacher.user?.fname || '',
        phone: teacher.user?.phone || '',
        gender: teacher.user?.sex || '',
        email: teacher.user?.email || '',
        arm: teacher.classArm?.arm_name || teacher.staff_type || 'General',
        user_id: teacher.user_id,
        class_arm_id: teacher.class_arm_id,
        class_id: teacher.class_id || '',
        staff_type: teacher.staff_type || 'teaching',
      }));
      setTeachers(transformedTeachers);
      onTeacherAdded?.();
    } catch (err) {
      setError(err.message || 'Failed to fetch teachers');
    } finally {
      setTeachersLoading(false);
    }
  };

  useEffect(() => { fetchTeachers(page, rowsPerPage, searchTerm); }, []);

  const handleMenuOpen  = (event, teacher) => { setAnchorEl(event.currentTarget); setSelectedTeacher(teacher); };
  const handleMenuClose = () => { setAnchorEl(null); setSelectedTeacher(null); };
  const handleAddNewTeacher = () => { setModalMode('create'); setSelectedTeacher(null); setModalOpen(true); };

  const handleEditTeacher = (teacher) => {
    handleMenuClose();
    const initialValues = {
      id: teacher.id, staff_id: teacher.staff_id || '',
      surname: teacher.surname || '', first_name: teacher.first_name || '',
      phone_number: teacher.phone || '',
      gender: teacher.gender ? teacher.gender.charAt(0).toUpperCase() + teacher.gender.slice(1) : '',
      email: teacher.email || '', is_class_teacher: !!teacher.class_arm_id,
      class_id: teacher.class_id || '', class_arm_id: teacher.class_arm_id || '',
      staff_type: teacher.staff_type === 'non-teaching' ? 'Non-Teaching' : teacher.staff_type === 'teaching' ? 'Teaching' : teacher.staff_type,
      middle_name: teacher.user?.mname || '',
    };
    setSelectedTeacher({ ...teacher, initialValues });
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleDeleteClick   = (teacher) => { setConfirmDialog({ open: true, teacher }); };
  const handleConfirmClose  = () => { setConfirmDialog({ open: false, teacher: null }); };

  const handleDeleteTeacher = async () => {
    const teacher = confirmDialog.teacher;
    setConfirmDialog({ open: false, teacher: null });
    handleMenuClose();
    try {
      setIsLoading(true);
      await deleteStaff(teacher.id);
      setNotification({ open: true, message: 'Staff deleted successfully', severity: 'success' });
      fetchTeachers(page, rowsPerPage, searchTerm);
      onTeacherAdded?.();
    } catch (err) {
      setNotification({ open: true, message: err.response?.data?.message || 'Failed to delete teacher', severity: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTeachers = useMemo(() =>
    teachers.filter((t) =>
      t.surname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.staff_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email?.toLowerCase().includes(searchTerm.toLowerCase())
    ), [teachers, searchTerm]);

  const paginatedTeachers = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredTeachers.slice(start, start + rowsPerPage);
  }, [filteredTeachers, page, rowsPerPage]);

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    setPage(0);
    fetchTeachers(0, rowsPerPage, value);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* ── Toolbar — position:relative is the hint anchor ── */}
      <Box
        ref={toolbarRef}
        sx={{
          px: 2, pt: 2, pb: 1,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
          flexShrink: 0,
          position: 'relative', // ← hint anchor
        }}
      >
        <TextField
          placeholder="Search teachers..."
          value={searchTerm}
          onChange={handleSearch}
          size="small"
          sx={{ width: 260 }}
          InputProps={{
            startAdornment: <SearchIcon style={{ marginRight: 8, color: theme.palette.text.disabled }} />,
          }}
        />

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            ref={downloadBtnRef}
            variant="outlined"
            size="small"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadTemplate}
          >
            Download Template
          </Button>

          <Button
            ref={uploadBtnRef}
            variant="outlined"
            size="small"
            startIcon={<UploadIcon />}
            onClick={() => setUploadModalOpen(true)}
          >
            Upload
          </Button>

          <Button
            ref={addBtnRef}
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={handleAddNewTeacher}
          >
            Add New Teacher
          </Button>
        </Box>

        {/* ── Hints rendered inside the toolbar anchor ── */}
        {renderHint('download', downloadHintStyle, '📥 Download the template first')}
        {renderHint('upload',   uploadHintStyle,   '📤 Upload your filled template')}
        {renderHint('add',      addHintStyle,      '👆 Or add a teacher manually')}
      </Box>

      {/* Scrollable table (unchanged) */}
      <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
        <Table stickyHeader sx={{ tableLayout: 'fixed', width: '100%' }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ bgcolor: '#fff', width: '5%' }}>S/N</TableCell>
              <TableCell sx={{ fontWeight: 600, width: '15%', bgcolor: '#fff' }}>Staff ID</TableCell>
              <TableCell sx={{ fontWeight: 600, width: '15%', bgcolor: '#fff' }}>Surname</TableCell>
              <TableCell sx={{ fontWeight: 600, width: '20%', bgcolor: '#fff' }}>First Name</TableCell>
              <TableCell sx={{ fontWeight: 600, width: '20%', bgcolor: '#fff' }}>Phone</TableCell>
              <TableCell sx={{ fontWeight: 600, width: '15%', bgcolor: '#fff' }}>Gender</TableCell>
              <TableCell sx={{ fontWeight: 600, width: '25%', bgcolor: '#fff' }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 600, width: '15%', bgcolor: '#fff' }}>Staff Type</TableCell>
              <TableCell align="center" sx={{ bgcolor: '#fff' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {teachersLoading ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : paginatedTeachers.length > 0 ? (
              paginatedTeachers.map((teacher, index) => (
                <TableRow key={teacher.id} hover>
                  <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                  <TableCell>{teacher.staff_id}</TableCell>
                  <TableCell>{teacher.surname}</TableCell>
                  <TableCell>{teacher.first_name}</TableCell>
                  <TableCell>{teacher.phone}</TableCell>
                  <TableCell>{teacher.gender}</TableCell>
                  <TableCell sx={{ color: 'primary.main' }}>{teacher.email}</TableCell>
                  <TableCell>{teacher.arm}</TableCell>
                  <TableCell align="center">
                    <IconButton onClick={(e) => handleMenuOpen(e, teacher)}>
                      <MoreVertIcon />
                    </IconButton>
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl) && selectedTeacher?.id === teacher.id}
                      onClose={handleMenuClose}
                    >
                      <MenuItem onClick={() => handleEditTeacher(teacher)}>
                        <IconEdit size={16} style={{ marginRight: 8 }} /> Edit
                      </MenuItem>
                      <MenuItem onClick={() => handleDeleteClick(teacher)} sx={{ color: 'error.main' }}>
                        <IconTrash size={16} style={{ marginRight: 8 }} /> Delete
                      </MenuItem>
                    </Menu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} sx={{ py: 3, border: 0 }}>
                  <Alert severity="info" sx={{ borderRadius: '8px !important', justifyContent: 'center', '& .MuiAlert-message': { textAlign: 'center' } }}>
                    {error || 'No teachers added yet. Use the buttons above to add or upload teachers.'}
                  </Alert>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modals & dialogs (unchanged) */}
      <AddTeacherModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        initialValues={modalMode === 'edit' ? selectedTeacher?.initialValues : undefined}
        onSave={async (data) => {
          try {
            setIsLoading(true);
            if (modalMode === 'edit' && selectedTeacher) {
              await updateStaff(selectedTeacher.id, { first_name: data.first_name, last_name: data.surname, email: data.email, phone: data.phone_number, gender: data.gender, staff_type: data.staff_type || 'teaching', class_arm_id: data.is_class_teacher ? data.class_arm_id : null, userId: data.staff_id });
              setNotification({ open: true, message: 'Staff updated successfully', severity: 'success' });
            } else {
              await createStaff({ first_name: data.first_name, last_name: data.surname, middle_name: data.middle_name || '', email: data.email, phone: data.phone_number, gender: data.gender, staff_type: data.staff_type || 'teaching', is_class_teacher: data.is_class_teacher || false, class_arm_id: data.class_arm_id || null, userId: data.staff_id });
              setNotification({ open: true, message: 'Staff created successfully', severity: 'success' });
            }
            fetchTeachers(page, rowsPerPage, searchTerm);
            setModalOpen(false);
          } catch (err) {
            setNotification({ open: true, message: err.response?.data?.message || 'Failed to save teacher', severity: 'error' });
            throw err;
          } finally {
            setIsLoading(false);
          }
        }}
        className="General"
        isLoading={isLoading}
      />

      <UploadTeacherModal open={uploadModalOpen} onClose={() => setUploadModalOpen(false)} onUpload={handleUploadTeachers} />

      <Dialog open={confirmDialog.open} onClose={handleConfirmClose} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Teacher</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete "{confirmDialog.teacher?.surname} {confirmDialog.teacher?.first_name}"? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmClose}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteTeacher}>Yes, Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={notification.open} autoHideDuration={4000} onClose={() => setNotification({ ...notification, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={() => setNotification({ ...notification, open: false })} severity={notification.severity} variant="filled" sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UploadTeachersTab;