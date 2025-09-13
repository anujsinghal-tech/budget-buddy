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

const TaxDashboard = ({ transactions, loading, onBack }) => {
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

  // Tax-related categories (you can customize this list)
  const taxCategories = useMemo(() => [
    'Taxes', 'Tax Payment', 'Income Tax', 'Property Tax',
    'Sales Tax', 'Tax Refund', 'Tax Preparation', 'Tax Services'
  ], []);

  // Filter tax-related transactions
  const taxTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const transactionYear = new Date(transaction.created_at).getFullYear();
      return transactionYear === selectedYear &&
             transaction.type === 'investment' &&
             taxCategories.some(cat =>
               transaction.category.toLowerCase().includes(cat.toLowerCase())
             );
    });
  }, [transactions, selectedYear, taxCategories]);

  // Process data for monthly tax payments
  const chartData = useMemo(() => {
    const monthlyData = Array(12).fill(0);

    taxTransactions.forEach(transaction => {
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
        label: 'Tax Payments',
        data: monthlyData,
        backgroundColor: 'rgba(220, 53, 69, 0.8)',
        borderColor: 'rgba(220, 53, 69, 1)',
        borderWidth: 1,
      }]
    };
  }, [taxTransactions]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Tax Payments - ${selectedYear}`,
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Tax Paid: $${context.parsed.y.toFixed(2)}`;
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
  const totalTaxPaid = useMemo(() => {
    return taxTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  }, [taxTransactions]);

  const monthlyAverage = useMemo(() => {
    return totalTaxPaid / 12;
  }, [totalTaxPaid]);

  const highestMonth = useMemo(() => {
    const monthlyTotals = Array(12).fill(0);
    taxTransactions.forEach(transaction => {
      const month = new Date(transaction.created_at).getMonth();
      monthlyTotals[month] += transaction.amount;
    });
    const maxAmount = Math.max(...monthlyTotals);
    const maxMonth = monthlyTotals.indexOf(maxAmount);
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return { month: monthNames[maxMonth], amount: maxAmount };
  }, [taxTransactions]);

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading tax dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Tax Dashboard</h2>
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
                <strong>Tax Categories Tracked:</strong>
                <br />
                <small>{taxCategories.join(', ')}</small>
              </div>
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
                ${totalTaxPaid.toFixed(2)}
              </h4>
              <p className="card-text">Total Tax Paid</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <h4 className="card-title text-warning">
                ${monthlyAverage.toFixed(2)}
              </h4>
              <p className="card-text">Monthly Average</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <h4 className="card-title text-info">
                ${highestMonth.amount.toFixed(2)}
              </h4>
              <p className="card-text">Highest in {highestMonth.month}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="card">
        <div className="card-body">
          {taxTransactions.length > 0 ? (
            <Bar data={chartData} options={options} />
          ) : (
            <div className="text-center py-5">
              <i className="bi bi-receipt text-muted" style={{ fontSize: '3rem' }}></i>
              <h5 className="text-muted mt-3">No Tax Data Available</h5>
              <p className="text-muted">
                No tax-related transactions found for {selectedYear}.
                Tax categories include: {taxCategories.join(', ')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Details */}
      {taxTransactions.length > 0 && (
        <div className="card mt-4">
          <div className="card-header">
            <h5 className="mb-0">Tax Payment Details</h5>
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
                  {taxTransactions
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                    .map(transaction => (
                      <tr key={transaction.id}>
                        <td>{new Date(transaction.created_at).toLocaleDateString()}</td>
                        <td>{transaction.category}</td>
                        <td className="text-danger fw-bold">${transaction.amount.toFixed(2)}</td>
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

export default TaxDashboard;
