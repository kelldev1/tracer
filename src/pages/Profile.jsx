import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { updateAccount, logout as logoutUser } from '../utils/auth'
import { API_BASE_URL } from '../config'

const KF = `
@keyframes scanLine {
  0%   { top:-2px; opacity:0 }
  6%   { opacity:1 }
  94%  { opacity:1 }
  100% { top:100%; opacity:0 }
}
@keyframes ringPulse {
  0%   { transform:scale(1);    opacity:0.45 }
  100% { transform:scale(1.55); opacity:0 }
}
@keyframes dotBlink {
  0%,100%{ opacity:1 }
  50%    { opacity:0.28 }
}
@keyframes glitch {
  0%,94%,100%{ transform:translate(0) }
  95%{ transform:translate(-2px,0) skewX(-1deg) }
  97%{ transform:translate(2px,0) skewX(1deg) }
}
`

const MODULES = [
  { name: 'Username scanner', icon: '◉' },
  { name: 'Email lookup',     icon: '◎' },
  { name: 'IP Recon',         icon: '◇' },
  { name: 'Domain recon',     icon: '◆' },
  { name: 'Phone lookup',     icon: '◍' },
  { name: 'Social crawl',     icon: '◌' },
  { name: 'Aggregator',       icon: '◈' },
]

function readUser()          { try { return JSON.parse(localStorage.getItem('tracer_user')) || {} } catch { return {} } }
function avatarKey(email)    { return `tracer_avatar_${(email || '').toLowerCase()}` }
function readAvatar(email)   { return localStorage.getItem(avatarKey(email)) || null }

