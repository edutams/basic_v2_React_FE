import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Link, CircularProgress } from '@mui/material';
import { getTenantInfo } from '../../../api/tenant_api';
import SetupShell from './SetupShell';

const AdminCard = ({ admin }) => {
  const fields = [
    { label: 'Surname',    value: admin.lastName },
    { label: 'First Name', value: admin.firstName },
    { label: 'Other Name', value: admin.otherName },
    { label: 'Phone',      value: admin.phone },
    { label: 'Email',      value: admin.email },
  ];

  return (
    <Box
      sx={{
        flex: '1 1 260px',
        bgcolor: '#fff',
        borderRadius: '12px !important',
        border: '1px solid',
        borderColor: 'divider',
        p: 2.5,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      {/* Card title badge */}
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.75,
          bgcolor: 'primary.main',
          color: '#fff',
          px: 1.5,
          py: 0.5,
          borderRadius: '20px !important',
          alignSelf: 'flex-start',
          mb: 0.5,
        }}
      >
        <Box
          sx={{
            width: 18,
            height: 18,
            borderRadius: '50% !important',
            bgcolor: 'rgba(255,255,255,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 10,
            fontWeight: 700,
          }}
        >
          i
        </Box>
        <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{admin.title}</Typography>
      </Box>

      {fields.map(({ label, value }) => (
        <Box key={label}>
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 600,
              color: 'text.secondary',
              mb: 0.4,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            {label}
          </Typography>
          <TextField
            fullWidth
            size="small"
            value={value || ''}
            slotProps={{ input: { readOnly: true } }}
            sx={{ bgcolor: '#fff' }}
          />
        </Box>
      ))}
    </Box>
  );
};

const Stage3AdminDetail = ({ onNext, onBack, onSkip }) => {
  const [admins, setAdmins] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTenantInfo()
      .then((res) => {
        const d = res.data;
        setAdmins([
          {
            title: 'School Owner Detail',
            lastName:  d.administrator_info?.school_owner?.school_owner_last_name   || '',
            firstName: d.administrator_info?.school_owner?.school_owner_first_name  || '',
            otherName: d.administrator_info?.school_owner?.school_owner_middle_name || '',
            phone:     d.administrator_info?.school_owner?.school_owner_phone       || '',
            email:     d.administrator_info?.school_owner?.school_owner_email       || '',
          },
          {
            title: 'School Head Detail',
            lastName:  d.administrator_info?.school_head?.school_head_last_name   || '',
            firstName: d.administrator_info?.school_head?.school_head_first_name  || '',
            otherName: d.administrator_info?.school_head?.school_head_middle_name || '',
            phone:     d.administrator_info?.school_head?.school_head_phone       || '',
            email:     d.administrator_info?.school_head?.school_head_email       || '',
          },
          {
            title: 'Portal Admin',
            lastName:  d.administrator_info?.school_spa?.admin_last_name   || '',
            firstName: d.administrator_info?.school_spa?.admin_first_name  || '',
            otherName: d.administrator_info?.school_spa?.admin_middle_name || '',
            phone:     d.administrator_info?.school_spa?.admin_phone       || '',
            email:     d.administrator_info?.school_spa?.admin_email       || '',
          },
        ]);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <SetupShell
      stage={3}
      totalStages={3}
      onBack={onBack}
      onSkip={onSkip}
      onSaveAndContinue={onNext}
    >
      <Typography sx={{ fontSize: 26, fontWeight: 800, color: 'text.primary', mb: 0.75 }}>
        Confirm School Head/Admin Detail
      </Typography>
      <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 4, lineHeight: 1.6 }}>
        Confirm your school owner details. If the details are incorrect click{' '}
        <Link href="#" sx={{ fontWeight: 700, color: 'primary.main' }}>
          Get Help
        </Link>
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" pt={6}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', gap: 2.5, flexWrap: 'wrap' }}>
          {admins.map((admin) => (
            <AdminCard key={admin.title} admin={admin} />
          ))}
        </Box>
      )}
    </SetupShell>
  );
};

export default Stage3AdminDetail;
