import React, { useState, useMemo } from 'react';
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

const InvestmentTrackingDashboard = ({ transactions, loading, onBack }) => {
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());

  // Get available years from transactions
  const availableYears = useMemo(() => {
    const years = new Set();
    transactions.forEach(transaction => {
      const year = new Date(transaction.created_at).getFullYear();
      years.add(year);
    });
    return Array.from(years).sort((a, b) => b - a); // Most recent first
  }, [transactions]);

  // Filter investment transactions
  const investmentTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const transactionYear = new Date(transaction.created_at).getFullYear();
      return transactionYear === selectedYear && transaction.type === 'investment';
    });
  }, [transactions, selectedYear]);

  // Process data for monthly investments
  const monthlyChartData = useMemo(() => {
    const monthlyData = Array(12).fill(0);

    investmentTransactions.forEach(transaction => {
      const month = new Date(transaction.created_at).getMonth();
      monthlyData[month] += transaction.amount;
    });

    const monthLabels = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    return {
      labels: monthLabels,
      datasets: [{
        label: 'Investments',
        data: monthlyData,
        backgroundColor: 'rgba(25, 135, 84, 0.8)',
        borderColor: 'rgba(25, 135, 84, 1)',
        borderWidth: 1,
      }]
    };
  }, [investmentTransactions]);

  // Process data for category breakdown
  const categoryChartData = useMemo(() => {
    const categoryTotals = {};

    investmentTransactions.forEach(transaction => {
      if (!categoryTotals[transaction.category]) {
        categoryTotals[transaction.category] = 0;
      }
      categoryTotals[transaction.category] += transaction.amount;
    });

    const categories = Object.keys(categoryTotals).sort();
    const amounts = categories.map(cat => categoryTotals[cat]);

    // Generate colors for categories
    const colors = [
      '#198754', '#20c997', '#40c463', '#30a14e', '#28a745',
      '#17a2b8', '#6f42c1', '#e83e8c', '#fd7e14', '#ffc107'
    ];

    return {
      labels: categories,
      datasets: [{
        label: 'Investment Amount',
        data: amounts,
        backgroundColor: colors.slice(0, categories.length),
        borderColor: colors.slice(0, categories.length).map(color =>
          color.replace('0.8', '1')
        ),
        borderWidth: 1,
      }]
    };
  }, [investmentTransactions]);

  const monthlyOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Monthly Investments - ${selectedYear}`,
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Invested: $${context.parsed.y.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Month'
        }
      },
      y: {
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

  const categoryOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Investment by Category',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed.y / total) * 100).toFixed(1);
            return `${context.label}: $${context.parsed.y.toFixed(2)} (${percentage}%)`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Category'
        }
      },
      y: {
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

  // Calculate summary statistics
  const totalInvested = useMemo(() => {
    return investmentTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  }, [investmentTransactions]);

  const monthlyAverage = useMemo(() => {
    return totalInvested / 12;
  }, [totalInvested]);

  const topCategory = useMemo(() => {
    const categoryTotals = {};
    investmentTransactions.forEach(transaction => {
      if (!categoryTotals[transaction.category]) {
        categoryTotals[transaction.category] = 0;
      }
      categoryTotals[transaction.category] += transaction.amount;
    });

    const categories = Object.keys(categoryTotals);
    if (categories.length === 0) return { category: 'None', amount: 0 };

    const topCat = categories.reduce((prev, current) =>
      categoryTotals[prev] > categoryTotals[current] ? prev : current
    );

    return { category: topCat, amount: categoryTotals[topCat] };
  }, [investmentTransactions]);

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading investment dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Investment Tracking Dashboard</h2>
        <button className="btn btn-secondary" onClick={onBack}>
          <i className="bi bi-arrow-left me-2"></i>
          Back to Dashboards
        </button>
      </div>

      {/* Year Selector */}
      <div className="card mb-4">
        <div className="card-body">
          <label htmlFor="yearSelect" className="form-label">Select Year</label>
          <select
            id="yearSelect"
            className="form-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <h4 className="card-title text-success">
                ${totalInvested.toFixed(2)}
              </h4>
              <p className="card-text">Total Invested</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <h4 className="card-title text-info">
                ${monthlyAverage.toFixed(2)}
              </h4>
              <p className="card-text">Monthly Average</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <h4 className="card-title text-primary">
                ${topCategory.amount.toFixed(2)}
              </h4>
              <p className="card-text">Top: {topCategory.category}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="row">
        <div className="col-lg-6 mb-4">
          <div className="card">
            <div className="card-body">
              {investmentTransactions.length > 0 ? (
                <Bar data={monthlyChartData} options={monthlyOptions} />
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-graph-up text-muted" style={{ fontSize: '3rem' }}></i>
                  <h5 className="text-muted mt-3">No Monthly Data</h5>
                  <p className="text-muted">No investments found for {selectedYear}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-6 mb-4">
          <div className="card">
            <div className="card-body">
              {categoryChartData.labels.length > 0 ? (
                <Bar data={categoryChartData} options={categoryOptions} />
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-bar-chart text-muted" style={{ fontSize: '3rem' }}></i>
                  <h5 className="text-muted mt-3">No Category Data</h5>
                  <p className="text-muted">No investment categories found for {selectedYear}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Details */}
      {investmentTransactions.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">Investment Details</h5>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Note</th>
                  </tr>
                </thead>
                <tbody>
                  {investmentTransactions
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                    .map(transaction => (
                      <tr key={transaction.id}>
                        <td>{new Date(transaction.created_at).toLocaleDateString()}</td>
                        <td>{transaction.category}</td>
                        <td className="text-success fw-bold">${transaction.amount.toFixed(2)}</td>
                        <td>{transaction.note || '-'}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestmentTrackingDashboard;
