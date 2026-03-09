import React, { useMemo, useState } from 'react'
import SwimChart from '../components/SwimChart'

const STROKES   = ['Freestyle', 'Backstroke', 'Breaststroke', 'Butterfly', 'IM']
const DISTANCES = ['25', '50', '100', '200', '400', '800', '1500']

export default function Progress({ swims, loading }) {
  const [stroke, setStroke]     = useState('Freestyle')
  const [distance, setDistance] = useState('100')

  const pbStats = useMemo(() => {
    const stats = {}
    swims.forEach(s => {
      if (s.seconds <= 0) return
      const key = `${s.stroke}_${s.distance}`
      if (!stats[key] || s.seconds < stats[key].pb) {
        stats[key] = { stroke: s.stroke, distance: s.distance, pb: s.seconds, displayTime: s.displayTime }
      }
    })
    return Object.values(stats).sort((a, b) => a.stroke.localeCompare(b.stroke) || Number(a.distance) - Number(b.distance))
  }, [swims])

  return (
    <div style={styles.page}>
      <div style={styles.inner}>
        <h2 style={styles.heading}>Progress</h2>

        {/* Chart filters */}
        <div style={styles.filters}>
          <select value={stroke} onChange={e => setStroke(e.target.value)} style={styles.select}>
            {STROKES.map(s => <option key={s}>{s}</option>)}
          </select>
          <select value={distance} onChange={e => setDistance(e.target.value)} style={styles.select}>
            {DISTANCES.map(d => <option key={d}>{d}m</option>)}
          </select>
        </div>

        <div style={styles.chartWrap}>
          <SwimChart swims={swims} stroke={stroke} distance={distance} />
        </div>

        {/* PB table */}
        {pbStats.length > 0 && (
          <>
            <h3 style={styles.pbHeading}>Personal Bests</h3>
            <div style={styles.pbGrid}>
              {pbStats.map(s => (
                <div key={`${s.stroke}_${s.distance}`} style={styles.pbCard}>
                  <div style={styles.pbEvent}>{s.distance}m {s.stroke}</div>
                  <div style={styles.pbTime}>{s.displayTime}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {!loading && pbStats.length === 0 && (
          <p style={styles.empty}>Log timed swims to see your progress and PBs here.</p>
        )}
      </div>
    </div>
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
  inner: {
    width: '100%',
    maxWidth: 620,
  },
  heading: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 16,
  },
  filters: {
    display: 'flex',
    gap: 10,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  select: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 8,
    color: '#fff',
    fontSize: 14,
    padding: '8px 12px',
    cursor: 'pointer',
  },
  chartWrap: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: '16px 8px',
    marginBottom: 24,
  },
  pbHeading: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 10,
  },
  pbGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: 10,
  },
  pbCard: {
    background: 'rgba(251,191,36,0.07)',
    border: '1px solid rgba(251,191,36,0.2)',
    borderRadius: 10,
    padding: '12px 14px',
  },
  pbEvent: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginBottom: 4,
  },
  pbTime: {
    color: '#fbbf24',
    fontWeight: 700,
    fontSize: 18,
    fontVariantNumeric: 'tabular-nums',
  },
  empty: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 40,
  },
}
