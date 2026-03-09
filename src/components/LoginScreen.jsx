import React, { useEffect } from 'react'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

function waitForGoogle(cb) {
  if (window.google?.accounts) { cb(); return }
  const interval = setInterval(() => {
    if (window.google?.accounts) { clearInterval(interval); cb() }
  }, 100)
}

export default function LoginScreen({ onLogin }) {
  useEffect(() => {
    waitForGoogle(() => {
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: (response) => onLogin(response.credential),
      })
      window.google.accounts.id.renderButton(
        document.getElementById('google-signin-btn'),
        { theme: 'outline', size: 'large', shape: 'pill', width: 280 }
      )
    })
  }, [onLogin])

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.wave}>🌊</div>
        <h1 style={styles.name}>Advita's Swim Tracker</h1>
        <p style={styles.sub}>Log swims · track progress · set PBs</p>
        <div style={styles.divider} />
        <div id="google-signin-btn" style={styles.btnWrap} />
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0a0e1a 0%, #0d1b2e 50%, #0a1628 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 24,
    padding: '48px 40px',
    textAlign: 'center',
    maxWidth: 360,
    width: '90%',
    backdropFilter: 'blur(12px)',
  },
  wave: {
    fontSize: 56,
    marginBottom: 16,
    display: 'block',
  },
  name: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 8,
  },
  sub: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    marginBottom: 32,
  },
  divider: {
    height: 1,
    background: 'rgba(255,255,255,0.1)',
    marginBottom: 32,
  },
  btnWrap: {
    display: 'flex',
    justifyContent: 'center',
  },
}