export default function Profile() {
  const navigate = useNavigate()
  const [user, setUser]           = useState(readUser)
  const [avatar, setAvatar]       = useState(() => readAvatar(readUser().email))
  const [apiOnline, setApiOnline] = useState(null)
  const rootRef = useRef(null)
  const fileRef = useRef(null)

  useEffect(() => {
    const el = document.createElement('style'); el.textContent = KF
    document.head.appendChild(el); return () => document.head.removeChild(el)
  }, [])


  useEffect(() => {
    fetch(`${API_BASE_URL}/`).then(r => setApiOnline(r.ok)).catch(() => setApiOnline(false))
  }, [])

  /* ── GSAP page reveal ── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.08 })
      tl.from('.ga-cover',  { opacity: 0, duration: 0.4 })
      tl.from('.ga-avatar', { scale: 0.7, opacity: 0, duration: 0.65, ease: 'back.out(1.8)' }, '-=0.1')
      tl.from('.ga-badge',  { y: -10, opacity: 0, duration: 0.35 }, '-=0.35')
      tl.from('.ga-name',   { y: 22, opacity: 0, duration: 0.5 }, '-=0.25')
      tl.from('.ga-stats',  { y: 10, opacity: 0, duration: 0.35 }, '-=0.3')
      tl.from('.ga-divs',   { scaleX: 0, transformOrigin: 'left center', duration: 0.55, stagger: 0.12 }, '-=0.05')
      tl.from('.ga-field',  { x: -20, opacity: 0, stagger: 0.07, duration: 0.42 }, '-=0.52')
      tl.from('.ga-right',  { x: 22,  opacity: 0, duration: 0.5 }, '-=0.56')
      tl.from('.ga-danger', { y: 12,  opacity: 0, duration: 0.38 }, '-=0.12')
    }, rootRef)
    return () => ctx.revert()
  }, [])

  /* ── Cursor orb ── */
  useEffect(() => {
    const orb = document.getElementById('p-orb')
    if (!orb) return
    const onMove = e => gsap.to(orb, { x: e.clientX, y: e.clientY, duration: 0.75, ease: 'power2.out' })
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  function handleFile(e) {
    const file = e.target.files[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setAvatar(reader.result)
      localStorage.setItem(avatarKey(user.email), reader.result)
      window.dispatchEvent(new Event('tracer_avatar'))
    }
    reader.readAsDataURL(file)
  }

  const [saveError, setSaveError] = useState('')

  async function saveUser(patch) {
    const previousEmail = user.email
    const result = await updateAccount(previousEmail, patch)
    if (!result.success) { setSaveError(result.error); return }

    setSaveError('')
    setUser(result.user)

    // Renomme aussi la clé de l'avatar si l'email a changé, pour ne pas le perdre
    if (patch.email && patch.email.toLowerCase() !== previousEmail.toLowerCase()) {
      const oldAvatar = localStorage.getItem(avatarKey(previousEmail))
      if (oldAvatar) {
        localStorage.setItem(avatarKey(result.user.email), oldAvatar)
        localStorage.removeItem(avatarKey(previousEmail))
      }
    }
  }

  async function logout() {
    await logoutUser()
    navigate('/login')
  }

  const name     = user.name || 'Opérateur'
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div ref={rootRef} style={{ height: '100%', overflowY: 'auto', paddingTop: 96, paddingBottom: 48, display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>

      {/* ── Cursor orb ── */}
      <div id="p-orb" style={{
        position: 'fixed', top: 0, left: 0, width: 340, height: 340,
        borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(circle, rgba(200,168,120,0.045) 0%, transparent 68%)',
        transform: 'translate(-50%,-50%)',
      }} />

      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />

      <div style={{ width: '100%', maxWidth: 1380, padding: '0 48px 56px', position: 'relative', zIndex: 1 }}>

        {/* ── Back button ── */}
        <BackBtn onClick={() => navigate(-1)} />

        {/* ── HERO ── */}
        <div className="ga-cover" style={{
          height: 192, position: 'relative', overflow: 'hidden', borderRadius: '14px 14px 0 0',
          background: 'transparent',
        }}>
          {/* Scan line */}
          <div style={{
            position: 'absolute', left: 0, right: 0, height: 1,
            background: 'linear-gradient(90deg, transparent 0%, rgba(200,168,120,0.6) 40%, rgba(200,168,120,0.9) 50%, rgba(200,168,120,0.6) 60%, transparent 100%)',
            animation: 'scanLine 2.2s ease 0.6s both',
          }} />
        </div>

        {/* Profile row */}
        <div style={{
          background: 'transparent', marginTop: -88,
          padding: '0 2px 48px',
          display: 'flex', alignItems: 'flex-end', gap: 28,
          borderRadius: '0 0 0 0',
        }}>
          {/* Avatar */}
          <div className="ga-avatar" style={{ flexShrink: 0, position: 'relative', cursor: 'pointer' }}
            onClick={() => fileRef.current.click()}>
            {/* Pulse rings */}
            {[0, 0.7].map(d => (
              <div key={d} style={{
                position: 'absolute', inset: -6, borderRadius: '50%',
                border: '1px solid rgba(200,168,120,0.28)',
                animation: `ringPulse 2.4s ease ${d}s infinite`,
              }} />
            ))}
            <div style={{
              width: 128, height: 128, borderRadius: '50%',
              padding: 3,
              background: 'linear-gradient(135deg, rgba(200,168,120,0.55), rgba(200,168,120,0.1))',
              boxShadow: '0 8px 40px rgba(0,0,0,0.8), 0 0 0 1px rgba(200,168,120,0.06)',
            }}>
              <div style={{
                width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden',
                background: 'rgba(200,168,120,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {avatar
                  ? <img src={avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                  : <span style={{ fontSize: 44, fontWeight: 700, color: 'rgba(200,168,120,0.85)', fontFamily: 'var(--font)' }}>{initials}</span>
                }
              </div>
            </div>
          </div>

          <div style={{ flex: 1, paddingBottom: 4 }}>
            <div className="ga-badge" style={{ display: 'inline-flex', padding: '3px 12px', borderRadius: 20, marginBottom: 14, background: 'rgba(200,168,120,0.07)', border: '1px solid rgba(200,168,120,0.15)' }}>
              <span style={{ fontSize: 8, fontFamily: 'var(--mono)', letterSpacing: 2.5, color: 'rgba(200,168,120,0.6)' }}>TRACER · OPÉRATEUR</span>
            </div>
            <div className="ga-name" style={{ fontSize: 62, fontWeight: 900, letterSpacing: -2.5, color: 'rgba(255,248,235,0.97)', fontFamily: 'var(--font)', lineHeight: 1, animation: 'glitch 8s ease infinite' }}>
              {name}
            </div>
            <div className="ga-stats" style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 16 }}>
              {[['0', 'recherches'], ['7', 'modules'], ['Juin 2026', 'membre depuis']].map(([v, l], i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.12)' }}>◆</span>}
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,248,235,0.7)', fontFamily: 'var(--mono)' }}>{v}</span>
                    <span style={{ fontSize: 11, fontWeight: 300, color: 'rgba(255,245,220,0.26)', fontFamily: 'var(--font)' }}>{l}</span>
                  </div>
                </React.Fragment>
              ))}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 8 }}>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: apiOnline === null ? 'rgba(255,255,255,0.2)' : apiOnline ? '#52d47a' : '#e05555',
                  animation: apiOnline === true ? 'dotBlink 2s ease infinite' : 'none',
                }} />
                <span style={{ fontSize: 10, fontFamily: 'var(--mono)', color: apiOnline === null ? 'rgba(255,255,255,0.2)' : apiOnline ? 'rgba(82,212,122,0.75)' : 'rgba(224,85,85,0.65)' }}>
                  {apiOnline === null ? '…' : apiOnline ? 'ONLINE' : 'OFFLINE'}
                </span>
              </div>
            </div>
          </div>

          <div style={{ paddingBottom: 4 }}>
            <GhostBtn label="Déconnexion" onClick={logout} />
          </div>
        </div>

        {/* ── DIVIDER 1 ── */}
        <div className="ga-divs" style={{ height: 1, background: 'linear-gradient(90deg, rgba(200,168,120,0.28), rgba(200,168,120,0.06) 60%, transparent)', margin: '0 0 36px' }} />

        {/* ── BODY ── */}
        <div style={{ display: 'flex', gap: 0 }}>

          {/* LEFT — fields */}
          <div style={{ flex: 1, paddingRight: 48 }}>

            {saveError && (
              <div style={{
                marginBottom: 18, padding: '11px 16px',
                background: 'rgba(196,122,80,0.07)', border: '1px solid rgba(196,122,80,0.2)',
                borderRadius: 8, fontSize: 12, color: 'rgba(220,130,90,0.95)',
              }}>
                {saveError}
              </div>
            )}

            <div className="ga-field">
              <FieldLabel>NOM COMPLET</FieldLabel>
              <EditRow value={name} onChange={v => saveUser({ name: v })} />
            </div>

            <FieldDiv className="ga-divs" />

            <div className="ga-field">
              <FieldLabel>ADRESSE E-MAIL</FieldLabel>
              <EditRow value={user.email || ''} placeholder="votre@email.com" onChange={v => saveUser({ email: v })} />
            </div>

            <FieldDiv className="ga-divs" />

            <div className="ga-field">
              <FieldLabel>MOT DE PASSE</FieldLabel>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0 16px' }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 20, letterSpacing: 7, color: 'rgba(255,248,235,0.38)' }}>••••••••••</span>
                <TextBtn>Changer ›</TextBtn>
              </div>
            </div>

            <FieldDiv className="ga-divs" />

            <div className="ga-field">
              <FieldLabel>DOUBLE AUTHENTIFICATION</FieldLabel>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 38, height: 21, borderRadius: 11, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.09)', position: 'relative' }}>
                    <div style={{ width: 15, height: 15, borderRadius: '50%', background: 'rgba(255,255,255,0.18)', position: 'absolute', top: 2, left: 2 }} />
                  </div>
                  <span style={{ fontSize: 12.5, fontFamily: 'var(--font)', color: 'rgba(196,122,80,0.65)' }}>Désactivée</span>
                </div>
                <TextBtn>Activer ›</TextBtn>
              </div>
            </div>

          </div>

          {/* VERTICAL SEP */}
          <div style={{ width: 1, background: 'linear-gradient(to bottom, rgba(200,168,120,0.12), rgba(200,168,120,0.04) 70%, transparent)', alignSelf: 'stretch', flexShrink: 0 }} />

          {/* RIGHT — statut + modules */}
          <div className="ga-right" style={{ width: 300, flexShrink: 0, paddingLeft: 48, display: 'flex', flexDirection: 'column', gap: 32 }}>

            {/* Statut */}
            <div>
              <FieldLabel>STATUT SYSTÈME</FieldLabel>
              <div style={{ padding: '12px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: apiOnline === null ? 'rgba(255,255,255,0.2)' : apiOnline ? '#52d47a' : '#e05555', animation: apiOnline === true ? 'dotBlink 2s ease infinite' : 'none' }} />
                  <span style={{ fontSize: 11, fontFamily: 'var(--mono)', letterSpacing: 1, color: apiOnline === null ? 'rgba(255,255,255,0.2)' : apiOnline ? 'rgba(82,212,122,0.8)' : 'rgba(224,85,85,0.7)' }}>
                    {apiOnline === null ? 'VÉRIFICATION…' : apiOnline ? 'TOUS LES SYSTÈMES OPÉRATIONNELS' : 'BACKEND HORS LIGNE'}
                  </span>
                </div>
                <div style={{ fontSize: 11, fontFamily: 'var(--font)', fontWeight: 300, color: 'rgba(255,245,220,0.24)' }}>Analyste OSINT · Accès complet · Juin 2026</div>
              </div>
            </div>

            {/* Modules */}
            <div>
              <FieldLabel>MODULES</FieldLabel>
              <div style={{ paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {MODULES.map((m, i) => <ModuleBar key={m.name} module={m} online={apiOnline} index={i} />)}
              </div>
            </div>

          </div>
        </div>

        {/* ── DIVIDER 2 ── */}
        <div className="ga-divs" style={{ height: 1, background: 'linear-gradient(90deg, rgba(196,80,60,0.2), rgba(196,80,60,0.06) 60%, transparent)', margin: '40px 0 0' }} />

        {/* ── DANGER ── */}
        <div className="ga-danger">
          <DangerRow />
        </div>

      </div>
    </div>
  )
}

/* ── FieldLabel ───────────────────────────────── */
function FieldLabel({ children }) {
  return (
    <div style={{ fontSize: 9, fontFamily: 'var(--mono)', letterSpacing: 2.5, color: 'rgba(200,168,120,0.35)', marginBottom: 2 }}>
      {children}
    </div>
  )
}

/* ── FieldDiv ─────────────────────────────────── */
function FieldDiv() {
  return <div className="ga-divs" style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '4px 0' }} />
}

