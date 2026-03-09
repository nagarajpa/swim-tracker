import React, { useMemo } from 'react'

export default function SwimChart({ swims, stroke, distance }) {
  const filtered = useMemo(() =>
    swims
      .filter(s => s.stroke === stroke && s.distance === distance && s.seconds > 0)
      .sort((a, b) => new Date(a.date) - new Date(b.date)),
    [swims, stroke, distance]
  )

  if (filtered.length < 2) {
    return (
      <div style={styles.empty}>
        Not enough data for {distance}m {stroke} — log at least 2 sessions.
      </div>
    )
  }

  const W = 600, H = 220, PAD = { top: 20, right: 20, bottom: 40, left: 52 }
  const innerW = W - PAD.left - PAD.right
  const innerH = H - PAD.top - PAD.bottom

  const times = filtered.map(s => s.seconds)
  const minT = Math.min(...times) * 0.97
  const maxT = Math.max(...times) * 1.03

  const toX = (i) => PAD.left + (i / (filtered.length - 1)) * innerW
  const toY = (t) => PAD.top + (1 - (t - minT) / (maxT - minT)) * innerH

  const points = filtered.map((s, i) => `${toX(i)},${toY(s.seconds)}`)
  const polyline = points.join(' ')

  const pb = Math.min(...times)
  const pbIdx = times.indexOf(pb)

  function fmtSec(s) {
    const m = Math.floor(s / 60)
    const sec = (s % 60).toFixed(2).padStart(5, '0')
    return m > 0 ? `${m}:${sec}` : `${sec}s`
  }

  // Y-axis ticks
  const yTicks = 4
  const yTickVals = Array.from({ length: yTicks + 1 }, (_, i) =>
    minT + (i / yTicks) * (maxT - minT)
  )

  // X-axis labels: show up to 6 evenly spaced dates
  const xLabelCount = Math.min(filtered.length, 6)
  const xLabelIndices = Array.from({ length: xLabelCount }, (_, i) =>
    Math.round(i * (filtered.length - 1) / (xLabelCount - 1))
  )

  return (
    <div style={styles.wrap}>
      <svg viewBox={`0 0 ${W} ${H}`} style={styles.svg}>
        {/* grid lines */}
        {yTickVals.map((t, i) => (
          <line
            key={i}
            x1={PAD.left} y1={toY(t)}
            x2={W - PAD.right} y2={toY(t)}
            stroke="rgba(255,255,255,0.06)" strokeWidth="1"
          />
        ))}

        {/* Y axis labels */}
        {yTickVals.map((t, i) => (
          <text key={i} x={PAD.left - 6} y={toY(t) + 4}
            textAnchor="end" fill="rgba(255,255,255,0.4)" fontSize="10">
            {fmtSec(t)}
          </text>
        ))}

        {/* X axis labels */}
        {xLabelIndices.map(i => (
          <text key={i}
            x={toX(i)} y={H - PAD.bottom + 16}
            textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9">
            {filtered[i].date.slice(5)}
          </text>
        ))}

        {/* line */}
        <polyline
          points={polyline}
          fill="none"
          stroke="#4fc3f7"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* dots */}
        {filtered.map((s, i) => (
          <circle key={i}
            cx={toX(i)} cy={toY(s.seconds)} r="4"
            fill={i === pbIdx ? '#fbbf24' : '#4fc3f7'}
            stroke="#0d1b2e" strokeWidth="2"
          />
        ))}

        {/* PB label */}
        <text
          x={toX(pbIdx)} y={toY(pb) - 10}
          textAnchor="middle" fill="#fbbf24" fontSize="10" fontWeight="600">
          PB {fmtSec(pb)}
        </text>
      </svg>
    </div>
  )
}

const styles = {
  wrap: { width: '100%', overflowX: 'auto' },
  svg: { width: '100%', maxWidth: 600, display: 'block', margin: '0 auto' },
  empty: {
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    padding: '32px 0',
    fontSize: 14,
  },
}
