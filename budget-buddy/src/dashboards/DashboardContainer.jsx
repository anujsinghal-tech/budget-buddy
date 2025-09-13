import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import DashboardSelector from './DashboardSelector';
import { getDashboardConfig } from './dashboardConfig';
import MonthlyExpensesChart from './charts/MonthlyExpensesChart';
import ExpenditureAnalysisChart from './charts/ExpenditureAnalysisChart';
import TaxDashboard from './charts/TaxDashboard';
import InvestmentTrackingDashboard from './charts/InvestmentTrackingDashboard';
import IncomeVsExpensesChart from './charts/IncomeVsExpensesChart';
import SpendingTrendsChart from './charts/SpendingTrendsChart';
import CustomQueryDashboard from './charts/CustomQueryDashboard';

const DashboardContainer = ({ user }) => {
  const [currentDashboard, setCurrentDashboard] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching transactions:', error);
    } else {
      setTransactions(data);
    }
    setLoading(false);
  }, [user.id]);

  useEffect(() => {
    if (currentDashboard) {
      fetchTransactions();
    }
  }, [currentDashboard, fetchTransactions]);

  const handleSelectDashboard = (dashboardId) => {
    setCurrentDashboard(dashboardId);
  };

  const handleBackToSelector = () => {
    setCurrentDashboard(null);
  };

  const renderDashboard = () => {
    const config = getDashboardConfig(currentDashboard);

    if (!config) {
      return <div>Dashboard not found</div>;
    }

    switch (config.component) {
      case 'MonthlyExpensesChart':
        return (
          <MonthlyExpensesChart
            transactions={transactions}
            loading={loading}
            onBack={handleBackToSelector}
          />
        );
      case 'ExpenditureAnalysisChart':
        return (
          <ExpenditureAnalysisChart
            transactions={transactions}
            loading={loading}
            onBack={handleBackToSelector}
          />
        );
      case 'TaxDashboard':
        return (
          <TaxDashboard
            transactions={transactions}
            loading={loading}
            onBack={handleBackToSelector}
          />
        );
      case 'InvestmentTrackingDashboard':
        return (
          <InvestmentTrackingDashboard
            transactions={transactions}
            loading={loading}
            onBack={handleBackToSelector}
          />
        );
      case 'IncomeVsExpensesChart':
        return (
          <IncomeVsExpensesChart
            transactions={transactions}
            loading={loading}
            onBack={handleBackToSelector}
          />
        );
      case 'SpendingTrendsChart':
        return (
          <SpendingTrendsChart
            transactions={transactions}
            loading={loading}
            onBack={handleBackToSelector}
          />
        );
      case 'CustomQueryDashboard':
        return (
          <CustomQueryDashboard
            loading={loading}
            onBack={handleBackToSelector}
          />
        );
      default:
        return (
          <div className="container mt-5">
            <div className="text-center">
              <h3>{config.title}</h3>
              <p className="text-muted">This dashboard is coming soon...</p>
              <button
                className="btn btn-secondary"
                onClick={handleBackToSelector}
              >
                Back to Dashboards
              </button>
            </div>
          </div>
        );
    }
  };

  if (!currentDashboard) {
    return <DashboardSelector onSelectDashboard={handleSelectDashboard} />;
  }

  return renderDashboard();
};

export default DashboardContainer;