/* ── EditRow ──────────────────────────────────── */
function EditRow({ value, onChange, placeholder }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft]     = useState(value)
  const [hov, setHov]         = useState(false)
  const inputRef = useRef(null)
  const wrapRef  = useRef(null)

  useEffect(() => { setDraft(value) }, [value])
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      gsap.from(inputRef.current, { opacity: 0, x: -8, duration: 0.2, ease: 'power2.out' })
    }
  }, [editing])

  function save() {
    if (!draft.trim()) return
    onChange(draft.trim())
    setEditing(false)
    if (wrapRef.current) gsap.fromTo(wrapRef.current, { opacity: 0.4 }, { opacity: 1, duration: 0.3 })
  }
  function cancel() { setDraft(value); setEditing(false) }

  return (
    <div ref={wrapRef} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ padding: '12px 0 16px' }}>
      {editing ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            ref={inputRef}
            value={draft}
            placeholder={placeholder}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel() }}
            style={{
              flex: 1, background: 'rgba(200,168,120,0.05)',
              border: 'none', borderBottom: '1px solid rgba(200,168,120,0.4)',
              outline: 'none', padding: '4px 0',
              color: 'rgba(255,248,235,0.92)', fontSize: 20,
              fontFamily: 'var(--font)', fontWeight: 500,
              caretColor: 'rgba(200,168,120,0.9)',
            }}
          />
          <MiniBtn onClick={save}   color="#52d47a">✓</MiniBtn>
          <MiniBtn onClick={cancel} color="rgba(255,255,255,0.25)">✕</MiniBtn>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 20, fontFamily: 'var(--font)', fontWeight: 500, color: value ? 'rgba(255,248,235,0.85)' : 'rgba(255,255,255,0.18)' }}>
            {value || placeholder || '—'}
          </span>
          <button onClick={() => setEditing(true)} style={{ all: 'unset', cursor: 'pointer', fontSize: 9, fontFamily: 'var(--mono)', letterSpacing: 1.5, color: hov ? 'rgba(200,168,120,0.8)' : 'rgba(200,168,120,0.25)', transition: 'color .15s' }}>
            Modifier ›
          </button>
        </div>
      )}
    </div>
  )
}

