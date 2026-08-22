import React from 'react'
import SearchBar from '../components/SearchBar'
import ResultCard, { DataRow } from '../components/ResultCard'
import Loader from '../components/Loader'
import PageHeader from '../components/PageHeader'
import ErrorNotice from '../components/ErrorNotice'
import useSearch from '../hooks/useSearch'

export default function PhoneSearch() {
  const { loading, results, search } = useSearch('/phone')

  return (
    <div style={{ height: '100%', padding: 24, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader
        icon="◍" title="Phone Lookup"
        subtitle="Opérateur, pays, type de ligne, réputation, Truecaller"
      />

      <SearchBar placeholder="+33 6 XX XX XX XX..." onSearch={search} loading={loading} />

      {loading && <Loader label="Identification du numéro..." />}

      <ErrorNotice error={results?.error} />

      {results && !results.error && (
        <>
          <ResultCard title="Informations numéro" icon="◍" status="info" collapsible>
            <DataRow label="Numéro" value={results.number} mono copyable />
            <DataRow label="Pays" value={results.country} />
            <DataRow label="Opérateur" value={results.carrier || 'N/A'} />
            <DataRow label="Type" value={results.line_type || 'N/A'} />
            <DataRow label="Valide" value={results.valid ? '✓ Oui' : '✗ Non'} />
            <DataRow label="Format E.164" value={results.e164 || results.number} mono copyable />
          </ResultCard>

          {results.numverify && (
            <ResultCard title="NumVerify" icon="◈" status={results.numverify.valid ? 'ok' : 'error'} collapsible>
              <DataRow label="Valide" value={results.numverify.valid ? '✓ Oui' : '✗ Non'} />
              <DataRow label="Localisation" value={results.numverify.location} />
              <DataRow label="Opérateur" value={results.numverify.carrier} />
              <DataRow label="Type de ligne" value={results.numverify.line_type} />
              <DataRow label="Pays" value={results.numverify.country_name} />
            </ResultCard>
          )}
        </>
      )}
    </div>
  )
}
