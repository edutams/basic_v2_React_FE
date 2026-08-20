import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Card, CardHeader, CardContent, Box } from '@mui/material';
import { CustomizerContext } from 'src/context/CustomizerContext';

const ParentCard = ({ title, children, footer, codeModel, sx }) => {
  const { isCardShadow } = useContext(CustomizerContext);

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: 0,
        borderRadius: '16px',
        border: (theme) =>
          theme.palette.mode === 'dark'
            ? '2px solid rgba(91, 38, 38, 0.08)'
            : `2px solid ${theme.palette.grey[100]}`,
        boxShadow: (theme) =>
          theme.palette.mode === 'dark'
            ? '0 6px 24px rgba(0, 0, 0, 0.28)'
            : '0 4px 20px rgba(0, 0, 0, 0.07)',
        ...sx,
      }}
    >
      <CardHeader title={title} action={codeModel} sx={{ py: 1 }} />

      <CardContent sx={{ p: 2, pt: 1 }}>{children}</CardContent>
      {footer ? <Box p={3}>{footer}</Box> : ''}
    </Card>
  );
};

ParentCard.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
  codeModel: PropTypes.node,
  footer: PropTypes.node,
  sx: PropTypes.object,
};

export default ParentCard;
