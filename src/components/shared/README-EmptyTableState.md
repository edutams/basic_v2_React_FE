# Empty Table State System

A reusable system for handling empty states across all tables in the application.

## Components

### 1. EmptyTableState Component
A reusable component that displays appropriate empty state messages in tables.

### 2. useTableEmptyState Hook
A custom hook that determines the appropriate empty state based on data and filters.

## Usage

### Basic Implementation

```jsx
import EmptyTableState from '../../components/shared/EmptyTableState';
import useTableEmptyState from '../../hooks/useTableEmptyState';

const MyTable = () => {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});
  
  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(value => value);
  }, [filters]);

  // Configure empty state
  const emptyState = useTableEmptyState(
    data,
    hasActiveFilters,
    !!search,
    search,
    {
      defaultMessage: "No items found",
      defaultDescription: "No items have been added yet. Click 'Add Item' to get started.",
      filterMessage: "No items match your filters",
      filterDescription: "Try adjusting your filters to see more results.",
      searchMessage: `No results found for "${search}"`,
      searchDescription: "Try different search terms or clear the search."
    }
  );

  return (
    <TableBody>
      {!emptyState.isEmpty ? (
        data.map((row) => (
          <TableRow key={row.id}>
            {/* Your table cells */}
          </TableRow>
        ))
      ) : (
        <EmptyTableState 
          colSpan={numberOfColumns}
          message={emptyState.message}
          description={emptyState.description}
          type={emptyState.type}
        />
      )}
    </TableBody>
  );
};
```

### EmptyTableState Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `colSpan` | number | required | Number of columns to span |
| `message` | string | "No data available" | Main message to display |
| `description` | string | "There are no records..." | Detailed description |
| `icon` | Component | auto | Custom icon component |
| `height` | number | 200 | Height of empty state area |
| `showIcon` | boolean | true | Whether to show icon |
| `type` | string | 'default' | Type: 'default', 'search', 'filter' |

### useTableEmptyState Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `data` | Array | The table data array |
| `hasFilters` | boolean | Whether any filters are active |
| `hasSearch` | boolean | Whether search is active |
| `searchTerm` | string | Current search term |
| `customMessages` | Object | Custom messages for different states |

### Custom Messages Object

```jsx
const customMessages = {
  defaultMessage: "Custom no data message",
  defaultDescription: "Custom no data description",
  filterMessage: "Custom filter message", 
  filterDescription: "Custom filter description",
  searchMessage: "Custom search message",
  searchDescription: "Custom search description"
};
```

## Examples

### Simple Table
```jsx
<EmptyTableState 
  colSpan={5}
  message="No users found"
  description="No users have been registered yet."
/>
```

### With Custom Icon
```jsx
import { IconUsers } from '@tabler/icons-react';

<EmptyTableState 
  colSpan={5}
  message="No users found"
  icon={IconUsers}
/>
```

### Different Types
```jsx
// Default state
<EmptyTableState colSpan={5} type="default" />

// Search state  
<EmptyTableState colSpan={5} type="search" />

// Filter state
<EmptyTableState colSpan={5} type="filter" />
```

## Implementation in Existing Tables

To add empty states to existing tables:

1. Import the components
2. Add the hook to determine empty state
3. Update TableBody to conditionally render empty state
4. Customize messages for your specific use case

This system ensures consistent empty state handling across all tables in the application.
