import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import SearchBar from '../components/SearchBar'
import ResultCard, { DataRow, TagBadge } from '../components/ResultCard'
import Loader from '../components/Loader'
import OpsBoard from '../components/OpsBoard'
import { API_BASE_URL as API } from '../config'
import { authHeaders } from '../utils/auth'

const EMPTY = {
  prenom: '', nom: '', pseudo: '', login: '', date_naissance: '',
  numero_secu: '', passport: '',
  email: '', telephone: '', adresse: '', ville: '', code_postal: '', pays: '',
  ip: '', domaine: '', mac_address: '',
  discord_id: '', steam_id: '', fivem: '', minecraft: '',
  twitter: '', instagram: '', tiktok: '', facebook: '',
  linkedin: '', snapchat: '', reddit: '', github: '',
  youtube: '', twitch: '',
  iban: '', paypal: '', crypto: '',
  employeur: '', siret: '', plaque: '', vin: '',
}

const META = {
  prenom:         { label: 'Prénom',          handle: 'identité', icon: '◈', placeholder: 'Jean',               col: 1 },
  nom:            { label: 'Nom',             handle: 'identité', icon: '◈', placeholder: 'Dupont',             col: 1 },
  pseudo:         { label: 'Pseudo',          handle: 'identité', icon: '◉', placeholder: 'jean_d',             col: 1 },
  login:          { label: 'Login',           handle: 'identité', icon: '◉', placeholder: 'jean.dupont',        col: 1 },
  date_naissance: { label: 'Date naissance',  handle: 'identité', icon: '◈', placeholder: '01/01/1990',         col: 1 },
  numero_secu:    { label: 'N° Sécu',         handle: 'identité', icon: '◈', placeholder: '1 90 01 75 042 025', col: 1 },
  passport:       { label: 'Passeport / CNI', handle: 'identité', icon: '◈', placeholder: 'XX000000',           col: 1 },
  email:          { label: 'Email',           handle: 'contact',  icon: '◎', placeholder: 'jean@exemple.fr',    col: 2 },
  telephone:      { label: 'Téléphone',       handle: 'contact',  icon: '◍', placeholder: '06 12 34 56 78',     col: 1 },
  adresse:        { label: 'Adresse',         handle: 'contact',  icon: '◌', placeholder: '12 rue de la Paix',  col: 2 },
  ville:          { label: 'Ville',           handle: 'contact',  icon: '◌', placeholder: 'Paris',              col: 1 },
  code_postal:    { label: 'Code postal',     handle: 'contact',  icon: '◌', placeholder: '75001',              col: 1 },
  pays:           { label: 'Pays',            handle: 'contact',  icon: '◌', placeholder: 'France',             col: 1 },
  ip:             { label: 'Adresse IP',      handle: 'réseau',   icon: '◇', placeholder: '192.168.1.1',        col: 1 },
  domaine:        { label: 'Domaine',         handle: 'réseau',   icon: '◆', placeholder: 'exemple.fr',         col: 1 },
  mac_address:    { label: 'MAC Address',     handle: 'réseau',   icon: '◇', placeholder: 'AA:BB:CC:DD:EE:FF',  col: 1 },
  discord_id:     { label: 'Discord ID',      handle: 'gaming',   icon: '◉', placeholder: 'jean#1234',          col: 1 },
  steam_id:       { label: 'Steam ID',        handle: 'gaming',   icon: '◉', placeholder: 'STEAM_0:0:...',      col: 1 },
  fivem:          { label: 'FiveM',           handle: 'gaming',   icon: '◉', placeholder: 'license:abc...',     col: 1 },
  minecraft:      { label: 'Minecraft',       handle: 'gaming',   icon: '◉', placeholder: 'HerobrineXX',        col: 1 },
  youtube:        { label: 'YouTube',         handle: 'gaming',   icon: '◉', placeholder: '@jeanytb',           col: 1 },
  twitch:         { label: 'Twitch',          handle: 'gaming',   icon: '◉', placeholder: 'jean_live',          col: 1 },
  twitter:        { label: 'Twitter / X',     handle: 'social',   icon: '◌', placeholder: '@jean_d',            col: 1 },
  instagram:      { label: 'Instagram',       handle: 'social',   icon: '◌', placeholder: '@jean.d',            col: 1 },
  tiktok:         { label: 'TikTok',          handle: 'social',   icon: '◌', placeholder: '@jeand',             col: 1 },
  facebook:       { label: 'Facebook',        handle: 'social',   icon: '◌', placeholder: 'jean.dupont.75',     col: 1 },
  linkedin:       { label: 'LinkedIn',        handle: 'social',   icon: '◌', placeholder: 'jean-dupont-dev',    col: 1 },
  snapchat:       { label: 'Snapchat',        handle: 'social',   icon: '◌', placeholder: 'jean_snap',          col: 1 },
  reddit:         { label: 'Reddit',          handle: 'social',   icon: '◌', placeholder: 'u/jean_d',           col: 1 },
  github:         { label: 'GitHub',          handle: 'social',   icon: '◌', placeholder: 'jeandupont',         col: 1 },
  iban:           { label: 'IBAN',            handle: 'finance',  icon: '◆', placeholder: 'FR76 3000 6000 0112',col: 2 },
  paypal:         { label: 'PayPal',          handle: 'finance',  icon: '◆', placeholder: 'jean@paypal.fr',     col: 1 },
  crypto:         { label: 'Crypto (wallet)', handle: 'finance',  icon: '◆', placeholder: '0x1a2b3c...',        col: 1 },
  employeur:      { label: 'Employeur',       handle: 'pro',      icon: '◍', placeholder: 'ACME Corp',          col: 1 },
  siret:          { label: 'SIRET',           handle: 'pro',      icon: '◍', placeholder: '123 456 789 00010',  col: 1 },
  plaque:         { label: 'Plaque immat.',   handle: 'pro',      icon: '◍', placeholder: 'AA-123-BB',          col: 1 },
  vin:            { label: 'VIN véhicule',    handle: 'pro',      icon: '◍', placeholder: 'VF1...',             col: 1 },
}

