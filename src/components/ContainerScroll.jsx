import React, { useRef, useEffect } from 'react'
import { useMotionValue, useTransform, motion } from 'framer-motion'

// ─── 3D iPad-style tablet ────────────────────────────────────────────────────
const T = 11 // depth in px

const Tablet3D = ({ rotate, scale, children }) => (
  <motion.div style={{
    rotateX: rotate,
    scale,
    transformOrigin: '50% 0%',
    transformStyle: 'preserve-3d',
    maxWidth: '64rem',
    height: '38rem',
    margin: '0 auto',
    position: 'relative',
  }}>

    {/* ── FRONT FACE ────────────────────────────────────────────── */}
    <div style={{
      position: 'absolute', inset: 0,
      borderRadius: 30,
      background: 'linear-gradient(150deg, #525254 0%, #1c1c1e 18%, #2e2e30 52%, #1e1e20 78%, #3c3c3e 100%)',
      boxShadow: `
        0 90px 150px rgba(0,0,0,0.98),
        0 40px 80px  rgba(0,0,0,0.7),
        inset 0  1.5px 0   rgba(255,255,255,0.18),
        inset 0 -1px   0   rgba(0,0,0,0.55),
        inset  1px 0   0   rgba(255,255,255,0.07),
        inset -1px 0   0   rgba(0,0,0,0.28)
      `,
      padding: '20px 18px 12px',
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* Grille top bezel — speaker + caméra */}
      <div style={{
        flexShrink: 0, height: 14, marginBottom: 8,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
      }}>
        <div style={{
          width: 38, height: 4, borderRadius: 2,
          background: '#0c0c0e',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.95)',
        }} />
        <div style={{
          width: 7, height: 7, borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 35%, #1a1a1c, #0a0a0c)',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.9), 0 0 0 1.5px rgba(255,255,255,0.06)',
        }} />
        <div style={{
          width: 4, height: 4, borderRadius: '50%',
          background: '#0e0e10',
          opacity: 0.6,
        }} />
      </div>

      {/* ÉCRAN */}
      <div style={{
        flex: 1,
        borderRadius: 13,
        overflow: 'hidden',
        background: '#040408',
        position: 'relative',
      }}>
        {children}

        {/* Reflet diagonale verre */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(130deg, rgba(255,255,255,0.072) 0%, rgba(255,255,255,0.025) 28%, transparent 62%)',
          pointerEvents: 'none',
          borderRadius: 13,
        }} />

        {/* Vignette écran (bords sombres) */}
        <div style={{
          position: 'absolute', inset: 0,
          boxShadow: 'inset 0 0 28px rgba(0,0,0,0.55)',
          pointerEvents: 'none',
          borderRadius: 13,
        }} />
      </div>

      {/* Home indicator */}
      <div style={{
        flexShrink: 0, height: 10, marginTop: 8,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          width: 74, height: 3.5, borderRadius: 2,
          background: 'rgba(255,255,255,0.24)',
        }} />
      </div>

      {/* ─ Bouton Power (droite) ─ */}
      <div style={{
        position: 'absolute', right: -4, top: '22%',
        width: 4, height: 46,
        borderRadius: '0 2.5px 2.5px 0',
        background: 'linear-gradient(to right, #28282a, #424244)',
        boxShadow: '2px 0 4px rgba(0,0,0,0.5)',
      }} />

      {/* ─ Volume (gauche) ─ */}
      {[['10%', 28], ['21%', 50]].map(([top, h], i) => (
        <div key={i} style={{
          position: 'absolute', left: -4, top,
          width: 4, height: h,
          borderRadius: '2.5px 0 0 2.5px',
          background: 'linear-gradient(to left, #28282a, #424244)',
          boxShadow: '-2px 0 4px rgba(0,0,0,0.5)',
        }} />
      ))}

      {/* ─ Mute switch (gauche, petit) ─ */}
      <div style={{
        position: 'absolute', left: -4, top: '8%',
        width: 4, height: 18,
        borderRadius: '2.5px 0 0 2.5px',
        background: 'linear-gradient(to left, #28282a, #424244)',
        boxShadow: '-2px 0 4px rgba(0,0,0,0.5)',
      }} />
    </div>

    {/* ── ARÊTE HAUT ────────────────────────────────────────────── */}
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0,
      height: T,
      transformOrigin: 'top center',
      transform: 'rotateX(-90deg)',
      background: 'linear-gradient(to bottom, #424244, #303032)',
      borderRadius: '30px 30px 0 0',
    }} />

    {/* ── ARÊTE BAS ─────────────────────────────────────────────── */}
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      height: T,
      transformOrigin: 'bottom center',
      transform: 'rotateX(90deg)',
      background: 'linear-gradient(to top, #424244, #303032)',
      borderRadius: '0 0 30px 30px',
    }} />

    {/* ── ARÊTE GAUCHE ──────────────────────────────────────────── */}
    <div style={{
      position: 'absolute', left: 0, top: 0, bottom: 0,
      width: T,
      transformOrigin: 'left center',
      transform: 'rotateY(90deg)',
      background: 'linear-gradient(to right, #424244, #2e2e30)',
      borderRadius: '30px 0 0 30px',
    }} />

    {/* ── ARÊTE DROITE ──────────────────────────────────────────── */}
    <div style={{
      position: 'absolute', right: 0, top: 0, bottom: 0,
      width: T,
      transformOrigin: 'right center',
      transform: 'rotateY(-90deg)',
      background: 'linear-gradient(to left, #424244, #2e2e30)',
      borderRadius: '0 30px 30px 0',
    }} />

    {/* ── DOS ───────────────────────────────────────────────────── */}
    <div style={{
      position: 'absolute', inset: 0,
      transform: `translateZ(-${T}px)`,
      borderRadius: 30,
      background: 'linear-gradient(145deg, #2c2c2e, #1a1a1c 55%, #222224)',
      backfaceVisibility: 'hidden',
    }}>
      {/* Logo pomme stylisé */}
      <div style={{
        position: 'absolute', top: '48%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 28, height: 32,
        opacity: 0.12,
        fontSize: 30, textAlign: 'center', lineHeight: '32px',
        color: '#ffffff',
      }}>
      </div>
    </div>

    {/* ── OMBRE PORTÉE ──────────────────────────────────────────── */}
    <div style={{
      position: 'absolute',
      bottom: -55, left: '6%', right: '6%',
      height: 80,
      background: 'radial-gradient(ellipse at 50% 0%, rgba(0,0,0,0.82) 0%, transparent 72%)',
      filter: 'blur(22px)',
      transform: `translateZ(-${T + 8}px)`,
      pointerEvents: 'none',
    }} />

    {/* ── AMBIENT GLOW BEIGE (de l'écran) ───────────────────────── */}
    <div style={{
      position: 'absolute',
      inset: '10% 5%',
      bottom: '-12%',
      background: 'radial-gradient(ellipse at 50% 50%, rgba(200,168,120,0.06) 0%, transparent 70%)',
      filter: 'blur(30px)',
      transform: `translateZ(-${T + 2}px)`,
      pointerEvents: 'none',
    }} />
  </motion.div>
)

