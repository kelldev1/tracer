import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'

const POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%<>[]{}█▓░×◆◇◈◉Ω∑∆'

function useScramble(text) {
  const elRef = useRef(null)
  const rafRef = useRef(null)

  const scramble = useCallback((duration = 750, delay = 0) => {
    cancelAnimationFrame(rafRef.current)
    const el = elRef.current
    if (!el) return
    const chars = text.split('')
    let t0 = null

    const run = (ts) => {
      if (!t0) t0 = ts + delay
      const elapsed = Math.max(0, ts - t0)
      const p = Math.min(elapsed / duration, 1)
      const locked = Math.floor(p * chars.length)
      el.innerHTML = chars.map((c, i) => {
        if (c === ' ' || c === '\n' || c === ',') return c === '\n' ? '<br/>' : c
        if (i < locked) return `<span style="color:inherit">${c}</span>`
        const r = POOL[Math.floor((ts * 0.11 + i * 19.7) % POOL.length)]
        return `<span style="color:rgba(200,168,120,0.75);font-size:0.88em;font-family:var(--mono)">${r}</span>`
      }).join('')
      if (p < 1 || elapsed < 0) rafRef.current = requestAnimationFrame(run)
      else el.textContent = text
    }
    rafRef.current = requestAnimationFrame(run)
  }, [text])

  useEffect(() => {
    if (elRef.current) elRef.current.textContent = text
    return () => cancelAnimationFrame(rafRef.current)
  }, [text])

  return [elRef, scramble]
}

function ScrambleOnEnter({ text, style, duration = 1100, delay = 0 }) {
  const [elRef, scramble] = useScramble(text)
  const wrapRef = useRef(null)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { scramble(duration, delay * 1000); obs.disconnect() }
    }, { threshold: 0.2 })
    if (wrapRef.current) obs.observe(wrapRef.current)
    return () => obs.disconnect()
  }, [scramble, duration, delay])

  return <span ref={wrapRef}><span ref={elRef} style={style} /></span>
}

const TITLE_LINES = [
  { text: 'Les critères',  color: 'rgba(255,255,255,0.92)' },
  { text: 'disponibles.',  color: 'rgba(200,168,120,0.95)' },
]

