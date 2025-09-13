import React from 'react';
import { dashboardConfigs } from './dashboardConfig';

const DashboardSelector = ({ onSelectDashboard }) => {
  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Financial Dashboards</h2>
      <p className="text-center text-muted mb-5">
        Choose a dashboard to visualize your financial data
      </p>

      <div className="row g-4">
        {dashboardConfigs.map((config) => (
          <div key={config.id} className="col-lg-6 col-md-6">
            <div
              className="card h-100 shadow-sm"
              style={{
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 0.125rem 0.25rem rgba(0,0,0,0.075)';
              }}
            >
              <div className="card-body text-center">
                <i className={`bi ${config.icon} text-${config.color}`} style={{ fontSize: '3rem' }}></i>
                <h5 className="card-title mt-3">{config.title}</h5>
                <p className="card-text text-muted">{config.description}</p>
                <button
                  className={`btn btn-${config.color} w-100`}
                  onClick={() => onSelectDashboard(config.id)}
                >
                  View Dashboard
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardSelector;
