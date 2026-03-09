import React from 'react'

const TABS = [
  { id: 'log',      label: 'Log' },
  { id: 'history',  label: 'History' },
  { id: 'times',    label: 'Times' },
  { id: 'progress', label: 'Progress' },
]

export default function NavBar({ active, onChange, user, onSignOut }) {
  return (
    <nav style={styles.nav}>
      <div style={styles.tabs}>
        {TABS.map(t => (
          <button
            key={t.id}
            style={{ ...styles.tab, ...(active === t.id ? styles.tabActive : {}) }}
            onClick={() => onChange(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {user && (
        <div style={styles.user}>
          {user.picture && (
            <img src={user.picture} alt="avatar" style={styles.avatar} referrerPolicy="no-referrer" />
          )}
          <button style={styles.signOut} onClick={onSignOut}>Sign out</button>
        </div>
      )}
    </nav>
  )
}

const styles = {
  nav: {
    background: '#0d1b2e',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  tabs: {
    display: 'flex',
    gap: 4,
  },
  tab: {
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.5)',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 500,
    padding: '14px 16px',
    borderBottom: '2px solid transparent',
    transition: 'color 0.15s, border-color 0.15s',
  },
  tabActive: {
    color: '#4fc3f7',
    borderBottom: '2px solid #4fc3f7',
  },
  user: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    border: '1px solid rgba(255,255,255,0.2)',
  },
  signOut: {
    background: 'none',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 6,
    color: 'rgba(255,255,255,0.5)',
    cursor: 'pointer',
    fontSize: 12,
    padding: '4px 10px',
  },
}
