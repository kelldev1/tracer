import React, { useState, useEffect, useCallback } from 'react'

const BREACHES = [
  { name: 'CAF',              domain: 'caf.fr',               date: '2023-11-14', records: '563 428',  data: ['Email', 'Mot de passe', 'N° Allocataire', 'Adresse postale'] },
  { name: 'Santé.gouv',       domain: 'sante.gouv.fr',        date: '2023-06-02', records: '1 200 000', data: ['Email', 'Numéro de sécu', 'Date de naissance'] },
  { name: 'France Travail',   domain: 'francetravail.fr',     date: '2024-02-13', records: '43 000 000', data: ['Email', 'NIR', 'Identifiant PE', 'Téléphone'] },
  { name: 'ANTS',             domain: 'ants.gouv.fr',         date: '2022-09-07', records: '218 000',  data: ['Email', 'Numéro de dossier', 'Pièce d\'identité'] },
  { name: 'Mairie Paris',     domain: 'paris.fr',             date: '2021-04-22', records: '89 000',   data: ['Email', 'Adresse postale', 'Téléphone'] },
  { name: 'Portail Emploi',   domain: 'emploi.gouv.fr',       date: '2022-12-01', records: '310 000',  data: ['Email', 'CV', 'Adresse postale'] },
  { name: 'UNSS',             domain: 'unss.org',             date: '2021-07-18', records: '47 200',   data: ['Email', 'Mot de passe (MD5)', 'Date de naissance'] },
  { name: 'SFR',              domain: 'sfr.fr',               date: '2023-09-25', records: '3 600 000', data: ['Email', 'Téléphone', 'Adresse postale', 'IBAN'] },
  { name: 'Bouygues',         domain: 'bouyguestelecom.fr',   date: '2020-02-03', records: '2 400 000', data: ['Email', 'Mot de passe', 'Téléphone', 'Adresse'] },
  { name: 'Free.fr',          domain: 'free.fr',              date: '2024-10-17', records: '19 200 000', data: ['Email', 'Mot de passe (bcrypt)', 'IBAN', 'Adresse'] },
  { name: 'La Poste Mobile',  domain: 'lapostemobile.fr',     date: '2022-05-11', records: '176 000',  data: ['Email', 'Téléphone', 'Adresse postale'] },
  { name: 'Zenmobile',        domain: 'zen.fr',               date: '2021-11-30', records: '52 000',   data: ['Email', 'Mot de passe', 'Téléphone'] },
  { name: 'Carrefour',        domain: 'carrefour.fr',         date: '2023-03-15', records: '8 700 000', data: ['Email', 'Mot de passe', 'Date de naissance', 'Adresse'] },
  { name: 'Boulanger',        domain: 'boulanger.com',        date: '2020-11-22', records: '1 500 000', data: ['Email', 'Mot de passe (SHA-1)', 'Adresse postale'] },
  { name: 'La Redoute',       domain: 'laredoute.fr',         date: '2019-08-09', records: '4 100 000', data: ['Email', 'Mot de passe', 'Historique commandes'] },
  { name: 'Leboncoin',        domain: 'leboncoin.fr',         date: '2022-01-28', records: '5 200 000', data: ['Email', 'Téléphone', 'Adresse IP'] },
  { name: 'LDLC',             domain: 'ldlc.com',             date: '2021-03-04', records: '1 500 000', data: ['Email', 'Mot de passe (MD5)', 'Téléphone', 'Adresse'] },
  { name: 'Sport 2000',       domain: 'sport2000.fr',         date: '2020-06-17', records: '630 000',  data: ['Email', 'Mot de passe', 'Date de naissance'] },
  { name: 'Norauto',          domain: 'norauto.fr',           date: '2022-08-30', records: '290 000',  data: ['Email', 'Téléphone', 'Historique véhicules'] },
  { name: 'Under Armour',     domain: 'underarmour.com',      date: '2018-02-25', records: '150 000 000', data: ['Email', 'Mot de passe (bcrypt/SHA-1)', 'Pseudo'] },
  { name: 'Scuf Gaming',      domain: 'scufgaming.com',       date: '2020-04-11', records: '198 000',  data: ['Email', 'Mot de passe (MD5)', 'Adresse postale'] },
  { name: 'Pandabuy',         domain: 'pandabuy.com',         date: '2024-03-02', records: '3 000 000', data: ['Email', 'Mot de passe', 'Adresse', 'Commandes'] },
  { name: 'Chronopost',       domain: 'chronopost.fr',        date: '2021-10-06', records: '820 000',  data: ['Email', 'Téléphone', 'Adresse de livraison'] },
  { name: 'Colis Privé',      domain: 'colisprive.com',       date: '2022-07-14', records: '1 100 000', data: ['Email', 'Téléphone', 'Adresse postale'] },
  { name: 'CAPIFRANCE',       domain: 'capifrance.fr',        date: '2020-09-19', records: '125 000',  data: ['Email', 'Mot de passe', 'Téléphone'] },
  { name: 'MAEVA',            domain: 'maeva.com',            date: '2019-12-03', records: '340 000',  data: ['Email', 'Mot de passe (SHA-256)', 'Adresse'] },
  { name: 'AUTOSUR',          domain: 'autosur.fr',           date: '2023-01-20', records: '210 000',  data: ['Email', 'Plaque d\'immatriculation', 'Téléphone'] },
  { name: 'Fitness Park',     domain: 'fitnesspark.fr',       date: '2022-04-08', records: '480 000',  data: ['Email', 'Mot de passe', 'Date de naissance', 'IBAN'] },
  { name: 'Mut. Motards',     domain: 'mutuelledesmotards.fr', date: '2021-06-25', records: '95 000',  data: ['Email', 'Téléphone', 'N° contrat', 'Plaque'] },
  { name: 'Réd. Impôt',       domain: 'impots.gouv.fr',       date: '2023-07-11', records: '730 000',  data: ['Email', 'NIF', 'Adresse postale', 'Revenus'] },
  { name: 'Instagram',        domain: 'instagram.com',        date: '2019-05-20', records: '49 000 000', data: ['Email', 'Téléphone', 'Biographie', 'Localisation'] },
  { name: 'Badoo',            domain: 'badoo.com',            date: '2020-08-13', records: '127 000 000', data: ['Email', 'Mot de passe (bcrypt)', 'Date de naissance', 'Genre'] },
  { name: 'Meetic',           domain: 'meetic.fr',            date: '2021-02-17', records: '1 800 000', data: ['Email', 'Mot de passe', 'Date de naissance', 'Préférences'] },
  { name: 'DOXBIN',           domain: 'doxbin.com',           date: '2022-01-05', records: '370 000',  data: ['Email', 'Mot de passe', 'Adresse IP', 'Pseudo'] },
  { name: 'Discord',          domain: 'discord.com',          date: '2023-05-12', records: '760 000',  data: ['Email', 'Mot de passe (bcrypt)', 'Pseudo', 'Token'] },
  { name: 'Trello',           domain: 'trello.com',           date: '2020-11-09', records: '15 100 000', data: ['Email', 'Prénom', 'Nom', 'Pseudo'] },
  { name: 'Yahoo',            domain: 'yahoo.com',            date: '2016-09-22', records: '3 000 000 000', data: ['Email', 'Mot de passe (MD5)', 'Date de naissance', 'Téléphone'] },
  { name: 'Canva',            domain: 'canva.com',            date: '2019-05-24', records: '137 000 000', data: ['Email', 'Mot de passe (bcrypt)', 'Prénom', 'Nom'] },
  { name: 'Minecraft',        domain: 'minecraft.net',        date: '2022-06-07', records: '2 500 000', data: ['Email', 'Mot de passe (SHA-1)', 'Pseudo', 'UUID'] },
  { name: 'Lunar Client',     domain: 'lunarclient.com',      date: '2023-03-18', records: '890 000',  data: ['Email', 'Mot de passe', 'Pseudo', 'UUID Minecraft'] },
  { name: 'ShadowTech',       domain: 'shadow.tech',          date: '2023-10-08', records: '530 000',  data: ['Email', 'Prénom', 'Nom', 'Téléphone', 'Adresse'] },
  { name: 'Wakanim',          domain: 'wakanim.tv',           date: '2020-03-29', records: '415 000',  data: ['Email', 'Mot de passe (SHA-256)', 'Pseudo'] },
  { name: 'Xsplit',           domain: 'xsplit.com',           date: '2019-07-15', records: '2 900 000', data: ['Email', 'Mot de passe (SHA-512)', 'Pseudo', 'IP'] },
]

