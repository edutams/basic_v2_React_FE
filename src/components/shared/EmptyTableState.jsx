import React from 'react';
import { TableRow, TableCell, Box, Typography, Stack } from '@mui/material';
import { IconDatabaseOff, IconSearch, IconFileX } from '@tabler/icons-react';
import PropTypes from 'prop-types';

const EmptyTableState = ({ 
  colSpan, 
  message = "No data available", 
  description = "There are no records to display at the moment.",
  icon: CustomIcon,
  height = 200,
  showIcon = true,
  type = 'default'
}) => {
  const getIcon = () => {
    if (CustomIcon) return <CustomIcon size={48} />;
    
    switch (type) {
      case 'search':
        return <IconSearch size={48} />;
      case 'filter':
        return <IconFileX size={48} />;
      default:
        return <IconDatabaseOff size={48} />;
    }
  };

  const getDefaultMessage = () => {
    switch (type) {
      case 'search':
        return "No search results found";
      case 'filter':
        return "No data matches your filters";
      default:
        return message;
    }
  };

  const getDefaultDescription = () => {
    switch (type) {
      case 'search':
        return "Try adjusting your search terms or clearing the search to see all data.";
      case 'filter':
        return "Try adjusting your filters or clearing them to see more data.";
      default:
        return description;
    }
  };

  return (
    <TableRow>
      <TableCell colSpan={colSpan}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: height,
            textAlign: 'center',
          }}
        >
          <Stack spacing={2} alignItems="center">
            {showIcon && (
              <Box
                sx={{
                  color: 'text.secondary',
                  opacity: 0.6,
                }}
              >
                {getIcon()}
              </Box>
            )}
            
            <Stack spacing={1} alignItems="center">
              <Typography 
                variant="h6" 
                color="text.secondary"
                fontWeight={500}
              >
                {getDefaultMessage()}
              </Typography>
              
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ maxWidth: 400, opacity: 0.8 }}
              >
                {getDefaultDescription()}
              </Typography>
            </Stack>
          </Stack>
        </Box>
      </TableCell>
    </TableRow>
  );
};

EmptyTableState.propTypes = {
  colSpan: PropTypes.number.isRequired,
  message: PropTypes.string,
  description: PropTypes.string,
  icon: PropTypes.elementType,
  height: PropTypes.number,
  showIcon: PropTypes.bool,
  type: PropTypes.oneOf(['default', 'search', 'filter']),
};

export default EmptyTableState;
