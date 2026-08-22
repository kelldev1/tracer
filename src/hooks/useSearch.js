import { useState } from 'react'
import axios from 'axios'
import { API_BASE_URL } from '../config'

export default function useSearch(endpoint) {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)

  const search = async (query) => {
    setLoading(true)
    setResults(null)
    try {
      const { data } = await axios.post(`${API_BASE_URL}${endpoint}`, { query })
      setResults(data)
    } catch {
      setResults({ error: 'Backend non disponible' })
    }
    setLoading(false)
  }

  return { loading, results, search }
}
