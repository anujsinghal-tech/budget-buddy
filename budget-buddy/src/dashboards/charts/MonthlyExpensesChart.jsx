import React, { useState, useEffect, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const MonthlyExpensesChart = ({ transactions, loading, onBack }) => {
  const [selectedCategories, setSelectedCategories] = useState(new Set());

  // Get unique categories from expense transactions
  const categories = useMemo(() => {
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    const uniqueCategories = [...new Set(expenseTransactions.map(t => t.category))];
    return uniqueCategories.sort();
  }, [transactions]);

  // Initialize selected categories
  useEffect(() => {
    if (categories.length > 0 && selectedCategories.size === 0) {
      setSelectedCategories(new Set(categories));
    }
  }, [categories, selectedCategories.size]);

  // Process data for the chart
  const chartData = useMemo(() => {
    const expenseTransactions = transactions.filter(t => t.type === 'expense');

    // Group by month and category
    const monthlyData = {};

    expenseTransactions.forEach(transaction => {
      if (!selectedCategories.has(transaction.category)) return;

      const date = new Date(transaction.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          label: monthLabel,
          categories: {}
        };
      }

      if (!monthlyData[monthKey].categories[transaction.category]) {
        monthlyData[monthKey].categories[transaction.category] = 0;
      }

      monthlyData[monthKey].categories[transaction.category] += transaction.amount;
    });

    // Sort months chronologically
    const sortedMonths = Object.keys(monthlyData).sort();

    // Prepare datasets for each category
    const datasets = categories
      .filter(cat => selectedCategories.has(cat))
      .map((category, index) => {
        const colors = [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
          '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
        ];

        return {
          label: category,
          data: sortedMonths.map(month => monthlyData[month]?.categories[category] || 0),
          backgroundColor: colors[index % colors.length],
          borderColor: colors[index % colors.length],
          borderWidth: 1,
        };
      });

    return {
      labels: sortedMonths.map(month => monthlyData[month].label),
      datasets
    };
  }, [transactions, selectedCategories, categories]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Expenses by Category',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: $${context.parsed.y.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      x: {
        stacked: true,
        title: {
          display: true,
          text: 'Month'
        }
      },
      y: {
        stacked: true,
        title: {
          display: true,
          text: 'Amount ($)'
        },
        ticks: {
          callback: function(value) {
            return '$' + value.toFixed(0);
          }
        }
      }
    }
  };

  const toggleCategory = (category) => {
    const newSelected = new Set(selectedCategories);
    if (newSelected.has(category)) {
      newSelected.delete(category);
    } else {
      newSelected.add(category);
    }
    setSelectedCategories(newSelected);
  };

  const selectAllCategories = () => {
    setSelectedCategories(new Set(categories));
  };

  const deselectAllCategories = () => {
    setSelectedCategories(new Set());
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Monthly Expenses by Category</h2>
        <button className="btn btn-secondary" onClick={onBack}>
          <i className="bi bi-arrow-left me-2"></i>
          Back to Dashboards
        </button>
      </div>

      {/* Category Filter */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">Filter Categories</h5>
        </div>
        <div className="card-body">
          <div className="d-flex gap-2 mb-3">
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={selectAllCategories}
            >
              Select All
            </button>
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={deselectAllCategories}
            >
              Deselect All
            </button>
          </div>
          <div className="row">
            {categories.map(category => (
              <div key={category} className="col-md-3 col-sm-6 mb-2">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`category-${category}`}
                    checked={selectedCategories.has(category)}
                    onChange={() => toggleCategory(category)}
                  />
                  <label className="form-check-label" htmlFor={`category-${category}`}>
                    {category}
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="card">
        <div className="card-body">
          {chartData.datasets.length > 0 ? (
            <Bar data={chartData} options={options} />
          ) : (
            <div className="text-center py-5">
              <i className="bi bi-bar-chart text-muted" style={{ fontSize: '3rem' }}></i>
              <h5 className="text-muted mt-3">No Data Available</h5>
              <p className="text-muted">Select categories to view the chart</p>
            </div>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      {chartData.datasets.length > 0 && (
        <div className="row mt-4">
          <div className="col-md-4">
            <div className="card text-center">
              <div className="card-body">
                <h5 className="card-title text-primary">
                  ${transactions
                    .filter(t => t.type === 'expense' && selectedCategories.has(t.category))
                    .reduce((sum, t) => sum + t.amount, 0)
                    .toFixed(2)}
                </h5>
                <p className="card-text">Total Expenses</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card text-center">
              <div className="card-body">
                <h5 className="card-title text-info">
                  {categories.filter(cat => selectedCategories.has(cat)).length}
                </h5>
                <p className="card-text">Categories Selected</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card text-center">
              <div className="card-body">
                <h5 className="card-title text-success">
                  {chartData.labels.length}
                </h5>
                <p className="card-text">Months Tracked</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyExpensesChart;
