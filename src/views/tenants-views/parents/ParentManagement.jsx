import React, { useMemo, useState, useEffect, useCallback } from 'react';
import PageContainer from 'src/components/container/PageContainer';
import Breadcrumb from 'src/layouts/full/shared/breadcrumb/Breadcrumb';
import ParentCard from 'src/components/shared/ParentCard';
import { useNotification } from '../../../hooks/useNotification';

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
} from '@mui/material';

import { Search as SearchIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';
import { IconUsers, IconUserCheck, IconUserHeart } from '@tabler/icons-react';

import guardianApi from 'src/api/parentApi';
import { getClassesWithDivisions } from 'src/context/TenantContext/services/tenant.service';
import ParentForm from 'src/components/tenant-components/parents/ParentForm';
import DeleteParentModal from 'src/components/tenant-components/parents/DeleteParentModal';
import UploadParentModal from 'src/components/tenant-components/parents/UploadParentModal';
import LinkWardModal from 'src/components/tenant-components/parents/LinkWardModal';
import ViewWardsModal from 'src/components/tenant-components/parents/ViewWardsModal';

const BCrumb = [{ to: '/school-dashboard', title: 'Home' }, { title: 'Parent Management' }];

const EMPTY_FORM = {
  first_name: '',
  last_name: '',
  middle_name: '',
  email: '',
  phone: '',
  gender: '',
  occupation: '',
  relationship: '',
  address: '',
};

const StatCard = ({ count, label, icon: Icon, color = '#3B5BDB', loading }) => (
  <Paper
    sx={{
      borderRadius: 2,
      px: 3,
      py: 2,
      flex: 1,
      minWidth: { xs: '100%', sm: 200 },
      bgcolor: 'background.paper',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}
  >
    <Box
      sx={{
        width: 48,
        height: 48,
        borderRadius: '50%',
        bgcolor: 'primary.light',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon size={22} color={color} />
    </Box>

    <Box sx={{ textAlign: 'center' }}>
      {loading ? (
        <CircularProgress size={24} />
      ) : (
        <>
          <Typography fontSize={26} fontWeight={700}>
            {count}
          </Typography>
          <Typography fontSize={14} color="text.secondary">
            {label}
          </Typography>
        </>
      )}
    </Box>
  </Paper>
);

const ParentManagement = () => {
  const notify = useNotification();

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

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editInitialValues, setEditInitialValues] = useState(EMPTY_FORM);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [parentToDelete, setParentToDelete] = useState(null);

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
    setEditInitialValues(EMPTY_FORM);
    setIsEdit(false);
    setFormModalOpen(true);
  };

  const handleOpenEdit = (row) => {
    setEditInitialValues({
      first_name: row.user?.fname ?? '',
      last_name: row.user?.lname ?? '',
      middle_name: row.user?.mname ?? '',
      email: row.user?.email ?? '',
      phone: row.user?.phone ?? '',
      gender: row.user?.sex ?? '',
      occupation: row.occupation ?? '',
      relationship: row.relationship ?? '',
      address: row.address ?? '',
    });
    setSelectedRow(row);
    setIsEdit(true);
    setFormModalOpen(true);
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

  const handleToggleStatus = async (row) => {
    handleMenuClose();
    try {
      await guardianApi.toggleStatus(row.user_id);
      notify.success(
        `Parent ${row.status === 'active' ? 'deactivated' : 'activated'} successfully`,
      );
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

  const handleSave = async (values, wardIds = []) => {
    try {
      if (isEdit) {
        await guardianApi.update(selectedRow.user_id, values);
        notify.success('Parent updated successfully');
      } else {
        const res = await guardianApi.create(values);
        // sync wards if any were linked during creation
        if (wardIds.length > 0) {
          const newParentUserId = res?.data?.data?.user_id;
          if (newParentUserId) {
            await guardianApi.syncWards(newParentUserId, wardIds);
          }
        }
        notify.success('Parent added successfully');
      }
      setFormModalOpen(false);
      fetchParents();
      fetchStats();
    } catch (err) {
      notify.error(err?.response?.data?.message || 'Operation failed');
    }
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
            icon={IconUsers}
            loading={statsLoading}
          />
          <StatCard
            count={stats.active}
            label="Active Parents"
            icon={IconUserCheck}
            color="#2E7D32"
            loading={statsLoading}
          />
          <StatCard
            count={stats.linked}
            label="Guardians Linked"
            icon={IconUserHeart}
            color="#7B1FA2"
            loading={statsLoading}
          />
        </Stack>
      </Box>

      <ParentCard
        title={
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h5">Parents &amp; Guardians</Typography>
            <Box display="flex" gap={1}>
              <Button variant="outlined" onClick={handleDownloadTemplate}>
                Download Template
              </Button>
              <Button variant="outlined" onClick={() => setUploadModalOpen(true)}>
                Upload Template
              </Button>
              <Button variant="contained" color="primary" onClick={handleOpenAdd}>
                Add Single Parent
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
          />

          <FormControl sx={{ minWidth: 220 }}>
            <InputLabel>Filter by Class</InputLabel>
            <Select
              value={classId}
              label="Filter by Class"
              onChange={(e) => {
                setClassId(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="">All Classes</MenuItem>
              {classes.map((cls) => (
                <MenuItem key={cls.id} value={cls.id}>
                  {cls.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {hasFilters && (
            <Button
              variant="outlined"
              onClick={resetFilters}
              sx={{ height: 'fit-content', mb: 0.5 }}
            >
              Clear Filters
            </Button>
          )}
        </Box>

        <Paper variant="outlined">
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>S/N</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Wards</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : rows.length > 0 ? (
                  rows.map((row, index) => (
                    <TableRow key={row.user_id}>
                      <TableCell>{page * rowsPerPage + index + 1}</TableCell>

                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {row.user ? `${row.user.fname} ${row.user.lname}` : '—'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {relationshipLabel(row.relationship)}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
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
                            bgcolor: row.status === 'active' ? '#dcfce7' : '#fef3c7',
                            color: row.status === 'active' ? '#166534' : '#92400e',
                            fontWeight: 500,
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
                          <MenuItem onClick={() => handleOpenEdit(row)}>Edit</MenuItem>
                          <MenuItem onClick={() => handleOpenLinkWard(row)}>Link Ward</MenuItem>
                          <MenuItem onClick={() => handleToggleStatus(row)}>
                            {row.status === 'active' ? 'Deactivate' : 'Activate'}
                          </MenuItem>
                          <MenuItem
                            onClick={() => handleOpenDelete(row)}
                            sx={{ color: 'error.main' }}
                          >
                            Delete
                          </MenuItem>
                        </Menu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
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

      <ParentForm
        open={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        initialValues={editInitialValues}
        onSave={handleSave}
        isEdit={isEdit}
      />

      <DeleteParentModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        parent={parentToDelete}
        onConfirm={handleConfirmDelete}
      />

      <UploadParentModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUpload={handleUploadTemplate}
      />

      <LinkWardModal
        open={linkWardModalOpen}
        onClose={() => setLinkWardModalOpen(false)}
        parent={wardParent}
        onSaved={fetchParents}
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
