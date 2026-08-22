import { useState } from 'react'
import axios from 'axios'
import { API_BASE_URL } from '../config'
import { authHeaders } from '../utils/auth'

export default function useSearch(endpoint) {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)

  const search = async (query) => {
    setLoading(true)
    setResults(null)
    try {
      const { data } = await axios.post(`${API_BASE_URL}${endpoint}`, { query }, { headers: authHeaders() })
      setResults(data)
    } catch (err) {
      setResults({
        error: err.response?.status === 401
          ? 'Connecte-toi pour lancer une recherche'
          : 'Backend non disponible',
      })
    }
    setLoading(false)
  }

  return { loading, results, search }
}
