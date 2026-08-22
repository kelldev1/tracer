import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { register } from '../utils/auth'

const KEYFRAMES = `
@keyframes cardIn {
  from { opacity:0; transform:translateY(18px) scale(0.985); }
  to   { opacity:1; transform:translateY(0) scale(1); }
}
@keyframes fieldIn {
  from { opacity:0; transform:translateY(8px); }
  to   { opacity:1; transform:translateY(0); }
}
@keyframes ambientPulse {
  0%,100% { opacity:0.6; }
  50%      { opacity:1; }
}
`

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm]         = useState({ name: '', email: '', password: '', confirm: '' })
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [focused, setFocused]   = useState(null)
  const [btnHover, setBtnHover] = useState(false)

  useEffect(() => {
    const el = document.createElement('style')
    el.textContent = KEYFRAMES
    document.head.appendChild(el)
    return () => document.head.removeChild(el)
  }, [])

  // Déjà connecté → profil direct
  useEffect(() => {
    try { if (JSON.parse(localStorage.getItem('tracer_user'))) navigate('/profile', { replace: true }) } catch {}
  }, [])

  function set(key) { return v => setForm(f => ({ ...f, [key]: v })) }

  async function handleSubmit(e) {
    e.preventDefault()
    const { name, email, password, confirm } = form
    if (!name || !email || !password || !confirm) { setError('Tous les champs sont requis.'); return }
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas.'); return }
    if (password.length < 8)  { setError('Le mot de passe doit contenir au moins 8 caractères.'); return }
    setLoading(true)
    setError('')
    const result = await register(name, email, password)
    setLoading(false)
    if (!result.success) { setError(result.error); return }
    navigate('/aggregator')
  }

  const btnBg = loading
    ? 'linear-gradient(135deg, rgba(200,168,120,0.38) 0%, rgba(184,149,106,0.32) 100%)'
    : btnHover
      ? 'linear-gradient(135deg, #d6bc8e 0%, #c8a878 50%, #bc9868 100%)'
      : 'linear-gradient(135deg, #c8a878 0%, #b8956a 100%)'

  const btnShadow = loading
    ? 'none'
    : btnHover
      ? '0 8px 36px rgba(200,168,120,0.55), inset 0 1px 0 rgba(255,255,255,0.28)'
      : '0 4px 22px rgba(200,168,120,0.32), inset 0 1px 0 rgba(255,255,255,0.2)'

  const FIELDS = [
    { id: 'name',     label: 'Nom complet',       type: 'text',     key: 'name',     delay: 0.10 },
    { id: 'email',    label: 'Adresse e-mail',     type: 'email',    key: 'email',    delay: 0.16 },
    { id: 'password', label: 'Mot de passe',       type: 'password', key: 'password', delay: 0.22 },
    { id: 'confirm',  label: 'Confirmer le mot de passe', type: 'password', key: 'confirm', delay: 0.28 },
  ]

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100%', padding: '74px 16px 16px',
      overflowY: 'auto',
    }}>
      {/* Gradient border wrapper */}
      <div style={{
        padding: 1,
        background: 'linear-gradient(145deg, rgba(200,168,120,0.6) 0%, rgba(200,168,120,0.05) 42%, rgba(200,168,120,0.35) 100%)',
        borderRadius: 16,
        boxShadow: '0 40px 120px rgba(0,0,0,0.7), 0 0 80px rgba(200,168,120,0.07)',
        animation: 'cardIn .5s cubic-bezier(0.16,1,0.3,1)',
        width: '100%', maxWidth: 1100,
        flexShrink: 0,
      }}>
        <div style={{
          display: 'flex', borderRadius: 15, overflow: 'hidden',
          background: 'rgba(8,7,11,0.42)',
          backdropFilter: 'blur(32px) saturate(160%)',
          WebkitBackdropFilter: 'blur(32px) saturate(160%)',
        }}>

          {/* ── LEFT BRAND PANEL ─────────────────── */}
          <div style={{
            position: 'relative',
            width: 248, flexShrink: 0,
            borderRight: '1px solid rgba(200,168,120,0.1)',
            padding: '44px 36px',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            overflow: 'hidden',
            background: 'linear-gradient(160deg, rgba(200,168,120,0.07) 0%, rgba(0,0,0,0.08) 55%)',
          }}>

            <div style={{
              position: 'absolute', top: -80, left: -80,
              width: 260, height: 260,
              background: 'radial-gradient(circle, rgba(200,168,120,0.1) 0%, transparent 68%)',
              pointerEvents: 'none',
              animation: 'ambientPulse 5s ease infinite',
            }} />

            <div style={{
              position: 'absolute', bottom: -40, right: -20,
              fontSize: 210, fontWeight: 900, lineHeight: 1,
              color: 'rgba(200,168,120,0.032)',
              fontFamily: 'var(--font)', letterSpacing: -8,
              userSelect: 'none', pointerEvents: 'none',
            }}>
              T
            </div>

            {/* Top */}
            <div>
              <div style={{
                width: 36, height: 36, borderRadius: 9,
                background: 'rgba(200,168,120,0.09)',
                border: '1px solid rgba(200,168,120,0.22)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 30,
                boxShadow: '0 0 20px rgba(200,168,120,0.08)',
              }}>
                <span style={{ fontSize: 15, fontWeight: 800, color: 'rgba(200,168,120,0.92)', fontFamily: 'var(--font)' }}>T</span>
              </div>

              <div style={{
                fontSize: 9, fontFamily: 'var(--mono)', letterSpacing: 2.5,
                color: 'rgba(200,168,120,0.38)', textTransform: 'uppercase', marginBottom: 10,
              }}>
                Plateforme d'enquête
              </div>

              <h2 style={{
                fontSize: 32, fontWeight: 800, letterSpacing: 2,
                color: 'rgba(255,248,235,0.93)', fontFamily: 'var(--font)', lineHeight: 1,
                marginBottom: 24,
              }}>
                TRACER
              </h2>

              {/* What you get */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  'Recherche OSINT unifiée',
                  'Accès à tous les modules',
                  'Historique des requêtes',
                  'Exports et rapports',
                ].map((item, i) => (
                  <div key={item} style={{
                    display: 'flex', alignItems: 'center', gap: 9,
                    animation: `fieldIn .4s ease ${0.1 + i * 0.07}s both`,
                  }}>
                    <div style={{
                      width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
                      background: 'rgba(200,168,120,0.12)',
                      border: '1px solid rgba(200,168,120,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(200,168,120,0.8)' }} />
                    </div>
                    <span style={{ fontSize: 11, fontFamily: 'var(--font)', fontWeight: 300, color: 'rgba(255,248,235,0.5)', letterSpacing: 0.2 }}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ fontSize: 8, fontFamily: 'var(--mono)', letterSpacing: 2.5, color: 'rgba(255,255,255,0.14)' }}>
              EST. 2026
            </div>
          </div>

          {/* ── RIGHT FORM PANEL ─────────────────── */}
          <div style={{
            flex: 1, padding: '44px 52px',
            background: 'linear-gradient(180deg, rgba(200,168,120,0.02) 0%, transparent 120px)',
          }}>

            {/* Header */}
            <div style={{ marginBottom: 32 }}>
              <h1 style={{
                fontSize: 30, fontWeight: 700, letterSpacing: -0.6,
                color: 'rgba(255,248,235,0.96)', fontFamily: 'var(--font)',
                marginBottom: 8, lineHeight: 1.1,
              }}>
                Créer un compte
              </h1>
              <p style={{
                fontSize: 12.5, fontFamily: 'var(--font)', fontWeight: 300,
                color: 'rgba(255,245,220,0.36)', lineHeight: 1.6,
              }}>
                Rejoignez la plateforme d'enquête TRACER.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>

              {FIELDS.map(({ id, label, type, key, delay }, i) => (
                <div key={id}>
                  <div style={{ animation: `fieldIn .5s ease ${delay}s both` }}>
                    <FloatingField
                      id={id} label={label} type={type}
                      value={form[key]} onChange={set(key)}
                      focused={focused === id}
                      onFocus={() => setFocused(id)}
                      onBlur={() => setFocused(null)}
                    />
                  </div>
                  {i < FIELDS.length - 1 && <div style={{ height: 24 }} />}
                </div>
              ))}

              {/* Error */}
              {error && (
                <div style={{
                  marginTop: 18, padding: '11px 16px',
                  background: 'rgba(196,122,80,0.07)',
                  border: '1px solid rgba(196,122,80,0.2)',
                  borderRadius: 8,
                  fontSize: 12, fontFamily: 'var(--font)',
                  color: 'rgba(220,130,90,0.95)', lineHeight: 1.5,
                }}>
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                onMouseEnter={() => setBtnHover(true)}
                onMouseLeave={() => setBtnHover(false)}
                style={{
                  all: 'unset', cursor: loading ? 'default' : 'pointer',
                  display: 'block', width: '100%',
                  marginTop: 24,
                  padding: '14px 0', borderRadius: 9,
                  textAlign: 'center',
                  fontSize: 12, fontWeight: 700, letterSpacing: 1.4,
                  fontFamily: 'var(--font)', textTransform: 'uppercase',
                  color: loading ? 'rgba(9,8,11,0.45)' : '#09080b',
                  background: btnBg,
                  boxShadow: btnShadow,
                  transition: 'background .22s ease, box-shadow .22s ease',
                  animation: 'fieldIn .5s ease 0.36s both',
                }}
              >
                {loading ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                    <Spinner />
                    Création en cours…
                  </span>
                ) : 'Créer mon compte'}
              </button>

            </form>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '24px 0 18px' }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.055)' }} />
              <span style={{ fontSize: 8.5, fontFamily: 'var(--mono)', color: 'rgba(255,255,255,0.18)', letterSpacing: 2 }}>OU</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.055)' }} />
            </div>

            {/* Back to login */}
            <p style={{ textAlign: 'center', fontSize: 12, fontFamily: 'var(--font)', color: 'rgba(255,245,220,0.3)' }}>
              Déjà un compte ?{' '}
              <GhostLink label="Se connecter" onClick={() => navigate('/login')} />
            </p>

          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Sub-components ───────────────────────────────── */

