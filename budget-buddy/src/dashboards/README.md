# Dashboards Directory

This directory contains the modular dashboard system for Budget Buddy. The system is designed to be easily extensible, allowing you to add new dashboards without modifying existing code.

## Structure

```
dashboards/
├── index.js                    # Main exports
├── dashboardConfig.js          # Dashboard configuration
├── DashboardContainer.jsx      # Main dashboard container
├── DashboardSelector.jsx       # Dashboard selection interface
└── charts/                     # Chart components
    ├── index.js               # Chart exports
    └── MonthlyExpensesChart.jsx # Monthly expenses chart
```

## Adding a New Dashboard

### 1. Create the Chart Component

Create a new chart component in the `charts/` directory:

```jsx
// charts/NewDashboardChart.jsx
import React from 'react';

const NewDashboardChart = ({ transactions, loading, onBack }) => {
  // Your chart logic here
  return (
    <div className="container mt-5">
      <h2>New Dashboard</h2>
      {/* Your chart implementation */}
    </div>
  );
};

export default NewDashboardChart;
```

### 2. Update the Charts Index

Add your new chart to `charts/index.js`:

```js
export { default as MonthlyExpensesChart } from './MonthlyExpensesChart';
export { default as NewDashboardChart } from './NewDashboardChart';
```

### 3. Add Configuration

Update `dashboardConfig.js` to include your new dashboard:

```js
export const dashboardConfigs = [
  // ... existing configs
  {
    id: 'new-dashboard',
    title: 'New Dashboard Title',
    description: 'Description of what this dashboard shows',
    component: 'NewDashboardChart',
    icon: 'bi-graph-up', // Bootstrap icon class
    color: 'primary'     // Bootstrap color class
  }
];
```

### 4. Update the Container

Add a case for your new chart in `DashboardContainer.jsx`:

```jsx
switch (config.component) {
  case 'MonthlyExpensesChart':
    return <MonthlyExpensesChart ... />;
  case 'NewDashboardChart':
    return <NewDashboardChart ... />;
  // ... other cases
}
```

## Dashboard Configuration Properties

- `id`: Unique identifier for the dashboard
- `title`: Display title shown in the selector
- `description`: Description shown in the selector card
- `component`: Component name (must match the export)
- `icon`: Bootstrap icon class for the selector card
- `color`: Bootstrap color class for styling

## Best Practices

1. **Modular Components**: Keep each dashboard as a separate component
2. **Consistent Props**: All chart components receive `transactions`, `loading`, and `onBack` props
3. **Error Handling**: Handle loading states and empty data gracefully
4. **Responsive Design**: Ensure charts work on all screen sizes
5. **Performance**: Use `useMemo` for expensive calculations
6. **Accessibility**: Include proper ARIA labels and keyboard navigation

## Chart Libraries

The system uses:
- **Chart.js**: Core charting library
- **react-chartjs-2**: React wrapper for Chart.js
- **Bootstrap**: For styling and responsive design

## Data Processing

All dashboards receive the user's transactions as props. Process the data within each component using `useMemo` for performance:

```jsx
const processedData = useMemo(() => {
  // Process transactions here
  return processedData;
}, [transactions]);
```
