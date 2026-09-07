import { NavLink, Outlet } from 'react-router-dom'
import { FiBarChart2, FiLogOut, FiFileText } from 'react-icons/fi'
import { useAuth } from '../context/useAuth.js'

export const AppShell = () => {
  const { user, logout } = useAuth()

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand__mark"><FiBarChart2 /></span><span>Report<span>Manager</span></span></div>
        <nav className="sidebar__nav" aria-label="Main navigation">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link nav-link--active' : 'nav-link'}><FiFileText /> Reports</NavLink>
        </nav>
        <div className="sidebar__footer">
          <div className="profile"><span className="avatar">{user?.name?.charAt(0).toUpperCase()}</span><div><strong>{user?.name}</strong><small>{user?.email}</small></div></div>
          <button className="icon-button" onClick={logout} aria-label="Sign out" title="Sign out"><FiLogOut /></button>
        </div>
      </aside>
      <main className="main-content"><Outlet /></main>
    </div>
  )
}