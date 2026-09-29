import { Avatar, Typography } from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import { useTenantBranding } from '@/hooks/useTenantBranding';

// Shared report-card school header — renders the school's uploaded logo,
// name, address and phone from tenant info (with an "S" placeholder only
// when no logo has been uploaded). Used by all 13 result templates.
const SchoolHeader = ({ schoolName: schoolNameProp, address: addressProp, phone: phoneProp, qrValue }) => {
  const branding = useTenantBranding();
  const schoolName = schoolNameProp || branding.schoolName;
  const address = addressProp || branding.address;
  const phone = phoneProp || branding.phone;
  const logo = branding.schoolLogo;

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', flexWrap: 'wrap', textAlign: 'center', marginBottom: 8 }}>
      {logo ? (
        <Avatar
          src={logo}
          alt={schoolName || 'School logo'}
          variant="rounded"
          sx={{ width: 80, height: 80, bgcolor: '#fff', '& .MuiAvatar-img': { objectFit: 'contain' } }}
        />
      ) : (
        <Avatar sx={{ width: 80, height: 80, bgcolor: '#1565c0', fontSize: 28 }} variant="rounded">
          {(schoolName || 'S').trim()?.[0]?.toUpperCase() || 'S'}
        </Avatar>
      )}
      <div style={{ textAlign: 'center' }}>
        <Typography variant="h2" fontWeight={800} sx={{ textTransform: 'uppercase', fontFamily: 'Times New Roman, serif' }}>
          {schoolName || ''}
        </Typography>
        {(address || phone) && (
          <Typography variant="h6" fontWeight={400}>
            {address && <><strong>Address:</strong> {address} &nbsp;&nbsp;</>}
            {phone && <><strong>Phone:</strong> {phone}</>}
          </Typography>
        )}
      </div>
      {qrValue && (
        <div style={{ position: 'absolute', right: 0, top: 0 }}>
          <QRCodeSVG value={qrValue} size={60} level="H" />
        </div>
      )}
    </div>
  );
};

export default SchoolHeader;
