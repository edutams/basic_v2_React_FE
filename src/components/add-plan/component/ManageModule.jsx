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

// Define package levels (similar to agentLevels in PermissionManager)
const packageLevels = [
  {
    value: 'Basic',
    label: 'Basic Package',
    description: 'Basic features for small institutions',
    defaultPermissions: [
      'Dashboard>Chart',
      'Setup>Installation Process',
      'Setup>Academics>School Manager',
      'Setup>Academics>Class Manager',
    ],
  },
  {
    value: 'Standard',
    label: 'Standard Package',
    description: 'Enhanced features for medium-sized institutions',
    defaultPermissions: [
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
    description: 'Full features for large institutions',
    defaultPermissions: [
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

// Flatten combinedPackageTree into permissionCategories format
const permissionCategories = {
  Dashboard: [
    { id: 'Dashboard>Chart', label: 'Chart', description: 'View dashboard charts' },
  ],
  Setup: [
    { id: 'Setup>Installation Process', label: 'Installation Process', description: 'Manage installation settings' },
    { id: 'Setup>Academics>School Manager', label: 'School Manager', description: 'Manage school settings' },
    { id: 'Setup>Academics>Class Manager', label: 'Class Manager', description: 'Manage class settings' },
    { id: 'Setup>Academics>Division/Programme Manager', label: 'Division/Programme Manager', description: 'Manage divisions or programs' },
    { id: 'Setup>Academics>Session/Weeks Manager', label: 'Session/Weeks Manager', description: 'Manage sessions and weeks' },
    { id: 'Setup>Academics>Class Subject Manager', label: 'Class Subject Manager', description: 'Manage class subjects' },
    { id: 'Setup>Academics>Scheme Of Work', label: 'Scheme Of Work', description: 'Manage scheme of work' },
    { id: 'Setup>Subscriptions>Manage Subscriptions', label: 'Manage Subscriptions', description: 'Manage subscription plans' },
    { id: 'Setup>Subscriptions>Transaction History', label: 'Transaction History', description: 'View transaction history' },
    { id: 'Setup>User Management>Staff Manager', label: 'Staff Manager', description: 'Manage staff accounts' },
    { id: 'Setup>User Management>Parents Manager', label: 'Parents Manager', description: 'Manage parent accounts' },
    { id: 'Setup>User Management>Student Manager', label: 'Student Manager', description: 'Manage student accounts' },
    { id: 'Setup>Roles & Permission', label: 'Roles & Permission', description: 'Manage roles and permissions' },
    { id: 'Setup>Allocations>Position Allocation', label: 'Position Allocation', description: 'Manage position allocations' },
    { id: 'Setup>Allocations>Subject-Teacher Allocation', label: 'Subject-Teacher Allocation', description: 'Manage subject-teacher assignments' },
    { id: 'Setup>Allocations>Class-teacher Allocation', label: 'Class-teacher Allocation', description: 'Manage class-teacher assignments' },
    { id: 'Setup>Activity Log', label: 'Activity Log', description: 'View activity logs' },
    { id: 'Setup>Student Registration', label: 'Student Registration', description: 'Manage student registrations' },
  ],
  Bursary: [
    { id: 'Bursary>Setup>Payment Instalment', label: 'Payment Instalment', description: 'Manage payment instalments' },
    { id: 'Bursary>Setup>Payment Name', label: 'Payment Name', description: 'Manage payment names' },
    { id: 'Bursary>Setup>Bursary Settings', label: 'Bursary Settings', description: 'Configure bursary settings' },
    { id: 'Bursary>Setup>Student Payment Category', label: 'Student Payment Category', description: 'Manage student payment categories' },
    { id: 'Bursary>Schedule Fees>Pay Fees', label: 'Pay Fees', description: 'Process fee payments' },
    { id: 'Bursary>Schedule Fees>Pay Cash', label: 'Pay Cash', description: 'Process cash payments' },
    { id: 'Bursary>History', label: 'History', description: 'View payment history' },
    { id: 'Bursary>Report>Payment List', label: 'Payment List', description: 'View payment lists' },
    { id: 'Bursary>Report>Debtors List', label: 'Debtors List', description: 'View debtors list' },
    { id: 'Bursary>Student Account>Class Ledger', label: 'Class Ledger', description: 'Manage class ledgers' },
    { id: 'Bursary>Student Account>Set Schedule', label: 'Set Schedule', description: 'Set payment schedules' },
    { id: 'Bursary>Student Account>Generate Invoice', label: 'Generate Invoice', description: 'Generate invoices' },
    { id: 'Bursary>Student Account>Send Invoice', label: 'Send Invoice', description: 'Send invoices to users' },
    { id: 'Bursary>Student Account>Pay Fees', label: 'Pay Fees', description: 'Process student fee payments' },
    { id: 'Bursary>Student Account>Pay Cash', label: 'Pay Cash', description: 'Process student cash payments' },
    { id: 'Bursary>Student Account>Report', label: 'Report', description: 'Generate student account reports' },
    { id: 'Bursary>Online Transactions>Transaction', label: 'Transaction', description: 'Manage online transactions' },
    { id: 'Bursary>Online Transactions>Revenue', label: 'Revenue', description: 'View revenue reports' },
    { id: 'Bursary>Online Transactions>Settlement', label: 'Settlement', description: 'Manage settlements' },
    { id: 'Bursary>Online Transactions>Reconciliation', label: 'Reconciliation', description: 'Perform reconciliations' },
    { id: 'Bursary>Wallet>Student', label: 'Student Wallet', description: 'Manage student wallets' },
    { id: 'Bursary>Wallet>School', label: 'School Wallet', description: 'Manage school wallets' },
    { id: 'Bursary>Payment History', label: 'Payment History', description: 'View detailed payment history' },
  ],
  Admission: [
    { id: 'Admission>Top>Manage Admission', label: 'Manage Admission', description: 'Manage admission settings' },
    { id: 'Admission>Application Processing', label: 'Application Processing', description: 'Process admission applications' },
    { id: 'Admission>Admission Report', label: 'Admission Report', description: 'Generate admission reports' },
    { id: 'Admission>My Application', label: 'My Application', description: 'View own applications' },
  ],
  'Digital Class': [
    { id: 'Digital Class>Live Class', label: 'Live Class', description: 'Manage live classes' },
    { id: 'Digital Class>Recorded Class', label: 'Recorded Class', description: 'Manage recorded classes' },
    { id: 'Digital Class>Lesson Note', label: 'Lesson Note', description: 'Manage lesson notes' },
  ],
  Forum: [
    { id: 'Forum>Forum', label: 'Forum', description: 'Manage discussion forums' },
  ],
  Attendance: [
    { id: 'Attendance>Take Attendance', label: 'Take Attendance', description: 'Record attendance' },
    { id: 'Attendance>Attendance Report', label: 'Attendance Report', description: 'Generate attendance reports' },
    { id: 'Attendance>Affective & Psychomotor Domains', label: 'Affective & Psychomotor Domains', description: 'Manage affective and psychomotor assessments' },
  ],
  'E-Resources': [
    { id: 'E-Resources>e-Resources', label: 'e-Resources', description: 'Manage e-resources' },
    { id: 'E-Resources>Video Tutorials', label: 'Video Tutorials', description: 'Manage video tutorials' },
    { id: 'E-Resources>Lesson Note (Student)', label: 'Lesson Note (Student)', description: 'Manage student lesson notes' },
    { id: 'E-Resources>Lesson Note (Teacher)', label: 'Lesson Note (Teacher)', description: 'Manage teacher lesson notes' },
  ],
  Messaging: [
    { id: 'Messaging>Manage Messages', label: 'Manage Messages', description: 'Manage messaging system' },
  ],
  'My Wards': [
    { id: 'My Wards>My Wards', label: 'My Wards', description: 'Manage ward information' },
  ],
  Result: [
    { id: 'Result>Setup', label: 'Setup', description: 'Configure result settings' },
    { id: 'Result>Upload Scores', label: 'Upload Scores', description: 'Upload student scores' },
    { id: 'Result>Result Consideration', label: 'Result Consideration', description: 'Manage result considerations' },
    { id: 'Result>Result Edit', label: 'Result Edit', description: 'Edit student results' },
    { id: 'Result>Score Sheet', label: 'Score Sheet', description: 'Generate score sheets' },
    { id: 'Result>Broadsheet', label: 'Broadsheet', description: 'Generate broadsheets' },
    { id: 'Result>Summary Sheet', label: 'Summary Sheet', description: 'Generate summary sheets' },
    { id: 'Result>Continuous Assessment', label: 'Continuous Assessment', description: 'Manage continuous assessments' },
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
    { id: 'OGSERA>Generate LIN', label: 'Generate LIN', description: 'Generate learner identification numbers' },
    { id: 'OGSERA>Sync Registration to OGSERA', label: 'Sync Registration to OGSERA', description: 'Sync registrations to OGSERA' },
    { id: 'OGSERA>Sync Staff to OGSERA', label: 'Sync Staff to OGSERA', description: 'Sync staff to OGSERA' },
    { id: 'OGSERA>Learners Placement', label: 'Learners Placement', description: 'Manage learner placements' },
    { id: 'OGSERA>BECE Result', label: 'BECE Result', description: 'Manage BECE results' },
    { id: 'OGSERA>Subject Mapping', label: 'Subject Mapping', description: 'Manage subject mappings' },
    { id: 'OGSERA>Data Update', label: 'Data Update', description: 'Update OGSERA data' },
    { id: 'OGSERA>Student Transfer', label: 'Student Transfer', description: 'Manage student transfers' },
  ],
};

const ManageModule = ({ selectedPlan, currentPermissions, onSave, onCancel }) => {
  const [selectedPermissions, setSelectedPermissions] = useState(currentPermissions || []);
  const [packageLevel, setPackageLevel] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  const handlePermissionChange = (permissionId, checked) => {
    let newPermissions;
    if (checked) {
      newPermissions = [...selectedPermissions, permissionId];
    } else {
      newPermissions = selectedPermissions.filter((id) => id !== permissionId);
    }
    setSelectedPermissions(newPermissions);
    setHasChanges(true);
  };

  const handleSelectAll = (categoryPermissions) => {
    const categoryIds = categoryPermissions.map((p) => p.id);
    const allSelected = categoryIds.every((id) => selectedPermissions.includes(id));

    let newPermissions;
    if (allSelected) {
      newPermissions = selectedPermissions.filter((id) => !categoryIds.includes(id));
    } else {
      const toAdd = categoryIds.filter((id) => !selectedPermissions.includes(id));
      newPermissions = [...selectedPermissions, ...toAdd];
    }
    setSelectedPermissions(newPermissions);
    setHasChanges(true);
  };

  const handlePackageLevelChange = (newLevel) => {
    setPackageLevel(newLevel);
    const levelConfig = packageLevels.find((level) => level.value === newLevel);
    if (levelConfig) {
      setSelectedPermissions(levelConfig.defaultPermissions);
    }
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave(selectedPermissions);
  };

  const getPermissionCount = (categoryPermissions) => {
    const categoryIds = categoryPermissions.map((p) => p.id);
    return selectedPermissions.filter((id) => categoryIds.includes(id)).length;
  };

  return (
    <Box>
      <Typography variant="h6" mb={2}>
        Manage Packages for {selectedPlan?.name || 'Selected Plan'}
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Select the package level and features you want to include in this plan. Changes will take
        effect immediately after saving.
      </Alert>

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }} fullWidth>
        <Typography variant="h6" color="primary" mb={2}>
          Package Level
        </Typography>

        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Package Level</InputLabel>
              <Select
                value={packageLevel}
                label="Package Level"
                onChange={(e) => handlePackageLevelChange(e.target.value)}
              >
                <MenuItem value="">-- Select Level --</MenuItem>
                {packageLevels.map((level) => (
                  <MenuItem key={level.value} value={level.value}>
                    {level.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            {packageLevel && (
              <Box>
                <Typography variant="body2" fontWeight="medium" color="primary">
                  {packageLevels.find((l) => l.value === packageLevel)?.label}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {packageLevels.find((l) => l.value === packageLevel)?.description}
                </Typography>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Default features:{' '}
                  {packageLevels.find((l) => l.value === packageLevel)?.defaultPermissions.length}{' '}
                  selected
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" color="primary" mb={3}>
          Custom Feature Settings
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            justifyContent: 'space-between',
          }}
        >
          {Object.entries(permissionCategories).map(([category, permissions]) => {
            const selectedCount = getPermissionCount(permissions);
            const allSelected = selectedCount === permissions.length;

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
                      label={`${selectedCount}/${permissions.length}`}
                      size="small"
                      color={selectedCount > 0 ? 'primary' : 'default'}
                    />
                  </Box>
                  <Button
                    size="small"
                    onClick={() => handleSelectAll(permissions)}
                    color="primary"
                    sx={{ minWidth: 120 }}
                  >
                    {allSelected ? 'Deselect All' : 'Select All'}
                  </Button>
                </Box>

                <Box sx={{ p: 2 }}>
                  {permissions.map((permission, index) => (
                    <Box
                      key={permission.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        p: 1.5,
                        mb: index < permissions.length - 1 ? 1 : 0,
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: selectedPermissions.includes(permission.id)
                          ? 'primary.main'
                          : 'grey.300',
                        bgcolor: selectedPermissions.includes(permission.id)
                          ? 'primary.light'
                          : 'background.paper',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          borderColor: 'primary.main',
                          bgcolor: selectedPermissions.includes(permission.id)
                            ? 'primary.light'
                            : 'primary.light',
                          opacity: selectedPermissions.includes(permission.id) ? 1 : 0.8,
                        },
                      }}
                      onClick={() =>
                        handlePermissionChange(
                          permission.id,
                          !selectedPermissions.includes(permission.id)
                        )
                      }
                    >
                      <Checkbox
                        checked={selectedPermissions.includes(permission.id)}
                        onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                        color="primary"
                        size="small"
                        sx={{ mt: -0.5 }}
                      />
                      <Box sx={{ ml: 1, flex: 1 }}>
                        <Typography
                          variant="body2"
                          fontWeight="medium"
                          color={
                            selectedPermissions.includes(permission.id)
                              ? 'primary.dark'
                              : 'text.primary'
                          }
                          sx={{ mb: 0.5 }}
                        >
                          {permission.label}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'block', lineHeight: 1.3 }}
                        >
                          {permission.description}
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
            Total features selected: <strong>{selectedPermissions.length}</strong>
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