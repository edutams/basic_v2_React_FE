import React, { useState } from 'react';
import {
  Box,
  Typography,
  Checkbox,
  Button,
  Paper,
  Chip,
  Alert,
  Select,
  MenuItem,
  InputLabel,
  Grid,
  FormControl,
} from '@mui/material';

// Define package levels
const packageLevels = [
  {
    value: 'Basic',
    label: 'Basic Package',
    description: 'Basic modules for small institutions',
    defaultModules: [
      'Dashboard>Chart',
      'Setup>Installation Process',
      'Setup>Academics>School Manager',
      'Setup>Academics>Class Manager',
    ],
  },
  {
    value: 'Standard',
    label: 'Standard Package',
    description: 'Enhanced modules for medium-sized institutions',
    defaultModules: [
      'Dashboard>Chart',
      'Setup>Installation Process',
      'Setup>Academics>School Manager',
      'Setup>Academics>Class Manager',
      'Setup>Academics>Division/Programme Manager',
      'Setup>Academics>Session/Weeks Manager',
      'Setup>Subscriptions>Manage Subscriptions',
      'Setup>User Management>Student Manager',
    ],
  },
  {
    value: 'Premium',
    label: 'Premium Package',
    description: 'Full modules for large institutions',
    defaultModules: [
      'Dashboard>Chart',
      'Setup>Installation Process',
      'Setup>Academics>School Manager',
      'Setup>Academics>Class Manager',
      'Setup>Academics>Division/Programme Manager',
      'Setup>Academics>Session/Weeks Manager',
      'Setup>Academics>Class Subject Manager',
      'Setup>Academics>Scheme Of Work',
      'Setup>Subscriptions>Manage Subscriptions',
      'Setup>Subscriptions>Transaction History',
      'Setup>User Management>Staff Manager',
      'Setup>User Management>Parents Manager',
      'Setup>User Management>Student Manager',
      'Setup>Roles & Permission',
      'Setup>Activity Log',
      'Setup>Student Registration',
      'Bursary>Setup>Payment Instalment',
      'Bursary>Setup>Payment Name',
      'Bursary>Schedule Fees>Pay Fees',
      'Bursary>History',
    ],
  },
];

