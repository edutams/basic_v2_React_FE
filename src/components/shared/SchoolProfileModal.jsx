import React from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Typography, Grid, Box, Chip, Divider, Avatar
} from '@mui/material';

const SchoolProfileModal = ({ open, onClose, school }) => {
    if (!school) return null;

    const field = (label, value) => (
        <Box mb={2}>
            <Typography variant="caption" color="textSecondary" fontWeight={600}>{label}</Typography>
            <Typography variant="body2" fontWeight={500}>{value || '—'}</Typography>
        </Box>
    );

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
                School Profile
                <Chip
                    size="small"
                    label={school.status || 'Active'}
                    sx={{ ml: 2, textTransform: 'capitalize', fontWeight: 600 }}
                    color={school.status === 'active' || school.status === 'Active' ? 'success' : 'default'}
                />
            </DialogTitle>
            <Divider />
            <DialogContent>
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                    <Avatar 
                        src={school.schoolImage || ''} 
                        sx={{ width: 64, height: 64, bgcolor: '#3949ab' }}
                    >
                        {(school.school || school.institutionName || 'S')[0]}
                    </Avatar>
                    <Box>
                        <Typography variant="h6" fontWeight={700}>
                            {school.school || school.institutionName || 'Unknown School'}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            {school.schoolUrl || school.website || 'No website available'}
                        </Typography>
                    </Box>
                </Box>
                
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        {field('Contact Email', school.email || school.contactEmail)}
                        {field('Contact Phone', school.contact || school.contactPhone)}
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        {field('Agent Name', school.agent)}
                        {field('Agent Details', school.agentEmail || school.agentContact ? `${school.agentEmail || ''} / ${school.agentContact || ''}` : '—')}
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        {field('Subscription Plan', school.plan || 'Standard')}
                        {field('Population', school.population || 'N/A')}
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        {field('Created On', school.created_at ? new Date(school.created_at).toLocaleDateString() : 'N/A')}
                    </Grid>
                </Grid>
            </DialogContent>
            <Divider />
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} variant="outlined" color="primary">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default SchoolProfileModal;
