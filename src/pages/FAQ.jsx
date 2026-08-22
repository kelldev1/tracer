import React, { useState } from 'react'
import faqImage from '../assets/4f6d7f99-d343-495e-86c0-81df5fa4ceb6_3840w.webp'

const FAQS = [
  {
    id: 'faq-1',
    category: 'Fonctionnement',
    question: 'Qu\'est-ce que TRACER exactement ?',
    answer: 'TRACER est une plateforme OSINT (Open Source Intelligence) qui agrège automatiquement des données publiques à partir d\'une simple information — pseudo, email, adresse IP, domaine ou numéro de téléphone. En une seule requête, TRACER croise des dizaines de sources pour construire un profil complet de la cible.',
  },
  {
    id: 'faq-2',
    category: 'Sources',
    question: 'Quelles sources TRACER utilise-t-il ?',
    answer: 'TRACER interroge plus de 20 sources vérifiées : réseaux sociaux (Twitter/X, Instagram, TikTok, Reddit, GitHub…), bases de données publiques, registres WHOIS, géolocalisation IP, plateformes de gaming (Steam, Discord, FiveM), et bases de fuites de données. Tout reste dans le cadre de l\'open source — aucune donnée privée n\'est exploitée.',
  },
  {
    id: 'faq-3',
    category: 'Légalité',
    question: 'TRACER est-il légal à utiliser ?',
    answer: 'Oui. TRACER ne collecte que des données publiquement accessibles. Il est conçu pour un usage légal : vérification d\'identité, sécurité informatique, journalisme d\'investigation ou recherche personnelle. L\'utilisateur reste seul responsable de l\'usage qu\'il fait des résultats. Toute utilisation à des fins malveillantes est strictement interdite.',
  },
  {
    id: 'faq-4',
    category: 'Technique',
    question: 'Faut-il des compétences techniques pour utiliser TRACER ?',
    answer: 'Aucune. TRACER est pensé pour être accessible à tous : une barre de recherche suffit. Tu entres une information (pseudo, email, IP…), TRACER détecte automatiquement le type de donnée et lance les modules correspondants. Les résultats sont présentés de façon claire, sans jargon technique.',
  },
]

const S = {
  page:    { height: '100%', overflowY: 'auto', fontFamily: 'var(--font)' },
  section: { maxWidth: 1200, margin: '0 auto', padding: '80px 48px' },

  /* header */
  eyebrow:  { display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 20 },
  eyeNum:   { fontSize: 22, color: 'rgba(200,168,120,0.8)', fontVariantNumeric: 'tabular-nums' },
  eyeSep:   { fontSize: 16, color: 'rgba(200,168,120,0.3)' },
  eyeLabel: { fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(200,168,120,0.9)' },

  h2: {
    fontSize: 52, fontWeight: 300, lineHeight: 1.1,
    color: '#fff', letterSpacing: -1.5, margin: '0 0 16px',
    fontFamily: 'var(--font)',
  },
  subtitle: { fontSize: 15, color: 'rgba(161,161,170,0.9)', lineHeight: 1.6, maxWidth: 560, margin: 0 },

  /* CTAs */
  ctaRow:  { display: 'flex', alignItems: 'center', gap: 12 },
  ctaPrim: {
    display: 'inline-flex', alignItems: 'center',
    height: 44, padding: '0 20px', borderRadius: 999,
    background: '#fff', color: '#171717',
    fontSize: 15, fontWeight: 500, textDecoration: 'none',
    boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  ctaSec: {
    display: 'inline-flex', alignItems: 'center',
    height: 44, padding: '0 20px', borderRadius: 999,
    color: '#fff', fontSize: 15, fontWeight: 500,
    textDecoration: 'none',
    border: '1px solid rgba(255,255,255,0.15)',
  },

  /* divider */
  divider: { borderTop: '1px solid rgba(255,255,255,0.1)', margin: 0, padding: 0 },

  /* faq row */
  cat:    { fontSize: 11, textTransform: 'uppercase', fontWeight: 500, letterSpacing: 2, color: 'rgba(115,115,115,0.8)', marginBottom: 8 },
  qBtn:   {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    width: '100%', background: 'none', border: 'none', cursor: 'pointer',
    textAlign: 'left', padding: 0,
  },
  qText:  { fontSize: 28, fontWeight: 300, color: '#fff', letterSpacing: -0.5, lineHeight: 1.2, fontFamily: 'var(--font)' },
  arrow:  {
    flexShrink: 0, marginLeft: 16,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 36, height: 36, borderRadius: '50%',
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.05)',
    color: 'rgba(200,168,120,1)',
    transition: 'background .2s',
  },
  answer: {
    overflow: 'hidden',
    transition: 'max-height 0.35s ease, opacity 0.3s ease',
  },
  answerInner: {
    margin: '12px 0 4px',
    padding: '16px 20px',
    background: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.09)',
    backdropFilter: 'blur(8px)',
  },
  answerText: { fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7 },

  /* image card */
  imgCard: {
    position: 'relative', overflow: 'hidden', borderRadius: 24,
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.02)',
    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
    height: '100%',
  },
  imgGlow: {
    position: 'absolute', inset: 0, pointerEvents: 'none',
    background: 'radial-gradient(90% 80% at 100% 0%, rgba(16,185,129,0.18) 0%, transparent 60%), linear-gradient(120deg, rgba(16,185,129,0.08) 0%, transparent 40%)',
  },
  img: { width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.9) contrast(1.05)', display: 'block' },
  imgOverlay: { pointerEvents: 'none', position: 'absolute', inset: 0, borderRadius: 24, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1)' },
}

