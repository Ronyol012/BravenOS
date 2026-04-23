import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPwd,  setShowPwd]  = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const handle = async (e) => {
    e.preventDefault()
    if (!email || !password) { setError('Completa todos los campos.'); return }
    setError(''); setLoading(true)
    try { await login(email, password) }
    catch { setError('Correo o contraseña incorrectos.') }
    finally { setLoading(false) }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center relative"
      style={{ background: 'var(--p)', fontFamily: '"Plus Jakarta Sans", sans-serif' }}
    >
      {/* Subtle grid texture, same as braven-demo */}
      <div
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(var(--rule) 1px, transparent 1px), linear-gradient(90deg, var(--rule) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          opacity: .5,
        }}
      />

      {/* Coral top accent bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'var(--cr)' }} />

      <div className="relative w-full max-w-[400px] px-6 animate-fade-up">

        {/* Logo — navy box + coral dot, identical to braven-demo */}
        <div className="flex flex-col items-center mb-10">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="brv-logo-mark">
              <svg
                style={{ width: 12, height: 12, fill: 'var(--p)', position: 'relative', zIndex: 1, margin: '8px 0 0 8px' }}
                viewBox="0 0 24 24"
              >
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <span
              style={{
                fontFamily: '"Plus Jakarta Sans"',
                fontWeight: 800,
                fontSize: 20,
                letterSpacing: '-.04em',
                color: 'var(--nv)',
              }}
            >
              Braven OS
            </span>
          </div>

          {/* Serif subtitle — like bravenweb.com headings */}
          <p
            style={{
              fontFamily: '"Cormorant Garamond", Georgia, serif',
              fontStyle: 'italic',
              fontWeight: 300,
              fontSize: 17,
              color: 'var(--n40)',
              letterSpacing: '-.01em',
            }}
          >
            Sistema interno de gestión
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: 'var(--w)',
            border: '1px solid var(--rule)',
            borderRadius: 14,
            padding: '32px 30px',
          }}
        >
          <div style={{ marginBottom: 24 }}>
            <h2
              style={{
                fontFamily: '"Plus Jakarta Sans"',
                fontWeight: 800,
                fontSize: 18,
                letterSpacing: '-.04em',
                color: 'var(--nv)',
                marginBottom: 4,
              }}
            >
              Bienvenido de vuelta
            </h2>
            <p style={{ fontSize: 13, color: 'var(--n40)', fontWeight: 300 }}>
              Inicia sesión para continuar.
            </p>
          </div>

          <form onSubmit={handle}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--n40)', marginBottom: 6, letterSpacing: '.04em', textTransform: 'uppercase' }}>
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@bravenstudio.do"
                className="brv-input"
                autoFocus
                autoComplete="email"
              />
            </div>

            <div style={{ marginBottom: 22 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--n40)', marginBottom: 6, letterSpacing: '.04em', textTransform: 'uppercase' }}>
                Contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="brv-input"
                  style={{ paddingRight: 40 }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--n40)', display: 'flex' }}
                >
                  {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: '#dc262610', border: '1px solid #dc262630', borderRadius: 7, padding: '9px 12px', marginBottom: 16, fontSize: 12, color: '#dc2626' }}>
                <AlertCircle size={13} style={{ flexShrink: 0 }} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="brv-btn brv-btn-navy"
              style={{ width: '100%', justifyContent: 'center', padding: '11px 0', fontSize: 13, opacity: loading ? .75 : 1 }}
            >
              {loading
                ? <><span style={{ width: 13, height: 13, border: '2px solid rgba(240,241,240,.3)', borderTopColor: 'var(--p)', borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' }} /> Autenticando...</>
                : 'Iniciar sesión →'
              }
            </button>
          </form>
        </div>

        {/* Section label style footer */}
        <div className="brv-label" style={{ justifyContent: 'center', marginTop: 24, marginBottom: 0 }}>
          Braven Studio © {new Date().getFullYear()} · Santo Domingo, RD
        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
