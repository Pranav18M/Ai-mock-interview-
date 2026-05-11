import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,   // 60s — Render free tier cold start can take 30–50s
  withCredentials: false,
})

// ── Attach JWT on every request ──────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Response interceptor: 401 → logout, log other errors ────────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    // Log CORS / network errors clearly in dev
    if (!err.response) {
      console.error('[API] Network/CORS error:', err.message, err.config?.url)
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────────────────────────────────
export const signup = (data) => api.post('/auth/signup', data)
export const login  = (data) => api.post('/auth/login',  data)

// ── Resume ────────────────────────────────────────────────────────────────────
export const uploadResume = (formData) =>
  api.post('/resume/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 90000,   // resume parsing can be slow
  })
export const getResume = () => api.get('/resume/')

// ── Interview ─────────────────────────────────────────────────────────────────
export const generateQuestions = (data) =>
  api.post('/interview/generate-questions', data, { timeout: 90000 })
export const submitAnswer      = (data) =>
  api.post('/interview/submit-answer', data, { timeout: 90000 })
export const completeInterview = (id)  =>
  api.post(`/interview/complete/${id}`, {}, { timeout: 90000 })
export const getInterviewReport  = (id) => api.get(`/interview/report/${id}`)
export const getInterviewHistory = ()   => api.get('/interview/history')
export const getGreeting         = (data) =>
  api.post('/interview/greeting', data, { timeout: 60000 })
export const getIntroResponse    = (data) =>
  api.post('/interview/intro-response', data, { timeout: 60000 })

// ── ATS ───────────────────────────────────────────────────────────────────────
export const analyzeATS = (formData) =>
  api.post('/ats/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000,   // AI analysis is heavy
  })

// ── Resume Generator ──────────────────────────────────────────────────────────
export const previewResume  = (data) => api.post('/resume-gen/preview',  data)
export const downloadResume = (data) => api.post('/resume-gen/download', data, { timeout: 60000 })

export default api