const GROUP_ICONS = {
  'identité': '◈', 'contact': '◎', 'réseau': '◇',
  'gaming': '◉', 'social': '◌', 'finance': '◆', 'pro': '◍',
}

function buildGroups() {
  const g = {}
  Object.entries(META).forEach(([key, meta]) => {
    if (!g[meta.handle]) g[meta.handle] = []
    g[meta.handle].push(key)
  })
  return g
}
const GROUPS = buildGroups()

function parse(q) {
  const f = { ...EMPTY }
  if (q.startsWith('@') && !q.includes(' '))                           f.twitter     = q
  else if (q.includes('@') && q.includes('.'))                         f.email       = q
  else if (/^\d{1,3}(\.\d{1,3}){3}$/.test(q))                        f.ip          = q
  else if (/^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/.test(q))          f.mac_address = q
  else if (/^[A-Z]{2}\d{2}\s/.test(q))                                f.iban        = q
  else if (/^[a-z0-9-]+\.[a-z]{2,}$/i.test(q) && !q.includes(' '))  f.domaine     = q
  else if (/^\d{9,14}$/.test(q.replace(/\s/g, '')))                   f.telephone   = q
  else {
    const p = q.split(/\s+/)
    p.length >= 2 ? (f.prenom = p[0], f.nom = p.slice(1).join(' ')) : (f.pseudo = q)
  }
  return f
}

