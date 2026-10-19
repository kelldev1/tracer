import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUser, getAccounts, deleteAccount } from '../utils/auth'

export default function Admin() {
  const navigate   = useNavigate()
  const [accounts, setAccounts] = useState([])
  const [confirm, setConfirm]   = useState(null)

  // Sécurité : redirect si pas admin (le backend revérifie aussi le rôle sur chaque appel /auth/accounts)
  useEffect(() => {
    const u = getUser()
    if (!u || u.role !== 'admin') { navigate('/login', { replace: true }); return }
    getAccounts().then(setAccounts)
  }, [])

  async function handleDelete(email) {
    if (confirm === email) {
      await deleteAccount(email)
      setAccounts(await getAccounts())
      setConfirm(null)
    } else {
      setConfirm(email)
    }
  }

  const user = getUser()

  return (
    <div style={{ height: '100%', overflowY: 'auto', fontFamily: 'var(--font)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '72px 52px 96px' }}>

        {/* ── Header ─────────────────────────────────────────────── */}
        <div style={{ marginBottom: 56 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
            <span style={{ fontSize: 20, color: 'rgba(200,168,120,0.7)' }}>⬡</span>
            <span style={{ fontSize: 9.5, letterSpacing: 4, textTransform: 'uppercase', color: 'rgba(200,168,120,0.8)', fontFamily: 'var(--mono)' }}>
              Panel Administrateur
            </span>
          </div>
          <h1 style={{ fontSize: 52, fontWeight: 300, letterSpacing: -2, color: '#fff', margin: '0 0 12px' }}>
            Bonjour, <span style={{ color: 'rgba(200,168,120,0.9)' }}>{user?.name}</span>.
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.28)', margin: 0 }}>
            Accès complet · Rôle administrateur
          </p>
        </div>

        {/* ── Stat strip ─────────────────────────────────────────── */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 16, overflow: 'hidden', marginBottom: 48,
          background: 'rgba(8,8,8,0.6)',
          backdropFilter: 'blur(20px)',
        }}>
          {[
            { v: accounts.length, l: 'Comptes clients' },
            { v: '2', l: 'Administrateurs' },
            { v: accounts.length, l: 'Actifs ce mois' },
          ].map((s, i) => (
            <div key={i} style={{
              padding: '28px 36px',
              borderRight: i < 2 ? '1px solid rgba(255,255,255,0.07)' : 'none',
            }}>
              <div style={{ fontSize: 40, fontWeight: 800, fontFamily: 'var(--mono)', color: 'rgba(200,168,120,0.85)', letterSpacing: -1.5, lineHeight: 1 }}>
                {s.v}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)', marginTop: 8 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* ── Comptes clients ────────────────────────────────────── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'rgba(255,255,255,0.7)', margin: 0, letterSpacing: -0.3 }}>
              Comptes clients
            </h2>
            <span style={{ fontSize: 9.5, fontFamily: 'var(--mono)', letterSpacing: 2, color: 'rgba(255,255,255,0.18)' }}>
              {accounts.length} COMPTE{accounts.length !== 1 ? 'S' : ''}
            </span>
          </div>

          {/* Header row */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 140px 80px',
            padding: '10px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
          }}>
            {['NOM', 'EMAIL', 'INSCRIPTION', ''].map((h, i) => (
              <span key={i} style={{ fontSize: 9, fontFamily: 'var(--mono)', letterSpacing: 2.5, color: 'rgba(255,255,255,0.18)' }}>
                {h}
              </span>
            ))}
          </div>

          {accounts.length === 0 ? (
            <div style={{
              padding: '48px 20px', textAlign: 'center',
              color: 'rgba(255,255,255,0.2)', fontSize: 13,
              border: '1px dashed rgba(255,255,255,0.07)',
              borderTop: 'none', borderRadius: '0 0 12px 12px',
            }}>
              Aucun compte client enregistré.
            </div>
          ) : (
            accounts.map((acc, i) => (
              <AccountRow
                key={acc.email}
                acc={acc}
                last={i === accounts.length - 1}
                isConfirm={confirm === acc.email}
                onDelete={() => handleDelete(acc.email)}
                onCancel={() => setConfirm(null)}
              />
            ))
          )}
        </div>

        {/* ── Admins ─────────────────────────────────────────────── */}
        <div style={{ marginTop: 48 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'rgba(255,255,255,0.7)', margin: 0, letterSpacing: -0.3 }}>
              Administrateurs
            </h2>
            <span style={{ fontSize: 9.5, fontFamily: 'var(--mono)', letterSpacing: 2, color: 'rgba(200,168,120,0.4)' }}>
              ACCÈS COMPLET
            </span>
          </div>

          <div style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, overflow: 'hidden', background: 'rgba(8,8,8,0.5)' }}>
            {[
              { name: 'arail', email: 'admin1@example.com' },
              { name: 'razia', email: 'admin2@example.com' },
            ].map((a, i, arr) => (
              <div key={a.email} style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr auto',
                padding: '18px 20px',
                borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                alignItems: 'center',
              }}>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{a.name}</span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--mono)' }}>{a.email}</span>
                <span style={{
                  fontSize: 9, fontFamily: 'var(--mono)', letterSpacing: 2,
                  padding: '3px 10px', borderRadius: 999,
                  background: 'rgba(200,168,120,0.1)',
                  border: '1px solid rgba(200,168,120,0.28)',
                  color: 'rgba(200,168,120,0.85)',
                }}>
                  ADMIN
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

function AccountRow({ acc, last, isConfirm, onDelete, onCancel }) {
  const [hov, setHov] = useState(false)
  const date = acc.created_at
    ? new Date(acc.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—'

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 140px 80px',
        padding: '16px 20px',
        borderBottom: last ? 'none' : '1px solid rgba(255,255,255,0.05)',
        background: hov ? 'rgba(255,255,255,0.02)' : 'transparent',
        transition: 'background .2s',
        alignItems: 'center',
      }}
    >
      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>{acc.name}</span>
      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.32)', fontFamily: 'var(--mono)' }}>{acc.email}</span>
      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)' }}>{date}</span>
      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
        {isConfirm ? (
          <>
            <button onClick={onDelete} style={btnStyle('#c47a50', 'rgba(196,122,80,0.15)')}>Confirmer</button>
            <button onClick={onCancel} style={btnStyle('rgba(255,255,255,0.3)', 'transparent')}>Annuler</button>
          </>
        ) : (
          <button onClick={onDelete} style={btnStyle('rgba(255,255,255,0.2)', 'transparent')}>Suppr.</button>
        )}
      </div>
    </div>
  )
}

function btnStyle(color, bg) {
  return {
    all: 'unset', cursor: 'pointer',
    fontSize: 10, fontFamily: 'var(--mono)', letterSpacing: 1,
    color, background: bg,
    padding: '3px 8px', borderRadius: 6,
    border: `1px solid ${color}`,
    transition: 'all .15s',
  }
}
