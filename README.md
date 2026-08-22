# TRACER — OSINT Platform

**Plateforme de reconnaissance OSINT** qui agrège en une seule requête plus de 10 sources publiques (WHOIS, DNS, Shodan, VirusTotal, HaveIBeenPwned, crt.sh, Wayback Machine, réseaux sociaux...) pour construire un profil complet à partir d'un pseudo, d'un email, d'une IP ou d'un domaine.

Frontend React/Vite avec un fond WebGL custom (Three.js) et des animations GSAP, backend Python FastAPI orchestrant les appels externes en asynchrone, authentification par sessions avec hashing PBKDF2 et rôles admin/client.

**Démo live** : [tracer-ego2.vercel.app](https://tracer-ego2.vercel.app) — connecte-toi avec `demo@tracer.app` / `demo1234`, ou crée ton propre compte (30 secondes, aucune donnée requise). Backend hébergé sur Render en plan gratuit : la première requête après une période d'inactivité peut prendre jusqu'à 50s (le service se réveille).

<p align="center">
  <img src="docs/screenshot-domain-recon.jpg" width="49%" alt="Résultats de reconnaissance domaine" />
  <img src="docs/screenshot-faq.jpg" width="49%" alt="Page FAQ" />
</p>

---

## Stack

| Couche | Techno |
|---|---|
| Frontend | React 18 · Vite 5 · React Router v6 |
| Animations / 3D | Three.js · @react-three/fiber · Framer Motion · GSAP · postprocessing |
| Backend | Python 3 · FastAPI · Uvicorn |
| Auth | Sessions token, PBKDF2-HMAC-SHA256 (200k itérations), rôles admin/client |
| Stockage | SQLite (cache de résultats, historique, comptes) |

---

## Fonctionnalités

- **Aggregator intelligent** — détecte automatiquement le type de cible (email / IP / domaine / pseudo) et lance les modules pertinents en parallèle (`asyncio.gather`)
- **6 modules de recherche dédiés** — username (40+ plateformes façon Sherlock), email (leaks HIBP), téléphone, domaine (WHOIS/DNS/SSL/sous-domaines), IP (géoloc/ports/réputation), réseaux sociaux
- **Recherche dark web** via l'index Ahmia (.onion)
- **Comptes utilisateurs** avec sessions, rôles admin/client, panel d'administration
- **Cache** des résultats (30 min) pour éviter de re-solliciter les APIs externes

---

## Lancer en local

```bash
# 1. Dépendances JS
npm install

# 2. Dépendances Python
pip install -r backend/requirements.txt

# 3. Backend (terminal 1)
python backend/main.py          # http://127.0.0.1:8000

# 4. Frontend (terminal 2)
npm run dev                     # http://localhost:5173
```

Copie `.env.example` en `.env` pour activer les sources qui nécessitent une clé (Shodan, VirusTotal, HIBP...) — sans clé, ces sources sont simplement ignorées, le reste fonctionne normalement.

---

## Structure du projet

```
tracer/
├── src/
│   ├── App.jsx                 # Layout + routes (lazy-loaded)
│   ├── config.js                # URL de l'API backend
│   ├── hooks/
│   │   └── useSearch.js         # Hook partagé par les pages de recherche
│   ├── components/
│   │   ├── Hyperspeed.jsx       # Fond WebGL (Three.js + postprocessing)
│   │   ├── ContainerScroll.jsx  # Tablette 3D CSS + scroll Framer Motion
│   │   ├── PageHeader.jsx / ErrorNotice.jsx / ResultCard.jsx / SearchBar.jsx
│   │   └── Navbar.jsx / OpsBoard.jsx
│   ├── pages/
│   │   ├── Aggregator.jsx       # Page principale — détection auto
│   │   ├── UsernameSearch.jsx / EmailSearch.jsx / PhoneSearch.jsx
│   │   ├── DomainRecon.jsx / IPRecon.jsx / SocialMedia.jsx
│   │   ├── Login.jsx / Register.jsx / Profile.jsx / Admin.jsx
│   │   └── Features.jsx / Criteria.jsx / FAQ.jsx
│   └── utils/auth.js
│
└── backend/
    ├── main.py                  # FastAPI — routes + CORS
    ├── modules/
    │   ├── aggregator.py        # Détection de type + orchestration
    │   ├── username.py / email_lookup.py / phone.py
    │   ├── domain.py / ip_recon.py / social.py / darkweb.py / person.py
    │   └── auth.py               # Register / login / sessions / rôles
    └── utils/
        ├── db.py / cache.py     # SQLite : cache résultats + historique
        └── authdb.py             # Hashing PBKDF2, sessions, comptes
```

---

## Routes API

| Méthode | Route | Description |
|---|---|---|
| POST | `/aggregate` | Détecte le type de cible et agrège toutes les sources pertinentes (session requise) |
| POST | `/username` `/email` `/phone` `/domain` `/ip` `/social` `/darkweb` | Modules dédiés (session requise) |
| GET | `/history` `/stats` | Historique et statistiques des recherches (session requise) |
| POST | `/auth/register` `/auth/login` `/auth/logout` | Authentification |
| GET/PATCH | `/auth/me` `/auth/profile` | Profil utilisateur (session requise) |
| GET/DELETE | `/auth/accounts` `/auth/accounts/{email}` | Gestion des comptes (admin uniquement) |

---

## Variables d'environnement

Toutes les clés sont optionnelles — sans clé, la source correspondante est simplement ignorée, le reste continue de fonctionner. Voir `.env.example`.

```env
SHODAN_API_KEY=          # bannières / ports / vulnérabilités
HIBP_API_KEY=             # fuites de données (HaveIBeenPwned, payant depuis 2024)
NUMVERIFY_API_KEY=        # validation de numéro de téléphone
ABUSEIPDB_API_KEY=        # score de réputation abus IP
VIRUSTOTAL_API_KEY=       # détections malveillantes IP / domaine
SECURITYTRAILS_API_KEY=   # sous-domaines additionnels
```

Sources actives sans aucune clé : scan de pseudo façon Sherlock (40+ plateformes), WHOIS, DNS, SSL, crt.sh, Wayback Machine, géolocalisation IP, ports ouverts (HackerTarget), GitHub/Reddit, Gravatar, Ahmia (dark web).

---

## Déploiement

La démo live tourne sur ce setup :

- **Frontend** → Vercel, déployé depuis ce repo (preset Vite, racine du projet). Variable d'env `VITE_API_URL` pointée vers le backend.
- **Backend** → Render (`render.yaml` à la racine, Root Directory `backend`), variable d'env `FRONTEND_URL` pointée vers l'URL Vercel pour que le CORS s'ouvre uniquement à ce domaine.

```bash
npm run build      # → dist/
npm run preview    # prévisualiser le build en local
```

---

## Sécurité

Toutes les routes de recherche (`/aggregate`, `/username`, `/email`...) exigent une session valide — sans ça, un déploiement public laisserait n'importe qui consommer les clés API tierces payantes (Shodan, VirusTotal...) sans compte. Mots de passe hashés en PBKDF2-HMAC-SHA256 (200k itérations, salt aléatoire), tokens de session générés via `secrets.token_hex`, comparaison à temps constant (`hmac.compare_digest`).
