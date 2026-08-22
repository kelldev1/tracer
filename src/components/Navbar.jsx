import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getUser } from '../utils/auth'
import { API_BASE_URL } from '../config'

const NAV = [
  { label: 'Rechercher',      path: '/aggregator' },
  { label: 'Critères',        path: '/criteria'   },
  { label: 'Fonctionnalités', path: '/features'   },
  { label: 'FAQ',             path: '/faq'        },
]

function readUser()   { try { return JSON.parse(localStorage.getItem('tracer_user')) } catch { return null } }
function readAvatar() {
  const u = readUser()
  return localStorage.getItem(`tracer_avatar_${(u?.email || '').toLowerCase()}`) || null
}

export default function Navbar() {
  const [apiOnline, setApiOnline] = useState(null)
  const [authUser, setAuthUser]   = useState(readUser)
  const [authAvatar, setAuthAvatar] = useState(readAvatar)
  const location = useLocation()
  const navigate  = useNavigate()

  useEffect(() => {
    fetch(`${API_BASE_URL}/`).then(r => setApiOnline(r.ok)).catch(() => setApiOnline(false))
  }, [])

  // Sync auth state on route change + listen for custom events
  useEffect(() => {
    setAuthUser(readUser())
    setAuthAvatar(readAvatar())
  }, [location.pathname])

  useEffect(() => {
    function onAuth()   { setAuthUser(readUser()); setAuthAvatar(readAvatar()) }
    function onAvatar() { setAuthAvatar(readAvatar()) }
    window.addEventListener('tracer_auth',   onAuth)
    window.addEventListener('tracer_avatar', onAvatar)
    return () => {
      window.removeEventListener('tracer_auth',   onAuth)
      window.removeEventListener('tracer_avatar', onAvatar)
    }
  }, [])

  return (
    <div style={{
      position: 'fixed', top: 14, left: '50%', transform: 'translateX(-50%)',
      zIndex: 1000,
      display: 'flex', alignItems: 'center', gap: 4,
      padding: '6px 8px 6px 10px', borderRadius: 999,
      background: 'rgba(10,9,12,0.72)',
      backdropFilter: 'blur(20px) saturate(160%)',
      WebkitBackdropFilter: 'blur(20px) saturate(160%)',
      border: '1px solid rgba(255,255,255,0.09)',
      boxShadow: '0 4px 24px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)',
      WebkitAppRegion: 'drag',
      userSelect: 'none', whiteSpace: 'nowrap',
    }}>

      {/* Logo */}
      <button onClick={() => navigate('/aggregator')} style={{
        all: 'unset', cursor: 'pointer', marginRight: 10,
        fontSize: 13, fontWeight: 800, letterSpacing: 0.5,
        color: 'rgba(255,245,215,0.92)', fontFamily: 'var(--font)',
        WebkitAppRegion: 'no-drag',
      }}>
        TRACER
      </button>

      {/* Nav links */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 1, WebkitAppRegion: 'no-drag' }}>
        {NAV.map(({ label, path }) => (
          <NavLink key={path} label={label} active={location.pathname === path} onClick={() => navigate(path)} />
        ))}
      </nav>

      {/* Sep */}
      <div style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.08)', margin: '0 4px' }} />

      {/* API dot */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '4px 10px', borderRadius: 999,
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.07)',
        WebkitAppRegion: 'no-drag',
      }}>
        <span style={{
          width: 5, height: 5, borderRadius: '50%',
          background: apiOnline === true ? '#c8a878' : apiOnline === false ? '#c47a50' : 'rgba(255,255,255,0.2)',
          boxShadow: apiOnline === true ? '0 0 5px rgba(200,168,120,0.7)' : 'none',
          animation: apiOnline === true ? 'pulse 2s ease infinite' : 'none',
          flexShrink: 0,
        }} />
        <span style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'rgba(255,255,255,0.3)', letterSpacing: 0.5 }}>
          API
        </span>
      </div>

      {/* Badge admin */}
      {authUser?.role === 'admin' && (
        <button
          onClick={() => navigate('/admin')}
          style={{
            all: 'unset', cursor: 'pointer',
            padding: '3px 9px', borderRadius: 999,
            background: 'rgba(200,168,120,0.12)',
            border: '1px solid rgba(200,168,120,0.35)',
            fontSize: 9, fontFamily: 'var(--mono)', letterSpacing: 2,
            color: 'rgba(200,168,120,0.9)',
            WebkitAppRegion: 'no-drag',
            transition: 'background .2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(200,168,120,0.22)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(200,168,120,0.12)'}
        >
          ADMIN
        </button>
      )}

      {/* Auth zone */}
      <div style={{ WebkitAppRegion: 'no-drag' }}>
        {authUser
          ? <NavAvatar avatar={authAvatar} name={authUser.name} onClick={() => navigate('/profile')} />
          : <ConnectBtn onClick={() => navigate('/login')} />
        }
      </div>

      {/* CTA */}
      <SourceBtn />

    </div>
  )
}

