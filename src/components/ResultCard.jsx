import React, { useState } from 'react'

const STATUS = {
  ok:   { color: '#27ae60',       bg: 'rgba(39,174,96,0.08)',   label: 'FOUND' },
  error:{ color: 'var(--red)',    bg: 'rgba(231,76,60,0.08)',   label: 'ALERT' },
  warn: { color: 'var(--yellow)', bg: 'rgba(183,119,13,0.08)', label: 'WARN'  },
  info: { color: 'var(--accent)', bg: 'rgba(192,57,43,0.08)',  label: 'DATA'  },
}

export default function ResultCard({ title, icon, status = 'info', children, collapsible = false }) {
  const [open, setOpen] = useState(true)
  const s = STATUS[status] || STATUS.info

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(184,149,106,0.18)',
      borderRadius: 12,
      overflow: 'hidden',
      backdropFilter: 'blur(48px) saturate(180%)',
      WebkitBackdropFilter: 'blur(48px) saturate(180%)',
      boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
      animation: 'fadeUp .3s ease forwards',
      transition: 'border-color .2s, box-shadow .2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(184,149,106,0.35)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(184,149,106,0.12)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(184,149,106,0.18)'; e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,0.05)' }}
    >
      <div
        onClick={() => collapsible && setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px',
          cursor: collapsible ? 'pointer' : 'default',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            width: 30, height: 30, borderRadius: 8,
            background: s.bg, border: `1px solid ${s.color}33`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, color: s.color
          }}>{icon}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--t1)' }}>{title}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontSize: 9, padding: '3px 8px', borderRadius: 20,
            background: s.bg, color: s.color,
            fontFamily: 'var(--mono)', fontWeight: 600, letterSpacing: 1
          }}>{s.label}</span>
          {collapsible && (
            <span style={{ color: 'var(--t3)', fontSize: 10 }}>{open ? '▲' : '▼'}</span>
          )}
        </div>
      </div>

      {open && (
        <div style={{ padding: '6px 18px 14px' }}>{children}</div>
      )}
    </div>
  )
}

export function DataRow({ label, value, mono = false, copyable = false }) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(String(value))
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '8px 0',
      gap: 16,
    }}>
      <span style={{
        fontSize: 11, color: 'var(--t3)',
        fontFamily: 'var(--mono)', letterSpacing: .5,
        minWidth: 120, textTransform: 'uppercase'
      }}>{label}</span>

      <span style={{
        fontSize: 12,
        fontFamily: mono ? 'var(--mono)' : 'var(--font)',
        color: 'var(--t1)',
        wordBreak: 'break-all',
        textAlign: 'right',
        flex: 1
      }}>{value}</span>

      {copyable && (
        <button onClick={copy} title="Copier" style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px',
          color: copied ? '#27ae60' : 'var(--t3)',
          fontSize: 11, flexShrink: 0, transition: 'color .15s',
          borderRadius: 4,
        }}
          onMouseEnter={e => !copied && (e.currentTarget.style.color = 'var(--accent)')}
          onMouseLeave={e => !copied && (e.currentTarget.style.color = 'var(--t3)')}
        >{copied ? '✓' : '⎘'}</button>
      )}
    </div>
  )
}

export function TagBadge({ label, color = 'var(--accent)' }) {
  return (
    <span style={{
      fontSize: 10, padding: '3px 10px', borderRadius: 20,
      background: color + '15', color,
      fontFamily: 'var(--mono)', fontWeight: 600, letterSpacing: 1,
      border: `1px solid ${color}33`
    }}>{label}</span>
  )
}
