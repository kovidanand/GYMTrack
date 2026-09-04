import { useState } from 'react'
import { User, Mail, Target, Dumbbell, Calendar, Ruler, Weight, Trophy, Bell, Moon, Globe } from 'lucide-react'
import { PageHeader, SectionHeader, Avatar, Badge } from '@/components/shared'
import { personalRecords } from '@/data/progress'
import { mockUser } from '@/data/users'
import { capitalise } from '@/lib/utils'

const fitnessGoalLabel: Record<string, string> = {
  build_muscle:       'Build Muscle',
  lose_weight:        'Lose Weight',
  improve_strength:   'Improve Strength',
  increase_endurance: 'Increase Endurance',
  maintain_fitness:   'Maintain Fitness',
  improve_flexibility:'Improve Flexibility',
}

export default function Profile() {
  const user = mockUser
  const [units, setUnits]             = useState<'metric' | 'imperial'>('metric')
  const [darkMode, setDarkMode]       = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [reminders, setReminders]     = useState(true)
  const [showSaveToast, setShowSaveToast] = useState(false)

  const handleSave = () => {
    setShowSaveToast(true)
    setTimeout(() => setShowSaveToast(false), 3000)
  }

  return (
    <div className="animate-fade-in space-y-8">
      <PageHeader title="Profile" description="Manage your account and fitness preferences." />

      {/* Toast */}
      {showSaveToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-20 right-4 z-50 bg-surface-900 text-white text-sm px-4 py-3 rounded-xl shadow-lg animate-slide-up"
        >
          ✅ Settings saved (Phase 1 — not persisted)
        </div>
      )}

      {/* ── Profile Card ── */}
      <section aria-label="Profile information">
        <div className="card p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <Avatar name={user.name} size="xl" />
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl font-bold text-surface-900">{user.name}</h2>
              <p className="text-surface-500 text-sm">{user.email}</p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
                <Badge variant="brand">{fitnessGoalLabel[user.fitnessGoal]}</Badge>
                <Badge variant="outline">{capitalise(user.experienceLevel)}</Badge>
                <Badge variant="outline">{user.trainingFrequency} days/week</Badge>
              </div>
            </div>
            <button
              className="btn-secondary text-sm flex-shrink-0"
              onClick={handleSave}
              id="profile-edit-btn"
              aria-label="Edit profile (Phase 2)"
            >
              Edit Profile
            </button>
          </div>
        </div>
      </section>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* ── Body Information ── */}
        <section aria-label="Body information">
          <SectionHeader title="Body Information" />
          <div className="card p-5 space-y-4">
            {[
              { icon: <Ruler size={16} />,   label: 'Height', value: `${user.bodyStats.height} cm` },
              { icon: <Weight size={16} />,  label: 'Weight', value: `${user.bodyStats.weight} kg` },
              { icon: <Calendar size={16} />, label: 'Age',   value: `${user.bodyStats.age} years` },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-lg bg-surface-50 flex items-center justify-center text-surface-500 flex-shrink-0">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <p className="text-xs text-surface-500">{item.label}</p>
                  <p className="text-sm font-semibold text-surface-900">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Fitness Information ── */}
        <section aria-label="Fitness information">
          <SectionHeader title="Fitness Information" />
          <div className="card p-5 space-y-4">
            {[
              { icon: <Target size={16} />,    label: 'Primary Goal',        value: fitnessGoalLabel[user.fitnessGoal] },
              { icon: <User size={16} />,      label: 'Experience Level',    value: capitalise(user.experienceLevel) },
              { icon: <Dumbbell size={16} />,  label: 'Preferred Equipment', value: user.preferredEquipment.map(capitalise).join(', ') },
              { icon: <Calendar size={16} />,  label: 'Training Frequency',  value: `${user.trainingFrequency} days per week` },
              { icon: <Mail size={16} />,      label: 'Member Since',        value: new Date(user.joinedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-lg bg-surface-50 flex items-center justify-center text-surface-500 flex-shrink-0">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-surface-500">{item.label}</p>
                  <p className="text-sm font-semibold text-surface-900 truncate">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ── Personal Records ── */}
      <section aria-label="Personal records">
        <SectionHeader title="Personal Records" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {personalRecords.map(pr => (
            <div key={pr.id} className="card p-4 text-center">
              <Trophy size={18} className="text-amber-400 mx-auto mb-2" aria-hidden="true" />
              <p className="text-xs text-surface-500 mb-1 leading-snug">{pr.exerciseName}</p>
              <p className="text-lg font-bold text-brand-600">{pr.value}</p>
              <p className="text-xs text-surface-400">{pr.unit}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Settings ── */}
      <section aria-label="App settings">
        <SectionHeader title="Settings" />
        <div className="card p-5 space-y-0 divide-y divide-surface-100">

          {/* Units */}
          <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-surface-50 flex items-center justify-center">
                <Globe size={16} className="text-surface-500" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-medium text-surface-900">Units</p>
                <p className="text-xs text-surface-500">Weight and measurement units</p>
              </div>
            </div>
            <div className="flex rounded-lg border border-surface-200 overflow-hidden" role="group" aria-label="Unit selection">
              {(['metric', 'imperial'] as const).map(u => (
                <button
                  key={u}
                  id={`settings-units-${u}`}
                  onClick={() => setUnits(u)}
                  aria-pressed={units === u}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                    units === u
                      ? 'bg-brand-500 text-white'
                      : 'bg-white text-surface-600 hover:bg-surface-50'
                  }`}
                >
                  {u === 'metric' ? 'kg / cm' : 'lb / in'}
                </button>
              ))}
            </div>
          </div>

          {/* Dark Mode */}
          <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-surface-50 flex items-center justify-center">
                <Moon size={16} className="text-surface-500" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-medium text-surface-900">Dark Mode</p>
                <p className="text-xs text-surface-500">Coming in Phase 2</p>
              </div>
            </div>
            <ToggleSwitch
              id="settings-dark-mode"
              checked={darkMode}
              onChange={setDarkMode}
              label="Dark mode"
            />
          </div>

          {/* Notifications */}
          <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-surface-50 flex items-center justify-center">
                <Bell size={16} className="text-surface-500" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-medium text-surface-900">Notifications</p>
                <p className="text-xs text-surface-500">Progress updates and achievements</p>
              </div>
            </div>
            <ToggleSwitch
              id="settings-notifications"
              checked={notifications}
              onChange={setNotifications}
              label="Notifications"
            />
          </div>

          {/* Workout Reminders */}
          <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-surface-50 flex items-center justify-center">
                <Calendar size={16} className="text-surface-500" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-medium text-surface-900">Workout Reminders</p>
                <p className="text-xs text-surface-500">Daily reminders to stay on track</p>
              </div>
            </div>
            <ToggleSwitch
              id="settings-reminders"
              checked={reminders}
              onChange={setReminders}
              label="Workout reminders"
            />
          </div>
        </div>
      </section>

      {/* Save button */}
      <div className="flex justify-end">
        <button className="btn-primary" onClick={handleSave} id="profile-save-btn">
          Save Changes
        </button>
      </div>
    </div>
  )
}

// ─── Toggle Switch ─────────────────────────────────────────────────────────────

interface ToggleSwitchProps {
  id: string
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}

function ToggleSwitch({ id, checked, onChange, label }: ToggleSwitchProps) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 ${
        checked ? 'bg-brand-500' : 'bg-surface-200'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
        aria-hidden="true"
      />
    </button>
  )
}
