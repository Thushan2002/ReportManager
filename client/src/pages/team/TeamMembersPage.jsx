import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiUserPlus, FiTrash2, FiEdit, FiSearch, FiShield, FiUserCheck, FiFileText, FiFolder, FiExternalLink } from 'react-icons/fi'
import toast from 'react-hot-toast'
import client from '../../api/client.js'
import { Loader } from '../../components/loader/Loader.jsx'
import { Modal } from '../../components/modal/Modal.jsx'
import { Button } from '../../components/button/Button.jsx'
import { Field } from '../../components/field/Field.jsx'
import { useAuth } from '../../context/useAuth.js'
import './Team.scss'

export const TeamMembersPage = () => {
  const { user: currentUser } = useAuth()
  const isAdmin = currentUser?.role === 10
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')

  // Invite Modal state
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', role: '20', password: '' })
  const [inviting, setInviting] = useState(false)

  // Edit Role Modal state
  const [editingUser, setEditingUser] = useState(null)
  const [editRole, setEditRole] = useState('20')
  const [savingRole, setSavingRole] = useState(false)

  // Delete User Confirmation state
  const [userToDelete, setUserToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const loadUsers = async () => {
    try {
      const { data } = await client.get('/users')
      setUsers(data)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not load team members')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    const init = async () => {
      try {
        const { data } = await client.get('/users')
        if (!cancelled) setUsers(data)
      } catch (err) {
        if (!cancelled) toast.error(err.response?.data?.message || 'Could not load team members')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    init()
    return () => { cancelled = true }
  }, [])

  const handleInvite = async (e) => {
    e.preventDefault()
    setInviting(true)
    try {
      await client.post('/auth/invite', {
        ...inviteForm,
        role: Number(inviteForm.role)
      })
      toast.success(`Account created for ${inviteForm.name}`)
      setInviteForm({ name: '', email: '', role: '20', password: '' })
      setShowInviteModal(false)
      loadUsers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create account')
    } finally {
      setInviting(false)
    }
  }

  const handleUpdateRole = async (e) => {
    e.preventDefault()
    if (!editingUser) return
    setSavingRole(true)
    try {
      await client.patch(`/users/${editingUser._id}`, { role: Number(editRole) })
      toast.success(`Role updated for ${editingUser.name}`)
      setEditingUser(null)
      loadUsers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update role')
    } finally {
      setSavingRole(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!userToDelete) return
    setDeleting(true)
    try {
      await client.delete(`/users/${userToDelete._id}`)
      toast.success(`${userToDelete.name} has been removed`)
      setUserToDelete(null)
      loadUsers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete user')
    } finally {
      setDeleting(false)
    }
  }

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
    const matchesRole = !roleFilter || String(u.role) === roleFilter
    return matchesSearch && matchesRole
  })

  if (loading) return <Loader fullScreen label="Loading team roster" />

  return (
    <div className="workspace-page team-page">
      <header className="page-header">
        <div>
          <span className="eyebrow">Team Management</span>
          <h1>People & Access</h1>
          <p>Manage members, assign workspace roles, and monitor participation.</p>
        </div>
        {isAdmin && (
          <button className="button" onClick={() => setShowInviteModal(true)}>
            <FiUserPlus /> Invite Member
          </button>
        )}
      </header>

      {/* Filter and Search Bar */}
      <section className="team-toolbar">
        <div className="search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Search team members by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="team-filters">
          <select
            className="filter-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="10">Managers / Admins</option>
            <option value="20">Team Members</option>
          </select>
        </div>
      </section>

      {/* Team Roster Grid */}
      <section className="team-grid">
        {filteredUsers.map((member) => (
          <div className="team-card" key={member._id}>
            <div className="team-card__header">
              <span className="team-card__avatar">{member.name?.charAt(0).toUpperCase()}</span>
              <div className="team-card__title">
                <h3>{member.name}</h3>
                <small>{member.email}</small>
              </div>
              <span
                className={`role-pill ${member.role === 10 ? 'role-pill--admin' : 'role-pill--member'}`}
              >
                <FiShield /> {member.role === 10 ? 'Manager' : 'Member'}
              </span>
            </div>

            <div className="team-card__meta">
              <div className="meta-item">
                <FiFileText />
                <span>{member.reportsCount || 0} Reports</span>
              </div>
              <div className="meta-item">
                <FiFolder />
                <span>{member.projects?.length || 0} Projects</span>
              </div>
            </div>

            <div className="team-card__footer">
              <Link className="card-link" to={`/team/${member._id}`}>
                View Profile <FiExternalLink />
              </Link>
              {isAdmin && (
                <div className="card-actions">
                  <button
                    className="icon-button icon-button--light"
                    title="Change Role"
                    onClick={() => {
                      setEditingUser(member)
                      setEditRole(String(member.role))
                    }}
                  >
                    <FiEdit />
                  </button>
                  {String(member._id) !== String(currentUser?.id) && (
                    <button
                      className="icon-button icon-button--danger"
                      title="Remove User"
                      onClick={() => setUserToDelete(member)}
                    >
                      <FiTrash2 />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        {filteredUsers.length === 0 && (
          <div className="empty-inline" style={{ gridColumn: '1 / -1' }}>
            No team members matched your search.
          </div>
        )}
      </section>

      {/* Invite Member Modal */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="Invite New Team Member"
      >
        <form onSubmit={handleInvite} className="modal-form">
          <Field
            label="Full Name"
            placeholder="e.g. Maya Lin"
            value={inviteForm.name}
            onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
            required
          />
          <Field
            label="Work Email"
            type="email"
            placeholder="maya@company.com"
            value={inviteForm.email}
            onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
            required
          />
          <label className="field">
            <span>Workspace Role</span>
            <select
              className="field__input"
              value={inviteForm.role}
              onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
            >
              <option value="20">Team Member (Submit weekly reports)</option>
              <option value="10">Manager / Admin (Review reports & insights)</option>
            </select>
          </label>
          <Field
            label="Temporary Password"
            type="password"
            minLength="8"
            placeholder="At least 8 characters"
            value={inviteForm.password}
            onChange={(e) => setInviteForm({ ...inviteForm, password: e.target.value })}
            required
          />
          <div className="modal-actions">
            <Button variant="secondary" type="button" onClick={() => setShowInviteModal(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={inviting}>
              <FiUserCheck /> Create Account
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Role Modal */}
      <Modal
        isOpen={Boolean(editingUser)}
        onClose={() => setEditingUser(null)}
        title={`Change Role: ${editingUser?.name}`}
      >
        <form onSubmit={handleUpdateRole} className="modal-form">
          <p className="modal-desc">
            Select the access role for <strong>{editingUser?.name}</strong> ({editingUser?.email}).
          </p>
          <label className="field">
            <span>Role</span>
            <select
              className="field__input"
              value={editRole}
              onChange={(e) => setEditRole(e.target.value)}
            >
              <option value="20">Team Member</option>
              <option value="10">Manager / Admin</option>
            </select>
          </label>
          <div className="modal-actions">
            <Button variant="secondary" type="button" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button type="submit" loading={savingRole}>
              Save Role
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete User Modal */}
      <Modal
        isOpen={Boolean(userToDelete)}
        onClose={() => setUserToDelete(null)}
        title="Remove Member"
      >
        <div className="modal-confirm">
          <p>
            Are you sure you want to remove <strong>{userToDelete?.name}</strong> from the workspace?
            All their draft reports will be deleted.
          </p>
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setUserToDelete(null)}>
              Cancel
            </Button>
            <Button className="button--danger" onClick={handleDeleteUser} loading={deleting}>
              <FiTrash2 /> Remove Member
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
