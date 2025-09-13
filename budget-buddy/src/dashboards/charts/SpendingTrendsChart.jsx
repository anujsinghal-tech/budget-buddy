import React, { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const SpendingTrendsChart = ({ transactions, loading, onBack }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  const [showMovingAverage, setShowMovingAverage] = useState(true);

  // Get available years from transactions
  const availableYears = useMemo(() => {
    const years = new Set();
    transactions.forEach(transaction => {
      const year = new Date(transaction.created_at).getFullYear();
      years.add(year);
    });
    return Array.from(years).sort((a, b) => b - a); // Most recent first
  }, [transactions]);

  // Filter expense transactions by year
  const yearTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const transactionYear = new Date(transaction.created_at).getFullYear();
      return transactionYear === selectedYear && transaction.type === 'expense';
    });
  }, [transactions, selectedYear]);

  // Process data based on selected period
  const trendData = useMemo(() => {
    const monthlyData = Array(12).fill(0);
    const quarterlyData = Array(4).fill(0);
    const yearlyData = [0]; // Single year total
    const weeklyData = Array(52).fill(0); // 52 weeks in a year

    yearTransactions.forEach(transaction => {
      const date = new Date(transaction.created_at);
      const month = date.getMonth();
      const quarter = Math.floor(month / 3);

      monthlyData[month] += transaction.amount;
      quarterlyData[quarter] += transaction.amount;
      yearlyData[0] += transaction.amount;

      // Calculate week number (0-51)
      const startOfYear = new Date(selectedYear, 0, 1);
      const weekNumber = Math.floor((date - startOfYear) / (7 * 24 * 60 * 60 * 1000));
      if (weekNumber >= 0 && weekNumber < 52) {
        weeklyData[weekNumber] += transaction.amount;
      }
    });

    return {
      monthly: monthlyData,
      quarterly: quarterlyData,
      yearly: yearlyData,
      weekly: weeklyData
    };
  }, [yearTransactions, selectedYear]);

  // Calculate moving averages
  const movingAverages = useMemo(() => {
    const data = trendData[selectedPeriod];
    if (data.length < 3) return data; // Not enough data for moving average

    const averages = [];
    for (let i = 0; i < data.length; i++) {
      if (i < 2) {
        averages.push(data[i]); // Use actual value for first two points
      } else {
        const avg = (data[i - 2] + data[i - 1] + data[i]) / 3;
        averages.push(avg);
      }
    }
    return averages;
  }, [trendData, selectedPeriod]);

  // Calculate percentage changes
  const percentageChanges = useMemo(() => {
    const data = trendData[selectedPeriod];
    const changes = [0]; // First period has no previous comparison

    for (let i = 1; i < data.length; i++) {
      const change = data[i - 1] !== 0 ? ((data[i] - data[i - 1]) / data[i - 1]) * 100 : 0;
      changes.push(change);
    }
    return changes;
  }, [trendData, selectedPeriod]);

  // Prepare chart data
  const chartData = useMemo(() => {
    let labels = [];
    let actualData = [];

    switch (selectedPeriod) {
      case 'weekly':
        labels = Array.from({ length: 52 }, (_, i) => `W${i + 1}`);
        actualData = trendData.weekly;
        break;
      case 'monthly':
        labels = [
          'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];
        actualData = trendData.monthly;
        break;
      case 'quarterly':
        labels = ['Q1', 'Q2', 'Q3', 'Q4'];
        actualData = trendData.quarterly;
        break;
      case 'yearly':
        labels = [selectedYear.toString()];
        actualData = trendData.yearly;
        break;
      default:
        break;
    }

    const datasets = [
      {
        label: 'Actual Spending',
        data: actualData,
        borderColor: 'rgba(220, 53, 69, 1)',
        backgroundColor: 'rgba(220, 53, 69, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
      }
    ];

    // Add moving average if enabled and enough data
    if (showMovingAverage && actualData.length >= 3) {
      datasets.push({
        label: '3-Period Moving Average',
        data: movingAverages,
        borderColor: 'rgba(255, 193, 7, 1)',
        backgroundColor: 'rgba(255, 193, 7, 0.1)',
        borderWidth: 2,
        borderDash: [5, 5],
        fill: false,
        tension: 0.4,
      });
    }

    return {
      labels,
      datasets
    };
  }, [trendData, selectedPeriod, selectedYear, showMovingAverage, movingAverages]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Spending Trends - ${selectedYear} (${selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)})`,
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            label += '$' + context.parsed.y.toFixed(2);
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: selectedPeriod === 'monthly' ? 'Month' : selectedPeriod === 'quarterly' ? 'Quarter' : selectedPeriod === 'weekly' ? 'Week' : 'Year'
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

  // Calculate trend statistics
  const trendStats = useMemo(() => {
    const data = trendData[selectedPeriod];
    if (data.length === 0) return null;

    const total = data.reduce((sum, amount) => sum + amount, 0);
    const average = total / data.length;
    const maxAmount = Math.max(...data);
    const minAmount = Math.min(...data);

    // Calculate overall trend (simple linear regression slope)
    let trend = 0;
    if (data.length > 1) {
      const n = data.length;
      const sumX = (n * (n - 1)) / 2;
      const sumY = data.reduce((sum, val) => sum + val, 0);
      const sumXY = data.reduce((sum, val, index) => sum + (val * index), 0);
      const sumXX = (n * (n - 1) * (2 * n - 1)) / 6;

      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
      trend = slope;
    }

    return {
      total,
      average,
      maxAmount,
      minAmount,
      trend,
      trendDirection: trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable'
    };
  }, [trendData, selectedPeriod]);

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading spending trends data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Spending Trends Analysis</h2>
        <button className="btn btn-secondary" onClick={onBack}>
          <i className="bi bi-arrow-left me-2"></i>
          Back to Dashboards
        </button>
      </div>

      {/* Controls */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-4">
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
            <div className="col-md-4">
              <label htmlFor="periodSelect" className="form-label">Time Period</label>
              <select
                id="periodSelect"
                className="form-select"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div className="col-md-4">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="movingAverageCheck"
                  checked={showMovingAverage}
                  onChange={(e) => setShowMovingAverage(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="movingAverageCheck">
                  Show Moving Average
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trend Statistics */}
      {trendStats && (
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card text-center">
              <div className="card-body">
                <h5 className="card-title text-danger">
                  ${trendStats.total.toFixed(2)}
                </h5>
                <p className="card-text">Total Spending</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-center">
              <div className="card-body">
                <h5 className="card-title text-warning">
                  ${trendStats.average.toFixed(2)}
                </h5>
                <p className="card-text">Average per Period</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-center">
              <div className="card-body">
                <h5 className={`card-title ${trendStats.trendDirection === 'increasing' ? 'text-danger' : trendStats.trendDirection === 'decreasing' ? 'text-success' : 'text-info'}`}>
                  {trendStats.trendDirection === 'increasing' ? '↗️' : trendStats.trendDirection === 'decreasing' ? '↘️' : '➡️'}
                  {Math.abs(trendStats.trend).toFixed(2)}
                </h5>
                <p className="card-text">Trend Slope</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-center">
              <div className="card-body">
                <h5 className="card-title text-info">
                  ${trendStats.maxAmount.toFixed(2)}
                </h5>
                <p className="card-text">Peak Spending</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="card">
        <div className="card-body">
          {yearTransactions.length > 0 ? (
            <Line data={chartData} options={options} />
          ) : (
            <div className="text-center py-5">
              <i className="bi bi-trending-up text-muted" style={{ fontSize: '3rem' }}></i>
              <h5 className="text-muted mt-3">No Spending Data Available</h5>
              <p className="text-muted">
                No expense transactions found for {selectedYear}.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Percentage Changes Table */}
      {yearTransactions.length > 0 && selectedPeriod !== 'yearly' && selectedPeriod !== 'weekly' && (
        <div className="card mt-4">
          <div className="card-header">
            <h5 className="mb-0">Period-over-Period Changes</h5>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Period</th>
                    <th>Amount</th>
                    <th>% Change</th>
                    <th>Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.labels.map((label, index) => {
                    const amount = trendData[selectedPeriod][index];
                    const change = percentageChanges[index];
                    return (
                      <tr key={label}>
                        <td>{label}</td>
                        <td className="fw-bold">${amount.toFixed(2)}</td>
                        <td className={change > 0 ? 'text-danger' : change < 0 ? 'text-success' : 'text-muted'}>
                          {index === 0 ? '-' : `${change > 0 ? '+' : ''}${change.toFixed(1)}%`}
                        </td>
                        <td>
                          {index === 0 ? (
                            <span className="text-muted">-</span>
                          ) : change > 0 ? (
                            <span className="text-danger">↗️ Increased</span>
                          ) : change < 0 ? (
                            <span className="text-success">↘️ Decreased</span>
                          ) : (
                            <span className="text-muted">➡️ Stable</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpendingTrendsChart;
