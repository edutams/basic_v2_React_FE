
import React from 'react';
import {
    Box,
    Typography,
    TextField,
    InputAdornment,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Stack
} from '@mui/material';
import StandardModal from 'src/components/shared/StandardModal';
import PrimaryButton from 'src/components/shared/PrimaryButton';
import { IconSettings, IconExchange } from '@tabler/icons-react';

export const SetCommissionModal = ({ open, onClose, agent }) => {
    return (
        <StandardModal
            open={open}
            onClose={onClose}
            title={`Set Commission for ${agent?.agentName || 'Agent'}`}
            icon={IconSettings}
            maxWidth="sm"
            actions={
                <Stack direction="row" spacing={2} justifyContent="flex-end" width="100%">
                    <PrimaryButton variant="secondary" onClick={onClose}>Cancel</PrimaryButton>
                    <PrimaryButton variant="primary" onClick={onClose}>Save</PrimaryButton>
                </Stack>
            }
        >
            <Box sx={{ bgcolor: '#E0F2FE', p: 2, borderRadius: 2, mb: 3 }}>
                <Typography variant="body2" color="#0369A1">
                    For every school you or agent(s) under you register, you are allotted 100% as commission. 
                    Whatever percentage you set as commission for the agent(s) under you, will be deducted 
                    from the total percentage allotted to you.
                </Typography>
            </Box>

            <TextField
                margin="normal"
                fullWidth
                label="Referrer Name"
                value="EduTAMS"
                InputProps={{ readOnly: true }}
            />
            <TextField
                margin="normal"
                fullWidth
                label="Referrer Commission %"
                value="100"
                InputProps={{ readOnly: true }}
            />
            <TextField
                margin="normal"
                fullWidth
                label="Set Commission %"
                defaultValue="0"
                InputProps={{
                    endAdornment: <InputAdornment position="end">of 100%</InputAdornment>,
                }}
            />
        </StandardModal>
    );
};

export const ChangeCommissionTypeModal = ({ open, onClose, agent }) => {
    return (
        <StandardModal
            open={open}
            onClose={onClose}
            title="Change Commission Type"
            icon={IconExchange}
            maxWidth="xs"
            actions={
                <Stack direction="row" spacing={2} justifyContent="flex-end" width="100%">
                    <PrimaryButton variant="secondary" onClick={onClose}>Cancel</PrimaryButton>
                    <PrimaryButton variant="primary" onClick={onClose}>Save</PrimaryButton>
                </Stack>
            }
        >
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                Changing type for <strong>{agent?.agentName}</strong>
            </Typography>
            
            <FormControl fullWidth>
                <InputLabel id="comm-type-label">Commission Type</InputLabel>
                <Select
                    labelId="comm-type-label"
                    defaultValue={agent?.commissionType || 'Subscription'}
                    label="Commission Type"
                >
                    <MenuItem value="Subscription">Commission by Subscription</MenuItem>
                    <MenuItem value="Transaction">Commission by Transaction</MenuItem>
                </Select>
            </FormControl>
        </StandardModal>
    );
};