// ─── ContainerScroll ─────────────────────────────────────────────────────────
export const ContainerScroll = ({ titleComponent, children, scrollContainer }) => {
  const containerRef = useRef(null)
  const scrollYProgress = useMotionValue(0)

  useEffect(() => {
    const el = scrollContainer?.current
    if (!el) return
    const update = () => {
      const progress = Math.min(1, Math.max(0, el.scrollTop / 600))
      scrollYProgress.set(progress)
    }
    el.addEventListener('scroll', update, { passive: true })
    update()
    return () => el.removeEventListener('scroll', update)
  }, [scrollContainer, scrollYProgress])

  const rotate    = useTransform(scrollYProgress, [0, 1], [22, 0])
  const scale     = useTransform(scrollYProgress, [0, 1], [1.04, 1])
  const translate = useTransform(scrollYProgress, [0, 1], [0, -100])

  return (
    <div
      ref={containerRef}
      style={{
        height: '90rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        padding: '0 60px',
      }}
    >
      <div style={{
        paddingTop: '60px',
        paddingBottom: '60px',
        width: '100%',
        position: 'relative',
        perspective: '1200px',
      }}>
        <Header translate={translate} titleComponent={titleComponent} />
        <Tablet3D rotate={rotate} scale={scale}>
          {children}
        </Tablet3D>
      </div>
    </div>
  )
}

const Header = ({ translate, titleComponent }) => (
  <motion.div style={{
    translateY: translate,
    maxWidth: '64rem',
    margin: '0 auto',
    textAlign: 'center',
    marginBottom: '48px',
  }}>
    {titleComponent}
  </motion.div>
)
