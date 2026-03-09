import React, { useState } from 'react'

const STROKES   = ['Freestyle', 'Backstroke', 'Breaststroke', 'Butterfly', 'IM']
const DISTANCES = ['25', '50', '100', '200', '400', '800', '1500']
const INTENSITIES = ['Easy', 'Moderate', 'Hard', 'Race pace']
const MOODS = ['Great', 'Good', 'Okay', 'Tired', 'Rough']

function today() {
  return new Date().toISOString().slice(0, 10)
}

export default function LogSession({ onSave, saveStatus }) {
  const [date, setDate]           = useState(today())
  const [duration, setDuration]   = useState('')
  const [intensity, setIntensity] = useState('Moderate')
  const [mood, setMood]           = useState('Good')
  const [notes, setNotes]         = useState('')
  const [swims, setSwims]         = useState([])

  // new swim form
  const [stroke, setStroke]     = useState('Freestyle')
  const [distance, setDistance] = useState('100')
  const [mins, setMins]         = useState('')
  const [secs, setSecs]         = useState('')

  function addSwim() {
    const m = parseInt(mins) || 0
    const s = parseFloat(secs) || 0
    if (m === 0 && s === 0) return
    const seconds = m * 60 + s
    const displayTime = m > 0
      ? `${m}:${String(Math.floor(s)).padStart(2, '0')}.${String(secs).split('.')[1] || '0'}`
      : `${s}s`
    setSwims(prev => [...prev, { stroke, distance, seconds, displayTime }])
    setMins('')
    setSecs('')
  }

  function removeSwim(i) {
    setSwims(prev => prev.filter((_, idx) => idx !== i))
  }

  function handleSave() {
    if (!date || !duration) return
    onSave({ date, duration, intensity, mood, notes, timedSwims: swims })
    setSwims([])
    setNotes('')
    setDuration('')
  }

  const saving = saveStatus === 'saving'

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.heading}>Log Session</h2>

        <div style={styles.row}>
          <Field label="Date">
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={styles.input} />
          </Field>
          <Field label="Duration (mins)">
            <input type="number" placeholder="60" value={duration}
              onChange={e => setDuration(e.target.value)} style={styles.input} />
          </Field>
        </div>

        <div style={styles.row}>
          <Field label="Intensity">
            <Select value={intensity} onChange={setIntensity} options={INTENSITIES} />
          </Field>
          <Field label="Mood">
            <Select value={mood} onChange={setMood} options={MOODS} />
          </Field>
        </div>

        <Field label="Notes (optional)">
          <textarea value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="How did it feel?" rows={2} style={{ ...styles.input, resize: 'vertical' }} />
        </Field>

        {/* Timed swims */}
        <div style={styles.section}>
          <h3 style={styles.subheading}>Timed Swims</h3>

          <div style={styles.swimRow}>
            <Select value={stroke} onChange={setStroke} options={STROKES} />
            <Select value={distance} onChange={setDistance} options={DISTANCES} suffix="m" />
            <input type="number" placeholder="mins" value={mins}
              onChange={e => setMins(e.target.value)} style={{ ...styles.input, width: 72 }} />
            <input type="number" placeholder="secs" value={secs} step="0.01"
              onChange={e => setSecs(e.target.value)} style={{ ...styles.input, width: 88 }} />
            <button style={styles.addBtn} onClick={addSwim}>+ Add</button>
          </div>

          {swims.length > 0 && (
            <div style={styles.swimList}>
              {swims.map((s, i) => (
                <div key={i} style={styles.swimItem}>
                  <span style={styles.swimLabel}>{s.distance}m {s.stroke}</span>
                  <span style={styles.swimTime}>{s.displayTime}</span>
                  <button style={styles.removeBtn} onClick={() => removeSwim(i)}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          style={{ ...styles.saveBtn, opacity: saving ? 0.6 : 1 }}
          onClick={handleSave}
          disabled={saving || !date || !duration}
        >
          {saving ? 'Saving...' : 'Save Session'}
        </button>

        {saveStatus === 'saved' && (
          <p style={styles.savedMsg}>Saved to Google Drive ✓</p>
        )}
        {saveStatus === 'error' && (
          <p style={{ ...styles.savedMsg, color: '#f87171' }}>Save failed — check your connection.</p>
        )}
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
      <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 500 }}>{label}</label>
      {children}
    </div>
  )
}

function Select({ value, onChange, options, suffix = '' }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} style={styles.input}>
      {options.map(o => (
        <option key={o} value={o}>{o}{suffix}</option>
      ))}
    </select>
  )
}

const styles = {
  page: {
    minHeight: 'calc(100vh - 49px)',
    background: '#0a0e1a',
    padding: '24px 16px',
    display: 'flex',
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 600,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  heading: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 4,
  },
  subheading: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 10,
  },
  row: {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
  },
  input: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 8,
    color: '#fff',
    fontSize: 14,
    padding: '10px 12px',
    width: '100%',
    outline: 'none',
  },
  section: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 16,
  },
  swimRow: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  addBtn: {
    background: '#1e3a5f',
    border: 'none',
    borderRadius: 8,
    color: '#4fc3f7',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    padding: '10px 16px',
    whiteSpace: 'nowrap',
  },
  swimList: {
    marginTop: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  swimItem: {
    background: 'rgba(79,195,247,0.08)',
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
    gap: 8,
  },
  swimLabel: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
  },
  swimTime: {
    color: '#4fc3f7',
    fontWeight: 600,
    fontSize: 14,
    fontVariantNumeric: 'tabular-nums',
  },
  removeBtn: {
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.4)',
    cursor: 'pointer',
    fontSize: 18,
    lineHeight: 1,
    padding: '0 4px',
  },
  saveBtn: {
    background: 'linear-gradient(135deg, #1a6fc4, #1a9dc4)',
    border: 'none',
    borderRadius: 10,
    color: '#fff',
    cursor: 'pointer',
    fontSize: 15,
    fontWeight: 700,
    padding: '14px',
    marginTop: 8,
  },
  savedMsg: {
    color: '#4ade80',
    fontSize: 13,
    textAlign: 'center',
  },
}
