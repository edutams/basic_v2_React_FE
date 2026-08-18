# Bursary Officer Dashboard

## Overview
A comprehensive financial dashboard for bursary officers to monitor revenue performance, collection efficiency, and manage student payments. The dashboard provides real-time analytics with interactive charts, tables, and quick action shortcuts.

## Features

### 1. **KPI Cards (Top Row)**
- **Total Expected Income** - Shows projected fees with comparison vs last session
- **Total Collected Income** - Displays actual collected fees with growth indicator
- **Total Outstanding Balance** - Tracks unpaid balances with trend
- **Collection Efficiency** - Visual gauge showing collection rate percentage
- **Revenue Growth** - Percentage increase compared to previous term

### 2. **Revenue Trend Chart**
- Monthly bar chart showing collected income over the last 12 months
- Interactive tooltips with detailed amounts
- Statistical summary showing:
  - Average Monthly Collection
  - Best Collection Month
  - Lowest Collection Month
- Dropdown to switch between Monthly, Weekly, and Daily views

### 3. **Revenue Distribution**
- Donut chart visualizing income breakdown by category
- Categories include:
  - Tuition Fees
  - Transport Fees
  - Uniform Fees
  - Books & Others
  - Examination Fees
- Shows both amount and percentage for each category

### 4. **Search Student**
- Quick search functionality to find students by:
  - Student name
  - Admission number
  - Student ID
- Real-time search with autocomplete

### 5. **Quick Actions**
Eight quick-access action buttons:
- **Create Invoice** - Generate new invoices
- **Record Payment** - Log manual payments
- **Manage Fees** - Update fee structures
- **Generate Report** - Export financial reports
- **Send Reminder** - Send payment reminders
- **Bulk Invoice** - Generate multiple invoices
- **Fee Structure** - Manage fee settings
- **Export Data** - Export transaction data

### 6. **Fee Intelligence**
- Top payment items by collected amount
- Shows fee name, collected amount, and label
- Limited to top 5 fee types

### 7. **Payment Categories**
- Breakdown of payments by student type:
  - Returning Students
  - New Students
  - Scholarship
  - Bursary Grants
  - Staff Children
  - Alumni Children
  - Sibling Discount
  - Other Concessions
- Shows amount and percentage of total for each

### 8. **Collection Matrix**
- Class-level breakdown table showing:
  - Expected Fees
  - Collected Fees
  - Outstanding Fees
  - Collection Efficiency percentage
  - Status badge (Excellent/Pending/Poor)
- Visual progress indicators
- Clickable rows for detailed drill-down
- Totals row at the bottom

### 9. **Operational Alerts**
Sidebar with critical notifications:
- **Outstanding Fees Alert** - Students with unpaid balances
- **Settlements Pending** - Unsettled online transactions
- **Efficiency Target** - Current efficiency vs target (85%)

## Components Structure

```
BursaryOfficerDashboard/
├── index.jsx                    # Main dashboard container
├── constants.js                 # Shared constants and utilities
├── README.md                    # This file
└── components/
    ├── DashboardHeader.jsx      # Header with title, selectors, export
    ├── KpiCard.jsx              # Reusable KPI stat card
    ├── EfficiencyRing.jsx       # Circular efficiency gauge
    ├── RevenueTrend.jsx         # Monthly bar chart panel
    ├── RevenueDistribution.jsx  # Donut chart with legend
    ├── SearchStudent.jsx        # Student search input
    ├── QuickActions.jsx         # Action buttons grid
    ├── FeeIntelligence.jsx      # Top fees list
    ├── PaymentCategories.jsx    # Category breakdown
    ├── CollectionMatrix.jsx     # Class-level table
    ├── OperationalAlerts.jsx    # Alert cards sidebar
    ├── AlertCard.jsx            # Individual alert card
    ├── StatusChip.jsx           # Status badge component
    ├── SectionCard.jsx          # Reusable panel wrapper
    ├── GrowthSparkline.jsx      # Mini trend line
    └── BursaryBreakdownModal.jsx # Detailed breakdown modal
```