// Define module categories
const moduleCategories = {
  Dashboard: [{ id: 'Dashboard>Chart', label: 'Chart', description: 'View dashboard charts' }],
  Setup: [
    {
      id: 'Setup>Installation Process',
      label: 'Installation Process',
      description: 'Manage installation settings',
    },
    {
      id: 'Setup>Academics>School Manager',
      label: 'School Manager',
      description: 'Manage school settings',
    },
    {
      id: 'Setup>Academics>Class Manager',
      label: 'Class Manager',
      description: 'Manage class settings',
    },
    {
      id: 'Setup>Academics>Division/Programme Manager',
      label: 'Division/Programme Manager',
      description: 'Manage divisions or programs',
    },
    {
      id: 'Setup>Academics>Session/Weeks Manager',
      label: 'Session/Weeks Manager',
      description: 'Manage sessions and weeks',
    },
    {
      id: 'Setup>Academics>Class Subject Manager',
      label: 'Class Subject Manager',
      description: 'Manage class subjects',
    },
    {
      id: 'Setup>Academics>Scheme Of Work',
      label: 'Scheme Of Work',
      description: 'Manage scheme of work',
    },
    {
      id: 'Setup>Subscriptions>Manage Subscriptions',
      label: 'Manage Subscriptions',
      description: 'Manage subscription plans',
    },
    {
      id: 'Setup>Subscriptions>Transaction History',
      label: 'Transaction History',
      description: 'View transaction history',
    },
    {
      id: 'Setup>User Management>Staff Manager',
      label: 'Staff Manager',
      description: 'Manage staff accounts',
    },
    {
      id: 'Setup>User Management>Parents Manager',
      label: 'Parents Manager',
      description: 'Manage parent accounts',
    },
    {
      id: 'Setup>User Management>Student Manager',
      label: 'Student Manager',
      description: 'Manage student accounts',
    },
    {
      id: 'Setup>Roles & Permission',
      label: 'Roles & Permission',
      description: 'Manage roles and permissions',
    },
    {
      id: 'Setup>Allocations>Position Allocation',
      label: 'Position Allocation',
      description: 'Manage position allocations',
    },
    {
      id: 'Setup>Allocations>Subject-Teacher Allocation',
      label: 'Subject-Teacher Allocation',
      description: 'Manage subject-teacher assignments',
    },
    {
      id: 'Setup>Allocations>Class-teacher Allocation',
      label: 'Class-teacher Allocation',
      description: 'Manage class-teacher assignments',
    },
    { id: 'Setup>Activity Log', label: 'Activity Log', description: 'View activity logs' },
    {
      id: 'Setup>Student Registration',
      label: 'Student Registration',
      description: 'Manage student registrations',
    },
  ],
  Bursary: [
    {
      id: 'Bursary>Setup>Payment Instalment',
      label: 'Payment Instalment',
      description: 'Manage payment instalments',
    },
    {
      id: 'Bursary>Setup>Payment Name',
      label: 'Payment Name',
      description: 'Manage payment names',
    },
    {
      id: 'Bursary>Setup>Bursary Settings',
      label: 'Bursary Settings',
      description: 'Configure bursary settings',
    },
    {
      id: 'Bursary>Setup>Student Payment Category',
      label: 'Student Payment Category',
      description: 'Manage student payment categories',
    },
    {
      id: 'Bursary>Schedule Fees>Pay Fees',
      label: 'Pay Fees',
      description: 'Process fee payments',
    },
    {
      id: 'Bursary>Schedule Fees>Pay Cash',
      label: 'Pay Cash',
      description: 'Process cash payments',
    },
    { id: 'Bursary>History', label: 'History', description: 'View payment history' },
    { id: 'Bursary>Report>Payment List', label: 'Payment List', description: 'View payment lists' },
    { id: 'Bursary>Report>Debtors List', label: 'Debtors List', description: 'View debtors list' },
    {
      id: 'Bursary>Student Account>Class Ledger',
      label: 'Class Ledger',
      description: 'Manage class ledgers',
    },
    {
      id: 'Bursary>Student Account>Set Schedule',
      label: 'Set Schedule',
      description: 'Set payment schedules',
    },
    {
      id: 'Bursary>Student Account>Generate Invoice',
      label: 'Generate Invoice',
      description: 'Generate invoices',
    },
    {
      id: 'Bursary>Student Account>Send Invoice',
      label: 'Send Invoice',
      description: 'Send invoices to users',
    },
    {
      id: 'Bursary>Student Account>Pay Fees',
      label: 'Pay Fees',
      description: 'Process student fee payments',
    },
    {
      id: 'Bursary>Student Account>Pay Cash',
      label: 'Pay Cash',
      description: 'Process student cash payments',
    },
    {
      id: 'Bursary>Student Account>Report',
      label: 'Report',
      description: 'Generate student account reports',
    },
    {
      id: 'Bursary>Online Transactions>Transaction',
      label: 'Transaction',
      description: 'Manage online transactions',
    },
    {
      id: 'Bursary>Online Transactions>Revenue',
      label: 'Revenue',
      description: 'View revenue reports',
    },
    {
      id: 'Bursary>Online Transactions>Settlement',
      label: 'Settlement',
      description: 'Manage settlements',
    },
    {
      id: 'Bursary>Online Transactions>Reconciliation',
      label: 'Reconciliation',
      description: 'Perform reconciliations',
    },
    {
      id: 'Bursary>Wallet>Student',
      label: 'Student Wallet',
      description: 'Manage student wallets',
    },
    { id: 'Bursary>Wallet>School', label: 'School Wallet', description: 'Manage school wallets' },
    {
      id: 'Bursary>Payment History',
      label: 'Payment History',
      description: 'View detailed payment history',
    },
  ],
  Admission: [
    {
      id: 'Admission>Setup>Manage Admission',
      label: 'Manage Admission',
      description: 'Manage admission settings',
    },
    {
      id: 'Admission>Application Processing',
      label: 'Application Processing',
      description: 'Process admission applications',
    },
    {
      id: 'Admission>Admission Report',
      label: 'Admission Report',
      description: 'Generate admission reports',
    },
    {
      id: 'Admission>My Application',
      label: 'My Application',
      description: 'View own applications',
    },
  ],
  'Digital Class': [
    { id: 'Digital Class>Live Class', label: 'Live Class', description: 'Manage live classes' },
    {
      id: 'Digital Class>Recorded Class',
      label: 'Recorded Class',
      description: 'Manage recorded classes',
    },
    { id: 'Digital Class>Lesson Note', label: 'Lesson Note', description: 'Manage lesson notes' },
  ],
  Forum: [{ id: 'Forum>Forum', label: 'Forum', description: 'Manage discussion forums' }],
  Attendance: [
    {
      id: 'Attendance>Take Attendance',
      label: 'Take Attendance',
      description: 'Record attendance',
    },
    {
      id: 'Attendance>Attendance Report',
      label: 'Attendance Report',
      description: 'Generate attendance reports',
    },
    {
      id: 'Attendance>Affective & Psychomotor Domains',
      label: 'Affective & Psychomotor Domains',
      description: 'Manage affective and psychomotor assessments',
    },
  ],
  'E-Resources': [
    { id: 'E-Resources>e-Resources', label: 'e-Resources', description: 'Manage e-resources' },
    {
      id: 'E-Resources>Video Tutorials',
      label: 'Video Tutorials',
      description: 'Manage video tutorials',
    },
    {
      id: 'E-Resources>Lesson Note (Student)',
      label: 'Lesson Note (Student)',
      description: 'Manage student lesson notes',
    },
    {
      id: 'E-Resources>Lesson Note (Teacher)',
      label: 'Lesson Note (Teacher)',
      description: 'Manage teacher lesson notes',
    },
  ],
  Messaging: [
    {
      id: 'Messaging>Manage Messages',
      label: 'Manage Messages',
      description: 'Manage messaging system',
    },
  ],
  'My Wards': [
    { id: 'My Wards>My Wards', label: 'My Wards', description: 'Manage ward information' },
  ],
  Result: [
    { id: 'Result>Setup', label: 'Setup', description: 'Configure result settings' },
    { id: 'Result>Upload Scores', label: 'Upload Scores', description: 'Upload student scores' },
    {
      id: 'Result>Result Consideration',
      label: 'Result Consideration',
      description: 'Manage result considerations',
    },
    { id: 'Result>Result Edit', label: 'Result Edit', description: 'Edit student results' },
    { id: 'Result>Score Sheet', label: 'Score Sheet', description: 'Generate score sheets' },
    { id: 'Result>Broadsheet', label: 'Broadsheet', description: 'Generate broadsheets' },
    { id: 'Result>Summary Sheet', label: 'Summary Sheet', description: 'Generate summary sheets' },
    {
      id: 'Result>Continuous Assessment',
      label: 'Continuous Assessment',
      description: 'Manage continuous assessments',
    },
    { id: 'Result>Report Card', label: 'Report Card', description: 'Generate report cards' },
    { id: 'Result>Report Sheet', label: 'Report Sheet', description: 'Generate report sheets' },
    { id: 'Result>Comment Bank', label: 'Comment Bank', description: 'Manage comment banks' },
  ],
  Quiz: [
    { id: 'Quiz>Setup', label: 'Setup', description: 'Configure quiz settings' },
    { id: 'Quiz>Quiz Bank', label: 'Quiz Bank', description: 'Manage quiz banks' },
    { id: 'Quiz>My Quiz', label: 'My Quiz', description: 'Manage personal quizzes' },
    { id: 'Quiz>Quiz Report', label: 'Quiz Report', description: 'Generate quiz reports' },
  ],
  Homework: [
    { id: 'Homework>Setup', label: 'Setup', description: 'Configure homework settings' },
    { id: 'Homework>Question Bank', label: 'Question Bank', description: 'Manage question banks' },
    { id: 'Homework>My Homework', label: 'My Homework', description: 'Manage personal homework' },
  ],
  OGSERA: [
    {
      id: 'OGSERA>Generate LIN',
      label: 'Generate LIN',
      description: 'Generate learner identification numbers',
    },
    {
      id: 'OGSERA>Sync Registration to OGSERA',
      label: 'Sync Registration to OGSERA',
      description: 'Sync registrations to OGSERA',
    },
    {
      id: 'OGSERA>Sync Staff to OGSERA',
      label: 'Sync Staff to OGSERA',
      description: 'Sync staff to OGSERA',
    },
    {
      id: 'OGSERA>Learners Placement',
      label: 'Learners Placement',
      description: 'Manage learner placements',
    },
    { id: 'OGSERA>BECE Result', label: 'BECE Result', description: 'Manage BECE results' },
    {
      id: 'OGSERA>Subject Mapping',
      label: 'Subject Mapping',
      description: 'Manage subject mappings',
    },
    { id: 'OGSERA>Data Update', label: 'Data Update', description: 'Update OGSERA data' },
    {
      id: 'OGSERA>Student Transfer',
      label: 'Student Transfer',
      description: 'Manage student transfers',
    },
  ],
};

