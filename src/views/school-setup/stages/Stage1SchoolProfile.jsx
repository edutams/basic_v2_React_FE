import { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  TextField,
  Link,
  CircularProgress,
  useTheme,
  Divider,
  Button,
} from '@mui/material';
import { IconUpload, IconPhoto } from '@tabler/icons-react';
import { getTenantInfo } from '../../../api/tenant_api';
import { getFullImageUrl } from '../../../helpers/ImageHelper';
import { TenantAuthContext } from '../../../context/TenantContext/auth';
import UploadLogoModal from '../../../components/tenant-components/school/UploadLogoModal';
import SetupShell from './SetupShell';
import ParentCard from '../../../components/shared/ParentCard';
import ArrowHint from '../../../components/shared/ArrowHint';

const keyframes = {
  '@keyframes fadeUp': {
    from: { opacity: 0, transform: 'translateY(16px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
  },
  '@keyframes bounce': {
    '0%, 100%': { transform: 'translateY(0)' },
    '40%': { transform: 'translateY(-6px)' },
    '60%': { transform: 'translateY(-3px)' },
  },
};

// ── Admin card ────────────────────────────────────────────────────────────────
const AdminCard = ({ admin, index }) => {
  const fields = [
    { label: 'Surname', value: admin.lastName },
    { label: 'First Name', value: admin.firstName },
    { label: 'Other Name', value: admin.otherName },
    { label: 'Phone', value: admin.phone },
    { label: 'Email', value: admin.email },
  ];

  return (
    <Box
      sx={{
        flex: '1 1 200px',
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
          {index + 1}
        </Box>
        <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{admin.title}</Typography>
      </Box>

      {fields.map(({ label, value }) => (
        <Box
          key={label}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            flexWrap: 'wrap',
          }}
        >
          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 700,
              color: 'text.primary',
            }}
          >
            {label}:
          </Typography>

          <Typography
            sx={{
              fontSize: 13,
              color: 'text.secondary',
            }}
          >
            {value || 'N/A'}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

// ── Main stage ────────────────────────────────────────────────────────────────
const Stage1SchoolProfile = ({ onNext, onBack, onSkip }) => {
  const { refreshTenantInfo } = useContext(TenantAuthContext);
  const theme = useTheme();
  const primary = theme.palette.primary.main;

  const [tenantData, setTenantData] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logo, setLogo] = useState(null);
  const [saving, setSaving] = useState(false);
  const [logoModalOpen, setLogoModalOpen] = useState(false);

  useEffect(() => {
    getTenantInfo()
      .then((res) => {
        const d = res.data;

        // Normalise school_type (may be JSON string, array, or plain string)
        let schoolType = d.school_type;
        if (typeof schoolType === 'string') {
          try {
            schoolType = JSON.parse(schoolType);
          } catch {
            /* keep as string */
          }
        }
        const schoolTypeLabel = Array.isArray(schoolType)
          ? schoolType.map((t) => String(t).replace(/-/g, ' ')).join(', ')
          : schoolType
            ? String(schoolType).replace(/-/g, ' ')
            : '';

        setTenantData({
          name: d.tenant_name || '',
          shortName: d.tenant_short_name || '',
          address: d.address || '',
          schoolType: schoolTypeLabel,
        });

        setLogo(getFullImageUrl(d.school_logo));

        setAdmins([
          {
            title: 'School Owner Detail',
            lastName: d.administrator_info?.school_owner?.school_owner_last_name || '',
            firstName: d.administrator_info?.school_owner?.school_owner_first_name || '',
            otherName: d.administrator_info?.school_owner?.school_owner_middle_name || '',
            phone: d.administrator_info?.school_owner?.school_owner_phone || '',
            email: d.administrator_info?.school_owner?.school_owner_email || '',
          },
          {
            title: 'School Head Detail',
            lastName: d.administrator_info?.school_head?.school_head_last_name || '',
            firstName: d.administrator_info?.school_head?.school_head_first_name || '',
            otherName: d.administrator_info?.school_head?.school_head_middle_name || '',
            phone: d.administrator_info?.school_head?.school_head_phone || '',
            email: d.administrator_info?.school_head?.school_head_email || '',
          },
          {
            title: 'Portal Admin',
            lastName: d.administrator_info?.school_spa?.admin_last_name || '',
            firstName: d.administrator_info?.school_spa?.admin_first_name || '',
            otherName: d.administrator_info?.school_spa?.admin_middle_name || '',
            phone: d.administrator_info?.school_spa?.admin_phone || '',
            email: d.administrator_info?.school_spa?.admin_email || '',
          },
        ]);
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
      totalStages={5}
      onBack={onBack}
      onSkip={onSkip}
      onSaveAndContinue={handleSave}
      saving={saving}
      leftVariant="dark"
      leftTitle="Set up your school profile."
      leftSubtitle="Upload your logo, confirm your school details and admin information to get started."
    >
      <Typography
        sx={{ fontSize: { xs: 20, sm: 26 }, fontWeight: 800, color: 'text.primary', mb: 1 }}
      >
        Set Up Your School Profile
      </Typography>
      <Typography
        sx={{
          fontSize: 13,
          color: 'text.secondary',
          mb: { xs: 3, sm: 4 },
          maxWidth: 480,
          lineHeight: 1.6,
        }}
      >
        Upload your school logo and check your school details. If the details are incorrect click{' '}
        <Link href="#" sx={{ fontWeight: 600, color: 'primary.main' }}>
          (Get Help)
        </Link>{' '}
        to make a complaint.
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" pt={6}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 3, sm: 4 },
              alignItems: 'flex-start',
              mb: 3,
            }}
          >
            <Box
              sx={{
                flexShrink: 0,
                width: { xs: '100%', sm: 'auto' },
                display: 'flex',
                flexDirection: 'column',
                alignItems: { xs: 'center', sm: 'flex-start' },
              }}
            >
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

              <Button
                size="small"
                onClick={() => setLogoModalOpen(true)}
                sx={{
                   width: '100%',
                  mt: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 0.75,
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: logo ? 'divider' : 'primary.main',
                  borderRadius: '8px !important',
                  py: 0.75,
                  bgcolor: '#fff',
                  transition: 'all 0.2s',

                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'primary.main',

                    '& .browse-text': {
                      color: '#fff',
                    },

                    '& .browse-icon': {
                      color: '#fff',
                    },
                  },

                  ...(!logo && {
                    boxShadow: `0 0 0 3px ${primary}22`,
                  }),
                }}
              >
                <IconUpload
                  size={15}
                  className="browse-icon"
                  style={{
                    color: logo ? '#555' : primary,
                    transition: 'color 0.2s',
                  }}
                />

                <Typography
                  className="browse-text"
                  sx={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: logo ? 'text.primary' : 'primary.main',
                    transition: 'color 0.2s',
                  }}
                >
                  Browse
                </Typography>
              </Button>

              {!logo && (
                <ArrowHint
                  show
                  label="👆 Click here to upload logo"
                  direction="up-right"
                  mode="persistent"
                  delay="0.6s"
                  sx={{ width: 160, mt: 0.5 }}
                />
              )}
            </Box>

            <Box sx={{ flex: 1, width: { xs: '100%', sm: 'auto' } }}>
              <ParentCard>
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      School Name:
                    </Typography>

                    <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                      {tenantData?.name || 'No school name available'}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Acronym:
                    </Typography>

                    <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                      {tenantData?.shortName || 'No acronym available'}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      School Type:
                    </Typography>

                    <Typography
                      variant="h6"
                      sx={{
                        color: 'text.secondary',
                        textTransform: 'capitalize',
                      }}
                    >
                      {tenantData?.schoolType || 'No school type available'}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Address:
                    </Typography>

                    <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                      {tenantData?.address || 'No address available'}
                    </Typography>
                  </Box>
                </Box>
              </ParentCard>
            </Box>
          </Box>

          <Box>
            <ParentCard>
              <Typography sx={{ fontSize: 20, fontWeight: 800, color: 'text.primary', mb: 0.75 }}>
                Confirm School Head / Admin Detail
              </Typography>
              <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 3, lineHeight: 1.6 }}>
                Confirm your school owner details. If the details are incorrect click{' '}
                <Link href="#" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  Get Help
                </Link>
                .
              </Typography>

              <Box sx={{ display: 'flex', gap: 2.5, flexWrap: 'wrap' }}>
                {admins.map((admin, i) => (
                  <AdminCard key={admin.title} admin={admin} index={i} />
                ))}
              </Box>
            </ParentCard>
          </Box>
        </>
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
