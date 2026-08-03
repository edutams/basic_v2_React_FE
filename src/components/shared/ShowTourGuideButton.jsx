import React from 'react';
import { Button } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useAclTour } from '@/context/AclTourContext';

/**
 * ShowTourGuideButton
 *
 * Replays the current ACL Manager tour. Must be rendered inside an
 * <AclTourProvider> so it can access the tour context.
 */
const ShowTourGuideButton = ({ label = 'Show Tour Guide Again', size = 'small', sx = {}, ...rest }) => {
  const { startTour } = useAclTour();

  return (
    <Button
      variant="outlined"
      size={size}
      startIcon={<HelpOutlineIcon />}
      onClick={startTour}
      sx={{
        textTransform: 'none',
        borderRadius: 2,
        fontWeight: 600,
        whiteSpace: 'nowrap',
        ...sx,
      }}
      {...rest}
    >
      {label}
    </Button>
  );
};

export default ShowTourGuideButton;
