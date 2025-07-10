import React, { useEffect, useState } from 'react';
import { Typography, Box, Paper } from '@mui/material';
import { useParams } from 'react-router-dom';

const ViewSchool = () => {
    
    const params = useParams();
    console.log('params:', params);

    const { id } = params;
    console.log(id);
    
    const [school, setSchool] = useState(null);

  useEffect(() => {
  }, [id]);

  if (!school) {
    return <Typography>No school data available.</Typography>;
  }

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {school.name}
      </Typography>
      <Box sx={{ mt: 2 }}>
        <Typography><strong>Address:</strong> {school.address}</Typography>
        <Typography><strong>Phone:</strong> {school.phone}</Typography>
        <Typography><strong>Email:</strong> {school.email}</Typography>
        <Typography><strong>Administrator:</strong> {school.adminName}</Typography>
      </Box>
    </Paper>
  );
};

export default ViewSchool;
