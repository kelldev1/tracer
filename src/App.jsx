import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Hyperspeed from './components/Hyperspeed'
import Navbar from './components/Navbar'

const UsernameSearch = lazy(() => import('./pages/UsernameSearch'))
const EmailSearch    = lazy(() => import('./pages/EmailSearch'))
const PhoneSearch    = lazy(() => import('./pages/PhoneSearch'))
const SocialMedia    = lazy(() => import('./pages/SocialMedia'))
const DomainRecon    = lazy(() => import('./pages/DomainRecon'))
const IPRecon        = lazy(() => import('./pages/IPRecon'))
const Aggregator     = lazy(() => import('./pages/Aggregator'))
const Login          = lazy(() => import('./pages/Login'))
const Register       = lazy(() => import('./pages/Register'))
const Profile        = lazy(() => import('./pages/Profile'))
const FAQ            = lazy(() => import('./pages/FAQ'))
const Features       = lazy(() => import('./pages/Features'))
const Admin          = lazy(() => import('./pages/Admin'))
const Criteria       = lazy(() => import('./pages/Criteria'))

const HYPERSPEED_OPTIONS = {
  distortion: 'xyDistortion',
  colors: {
    roadColor: 0x0a0a0a,
    islandColor: 0x080808,
    background: 0x080808,
    shoulderLines: 0xffffff,
    brokenLines: 0xffffff,
    leftCars:  [0xc0392b, 0x8b1a1a, 0xe74c3c],
    rightCars: [0xc8a878, 0xb8956a, 0xe8c898],
    sticks: 0xc8a878,
  },
}

export default function App() {
  return (
    <div style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>

      {/* Fond Hyperspeed */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: '#080808' }}>
        <Hyperspeed effectOptions={HYPERSPEED_OPTIONS} />
        {/* Overlay sombre pour le glassmorphisme */}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(8,8,8,0.45)' }} />
      </div>

      {/* Contenu par-dessus */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <Navbar />
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <main style={{ flex: 1, overflow: 'hidden', background: 'transparent', paddingTop: 0 }}>
            <Suspense fallback={null}>
              <Routes>
                <Route path="/" element={<Navigate to="/aggregator" replace />} />
                <Route path="/aggregator" element={<Aggregator />} />
                <Route path="/username" element={<UsernameSearch />} />
                <Route path="/email" element={<EmailSearch />} />
                <Route path="/phone" element={<PhoneSearch />} />
                <Route path="/social" element={<SocialMedia />} />
                <Route path="/domain" element={<DomainRecon />} />
                <Route path="/ip" element={<IPRecon />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/features" element={<Features />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/criteria" element={<Criteria />} />
                <Route path="/faq" element={<FAQ />} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  )
}
