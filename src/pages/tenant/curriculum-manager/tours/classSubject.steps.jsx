import React from 'react';
import { Box, Typography } from '@mui/material';
import { CURRICULUM_TOUR_KEYS } from '../constants/tourKeys';

export const classSubjectSteps = [
  {
    selector: `[data-tour="${CURRICULUM_TOUR_KEYS.TAB_CLASS_SUBJECT}"]`,
    content: (
      <Box sx={{ p: 0.5 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 0.75, color: 'primary.main' }}>
          3. Class Subject 🏫
        </Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.6 }}>
          Assign subjects directly to specific class arms and manage teacher allocations.
        </Typography>
      </Box>
    ),
  },
  {
    selector: `[data-tour="${CURRICULUM_TOUR_KEYS.PROGRAMME_SELECT}"]`,
    content: (
      <Box sx={{ p: 0.5 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 0.75, color: 'primary.main' }}>
          1. Select Programme 🎯
        </Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.6 }}>
          Select an academic programme from this dropdown to load its associated class arms.
        </Typography>
      </Box>
    ),
  },
  {
    selector: `[data-tour="${CURRICULUM_TOUR_KEYS.CLASS_LIST}"]`,
    content: (
      <Box sx={{ p: 0.5 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 0.75, color: 'primary.main' }}>
          2. Choose Class Level 🏫
        </Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.6 }}>
          Select a class level radio button from this list to inspect or assign subjects to that specific class.
        </Typography>
      </Box>
    ),
  },
  {
    selector: `[data-tour="${CURRICULUM_TOUR_KEYS.ADD_CLASS_SUBJECT_BTN}"]`,
    content: (
      <Box sx={{ p: 0.5 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 0.75, color: 'primary.main' }}>
          3. Add Subject to Class ➕
        </Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.6 }}>
          Click <b>Add Subject to Class</b> (select a class level from the left panel to enable this button) to assign new subjects to the class arm.
        </Typography>
      </Box>
    ),
  },
  {
    selector: `[data-tour="${CURRICULUM_TOUR_KEYS.CLASS_SUBJECT_ACTION_HEADER}"]`,
    content: (
      <Box sx={{ p: 0.5 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 0.75, color: 'primary.main' }}>
          4. Manage Class Subjects ✏️🗑️
        </Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.6 }}>
          Every class subject row has an <b>Action</b> column. After subjects are added, use the 3-dot menu in this column to edit pass mark/units or unassign a subject.
        </Typography>
      </Box>
    ),
  },
];
