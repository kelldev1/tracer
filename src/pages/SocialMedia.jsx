import React from 'react'
import SearchBar from '../components/SearchBar'
import ResultCard, { DataRow } from '../components/ResultCard'
import Loader from '../components/Loader'
import PageHeader from '../components/PageHeader'
import ErrorNotice from '../components/ErrorNotice'
import useSearch from '../hooks/useSearch'

const PLATFORMS = ['GitHub', 'Reddit', 'Twitter/X', 'Instagram', 'TikTok', 'YouTube', 'LinkedIn']

export default function SocialMedia() {
  const { loading, results, search } = useSearch('/social')

  return (
    <div style={{ height: '100%', padding: 24, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader
        icon="◌" title="Social Media"
        subtitle="Analyse de profils publics — GitHub, Reddit, Twitter/X, Instagram, TikTok..."
      />

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {PLATFORMS.map(p => (
          <span key={p} style={{
            fontSize: 11, padding: '3px 10px', borderRadius: 20,
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            color: 'var(--text-secondary)'
          }}>{p}</span>
        ))}
      </div>

      <SearchBar placeholder="pseudo ou URL de profil..." onSearch={search} loading={loading} />

      {loading && <Loader label="Analyse des réseaux..." />}

      <ErrorNotice error={results?.error} />

      {results && !results.error && results.profiles?.map((p, i) => (
        <ResultCard key={i} title={p.platform} icon="◌" status={p.found ? 'ok' : 'warn'} collapsible>
          {p.found ? (
            Object.entries(p.data).map(([k, v]) => (
              <DataRow key={k} label={k} value={String(v)} copyable={k === 'url'} />
            ))
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Profil non trouvé ou privé</p>
          )}
        </ResultCard>
      ))}
    </div>
  )
}
