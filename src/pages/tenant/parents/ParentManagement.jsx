import React, { useState, useEffect, useCallback, useContext } from 'react';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import ParentCard from '@/components/shared/ParentCard';
import { useNotification } from '@/hooks/useNotification';

import {
  Box,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableFooter,
  TablePagination,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  FormControl,
  InputLabel,
  Select,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Icon,
} from '@mui/material';

import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  CloudUpload as UploadIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import {
  IconUsers,
  IconUserCheck,
  IconUserHeart,
  IconUser,
  IconEdit,
  IconLink,
  IconSquareToggle,
  IconTrash,
} from '@tabler/icons-react';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import PeopleIcon from '@mui/icons-material/People';
import LinkIcon from '@mui/icons-material/Link';

import guardianApi from '@/api/tenant/guardians/parentApi';
import { getClassesWithDivisions } from '@/api/tenant/set-up/tenant-setup';
import ParentModal from '@/components/tenant/parents/ParentModal';
import UploadParentModal from '@/components/tenant/parents/UploadParentModal';
import LinkWardModal from '@/components/tenant/parents/LinkWardModal';
import ViewWardsModal from '@/components/tenant/parents/ViewWardsModal';
import StatCard from 'src/components/shared/StatCard';
import { useNavigate } from 'react-router-dom';
import { TenantAuthContext } from '../../../context/TenantContext/auth';

const BCrumb = [{ to: '/school-dashboard', title: 'Home' }, { title: 'Parent Management' }];

