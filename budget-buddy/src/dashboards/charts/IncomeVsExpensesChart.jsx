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

const IncomeVsExpensesChart = ({ transactions, loading, onBack }) => {
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

  // Filter transactions by year
  const yearTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const transactionYear = new Date(transaction.created_at).getFullYear();
      return transactionYear === selectedYear;
    });
  }, [transactions, selectedYear]);

  // Process data for income vs expenses comparison
  const chartData = useMemo(() => {
    const monthlyData = {
      income: Array(12).fill(0),
      expenses: Array(12).fill(0)
    };

    yearTransactions.forEach(transaction => {
      const month = new Date(transaction.created_at).getMonth();

      if (transaction.type === 'credit') {
        monthlyData.income[month] += transaction.amount;
      } else if (transaction.type === 'expense') {
        monthlyData.expenses[month] += transaction.amount;
      }
    });

    const monthLabels = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    return {
      labels: monthLabels,
      datasets: [
        {
          label: 'Income',
          data: monthlyData.income,
          backgroundColor: 'rgba(40, 167, 69, 0.8)',
          borderColor: 'rgba(40, 167, 69, 1)',
          borderWidth: 1,
        },
        {
          label: 'Expenses',
          data: monthlyData.expenses,
          backgroundColor: 'rgba(220, 53, 69, 0.8)',
          borderColor: 'rgba(220, 53, 69, 1)',
          borderWidth: 1,
        }
      ]
    };
  }, [yearTransactions]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Income vs Expenses - ${selectedYear}`,
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

  // Calculate summary statistics
  const totalIncome = useMemo(() => {
    return yearTransactions
      .filter(t => t.type === 'credit')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [yearTransactions]);

  const totalExpenses = useMemo(() => {
    return yearTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [yearTransactions]);

  const netIncome = useMemo(() => {
    return totalIncome - totalExpenses;
  }, [totalIncome, totalExpenses]);

  const monthlyAverageIncome = useMemo(() => {
    return totalIncome / 12;
  }, [totalIncome]);

  const monthlyAverageExpenses = useMemo(() => {
    return totalExpenses / 12;
  }, [totalExpenses]);

  const savingsRate = useMemo(() => {
    return totalIncome > 0 ? ((netIncome / totalIncome) * 100) : 0;
  }, [netIncome, totalIncome]);

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading income vs expenses data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Income vs Expenses</h2>
        <button className="btn btn-secondary" onClick={onBack}>
          <i className="bi bi-arrow-left me-2"></i>
          Back to Dashboards
        </button>
      </div>

      {/* Year Selector */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-6">
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
            <div className="col-md-6">
              <div className="alert alert-info">
                <strong>Analysis:</strong> Compare your income and expenses to track financial health and savings patterns.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title text-success">
                ${totalIncome.toFixed(2)}
              </h5>
              <p className="card-text">Total Income</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title text-danger">
                ${totalExpenses.toFixed(2)}
              </h5>
              <p className="card-text">Total Expenses</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className={`card-title ${netIncome >= 0 ? 'text-success' : 'text-danger'}`}>
                ${netIncome.toFixed(2)}
              </h5>
              <p className="card-text">Net Income</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className={`card-title ${savingsRate >= 0 ? 'text-success' : 'text-danger'}`}>
                {savingsRate.toFixed(1)}%
              </h5>
              <p className="card-text">Savings Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Averages */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title text-success">
                ${monthlyAverageIncome.toFixed(2)}
              </h5>
              <p className="card-text">Monthly Average Income</p>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title text-danger">
                ${monthlyAverageExpenses.toFixed(2)}
              </h5>
              <p className="card-text">Monthly Average Expenses</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="card">
        <div className="card-body">
          {yearTransactions.length > 0 ? (
            <Bar data={chartData} options={options} />
          ) : (
            <div className="text-center py-5">
              <i className="bi bi-graph-up text-muted" style={{ fontSize: '3rem' }}></i>
              <h5 className="text-muted mt-3">No Data Available</h5>
              <p className="text-muted">
                No transactions found for {selectedYear}.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Summary */}
      {yearTransactions.length > 0 && (
        <div className="row mt-4">
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0 text-success">Income Breakdown</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Month</th>
                        <th>Income</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chartData.labels.map((month, index) => (
                        <tr key={month}>
                          <td>{month}</td>
                          <td className="text-success fw-bold">
                            ${chartData.datasets[0].data[index].toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0 text-danger">Expenses Breakdown</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Month</th>
                        <th>Expenses</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chartData.labels.map((month, index) => (
                        <tr key={month}>
                          <td>{month}</td>
                          <td className="text-danger fw-bold">
                            ${chartData.datasets[1].data[index].toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncomeVsExpensesChart;
