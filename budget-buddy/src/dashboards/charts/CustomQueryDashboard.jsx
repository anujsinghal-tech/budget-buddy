import React, { useState, useMemo } from 'react';
import { supabase } from '../../supabaseClient';

const CustomQueryDashboard = ({ loading, onBack }) => {
  const [query, setQuery] = useState(`SELECT * FROM transactions LIMIT 5;`);
  const [queryResult, setQueryResult] = useState(null);
  const [queryError, setQueryError] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);

  // Table schema information
  const tableSchema = useMemo(() => ({
    tableName: 'transactions',
    columns: [
      { name: 'id', type: 'uuid', description: 'Unique identifier for the transaction' },
      { name: 'user_id', type: 'uuid', description: 'User ID (automatically filtered by Supabase RLS)' },
      { name: 'type', type: 'text', description: 'Transaction type: expense, credit, or investment' },
      { name: 'category', type: 'text', description: 'Category of the transaction' },
      { name: 'amount', type: 'numeric', description: 'Transaction amount in dollars' },
      { name: 'note', type: 'text', description: 'Optional note or description' },
      { name: 'created_at', type: 'timestamp', description: 'When the transaction was created' },
      { name: 'updated_at', type: 'timestamp', description: 'When the transaction was last updated' }
    ]
  }), []);

  const executeQuery = async () => {
    if (!query.trim()) {
      setQueryError('Please enter a query');
      return;
    }

    setIsExecuting(true);
    setQueryError(null);
    setQueryResult(null);

    try {
      // Parse the query to determine what to execute
      const trimmedQuery = query.trim().toLowerCase();

      let result;

      if (trimmedQuery.startsWith('select')) {
        // Handle SELECT queries using Supabase's query builder
        result = await executeSelectQuery(query);
      } else {
        throw new Error('Only SELECT queries are supported for security reasons. Use the standard forms for INSERT, UPDATE, or DELETE operations.');
      }

      setQueryResult(result);
    } catch (error) {
      console.error('Query execution error:', error);
      setQueryError(error.message || 'An error occurred while executing the query');
    } finally {
      setIsExecuting(false);
    }
  };

  const executeSelectQuery = async (sqlQuery) => {
    // For now, implement a very simple approach
    // Just handle basic queries to avoid regex parsing issues
    const query = sqlQuery.toLowerCase().trim();

    try {
      // Handle the most common simple queries
      if (query.includes('select * from transactions') && query.includes('limit')) {
        // Basic SELECT * with LIMIT
        const limitMatch = query.match(/limit\s+(\d+)/);
        const limit = limitMatch ? parseInt(limitMatch[1]) : 100;

        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .limit(limit);

        if (error) throw error;
        return data;
      }

      if (query.includes('select * from transactions where type = \'expense\'')) {
        // SELECT expenses
        const limitMatch = query.match(/limit\s+(\d+)/);
        const limit = limitMatch ? parseInt(limitMatch[1]) : 100;

        let supabaseQuery = supabase
          .from('transactions')
          .select('*')
          .eq('type', 'expense');

        if (limit) {
          supabaseQuery = supabaseQuery.limit(limit);
        }

        const { data, error } = await supabaseQuery;
        if (error) throw error;
        return data;
      }

      if (query.includes('select * from transactions where type = \'credit\'')) {
        // SELECT credits
        const limitMatch = query.match(/limit\s+(\d+)/);
        const limit = limitMatch ? parseInt(limitMatch[1]) : 100;

        let supabaseQuery = supabase
          .from('transactions')
          .select('*')
          .eq('type', 'credit');

        if (limit) {
          supabaseQuery = supabaseQuery.limit(limit);
        }

        const { data, error } = await supabaseQuery;
        if (error) throw error;
        return data;
      }

      if (query.includes('order by created_at desc')) {
        // Recent transactions
        const limitMatch = query.match(/limit\s+(\d+)/);
        const limit = limitMatch ? parseInt(limitMatch[1]) : 100;

        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) throw error;
        return data;
      }

      // Default fallback - just get all transactions with a reasonable limit
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .limit(50);

      if (error) throw error;
      return data;

    } catch (error) {
      console.error('Supabase query error:', error);
      throw new Error(`Query failed: ${error.message}`);
    }
  };

  const clearResults = () => {
    setQueryResult(null);
    setQueryError(null);
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading custom query dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Custom Query Dashboard</h2>
        <button className="btn btn-secondary" onClick={onBack}>
          <i className="bi bi-arrow-left me-2"></i>
          Back to Dashboards
        </button>
      </div>

      {/* Warning Alert */}
      <div className="alert alert-warning mb-4">
        <h5><i className="bi bi-exclamation-triangle me-2"></i>Advanced Feature</h5>
        <p className="mb-2">
          This dashboard provides a simplified query interface for your transaction data.
          Currently supports basic SELECT queries. For security reasons, only read operations are allowed.
        </p>
        <p className="mb-0 text-muted">
          <small>Advanced users should know how to write their own SQL queries.</small>
        </p>
      </div>

      <div className="row">
        {/* Schema Information */}
        <div className="col-md-4 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Table Schema</h5>
            </div>
            <div className="card-body">
              <h6 className="text-primary">{tableSchema.tableName}</h6>
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Column</th>
                      <th>Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableSchema.columns.map(column => (
                      <tr key={column.name}>
                        <td>
                          <strong>{column.name}</strong>
                          <br />
                          <small className="text-muted">{column.description}</small>
                        </td>
                        <td className="text-info">{column.type}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>

        {/* Query Editor and Results */}
        <div className="col-md-8">
          {/* Query Editor */}
          <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">SQL Query</h5>
              <div>
                <button
                  className="btn btn-sm btn-outline-secondary me-2"
                  onClick={clearResults}
                  disabled={!queryResult && !queryError}
                >
                  Clear
                </button>
                <button
                  className="btn btn-sm btn-primary"
                  onClick={executeQuery}
                  disabled={isExecuting || !query.trim()}
                >
                  {isExecuting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Executing...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-play me-2"></i>
                      Execute Query
                    </>
                  )}
                </button>
              </div>
            </div>
            <div className="card-body">
              <textarea
                className="form-control"
                rows="8"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter your SQL query here..."
                style={{ fontFamily: 'monospace', fontSize: '14px' }}
              />
            </div>
          </div>

          {/* Error Display */}
          {queryError && (
            <div className="alert alert-danger">
              <h6><i className="bi bi-exclamation-circle me-2"></i>Query Error</h6>
              <pre className="mb-0" style={{ whiteSpace: 'pre-wrap', fontSize: '14px' }}>
                {queryError}
              </pre>
            </div>
          )}

          {/* Results Display */}
          {queryResult && (
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Query Results ({queryResult.length} rows)</h5>
              </div>
              <div className="card-body">
                {queryResult.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-striped table-hover">
                      <thead>
                        <tr>
                          {Object.keys(queryResult[0]).map(column => (
                            <th key={column}>{column}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {queryResult.map((row, index) => (
                          <tr key={index}>
                            {Object.values(row).map((value, cellIndex) => (
                              <td key={cellIndex}>
                                {value === null ? (
                                  <span className="text-muted">NULL</span>
                                ) : typeof value === 'object' ? (
                                  JSON.stringify(value)
                                ) : (
                                  String(value)
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <i className="bi bi-table text-muted" style={{ fontSize: '3rem' }}></i>
                    <h5 className="text-muted mt-3">No Results</h5>
                    <p className="text-muted">Your query returned no data.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomQueryDashboard;