function SplitTitle3D() {
  const wrapRef  = useRef(null)
  const innerRef = useRef(null)
  const idleRef  = useRef(null)

  useEffect(() => {
    const letters = innerRef.current.querySelectorAll('.l3d')
    gsap.set(letters, { rotateX: -90, opacity: 0, transformOrigin: '50% 100% -8px' })

    const tl = gsap.timeline({ delay: 0.1 })
    tl.to(letters, { rotateX: 0, opacity: 1, duration: 0.85, stagger: { amount: 0.65, from: 'start' }, ease: 'back.out(1.6)' })
    tl.add(() => {
      idleRef.current = gsap.to(letters, { y: -4, duration: 2.2, stagger: { amount: 2, repeat: -1, yoyo: true, from: 'start' }, ease: 'sine.inOut' })
    }, '+=0.3')

    const onMove = (e) => {
      const r = wrapRef.current.getBoundingClientRect()
      const dx = (e.clientX - r.left - r.width  / 2) / (r.width  / 2)
      const dy = (e.clientY - r.top  - r.height / 2) / (r.height / 2)
      gsap.to(innerRef.current, { rotateY: dx * 9, rotateX: -dy * 5, duration: 0.6, ease: 'power2.out', overwrite: 'auto' })
    }
    const onLeave = () => gsap.to(innerRef.current, { rotateY: 0, rotateX: 0, duration: 1.2, ease: 'elastic.out(1, 0.6)', overwrite: 'auto' })

    const el = wrapRef.current
    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => { tl.kill(); idleRef.current?.kill(); el.removeEventListener('mousemove', onMove); el.removeEventListener('mouseleave', onLeave) }
  }, [])

  return (
    <div ref={wrapRef} style={{ perspective: '900px', cursor: 'default', marginBottom: 18 }}>
      <div ref={innerRef} style={{ transformStyle: 'preserve-3d' }}>
        {TITLE_LINES.map((line, li) => (
          <div key={li} style={{ display: 'block', fontSize: 'clamp(48px, 5.5vw, 72px)', fontWeight: 300, lineHeight: 1.06, fontFamily: 'var(--font)', letterSpacing: '-2.5px', transformStyle: 'preserve-3d' }}>
            {line.text.split('').map((char, ci) => (
              <span key={ci} className="l3d" style={{ display: 'inline-block', color: line.color, letterSpacing: char === ' ' ? '0.1em' : '-2.5px', transformStyle: 'preserve-3d', willChange: 'transform, opacity' }}>
                {char === ' ' ? ' ' : char}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

const CRITERIA = [
  {
    num: '01', tag: 'PSEUDO · USERNAME',
    title: 'Scanner de pseudonyme',
    accent: 'pseudonyme',
    desc: "Entre un pseudo et TRACER le scanne simultanément sur 20+ plateformes : Twitter/X, Instagram, GitHub, Steam, TikTok, Reddit, Twitch, Snapchat et plus encore. Chaque résultat indique si le compte existe, avec lien direct.",
    stat: '20+', unit: 'PLATEFORMES', flip: false,
  },
  {
    num: '02', tag: 'E-MAIL · ADRESSE',
    title: "Analyse d'adresse e-mail",
    accent: "d'adresse e-mail",
    desc: "À partir d'une adresse email, TRACER identifie les comptes associés, vérifie la validité du domaine, détecte les disposable domains et croise avec les bases de données publiques de fuites connues.",
    stat: '@', unit: 'E-MAIL', flip: true,
  },
  {
    num: '03', tag: 'IP · GÉOLOCALISATION',
    title: 'Reconnaissance IP',
    accent: 'IP',
    desc: "Une adresse IPv4 ou IPv6 suffit. TRACER retourne la géolocalisation approximative, le FAI (ISP), l'ASN, le fuseau horaire, le pays et détecte si l'IP appartient à un VPN, proxy ou nœud Tor connu.",
    stat: 'v4/v6', unit: 'IP', flip: false,
  },
  {
    num: '04', tag: 'DOMAINE · DNS · WHOIS',
    title: 'Recon de domaine',
    accent: 'domaine',
    desc: "Analyse complète d'un nom de domaine : enregistrements DNS (A, MX, NS, TXT), données WHOIS avec date de création et expiration, détection du registrar et identification des serveurs hébergeurs.",
    stat: 'DNS', unit: 'WHOIS', flip: true,
  },
  {
    num: '05', tag: 'TÉLÉPHONE · INDICATIF',
    title: 'Lookup téléphonique',
    accent: 'téléphonique',
    desc: "Renseigne un numéro de téléphone (format international). TRACER retourne le pays d'origine, l'opérateur réseau, le type de ligne (mobile, fixe, VoIP) et si le numéro figure dans des annuaires publics.",
    stat: '+XX', unit: 'FORMAT INTL', flip: false,
  },
  {
    num: '06', tag: 'RÉSEAUX SOCIAUX',
    title: 'Analyse sociale',
    accent: 'sociale',
    desc: "Exploration des empreintes numériques sur les réseaux sociaux. Croise pseudo, email ou nom pour identifier les profils publics, leur activité et les liens entre comptes sur différentes plateformes.",
    stat: '◈', unit: 'SOCIAL', flip: true,
  },
  {
    num: '07', tag: 'AUTO-DÉTECTION',
    title: 'Agrégateur intelligent',
    accent: 'intelligent',
    desc: "Le mode phare de TRACER. Colle n'importe quoi — email, IP, domaine, pseudo — et l'agrégateur détecte automatiquement le type de données puis dispatch vers le bon module. Zéro configuration.",
    stat: 'AUTO', unit: 'DISPATCH', flip: true,
  },
]

function CriteriaRow({ f, index }) {
  const [hov, setHov] = useState(false)
  const [vis, setVis] = useState(false)
  const rowRef  = useRef(null)
  const scanRef = useRef(null)
  const [titleRef, scrambleTitle] = useScramble(f.title)
  const [statRef,  scrambleStat]  = useScramble(f.stat)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setTimeout(() => { setVis(true); scrambleTitle(900, 0); scrambleStat(600, 150) }, index * 100)
        obs.disconnect()
      }
    }, { threshold: 0.15 })
    if (rowRef.current) obs.observe(rowRef.current)
    return () => obs.disconnect()
  }, [scrambleTitle, scrambleStat, index])

  const onEnter = () => { setHov(true); scrambleTitle(700); scrambleStat(450) }

  return (
    <div ref={rowRef} onMouseEnter={onEnter} onMouseLeave={() => setHov(false)} style={{
      position: 'relative', padding: '50px 0',
      opacity: vis ? 1 : 0, transform: vis ? 'none' : 'translateY(32px)',
      transition: `opacity .8s ${index * 0.1}s cubic-bezier(.22,1,.36,1), transform .8s ${index * 0.1}s cubic-bezier(.22,1,.36,1)`,
      cursor: 'default',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: hov
          ? 'linear-gradient(90deg, transparent 0%, rgba(200,168,120,0.5) 30%, rgba(200,168,120,0.5) 70%, transparent 100%)'
          : 'rgba(255,255,255,0.07)',
        transition: 'background .5s',
      }} />
      <div style={{
        position: 'absolute', [f.flip ? 'right' : 'left']: -24,
        top: '50%', transform: 'translateY(-50%)',
        fontSize: 280, fontWeight: 900, lineHeight: 1,
        fontFamily: 'var(--mono)', letterSpacing: -12,
        color: hov ? 'rgba(200,168,120,0.04)' : 'rgba(255,255,255,0.018)',
        pointerEvents: 'none', userSelect: 'none', transition: 'color .6s',
      }}>{f.num}</div>

      <div style={{ display: 'flex', alignItems: 'flex-start', flexDirection: f.flip ? 'row-reverse' : 'row', position: 'relative' }}>
        {/* Num */}
        <div style={{ width: 60, flexShrink: 0, paddingTop: 4 }}>
          <span style={{ fontSize: 10, fontFamily: 'var(--mono)', letterSpacing: 3, color: hov ? 'rgba(200,168,120,0.6)' : 'rgba(255,255,255,0.15)', transition: 'color .4s' }}>{f.num}</span>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: f.flip ? '0 0 0 56px' : '0 56px 0 0' }}>
          <div style={{ fontSize: 9.5, fontFamily: 'var(--mono)', letterSpacing: 3.5, color: 'rgba(255,255,255,0.18)', marginBottom: 18, textAlign: f.flip ? 'right' : 'left' }}>{f.tag}</div>
          <div style={{ position: 'relative', marginBottom: 20 }}>
            <div ref={scanRef} style={{
              position: 'absolute', top: 0, bottom: 0, left: 0, width: '2px',
              background: 'linear-gradient(to bottom, transparent, rgba(200,168,120,0.9), transparent)',
              boxShadow: '0 0 12px rgba(200,168,120,0.6)',
              opacity: hov ? 1 : 0,
              transform: hov ? 'translateX(calc(100vw))' : 'translateX(0)',
              transition: hov ? 'transform 0.75s cubic-bezier(.4,0,.2,1), opacity 0s' : 'opacity 0.3s',
              pointerEvents: 'none', zIndex: 2,
            }} />
            <h3 style={{ fontSize: 'clamp(38px, 4.2vw, 58px)', fontWeight: 300, lineHeight: 1.07, letterSpacing: -1.8, margin: 0, fontFamily: 'var(--font)', textAlign: f.flip ? 'right' : 'left' }}>
              <span ref={titleRef} style={{ color: 'rgba(255,255,255,0.92)' }} />
            </h3>
          </div>
          <p style={{
            fontSize: 13.5, color: 'rgba(255,255,255,0.3)', lineHeight: 1.7, margin: 0, maxWidth: 430,
            marginLeft: f.flip ? 'auto' : 0, textAlign: f.flip ? 'right' : 'left',
            opacity: vis ? 1 : 0, transform: vis ? 'none' : 'translateY(8px)',
            transition: `opacity .6s ${index * 0.1 + 0.3}s, transform .6s ${index * 0.1 + 0.3}s`,
          }}>{f.desc}</p>
        </div>

        {/* Stat */}
        <div style={{ width: 130, flexShrink: 0, textAlign: f.flip ? 'left' : 'right', paddingTop: 6 }}>
          <div style={{ fontSize: 'clamp(32px, 3.5vw, 48px)', fontWeight: 800, fontFamily: 'var(--mono)', letterSpacing: -1.5, lineHeight: 1, color: hov ? 'rgba(200,168,120,1)' : 'rgba(200,168,120,0.7)', transition: 'color .4s' }}>
            <span ref={statRef} />
          </div>
          <div style={{ fontSize: 8.5, fontFamily: 'var(--mono)', letterSpacing: 3, color: 'rgba(255,255,255,0.16)', marginTop: 10 }}>{f.unit}</div>
        </div>
      </div>
    </div>
  )
}

function AmbientNoise() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width = canvas.offsetWidth
    const H = canvas.height = canvas.offsetHeight
    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      char: POOL[Math.floor(Math.random() * POOL.length)],
      alpha: Math.random() * 0.06 + 0.01, speed: Math.random() * 0.15 + 0.05, timer: Math.random() * 120,
    }))
    let raf
    const draw = () => {
      ctx.clearRect(0, 0, W, H); ctx.font = '11px monospace'
      particles.forEach(p => {
        p.timer++
        if (p.timer % 90 === 0) p.char = POOL[Math.floor(Math.random() * POOL.length)]
        p.y -= p.speed
        if (p.y < -20) { p.y = H + 10; p.x = Math.random() * W }
        ctx.fillStyle = `rgba(200,168,120,${p.alpha * (Math.sin(p.timer * 0.05) * 0.5 + 0.5)})`
        ctx.fillText(p.char, p.x, p.y)
      })
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [])
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }} />
}