/* ── ModuleBar ────────────────────────────────── */
function ModuleBar({ module, online, index }) {
  const barRef = useRef(null)

  useEffect(() => {
    if (online === null || !barRef.current) return
    gsap.fromTo(barRef.current,
      { width: '0%' },
      { width: online ? '100%' : '8%', duration: 0.55, ease: 'power2.out', delay: 0.85 + index * 0.07 }
    )
  }, [online])

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 10, color: 'rgba(200,168,120,0.4)', width: 13, flexShrink: 0 }}>{module.icon}</span>
      <span style={{ fontSize: 11, fontFamily: 'var(--font)', color: 'rgba(255,245,220,0.5)', width: 128, flexShrink: 0 }}>{module.name}</span>
      <div style={{ flex: 1, height: 2, background: 'rgba(255,255,255,0.05)', borderRadius: 1, overflow: 'hidden' }}>
        <div ref={barRef} style={{
          height: '100%', width: 0, borderRadius: 1,
          background: online
            ? 'linear-gradient(90deg, rgba(82,212,122,0.35), rgba(82,212,122,0.85))'
            : 'rgba(224,85,85,0.3)',
        }} />
      </div>
      <span style={{ fontSize: 9, fontFamily: 'var(--mono)', width: 26, textAlign: 'right', color: online === null ? 'rgba(255,255,255,0.15)' : online ? 'rgba(82,212,122,0.6)' : 'rgba(224,85,85,0.5)' }}>
        {online === null ? '…' : online ? 'OK' : 'KO'}
      </span>
    </div>
  )
}