export default function FAQ() {
  const [openId, setOpenId] = useState(null)
  const [hov, setHov] = useState({})
  const toggle = (id) => setOpenId(openId === id ? null : id)

  return (
    <div style={S.page}>
      <div style={S.section}>

        {/* ── Header ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0 24px', alignItems: 'flex-end', marginBottom: 64 }}>
          <div>
            <div style={S.eyebrow}>
              <span style={S.eyeNum}>03</span>
              <span style={S.eyeSep}>/</span>
              <span style={S.eyeLabel}>FAQ</span>
            </div>
            <h2 style={S.h2}>Les questions que<br />tout le monde se pose.</h2>
            <p style={S.subtitle}>Tout ce que tu dois savoir sur TRACER, son fonctionnement, ses sources et son cadre légal.</p>
          </div>
          <div style={S.ctaRow}>
            <a
              href="#"
              style={{ ...S.ctaPrim, background: hov.prim ? 'rgba(230,230,230,1)' : '#fff' }}
              onMouseEnter={() => setHov(h => ({ ...h, prim: true }))}
              onMouseLeave={() => setHov(h => ({ ...h, prim: false }))}
            >Lancer une trace</a>
            <a
              href="#"
              style={{ ...S.ctaSec, background: hov.sec ? 'rgba(255,255,255,0.06)' : 'transparent' }}
              onMouseEnter={() => setHov(h => ({ ...h, sec: true }))}
              onMouseLeave={() => setHov(h => ({ ...h, sec: false }))}
            >En savoir plus</a>
          </div>
        </div>

        {/* ── FAQ + Image ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: 24, alignItems: 'stretch' }}>

          {/* FAQ list */}
          <div>
            {FAQS.map((faq, i) => {
              const isOpen = openId === faq.id
              return (
                <div key={faq.id} style={{ ...S.divider, paddingTop: i === 0 ? 0 : 0 }}>
                  <div style={{ padding: '24px 0' }}>
                    <div style={S.cat}>{faq.category}</div>
                    <button
                      style={S.qBtn}
                      onClick={() => toggle(faq.id)}
                      onMouseEnter={e => e.currentTarget.querySelector('.faq-arrow').style.background = 'rgba(255,255,255,0.1)'}
                      onMouseLeave={e => e.currentTarget.querySelector('.faq-arrow').style.background = 'rgba(255,255,255,0.05)'}
                    >
                      <span style={S.qText}>{faq.question}</span>
                      <span className="faq-arrow" style={{ ...S.arrow, transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M7 7h10v10" />
                          <path d="M7 17 17 7" />
                        </svg>
                      </span>
                    </button>
                    <div style={{ ...S.answer, maxHeight: isOpen ? '400px' : '0', opacity: isOpen ? 1 : 0 }}>
                      <div style={S.answerInner}>
                        <p style={S.answerText}>{faq.answer}</p>
                      </div>
                    </div>
                  </div>
                  <div style={{ height: 1, background: 'rgba(255,255,255,0.08)' }} />
                </div>
              )
            })}
          </div>

          {/* Image */}
          <div style={S.imgCard}>
            <div style={S.imgGlow} />
            <img
              src={faqImage}
              alt="FAQ preview"
              style={S.img}
            />
            <div style={S.imgOverlay} />
          </div>

        </div>
      </div>
    </div>
  )
}
