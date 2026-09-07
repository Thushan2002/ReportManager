import { useEffect, useState } from 'react'
import { FiEdit3, FiFolder, FiPlus, FiTrash2, FiUsers, FiFileText, FiCheck } from 'react-icons/fi'
import toast from 'react-hot-toast'
import client from '../../api/client.js'
import { Button } from '../../components/button/Button.jsx'
import { Field } from '../../components/field/Field.jsx'
import { Modal } from '../../components/modal/Modal.jsx'
import { Loader } from '../../components/loader/Loader.jsx'
import { useAuth } from '../../context/useAuth.js'
import '../reports/Reports.scss'

export const ProjectsPage = () => {
  const { user } = useAuth()
  const isAdmin = user?.role === 10
  const [projects, setProjects] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  // Project Modal state
  const [showModal, setShowModal] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [formData, setFormData] = useState({ name: '', description: '', members: [] })
  const [saving, setSaving] = useState(false)

  // Delete modal state
  const [projectToDelete, setProjectToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const loadData = async () => {
    try {
      const [projRes, usersRes] = await Promise.all([
        client.get('/projects'),
        client.get('/users').catch(() => ({ data: [] }))
      ])
      setProjects(projRes.data)
      setUsers(usersRes.data)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not load projects')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const openCreateModal = () => {
    setEditingProject(null)
    setFormData({ name: '', description: '', members: [] })
    setShowModal(true)
  }

  const openEditModal = (project) => {
    setEditingProject(project)
    setFormData({
      name: project.name,
      description: project.description || '',
      members: project.members?.map((m) => m._id || m) || []
    })
    setShowModal(true)
  }

  const toggleMemberSelection = (userId) => {
    setFormData((prev) => {
      const exists = prev.members.includes(userId)
      return {
        ...prev,
        members: exists
          ? prev.members.filter((id) => id !== userId)
          : [...prev.members, userId]
      }
    })
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingProject) {
        await client.patch(`/projects/${editingProject._id}`, formData)
        toast.success(`Project "${formData.name}" updated.`)
      } else {
        await client.post('/projects', formData)
        toast.success(`Project "${formData.name}" created.`)
      }
      setShowModal(false)
      loadData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not save project')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!projectToDelete) return
    setDeleting(true)
    try {
      await client.delete(`/projects/${projectToDelete._id}`)
      toast.success(`Project "${projectToDelete.name}" deleted.`)
      setProjectToDelete(null)
      loadData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not delete project')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <Loader fullScreen label="Loading projects" />

  return (
    <div className="workspace-page">
      <header className="page-header">
        <div>
          <span className="eyebrow">Workspace Taxonomy</span>
          <h1>Projects & Categories</h1>
          <p>Organize weekly reports by projects, departments, or initiative tags.</p>
        </div>
        {isAdmin && (
          <Button onClick={openCreateModal}>
            <FiPlus /> New Project
          </Button>
        )}
      </header>

      {/* Projects Grid */}
      <section className="form-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Managed categories</span>
            <h2>{projects.length} Active Projects</h2>
          </div>
        </div>

        <div className="project-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
          {projects.map((project) => (
            <article className="project-card" key={project._id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '14px', minHeight: '140px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <span className="report-row__icon">
                  <FiFolder />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700 }}>{project.name}</h3>
                  <p style={{ color: 'var(--color-muted)', fontSize: '12px', marginTop: '4px', lineHeight: 1.4 }}>
                    {project.description || 'No description provided.'}
                  </p>
                </div>
              </div>

              {/* Assigned Members */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#f8f7f2', borderRadius: '6px', fontSize: '11px', color: 'var(--color-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FiUsers />
                  <span>{project.members?.length || 0} assigned</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FiFileText />
                  <span>{project.reportsCount || 0} reports</span>
                </div>
              </div>

              {/* Members Chip List */}
              {project.members && project.members.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {project.members.map((m) => (
                    <span
                      key={m._id || m}
                      style={{
                        padding: '2px 8px',
                        borderRadius: '12px',
                        background: 'var(--color-green-pale)',
                        color: 'var(--color-green-dark)',
                        fontSize: '11px',
                        fontWeight: 600
                      }}
                    >
                      {m.name || m}
                    </span>
                  ))}
                </div>
              )}

              {isAdmin && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', paddingTop: '10px', borderTop: '1px solid var(--color-line)' }}>
                  <button
                    className="icon-button icon-button--light"
                    onClick={() => openEditModal(project)}
                    title="Edit Project"
                  >
                    <FiEdit3 />
                  </button>
                  <button
                    className="icon-button icon-button--light"
                    onClick={() => setProjectToDelete(project)}
                    title="Delete Project"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              )}
            </article>
          ))}
          {projects.length === 0 && (
            <div className="empty-inline" style={{ gridColumn: '1 / -1' }}>
              No projects created yet. Add one to categorize weekly reports.
            </div>
          )}
        </div>
      </section>

      {/* Create / Edit Project Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingProject ? 'Edit Project / Category' : 'Create New Project'}
      >
        <form onSubmit={handleSave} className="modal-form">
          <Field
            label="Project Name"
            placeholder="e.g. Client A, Internal Tooling, R&D"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <label className="field">
            <span>Description</span>
            <textarea
              className="field__input field__textarea"
              style={{ height: '80px' }}
              placeholder="Brief summary of this project's purpose..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </label>

          {/* Assign Team Members */}
          <div className="field">
            <span>Assign Team Members ({formData.members.length} selected)</span>
            <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid var(--color-line)', borderRadius: '6px', padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px', background: 'var(--color-paper)' }}>
              {users.map((u) => {
                const isSelected = formData.members.includes(u._id)
                return (
                  <div
                    key={u._id}
                    onClick={() => toggleMemberSelection(u._id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 10px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      background: isSelected ? 'var(--color-green-pale)' : 'transparent',
                      color: isSelected ? 'var(--color-green-dark)' : 'inherit',
                      fontSize: '12px'
                    }}
                  >
                    <div>
                      <strong>{u.name}</strong> <small style={{ color: 'var(--color-muted)' }}>({u.email})</small>
                    </div>
                    {isSelected && <FiCheck style={{ color: 'var(--color-green)', strokeWidth: 3 }} />}
                  </div>
                )
              })}
              {users.length === 0 && <span style={{ color: 'var(--color-muted)', fontSize: '12px' }}>No members available to assign.</span>}
            </div>
          </div>

          <div className="modal-actions">
            <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {editingProject ? 'Save Changes' : 'Create Project'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Project Modal */}
      <Modal
        isOpen={Boolean(projectToDelete)}
        onClose={() => setProjectToDelete(null)}
        title="Delete Project"
      >
        <div className="modal-confirm">
          <p>
            Are you sure you want to delete the project <strong>{projectToDelete?.name}</strong>?
          </p>
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setProjectToDelete(null)}>
              Cancel
            </Button>
            <Button className="button--danger" onClick={handleDelete} loading={deleting}>
              <FiTrash2 /> Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
