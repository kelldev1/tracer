import React, { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import { DateTime } from 'luxon'
import { API_BASE_URL as API } from '../config'

const T = {
  border:  'rgba(200,168,120,0.18)',
  border2: 'rgba(200,168,120,0.08)',
  ink:     'rgba(255,245,215,0.92)',
  muted:   'rgba(200,168,120,0.5)',
  accent:  '#c8a878',
  green:   '#52d47a',
  red:     '#e05555',
  mono:    'var(--mono, "JetBrains Mono", monospace)',
  font:    'var(--font, "Space Grotesk", sans-serif)',
}

const TYPE_ICONS = {
  person:   '◈',
  email:    '◎',
  username: '◉',
  ip:       '◇',
  domain:   '◆',
  phone:    '◍',
}

function fmtRows(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}k`
  return String(n)
}

function Card({ label, hint, children }) {
  return (
    <div style={{
      border: `1px solid ${T.border}`, borderRadius: 14,
      background: 'rgba(0,0,0,0.28)', backdropFilter: 'blur(12px)',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '10px 14px 0',
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      }}>
        <span style={{ fontSize: 10, letterSpacing: 2, color: T.ink, fontFamily: T.mono }}>{label}</span>
        <span style={{ fontSize: 10, color: T.muted, fontFamily: T.mono }}>{hint}</span>
      </div>
      <div style={{ padding: 12 }}>{children}</div>
    </div>
  )
}

function Skeleton({ rows = 3 }) {
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} style={{
          height: 14, width: `${90 - i * 10}%`, borderRadius: 6,
          border: `1px solid ${T.border}`,
          background: `linear-gradient(90deg, rgba(200,168,120,0.04), rgba(200,168,120,0.14), rgba(200,168,120,0.04))`,
          backgroundSize: '220% 100%',
          animation: 'shimmer 1.15s linear infinite',
        }} />
      ))}
    </div>
  )
}

export default function OpsBoard() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(null)

  const fetchStats = useCallback(async () => {
    try {
      const { data: res } = await axios.get(`${API}/stats`, { timeout: 6000 })
      setData(res)
    } catch {
      setData({ db: 'offline', tables: [], recent: [] })
    } finally {
      setLoading(false)
      setLastRefresh(DateTime.now())
    }
  }, [])

  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = '@keyframes shimmer{0%{background-position:0% 0}100%{background-position:220% 0}}'
    document.head.appendChild(style)
    fetchStats()
    const interval = setInterval(fetchStats, 30_000)
    return () => { clearInterval(interval); document.head.removeChild(style) }
  }, [fetchStats])

  const dbOnline = data?.db === 'online'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>

      {/* ── Toolbar ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%', display: 'inline-block',
            background: dbOnline ? T.green : T.red,
            boxShadow: `0 0 6px ${dbOnline ? T.green : T.red}`,
          }} />
          <span style={{ fontSize: 10, fontFamily: T.mono, color: dbOnline ? T.green : T.red, letterSpacing: 1 }}>
            DB {dbOnline ? 'ONLINE' : 'OFFLINE'}
          </span>
        </div>
        <button
          onClick={fetchStats}
          style={{
            appearance: 'none', cursor: 'pointer',
            border: '1px dashed rgba(200,168,120,0.25)',
            background: 'transparent', color: T.muted,
            padding: '5px 12px', borderRadius: 999,
            fontFamily: T.mono, fontSize: 10, letterSpacing: 1.5,
          }}
        >
          Refresh
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 10 }}>

        {/* ── Tables DB ── */}
        <Card
          label="SOURCES DE DONNÉES"
          hint={lastRefresh ? `mis à jour ${lastRefresh.toFormat('HH:mm:ss')}` : '—'}
        >
          {loading ? <Skeleton rows={5} /> : !dbOnline ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>⊘</div>
              <div style={{ fontSize: 11, fontFamily: T.mono, color: T.red, marginBottom: 4 }}>
                BASE INACCESSIBLE
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', fontFamily: T.mono }}>
                PC pote éteint ou Tailscale coupé
              </div>
            </div>
          ) : data.tables.length === 0 ? (
            <div style={{ fontSize: 11, fontFamily: T.mono, color: 'rgba(255,255,255,0.3)', padding: '12px 0' }}>
              Aucune table détectée
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {data.tables.map(t => (
                <div key={t.name} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '7px 10px', borderRadius: 8,
                  border: `1px dashed ${T.border2}`,
                  background: 'rgba(200,168,120,0.02)',
                }}>
                  <span style={{ fontSize: 11, fontFamily: T.mono, color: T.ink }}>{t.name}</span>
                  <span style={{
                    fontSize: 12, fontFamily: T.mono, color: T.accent,
                    fontWeight: 600, letterSpacing: 0.5,
                  }}>
                    {fmtRows(t.rows)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* ── Dernières recherches ── */}
        <Card label="DERNIÈRES RECHERCHES" hint="searches table">
          {loading ? <Skeleton rows={5} /> : !dbOnline ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 11, fontFamily: T.mono, color: 'rgba(255,255,255,0.2)' }}>
                — hors ligne —
              </div>
            </div>
          ) : data.recent.length === 0 ? (
            <div style={{ fontSize: 11, fontFamily: T.mono, color: 'rgba(255,255,255,0.25)', padding: '12px 0' }}>
              Aucune recherche enregistrée
            </div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 6 }}>
              {data.recent.map((r, i) => (
                <li key={i} style={{
                  display: 'grid', gridTemplateColumns: '18px 1fr auto',
                  gap: 8, alignItems: 'center', padding: '7px 10px',
                  borderRadius: 8, border: `1px dashed ${T.border}`,
                  background: 'rgba(200,168,120,0.02)',
                }}>
                  <span style={{ fontSize: 13, color: T.accent }}>
                    {TYPE_ICONS[r.type] ?? '◌'}
                  </span>
                  <span style={{
                    fontSize: 11, fontFamily: T.mono, color: T.ink,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {r.query}
                  </span>
                  <time style={{ fontSize: 9, color: T.muted, fontFamily: T.mono, whiteSpace: 'nowrap' }}>
                    {DateTime.fromISO(r.at).toFormat('HH:mm')}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </Card>

      </div>
    </div>
  )
}
