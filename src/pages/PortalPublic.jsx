import { useState, useEffect } from 'react'
import { tokenDB } from '@/lib/supabase'
import { formatDate, STATUS_CONFIG, PLAN_CONFIG } from '@/lib/utils'

const PHASES = ['Briefing','Diseño en Figma','Aprobación','Desarrollo','QA','Entrega']

// ── Demo data si no hay Supabase ─────────────────────────────────────────────
const DEMO = {
  token: 'BRV-K7MN2X',
  projects: {
    name:        'Portal Inmobiliaria Palma',
    plan:        'BRV-04',
    status:      'revision',
    progress:    92,
    due_date:    '2025-04-18',
    figma_url:   'https://figma.com/proto/example',
    live_url:    '',
    notes:       'El diseño está en revisión. Por favor revisa el prototipo en Figma y danos tu aprobación para proceder con el desarrollo final.',
    clients:     { name: 'Carlos Sosa', email: 'csosa@palma.do' },
  },
  clients: { name: 'Carlos Sosa', email: 'csosa@palma.do' },
}

function C(key) {
  const map = {
    '--p':    '#f0f1f0', '--w': '#ffffff', '--nv':  '#12182a',
    '--n40':  'rgba(18,24,42,.4)', '--n20': 'rgba(18,24,42,.2)',
    '--n10':  'rgba(18,24,42,.1)', '--n05': 'rgba(18,24,42,.05)',
    '--cr':   '#ea6969', '--bl': '#4d78bb', '--gy':  '#5e5d5d',
    '--rule': 'rgba(18,24,42,.11)',
  }
  return map[key] ?? key
}

