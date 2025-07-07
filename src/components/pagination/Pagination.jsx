import React, { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';

const Pagination = ({ totalItems, itemsPerPage }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  return (
    <Box display="flex" gap={1} mt={4}>
      <Button
        variant="contained"
        onClick={handlePrevious}
        disabled={currentPage === 1}
      >
        Previous
      </Button>

      <Typography variant="body1">
        Page {currentPage} of {totalPages}
      </Typography>

      <Button
        variant="contained"
        onClick={handleNext}
        disabled={currentPage === totalPages}
      >
        Next
      </Button>
    </Box>
  );
};

export default Pagination;
