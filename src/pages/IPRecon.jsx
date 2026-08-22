import React from 'react'
import SearchBar from '../components/SearchBar'
import ResultCard, { DataRow } from '../components/ResultCard'
import Loader from '../components/Loader'
import PageHeader from '../components/PageHeader'
import ErrorNotice from '../components/ErrorNotice'
import useSearch from '../hooks/useSearch'

export default function IPRecon() {
  const { loading, results, search } = useSearch('/ip')

  return (
    <div style={{ height: '100%', padding: 24, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader
        icon="◇" title="IP Recon"
        subtitle="Géolocalisation · ASN · Ports ouverts · Shodan · Réputation / blacklists"
      />

      <SearchBar placeholder="192.168.1.1 ou exemple.com..." onSearch={search} loading={loading} />

      {loading && <Loader label="Reconnaissance IP..." />}

      <ErrorNotice error={results?.error} />

      {results && !results.error && (
        <>
          <ResultCard title="Géolocalisation" icon="◇" status="info" collapsible>
            <DataRow label="IP" value={results.ip} mono copyable />
            <DataRow label="Pays" value={results.country} />
            <DataRow label="Région" value={results.region || 'N/A'} />
            <DataRow label="Ville" value={results.city || 'N/A'} />
            <DataRow label="FAI" value={results.isp || 'N/A'} />
            <DataRow label="ASN" value={results.asn || 'N/A'} mono />
            <DataRow label="Organisation" value={results.org || 'N/A'} />
            <DataRow label="Timezone" value={results.timezone || 'N/A'} />
            <DataRow label="Coordonnées" value={results.lat && results.lon ? `${results.lat}, ${results.lon}` : 'N/A'} mono />
          </ResultCard>

          {results.ports?.length > 0 && (
            <ResultCard title={`Ports ouverts (${results.ports.length})`} icon="◈" status="warn" collapsible>
              {results.ports.map((p, i) => (
                <DataRow key={i} label={`Port ${p.port}`} value={`${p.service || 'N/A'} — ${p.state}`} mono />
              ))}
            </ResultCard>
          )}

          {results.reputation && (
            <ResultCard title="Réputation" icon="⚠" status={results.reputation.malicious ? 'error' : 'ok'} collapsible>
              <DataRow label="VPN" value={results.reputation.vpn ? '✓ Oui' : '✗ Non'} />
              <DataRow label="Proxy" value={results.reputation.proxy ? '✓ Oui' : '✗ Non'} />
              <DataRow label="Tor" value={results.reputation.tor ? '✓ Oui' : '✗ Non'} />
              <DataRow label="Malicious" value={results.reputation.malicious ? '⚠ Oui' : '✓ Non'} />
              <DataRow label="Score risque" value={`${results.reputation.risk_score || 0}/100`} />
            </ResultCard>
          )}

          {results.shodan && (
            <ResultCard title="Shodan" icon="◆" status="info" collapsible>
              {Object.entries(results.shodan).map(([k, v]) => (
                <DataRow key={k} label={k} value={Array.isArray(v) ? v.join(', ') || 'Aucun' : String(v)} mono={k === 'banner'} />
              ))}
            </ResultCard>
          )}

          {results.virustotal && (
            <ResultCard title="VirusTotal" icon="⛊" status={results.virustotal.malicious > 0 ? 'error' : 'ok'} collapsible>
              <DataRow label="Malveillant" value={`${results.virustotal.malicious} moteur(s)`} />
              <DataRow label="Suspect" value={`${results.virustotal.suspicious} moteur(s)`} />
              <DataRow label="Inoffensif" value={`${results.virustotal.harmless} moteur(s)`} />
            </ResultCard>
          )}

          {results.abuseipdb && (
            <ResultCard title="AbuseIPDB" icon="⚠" status={results.abuseipdb.abuse_score > 50 ? 'error' : 'ok'} collapsible>
              <DataRow label="Score d'abus" value={`${results.abuseipdb.abuse_score}/100`} />
              <DataRow label="Signalements" value={results.abuseipdb.total_reports} />
              <DataRow label="Type d'usage" value={results.abuseipdb.usage_type} />
              <DataRow label="Tor" value={results.abuseipdb.is_tor ? '✓ Oui' : '✗ Non'} />
            </ResultCard>
          )}
        </>
      )}
    </div>
  )
}
