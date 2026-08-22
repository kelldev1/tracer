import React from 'react'

export default function PageHeader({ icon, title, subtitle }) {
  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
        <span style={{ color: 'var(--cyan)' }}>{icon}</span> {title}
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
        {subtitle}
      </p>
    </div>
  )
}