/* ── FilterCard ──────────────────────────────────────────────────────────── */
function FilterCard({ fieldKey, value, onChange, autoFocus, onRemove }) {
  const [focused, setFocused] = useState(false)
  const meta  = META[fieldKey]
  const filled = value.trim() !== ''
  const lit    = focused || filled

  return (
    <div
      onClick={e => { if (e.target.tagName !== 'BUTTON') e.currentTarget.querySelector('input')?.focus() }}
      style={{
        gridColumn: meta.col === 2 ? 'span 2' : 'span 1',
        position: 'relative',
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        border: filled
          ? '1px solid rgba(200,168,120,0.35)'
          : '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16,
        padding: 5,
        boxShadow: filled
          ? '0 8px 32px rgba(200,168,120,0.08), 0 2px 8px rgba(0,0,0,0.4)'
          : '0 8px 16px rgba(0,0,0,0.3)',
        cursor: 'text',
        transition: 'border-color 0.3s, box-shadow 0.3s',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      {/* Remove button */}
      <button
        onClick={e => { e.stopPropagation(); onRemove(fieldKey) }}
        title="Supprimer ce critère"
        style={{
          position: 'absolute', top: 10, right: 10, zIndex: 10,
          width: 22, height: 22, borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
          color: 'rgba(255,255,255,0.25)',
          fontSize: 14, lineHeight: 1, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.15s',
          padding: 0,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(255,60,60,0.15)'
          e.currentTarget.style.borderColor = 'rgba(255,80,80,0.3)'
          e.currentTarget.style.color = 'rgba(255,120,120,0.9)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
          e.currentTarget.style.color = 'rgba(255,255,255,0.25)'
        }}
      >
        ×
      </button>

      <div style={{
        background: filled
          ? 'linear-gradient(135deg, rgba(200,168,120,0.07) 0%, transparent 100%)'
          : 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 100%)',
        backdropFilter: 'blur(12px)',
        border: focused
          ? '1px solid rgba(200,168,120,0.25)'
          : '1px solid rgba(255,255,255,0.05)',
        borderRadius: 12,
        padding: '14px 16px 12px',
        transition: 'all 0.25s',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingRight: 26 }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: filled
              ? 'linear-gradient(135deg, rgba(200,168,120,0.25), rgba(200,168,120,0.08))'
              : 'rgba(255,255,255,0.05)',
            border: filled
              ? '1px solid rgba(200,168,120,0.4)'
              : '1px solid rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13,
            color: filled ? 'rgba(200,168,120,0.9)' : 'rgba(255,255,255,0.3)',
            transition: 'all 0.3s', flexShrink: 0,
          }}>
            {meta.icon}
          </div>
          <div>
            <div style={{
              fontSize: 12, fontWeight: 600,
              color: lit ? 'rgba(255,245,215,0.92)' : 'rgba(255,255,255,0.45)',
              lineHeight: 1.2, transition: 'color 0.2s',
            }}>
              {meta.label}
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginTop: 1 }}>
              @{meta.handle}
            </div>
          </div>
          {filled && (
            <div style={{
              marginLeft: 'auto',
              padding: '2px 8px', borderRadius: 20,
              background: 'rgba(200,168,120,0.12)',
              border: '1px solid rgba(200,168,120,0.3)',
              fontSize: 9, fontFamily: 'var(--mono)',
              color: 'rgba(200,168,120,0.8)', letterSpacing: 1,
              animation: 'fadeIn 0.2s ease', whiteSpace: 'nowrap',
            }}>
              ACTIF
            </div>
          )}
        </div>

        {/* Input */}
        <input
          autoFocus={autoFocus}
          value={value}
          onChange={e => onChange(fieldKey, e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={meta.placeholder}
          style={{
            background: 'transparent', border: 'none', outline: 'none',
            fontSize: filled ? 15 : 13,
            fontWeight: filled ? 500 : 400,
            color: filled ? 'rgba(255,245,215,0.92)' : 'rgba(255,255,255,0.2)',
            fontFamily: 'var(--font)', width: '100%',
            caretColor: 'rgba(200,168,120,0.9)',
            transition: 'font-size 0.2s, color 0.2s',
          }}
        />

        {/* Footer */}
        <div style={{
          fontSize: 10,
          color: filled ? 'rgba(200,168,120,0.5)' : 'rgba(255,255,255,0.12)',
          fontFamily: 'var(--mono)', letterSpacing: 1,
          borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 8,
          transition: 'color 0.3s',
        }}>
          {filled ? `● ${meta.handle.toUpperCase()} · VERROUILLÉ` : meta.handle.toUpperCase()}
        </div>
      </div>
    </div>
  )
}

/* ── Add criteria button ─────────────────────────────────────────────────── */
function AddButton({ onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        gridColumn: 'span 1',
        background: hov ? 'rgba(200,168,120,0.05)' : 'rgba(0,0,0,0.25)',
        backdropFilter: 'blur(24px)',
        border: hov ? '1px dashed rgba(200,168,120,0.35)' : '1px dashed rgba(255,255,255,0.1)',
        borderRadius: 16, padding: 5,
        cursor: 'pointer', transition: 'all 0.2s',
        minHeight: 130,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <span style={{
          fontSize: 28, lineHeight: 1,
          color: hov ? 'rgba(200,168,120,0.65)' : 'rgba(255,255,255,0.12)',
          transition: 'color 0.2s',
        }}>+</span>
        <span style={{
          fontSize: 9, fontFamily: 'var(--mono)', letterSpacing: 2.5,
          color: hov ? 'rgba(200,168,120,0.45)' : 'rgba(255,255,255,0.1)',
          transition: 'color 0.2s',
        }}>CRITÈRE</span>
      </div>
    </div>
  )
}

