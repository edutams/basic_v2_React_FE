import React, { useState, useEffect, useContext } from 'react';
import { Box, Typography, TextField, Link, CircularProgress } from '@mui/material';
import { IconUpload, IconPhoto } from '@tabler/icons-react';
import { getTenantInfo } from '../../../api/tenant_api';
import { getFullImageUrl } from '../../../helpers/ImageHelper';
import { TenantAuthContext } from '../../../context/TenantContext/auth';
import { useNotification } from '../../../hooks/useNotification';
import UploadLogoModal from '../../../components/tenant-components/school/UploadLogoModal';
import SetupShell from './SetupShell';

const Stage1SchoolProfile = ({ onNext, onBack, onSkip }) => {
  const { refreshTenantInfo } = useContext(TenantAuthContext);
  const notify = useNotification();

  const [tenantData, setTenantData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logo, setLogo] = useState(null);
  const [saving, setSaving] = useState(false);
  const [logoModalOpen, setLogoModalOpen] = useState(false);

  useEffect(() => {
    getTenantInfo()
      .then((res) => {
        const d = res.data;
        setTenantData({
          name: d.tenant_name || '',
          shortName: d.tenant_short_name || '',
          address: d.address || '',
        });
        setLogo(getFullImageUrl(d.school_logo));
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const handleLogoUploaded = (newLogoUrl) => {
    setLogo(newLogoUrl);
    refreshTenantInfo();
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      onNext();
    } finally {
      setSaving(false);
    }
  };

  return (
    <SetupShell
      stage={1}
      totalStages={3}
      onBack={onBack}
      onSkip={onSkip}
      onSaveAndContinue={handleSave}
      saving={saving}
    >
      <Typography sx={{ fontSize: 26, fontWeight: 800, color: 'text.primary', mb: 1 }}>
        Set Up Your School Profile
      </Typography>
      <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 4, maxWidth: 480, lineHeight: 1.6 }}>
        Upload your school logo and check your school details. If the details are incorrect click{' '}
        <Link href="#" sx={{ fontWeight: 600, color: 'primary.main' }}>(Get Help)</Link>{' '}
        to make a complaint.
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" pt={6}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', gap: 4, alignItems: 'flex-start' }}>
          {/* Logo upload box */}
          <Box sx={{ flexShrink: 0 }}>
            <Box
              onClick={() => setLogoModalOpen(true)}
              sx={{
                width: 160,
                height: 160,
                border: '1.5px dashed',
                borderColor: 'divider',
                borderRadius: '12px !important',
                bgcolor: '#fff',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                overflow: 'hidden',
                '&:hover': { borderColor: 'primary.main' },
              }}
            >
              {logo ? (
                <Box
                  component="img"
                  src={logo}
                  alt="School logo"
                  sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              ) : (
                <IconPhoto size={48} color="#bbb" strokeWidth={1} />
              )}
            </Box>

            <Box
              onClick={() => setLogoModalOpen(true)}
              sx={{
                mt: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.75,
                cursor: 'pointer',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '8px !important',
                py: 0.75,
                bgcolor: '#fff',
                '&:hover': { borderColor: 'primary.main' },
              }}
            >
              <IconUpload size={15} color="#555" />
              <Typography sx={{ fontSize: 13, fontWeight: 500, color: 'text.primary' }}>
                Browse
              </Typography>
            </Box>
          </Box>

          {/* Read-only school fields */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {[
              { label: 'School Name', value: tenantData?.name, placeholder: 'Enter School Name' },
              { label: 'Acronym', value: tenantData?.shortName, placeholder: 'e.g. GSS' },
            ].map(({ label, value, placeholder }) => (
              <Box key={label}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 0.75, color: 'text.primary' }}>
                  {label}
                </Typography>
                <TextField
                  fullWidth
                  placeholder={placeholder}
                  value={value || ''}
                  slotProps={{ input: { readOnly: true } }}
                  sx={{ bgcolor: '#fff' }}
                />
              </Box>
            ))}

            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 0.75, color: 'text.primary' }}>
                Address
              </Typography>
              <TextField
                fullWidth
                placeholder="Enter school address"
                value={tenantData?.address || ''}
                slotProps={{ input: { readOnly: true } }}
                multiline
                rows={3}
                sx={{ bgcolor: '#fff' }}
              />
            </Box>
          </Box>
        </Box>
      )}

      <UploadLogoModal
        open={logoModalOpen}
        onClose={() => setLogoModalOpen(false)}
        onUploaded={handleLogoUploaded}
      />
    </SetupShell>
  );
};

export default Stage1SchoolProfile;
