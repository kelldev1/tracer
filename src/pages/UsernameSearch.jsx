import React from 'react'
import SearchBar from '../components/SearchBar'
import ResultCard, { DataRow } from '../components/ResultCard'
import Loader from '../components/Loader'
import PageHeader from '../components/PageHeader'
import ErrorNotice from '../components/ErrorNotice'
import useSearch from '../hooks/useSearch'

export default function UsernameSearch() {
  const { loading, results, search } = useSearch('/username')

  const found = results?.results?.filter(r => r.found) || []
  const notFound = results?.results?.filter(r => !r.found) || []

  return (
    <div style={{ height: '100%', padding: 24, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader
        icon="◉" title="Username Lookup"
        subtitle="Détecte le pseudo sur +300 plateformes — GitHub, Reddit, Instagram, Twitter, TikTok..."
      />

      <SearchBar placeholder="pseudo / username..." onSearch={search} loading={loading} />

      {loading && <Loader label="Scan des plateformes..." />}

      <ErrorNotice error={results?.error} />

      {results && !results.error && (
        <>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1, background: 'var(--bg-card)', border: '1px solid var(--green)', borderRadius: 8, padding: '12px 16px' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--green)' }}>{found.length}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>comptes trouvés</div>
            </div>
            <div style={{ flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 16px' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-muted)' }}>{notFound.length}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>non trouvés</div>
            </div>
            <div style={{ flex: 1, background: 'var(--bg-card)', border: '1px solid var(--cyan)', borderRadius: 8, padding: '12px 16px' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--cyan)' }}>{results.results?.length || 0}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>sites vérifiés</div>
            </div>
          </div>

          {found.length > 0 && (
            <ResultCard title={`Comptes actifs (${found.length})`} icon="◉" status="ok" collapsible>
              {found.map((r, i) => (
                <DataRow key={i} label={r.platform} value={r.url} mono copyable />
              ))}
            </ResultCard>
          )}
        </>
      )}
    </div>
  )
}
