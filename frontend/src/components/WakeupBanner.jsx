import { useState, useEffect } from 'react'
import api from '../services/api'

/**
 * Pings /health every 4s while the Render server is waking up.
 * Shows a top banner with a spinner until the server responds.
 * Disappears automatically once online.
 */
export default function WakeupBanner() {
  const [status, setStatus] = useState('checking') // 'checking' | 'online' | 'hidden'
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    let tries = 0
    let timer

    const ping = async () => {
      try {
        await api.get('/health', { timeout: 8000 })
        setStatus('online')
        // hide after short success message
        setTimeout(() => setStatus('hidden'), 2000)
      } catch {
        tries++
        setElapsed(tries * 4)
        if (tries < 20) {            // stop after ~80s
          timer = setTimeout(ping, 4000)
        } else {
          setStatus('hidden')        // give up silently
        }
      }
    }

    ping()
    return () => clearTimeout(timer)
  }, [])

  if (status === 'hidden') return null

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
      background: status === 'online'
        ? 'linear-gradient(90deg,#059669,#10b981)'
        : 'linear-gradient(90deg,#4f46e5,#7c3aed)',
      color: '#fff',
      padding: '10px 20px',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
      fontSize: '13px', fontWeight: '600',
      boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
      transition: 'background 0.4s ease',
    }}>
      {status === 'online' ? (
        <>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Server is online! Ready to go 🚀
        </>
      ) : (
        <>
          <span style={{
            width: '14px', height: '14px',
            border: '2px solid rgba(255,255,255,0.3)',
            borderTop: '2px solid #fff',
            borderRadius: '50%',
            display: 'inline-block',
            animation: 'spin 0.8s linear infinite',
            flexShrink: 0,
          }}/>
          Waking up server{elapsed > 0 ? ` (${elapsed}s)` : ''}… this takes ~30s on first load
          <span style={{ opacity: 0.7, fontWeight: '400' }}>— AI features will be ready shortly</span>
        </>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}