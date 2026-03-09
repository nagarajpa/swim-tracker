import React, { useMemo } from 'react'

const INTENSITY_COLOR = {
  Easy: '#4ade80',
  Moderate: '#facc15',
  Hard: '#f97316',
  'Race pace': '#f43f5e',
}

const MOOD_EMOJI = {
  Great: '😄', Good: '🙂', Okay: '😐', Tired: '😴', Rough: '😣',
}

export default function History({ sessions, swims, loading }) {
  const joined = useMemo(() => {
    const swimsBySession = swims.reduce((acc, s) => {
      if (!acc[s.sessionId]) acc[s.sessionId] = []
      acc[s.sessionId].push(s)
      return acc
    }, {})
    return [...sessions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map(s => ({ ...s, swims: swimsBySession[s.sessionId] || [] }))
  }, [sessions, swims])

  if (loading) return <LoadingSkeletons />

  if (joined.length === 0) {
    return (
      <div style={styles.empty}>
        No sessions yet — go log your first swim!
      </div>
    )
  }

  return (
    <div style={styles.page}>
      {joined.map(s => (
        <div key={s.sessionId} style={styles.card}>
          <div style={styles.cardTop}>
            <div>
              <div style={styles.date}>{formatDate(s.date)}</div>
              <div style={styles.meta}>
                {s.duration} mins &nbsp;·&nbsp;
                <span style={{ color: INTENSITY_COLOR[s.intensity] || '#fff' }}>{s.intensity}</span>
                &nbsp;·&nbsp; {MOOD_EMOJI[s.mood] || ''} {s.mood}
              </div>
            </div>
            <div style={styles.swimCount}>{s.swims.length} swim{s.swims.length !== 1 ? 's' : ''}</div>
          </div>
          {s.notes && <p style={styles.notes}>{s.notes}</p>}
          {s.swims.length > 0 && (
            <div style={styles.swimList}>
              {s.swims.map((sw, i) => (
                <div key={i} style={styles.swimRow}>
                  <span style={styles.swimLabel}>{sw.distance}m {sw.stroke}</span>
                  <span style={styles.swimTime}>{sw.displayTime}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function formatDate(str) {
  if (!str) return ''
  const d = new Date(str + 'T00:00:00')
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

function LoadingSkeletons() {
  return (
    <div style={styles.page}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ ...styles.card, opacity: 0.4 }}>
          <div style={{ height: 18, width: 140, background: 'rgba(255,255,255,0.1)', borderRadius: 6 }} />
          <div style={{ height: 14, width: 200, background: 'rgba(255,255,255,0.07)', borderRadius: 6, marginTop: 8 }} />
        </div>
      ))}
    </div>
  )
}

const styles = {
  page: {
    minHeight: 'calc(100vh - 49px)',
    background: '#0a0e1a',
    padding: '24px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 600,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: '16px 18px',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  date: {
    color: '#fff',
    fontWeight: 600,
    fontSize: 15,
  },
  meta: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    marginTop: 3,
  },
  swimCount: {
    color: '#4fc3f7',
    fontSize: 13,
    fontWeight: 600,
  },
  notes: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 13,
    marginTop: 10,
    fontStyle: 'italic',
  },
  swimList: {
    marginTop: 10,
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
  },
  swimRow: {
    display: 'flex',
    justifyContent: 'space-between',
    background: 'rgba(79,195,247,0.07)',
    borderRadius: 7,
    padding: '6px 10px',
  },
  swimLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
  },
  swimTime: {
    color: '#4fc3f7',
    fontWeight: 600,
    fontSize: 13,
    fontVariantNumeric: 'tabular-nums',
  },
  empty: {
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    padding: '80px 16px',
    fontSize: 15,
    background: '#0a0e1a',
    minHeight: 'calc(100vh - 49px)',
  },
}
