import axios from 'axios'
import { API_BASE_URL as API } from '../config'

/* ── Session locale (cache du user courant, jamais le mot de passe) ──── */
export function getUser() {
  try { return JSON.parse(localStorage.getItem('tracer_user')) } catch { return null }
}

function getToken() {
  return getUser()?.token || null
}

export function authHeaders() {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export function isAdmin() { return getUser()?.role === 'admin' }
export function isClient() { return getUser()?.role === 'client' }

function storeSession({ token, user }) {
  const stored = { ...user, token }
  localStorage.setItem('tracer_user', JSON.stringify(stored))
  window.dispatchEvent(new Event('tracer_auth'))
  return stored
}

function errorMessage(err, fallback) {
  return err?.response?.data?.detail || fallback
}

/* ── Login / Register / Logout ────────────────────────────────────── */
export async function login(email, password) {
  try {
    const { data } = await axios.post(`${API}/auth/login`, { email, password })
    return { success: true, user: storeSession(data) }
  } catch (err) {
    return { success: false, error: errorMessage(err, 'Email ou mot de passe incorrect.') }
  }
}

export async function register(name, email, password) {
  try {
    const { data } = await axios.post(`${API}/auth/register`, { name, email, password })
    return { success: true, user: storeSession(data) }
  } catch (err) {
    return { success: false, error: errorMessage(err, "Impossible de créer le compte.") }
  }
}

export async function logout() {
  try { await axios.post(`${API}/auth/logout`, {}, { headers: authHeaders() }) } catch { /* session déjà invalide */ }
  localStorage.removeItem('tracer_user')
  window.dispatchEvent(new Event('tracer_auth'))
}

/* ── Admin : comptes clients ──────────────────────────────────────── */
export async function getAccounts() {
  try {
    const { data } = await axios.get(`${API}/auth/accounts`, { headers: authHeaders() })
    return data.accounts
  } catch {
    return []
  }
}

export async function deleteAccount(email) {
  try {
    await axios.delete(`${API}/auth/accounts/${encodeURIComponent(email)}`, { headers: authHeaders() })
    return { success: true }
  } catch (err) {
    return { success: false, error: errorMessage(err, 'Suppression impossible.') }
  }
}

/* ── Client : mettre à jour son propre profil ─────────────────────── */
export async function updateAccount(_currentEmail, patch) {
  try {
    const { data } = await axios.patch(`${API}/auth/profile`, patch, { headers: authHeaders() })
    return { success: true, user: storeSession(data) }
  } catch (err) {
    return { success: false, error: errorMessage(err, 'Mise à jour impossible.') }
  }
}
