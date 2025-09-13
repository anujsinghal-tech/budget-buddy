export const dashboardConfigs = [
  {
    id: 'monthly-expenses',
    title: 'Monthly Expenses by Category',
    description: 'View your monthly expenses aggregated by category with interactive filtering',
    component: 'MonthlyExpensesChart',
    icon: 'bi-bar-chart-line',
    color: 'primary'
  },
  {
    id: 'expenditure-analysis',
    title: 'Expenditure Analysis',
    description: 'Analyze your spending by category with date range filtering and pie chart visualization',
    component: 'ExpenditureAnalysisChart',
    icon: 'bi-pie-chart',
    color: 'danger'
  },
  {
    id: 'tax-dashboard',
    title: 'Tax Dashboard',
    description: 'Track your monthly tax payments and view tax-related expenses over time',
    component: 'TaxDashboard',
    icon: 'bi-receipt',
    color: 'warning'
  },
  {
    id: 'investment-tracking',
    title: 'Investment Tracking',
    description: 'Monitor your investment activities and analyze investment patterns by category',
    component: 'InvestmentTrackingDashboard',
    icon: 'bi-graph-up',
    color: 'success'
  },
  {
    id: 'income-vs-expenses',
    title: 'Income vs Expenses',
    description: 'Compare your income and expenses over time',
    component: 'IncomeVsExpensesChart',
    icon: 'bi-graph-up',
    color: 'success'
  },
  {
    id: 'spending-trends',
    title: 'Spending Trends',
    description: 'Analyze your spending patterns and trends',
    component: 'SpendingTrendsChart',
    icon: 'bi-trending-up',
    color: 'warning'
  },
  {
    id: 'custom-query',
    title: 'Custom Query',
    description: 'Write and execute custom SQL queries against your data',
    component: 'CustomQueryDashboard',
    icon: 'bi-code-slash',
    color: 'dark'
  }
];

export const getDashboardConfig = (id) => {
  return dashboardConfigs.find(config => config.id === id);
};