const TARGET = 'rdbz.dosantos@gmail.com'

function LogoImg({ domain, name, size = 56 }) {
  const [src, setSrc]       = useState(`https://logo.clearbit.com/${domain}`)
  const [failed, setFailed] = useState(false)

  const handleError = () => {
    if (src.includes('clearbit')) {
      setSrc(`https://www.google.com/s2/favicons?domain=${domain}&sz=128`)
    } else {
      setFailed(true)
    }
  }

  if (failed) {
    return (
      <div style={{
        width: size, height: size,
        borderRadius: size > 40 ? 12 : 8,
        background: 'rgba(200,168,120,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.35, fontWeight: 700,
        color: 'rgba(200,168,120,0.5)',
        fontFamily: 'monospace',
        flexShrink: 0,
      }}>
        {name[0]}
      </div>
    )
  }

  return (
    <img
      src={src}
      onError={handleError}
      alt={name}
      style={{
        width: size, height: size,
        borderRadius: size > 40 ? 12 : 8,
        objectFit: 'contain',
        background: 'rgba(255,255,255,0.92)',
        padding: size > 40 ? 6 : 4,
        flexShrink: 0,
      }}
    />
  )
}

function BreachModal({ breach, onClose }) {
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 100,
        animation: 'fadeIn 0.15s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 340,
          position: 'relative',
          padding: '16px',
          borderRadius: 12,
          overflow: 'hidden',
          background: '#000',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 2px 12px rgba(255,255,255,0.03)',
          animation: 'slideUp 0.22s cubic-bezier(.34,1.56,.64,1)',
          fontFamily: "'Space Grotesk', sans-serif",
          transition: 'box-shadow 0.3s',
        }}
      >
        {/* Dot pattern — toujours visible (persistent hover) */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '4px 4px',
        }} />

        {/* Gradient border diagonal */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 12, pointerEvents: 'none',
          background: 'linear-gradient(135deg, transparent, rgba(255,255,255,0.05) 50%, transparent)',
        }} />

        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Row 1 : icône + badge */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
            }}>
              <LogoImg domain={breach.domain} name={breach.name} size={26} />
            </div>
            <span style={{
              fontSize: 11, fontWeight: 500,
              padding: '3px 10px', borderRadius: 8,
              background: 'rgba(255,255,255,0.1)',
              color: 'rgba(209,213,219,1)',
              backdropFilter: 'blur(4px)',
            }}>
              Compromis
            </span>
          </div>

          {/* Row 2 : titre + description */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <h3 style={{
              margin: 0, fontSize: 15, fontWeight: 500,
              color: 'rgba(243,244,246,1)', letterSpacing: -0.2,
            }}>
              {breach.name}
              <span style={{
                marginLeft: 8, fontSize: 12, fontWeight: 400,
                color: 'rgba(156,163,175,1)',
              }}>
                {breach.domain}
              </span>
            </h3>
            <p style={{
              margin: 0, fontSize: 13,
              color: 'rgba(209,213,219,1)',
              lineHeight: 1.5,
            }}>
              {breach.records} comptes exposés lors d'une fuite détectée le {breach.date}
            </p>
          </div>

          {/* Row 3 : tags + CTA */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              {breach.data.slice(0, 3).map((d, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: 11, padding: '4px 8px', borderRadius: 6,
                    background: 'rgba(255,255,255,0.1)',
                    color: 'rgba(156,163,175,1)',
                    backdropFilter: 'blur(4px)',
                    cursor: 'default',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                >
                  #{d}
                </span>
              ))}
            </div>
            <span
              onClick={onClose}
              style={{
                fontSize: 11, color: 'rgba(156,163,175,1)',
                cursor: 'pointer', userSelect: 'none',
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(243,244,246,1)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(156,163,175,1)'}
            >
              Fermer →
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TabletScreen() {
  const [visible, setVisible]   = useState(0)
  const [scanLine, setScanLine] = useState(0)
  const [selected, setSelected] = useState(null)
  const [pressedKey, setPressedKey] = useState(null)

  useEffect(() => {
    const t = setInterval(() => {
      setVisible(v => {
        if (v >= BREACHES.length) { clearInterval(t); return v }
        return v + 1
      })
    }, 60)
    const s = setInterval(() => {
      setScanLine(l => (l + 1) % 100)
    }, 30)
    return () => { clearInterval(t); clearInterval(s) }
  }, [])

  const handleClose = useCallback(() => setSelected(null), [])

  const handleCardClick = useCallback((b) => {
    if (pressedKey) return
    setPressedKey(b.domain)
    setTimeout(() => {
      setSelected(b)
      setPressedKey(null)
    }, 200)
  }, [pressedKey])

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#030306',
      overflow: 'hidden',
      fontFamily: "'JetBrains Mono', monospace",
      color: 'rgba(255,245,215,0.88)',
      position: 'relative',
    }}>

      {/* Ligne de scan */}
      {visible < BREACHES.length && (
        <div style={{
          position: 'absolute', left: 0, right: 0,
          top: `${scanLine}%`, height: 1,
          background: 'linear-gradient(to right, transparent, rgba(200,168,120,0.15), rgba(200,168,120,0.3), rgba(200,168,120,0.15), transparent)',
          pointerEvents: 'none', zIndex: 10,
          transition: 'top 0.03s linear',
        }} />
      )}

      {/* Header */}
      <div style={{
        padding: '10px 16px 8px',
        borderBottom: '1px solid rgba(200,168,120,0.1)',
        flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 5, height: 5, borderRadius: '50%',
            background: visible < BREACHES.length ? '#e67e22' : '#c0392b',
            boxShadow: `0 0 6px ${visible < BREACHES.length ? '#e67e22' : '#c0392b'}`,
            animation: visible < BREACHES.length ? 'pulse 1s ease infinite' : 'none',
          }} />
          <span style={{ fontSize: 8, letterSpacing: 3, color: 'rgba(200,168,120,0.45)' }}>BREACH SCANNER</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 8, color: 'rgba(200,168,120,0.35)', letterSpacing: 1 }}>
            {visible} / {BREACHES.length} scannées
          </span>
          <div style={{
            padding: '2px 10px', borderRadius: 12,
            background: 'rgba(192,57,43,0.12)',
            border: '1px solid rgba(192,57,43,0.3)',
            fontSize: 8, letterSpacing: 1.5, color: '#e74c3c',
          }}>
            {visible} FUITES
          </div>
        </div>
      </div>


      {/* Grid */}
      <div style={{
        flex: 1, padding: '10px 12px', overflowY: 'auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))',
        gap: 7, alignContent: 'start',
      }}>
        {BREACHES.slice(0, visible).map((b) => {
          const isPressed = pressedKey === b.domain
          return (
          <div
            key={b.domain}
            onClick={() => handleCardClick(b)}
            style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 5,
              padding: '8px 6px', borderRadius: 8,
              background: isPressed ? 'rgba(200,168,120,0.1)' : 'transparent',
              border: isPressed
                ? '1px solid rgba(200,168,120,0.4)'
                : '1px solid rgba(200,168,120,0.08)',
              animation: 'fadeIn 0.2s ease',
              cursor: 'pointer',
              transform: isPressed ? 'scale(1.18)' : 'scale(1)',
              boxShadow: isPressed ? '0 0 18px rgba(200,168,120,0.18)' : 'none',
              transition: 'background 0.15s, border-color 0.15s, transform 0.18s cubic-bezier(.34,1.56,.64,1), box-shadow 0.15s',
              zIndex: isPressed ? 2 : 1,
              position: 'relative',
            }}
            onMouseEnter={e => {
              if (isPressed) return
              e.currentTarget.style.background = 'rgba(200,168,120,0.06)'
              e.currentTarget.style.borderColor = 'rgba(200,168,120,0.22)'
              e.currentTarget.style.transform = 'scale(1.04)'
            }}
            onMouseLeave={e => {
              if (isPressed) return
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.borderColor = 'rgba(200,168,120,0.08)'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            <LogoImg domain={b.domain} name={b.name} size={56} />
            <span style={{
              fontSize: 7.5, color: 'rgba(255,245,215,0.6)',
              textAlign: 'center', lineHeight: 1.2,
              maxWidth: '100%', overflow: 'hidden',
              textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              letterSpacing: 0.2,
            }}>{b.name}</span>
          </div>
          )
        })}
      </div>

      {/* Footer */}
      <div style={{
        padding: '5px 16px',
        borderTop: '1px solid rgba(200,168,120,0.07)',
        flexShrink: 0,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ fontSize: 7.5, color: 'rgba(192,57,43,0.5)', letterSpacing: 0.8 }}>
          {BREACHES.length} bases de données compromises détectées
        </span>
        <span style={{ fontSize: 7.5, color: 'rgba(200,168,120,0.25)', letterSpacing: 1 }}>
          TRACER v2.1 ▪ BREACH ENGINE
        </span>
      </div>

      {/* Modal */}
      {selected && <BreachModal breach={selected} onClose={handleClose} />}
    </div>
  )
}