## API Endpoints

### Frontend Calls
All endpoints are relative to `/dashboard/bursary/`:

- `GET /revenue-performance` - KPI metrics
- `GET /revenue-trend` - Monthly collected income
- `GET /fee-intelligence` - Top payment items
- `GET /revenue-distribution` - Income by category
- `GET /payment-categories` - Payments by student type
- `GET /collection-matrix` - Class-level breakdown
- `GET /operational-alerts` - Critical notifications
- `GET /overview-breakdown` - Detailed drill-down data
- `GET /export-report?format=excel|pdf` - Export dashboard

### Backend Implementation
Location: `/app/Http/Controllers/Tenant/BursaryDashboardController.php`

All endpoints support optional `session_term_id` parameter for filtering.

## Session/Term Filtering

The dashboard includes dual dropdowns:
- **Session Selector** - Choose academic session
- **Term Selector** - Choose term within session

All data automatically refreshes when filters change. Default is the current/most recent term.

## Export Functionality

Export menu supports:
- **Excel (.xlsx)** - Spreadsheet format via PhpSpreadsheet
- **PDF (.pdf)** - Document format via Dompdf

Exports include all dashboard sections and are scoped to selected session/term.

## Caching

All endpoints implement 10-minute cache TTL to improve performance:
```php
Cache::remember('tenant_X_bursary_section_termId', 10 minutes, callback)
```

Cache keys include:
- Tenant ID
- Section name
- Session term ID (or 'all')

## Styling

The dashboard uses:
- **MUI Components** - Material-UI v5
- **Recharts** - For bar and donut charts
- **Custom Theme** - Dark/light mode support
- **Responsive Grid** - MUI Grid v2 with size prop
- **Color Palette** - Consistent with project theme

### Color Scheme
- Primary: Blue (#5B8DEF)
- Success: Green (#22C55E)
- Warning: Orange (#F59E0B)
- Error: Red (MUI default)
- Info: Blue (MUI default)

## State Management

The dashboard uses independent section loading:
- Each panel fetches data from its own endpoint
- Skeleton loaders show while data loads
- Sections appear as soon as their data is ready
- No blocking - fast panels don't wait for slow ones

## Interactivity

### Click Actions
- **KPI Cards** - Open breakdown modal
- **Chart Sections** - Open breakdown modal
- **Matrix Rows** - Show class drill-down
- **Quick Action Buttons** - Navigate or show modals
- **Search** - Trigger student lookup

### Modals
- **BursaryBreakdownModal** - Paginated table for detailed data
  - Supports search within results
  - Pagination controls
  - Different columns per breakdown type

## Performance Optimizations

1. **Independent Loading** - Each section loads separately
2. **Caching** - 10-minute cache on backend
3. **Lazy Rendering** - Skeleton placeholders
4. **Optimized Queries** - Database indexes and aggregations
5. **Memoization** - React useMemo for derived calculations

## Accessibility

- Keyboard navigation support
- ARIA labels on interactive elements
- Sufficient color contrast
- Tooltip hints for icons
- Screen reader friendly

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Future Enhancements

- Real-time WebSocket updates
- Customizable dashboard layouts
- Export scheduling
- Bulk payment processing
- Predictive analytics
- Student payment plans
- Automated reminders
- Integration with accounting systems

## Usage

```jsx
import BursaryOfficerDashboard from '@/pages/tenant/finance/BursaryOfficerDashboard';

// In your route configuration
<Route path="/finance/dashboard" element={<BursaryOfficerDashboard />} />
```

## Dependencies

```json
{
  "@mui/material": "^5.x",
  "@mui/icons-material": "^5.x",
  "recharts": "^2.x",
  "react": "^18.x"
}
```

## Notes

- All currency values are formatted in Nigerian Naira (₦)
- Dates use the tenant's timezone
- The efficiency target is set to 85% (configurable in controller)
- Empty states are handled gracefully with placeholder content
