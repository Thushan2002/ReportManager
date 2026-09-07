import { useState } from 'react'
import { NavLink, Link, Outlet } from 'react-router-dom'
import {
  FiBarChart2,
  FiLogOut,
  FiFileText,
  FiFolder,
  FiGrid,
  FiUsers,
  FiSettings,
  FiPlus,
  FiMenu,
  FiX
} from 'react-icons/fi'
import { useAuth } from '../../context/useAuth.js'
import './AppShell.scss'

export const AppShell = () => {
  const { user, logout } = useAuth()
  const isManager = user?.role === 10
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const closeMobileNav = () => setMobileNavOpen(false)

  return (
    <div className="app-shell">
      {/* Mobile Topbar */}
      <div className="mobile-topbar">
        <div className="brand">
          <span className="brand__mark">
            <FiBarChart2 />
          </span>
          <span>
            Report<span>Manager</span>
          </span>
        </div>
        <button
          className="mobile-nav-toggle"
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          aria-label="Toggle navigation"
        >
          {mobileNavOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`sidebar ${mobileNavOpen ? 'sidebar--open' : ''}`}>
        <div className="brand desktop-only">
          <span className="brand__mark">
            <FiBarChart2 />
          </span>
          <span>
            Report<span>Manager</span>
          </span>
        </div>

        <nav className="sidebar__nav" aria-label="Main navigation">
          <NavLink
            to="/dashboard"
            end
            onClick={closeMobileNav}
            className={({ isActive }) =>
              isActive ? 'nav-link nav-link--active' : 'nav-link'
            }
          >
            <FiGrid /> Overview
          </NavLink>

          <NavLink
            to="/reports/history"
            onClick={closeMobileNav}
            className={({ isActive }) =>
              isActive ? 'nav-link nav-link--active' : 'nav-link'
            }
          >
            <FiFileText /> My Reports
          </NavLink>

          {!isManager && (
            <NavLink
              to="/reports/new"
              onClick={closeMobileNav}
              className={({ isActive }) =>
                isActive ? 'nav-link nav-link--active' : 'nav-link'
              }
            >
              <FiPlus /> New Report
            </NavLink>
          )}

          {isManager && (
            <>
              <NavLink
                to="/team"
                onClick={closeMobileNav}
                className={({ isActive }) =>
                  isActive ? 'nav-link nav-link--active' : 'nav-link'
                }
              >
                <FiUsers /> Team Members
              </NavLink>

              <NavLink
                to="/projects"
                onClick={closeMobileNav}
                className={({ isActive }) =>
                  isActive ? 'nav-link nav-link--active' : 'nav-link'
                }
              >
                <FiFolder /> Projects
              </NavLink>
            </>
          )}

          <NavLink
            to="/settings"
            onClick={closeMobileNav}
            className={({ isActive }) =>
              isActive ? 'nav-link nav-link--active' : 'nav-link'
            }
          >
            <FiSettings /> Settings
          </NavLink>
        </nav>

        <div className="sidebar__footer">
          <Link to="/settings" className="profile" onClick={closeMobileNav} title="Account settings">
            <span className="avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
            <div>
              <strong>{user?.name}</strong>
              <small>
                {isManager ? 'Manager / Admin' : 'Team Member'}
              </small>
            </div>
          </Link>
          <button
            className="icon-button"
            onClick={logout}
            aria-label="Sign out"
            title="Sign out"
          >
            <FiLogOut />
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
