import React, { useState } from 'react'
import { supabase } from './supabaseClient'

export default function AuthForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [isForgot, setIsForgot] = useState(false)
  const [msg, setMsg] = useState('')

  const handleAuth = async (e) => {
    e.preventDefault()
    setMsg('')
    if (isForgot) {
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      setMsg(error ? error.message : 'Password reset email sent! Check your email.')
    } else if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password })
      setMsg(error ? error.message : 'Sign up successful! Check your email.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      setMsg(error ? error.message : 'Signed in successfully')
    }
  }

  const switchToSignIn = () => {
    setIsSignUp(false)
    setIsForgot(false)
    setMsg('')
  }

  const switchToSignUp = () => {
    setIsSignUp(true)
    setIsForgot(false)
    setMsg('')
  }

  const switchToForgot = () => {
    setIsForgot(true)
    setIsSignUp(false)
    setMsg('')
  }

  return (
    <div className="container">
      <div className="text-center mb-4">
  <img src="assets/logo.png" alt="Budget Buddy" height="200" />
      </div>
      <h3 className="text-center mb-4">
        {isForgot ? 'Reset Password' : isSignUp ? 'Sign Up' : 'Sign In'}
      </h3>
      <form onSubmit={handleAuth} className='mx-2'>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email" className="form-control"
            value={email} onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        {!isForgot && (
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password" className="form-control"
              value={password} onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        )}
        <button type="submit" className="btn btn-primary w-100">
          {isForgot ? 'Send Reset Email' : isSignUp ? 'Sign Up' : 'Sign In'}
        </button>
      </form>
      <div className="mt-3 text-center">
        {!isForgot && (
          <button className="btn btn-link me-2" onClick={switchToSignIn}>
            Sign In
          </button>
        )}
        {!isForgot && (
          <button className="btn btn-link me-2" onClick={switchToSignUp}>
            Sign Up
          </button>
        )}
        {!isSignUp && (
          <button className="btn btn-link" onClick={switchToForgot}>
            Forgot Password?
          </button>
        )}
      </div>
      {msg && <div className="alert alert-info mt-3">{msg}</div>}
    </div>
  )
}
