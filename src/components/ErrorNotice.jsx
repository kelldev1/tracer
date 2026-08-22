import React from 'react'
import ResultCard from './ResultCard'

export default function ErrorNotice({ error }) {
  if (!error) return null
  return (
    <ResultCard title="Erreur" icon="✕" status="error">
      <p style={{ color: 'var(--red)', fontSize: 13 }}>{error}</p>
    </ResultCard>
  )
}
