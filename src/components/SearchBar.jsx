import React, { useState, useRef } from 'react'

export default function SearchBar({ placeholder = 'Rechercher...', onSearch, loading = false }) {
  const [value, setValue] = useState('')
  const [focused, setFocused] = useState(false)
  const ref = useRef()

  const submit = () => {
    if (value.trim() && !loading) onSearch(value.trim())
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 0,
      background: focused ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.1)',
      border: `1px solid ${focused ? 'rgba(184,149,106,0.5)' : 'rgba(184,149,106,0.2)'}`,
      borderRadius: 12,
      overflow: 'hidden',
      backdropFilter: 'blur(48px) saturate(180%)',
      WebkitBackdropFilter: 'blur(48px) saturate(180%)',
      boxShadow: focused ? '0 0 0 3px rgba(184,149,106,0.15)' : '0 2px 12px rgba(0,0,0,0.06)',
      transition: 'all .2s',
    }}>

      <div style={{ padding: '0 16px', color: focused ? 'var(--accent)' : 'var(--t3)', fontSize: 14, transition: 'color .2s' }}>
        {loading
          ? <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(192,57,43,0.2)', borderTop: '2px solid var(--accent)', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
          : '⌕'
        }
      </div>

      <input
        ref={ref}
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && submit()}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        disabled={loading}
        style={{
          flex: 1,
          padding: '16px 0',
          background: 'transparent',
          border: 'none',
          outline: 'none',
          color: 'var(--t1)',
          fontSize: 15,
          fontFamily: 'var(--mono)',
          letterSpacing: 0.5,
        }}
      />

      {value && !loading && (
        <button onClick={() => { setValue(''); ref.current?.focus() }} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--t3)', padding: '0 10px', fontSize: 14,
          transition: 'color .15s'
        }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--t3)'}
        >✕</button>
      )}

      <button
        onClick={submit}
        disabled={loading || !value.trim()}
        style={{
          margin: 6,
          padding: '10px 20px',
          background: value.trim() && !loading ? 'var(--accent)' : 'rgba(184,149,106,0.1)',
          border: 'none',
          borderRadius: 8,
          color: value.trim() && !loading ? '#fff' : 'var(--t3)',
          fontFamily: 'var(--mono)',
          fontWeight: 700,
          fontSize: 11,
          letterSpacing: 2,
          cursor: loading || !value.trim() ? 'not-allowed' : 'pointer',
          transition: 'all .2s',
          textTransform: 'uppercase'
        }}
      >
        {loading ? 'SCAN' : 'TRACE'}
      </button>
    </div>
  )
}
