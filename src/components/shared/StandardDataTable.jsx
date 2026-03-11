import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Box,
    useTheme
} from '@mui/material';
import {
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import StandardPagination from './StandardPagination';
import PropTypes from 'prop-types';

const StandardDataTable = ({ 
    columns, 
    data, 
    showPagination = true,
    pageSize = 10,
    title = ""
}) => {
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: {
                pageSize: pageSize,
            },
        },
    });

    return (
        <Box sx={{ 
            border: `1px solid ${theme.palette.divider}`, 
            borderRadius: '12px', 
            overflow: 'hidden',
            bgcolor: theme.palette.background.paper
        }}>
            <TableContainer>
                <Table sx={{ whiteSpace: 'nowrap' }}>
                    <TableHead sx={{ bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.02)' : '#F9FAFB' }}>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableCell 
                                        key={header.id} 
                                        sx={{ 
                                            fontWeight: 600, 
                                            color: theme.palette.text.primary, 
                                            py: 2,
                                            borderBottom: `1px solid ${theme.palette.divider}`
                                        }}
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableHead>
                    <TableBody>
                        {table.getRowModel().rows.length > 0 ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow 
                                    key={row.id} 
                                    hover 
                                    sx={{ 
                                        '&:last-child td, &:last-child th': { border: 0 },
                                        '&:hover': {
                                            bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.03) !important' : 'rgba(0,0,0,0.02) !important'
                                        }
                                    }}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell 
                                            key={cell.id} 
                                            sx={{ 
                                                py: 2,
                                                color: theme.palette.text.secondary,
                                                borderColor: theme.palette.divider
                                            }}
                                        >
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} align="center" sx={{ py: 10 }}>
                                    <Typography color="textSecondary">No data available</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {showPagination && (
                <StandardPagination table={table} totalEntries={data.length} />
            )}
        </Box>
    );
};

StandardDataTable.propTypes = {
    columns: PropTypes.array.isRequired,
    data: PropTypes.array.isRequired,
    showPagination: PropTypes.bool,
    pageSize: PropTypes.number,
    title: PropTypes.string,
};

export default StandardDataTable;
