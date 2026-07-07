import React from 'react';
import { Typography, Box, Stack, IconButton, Card } from '@mui/material';
import GetAppIcon from '@mui/icons-material/GetApp';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import StandardDataTable from '@/components/shared/StandardDataTable';
import ReusableModal from 'src/components/shared/ReusableModal';
import PrimaryButton from '@/components/shared/PrimaryButton';
import { useState, useEffect } from 'react';
import axios from '@/api/landlord/landlord_api';

const ViewUsersListModal = ({ open, onClose, schoolId, schoolName }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && schoolId) {
      fetchUsers();
    }
  }, [open, schoolId]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/v1/landlord/activity-logs/tenant/${schoolId}/users`);
      if (response.data?.status) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching tenant users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportToExcel = async () => {
    if (!users || users.length === 0) return;

    const headers = ['S/N', 'User Details', 'Date/Time Logged In'];
    const rows = users.map((row, index) => [
      index + 1,
      row.name || '',
      row.time || ''
    ]);

    try {
      const response = await axios.post('/v1/landlord/activity-logs/export-excel', {
        title: `Logged In Users - ${schoolName || 'School'}`,
        headers: headers,
        rows: rows
      }, { responseType: 'blob' });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Logged_In_Users_${(schoolName || 'School').replace(/\s+/g, '_')}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export excel', error);
    }
  };

  return (
    <ReusableModal
      open={open}
      onClose={onClose}
      title={`Logged in users today for ${schoolName || 'Selected School'}`}
      size="large"
      showDivider={false}
    >
      <Card
        sx={{
          p: 0,
          borderRadius: '4px',
          boxShadow: 'none',
          border: '1px solid #e2e8f0',
          bgcolor: 'white',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
          < PrimaryButton
            variant="primary"
            startIcon={<GetAppIcon />}
            onClick={handleExportToExcel}
            sx={{
              color: '#ffffff !important',
              bgcolor: '#2ca87f',
              '&:hover': { bgcolor: '#238a68' },
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            Export to Excel
          </  PrimaryButton>
        </Box>
        <Box sx={{ p: 2 }}>
          <StandardDataTable
            columns={[
              { header: '#', accessorKey: 'id' },
              {
                header: 'User Details',
                accessorKey: 'name',
                cell: (info) => (
                  <Typography variant="body2" fontWeight="600" color="#4a5568">
                    {info.getValue()}
                  </Typography>
                ),
              },
              {
                header: 'Date/Time Logged In',
                accessorKey: 'time',
                cell: (info) => (
                  <Typography sx={{ color: '#718096', fontWeight: 500, fontSize: '13px' }}>
                    {info.getValue()}
                  </Typography>
                ),
              },
              {
                header: 'Action',
                accessorKey: 'action',
                cell: () => (
                  <IconButton size="small">
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                ),
                align: 'center',
              },
            ]}
            data={users}
            isLoading={loading}
            pageSize={10}
          />
        </Box>
      </Card>
    </ReusableModal>
  );
};

export default ViewUsersListModal;