function FloatingField({ id, label, type, value, onChange, focused, onFocus, onBlur }) {
  const lifted = focused || value.length > 0
  return (
    <div style={{ position: 'relative', paddingTop: 20 }}>
      <label htmlFor={id} style={{
        position: 'absolute', left: 0,
        top: lifted ? 0 : 22,
        fontSize: lifted ? 8.5 : 13.5,
        letterSpacing: lifted ? 1.8 : 0.2,
        fontWeight: lifted ? 500 : 300,
        color: focused
          ? 'rgba(200,168,120,0.95)'
          : lifted ? 'rgba(200,168,120,0.55)' : 'rgba(255,245,220,0.28)',
        fontFamily: lifted ? 'var(--mono)' : 'var(--font)',
        textTransform: lifted ? 'uppercase' : 'none',
        transition: 'all .24s cubic-bezier(0.4,0,0.2,1)',
        pointerEvents: 'none',
      }}>
        {label}
      </label>

      <input
        id={id} type={type} value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={onFocus} onBlur={onBlur}
        style={{
          all: 'unset', display: 'block', width: '100%',
          paddingBottom: 12,
          color: 'rgba(255,248,235,0.95)',
          fontSize: 14.5, fontWeight: 400,
          fontFamily: type === 'password' ? 'var(--mono)' : 'var(--font)',
          letterSpacing: type === 'password' ? 5 : 0.2,
          userSelect: 'text', boxSizing: 'border-box',
        }}
        autoComplete={
          type === 'password'
            ? (id === 'confirm' ? 'new-password' : 'new-password')
            : id === 'email' ? 'email' : 'name'
        }
      />

      <div style={{ position: 'relative', height: 1 }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.07)' }} />
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: focused ? '100%' : '0%',
          background: 'linear-gradient(90deg, rgba(200,168,120,1), rgba(200,168,120,0.6))',
          boxShadow: focused ? '0 0 14px rgba(200,168,120,0.28)' : 'none',
          transition: 'width .38s cubic-bezier(0.4,0,0.2,1), box-shadow .38s ease',
        }} />
      </div>
    </div>
  )
}

function GhostLink({ label, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <button type="button" onClick={onClick} style={{
      all: 'unset', cursor: 'pointer',
      fontSize: 12, fontFamily: 'var(--font)',
      color: hov ? 'rgba(200,168,120,0.9)' : 'rgba(200,168,120,0.5)',
      transition: 'color .16s',
    }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {label}
    </button>
  )
}

function Spinner() {
  return (
    <div style={{
      width: 13, height: 13, borderRadius: '50%',
      border: '1.5px solid rgba(9,8,11,0.25)',
      borderTopColor: 'rgba(9,8,11,0.7)',
      animation: 'spin .75s linear infinite',
      flexShrink: 0,
    }} />
  )
}
