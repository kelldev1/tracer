import React, { useEffect, useState } from 'react'

const STEPS = [
  'Initialisation du scan...',
  'Interrogation des sources...',
  'Corrélation des données...',
  'Analyse en cours...',
  'Finalisation...',
]

export default function Loader({ label }) {
  const [step, setStep] = useState(0)
  const [dots, setDots] = useState('')

  useEffect(() => {
    const t1 = setInterval(() => setStep(s => (s + 1) % STEPS.length), 1800)
    const t2 = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 500)
    return () => { clearInterval(t1); clearInterval(t2) }
  }, [])

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: 28, padding: '60px 20px',
      animation: 'fadeIn .3s ease'
    }}>
      {/* Spinner */}
      <div style={{ position: 'relative', width: 56, height: 56 }}>
        <div style={{
          position: 'absolute', inset: 0,
          border: '1px solid var(--border)',
          borderTop: '1px solid var(--cyan)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <div style={{
          position: 'absolute', inset: 8,
          border: '1px solid transparent',
          borderTop: '1px solid var(--cyan)',
          borderRadius: '50%',
          animation: 'spin .6s linear infinite reverse',
          opacity: .5
        }} />
        <div style={{
          position: 'absolute', inset: '50%', transform: 'translate(-50%, -50%)',
          width: 6, height: 6, borderRadius: '50%',
          background: 'var(--cyan)',
          animation: 'pulse 1s ease infinite'
        }} />
      </div>

      {/* Text */}
      <div style={{ textAlign: 'center' }}>
        {label && (
          <div style={{
            fontSize: 13, fontFamily: 'var(--mono)', color: 'var(--cyan)',
            marginBottom: 8, letterSpacing: 1
          }}>{label}</div>
        )}
        <div style={{ fontSize: 11, color: 'var(--t3)', fontFamily: 'var(--mono)' }}>
          {STEPS[step]}<span style={{ animation: 'blink .8s step-end infinite' }}>{dots}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{
        width: 200, height: 1,
        background: 'var(--border)', borderRadius: 1, overflow: 'hidden'
      }}>
        <div style={{
          height: '100%', background: 'var(--cyan)',
          borderRadius: 1,
          animation: 'indeterminate 1.5s ease infinite',
          transformOrigin: 'left',
        }} />
        <style>{`
          @keyframes indeterminate {
            0%   { transform: scaleX(0) translateX(0); }
            50%  { transform: scaleX(.6) translateX(80px); }
            100% { transform: scaleX(0) translateX(400px); }
          }
        `}</style>
      </div>
    </div>
  )
}
