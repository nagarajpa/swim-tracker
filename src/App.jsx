import React, { useState, useEffect, useCallback } from 'react'
import LoginScreen from './components/LoginScreen'
import NavBar from './components/NavBar'
import LogSession from './pages/LogSession'
import History from './pages/History'
import Times from './pages/Times'
import Progress from './pages/Progress'
import { useSheets } from './useSheets'
import * as XLSX from 'xlsx'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '304020342468-h1o4n95654lhiaidfsqrfpj5084mhjnb.apps.googleusercontent.com'
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets'

// Decode a JWT credential from Google Identity Services
function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return {}
  }
}

// Exchange an ID token credential for an access token via OAuth2 implicit flow
function requestAccessToken(clientId, onToken) {
  const client = window.google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: SCOPES,
    callback: (resp) => {
      if (resp.access_token) onToken(resp.access_token)
    },
  })
  client.requestAccessToken()
}

export default function App() {
  const [tab, setTab]           = useState('log')
  const [userInfo, setUserInfo] = useState(null)   // { name, picture, email }
  const [accessToken, setAccessToken] = useState(null)

  const { sessions, swims, loading, saveStatus, loadAll, saveSession } = useSheets(accessToken)

  const handleLogin = useCallback((credential) => {
    const info = parseJwt(credential)
    setUserInfo({ name: info.name, picture: info.picture, email: info.email })
    // Now get an OAuth access token for Sheets API
    requestAccessToken(CLIENT_ID, (token) => {
      setAccessToken(token)
    })
  }, [])

  const handleSignOut = useCallback(() => {
    window.google?.accounts.id.disableAutoSelect()
    setUserInfo(null)
    setAccessToken(null)
  }, [])

  // Load data once we have an access token and whenever the tab that needs data is opened
  useEffect(() => {
    if (accessToken && (tab === 'history' || tab === 'times' || tab === 'progress')) {
      loadAll()
    }
  }, [accessToken, tab, loadAll])

  function handleExport() {
    const wb = XLSX.utils.book_new()
    const sessionSheet = XLSX.utils.json_to_sheet(sessions)
    const swimSheet = XLSX.utils.json_to_sheet(swims)
    XLSX.utils.book_append_sheet(wb, sessionSheet, 'Sessions')
    XLSX.utils.book_append_sheet(wb, swimSheet, 'Swims')
    XLSX.writeFile(wb, 'swim-tracker.xlsx')
  }

  if (!userInfo) {
    return <LoginScreen onLogin={handleLogin} />
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0e1a' }}>
      <NavBar active={tab} onChange={setTab} user={userInfo} onSignOut={handleSignOut} />

      {tab === 'log' && (
        <LogSession onSave={saveSession} saveStatus={saveStatus} />
      )}
      {tab === 'history' && (
        <History sessions={sessions} swims={swims} loading={loading} />
      )}
      {tab === 'times' && (
        <Times swims={swims} loading={loading} />
      )}
      {tab === 'progress' && (
        <Progress swims={swims} loading={loading} />
      )}

      {/* Export button — visible on all tabs */}
      {(sessions.length > 0 || swims.length > 0) && (
        <div style={exportBtnWrap}>
          <button style={exportBtn} onClick={handleExport}>
            Download Excel
          </button>
        </div>
      )}
    </div>
  )
}

const exportBtnWrap = {
  position: 'fixed',
  bottom: 20,
  right: 20,
}

const exportBtn = {
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: 8,
  color: 'rgba(255,255,255,0.6)',
  cursor: 'pointer',
  fontSize: 12,
  padding: '8px 14px',
}
