'use client'
import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import TrackitemclicksTreeCode from '../code/simpletreecode/TrackitemclicksTreeCode';
import ParentCard from '../../shared/ParentCard';

function TrackitemclicksTree() {
    const [lastClickedItem, setLastClickedItem] = React.useState(null);
    return (
        <ParentCard
            title="Itemclicks  Treeview"
            codeModel={<TrackitemclicksTreeCode />}
        >
            <Stack spacing={2}>
                <Typography>
                    {lastClickedItem == null
                        ? 'No item click recorded'
                        : `Last clicked item: ${lastClickedItem}`}
                </Typography>
                <Box sx={{ minHeight: 352, minWidth: 300 }}>
                    <SimpleTreeView onItemClick={(event, itemId) => setLastClickedItem(itemId)}>
                        <TreeItem itemId="grid" label="Data Grid">
                            <TreeItem itemId="grid-community" label="@mui/x-data-grid" />
                            <TreeItem itemId="grid-pro" label="@mui/x-data-grid-pro" />
                            <TreeItem itemId="grid-premium" label="@mui/x-data-grid-premium" />
                        </TreeItem>
                        <TreeItem itemId="pickers" label="Date and Time Pickers">
                            <TreeItem itemId="pickers-community" label="@mui/x-date-pickers" />
                            <TreeItem itemId="pickers-pro" label="@mui/x-date-pickers-pro" />
                        </TreeItem>
                        <TreeItem itemId="charts" label="Charts">
                            <TreeItem itemId="charts-community" label="@mui/x-charts" />
                        </TreeItem>
                        <TreeItem itemId="tree-view" label="Tree View">
                            <TreeItem itemId="tree-view-community" label="@mui/x-tree-view" />
                        </TreeItem>
                    </SimpleTreeView>
                </Box>
            </Stack>
        </ParentCard>
    );
}

export default TrackitemclicksTree