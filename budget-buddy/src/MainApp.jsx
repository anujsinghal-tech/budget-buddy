import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabaseClient'
import { expenseCategories, creditCategories, investmentCategories, modes } from './categories'
import DashboardContainer from './dashboards/DashboardContainer'

export default function MainApp({ user }) {
  const [currentView, setCurrentView] = useState('home')

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [showExpenseToast, setShowExpenseToast] = useState(false)
  const [showCreditToast, setShowCreditToast] = useState(false)
  const [showInvestmentToast, setShowInvestmentToast] = useState(false)

  const [expenseForm, setExpenseForm] = useState({ amount: '', category: 'Food & Dining', note: '', mode: 'BANK 1', date: new Date().toISOString().split('T')[0] })
  const [creditForm, setCreditForm] = useState({ amount: '', category: '', note: '', mode: 'BANK 1', date: new Date().toISOString().split('T')[0] })

  const [investmentForm, setInvestmentForm] = useState({ amount: '', category: '', note: '', mode: 'BANK 1', date: new Date().toISOString().split('T')[0] })

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (error) {
      alert('Error fetching transactions: ' + error.message)
    } else {
      setTransactions(data)
      setLoaded(true)
    }
    setLoading(false)
  }, [user.id])

  useEffect(() => {
    if (currentView === 'manageRecords' && !loaded) {
      fetchTransactions()
    }
  }, [currentView, loaded, fetchTransactions])

  const handleExpenseSubmit = async (e) => {
    e.preventDefault()
    const { error } = await supabase.from('transactions').insert({
      user_id: user.id,
      amount: parseFloat(expenseForm.amount),
      category: expenseForm.category,
      note: expenseForm.note,
      mode: expenseForm.mode,
      type: 'expense',
      created_at: new Date(expenseForm.date).toISOString()
    })
    if (error) {
      alert('Error adding expense: ' + error.message)
    } else {
      setExpenseForm({ amount: '', category: 'Food & Dining', note: '', mode: 'BANK 1', date: new Date().toISOString().split('T')[0] })
      setShowExpenseToast(true)
      setTimeout(() => setShowExpenseToast(false), 3000)
    }
  }

  const handleCreditSubmit = async (e) => {
    e.preventDefault()
    const { error } = await supabase.from('transactions').insert({
      user_id: user.id,
      amount: parseFloat(creditForm.amount),
      category: creditForm.category,
      note: creditForm.note,
      mode: creditForm.mode,
      type: 'credit',
      created_at: new Date(creditForm.date).toISOString()
    })
    if (error) {
      alert('Error adding credit: ' + error.message)
    } else {
      setCreditForm({ amount: '', category: '', note: '', mode: 'BANK 1', date: new Date().toISOString().split('T')[0] })
      setShowCreditToast(true)
      setTimeout(() => setShowCreditToast(false), 3000)
    }
  }

  const handleEdit = (transaction) => {
    setEditingId(transaction.id)
    setEditForm({ ...transaction })
  }

  const handleSave = async () => {
    const { error } = await supabase
      .from('transactions')
      .update({
        amount: parseFloat(editForm.amount),
        category: editForm.category,
        note: editForm.note,
        mode: editForm.mode,
        created_at: editForm.created_at ? new Date(editForm.created_at).toISOString() : undefined
      })
      .eq('id', editingId)
    if (error) {
      alert('Error updating transaction: ' + error.message)
    } else {
      setTransactions(transactions.map(t => t.id === editingId ? { ...t, ...editForm } : t))
      setEditingId(null)
      setEditForm({})
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
      if (error) {
        alert('Error deleting transaction: ' + error.message)
      } else {
        setTransactions(transactions.filter(t => t.id !== id))
      }
    }
  }

  const handleInvestmentSubmit = async (e) => {
    e.preventDefault()
    const { error } = await supabase.from('transactions').insert({
      user_id: user.id,
      amount: parseFloat(investmentForm.amount),
      category: investmentForm.category,
      note: investmentForm.note,
      mode: investmentForm.mode,
      type: 'investment',
      created_at: new Date(investmentForm.date).toISOString()
    })
    if (error) {
      alert('Error adding investment: ' + error.message)
    } else {
      setInvestmentForm({ amount: '', category: '', note: '', mode: 'BANK 1', date: new Date().toISOString().split('T')[0] })
      setShowInvestmentToast(true)
      setTimeout(() => setShowInvestmentToast(false), 3000)
    }
  }

  const renderHome = () => (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Welcome to Budget Buddy</h1>
      <div className="row g-4">
        <div className="col-lg-4 col-md-6">
          <div className="card h-100 text-center shadow-sm">
            <div className="card-body">
              <i className="bi bi-plus-circle text-success" style={{ fontSize: '3rem' }}></i>
              <h5 className="card-title mt-3">Add Expenses</h5>
              <p className="card-text">Track your daily expenses easily.</p>
              <button className="btn btn-success" onClick={() => setCurrentView('addExpense')}>Add Expense</button>
            </div>
          </div>
        </div>
        <div className="col-lg-4 col-md-6">
          <div className="card h-100 text-center shadow-sm">
            <div className="card-body">
              <i className="bi bi-credit-card text-info" style={{ fontSize: '3rem' }}></i>
              <h5 className="card-title mt-3">Add Credit</h5>
              <p className="card-text">Record your income and credits.</p>
              <button className="btn btn-info" onClick={() => setCurrentView('addCredit')}>Add Credit</button>
            </div>
          </div>
        </div>
        <div className="col-lg-4 col-md-6">
          <div className="card h-100 text-center shadow-sm">
            <div className="card-body">
              <i className="bi bi-graph-up text-warning" style={{ fontSize: '3rem' }}></i>
              <h5 className="card-title mt-3">Add Investment</h5>
              <p className="card-text">Log your investments.</p>
              <button className="btn btn-warning" onClick={() => setCurrentView('addInvestment')}>Add Investment</button>
            </div>
          </div>
        </div>
        <div className="col-lg-4 col-md-6">
          <div className="card h-100 text-center shadow-sm">
            <div className="card-body">
              <i className="bi bi-bar-chart text-primary" style={{ fontSize: '3rem' }}></i>
              <h5 className="card-title mt-3">Go to Dashboard</h5>
              <p className="card-text">View your financial overview.</p>
              <button className="btn btn-primary" onClick={() => setCurrentView('dashboard')}>View Dashboard</button>
            </div>
          </div>
        </div>
        <div className="col-lg-4 col-md-6">
          <div className="card h-100 text-center shadow-sm">
            <div className="card-body">
              <i className="bi bi-pencil-square text-secondary" style={{ fontSize: '3rem' }}></i>
              <h5 className="card-title mt-3">Manage Records</h5>
              <p className="card-text">Update or delete transactions.</p>
              <button className="btn btn-secondary" onClick={() => setCurrentView('manageRecords')}>Manage Records</button>
            </div>
          </div>
        </div>
      </div>
      <hr className="my-5" />
      <div className="text-center mt-5">
        <h4 className="text-muted mb-3">Developed by Anuj Singhal</h4>
        <div className="d-flex justify-content-center gap-4 flex-wrap">
          <a 
            href="https://github.com/anujsinghal-tech/budget-buddy" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn btn-outline-primary btn-sm"
          >
            <i className="bi bi-github me-2"></i>
            View on GitHub
          </a>
          <a 
            href="https://docs.google.com/forms/d/e/1FAIpQLSdxrU2vHVX8W78tVqkHWbwUGT9Wzgw_oZbtKtx437YU8TIcug/viewform?usp=header" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn btn-outline-success btn-sm"
          >
            <i className="bi bi-chat-dots me-2"></i>
            Feedback & Suggestions
          </a>
        </div>
        <p className="text-muted mt-3 small">
          Built with React, Supabase, and Bootstrap
        </p>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return renderHome()
      case 'addExpense':
        return (
          <div className="container mt-5" style={{ maxWidth: '600px' }}>
            <h2 className="text-center mb-4">Add Expense</h2>
            <form onSubmit={handleExpenseSubmit}>
              <div className="text-center mb-4">
                <div className="dropdown">
                  <button className="btn btn-link text-decoration-none p-0" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <i className={`bi ${expenseCategories.find(c => c.name === expenseForm.category)?.icon || 'bi-three-dots'} fs-1`}></i>
                    <h5 className="mt-2">{expenseForm.category || 'Select Category'}</h5>
                  </button>
                  <ul className="dropdown-menu">
                    {expenseCategories.map(cat => (
                      <li key={cat.name}>
                        <a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setExpenseForm({ ...expenseForm, category: cat.name }); }}>
                          <i className={`bi ${cat.icon} me-2`}></i>{cat.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Amount</label>
                <input
                  type="number" step="0.01" className="form-control form-control-lg text-center"
                  value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  required
                  placeholder="0.00"
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Note</label>
                <textarea
                  className="form-control"
                  value={expenseForm.note} onChange={(e) => setExpenseForm({ ...expenseForm, note: e.target.value })}
                  rows="3"
                  placeholder="Add a note (optional)"
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                  required
                />
              </div>
              <div className="text-center mb-4">
                <div className="dropdown">
                  <button className="btn btn-link text-decoration-none p-0" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <i className={`bi ${modes.find(m => m.name === expenseForm.mode)?.icon || 'bi-bank'} fs-1`}></i>
                    <h5 className="mt-2">{expenseForm.mode}</h5>
                  </button>
                  <ul className="dropdown-menu">
                    {modes.map(mode => (
                      <li key={mode.name}>
                        <a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setExpenseForm({ ...expenseForm, mode: mode.name }); }}>
                          <i className={`bi ${mode.icon} me-2`}></i>{mode.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <button type="submit" className="btn btn-success w-100">Add Expense</button>
            </form>
            <div className="toast-container position-fixed top-50 start-50 translate-middle" style={{ zIndex: 1055 }}>
              <div className={`toast ${showExpenseToast ? 'show' : ''}`} role="alert" aria-live="assertive" aria-atomic="true">
                <div className="toast-header">
                  <i className="bi bi-check-circle-fill text-success me-2"></i>
                  <strong className="me-auto">Success</strong>
                  <button type="button" className="btn-close" data-bs-dismiss="toast" aria-label="Close" onClick={() => setShowExpenseToast(false)}></button>
                </div>
                <div className="toast-body">
                  Expense added successfully!
                </div>
              </div>
            </div>
          </div>
        )
      case 'addCredit':
        return (
          <div className="container mt-5" style={{ maxWidth: '600px' }}>
            <h2 className="text-center mb-4">Add Credit</h2>
            <form onSubmit={handleCreditSubmit}>
              <div className="text-center mb-4">
                <div className="dropdown">
                  <button className="btn btn-link text-decoration-none p-0" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <i className={`bi ${creditCategories.find(c => c.name === creditForm.category)?.icon || 'bi-three-dots'} fs-1`}></i>
                    <h5 className="mt-2">{creditForm.category || 'Select Category'}</h5>
                  </button>
                  <ul className="dropdown-menu">
                    {creditCategories.map(cat => (
                      <li key={cat.name}>
                        <a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setCreditForm({ ...creditForm, category: cat.name }); }}>
                          <i className={`bi ${cat.icon} me-2`}></i>{cat.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Amount</label>
                <input
                  type="number" step="0.01" className="form-control form-control-lg text-center"
                  value={creditForm.amount} onChange={(e) => setCreditForm({ ...creditForm, amount: e.target.value })}
                  required
                  placeholder="0.00"
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Note</label>
                <textarea
                  className="form-control"
                  value={creditForm.note} onChange={(e) => setCreditForm({ ...creditForm, note: e.target.value })}
                  rows="3"
                  placeholder="Add a note (optional)"
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={creditForm.date}
                  onChange={(e) => setCreditForm({ ...creditForm, date: e.target.value })}
                  required
                />
              </div>
              <div className="text-center mb-4">
                <div className="dropdown">
                  <button className="btn btn-link text-decoration-none p-0" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <i className={`bi ${modes.find(m => m.name === creditForm.mode)?.icon || 'bi-bank'} fs-1`}></i>
                    <h5 className="mt-2">{creditForm.mode}</h5>
                  </button>
                  <ul className="dropdown-menu">
                    {modes.map(mode => (
                      <li key={mode.name}>
                        <a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setCreditForm({ ...creditForm, mode: mode.name }); }}>
                          <i className={`bi ${mode.icon} me-2`}></i>{mode.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <button type="submit" className="btn btn-info w-100">Add Credit</button>
            </form>
            <div className="toast-container position-fixed top-50 start-50 translate-middle" style={{ zIndex: 1055 }}>
              <div className={`toast ${showCreditToast ? 'show' : ''}`} role="alert" aria-live="assertive" aria-atomic="true">
                <div className="toast-header">
                  <i className="bi bi-check-circle-fill text-success me-2"></i>
                  <strong className="me-auto">Success</strong>
                  <button type="button" className="btn-close" data-bs-dismiss="toast" aria-label="Close" onClick={() => setShowCreditToast(false)}></button>
                </div>
                <div className="toast-body">
                  Credit added successfully!
                </div>
              </div>
            </div>
          </div>
        )
      case 'addInvestment':
        return (
          <div className="container mt-5" style={{ maxWidth: '600px' }}>
            <h2 className="text-center mb-4">Add Investment</h2>
            <form onSubmit={handleInvestmentSubmit}>
              <div className="text-center mb-4">
                <div className="dropdown">
                  <button className="btn btn-link text-decoration-none p-0" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <i className={`bi ${investmentCategories.find(c => c.name === investmentForm.category)?.icon || 'bi-three-dots'} fs-1`}></i>
                    <h5 className="mt-2">{investmentForm.category || 'Select Category'}</h5>
                  </button>
                  <ul className="dropdown-menu">
                    {investmentCategories.map(cat => (
                      <li key={cat.name}>
                        <a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setInvestmentForm({ ...investmentForm, category: cat.name }); }}>
                          <i className={`bi ${cat.icon} me-2`}></i>{cat.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Amount</label>
                <input
                  type="number" step="0.01" className="form-control form-control-lg text-center"
                  value={investmentForm.amount} onChange={(e) => setInvestmentForm({ ...investmentForm, amount: e.target.value })}
                  required
                  placeholder="0.00"
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Note</label>
                <textarea
                  className="form-control"
                  value={investmentForm.note} onChange={(e) => setInvestmentForm({ ...investmentForm, note: e.target.value })}
                  rows="3"
                  placeholder="Add a note (optional)"
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={investmentForm.date}
                  onChange={(e) => setInvestmentForm({ ...investmentForm, date: e.target.value })}
                  required
                />
              </div>
              <div className="text-center mb-4">
                <div className="dropdown">
                  <button className="btn btn-link text-decoration-none p-0" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <i className={`bi ${modes.find(m => m.name === investmentForm.mode)?.icon || 'bi-bank'} fs-1`}></i>
                    <h5 className="mt-2">{investmentForm.mode}</h5>
                  </button>
                  <ul className="dropdown-menu">
                    {modes.map(mode => (
                      <li key={mode.name}>
                        <a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setInvestmentForm({ ...investmentForm, mode: mode.name }); }}>
                          <i className={`bi ${mode.icon} me-2`}></i>{mode.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <button type="submit" className="btn btn-warning w-100">Add Investment</button>
            </form>
            <div className="toast-container position-fixed top-50 start-50 translate-middle" style={{ zIndex: 1055 }}>
              <div className={`toast ${showInvestmentToast ? 'show' : ''}`} role="alert" aria-live="assertive" aria-atomic="true">
                <div className="toast-header">
                  <i className="bi bi-check-circle-fill text-success me-2"></i>
                  <strong className="me-auto">Success</strong>
                  <button type="button" className="btn-close" data-bs-dismiss="toast" aria-label="Close" onClick={() => setShowInvestmentToast(false)}></button>
                </div>
                <div className="toast-body">
                  Investment added successfully!
                </div>
              </div>
            </div>
          </div>
        )
      case 'manageRecords':
        return (
          <div className="container mt-5">
            <h2 className="text-center mb-4">Manage Records</h2>
            {loading ? (
              <div className="text-center">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead className="table-dark">
                    <tr>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Category</th>
                      <th>Note</th>
                      <th>Mode</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(transaction => (
                      <tr key={transaction.id}>
                        {editingId === transaction.id ? (
                          <>
                            <td>
                              <span className={`badge ${transaction.type === 'expense' ? 'bg-danger' : transaction.type === 'credit' ? 'bg-success' : 'bg-warning'}`}>
                                {transaction.type}
                              </span>
                            </td>
                            <td>
                              <input
                                type="number"
                                step="0.01"
                                className="form-control"
                                value={editForm.amount}
                                onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                              />
                            </td>
                            <td>
                              <select
                                className="form-select"
                                value={editForm.category}
                                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                              >
                                {(transaction.type === 'expense' ? expenseCategories : transaction.type === 'credit' ? creditCategories : investmentCategories).map(cat => (
                                  <option key={cat.name} value={cat.name}>{cat.name}</option>
                                ))}
                              </select>
                            </td>
                            <td>
                              <textarea
                                className="form-control"
                                value={editForm.note}
                                onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                                rows="2"
                              />
                            </td>
                            <td>
                              <select
                                className="form-select"
                                value={editForm.mode}
                                onChange={(e) => setEditForm({ ...editForm, mode: e.target.value })}
                              >
                                {modes.map(mode => (
                                  <option key={mode.name} value={mode.name}>{mode.name}</option>
                                ))}
                              </select>
                            </td>
                            <td>
                              <input
                                type="date"
                                className="form-control"
                                value={editForm.created_at ? new Date(editForm.created_at).toISOString().split('T')[0] : ''}
                                onChange={(e) => setEditForm({ ...editForm, created_at: e.target.value })}
                              />
                            </td>
                            <td>
                              <button className="btn btn-success btn-sm me-2" onClick={handleSave}>Save</button>
                              <button className="btn btn-secondary btn-sm" onClick={() => { setEditingId(null); setEditForm({}); }}>Cancel</button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td>
                              <span className={`badge ${transaction.type === 'expense' ? 'bg-danger' : transaction.type === 'credit' ? 'bg-success' : 'bg-warning'}`}>
                                {transaction.type}
                              </span>
                            </td>
                            <td>${transaction.amount.toFixed(2)}</td>
                            <td>{transaction.category}</td>
                            <td>{transaction.note || '-'}</td>
                            <td>{transaction.mode}</td>
                            <td>{new Date(transaction.created_at).toLocaleDateString()}</td>
                            <td>
                              <button className="btn btn-primary btn-sm me-2" onClick={() => handleEdit(transaction)}>Edit</button>
                              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(transaction.id)}>Delete</button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {transactions.length === 0 && (
                  <div className="text-center mt-4">
                    <p className="text-muted">No transactions found. Add some transactions to manage them here.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      case 'dashboard':
        return <DashboardContainer user={user} />
      default:
        return renderHome()
    }
  }

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container-fluid">
          <a className="navbar-brand d-flex align-items-center" href="#" onClick={(e) => { e.preventDefault(); setCurrentView('home'); }}>
            <img src="/logo.png" alt="Budget Buddy" height="40" />
            <span className="ms-2 fw-bold text-primary">Budget Buddy</span>
          </a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto">
              {/* Add nav items here later */}
            </ul>
            <div className="d-flex align-items-center">
              <i className="bi bi-person-circle me-2" style={{ fontSize: '1.5rem' }}></i>
              <span className="navbar-text me-3">{user.email}</span>
              <button className="btn btn-outline-danger btn-sm" onClick={handleSignOut}>
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      {renderContent()}
    </div>
  )
}
