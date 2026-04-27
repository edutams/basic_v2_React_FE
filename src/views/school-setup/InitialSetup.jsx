import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router';
import { Box, Typography, Button, Avatar, TextField, Stack, Divider, Card } from '@mui/material';
import { IconSchool, IconVideo, IconArrowRight } from '@tabler/icons-react';
import { getTenantInfo, updateSchoolLogo } from '../../api/tenant_api';
import { getFullImageUrl } from '../../helpers/ImageHelper';
import { TenantAuthContext } from '../../context/TenantContext/auth';

// Helper function to format school type from simple string or JSON array
const formatSchoolType = (schoolType) => {
  if (!schoolType) return '';

  let value = schoolType;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) value = parsed[0] || '';
      else value = String(parsed);
    } catch {
      // not JSON, use as-is
    }
  } else if (Array.isArray(value)) {
    value = value[0] || '';
  }

  const normalized = String(value).toLowerCase().trim();
  if (normalized === 'primary') return 'Primary';
  if (normalized === 'secondary') return 'Secondary';

  return value;
};

const SchoolInformationPage = () => {
  const navigate = useNavigate();
  const { refreshTenantInfo } = useContext(TenantAuthContext);
  const [tenantData, setTenantData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logo, setLogo] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [originalLogo, setOriginalLogo] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchTenantInfo = async () => {
      try {
        const res = await getTenantInfo();
        const d = res.data;

        const formattedData = {
          name: d.tenant_name,
          shortName: d.tenant_short_name,
          email: d.tenant_email,
          logo: d.school_logo,
          address: d.address,
          schoolType: formatSchoolType(d.school_type),

          admins: {
            owner: {
              firstName: d.administrator_info?.school_owner?.school_owner_first_name,
              lastName: d.administrator_info?.school_owner?.school_owner_last_name,
              otherName: d.administrator_info?.school_owner?.school_owner_middle_name,
              email: d.administrator_info?.school_owner?.school_owner_email,
              phone: d.administrator_info?.school_owner?.school_owner_phone,
            },
            head: {
              firstName: d.administrator_info?.school_head?.school_head_first_name,
              lastName: d.administrator_info?.school_head?.school_head_last_name,
              otherName: d.administrator_info?.school_head?.school_head_middle_name,
              email: d.administrator_info?.school_head?.school_head_email,
              phone: d.administrator_info?.school_head?.school_head_phone,
            },
            spa: {
              firstName: d.administrator_info?.school_spa?.admin_first_name,
              lastName: d.administrator_info?.school_spa?.admin_last_name,
              otherName: d.administrator_info?.school_spa?.admin_middle_name,
              email: d.administrator_info?.school_spa?.admin_email,
              phone: d.administrator_info?.school_spa?.admin_phone,
            },
          },
        };

        setTenantData(formattedData);
        const fullLogoUrl = getFullImageUrl(d.school_logo);
        setLogo(fullLogoUrl);
        setOriginalLogo(fullLogoUrl);
      } catch (error) {
        console.error('Failed to fetch tenant info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTenantInfo();
  }, []);

  const handleBrowseClick = () => {
    document.getElementById('school-logo-input').click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setLogo(URL.createObjectURL(file));
      setLogoFile(file);
    }
  };

  const handleSaveAndContinue = async () => {
    setSaving(true);
    try {
      if (logoFile) {
        const formData = new FormData();
        formData.append('school_logo', logoFile);
        const res = await updateSchoolLogo(formData);
        if (res.data?.school_logo) {
          setLogo(getFullImageUrl(res.data.school_logo));
          refreshTenantInfo();
        }
      }
      navigate('/complete-setup');
    } catch (error) {
      console.error('Failed to save school logo:', error);
    } finally {
      setSaving(false);
    }
  };

  // Button is enabled if there's an original logo OR a new logo file has been uploaded
  const isButtonDisabled = !originalLogo && !logoFile;

  const adminList = [
    { title: 'School Owner Detail', data: tenantData?.admins?.owner },
    { title: 'School Head Detail', data: tenantData?.admins?.head },
    { title: 'Portal Admin', data: tenantData?.admins?.spa },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Box>
          <Typography fontWeight={700} fontSize={20}>
            School Information
          </Typography>
          <Typography fontSize={13} color="text.secondary">
            Register your school and set up administrative accounts
          </Typography>
        </Box>

        <Box
          sx={{
            px: 2,
            py: 1,
            bgcolor: 'background.paper',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            cursor: 'pointer',
            boxShadow: '0px 6px 16px rgba(0,0,0,0.08)',
            borderRadius: 1,
          }}
        >
          <IconVideo size={20} />
          <Typography fontSize={13}>How to setup your Profile</Typography>
          <IconArrowRight size={16} />
        </Box>
      </Box>

      <Card sx={{ mb: 2 }}>
        <Box sx={{ px: 3, py: 1.5, bgcolor: 'action.hover' }}>
          <Typography fontWeight={600}>School Details</Typography>
        </Box>

        <Box sx={{ p: 3, display: 'flex', gap: 3 }}>
          <Box textAlign="center">
            <input
              type="file"
              id="school-logo-input"
              hidden
              onChange={handleFileChange}
              accept="image/*"
            />
            <Avatar
              src={logo || undefined}
              sx={{
                width: 110,
                height: 110,
                mx: 'auto',
                bgcolor: 'action.hover',
                border: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 0.5,
                cursor: 'pointer',
              }}
              onClick={handleBrowseClick}
            >
              {!logo && (
                <>
                  <IconSchool size={40} color="#9e9e9e" />
                  <Typography
                    sx={{
                      fontSize: 10,
                      color: 'text.secondary',
                      textAlign: 'center',
                      lineHeight: 1,
                    }}
                  >
                    Upload school logo
                  </Typography>
                </>
              )}
            </Avatar>

            <Button onClick={handleBrowseClick} sx={{ mt: 2 }}>
              Browse
            </Button>
          </Box>

          <Box flex={1} display="flex" gap={3}>
            <Stack spacing={2} flex={1}>
              <TextField label="School Name" value={tenantData?.name || ''} />
              <TextField label="Acronym" value={tenantData?.shortName || ''} />
            </Stack>

            <Stack spacing={2} flex={1}>
              <TextField label="Category" value={tenantData?.schoolType || ''} fullWidth />
              <TextField label="Address" value={tenantData?.address || ''} />
            </Stack>
          </Box>
        </Box>
      </Card>

      <Card>
        <Box sx={{ px: 3, py: 1.5, bgcolor: 'action.hover' }}>
          <Typography fontWeight={600}>Administrative Accounts</Typography>
        </Box>

        <Box sx={{ p: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {adminList.map((item) => {
            const admin = item.data || {};

            return (
              <Box
                key={item.title}
                sx={{
                  flex: '1 1 300px',
                  p: 2,
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  boxShadow: '0px 6px 16px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: '0px 12px 28px rgba(0,0,0,0.18)',
                  },
                }}
              >
                <Typography fontWeight={600}>{item.title}</Typography>
                <Divider sx={{ my: 2 }} />

                <Stack spacing={1.5}>
                  <TextField label="Surname" value={admin.lastName || ''} />
                  <TextField label="First Name" value={admin.firstName || ''} />
                  <TextField label="Other Name" value={admin.otherName || ''} />
                  <TextField label="Phone" value={admin.phone || ''} />
                  <TextField label="Email" value={admin.email || ''} />
                </Stack>
              </Box>
            );
          })}
        </Box>
      </Card>

      <Box mt={3} display="flex" justifyContent="flex-end">
        <Button
          variant="contained"
          onClick={handleSaveAndContinue}
          disabled={isButtonDisabled || saving}
        >
          {saving ? 'Saving...' : 'Save & Continue'}
        </Button>
      </Box>
    </Box>
  );
};

export default SchoolInformationPage;
