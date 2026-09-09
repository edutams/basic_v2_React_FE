import { Typography, Avatar } from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';

const SchoolHeader = ({ schoolName, address, phone, qrValue }) => (
  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', flexWrap: 'wrap', textAlign: 'center', marginBottom: 8 }}>
    <Avatar sx={{ width: 80, height: 80, bgcolor: '#1565c0', fontSize: 28 }} variant="rounded">
      T
    </Avatar>
    <div style={{ textAlign: 'center' }}>
      <Typography variant="h2" fontWeight={800} sx={{ textTransform: 'uppercase', fontFamily: 'Times New Roman, serif' }}>
        {schoolName || 'Tai Solarin University of Education Secondary School'}
      </Typography>
      <Typography variant="h6" fontWeight={400}>
        <strong>Address:</strong> {address || '123 Education Lane, Lagos, Nigeria'} &nbsp;&nbsp;
        <strong>Phone:</strong> {phone || '+234 801 234 5678'}
      </Typography>
    </div>
    {qrValue && (
      <div style={{ position: 'absolute', right: 0, top: 0 }}>
        <QRCodeSVG value={qrValue} size={60} level="H" />
      </div>
    )}
  </div>
);

export default SchoolHeader;