const ParentManagement = () => {
  const notify = useNotification();

  const navigate = useNavigate();

  const { impersonateParent } = useContext(TenantAuthContext);

  const [impersonateGuardianConfirmOpen, setImpersonateGuardianConfirmOpen] = useState(false);
  const [guardianToImpersonate, setGuardianToImpersonate] = useState(null);

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [classId, setClassId] = useState('');

  const [classes, setClasses] = useState([]);

  const [stats, setStats] = useState({ total: 0, active: 0, linked: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  const [parentModalOpen, setParentModalOpen] = useState(false);
  const [parentModalAction, setParentModalAction] = useState('create');

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [parentToDelete, setParentToDelete] = useState(null);

  const [toggleStatusModalOpen, setToggleStatusModalOpen] = useState(false);
  const [parentToToggle, setParentToToggle] = useState(null);

  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const [linkWardModalOpen, setLinkWardModalOpen] = useState(false);
  const [wardParent, setWardParent] = useState(null);

  // view wards modal (read-only)
  const [viewWardsModalOpen, setViewWardsModalOpen] = useState(false);
  const [viewWardsGuardian, setViewWardsGuardian] = useState(null);

  const fetchParents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await guardianApi.getAll({
        page: page + 1,
        per_page: rowsPerPage,
        search,
        ...(classId && { class_id: classId }),
      });
      setRows(res?.data?.data ?? []);
      setTotal(res?.data?.total ?? 0);
    } catch {
      notify.error('Failed to fetch parents');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, classId]);

  const confirmImpersonateGuardian = (row) => {
    setGuardianToImpersonate(row);
    setImpersonateGuardianConfirmOpen(true);
    handleMenuClose();
  };

  const handleConfirmedImpersonateGuardian = async () => {
    if (!guardianToImpersonate) return;

    // Guardian PK is row.user_id (UUID string)
    const result = await impersonateParent(guardianToImpersonate?.user?.id);
    if (result.success) {
      notify.success(
        `Now logged in as ${guardianToImpersonate.user?.fname} ${guardianToImpersonate.user?.lname}`,
      );
      navigate('/dashboard');
    } else {
      notify.error(result.error);
    }
    setImpersonateGuardianConfirmOpen(false);
    setGuardianToImpersonate(null);
  };

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const res = await guardianApi.getStats();
      setStats(res?.data?.data ?? { total: 0, active: 0, linked: 0 });
    } catch {
      notify.error('Failed to fetch stats');
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchClasses = useCallback(async () => {
    try {
      const data = await getClassesWithDivisions();
      const flat = [];
      (data || []).forEach((division) => {
        (division.programmes || []).forEach((programme) => {
          (programme.classes || []).forEach((cls) => {
            flat.push({
              id: cls.id,
              label: `${programme.programme_code} - ${cls.class_code}`,
            });
          });
        });
      });
      setClasses(flat);
    } catch {
      notify.error('Failed to fetch classes');
    }
  }, []);

  useEffect(() => {
    fetchParents();
  }, [fetchParents]);
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);
  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const handleMenuOpen = (event, row) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => setAnchorEl(null);

  const handleOpenAdd = () => {
    setSelectedRow(null);
    setParentModalAction('create');
    setParentModalOpen(true);
  };

  const handleOpenEdit = (row) => {
    setSelectedRow(row);
    setParentModalAction('update');
    setParentModalOpen(true);
    handleMenuClose();
  };

  const handleOpenDelete = (row) => {
    setParentToDelete(row);
    setDeleteModalOpen(true);
    handleMenuClose();
  };

  const handleOpenLinkWard = (row) => {
    setWardParent(row);
    setLinkWardModalOpen(true);
    handleMenuClose();
  };

  const handleToggleStatus = (row) => {
    handleMenuClose();
    setParentToToggle(row);
    setToggleStatusModalOpen(true);
  };

  const handleConfirmToggle = async () => {
    try {
      await guardianApi.toggleStatus(parentToToggle.user_id);
      notify.success(
        `Parent ${parentToToggle.status === 'active' ? 'deactivated' : 'activated'} successfully`,
      );
      setToggleStatusModalOpen(false);
      setParentToToggle(null);
      fetchParents();
      fetchStats();
    } catch {
      notify.error('Failed to update parent status');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await guardianApi.remove(parentToDelete.user_id);
      notify.success('Parent deleted successfully');
      setDeleteModalOpen(false);
      setParentToDelete(null);
      fetchParents();
      fetchStats();
    } catch {
      notify.error('Failed to delete parent');
    }
  };

  const handleParentUpdate = () => {
    fetchParents();
    fetchStats();
  };

  const handleDownloadTemplate = async () => {
    try {
      const res = await guardianApi.downloadTemplate();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'parent_upload_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      notify.success('Template downloaded');
    } catch {
      notify.error('Failed to download template');
    }
  };

  const handleUploadTemplate = async (file) => {
    const res = await guardianApi.uploadTemplate(file);
    const message = res?.data?.message || 'Upload complete';
    fetchParents();
    fetchStats();
    return message;
  };

  const hasFilters = search !== '' || classId !== '';

  const resetFilters = () => {
    setSearch('');
    setClassId('');
    setPage(0);
  };

  const relationshipLabel = (rel) => {
    if (!rel) return '—';
    return rel.charAt(0).toUpperCase() + rel.slice(1);
  };

  const statusColor = (status) => (status === 'active' ? 'success' : 'default');

  return (
    <PageContainer title="Parent Management" description="Manage parents and guardians">
      <Breadcrumb title="Parent Management" items={BCrumb} />

      {/* ── Stat Cards ── */}
      <Box sx={{ mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <StatCard
            count={stats.total}
            label="Total Parents"
            icon={FamilyRestroomIcon}
            color="primary"
            loading={statsLoading}
          />
          <StatCard
            count={stats.active}
            label="Active Parents"
            icon={PeopleIcon}
            color="primary"
            loading={statsLoading}
          />
          <StatCard
            count={stats.linked}
            label="Guardians Linked"
            icon={LinkIcon}
            color="primary"
            loading={statsLoading}
          />
        </Stack>
      </Box>

      <ParentCard
        title={
          <Box
            sx={{
              display: 'flex',
              alignItems: { xs: 'flex-start', md: 'center' },
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Typography variant="h5">Parents & Guardians</Typography>

            <Box
              sx={{
                display: 'flex',
                gap: 1,
                flexWrap: 'wrap',
                width: { xs: '100%', md: 'auto' },
              }}
            >
              <Button variant="contained" size="small" sx={{ width: { xs: '100%', sm: 'auto' } }} color="primary" fullWidth={false} onClick={handleOpenAdd}>
                Add Single Parent
              </Button>
              <Button variant="contained" size="small" startIcon={<DownloadIcon />}
                onClick={handleDownloadTemplate}
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              >
                Download Template
              </Button>

              <Button variant="contained" size="small" startIcon={<UploadIcon />}
                onClick={() => setUploadModalOpen(true)}
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              >
                Upload Template
              </Button>
            </Box>
          </Box>
        }
      >
        {/* ── filters ── */}
        <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search by name, email or phone"
            value={search}
            size="small"
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              width: {
                xs: "100%",
                sm: 300,
                md: 350,
              },
            }}

          />

          {hasFilters && (
            <Button variant="contained" size="small" onClick={resetFilters} sx={{ width: { xs: '100%', sm: 'auto' } }}>
              Clear Filters
            </Button>
          )}
        </Box>

        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>S/N</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell align="center">Wards</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : rows.length > 0 ? (
                  rows.map((row, index) => (
                    <TableRow key={row.user_id}>
                      <TableCell>{page * rowsPerPage + index + 1}</TableCell>

                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {row.user
                            ? `${row.title ? row.title + ' ' : ''}${row.user.fname} ${row.user.lname}`
                            : '—'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {relationshipLabel(row.relationship)}
                        </Typography>
                      </TableCell>

                      <TableCell align="center" sx={{ verticalAlign: 'middle' }}>
                        <Box
                          sx={{
                            bgcolor: '#F0F9FF',
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Typography variant="subtitle2">
                            <Link
                              sx={{ cursor: 'pointer' }}
                              onClick={() => {
                                setViewWardsGuardian(row);
                                setViewWardsModalOpen(true);
                              }}
                            >
                              {row.wards_count ?? 0}
                            </Link>
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">{row.user?.phone || '—'}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {row.user?.email || '—'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={row.status ?? 'active'}
                          color={statusColor(row.status)}
                          size="small"
                          sx={{
                            bgcolor:
                              row.status?.toLowerCase() === 'active'
                                ? (theme) => theme.palette.success.light
                                : (theme) => theme.palette.error.light,
                            color:
                              row.status?.toLowerCase() === 'active'
                                ? (theme) => theme.palette.success.main
                                : (theme) => theme.palette.error.main,
                            borderRadius: '8px',
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>

                      <TableCell align="center">
                        <IconButton onClick={(e) => handleMenuOpen(e, row)}>
                          <MoreVertIcon />
                        </IconButton>

                        <Menu
                          anchorEl={anchorEl}
                          open={Boolean(anchorEl) && selectedRow?.user_id === row.user_id}
                          onClose={handleMenuClose}
                        >
                          <MenuItem onClick={() => confirmImpersonateGuardian(row)}>
                            <IconUser size={18} style={{ marginRight: 8 }} />
                            Login As Parent
                          </MenuItem>
                          <MenuItem onClick={() => handleOpenEdit(row)}>
                            <IconEdit size={18} style={{ marginRight: 8 }} />
                            Edit
                          </MenuItem>
                          <MenuItem onClick={() => handleOpenLinkWard(row)}>
                            <IconLink size={18} style={{ marginRight: 8 }} />
                            Link Ward
                          </MenuItem>
                          <MenuItem onClick={() => handleToggleStatus(row)}>
                            <IconSquareToggle size={18} style={{ marginRight: 8 }} />
                            {row.status === 'active' ? 'Deactivate' : 'Activate'}
                          </MenuItem>
                          <MenuItem
                            onClick={() => handleOpenDelete(row)}
                            sx={{ color: 'error.main' }}
                          >
                            <IconTrash size={18} style={{ marginRight: 8 }} />
                            Delete
                          </MenuItem>
                        </Menu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Alert
                        severity="info"
                        sx={{
                          mb: 3,
                          justifyContent: 'center',
                          textAlign: 'center',
                          '& .MuiAlert-icon': { mr: 1.5 },
                        }}
                      >
                        {hasFilters
                          ? 'No parents match the current search.'
                          : 'No parents found. Add a parent to get started.'}
                      </Alert>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>

              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50, 100]}
                    count={total}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => {
                      setRowsPerPage(parseInt(e.target.value, 10));
                      setPage(0);
                    }}
                  />
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
        </Paper>
      </ParentCard>

      <ParentModal
        open={parentModalOpen}
        onClose={() => setParentModalOpen(false)}
        actionType={parentModalAction}
        selectedParent={selectedRow}
        onParentUpdate={handleParentUpdate}
      />

      {/* <DeleteParentModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        parent={parentToDelete}
        onConfirm={handleConfirmDelete}
      /> */}

      {/* Confirm Delete — inline like ClassStructureTable */}
      <Dialog
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Parent</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete{' '}
            <strong>
              {parentToDelete?.user
                ? `${parentToDelete.user.fname} ${parentToDelete.user.lname}`
                : 'this parent'}
            </strong>
            ? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" size="small" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
          <Button size="small" color="error" onClick={handleConfirmDelete} autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Status Change*/}
      <Dialog open={toggleStatusModalOpen} onClose={() => setToggleStatusModalOpen(false)}>
        <DialogTitle>Confirm Status Change</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to{' '}
            <strong>{parentToToggle?.status === 'active' ? 'deactivate' : 'activate'}</strong>{' '}
            <strong>
              {parentToToggle?.user
                ? `${parentToToggle.user.fname} ${parentToToggle.user.lname}`
                : 'this parent'}
            </strong>
            ?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setToggleStatusModalOpen(false)}>Cancel</Button>
          <Button
            size="small"
            /* color={parentToToggle?.status === 'active' ? 'warning' : 'success'} */
            onClick={handleConfirmToggle}
            autoFocus
          >
            {parentToToggle?.status === 'active' ? 'Deactivate' : 'Activate'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={impersonateGuardianConfirmOpen}
        onClose={() => {
          setImpersonateGuardianConfirmOpen(false);
          setGuardianToImpersonate(null);
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Login as Parent</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to login as{' '}
            <strong>
              {guardianToImpersonate?.user?.fname} {guardianToImpersonate?.user?.lname}
            </strong>
            ? You can return to your account at any time.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button variant="contained" size="small" color="inherit" onClick={() => {
            setImpersonateGuardianConfirmOpen(false);
            setGuardianToImpersonate(null);
          }}
          >
            Cancel
          </Button>
          <Button size="small" onClick={handleConfirmedImpersonateGuardian} sx={{ bgcolor: '#593196', '&:hover': { bgcolor: '#4a2880' }, color: '#fff' }}>
            Yes, Login As
          </Button>
        </DialogActions>
      </Dialog>

      <UploadParentModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUpload={handleUploadTemplate}
      />

      <LinkWardModal
        open={linkWardModalOpen}
        onClose={() => setLinkWardModalOpen(false)}
        parent={wardParent}
        onSaved={() => {
          fetchParents();
          fetchStats();
        }}
      />

      <ViewWardsModal
        open={viewWardsModalOpen}
        onClose={() => setViewWardsModalOpen(false)}
        guardian={viewWardsGuardian}
      />
    </PageContainer>
  );
};

export default ParentManagement;
