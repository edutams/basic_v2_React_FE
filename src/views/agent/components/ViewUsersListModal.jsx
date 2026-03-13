import React from 'react';
import {
  Typography,
  Box,
  Stack,
  IconButton,
  Card,
} from '@mui/material';
import GetAppIcon from '@mui/icons-material/GetApp';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import StandardDataTable from 'src/components/shared/StandardDataTable';
import StandardModal from 'src/components/shared/StandardModal';
import PrimaryButton from 'src/components/shared/PrimaryButton';

const ViewUsersListModal = ({ open, onClose, schoolName }) => {
  const data = [
    { id: 1, name: 'ABBA Hadiza Mohd', time: 'Tuesday, February 3rd 2026, 12:43:47 pm' },
    { id: 2, name: 'BALA Rabiu R', time: 'Monday, February 2nd 2026, 7:53:18 am' },
    { id: 3, name: 'ABBA Hadiza Mohd', time: 'Tuesday, February 3rd 2026, 12:43:47 pm' },
    { id: 4, name: 'BALA Rabiu R', time: 'Monday, February 2nd 2026, 7:53:18 am' },
  ];

  return (
    <StandardModal
      open={open}
      onClose={onClose}
      title={`Logged in users today for ${schoolName || 'FESTIVAL SPECIAL PRIAMRY SCHOOL'}`}
      maxWidth="md"
      padding={4}
      headerBg="white"
      actions={
        <Stack direction="row" spacing={2} justifyContent="flex-end" width="100%">
          <PrimaryButton variant="secondary" onClick={onClose}>Cancel</PrimaryButton>
          <PrimaryButton variant="primary" onClick={onClose}>Save</PrimaryButton>
        </Stack>
      }
    >
      <Card sx={{ p: 0, borderRadius: '4px', boxShadow: 'none', border: '1px solid #e2e8f0', bgcolor: 'white', overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
          <PrimaryButton
            variant="primary"
            startIcon={<GetAppIcon />}
            sx={{ color: '#ffffff !important', bgcolor: '#2ca87f', '&:hover': { bgcolor: '#238a68' }, width: { xs: '100%', sm: 'auto' } }}
          >
            Export to Excel
          </PrimaryButton>
        </Box>
        <Box sx={{ p: 2 }}>
          <StandardDataTable
            columns={[
              { header: '#', accessorKey: 'id' },
              {
                header: 'User Details', accessorKey: 'name', cell: (info) => (
                  <Typography variant="body2" fontWeight="600" color="#4a5568">{info.getValue()}</Typography>
                )
              },
              {
                header: 'Date/Time Logged In', accessorKey: 'time', cell: (info) => (
                  <Typography sx={{ color: '#718096', fontWeight: 500, fontSize: '13px' }}>{info.getValue()}</Typography>
                )
              },
              {
                header: 'Action', accessorKey: 'action', cell: () => (
                  <IconButton size="small" >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                ), align: 'center'
              }
            ]}
            data={data}
            pageSize={10}
          />
        </Box>
      </Card>
    </StandardModal>
  );
};

export default ViewUsersListModal;
