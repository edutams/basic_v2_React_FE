
import React from 'react';
import {
    Box,
    Typography,
    Divider,
    IconButton,
    Stack,
    MenuItem
} from '@mui/material';
import {
    IconChevronLeft,
    IconChevronRight,
    IconChevronsLeft,
    IconChevronsRight,
} from '@tabler/icons-react';
import CustomSelect from 'src/components/forms/theme-elements/CustomSelect';
import PropTypes from 'prop-types';

const StandardPagination = ({ table, totalEntries }) => {
    if (!table || !table.getRowModel().rows.length) return null;

    const pageIndex = table.getState().pagination.pageIndex;
    const pageSize = table.getState().pagination.pageSize;

    return (
        <>
            <Divider />
            <Stack 
                p={3} 
                alignItems="center" 
                direction={{ xs: 'column', sm: 'row' }} 
                justifyContent="space-between"
                spacing={2}
            >
                <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body2" color="textSecondary">
                        Showing {pageIndex * pageSize + 1} to {Math.min((pageIndex + 1) * pageSize, totalEntries)} of {totalEntries} entries
                    </Typography>
                </Box>
                
                <Box display="flex" alignItems="center" gap={2} sx={{ width: { xs: '100%', sm: 'auto' }, justifyContent: { xs: 'center', sm: 'flex-end' } }}>
                    <CustomSelect
                        value={pageSize}
                        size="small"
                        onChange={(e) => {
                            table.setPageSize(Number(e.target.value));
                        }}
                        sx={{ height: 32 }}
                    >
                        {[5, 10, 15, 20, 25].map((pSize) => (
                            <MenuItem key={pSize} value={pSize}>
                                {pSize} / page
                            </MenuItem>
                        ))}
                    </CustomSelect>

                    <Stack direction="row" spacing={0.5}>
                        <IconButton
                            size="small"
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <IconChevronsLeft size={18} />
                        </IconButton>
                        <IconButton
                            size="small"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <IconChevronLeft size={18} />
                        </IconButton>
                        <IconButton
                            size="small"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            <IconChevronRight size={18} />
                        </IconButton>
                        <IconButton
                            size="small"
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                            disabled={!table.getCanNextPage()}
                        >
                            <IconChevronsRight size={18} />
                        </IconButton>
                    </Stack>
                </Box>
            </Stack>
        </>
    );
};

StandardPagination.propTypes = {
    table: PropTypes.object.isRequired,
    totalEntries: PropTypes.number.isRequired,
};

export default StandardPagination;
