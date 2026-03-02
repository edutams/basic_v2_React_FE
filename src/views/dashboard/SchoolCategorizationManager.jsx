import React, { useState } from 'react';
import { Box, Tabs, Tab, CardContent } from '@mui/material';
import BlankCard from '../../components/shared/BlankCard';
import CategoryList from './components/CategoryList';
import DivisionList from './components/DivisionList';

const SchoolCategorizationManager = () => {
    const [value, setValue] = useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <BlankCard>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleChange} aria-label="school categorization tabs">
                    <Tab label="School Categories" />
                    <Tab label="School Divisions" />
                </Tabs>
            </Box>
            <CardContent>
                {value === 0 && <CategoryList />}
                {value === 1 && <DivisionList />}
            </CardContent>
        </BlankCard>
    );
};

export default SchoolCategorizationManager;
