import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiArrowRight, FiCheckCircle, FiUserPlus } from 'react-icons/fi'
import { Button } from '../components/Button.jsx'
import { Field } from '../components/Field.jsx'
import { useAuth } from '../context/useAuth.js'

export const RegisterPage = () => {
  const { register, isLoading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const update = (key) => (event) => setForm({ ...form, [key]: event.target.value })
  const submit = async (event) => { event.preventDefault(); try { await register(form); navigate('/') } catch { /* toast carries the error */ } }

  return <main className="auth-page"><section className="auth-aside auth-aside--green"><div className="brand brand--light"><span className="brand__mark"><FiUserPlus /></span><span>Report<span>Manager</span></span></div><div className="auth-aside__copy"><span className="eyebrow">Start with clarity</span><h1>A better home for your next update.</h1><p>Build a shared rhythm around the reports your team relies on.</p></div><div className="aside-note"><FiCheckCircle /> Simple by design. Ready when you are.</div></section><section className="auth-panel"><div className="auth-card"><span className="eyebrow">Create your workspace</span><h2>Make room for better work.</h2><p>Set up your account in less than a minute.</p><form onSubmit={submit} className="auth-form"><Field label="Full name" value={form.name} onChange={update('name')} placeholder="Alex Morgan" required /><Field label="Work email" type="email" value={form.email} onChange={update('email')} placeholder="you@company.com" required /><Field label="Password" type="password" minLength="8" value={form.password} onChange={update('password')} placeholder="At least 8 characters" required /><Button type="submit" loading={isLoading}>Create account <FiArrowRight /></Button></form><div className="auth-footer">Already have an account? <Link to="/login">Sign in <FiArrowRight /></Link></div></div></section></main>
}