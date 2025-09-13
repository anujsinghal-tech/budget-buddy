import React, { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const ExpenditureAnalysisChart = ({ transactions, loading, onBack }) => {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1); // Default to last month
    return date.toISOString().split('T')[0];
  });

  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Filter transactions by date range and type
  const filteredTransactions = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include the entire end date

    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.created_at);
      return transaction.type === 'expense' &&
             transactionDate >= start &&
             transactionDate <= end;
    });
  }, [transactions, startDate, endDate]);

  // Process data for the pie chart
  const chartData = useMemo(() => {
    const categoryTotals = {};

    filteredTransactions.forEach(transaction => {
      if (!categoryTotals[transaction.category]) {
        categoryTotals[transaction.category] = 0;
      }
      categoryTotals[transaction.category] += transaction.amount;
    });

    const categories = Object.keys(categoryTotals).sort();
    const amounts = categories.map(cat => categoryTotals[cat]);

    // Generate colors for categories
    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
      '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384',
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'
    ];

    return {
      labels: categories,
      datasets: [{
        data: amounts,
        backgroundColor: colors.slice(0, categories.length),
        borderColor: colors.slice(0, categories.length).map(color =>
          color.replace('0.8', '1') // Make borders more opaque
        ),
        borderWidth: 2,
      }]
    };
  }, [filteredTransactions]);

  const totalExpenditure = useMemo(() => {
    return filteredTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  }, [filteredTransactions]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 12,
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: 'Expenditure by Category',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: $${value.toFixed(2)} (${percentage}%)`;
          }
        }
      }
    }
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
        <h2>Expenditure Analysis</h2>
        <button className="btn btn-secondary" onClick={onBack}>
          <i className="bi bi-arrow-left me-2"></i>
          Back to Dashboards
        </button>
      </div>

      {/* Date Range Filter */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">Select Date Range</h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <label htmlFor="startDate" className="form-label">Start Date</label>
              <input
                type="date"
                className="form-control"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="endDate" className="form-label">End Date</label>
              <input
                type="date"
                className="form-control"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <h4 className="card-title text-danger">
                ${totalExpenditure.toFixed(2)}
              </h4>
              <p className="card-text">Total Expenditure</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <h4 className="card-title text-info">
                {chartData.labels.length}
              </h4>
              <p className="card-text">Categories</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <h4 className="card-title text-success">
                {filteredTransactions.length}
              </h4>
              <p className="card-text">Transactions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="card">
        <div className="card-body">
          {chartData.datasets[0].data.length > 0 ? (
            <div className="row">
              <div className="col-lg-8">
                <Pie data={chartData} options={options} />
              </div>
              <div className="col-lg-4">
                <h6 className="mb-3">Category Breakdown</h6>
                <div className="list-group list-group-flush">
                  {chartData.labels.map((category, index) => {
                    const amount = chartData.datasets[0].data[index];
                    const percentage = ((amount / totalExpenditure) * 100).toFixed(1);
                    return (
                      <div key={category} className="d-flex justify-content-between align-items-center py-2">
                        <div className="d-flex align-items-center">
                          <div
                            className="rounded-circle me-2"
                            style={{
                              width: '12px',
                              height: '12px',
                              backgroundColor: chartData.datasets[0].backgroundColor[index]
                            }}
                          ></div>
                          <span className="small">{category}</span>
                        </div>
                        <div className="text-end">
                          <div className="small fw-bold">${amount.toFixed(2)}</div>
                          <div className="small text-muted">{percentage}%</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-5">
              <i className="bi bi-pie-chart text-muted" style={{ fontSize: '3rem' }}></i>
              <h5 className="text-muted mt-3">No Data Available</h5>
              <p className="text-muted">
                No expenses found for the selected date range.
                Try adjusting your date filters or add some expense transactions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenditureAnalysisChart;