/* ── DangerRow ────────────────────────────────── */
function DangerRow() {
  const [confirm, setConfirm] = useState(false)
  const [hov, setHov]         = useState(false)
  const btnRef = useRef(null)

  function handleClick() {
    if (!confirm) {
      setConfirm(true)
      if (btnRef.current) gsap.from(btnRef.current, { x: 6, opacity: 0, duration: 0.25, ease: 'power2.out' })
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '28px 0 8px' }}>
      <div>
        <div style={{ fontSize: 9, fontFamily: 'var(--mono)', letterSpacing: 2.5, color: 'rgba(196,80,60,0.4)', marginBottom: 8 }}>ZONE DE DANGER</div>
        <div style={{ fontSize: 14.5, fontFamily: 'var(--font)', color: 'rgba(255,245,220,0.62)', fontWeight: 500, marginBottom: 3 }}>Supprimer le compte</div>
        <div style={{ fontSize: 11.5, fontFamily: 'var(--font)', fontWeight: 300, color: 'rgba(255,245,220,0.22)' }}>Action irréversible — toutes les données seront effacées.</div>
      </div>

      {!confirm ? (
        <button
          onMouseEnter={() => setHov(true)}
          onMouseLeave={() => setHov(false)}
          onClick={handleClick}
          style={{
            all: 'unset', cursor: 'pointer', flexShrink: 0,
            padding: '9px 22px', borderRadius: 8,
            border: `1px solid ${hov ? 'rgba(196,80,60,0.42)' : 'rgba(196,80,60,0.18)'}`,
            background: hov ? 'rgba(196,80,60,0.08)' : 'transparent',
            fontSize: 10, fontFamily: 'var(--mono)', letterSpacing: 1.5,
            color: hov ? 'rgba(220,90,70,0.9)' : 'rgba(196,80,60,0.45)',
            transition: 'all .18s',
          }}
        >SUPPRIMER</button>
      ) : (
        <div ref={btnRef} style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <GhostBtn label="Annuler" onClick={() => setConfirm(false)} />
          <button style={{
            all: 'unset', cursor: 'pointer',
            padding: '9px 22px', borderRadius: 8,
            border: '1px solid rgba(196,80,60,0.45)',
            background: 'rgba(196,80,60,0.12)',
            fontSize: 10, fontFamily: 'var(--mono)', letterSpacing: 1.5,
            color: 'rgba(220,90,70,0.9)',
          }}>Confirmer</button>
        </div>
      )}
    </div>
  )
}

/* ── Primitives ───────────────────────────────── */
function MiniBtn({ onClick, color, children }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ all: 'unset', cursor: 'pointer', width: 30, height: 30, borderRadius: 6, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${color}44`, background: hov ? `${color}18` : 'transparent', color, fontSize: 13, transition: 'all .15s' }}>
      {children}
    </button>
  )
}

function TextBtn({ children, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ all: 'unset', cursor: 'pointer', fontSize: 9, fontFamily: 'var(--mono)', letterSpacing: 1.5, color: hov ? 'rgba(200,168,120,0.8)' : 'rgba(200,168,120,0.25)', transition: 'color .15s' }}>
      {children}
    </button>
  )
}

function BackBtn({ onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        all: 'unset', cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', gap: 7,
        marginBottom: 20,
        padding: '6px 14px 6px 10px', borderRadius: 999,
        border: `1px solid ${hov ? 'rgba(200,168,120,0.28)' : 'rgba(200,168,120,0.1)'}`,
        background: hov ? 'rgba(200,168,120,0.06)' : 'transparent',
        fontSize: 9.5, fontFamily: 'var(--mono)', letterSpacing: 2,
        color: hov ? 'rgba(200,168,120,0.85)' : 'rgba(200,168,120,0.35)',
        transition: 'all .18s',
      }}
    >
      <span style={{ fontSize: 11, lineHeight: 1, transform: hov ? 'translateX(-2px)' : 'translateX(0)', transition: 'transform .18s' }}>←</span>
      RETOUR
    </button>
  )
}

function GhostBtn({ label, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ all: 'unset', cursor: 'pointer', padding: '9px 18px', borderRadius: 8, border: `1px solid ${hov ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.07)'}`, background: hov ? 'rgba(255,255,255,0.04)' : 'transparent', fontSize: 10, fontFamily: 'var(--mono)', letterSpacing: 1.5, color: hov ? 'rgba(255,245,220,0.7)' : 'rgba(255,245,220,0.28)', transition: 'all .18s' }}>
      {label}
    </button>
  )
}