const ManageModule = ({ selectedPlan, currentPermissions, onSave, onCancel }) => {
  const [selectedModules, setSelectedModules] = useState(currentPermissions || []);
  const [packageLevel, setPackageLevel] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  const handleModuleChange = (moduleId, checked) => {
    let newModules;
    if (checked) {
      newModules = [...selectedModules, moduleId];
    } else {
      newModules = selectedModules.filter((id) => id !== moduleId);
    }
    setSelectedModules(newModules);
    setHasChanges(true);
  };

  const handleSelectAll = (categoryModules) => {
    const categoryIds = categoryModules.map((m) => m.id);
    const allSelected = categoryIds.every((id) => selectedModules.includes(id));

    let newModules;
    if (allSelected) {
      newModules = selectedModules.filter((id) => !categoryIds.includes(id));
    } else {
      const toAdd = categoryIds.filter((id) => !selectedModules.includes(id));
      newModules = [...selectedModules, ...toAdd];
    }
    setSelectedModules(newModules);
    setHasChanges(true);
  };

  const handlePackageLevelChange = (newLevel) => {
    setPackageLevel(newLevel);
    const levelConfig = packageLevels.find((level) => level.value === newLevel);
    if (levelConfig) {
      setSelectedModules(levelConfig.defaultModules);
    }
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave(selectedModules);
  };

  const getModuleCount = (categoryModules) => {
    const categoryIds = categoryModules.map((m) => m.id);
    return selectedModules.filter((id) => categoryIds.includes(id)).length;
  };

  return (
    <Box>
      <Typography variant="h6" mb={2}>
        Manage Modules for {selectedPlan?.name || 'Selected Plan'}
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Select the package level and modules you want to include in this plan. Changes will take
        effect immediately after saving.
      </Alert>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" color="primary" mb={3}>
          Custom Module Settings
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            justifyContent: 'space-between',
          }}
        >
          {Object.entries(moduleCategories).map(([category, modules]) => {
            const selectedCount = getModuleCount(modules);
            const allSelected = selectedCount === modules.length;
            // Always use scrollable area with fixed height for all categories
            const fixedHeight = 180; // px, adjust if needed for 3 modules

            return (
              <Paper
                key={category}
                sx={{
                  mb: 2,
                  overflow: 'hidden',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    boxShadow: 2,
                    borderColor: 'primary.light',
                  },
                  flex: '1 1 calc(50% - 8px)',
                  minWidth: 0,
                }}
              >
                <Box
                  sx={{
                    p: 2,
                    bgcolor: 'primary.light',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Box display="flex" alignItems="center" gap={2}>
                    <Typography
                      variant="h6"
                      color={selectedCount > 0 ? 'primary.dark' : 'text.primary'}
                    >
                      {category}
                    </Typography>
                    <Chip
                      label={`${selectedCount}/${modules.length}`}
                      size="small"
                      color={selectedCount > 0 ? 'primary' : 'default'}
                    />
                  </Box>
                  <Button
                    size="small"
                    onClick={() => handleSelectAll(modules)}
                    color="primary"
                    sx={{ minWidth: 120 }}
                  >
                    {allSelected ? 'Deselect All' : 'Select All'}
                  </Button>
                </Box>

                <Box
                  sx={{
                    p: 2,
                    maxHeight: `${fixedHeight}px`,
                    minHeight: `${fixedHeight}px`,
                    overflowY: 'auto',
                    '&::-webkit-scrollbar': {
                      width: '6px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: 'grey.100',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: 'primary.main',
                      borderRadius: '3px',
                    },
                    '&::-webkit-scrollbar-thumb:hover': {
                      background: 'primary.dark',
                    },
                  }}
                >
                  {modules.map((module, index) => (
                    <Box
                      key={module.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        p: 1.5,
                        mb: index < modules.length - 1 ? 1 : 0,
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: selectedModules.includes(module.id)
                          ? 'primary.main'
                          : 'grey.300',
                        bgcolor: selectedModules.includes(module.id)
                          ? 'primary.light'
                          : 'background.paper',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          borderColor: 'primary.main',
                          bgcolor: selectedModules.includes(module.id)
                            ? 'primary.light'
                            : 'primary.light',
                          opacity: selectedModules.includes(module.id) ? 1 : 0.8,
                        },
                      }}
                      onClick={() =>
                        handleModuleChange(module.id, !selectedModules.includes(module.id))
                      }
                    >
                      <Checkbox
                        checked={selectedModules.includes(module.id)}
                        onChange={(e) => handleModuleChange(module.id, e.target.checked)}
                        color="primary"
                        size="small"
                        sx={{ mt: -0.5 }}
                      />
                      <Box sx={{ ml: 1, flex: 1 }}>
                        <Typography
                          variant="body2"
                          fontWeight="medium"
                          color={
                            selectedModules.includes(module.id) ? 'primary.dark' : 'text.primary'
                          }
                          sx={{ mb: 0.5 }}
                        >
                          {module.label}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'block', lineHeight: 1.3 }}
                        >
                          {module.description}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Paper>
            );
          })}
        </Box>
      </Box>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="body2" color="textSecondary">
            Package Level: <strong>{packageLevel || 'Not selected'}</strong>
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Total modules selected: <strong>{selectedModules.length}</strong>
          </Typography>
        </Box>

        <Box display="flex" gap={2}>
          <Button onClick={onCancel} color="inherit">
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSave} disabled={!hasChanges}>
            Save Changes
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ManageModule;
