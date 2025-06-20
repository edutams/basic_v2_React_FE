import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';

const SchoolsView = ({ selectedAgent }) => {
  return (
    <div>
      <Typography variant="h6" mb={2}>
        All schools in {selectedAgent?.organizationName}
      </Typography>
      {selectedAgent?.schools && selectedAgent.schools.length > 0 ? (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>School Name</TableCell>
                <TableCell align="right">Address</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedAgent?.schools?.map((school) => (
                <TableRow
                  key={school.schoolName}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {school.schoolName}
                  </TableCell>
                  <TableCell align="right">{school.address}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Box sx={{ backgroundColor: 'info.light', p: 2, borderRadius: 1 }}>
          <Typography variant="h2" sx={{ color: '#0B5886', fontWeight: 600 }}>
            No schools registered yet
          </Typography>
        </Box>
      )}
    </div>
  );
};

export default SchoolsView;
