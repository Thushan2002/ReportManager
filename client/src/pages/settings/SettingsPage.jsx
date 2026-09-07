import { useState } from 'react'
import { FiLock, FiShield, FiSave } from 'react-icons/fi'
import toast from 'react-hot-toast'
import client from '../../api/client.js'
import { Field } from '../../components/field/Field.jsx'
import { Button } from '../../components/button/Button.jsx'
import { useAuth } from '../../context/useAuth.js'
import '../reports/Reports.scss'

export const SettingsPage = () => {
  const { user } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [savingProfile, setSavingProfile] = useState(false)

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [savingPassword, setSavingPassword] = useState(false)

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      await client.patch('/users/profile/info', { name })
      toast.success('Profile information updated.')
      // update local user in localStorage
      const stored = localStorage.getItem('report-manager-user')
      if (stored) {
        const parsed = JSON.parse(stored)
        parsed.name = name
        localStorage.setItem('report-manager-user', JSON.stringify(parsed))
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update profile')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters')
      return
    }

    setSavingPassword(true)
    try {
      await client.patch('/users/profile/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      })
      toast.success('Password updated successfully.')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not change password')
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div className="workspace-page">
      <header className="page-header">
        <div>
          <span className="eyebrow">Account & Security</span>
          <h1>Personal Settings</h1>
          <p>Manage your account credentials and personal preferences.</p>
        </div>
      </header>

      {/* Account Info Card */}
      <section className="form-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">01 / Profile details</span>
            <h2>Your Identity</h2>
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} style={{ maxWidth: '600px' }}>
          <div className="form-grid form-grid--two" style={{ marginBottom: '16px' }}>
            <Field
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Field
              label="Email Address"
              value={user?.email || ''}
              disabled
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <span className="eyebrow">Assigned Role</span>
            <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className={`status-badge ${user?.role === 10 ? 'status-badge--submitted' : 'status-badge--approved'}`}>
                <FiShield /> {user?.role === 10 ? 'Manager / Administrator' : 'Team Member'}
              </span>
              <small style={{ color: 'var(--color-muted)' }}>
                {user?.role === 10 ? 'Full access to view all reports, analyze team metrics, and review submissions.' : 'Access to create, edit, and manage personal weekly reports.'}
              </small>
            </div>
          </div>

          <Button type="submit" loading={savingProfile}>
            <FiSave /> Update Profile Name
          </Button>
        </form>
      </section>

      {/* Change Password Card */}
      <section className="form-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">02 / Security</span>
            <h2>Change Password</h2>
          </div>
        </div>

        <form onSubmit={handleChangePassword} style={{ maxWidth: '600px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
            <Field
              label="Current Password"
              type="password"
              placeholder="Enter current password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              required
            />
            <Field
              label="New Password"
              type="password"
              minLength="8"
              placeholder="At least 8 characters"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              required
            />
            <Field
              label="Confirm New Password"
              type="password"
              minLength="8"
              placeholder="Re-enter new password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              required
            />
          </div>

          <Button type="submit" loading={savingPassword}>
            <FiLock /> Change Password
          </Button>
        </form>
      </section>
    </div>
  )
}
