# TRACER — OSINT Platform

Site web OSINT (Open Source Intelligence) — React + Python FastAPI.

---

## Stack

| Couche | Techno |
|---|---|
| UI | React 18 · Vite 5 |
| Animations | Three.js · Framer Motion · postprocessing |
| Backend | Python 3 · FastAPI · Uvicorn (port 8000) |
| Routing | React Router v6 |

---

## Lancer le site

### 1. Installer les dépendances JS
```bash
cd H:\tracer
npm install
```

### 2. Installer les dépendances Python
```bash
pip install -r backend/requirements.txt
```

### 3. Démarrer le backend
```bash
python backend/main.py
```

### 4. Démarrer le site (Vite)
```bash
npm run dev   # http://localhost:5173
```

---

## Structure du projet

```
H:\tracer\
├── index.html
├── vite.config.js
│
├── src/
│   ├── App.jsx              # Layout principal — Hyperspeed bg + routes
│   ├── main.jsx
│   ├── styles/
│   │   └── global.css       # Variables CSS (palette beige/warm), animations
│   │
│   ├── components/
│   │   ├── Hyperspeed.jsx   # Animation WebGL highway (Three.js + postprocessing)
│   │   ├── Hyperspeed.css
│   │   ├── ContainerScroll.jsx  # Tablette 3D CSS preserve-3d + scroll Framer Motion
│   │   ├── TabletScreen.jsx     # Contenu écran tablette — breach scanner animé
│   │   ├── SearchBar.jsx
│   │   ├── ResultCard.jsx   # Cartes résultat collapsibles
│   │   ├── Loader.jsx
│   │   ├── Sidebar.jsx      # (désactivée pour l'instant)
│   │   └── DigitalLoom.jsx  # Animation canvas threads (non utilisée en ce moment)
│   │
│   └── pages/
│       ├── Aggregator.jsx   # Page principale — auto-détecte le type de cible
│       ├── UsernameSearch.jsx
│       ├── EmailSearch.jsx
│       ├── PhoneSearch.jsx
│       ├── PersonSearch.jsx
│       ├── SocialMedia.jsx
│       ├── DomainRecon.jsx
│       └── IPRecon.jsx
│
└── backend/
    ├── main.py              # FastAPI — 8 routes POST
    ├── requirements.txt
    ├── modules/
    │   ├── aggregator.py    # Auto-détecte email/ip/domain/username et appelle les bons modules
    │   ├── username.py      # Scan 20+ plateformes
    │   ├── email_lookup.py  # HIBP + analyse
    │   ├── phone.py         # phonenumbers lib
    │   ├── domain.py        # WHOIS + DNS + sous-domaines
    │   ├── ip_recon.py      # Géoloc + ASN
    │   ├── social.py        # GitHub · Reddit
    │   └── person.py        # Identité réelle
    └── utils/
        ├── helpers.py
        └── cache.py
```

---

## Routes API (port 8000)

| Méthode | Route | Input | Description |
|---|---|---|---|
| GET | `/` | — | Health check |
| POST | `/aggregate` | `{ query }` | Auto-détecte et agrège tout |
| POST | `/username` | `{ query }` | Scan plateformes |
| POST | `/email` | `{ query }` | Lookup email + leaks |
| POST | `/phone` | `{ query }` | Infos numéro |
| POST | `/domain` | `{ query }` | WHOIS · DNS · subs |
| POST | `/ip` | `{ query }` | Géoloc · ASN |
| POST | `/social` | `{ query }` | GitHub · Reddit |
| POST | `/person` | `{ query }` | Identité |
| POST | `/darkweb` | `{ query }` | Recherche Ahmia (.onion) |

---

## Fonctionnement de l'Aggregator

La page principale (`/aggregator`) auto-détecte le type de cible :

- `user@mail.com` → **email** : lookup email + scan username (partie avant @)
- `192.168.x.x` → **ip** : géoloc + ASN
- `domaine.fr` → **domain** : WHOIS + DNS + IP en parallèle
- `pseudo` → **username** : scan 20+ plateformes

---

## UI / Thème

- **Fond** : Hyperspeed (animation WebGL autoroute) — `xyDistortion`, voitures rouges à gauche, beige à droite
- **Overlay** : `rgba(8,8,8,0.45)` pour le contraste glassmorphisme
- **Palette** : beige chaud (`#c8a878`, `#b8956a`) sur fond très sombre
- **Police** : Space Grotesk (UI) + JetBrains Mono (données/mono)
- **Hero** : Tablette iPad 3D CSS `preserve-3d` — bezel aluminium, arêtes, reflet verre — scroll `rotateX 22°→0°` via Framer Motion

---

## Variables d'environnement

Toutes les clés sont dans `H:\tracer\.env` (déjà chargé automatiquement par `main.py` via `python-dotenv`). Sans clé, la source correspondante est simplement ignorée — le reste continue de fonctionner.

```env
SHODAN_API_KEY=          # ip_recon.py — bannières/ports/vulns
HIBP_API_KEY=             # email_lookup.py — fuites de données (payant depuis 2024)
NUMVERIFY_API_KEY=        # phone.py — validation apilayer
ABUSEIPDB_API_KEY=        # ip_recon.py — score de réputation abus
VIRUSTOTAL_API_KEY=       # ip_recon.py + domain.py — détections malveillantes
SECURITYTRAILS_API_KEY=   # domain.py — sous-domaines additionnels
```

Sources actives sans aucune clé : Sherlock-style username scan (40+ plateformes), WHOIS, DNS, SSL, crt.sh, Wayback Machine, ipapi.co, ip-api.com, HackerTarget (ports), GitHub/Reddit social, Gravatar, Ahmia (dark web).

---

## Build production

```bash
npm run build      # Build Vite → dist/
npm run preview    # Prévisualiser le build en local
```

Le dossier `dist/` peut ensuite être déployé sur n'importe quel hébergeur statique (Vercel, Netlify...). Le backend FastAPI doit être déployé séparément et l'URL d'API mise à jour dans le frontend (actuellement `http://localhost:8000`).
