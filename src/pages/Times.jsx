import React, { useMemo } from 'react'

const STROKE_ORDER = ['Freestyle', 'Backstroke', 'Breaststroke', 'Butterfly', 'IM']

export default function Times({ swims, loading }) {
  const grouped = useMemo(() => {
    const map = {}
    swims.forEach(s => {
      if (s.seconds <= 0) return
      const key = s.stroke
      if (!map[key]) map[key] = {}
      if (!map[key][s.distance]) map[key][s.distance] = []
      map[key][s.distance].push(s)
    })
    // sort each group by date desc
    Object.values(map).forEach(byDist =>
      Object.values(byDist).forEach(arr =>
        arr.sort((a, b) => new Date(b.date) - new Date(a.date))
      )
    )
    return map
  }, [swims])

  const strokes = STROKE_ORDER.filter(s => grouped[s])

  if (loading) {
    return <div style={styles.empty}>Loading...</div>
  }

  if (strokes.length === 0) {
    return <div style={styles.empty}>No timed swims yet — add some in Log Session.</div>
  }

  return (
    <div style={styles.page}>
      {strokes.map(stroke => (
        <div key={stroke} style={styles.section}>
          <h2 style={styles.strokeHeading}>{stroke}</h2>
          {Object.entries(grouped[stroke])
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([dist, entries]) => {
              const pb = Math.min(...entries.map(e => e.seconds))
              return (
                <div key={dist} style={styles.distBlock}>
                  <div style={styles.distHeader}>
                    <span style={styles.distLabel}>{dist}m</span>
                    <span style={styles.pbBadge}>PB {fmtTime(pb)}</span>
                  </div>
                  <div style={styles.entryList}>
                    {entries.slice(0, 10).map((e, i) => (
                      <div key={i} style={styles.entryRow}>
                        <span style={styles.entryDate}>{e.date.slice(5)}</span>
                        <span style={{
                          ...styles.entryTime,
                          color: e.seconds === pb ? '#fbbf24' : '#4fc3f7',
                        }}>
                          {e.displayTime} {e.seconds === pb ? '★' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
        </div>
      ))}
    </div>
  )
}

function fmtTime(s) {
  const m = Math.floor(s / 60)
  const sec = (s % 60).toFixed(2).padStart(5, '0')
  return m > 0 ? `${m}:${sec}` : `${s.toFixed(2)}s`
}

const styles = {
  page: {
    minHeight: 'calc(100vh - 49px)',
    background: '#0a0e1a',
    padding: '24px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    alignItems: 'center',
  },
  section: {
    width: '100%',
    maxWidth: 600,
  },
  strokeHeading: {
    color: '#4fc3f7',
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 12,
    borderBottom: '1px solid rgba(79,195,247,0.2)',
    paddingBottom: 8,
  },
  distBlock: {
    marginBottom: 14,
  },
  distHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  distLabel: {
    color: '#fff',
    fontWeight: 600,
    fontSize: 14,
  },
  pbBadge: {
    background: 'rgba(251,191,36,0.12)',
    border: '1px solid rgba(251,191,36,0.3)',
    borderRadius: 6,
    color: '#fbbf24',
    fontSize: 12,
    fontWeight: 600,
    padding: '2px 8px',
  },
  entryList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  entryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: 7,
    padding: '6px 10px',
  },
  entryDate: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 13,
  },
  entryTime: {
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
