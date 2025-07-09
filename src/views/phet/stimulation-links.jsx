import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  TextField,
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableFooter,
  TablePagination,
  Paper,
  InputAdornment,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import Breadcrumb from 'src/layouts/full/shared/breadcrumb/Breadcrumb';
import ParentCard from 'src/components/shared/ParentCard'; // ✅ Adjust path as needed

const StimulationLinks = () => {
  return (
    <Box sx={{ p: 2 }}>
      <Breadcrumb
        title="Stimulation Links"
        items={[
          { title: 'Home', to: '/' },
          { title: 'PHET Stimulation' },
          { title: 'Stimulation Links' },
        ]}
      />
      <ManagePhETLinks />
    </Box>
  );
};

const ManagePhETLinks = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Sample data structure
  const rows = [
    // { id: 1, name: 'Motion and Forces', link: 'https://phet.colorado.edu/en/simulation/motion' },
  ];

  const filteredRows = rows.filter((row) =>
    row.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const paginatedRows = filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <ParentCard title={<Typography variant="h5">Manage PhET Simulation Links</Typography>}>
      <Box sx={{ p: 0 }}>
        <Box sx={{ mb: 3 }}>
          <TextField
            placeholder="Search by sub-topic"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Paper variant="outlined">
          <TableContainer>
            <Table sx={{ whiteSpace: 'nowrap' }}>
              <TableBody>
                {paginatedRows.length > 0 ? (
                  paginatedRows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell sx={{ fontWeight: '500' }}>{row.name}</TableCell>
                      <TableCell>
                        <a href={row.link} target="_blank" rel="noopener noreferrer">
                          {row.link}
                        </a>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} align="center">
                      <Box
                        sx={{
                          bgcolor: (theme) => theme.palette.info.light,
                          py: 3,
                          px: 2,
                          borderRadius: 1,
                        }}
                      >
                        <Typography variant="body2">No records found</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    colSpan={2}
                    count={filteredRows.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => {
                      setRowsPerPage(parseInt(e.target.value, 10));
                      setPage(0);
                    }}
                  />
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </ParentCard>
  );
};

ManagePhETLinks.propTypes = {
  rows: PropTypes.array,
};

export default StimulationLinks;