export default function Criteria() {
  const navigate = useNavigate()
  const [vis, setVis] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVis(true), 400); return () => clearTimeout(t) }, [])

  return (
    <div style={{ height: '100%', overflowY: 'auto', fontFamily: 'var(--font)', position: 'relative' }}>
      <AmbientNoise />
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '68px 52px 96px', position: 'relative', zIndex: 1 }}>

        <div style={{ marginBottom: 64 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 30, opacity: vis ? 1 : 0, transition: 'opacity .5s' }}>
            <span style={{ fontSize: 20, color: 'rgba(200,168,120,0.65)' }}>08</span>
            <span style={{ fontSize: 14, color: 'rgba(200,168,120,0.2)' }}>/</span>
            <ScrambleOnEnter text="CRITÈRES DE RECHERCHE" duration={800} delay={0.1} style={{ fontSize: 10, letterSpacing: 4, color: 'rgba(200,168,120,0.75)', fontFamily: 'var(--mono)' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 40 }}>
            <div>
              <SplitTitle3D />
              <p style={{ fontSize: 14.5, color: 'rgba(255,255,255,0.28)', lineHeight: 1.6, margin: 0, opacity: vis ? 1 : 0, transform: vis ? 'none' : 'translateY(10px)', transition: 'opacity .7s .4s, transform .7s .4s' }}>
                8 modules OSINT distincts. Chaque critère cible un vecteur d'investigation précis.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, flexShrink: 0, opacity: vis ? 1 : 0, transition: 'opacity .6s .5s' }}>
              <button onClick={() => navigate('/aggregator')} style={{ padding: '11px 24px', borderRadius: 999, background: 'rgba(200,168,120,0.9)', color: '#0a090c', fontSize: 12.5, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'var(--font)', letterSpacing: 0.4, boxShadow: '0 4px 20px rgba(200,168,120,0.28)', transition: 'all .2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#c8a878'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(200,168,120,0.5)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(200,168,120,0.9)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(200,168,120,0.28)' }}>
                Lancer une trace
              </button>
              <button onClick={() => navigate('/faq')} style={{ padding: '11px 24px', borderRadius: 999, background: 'transparent', color: 'rgba(255,255,255,0.38)', fontSize: 12.5, border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontFamily: 'var(--font)', transition: 'all .2s' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.38)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}>
                FAQ →
              </button>
            </div>
          </div>
        </div>

        {CRITERIA.map((f, i) => <CriteriaRow key={f.num} f={f} index={i} />)}

        <div style={{ height: 1, background: 'rgba(255,255,255,0.07)' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '44px 0 0' }}>
          {[
            { v: '8',     l: 'Modules actifs' },
            { v: '20+',   l: 'Plateformes scannées' },
            { v: 'OSINT', l: 'Sources ouvertes' },
            { v: 'AUTO',  l: 'Détection intelligente' },
          ].map((s, i, arr) => (
            <React.Fragment key={s.v}>
              <div style={{ textAlign: 'center' }}>
                <ScrambleOnEnter text={s.v} duration={600} delay={i * 0.1} style={{ fontSize: 30, fontWeight: 800, fontFamily: 'var(--mono)', color: 'rgba(200,168,120,0.72)', letterSpacing: -1, lineHeight: 1, display: 'block' }} />
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 8, letterSpacing: 0.3 }}>{s.l}</div>
              </div>
              {i < arr.length - 1 && <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.07)' }} />}
            </React.Fragment>
          ))}
        </div>

      </div>
    </div>
  )
}
