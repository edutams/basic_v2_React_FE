import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Paper, Chip } from '@mui/material';

const ViewSchoolDetails = () => {
  const { schoolUrl } = useParams();
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const schoolList = JSON.parse(localStorage.getItem('schoolList') || '[]');
    const found = schoolList.find(s => s.url === schoolUrl);
    setSchool(found || null);
    setLoading(false);
  }, [schoolUrl]);

  if (loading) return <Box p={3}>Loading...</Box>;
  if (!school) return <Box p={3}>School not found.</Box>;

  return (
    <Paper sx={{ p: 4, maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" mb={2}>{school.name}</Typography>
      <Typography variant="body1" mb={1}><b>Email:</b> {school.email}</Typography>
      <Typography variant="body1" mb={1}><b>Subscription Method:</b> {school.subscriptionMethod}</Typography>
      <Typography variant="body1" mb={1}><b>Amount Per User:</b> {school.amountPerUser || '-'}</Typography>
      <Typography variant="body1" mb={1}><b>Status:</b> <Chip label={school.status || 'LIVE'} color={school.status === 'LIVE' ? 'success' : 'default'} size="small" /></Typography>
    </Paper>
  );
};

export default ViewSchoolDetails; 