export default function PortalPublic() {
  const [token,   setToken]   = useState('')
  const [input,   setInput]   = useState('')
  const [data,    setData]    = useState(null)
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [approved,setApproved]= useState(false)

  // Read token from URL ?token=BRV-XXXX on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const t = params.get('token')
    if (t) { setInput(t.toUpperCase()); handleLookup(t.toUpperCase()) }
  }, [])

  const handleLookup = async (rawToken) => {
    const t = (rawToken ?? input).trim().toUpperCase()
    if (!t) return
    setLoading(true); setError('')
    try {
      const { data: row, error: err } = await tokenDB.getByToken(t)
      if (err || !row) {
        // Try demo token
        if (t === DEMO.token) { setData(DEMO); setToken(t) }
        else setError('Código no encontrado o inactivo. Verifica que lo escribiste bien.')
      } else {
        await tokenDB.logAccess(row.id).catch(() => {})
        setData(row); setToken(t)
      }
    } catch {
      if (t === DEMO.token) { setData(DEMO); setToken(t) }
      else setError('Código no encontrado. Verifica que lo escribiste bien.')
    } finally { setLoading(false) }
  }

  const project  = data?.projects
  const client   = data?.clients ?? project?.clients
  const planCfg  = PLAN_CONFIG[project?.plan]   ?? {}
  const statusCfg= STATUS_CONFIG[project?.stage ?? project?.status] ?? {}
  const progress = project?.progress_pct ?? project?.progress ?? 0
  const phaseIdx = Math.floor((progress / 100) * (PHASES.length - 1))

  // ── Entry screen ──────────────────────────────────────────────────────────
  if (!data) return (
    <div style={{ minHeight:'100vh', background:C('--p'), display:'flex', alignItems:'center', justifyContent:'center', padding:24, fontFamily:'"Plus Jakarta Sans",system-ui,sans-serif' }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:C('--cr') }}/>

      {/* Subtle grid */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', backgroundImage:`linear-gradient(${C('--rule')} 1px, transparent 1px), linear-gradient(90deg, ${C('--rule')} 1px, transparent 1px)`, backgroundSize:'48px 48px', opacity:.5 }}/>

      <div style={{ width:'100%', maxWidth:400, position:'relative' }}>
        {/* Logo */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginBottom:36 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
            <div style={{ width:32, height:32, background:C('--nv'), borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden' }}>
              <svg style={{ width:13, height:13, fill:C('--p'), position:'relative', zIndex:1 }} viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              <span style={{ position:'absolute', bottom:0, right:0, width:11, height:11, background:C('--cr'), borderRadius:'50% 0 0 0' }}/>
            </div>
            <span style={{ fontWeight:800, fontSize:18, letterSpacing:'-.04em', color:C('--nv') }}>Braven Studio</span>
          </div>
          <p style={{ fontFamily:'"Cormorant Garamond",serif', fontStyle:'italic', fontWeight:300, fontSize:17, color:C('--n40'), textAlign:'center' }}>
            Portal de seguimiento de proyectos
          </p>
        </div>

        {/* Card */}
        <div style={{ background:C('--w'), border:`1px solid ${C('--rule')}`, borderRadius:16, padding:'30px 28px' }}>
          <h2 style={{ fontWeight:800, fontSize:17, letterSpacing:'-.04em', color:C('--nv'), marginBottom:4 }}>
            Ingresa tu código de acceso
          </h2>
          <p style={{ fontSize:13, color:C('--n40'), fontWeight:300, marginBottom:22, lineHeight:1.6 }}>
            Tu código fue enviado por WhatsApp o email. Tiene el formato <strong style={{ fontFamily:'monospace', color:C('--nv') }}>BRV-XXXXXX</strong>
          </p>

          <div style={{ marginBottom:16 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && handleLookup()}
              placeholder="BRV-XXXXXX"
              maxLength={10}
              style={{ width:'100%', padding:'12px 16px', background:C('--p'), border:`1.5px solid ${error ? '#dc2626' : C('--rule')}`, borderRadius:8, fontFamily:'"JetBrains Mono",monospace', fontWeight:700, fontSize:20, letterSpacing:'.12em', color:C('--nv'), outline:'none', textAlign:'center', textTransform:'uppercase', boxSizing:'border-box' }}
              onFocus={e => { e.target.style.borderColor = C('--nv'); e.target.style.boxShadow = `0 0 0 3px ${C('--n05')}` }}
              onBlur={e  => { e.target.style.borderColor = error ? '#dc2626' : C('--rule'); e.target.style.boxShadow = 'none' }}
            />
            {error && <p style={{ fontSize:12, color:'#dc2626', marginTop:6 }}>{error}</p>}
          </div>

          <button
            onClick={() => handleLookup()}
            disabled={loading || input.length < 6}
            style={{ width:'100%', padding:'12px', background: loading || input.length < 6 ? C('--n20') : C('--nv'), border:'none', borderRadius:8, color:C('--p'), fontWeight:800, fontSize:14, letterSpacing:'-.02em', cursor: loading || input.length < 6 ? 'default' : 'pointer', transition:'background .15s', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}
          >
            {loading
              ? <><span style={{ width:14, height:14, border:`2px solid rgba(240,241,240,.3)`, borderTopColor:C('--p'), borderRadius:'50%', animation:'spin .7s linear infinite', display:'inline-block' }}/> Buscando...</>
              : 'Ver mi proyecto →'
            }
          </button>
        </div>

        <p style={{ textAlign:'center', fontSize:11, color:C('--n40'), marginTop:20 }}>
          ¿No tienes tu código? Escríbenos a{' '}
          <a href="mailto:hola@bravenweb.com" style={{ color:C('--cr'), fontWeight:600 }}>hola@bravenweb.com</a>
        </p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  // ── Project view ──────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight:'100vh', background:C('--p'), fontFamily:'"Plus Jakarta Sans",system-ui,sans-serif' }}>

      {/* Top bar */}
      <header style={{ background:C('--w'), borderBottom:`1px solid ${C('--rule')}`, position:'sticky', top:0, zIndex:10 }}>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:C('--cr') }}/>
        <div style={{ maxWidth:840, margin:'0 auto', padding:'0 24px', height:56, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:9 }}>
            <div style={{ width:26, height:26, background:C('--nv'), borderRadius:6, position:'relative', overflow:'hidden', flexShrink:0 }}>
              <svg style={{ width:10, height:10, fill:C('--p'), position:'relative', zIndex:1, margin:'7px 0 0 7px' }} viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              <span style={{ position:'absolute', bottom:0, right:0, width:9, height:9, background:C('--cr'), borderRadius:'50% 0 0 0' }}/>
            </div>
            <span style={{ fontWeight:800, fontSize:14, letterSpacing:'-.04em', color:C('--nv') }}>Braven Studio</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ fontSize:11, color:C('--n40') }}>Hola, <strong style={{ color:C('--nv') }}>{client?.name?.split(' ')[0]}</strong></span>
            <code style={{ fontFamily:'"JetBrains Mono",monospace', fontSize:10, fontWeight:700, background:C('--p'), padding:'3px 8px', borderRadius:5, border:`1px solid ${C('--rule')}`, color:C('--nv') }}>
              {token}
            </code>
          </div>
        </div>
      </header>

      <main style={{ maxWidth:840, margin:'0 auto', padding:'28px 24px' }}>

        {/* Project header */}
        <div style={{ marginBottom:24 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
            <span style={{ width:18, height:1.5, background:C('--cr'), display:'inline-block' }}/>
            <span style={{ fontSize:10, fontWeight:700, color:C('--n40'), textTransform:'uppercase', letterSpacing:'.08em' }}>
              Tu proyecto
            </span>
          </div>
          <h1 style={{ fontFamily:'"Cormorant Garamond",serif', fontWeight:300, fontStyle:'italic', fontSize:'clamp(26px,4vw,38px)', letterSpacing:'-.02em', color:C('--nv'), lineHeight:1.1, marginBottom:6 }}>
            {project?.name}
          </h1>
          <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
            <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:100, background:`${planCfg.color}14`, color:planCfg.color, border:`1px solid ${planCfg.color}28` }}>
              {planCfg.label}
            </span>
            <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:100, background:`${statusCfg.color}14`, color:statusCfg.color, border:`1px solid ${statusCfg.color}28` }}>
              {statusCfg.label}
            </span>
            {(project?.delivery_date ?? project?.due_date) && (
              <span style={{ fontSize:11, color:C('--n40') }}>
                Entrega estimada: <strong style={{ color:C('--nv') }}>{formatDate(project?.delivery_date ?? project?.due_date)}</strong>
              </span>
            )}
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>

          {/* Progress card */}
          <div style={{ background:C('--w'), border:`1px solid ${C('--rule')}`, borderRadius:14, padding:'22px 24px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:14 }}>
              <span style={{ width:14, height:1.5, background:C('--cr'), display:'inline-block' }}/>
              <span style={{ fontSize:10, fontWeight:700, color:C('--n40'), textTransform:'uppercase', letterSpacing:'.08em' }}>Avance del proyecto</span>
            </div>

            {/* Big number */}
            <div style={{ display:'flex', alignItems:'baseline', gap:6, marginBottom:12 }}>
              <span style={{ fontFamily:'"Plus Jakarta Sans"', fontWeight:800, fontSize:48, letterSpacing:'-.06em', color:C('--nv'), lineHeight:1 }}>{progress}</span>
              <span style={{ fontSize:20, fontWeight:800, color:C('--cr'), letterSpacing:'-.02em' }}>%</span>
            </div>

            {/* Progress bar */}
            <div style={{ height:6, background:C('--n10'), borderRadius:3, overflow:'hidden', marginBottom:16 }}>
              <div style={{ width:`${progress}%`, height:'100%', background: progress === 100 ? '#2a9d5c' : C('--cr'), borderRadius:3, transition:'width 1s cubic-bezier(.4,0,.2,1)' }}/>
            </div>

            {/* Phases */}
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {PHASES.map((ph, i) => {
                const done    = i <  phaseIdx
                const current = i === phaseIdx
                return (
                  <div key={ph} style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ width:16, height:16, borderRadius:4, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', background: done ? C('--cr') : current ? C('--nv') : C('--n05'), border: done || current ? 'none' : `1px solid ${C('--rule')}` }}>
                      {done    && <svg width="9" height="9" viewBox="0 0 12 12"><path d="M1 6l4 4 6-8" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round"/></svg>}
                      {current && <span style={{ width:6, height:6, borderRadius:'50%', background:C('--cr'), display:'block' }}/>}
                    </div>
                    <span style={{ fontSize:12, fontWeight: current ? 700 : done ? 500 : 300, color: done ? C('--nv') : current ? C('--nv') : C('--n40'), textDecoration: done ? 'line-through' : 'none' }}>
                      {ph}
                    </span>
                    {current && <span style={{ fontSize:9, fontWeight:700, padding:'1px 6px', borderRadius:100, background:`${C('--cr')}12`, color:C('--cr'), marginLeft:'auto' }}>En curso</span>}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right column */}
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

            {/* Notes from Braven */}
            {project?.notes && (
              <div style={{ background:C('--w'), border:`1px solid ${C('--rule')}`, borderRadius:14, padding:'20px 22px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:12 }}>
                  <span style={{ width:14, height:1.5, background:C('--cr'), display:'inline-block' }}/>
                  <span style={{ fontSize:10, fontWeight:700, color:C('--n40'), textTransform:'uppercase', letterSpacing:'.08em' }}>Mensaje del equipo</span>
                </div>
                <p style={{ fontSize:13, color:C('--gy'), lineHeight:1.7, fontWeight:300 }}>{project.notes}</p>
                <p style={{ fontSize:11, color:C('--n40'), marginTop:10 }}>— Braven Studio</p>
              </div>
            )}

            {/* Actions */}
            <div style={{ background:C('--w'), border:`1px solid ${C('--rule')}`, borderRadius:14, padding:'20px 22px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:14 }}>
                <span style={{ width:14, height:1.5, background:C('--cr'), display:'inline-block' }}/>
                <span style={{ fontSize:10, fontWeight:700, color:C('--n40'), textTransform:'uppercase', letterSpacing:'.08em' }}>Acciones</span>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>

                {/* Figma */}
                {project?.figma_url && (
                  <a href={project.figma_url} target="_blank" rel="noreferrer"
                    style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 14px', background:C('--p'), borderRadius:8, border:`1px solid ${C('--rule')}`, textDecoration:'none', transition:'border-color .15s' }}
                    onMouseEnter={e=>e.currentTarget.style.borderColor=C('--nv')}
                    onMouseLeave={e=>e.currentTarget.style.borderColor=C('--rule')}
                  >
                    <svg width="16" height="16" viewBox="0 0 38 57" fill="none">
                      <path d="M19 28.5A9.5 9.5 0 1 1 28.5 19 9.5 9.5 0 0 1 19 28.5z" fill="#1ABCFE"/>
                      <path d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 0 1-19 0z" fill="#0ACF83"/>
                      <path d="M19 0v19h9.5a9.5 9.5 0 0 0 0-19z" fill="#FF7262"/>
                      <path d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z" fill="#F24E1E"/>
                      <path d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z" fill="#A259FF"/>
                    </svg>
                    <div>
                      <div style={{ fontSize:12, fontWeight:700, color:C('--nv') }}>Ver diseño en Figma</div>
                      <div style={{ fontSize:10, color:C('--n40') }}>Prototipo interactivo</div>
                    </div>
                    <span style={{ marginLeft:'auto', fontSize:10, color:C('--n40') }}>→</span>
                  </a>
                )}

                {/* Live URL */}
                {(project?.site_url ?? project?.live_url) && (
                  <a href={project?.site_url ?? project?.live_url} target="_blank" rel="noreferrer"
                    style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 14px', background:C('--nv'), borderRadius:8, border:'none', textDecoration:'none' }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill={C('--p')}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                    <div>
                      <div style={{ fontSize:12, fontWeight:700, color:C('--p') }}>Ver sitio en producción</div>
                      <div style={{ fontSize:10, color:'rgba(240,241,240,.5)' }}>{project?.site_url ?? project?.live_url}</div>
                    </div>
                    <span style={{ marginLeft:'auto', fontSize:10, color:'rgba(240,241,240,.4)' }}>→</span>
                  </a>
                )}

                {/* Approve design button — shown during revision phase */}
                {((project?.stage ?? project?.status) === 'revision') && !approved && (
                  <button
                    onClick={() => setApproved(true)}
                    style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'12px', background:C('--cr'), border:'none', borderRadius:8, color:'#fff', fontWeight:700, fontSize:13, cursor:'pointer', transition:'background .15s' }}
                    onMouseEnter={e=>e.currentTarget.style.background='#e05d5d'}
                    onMouseLeave={e=>e.currentTarget.style.background=C('--cr')}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                    Aprobar diseño — listo para desarrollar
                  </button>
                )}

                {approved && (
                  <div style={{ padding:'12px 14px', background:'rgba(42,157,92,.1)', border:'1px solid rgba(42,157,92,.25)', borderRadius:8, display:'flex', alignItems:'center', gap:8 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#2a9d5c"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                    <div>
                      <div style={{ fontSize:12, fontWeight:700, color:'#2a9d5c' }}>¡Diseño aprobado!</div>
                      <div style={{ fontSize:11, color:C('--gy') }}>Le notificamos al equipo Braven ahora mismo.</div>
                    </div>
                  </div>
                )}

                {/* WhatsApp */}
                <a
                  href="https://wa.me/18095550000"
                  target="_blank"
                  rel="noreferrer"
                  style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 14px', background:C('--p'), borderRadius:8, border:`1px solid ${C('--rule')}`, textDecoration:'none', transition:'border-color .15s' }}
                  onMouseEnter={e=>e.currentTarget.style.borderColor='#25D366'}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=C('--rule')}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.114.553 4.098 1.523 5.82L.057 23.25l5.565-1.457A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.891 0-3.659-.523-5.168-1.432l-.371-.22-3.303.866.881-3.218-.242-.389A9.932 9.932 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
                  <div>
                    <div style={{ fontSize:12, fontWeight:700, color:C('--nv') }}>Escribir al equipo</div>
                    <div style={{ fontSize:10, color:C('--n40') }}>WhatsApp · Respuesta en menos de 24h</div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign:'center', padding:'20px 0', borderTop:`1px solid ${C('--rule')}` }}>
          <p style={{ fontSize:11, color:C('--n40') }}>
            Braven Studio · Santo Domingo, RD · <a href="mailto:hola@bravenweb.com" style={{ color:C('--cr'), fontWeight:600 }}>hola@bravenweb.com</a>
          </p>
        </div>
      </main>
    </div>
  )
}
