import React from 'react';
import { Box, Typography } from '@mui/material';
import { CURRICULUM_TOUR_KEYS } from '../constants/tourKeys';

export const subjectBankSteps = [
  {
    selector: `[data-tour="${CURRICULUM_TOUR_KEYS.TAB_SUBJECT_BANK}"]`,
    content: (
      <Box sx={{ p: 0.5 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 0.75, color: 'primary.main' }}>
          2. Subject Bank 📚
        </Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.6 }}>
          Manage all subjects and subject groups offered under each active curriculum.
        </Typography>
      </Box>
    ),
  },
  {
    selector: `[data-tour="${CURRICULUM_TOUR_KEYS.SELECT_CURRICULUM_RADIO}"]`,
    content: (
      <Box sx={{ p: 0.5 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 0.75, color: 'primary.main' }}>
          Select Curriculum 👈
        </Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.6 }}>
          Click the radio button next to any curriculum in this list to inspect its subjects and groups.
        </Typography>
      </Box>
    ),
  },
  {
    selector: `[data-tour="${CURRICULUM_TOUR_KEYS.ADD_SUBJECT_BTN}"]`,
    content: (
      <Box sx={{ p: 0.5 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 0.75, color: 'primary.main' }}>
          Add New Subject
        </Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.6 }}>
          Click <b>Add Subject</b> to create new subjects with subject codes, pass marks, credit units, and status.
        </Typography>
      </Box>
    ),
  },
  // {
  //   selector: `[data-tour="${CURRICULUM_TOUR_KEYS.SUBJECT_ACTION_HEADER}"]`,
  //   content: (
  //     <Box sx={{ p: 0.5 }}>
  //       <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 0.75, color: 'primary.main' }}>
  //         Edit & Delete Subjects ✏️🗑️
  //       </Typography>
  //       <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.6 }}>
  //         Every subject row has an <b>Actions</b> column. Use the 3-dot menu in this column to edit subject settings or remove it from the bank.
  //       </Typography>
  //     </Box>
  //   ),
  // },
  {
    selector: `[data-tour="${CURRICULUM_TOUR_KEYS.CREATE_GROUP_BTN}"]`,
    content: (
      <Box sx={{ p: 0.5 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 0.75, color: 'primary.main' }}>
          Create Subject Group 📦
        </Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.6 }}>
          Click <b>Create Group</b> to bundle multiple subjects (e.g. Sciences, Trade Subjects) with combined pass marks.
        </Typography>
      </Box>
    ),
  },
  // {
  //   selector: `[data-tour="${CURRICULUM_TOUR_KEYS.GROUP_ACTION_HEADER}"]`,
  //   content: (
  //     <Box sx={{ p: 0.5 }}>
  //       <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 0.75, color: 'primary.main' }}>
  //         Subject Group Actions 🛠️
  //       </Typography>
  //       <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.6 }}>
  //         Every subject group row has an <b>Action</b> column. Use the action menu in this column to edit group details or update subject memberships.
  //       </Typography>
  //     </Box>
  //   ),
  // },
];
