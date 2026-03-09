import { useState, useCallback } from 'react'

const SHEET_ID = import.meta.env.VITE_SHEET_ID
const BASE = 'https://sheets.googleapis.com/v4/spreadsheets'

// ── helpers ──────────────────────────────────────────────────────────────────

function authHeader(token) {
  return { Authorization: `Bearer ${token}` }
}

async function sheetsGet(token, range) {
  const url = `${BASE}/${SHEET_ID}/values/${encodeURIComponent(range)}`
  const res = await fetch(url, { headers: authHeader(token) })
  if (!res.ok) throw new Error(`Sheets read failed: ${res.status}`)
  const data = await res.json()
  return data.values || []
}

async function sheetsAppend(token, range, rows) {
  const url = `${BASE}/${SHEET_ID}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`
  const res = await fetch(url, {
    method: 'POST',
    headers: { ...authHeader(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ values: rows }),
  })
  if (!res.ok) throw new Error(`Sheets write failed: ${res.status}`)
  return res.json()
}

// Sessions sheet columns: sessionId | date | duration | intensity | mood | notes
// Swims sheet columns:    swimId | sessionId | date | stroke | distance | seconds | displayTime

function rowToSession(row) {
  return {
    sessionId: row[0] || '',
    date:      row[1] || '',
    duration:  row[2] || '',
    intensity: row[3] || '',
    mood:      row[4] || '',
    notes:     row[5] || '',
  }
}

function rowToSwim(row) {
  return {
    swimId:      row[0] || '',
    sessionId:   row[1] || '',
    date:        row[2] || '',
    stroke:      row[3] || '',
    distance:    row[4] || '',
    seconds:     Number(row[5]) || 0,
    displayTime: row[6] || '',
  }
}

// ── hook ──────────────────────────────────────────────────────────────────────

export function useSheets(token) {
  const [sessions, setSessions] = useState([])
  const [swims, setSwims] = useState([])
  const [loading, setLoading] = useState(false)
  const [saveStatus, setSaveStatus] = useState(null) // null | 'saving' | 'saved' | 'error'

  const loadAll = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const [sessionRows, swimRows] = await Promise.all([
        sheetsGet(token, 'Sessions!A2:F'),
        sheetsGet(token, 'Swims!A2:G'),
      ])
      setSessions(sessionRows.map(rowToSession))
      setSwims(swimRows.map(rowToSwim))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [token])

  const saveSession = useCallback(async ({ date, duration, intensity, mood, notes, timedSwims }) => {
    if (!token) return
    setSaveStatus('saving')
    try {
      const sessionId = `s_${Date.now()}`
      const sessionRow = [[sessionId, date, duration, intensity, mood, notes]]
      const swimRows = timedSwims.map((s, i) => [
        `sw_${Date.now()}_${i}`,
        sessionId,
        date,
        s.stroke,
        s.distance,
        s.seconds,
        s.displayTime,
      ])

      const writes = [sheetsAppend(token, 'Sessions!A:F', sessionRow)]
      if (swimRows.length > 0) writes.push(sheetsAppend(token, 'Swims!A:G', swimRows))
      await Promise.all(writes)

      // Optimistic local update
      setSessions(prev => [...prev, rowToSession(sessionRow[0])])
      setSwims(prev => [...prev, ...swimRows.map(rowToSwim)])

      setSaveStatus('saved')
      setTimeout(() => setSaveStatus(null), 3000)
    } catch (e) {
      console.error(e)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus(null), 4000)
    }
  }, [token])

  return { sessions, swims, loading, saveStatus, loadAll, saveSession }
}
