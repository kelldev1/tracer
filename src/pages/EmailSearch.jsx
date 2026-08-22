import React from 'react'
import SearchBar from '../components/SearchBar'
import ResultCard, { DataRow } from '../components/ResultCard'
import Loader from '../components/Loader'
import PageHeader from '../components/PageHeader'
import ErrorNotice from '../components/ErrorNotice'
import useSearch from '../hooks/useSearch'

export default function EmailSearch() {
  const { loading, results, search } = useSearch('/email')

  return (
    <div style={{ height: '100%', padding: 24, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader
        icon="◎" title="Email Lookup"
        subtitle="Réputation, leaks, HaveIBeenPwned, validité SMTP"
      />

      <SearchBar placeholder="adresse@email.com..." onSearch={search} loading={loading} />

      {loading && <Loader label="Vérification email..." />}

      <ErrorNotice error={results?.error} />

      {results && !results.error && (
        <>
          <ResultCard title="Informations email" icon="◎" status={results.valid ? 'ok' : 'error'} collapsible>
            <DataRow label="Email" value={results.email} mono copyable />
            <DataRow label="Valide" value={results.valid ? '✓ Oui' : '✗ Non'} />
            <DataRow label="Domaine" value={results.domain} mono copyable />
            <DataRow label="Réputation" value={results.reputation || 'N/A'} />
          </ResultCard>

          {results.breaches?.length > 0 && (
            <ResultCard title={`Leaks détectés (${results.breaches.length})`} icon="⚠" status="error" collapsible>
              {results.breaches.map((b, i) => (
                <DataRow key={i} label={b.name} value={b.date || 'N/A'} />
              ))}
            </ResultCard>
          )}

          {results.breaches?.length === 0 && (
            <ResultCard title="Aucun leak détecté" icon="✓" status="ok">
              <p style={{ color: 'var(--green)', fontSize: 13 }}>Email non trouvé dans les bases de données publiques</p>
            </ResultCard>
          )}

          {results.accounts?.length > 0 && (
            <ResultCard title={`Comptes associés (${results.accounts.length})`} icon="◌" status="info" collapsible>
              {results.accounts.map((a, i) => (
                <DataRow key={i} label={a.platform} value={a.status} />
              ))}
            </ResultCard>
          )}

          {results.gravatar && (
            <ResultCard title="Gravatar" icon="◐" status={results.gravatar.found ? 'ok' : 'info'} collapsible>
              <DataRow label="Compte trouvé" value={results.gravatar.found ? '✓ Oui' : '✗ Non'} />
              {results.gravatar.found && (
                <DataRow label="URL" value={results.gravatar.url} mono copyable />
              )}
            </ResultCard>
          )}
        </>
      )}
    </div>
  )
}