/* ── Sub-components ───────────────────────────── */

function NavAvatar({ avatar, name, onClick }) {
  const [hov, setHov] = useState(false)
  const initials = (name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        all: 'unset', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 7,
        padding: '3px 10px 3px 3px', borderRadius: 999,
        background: hov ? 'rgba(200,168,120,0.09)' : 'transparent',
        border: `1px solid ${hov ? 'rgba(200,168,120,0.22)' : 'rgba(200,168,120,0.1)'}`,
        transition: 'all .18s',
      }}
    >
      {/* Avatar circle */}
      <div style={{
        width: 26, height: 26, borderRadius: '50%',
        overflow: 'hidden',
        background: avatar ? 'transparent' : 'rgba(200,168,120,0.14)',
        border: '1px solid rgba(200,168,120,0.38)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {avatar
          ? <img src={avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
          : <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(200,168,120,0.92)', fontFamily: 'var(--font)' }}>{initials}</span>
        }
      </div>
      {/* First name */}
      <span style={{
        fontSize: 11.5, fontFamily: 'var(--font)', fontWeight: 500,
        color: hov ? 'rgba(255,245,215,0.9)' : 'rgba(255,245,215,0.58)',
        transition: 'color .15s',
      }}>
        {(name || 'Profil').split(' ')[0]}
      </span>
    </button>
  )
}

function ConnectBtn({ onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
      all: 'unset', cursor: 'pointer',
      padding: '5px 12px', borderRadius: 999,
      fontSize: 11.5, fontWeight: 500, fontFamily: 'var(--font)',
      color: hov ? 'rgba(255,245,215,0.9)' : 'rgba(255,245,215,0.55)',
      transition: 'color .15s',
    }}>
      Se connecter
    </button>
  )
}

function SourceBtn() {
  const [hov, setHov] = useState(false)
  return (
    <button onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
      all: 'unset', cursor: 'pointer',
      padding: '5px 14px', borderRadius: 999,
      background: hov ? 'rgba(200,168,120,1)' : 'rgba(200,168,120,0.9)',
      color: '#09080a', fontSize: 11.5, fontWeight: 700,
      fontFamily: 'var(--font)', letterSpacing: 0.3,
      boxShadow: hov ? '0 4px 18px rgba(200,168,120,0.4)' : '0 2px 10px rgba(200,168,120,0.25)',
      transition: 'all .18s',
    }}>
      Source
    </button>
  )
}

function NavLink({ label, active, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
      all: 'unset', cursor: 'pointer',
      padding: '5px 11px', borderRadius: 999,
      fontSize: 12, fontWeight: active ? 600 : 400,
      fontFamily: 'var(--font)',
      color: active ? 'rgba(255,245,215,0.95)' : hov ? 'rgba(255,245,215,0.75)' : 'rgba(255,245,215,0.4)',
      background: active ? 'rgba(255,255,255,0.1)' : hov ? 'rgba(255,255,255,0.05)' : 'transparent',
      transition: 'all .15s',
    }}>
      {label}
    </button>
  )
}
