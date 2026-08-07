import React from 'react';
import { Box, Typography } from '@mui/material';
import { CURRICULUM_TOUR_KEYS } from '../constants/tourKeys';

export const curriculumSetupSteps = [
  {
    selector: `[data-tour="${CURRICULUM_TOUR_KEYS.TAB_SETUP}"]`,
    content: (
      <Box sx={{ p: 0.5 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 0.75, color: 'primary.main' }}>
          1. Curriculum Setup ⚙️
        </Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.6 }}>
          Welcome to Curriculum Setup! Configure your school's active curriculums and map them to class levels.
        </Typography>
      </Box>
    ),
  },
  {
    selector: `[data-tour="${CURRICULUM_TOUR_KEYS.IMPORT_BTN}"]`,
    content: (
      <Box sx={{ p: 0.5 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 0.75, color: 'primary.main' }}>
          Import Curriculums 📥
        </Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.6 }}>
          Click <b>Import</b> to pull pre-built national curriculums directly into your school.
        </Typography>
      </Box>
    ),
  },
  {
    selector: `[data-tour="${CURRICULUM_TOUR_KEYS.CREATE_BTN}"]`,
    content: (
      <Box sx={{ p: 0.5 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 0.75, color: 'primary.main' }}>
          Create Custom Curriculum ➕
        </Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.6 }}>
          Click <b>Create Curriculum</b> to build a brand-new custom curriculum tailored to your School.
        </Typography>
      </Box>
    ),
  },
  {
    selector: `[data-tour="${CURRICULUM_TOUR_KEYS.ACTION_HEADER}"]`,
    content: (
      <Box sx={{ p: 0.5 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 0.75, color: 'primary.main' }}>
          Edit & Delete Curriculums ✏️🗑️
        </Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.6 }}>
          Every curriculum row has an <b>Actions</b> column. Use the 3-dot menu in this column to edit curriculum details or remove custom curriculums.
        </Typography>
      </Box>
    ),
  },
  {
    selector: `[data-tour="${CURRICULUM_TOUR_KEYS.ASSIGN_SELECT}"]`,
    content: (
      <Box sx={{ p: 0.5 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 0.75, color: 'primary.main' }}>
          Assign Classes to Curriculum 🏫
        </Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.6 }}>
          Select the active Academic Session, then map each class level to its active curriculum.
        </Typography>
      </Box>
    ),
  },
  {
    selector: `[data-tour="${CURRICULUM_TOUR_KEYS.UPDATE_BTN}"]`,
    content: (
      <Box sx={{ p: 0.5 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 0.75, color: 'primary.main' }}>
          Save Class Assignments 💾
        </Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.6 }}>
          Click <b>Update</b> to save your class-to-curriculum mappings for the chosen session and term.
        </Typography>
      </Box>
    ),
  },
];
