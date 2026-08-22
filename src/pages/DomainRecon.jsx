import React from 'react'
import SearchBar from '../components/SearchBar'
import ResultCard, { DataRow } from '../components/ResultCard'
import Loader from '../components/Loader'
import PageHeader from '../components/PageHeader'
import ErrorNotice from '../components/ErrorNotice'
import useSearch from '../hooks/useSearch'

export default function DomainRecon() {
  const { loading, results, search } = useSearch('/domain')

  return (
    <div style={{ height: '100%', padding: 24, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader
        icon="◆" title="Domain Recon"
        subtitle="WHOIS · DNS records · SSL certificates · Wayback Machine · Sous-domaines"
      />

      <SearchBar placeholder="example.com..." onSearch={search} loading={loading} />

      {loading && <Loader label="Reconnaissance domaine..." />}

      <ErrorNotice error={results?.error} />

      {results && !results.error && (
        <>
          {results.whois && (
            <ResultCard title="WHOIS" icon="◆" status="info" collapsible>
              {Object.entries(results.whois).map(([k, v]) => (
                <DataRow key={k} label={k} value={String(v)} mono={k.includes('ip')} copyable />
              ))}
            </ResultCard>
          )}

          {results.dns && (
            <ResultCard title="DNS Records" icon="◇" status="info" collapsible>
              {Object.entries(results.dns).map(([type, records]) => (
                <DataRow key={type} label={type} value={Array.isArray(records) ? records.join(', ') : String(records)} mono copyable />
              ))}
            </ResultCard>
          )}

          {results.ssl && (
            <ResultCard title="Certificat SSL" icon="◈" status={results.ssl.valid ? 'ok' : 'error'} collapsible>
              {Object.entries(results.ssl).map(([k, v]) => (
                <DataRow key={k} label={k} value={String(v)} />
              ))}
            </ResultCard>
          )}

          {results.subdomains?.length > 0 && (
            <ResultCard title={`Sous-domaines (${results.subdomains.length})`} icon="◌" status="ok" collapsible>
              {results.subdomains.map((s, i) => (
                <DataRow key={i} label={`#${i + 1}`} value={s} mono copyable />
              ))}
            </ResultCard>
          )}

          {results.wayback && (
            <ResultCard title="Wayback Machine" icon="⊙" status="info" collapsible>
              <DataRow label="Première archive" value={results.wayback.first_capture || 'N/A'} />
              <DataRow label="Dernière archive" value={results.wayback.last_capture || 'N/A'} />
              <DataRow label="Total snapshots" value={results.wayback.total || 'N/A'} />
            </ResultCard>
          )}

          {results.virustotal && (
            <ResultCard title="VirusTotal" icon="⛊" status={results.virustotal.malicious > 0 ? 'error' : 'ok'} collapsible>
              <DataRow label="Malveillant" value={`${results.virustotal.malicious} moteur(s)`} />
              <DataRow label="Suspect" value={`${results.virustotal.suspicious} moteur(s)`} />
              <DataRow label="Réputation" value={results.virustotal.reputation} />
              <DataRow label="Catégories" value={Object.values(results.virustotal.categories || {}).join(', ') || 'N/A'} />
            </ResultCard>
          )}
        </>
      )}
    </div>
  )
}