/* ── Criteria picker dropdown ────────────────────────────────────────────── */
function CriteriaPicker({ activeFields, onAdd, onClose }) {
  const ref = useRef(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const q = search.toLowerCase()

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.45)',
      backdropFilter: 'blur(4px)',
      animation: 'fadeIn 0.15s ease',
    }}>
      <div
        ref={ref}
        style={{
          width: 500, maxHeight: '70vh',
          background: 'rgba(8,8,8,0.97)',
          backdropFilter: 'blur(40px) saturate(180%)',
          border: '1px solid rgba(200,168,120,0.2)',
          borderRadius: 18,
          padding: 20,
          boxShadow: '0 32px 80px rgba(0,0,0,0.9)',
          display: 'flex', flexDirection: 'column', gap: 14,
          animation: 'fadeIn 0.15s ease',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{
            fontSize: 10, fontFamily: 'var(--mono)', letterSpacing: 2.5,
            color: 'rgba(200,168,120,0.6)',
          }}>
            AJOUTER UN CRITÈRE
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)',
              cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: 0,
            }}
          >×</button>
        </div>

        {/* Search */}
        <input
          autoFocus
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Filtrer..."
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8, padding: '7px 12px',
            fontSize: 12, color: 'rgba(255,245,215,0.8)',
            outline: 'none', fontFamily: 'var(--font)', width: '100%',
            boxSizing: 'border-box',
          }}
          onFocus={e => { e.currentTarget.style.borderColor = 'rgba(200,168,120,0.3)' }}
          onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
        />

        {/* Groups */}
        <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {Object.entries(GROUPS).map(([group, keys]) => {
            const available = keys.filter(k =>
              !activeFields.includes(k) &&
              (q === '' || META[k].label.toLowerCase().includes(q) || group.includes(q))
            )
            if (available.length === 0) return null
            return (
              <div key={group}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8,
                  fontSize: 9, fontFamily: 'var(--mono)', letterSpacing: 2.5,
                  color: 'rgba(200,168,120,0.35)',
                }}>
                  <span>{GROUP_ICONS[group]}</span>
                  <span>{group.toUpperCase()}</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {available.map(key => (
                    <button
                      key={key}
                      onClick={() => onAdd(key)}
                      style={{
                        padding: '5px 13px', borderRadius: 20,
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'rgba(255,245,215,0.55)',
                        fontSize: 12, fontFamily: 'var(--font)',
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(200,168,120,0.12)'
                        e.currentTarget.style.borderColor = 'rgba(200,168,120,0.35)'
                        e.currentTarget.style.color = 'rgba(255,245,215,0.92)'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                        e.currentTarget.style.color = 'rgba(255,245,215,0.55)'
                      }}
                    >
                      {META[key].label}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ── LaunchCard ──────────────────────────────────────────────────────────── */
function LaunchCard({ count, onLaunch, onReset }) {
  const ready = count > 0
  return (
    <div style={{
      flex: 1,
      background: ready
        ? 'linear-gradient(135deg, rgba(200,168,120,0.15) 0%, rgba(200,168,120,0.04) 100%)'
        : 'rgba(0,0,0,0.4)',
      backdropFilter: 'blur(24px) saturate(180%)',
      WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      border: ready ? '1px solid rgba(200,168,120,0.4)' : '1px solid rgba(255,255,255,0.06)',
      borderRadius: 16, padding: 5,
      boxShadow: ready ? '0 8px 32px rgba(200,168,120,0.12)' : '0 8px 16px rgba(0,0,0,0.2)',
      transition: 'all 0.4s',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        flex: 1,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 100%)',
        border: '1px solid rgba(255,255,255,0.04)',
        borderRadius: 12, padding: '16px',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 14,
      }}>
        <div>
          <div style={{
            fontSize: ready ? 42 : 28, fontWeight: 700,
            color: ready ? 'rgba(200,168,120,0.9)' : 'rgba(255,255,255,0.1)',
            fontFamily: 'var(--mono)', lineHeight: 1, transition: 'all 0.3s',
          }}>
            {count > 0 ? `0${count}` : '—'}
          </div>
          <div style={{
            fontSize: 9, fontFamily: 'var(--mono)', letterSpacing: 2,
            color: ready ? 'rgba(200,168,120,0.5)' : 'rgba(255,255,255,0.12)',
            marginTop: 5, transition: 'color 0.3s',
          }}>
            {ready ? `SIGNAL${count > 1 ? 'S' : ''} ACTIF${count > 1 ? 'S' : ''}` : 'EN ATTENTE'}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button
            onClick={onLaunch}
            disabled={!ready}
            style={{
              padding: '11px 0', borderRadius: 8, border: 'none',
              background: ready ? 'rgba(200,168,120,0.85)' : 'rgba(255,255,255,0.04)',
              color: ready ? '#0a0a0a' : 'rgba(255,255,255,0.15)',
              fontSize: 10, fontWeight: 700, fontFamily: 'var(--mono)', letterSpacing: 2.5,
              cursor: ready ? 'pointer' : 'default',
              transition: 'all 0.25s', width: '100%',
            }}
            onMouseEnter={e => { if (ready) e.currentTarget.style.background = 'rgba(200,168,120,1)' }}
            onMouseLeave={e => { if (ready) e.currentTarget.style.background = 'rgba(200,168,120,0.85)' }}
          >
            LANCER
          </button>
          <button
            onClick={onReset}
            style={{
              padding: '7px 0', borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.06)',
              background: 'transparent',
              color: 'rgba(255,255,255,0.18)', fontSize: 9,
              fontFamily: 'var(--mono)', letterSpacing: 1.5,
              cursor: 'pointer', width: '100%', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.18)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)' }}
          >
            ← RETOUR
          </button>
        </div>

        <div style={{
          fontSize: 9, fontFamily: 'var(--mono)', letterSpacing: 1,
          color: 'rgba(255,255,255,0.1)',
          borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 8,
        }}>
          TRACER · QUERY ENGINE
        </div>
      </div>
    </div>
  )
}

/* ── Aggregator ──────────────────────────────────────────────────────────── */
export default function Aggregator() {
  const [stage, setStage]           = useState('idle')
  const [filters, setFilters]       = useState(EMPTY)
  const [activeFields, setActiveFields] = useState([])
  const [showPicker, setShowPicker] = useState(false)
  const [loading, setLoading]       = useState(false)
  const [results, setResults]       = useState(null)
  const scrollRef = useRef(null)

  const setF = (key, val) => setFilters(f => ({ ...f, [key]: val }))
  const activeFilters = Object.entries(filters).filter(([, v]) => v.trim() !== '')

  const addField = (key) => {
    setActiveFields(f => [...f, key])
  }

  const removeField = (key) => {
    setActiveFields(f => f.filter(k => k !== key))
    setF(key, '')
  }

  const onInitialSearch = (q) => {
    const parsed = parse(q)
    setFilters(parsed)
    const detected = Object.entries(parsed)
      .filter(([, v]) => v.trim() !== '')
      .map(([k]) => k)
    setActiveFields(detected.length > 0 ? detected : ['prenom'])
    setStage('filtering')
  }

  const onLaunch = async () => {
    if (!activeFilters.length) return
    const query = activeFilters.map(([k, v]) => `${META[k].label}: ${v}`).join(', ')
    setLoading(true); setResults(null); setStage('results')
    try {
      const { data } = await axios.post(`${API}/aggregate`, { query, filters }, { headers: authHeaders() })
      setResults(data)
    } catch (err) {
      setResults({
        error: err.response?.status === 401
          ? 'Connecte-toi pour lancer une recherche'
          : 'Backend non disponible — lance : python backend/main.py',
      })
    }
    setLoading(false)
  }

  const onReset = () => {
    setStage('idle'); setFilters(EMPTY); setResults(null)
    setActiveFields([]); setShowPicker(false)
  }
  const onBackToFilters = () => { setStage('filtering'); setResults(null) }

  return (
    <div ref={scrollRef} style={{ height: '100%', overflow: 'auto' }}>

      {/* IDLE */}
      {stage === 'idle' && (
        <div style={{
          minHeight: '100%', display: 'flex', flexDirection: 'column',
          alignItems: 'center', padding: '8vh 28px 28px',
          boxSizing: 'border-box', gap: 28,
          animation: 'fadeIn .35s ease',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 22, maxWidth: 640, width: '100%' }}>
            <span style={{
              fontSize: 8, letterSpacing: 3, textTransform: 'uppercase',
              fontFamily: 'var(--mono)', color: 'rgba(200,168,120,0.55)',
              padding: '4px 14px', borderRadius: 20,
              border: '1px solid rgba(200,168,120,0.18)',
              background: 'rgba(200,168,120,0.05)',
            }}>Open Source Intelligence</span>

            <h1 style={{
              fontSize: 62, fontWeight: 800, lineHeight: 1.06, margin: 0,
              letterSpacing: -2.5, color: 'rgba(255,248,235,0.97)', fontFamily: 'var(--font)',
            }}>
              Traque{' '}
              <span style={{ color: '#c8a878' }}>n'importe quelle cible.</span>
            </h1>

            <p style={{
              margin: 0, fontSize: 14.5, fontFamily: 'var(--font)', fontWeight: 300,
              color: 'rgba(255,245,220,0.42)', lineHeight: 1.7, maxWidth: 420,
            }}>
              Pseudo, email, domaine ou IP — TRACER agrège toutes les sources OSINT en une seule requête.
            </p>

            <div style={{ width: '100%' }}>
              <SearchBar placeholder="pseudo · email · domaine · IP..." onSearch={onInitialSearch} loading={false} />
            </div>
          </div>

          <div style={{ width: '100%' }}>
            <OpsBoard />
          </div>
        </div>
      )}

      {/* FILTERING */}
      {stage === 'filtering' && (
        <div style={{
          padding: '24px 28px 32px',
          animation: 'fadeIn .2s ease',
          minHeight: '100%', boxSizing: 'border-box',
        }}>

          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 20,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <BackButton onClick={onReset} />
              <span style={{ color: 'rgba(255,255,255,0.1)', fontSize: 12 }}>›</span>
              <span style={{ fontSize: 10, fontFamily: 'var(--mono)', letterSpacing: 2.5, color: 'rgba(255,255,255,0.18)' }}>
                TRACE
              </span>
              <span style={{ color: 'rgba(255,255,255,0.1)', fontSize: 12 }}>›</span>
              <span style={{ fontSize: 10, fontFamily: 'var(--mono)', letterSpacing: 2.5, color: 'rgba(200,168,120,0.7)' }}>
                PARAMÈTRES
              </span>
              {activeFilters.length > 0 && (
                <>
                  <span style={{ color: 'rgba(255,255,255,0.1)', fontSize: 12 }}>›</span>
                  <span style={{
                    fontSize: 9, fontFamily: 'var(--mono)', letterSpacing: 1.5,
                    color: 'rgba(200,168,120,0.45)',
                    padding: '2px 8px', borderRadius: 20,
                    background: 'rgba(200,168,120,0.07)',
                    border: '1px solid rgba(200,168,120,0.15)',
                  }}>
                    {activeFilters.length} SIGNAL{activeFilters.length > 1 ? 'S' : ''}
                  </span>
                </>
              )}
            </div>

            {/* Chips résumé */}
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: '60%' }}>
              {activeFilters.map(([key, val]) => (
                <div key={key} style={{
                  padding: '3px 10px', borderRadius: 20,
                  background: 'rgba(200,168,120,0.1)',
                  border: '1px solid rgba(200,168,120,0.25)',
                  fontSize: 11, color: 'rgba(255,245,215,0.75)',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <span style={{ fontSize: 9, color: 'rgba(200,168,120,0.5)', fontFamily: 'var(--mono)' }}>
                    {META[key].label.slice(0, 3).toUpperCase()}
                  </span>
                  {val}
                </div>
              ))}
            </div>
          </div>

          {/* Layout */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'stretch' }}>

            {/* Grille critères */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 10,
              alignItems: 'start',
              flex: 1,
            }}>
              {activeFields.map((key, idx) => (
                <FilterCard
                  key={key}
                  fieldKey={key}
                  value={filters[key]}
                  onChange={setF}
                  autoFocus={idx === 0}
                  onRemove={removeField}
                />
              ))}

              {/* Bouton ajouter */}
              <AddButton onClick={() => setShowPicker(true)} />
            </div>

            {/* Panel lancement — sticky */}
            <div style={{
              width: 188, flexShrink: 0,
              position: 'sticky', top: 0,
              height: 'fit-content',
              display: 'flex', flexDirection: 'column',
            }}>
              <LaunchCard
                count={activeFilters.length}
                onLaunch={onLaunch}
                onReset={onReset}
              />
            </div>
          </div>
        </div>
      )}

      {/* RESULTS */}
      {stage === 'results' && (
        <div style={{ padding: '32px 36px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', animation: 'fadeIn .3s ease' }}>
            <div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--mono)', letterSpacing: 3, marginBottom: 10 }}>
                TRACE SUR
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {activeFilters.map(([key, val]) => (
                  <div key={key} style={{
                    padding: '3px 10px', borderRadius: 4,
                    background: 'rgba(200,168,120,0.08)',
                    border: '1px solid rgba(200,168,120,0.2)',
                    fontSize: 12, color: 'rgba(255,245,215,0.8)', fontWeight: 500,
                  }}>
                    <span style={{ fontSize: 9, color: 'rgba(200,168,120,0.5)', fontFamily: 'var(--mono)', marginRight: 6 }}>
                      {META[key].label.toUpperCase()}
                    </span>
                    {val}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {results && !results.error && <TagBadge label={results.type?.toUpperCase()} color="var(--cyan)" />}
              <button onClick={onBackToFilters} style={ghost}>filtres</button>
              <button onClick={onReset} style={ghost}>← retour</button>
            </div>
          </div>

          {loading && <Loader label="Analyse en cours..." />}

          {results?.error && (
            <ResultCard title="Erreur de connexion" icon="✕" status="error">
              <p style={{ color: 'var(--red)', fontFamily: 'var(--mono)', fontSize: 12, lineHeight: 1.7 }}>{results.error}</p>
            </ResultCard>
          )}

          {results && !results.error && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

              {/* ── Résultats base de données ── */}
              {results.db_results?.length > 0 && (
                <ResultCard
                  title={`Base de données — ${results.db_results.length} résultat(s)`}
                  icon="◈" status="ok" collapsible
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {results.db_results.map((entry, i) => (
                      <div key={i} style={{
                        borderRadius: 8,
                        border: '1px solid rgba(200,168,120,0.15)',
                        background: 'rgba(200,168,120,0.03)',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          padding: '5px 12px',
                          background: 'rgba(200,168,120,0.07)',
                          borderBottom: '1px solid rgba(200,168,120,0.1)',
                          fontSize: 9, fontFamily: 'var(--mono)',
                          letterSpacing: 2, color: 'rgba(200,168,120,0.7)',
                          textTransform: 'uppercase',
                        }}>
                          {entry.source}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                          {Object.entries(entry.data)
                            .filter(([, v]) => v !== null && v !== undefined && String(v).trim() !== '')
                            .map(([k, v]) => (
                              <DataRow key={k} label={k} value={String(v)} copyable />
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ResultCard>
              )}

              {results.db_results?.length === 0 && results.type === 'person' && (
                <ResultCard title="Base de données — Aucun résultat" icon="◈" status="error">
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--mono)', fontSize: 12 }}>
                    Aucune correspondance trouvée dans les tables disponibles.
                  </p>
                </ResultCard>
              )}

              {/* ── Liens sociaux ── */}
              {results.social_links?.length > 0 && (
                <ResultCard title={`Réseaux sociaux — ${results.social_links.length} lien(s)`} icon="◌" status="info" collapsible>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
                    {results.social_links.map((s, i) => (
                      <DataRow key={i} label={s.platform} value={s.url} mono copyable />
                    ))}
                  </div>
                </ResultCard>
              )}

              {/* ── Profils web ── */}
              {results.profiles?.length > 0 && (
                <ResultCard title="Profils web" icon="◍" status="info" collapsible>
                  {results.profiles.map((p, i) => (
                    <div key={i} style={{ marginBottom: 6 }}>
                      {Object.entries(p.data).map(([k, v]) => (
                        <DataRow key={k} label={k} value={String(v)} copyable={k === 'lien'} />
                      ))}
                    </div>
                  ))}
                </ResultCard>
              )}

              {/* ── Usernames ── */}
              {results.usernames?.length > 0 && (
                <ResultCard title={`Comptes trouvés — ${results.usernames.length} plateforme(s)`} icon="◉" status="ok" collapsible>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
                    {results.usernames.map((u, i) => <DataRow key={i} label={u.platform} value={u.url} mono copyable />)}
                  </div>
                </ResultCard>
              )}

              {/* ── Email ── */}
              {results.email && (
                <ResultCard title="Analyse Email" icon="◎" status={results.email.breaches?.length > 0 ? 'error' : 'ok'} collapsible>
                  {Object.entries(results.email).filter(([, v]) => typeof v !== 'object' && v !== null).map(([k, v]) => (
                    <DataRow key={k} label={k} value={String(v)} copyable={k === 'email'} />
                  ))}
                </ResultCard>
              )}

              {/* ── IP ── */}
              {results.ip && (
                <ResultCard title="IP / Géolocalisation" icon="◇" status="info" collapsible>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
                    {Object.entries(results.ip).filter(([, v]) => v !== null && typeof v !== 'object').map(([k, v]) => (
                      <DataRow key={k} label={k} value={String(v)} mono={['ip', 'asn'].includes(k)} copyable={k === 'ip'} />
                    ))}
                  </div>
                </ResultCard>
              )}

              {/* ── Profils détaillés (GitHub/Reddit) ── */}
              {results.social_profiles?.length > 0 && (
                <ResultCard title={`Profils détaillés — ${results.social_profiles.length}`} icon="◍" status="ok" collapsible>
                  {results.social_profiles.map((p, i) => (
                    <div key={i} style={{ marginBottom: 10 }}>
                      <div style={{
                        fontSize: 9, fontFamily: 'var(--mono)', letterSpacing: 2,
                        color: 'rgba(200,168,120,0.6)', marginBottom: 4,
                      }}>
                        {p.platform.toUpperCase()}
                      </div>
                      {Object.entries(p.data).map(([k, v]) => (
                        <DataRow key={k} label={k} value={String(v)} copyable={k === 'url'} />
                      ))}
                    </div>
                  ))}
                </ResultCard>
              )}

              {/* ── Dark Web ── */}
              {results.darkweb && (
                <ResultCard
                  title={results.darkweb.results?.length > 0 ? `Dark Web — ${results.darkweb.results.length} résultat(s)` : 'Dark Web — Aucun résultat direct'}
                  icon="◑" status={results.darkweb.results?.length > 0 ? 'warn' : 'info'} collapsible
                >
                  <DataRow label="Moteur" value={results.darkweb.engine} />
                  <DataRow label="Recherche manuelle (Tor)" value={results.darkweb.search_url} mono copyable />
                  {results.darkweb.results?.map((r, i) => (
                    <DataRow key={i} label={`Résultat #${i + 1}`} value={r.title} />
                  ))}
                </ResultCard>
              )}

              {/* ── Domaine ── */}
              {results.domain?.whois && (
                <ResultCard title="Domaine · WHOIS" icon="◆" status="info" collapsible>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
                    {Object.entries(results.domain.whois).map(([k, v]) => <DataRow key={k} label={k} value={String(v)} copyable />)}
                  </div>
                </ResultCard>
              )}

            </div>
          )}
          <div style={{ height: 40 }} />
        </div>
      )}

      {/* Picker overlay */}
      {showPicker && (
        <CriteriaPicker
          activeFields={activeFields}
          onAdd={addField}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  )
}

function BackButton({ onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        all: 'unset', cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '4px 12px 4px 9px', borderRadius: 999,
        border: `1px solid ${hov ? 'rgba(200,168,120,0.28)' : 'rgba(200,168,120,0.1)'}`,
        background: hov ? 'rgba(200,168,120,0.06)' : 'transparent',
        fontSize: 9, fontFamily: 'var(--mono)', letterSpacing: 2,
        color: hov ? 'rgba(200,168,120,0.85)' : 'rgba(200,168,120,0.35)',
        transition: 'all .18s',
      }}
    >
      <span style={{ fontSize: 11, transform: hov ? 'translateX(-2px)' : 'none', transition: 'transform .18s' }}>←</span>
      RETOUR
    </button>
  )
}

const ghost = {
  background: 'none', border: 'none', cursor: 'pointer',
  fontSize: 11, fontFamily: 'var(--mono)', letterSpacing: 1,
  color: 'rgba(255,255,255,0.25)', padding: '4px 8px',
  transition: 'color .15s',
}
