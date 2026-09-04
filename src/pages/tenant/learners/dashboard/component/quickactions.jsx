import React from 'react';
import { Box, Button } from '@mui/material';

const actions = [
  { id: 'timetable', label: 'View Timetable', color: '#2563EB', bg: '#EFF6FF' },
  { id: 'notes', label: 'Download Notes', color: '#059669', bg: '#ECFDF5' },
  { id: 'ask', label: 'Ask Question', color: '#D97706', bg: '#FEF3C7' },
  { id: 'library', label: 'Library', color: '#7C3AED', bg: '#F5F3FF' },
  { id: 'achievements', label: 'My Achievements', color: '#E11D48', bg: '#FFF1F2' },
  { id: 'contact', label: 'Contact Teacher', color: '#0891B2', bg: '#ECFEFF' },
];

const QuickActions = () => {
  return (
    <Box
      sx={{
        bgcolor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
        px: 1.5,
        py: 1,
        boxShadow: '0 2px 4px rgba(15, 23, 42, 0.04)',
      }}
    >
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {actions.map((item) => (
          <Button
            key={item.id}
            variant="contained"
            disableElevation
            sx={{
              borderRadius: '8px',
              px: 1.6,
              py: 0.65,
              fontSize: '10px',
              fontWeight: 700,
              textTransform: 'none',
              bgcolor: item.bg,
              color: item.color,
              border: '1px solid transparent',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              transition: 'all 0.18s ease',
              '&:hover': {
                bgcolor: item.color,
                color: '#ffffff',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.12)',
              },
            }}
          >
            {item.label}
          </Button>
        ))}
      </Box>
    </Box>
  );
};

export default QuickActions;
