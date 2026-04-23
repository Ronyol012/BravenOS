import { useState, useEffect } from 'react'
import { Plus, Copy, Check, X, ExternalLink, RefreshCw, Globe, Eye } from 'lucide-react'
import { tokenDB, generateToken } from '@/lib/supabase'
import { db } from '@/lib/supabase'
import { formatDate, relativeDate, STATUS_CONFIG, PLAN_CONFIG } from '@/lib/utils'
import { StatusBadge, PlanBadge, EmptyState } from '@/components/shared'

// ── Mock data para cuando Supabase no esté conectado ────────────────────────
const MOCK_TOKENS = [
  {
    id: '1', token: 'BRV-K7MN2X', status: 'activo', created_at: new Date(Date.now()-86400000*2).toISOString(),
    last_access: new Date(Date.now()-3600000).toISOString(), access_count: 4,
    projects: { name: 'Portal Inmobiliaria Palma', status: 'revision', progress: 92, plan: 'BRV-04', figma_url: 'https://figma.com', live_url: '' },
    clients:  { name: 'Carlos Sosa', email: 'csosa@palma.do' },
  },
  {
    id: '2', token: 'BRV-A9QR5T', status: 'activo', created_at: new Date(Date.now()-86400000*5).toISOString(),
    last_access: null, access_count: 0,
    projects: { name: 'Clínica Familia Verde', status: 'diseno', progress: 65, plan: 'BRV-02', figma_url: '', live_url: '' },
    clients:  { name: 'Dr. Javier Matos', email: 'jmatos@gmail.com' },
  },
]

const MOCK_PROJECTS = [
  { id: '1', name: 'Portal Inmobiliaria Palma',   clients: { name: 'Carlos Sosa'      }, plan: 'BRV-04', status: 'revision'   },
  { id: '2', name: 'Clínica Familia Verde',        clients: { name: 'Dr. Javier Matos' }, plan: 'BRV-02', status: 'diseno'     },
  { id: '3', name: 'Restaurante La Cazuela',       clients: { name: 'María Rodríguez'  }, plan: 'BRV-01', status: 'desarrollo' },
  { id: '4', name: 'Plataforma Academia Digital',  clients: { name: 'Ana Herrera'      }, plan: 'BRV-02', status: 'kickoff'    },
]

function Label({ children }) {
  return <label style={{ display:'block', fontSize:10, fontWeight:700, color:'var(--n40)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:5 }}>{children}</label>
}

// ── Token Card ───────────────────────────────────────────────────────────────
function TokenCard({ tok, onRevoke, onCopy, copied }) {
  const isNew    = tok.access_count === 0
  const portalUrl = `${window.location.origin}/portal?token=${tok.token}`

  return (
    <div style={{ background:'var(--w)', border:`1px solid ${tok.status==='activo' ? 'var(--rule)' : 'var(--n10)'}`, borderRadius:14, padding:'20px 22px', opacity: tok.status !== 'activo' ? .55 : 1 }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:14 }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
            {/* Token code — el protagonista */}
            <code style={{ fontFamily:'"JetBrains Mono",monospace', fontWeight:700, fontSize:18, letterSpacing:'.08em', color:'var(--nv)', background:'var(--p)', padding:'3px 10px', borderRadius:6, border:'1px solid var(--rule)' }}>
              {tok.token}
            </code>
            {tok.status === 'activo' && (
              <span style={{ fontSize:9, fontWeight:700, padding:'2px 7px', borderRadius:100, background:'rgba(42,157,92,.12)', color:'#2a9d5c', border:'1px solid rgba(42,157,92,.2)', textTransform:'uppercase', letterSpacing:'.06em' }}>
                Activo
              </span>
            )}
            {tok.status === 'revocado' && (
              <span style={{ fontSize:9, fontWeight:700, padding:'2px 7px', borderRadius:100, background:'rgba(220,38,38,.1)', color:'#dc2626', border:'1px solid rgba(220,38,38,.2)', textTransform:'uppercase', letterSpacing:'.06em' }}>
                Revocado
              </span>
            )}
          </div>
          <p style={{ fontSize:13, fontWeight:700, color:'var(--nv)', marginBottom:2 }}>{tok.projects?.name}</p>
          <p style={{ fontSize:12, color:'var(--n40)', fontWeight:300 }}>{tok.clients?.name} · {tok.clients?.email}</p>
        </div>
        <PlanBadge plan={tok.projects?.plan} />
      </div>

      {/* Stats row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:14, padding:'10px 0', borderTop:'1px solid var(--rule)', borderBottom:'1px solid var(--rule)' }}>
        <div>
          <div style={{ fontSize:9, fontWeight:700, color:'var(--n40)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:2 }}>Creado</div>
          <div style={{ fontSize:12, color:'var(--nv)', fontWeight:500 }}>{formatDate(tok.created_at)}</div>
        </div>
        <div>
          <div style={{ fontSize:9, fontWeight:700, color:'var(--n40)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:2 }}>Último acceso</div>
          <div style={{ fontSize:12, color: isNew ? 'var(--n40)' : 'var(--nv)', fontWeight:500 }}>
            {tok.last_access ? relativeDate(tok.last_access) : 'Sin accesos'}
          </div>
        </div>
        <div>
          <div style={{ fontSize:9, fontWeight:700, color:'var(--n40)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:2 }}>Visitas</div>
          <div style={{ fontSize:12, fontWeight:700, color: tok.access_count > 0 ? '#2a9d5c' : 'var(--n40)' }}>
            {tok.access_count} {tok.access_count === 0 && '— sin abrir aún'}
          </div>
        </div>
      </div>

      {/* Estado del proyecto */}
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
        <StatusBadge status={tok.projects?.stage ?? tok.projects?.status} />
        <div style={{ flex:1, height:4, background:'var(--n10)', borderRadius:2, overflow:'hidden' }}>
          <div style={{ width:`${tok.projects?.progress_pct ?? tok.projects?.progress ?? 0}%`, height:'100%', background: tok.projects?.progress === 100 ? '#2a9d5c' : 'var(--cr)', borderRadius:2, transition:'width .5s' }} />
        </div>
        <span style={{ fontSize:10, fontFamily:'"JetBrains Mono",monospace', color:'var(--n40)' }}>{tok.projects?.progress_pct ?? tok.projects?.progress ?? 0}%</span>
      </div>

      {/* Actions */}
      {tok.status === 'activo' && (
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {/* Copy token */}
          <button
            onClick={() => onCopy(tok.token)}
            className="brv-btn brv-btn-navy brv-btn-sm"
            style={{ fontSize:11, gap:5 }}
          >
            {copied === tok.token ? <><Check size={12}/> Copiado</> : <><Copy size={12}/> Copiar código</>}
          </button>

          {/* Copy portal URL */}
          <button
            onClick={() => onCopy(portalUrl, tok.token + '_url')}
            className="brv-btn brv-btn-ghost brv-btn-sm"
            style={{ fontSize:11, gap:5 }}
          >
            {copied === tok.token + '_url' ? <><Check size={12}/> Copiado</> : <><Globe size={12}/> Copiar link</>}
          </button>

          {/* Preview */}
          <a
            href={`/portal?token=${tok.token}`}
            target="_blank"
            rel="noreferrer"
            className="brv-btn brv-btn-ghost brv-btn-sm"
            style={{ fontSize:11, gap:5 }}
          >
            <Eye size={12}/> Ver portal
          </a>

          {/* Revoke */}
          <button
            onClick={() => onRevoke(tok.id)}
            className="brv-btn brv-btn-ghost brv-btn-sm"
            style={{ fontSize:11, gap:5, color:'var(--n40)', marginLeft:'auto' }}
          >
            <X size={12}/> Revocar
          </button>
        </div>
      )}

      {/* WhatsApp message preview */}
      {tok.status === 'activo' && (
        <div
          style={{ marginTop:12, background:'var(--p)', borderRadius:8, padding:'10px 12px', border:'1px solid var(--rule)', cursor:'pointer' }}
          onClick={() => onCopy(
            `Hola ${tok.clients?.name?.split(' ')[0]} 👋\n\nYa puedes ver el avance de tu proyecto en el portal de Braven:\n\n🔗 ${portalUrl}\n\nO ingresa directamente con tu código: *${tok.token}*\n\nCualquier pregunta, aquí estoy. — Braven Studio`,
            tok.token + '_wa'
          )}
          title="Click para copiar mensaje de WhatsApp"
        >
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:5 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.114.553 4.098 1.523 5.82L.057 23.25l5.565-1.457A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.891 0-3.659-.523-5.168-1.432l-.371-.22-3.303.866.881-3.218-.242-.389A9.932 9.932 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
            <span style={{ fontSize:10, fontWeight:700, color:'#25D366' }}>Mensaje WhatsApp listo</span>
            <span style={{ fontSize:10, color:'var(--n40)', marginLeft:'auto' }}>Click para copiar</span>
          </div>
          <p style={{ fontSize:11, color:'var(--gy)', lineHeight:1.5, fontFamily:'system-ui' }}>
            Hola <strong>{tok.clients?.name?.split(' ')[0]}</strong> 👋 Ya puedes ver el avance en el portal...{' '}
            <span style={{ fontFamily:'"JetBrains Mono",monospace', fontWeight:700, color:'var(--nv)', fontSize:10 }}>{tok.token}</span>
          </p>
        </div>
      )}
    </div>
  )
}

// ── New Token Modal ──────────────────────────────────────────────────────────
function NewTokenModal({ onClose, onSave, projects }) {
  const [projectId, setProjectId] = useState('')
  const [label,     setLabel]     = useState('')
  const [preview,   setPreview]   = useState(generateToken())
  const [saving,    setSaving]    = useState(false)

  const selectedProject = projects.find(p => p.id === projectId)

  const handleSave = async () => {
    if (!projectId) return
    setSaving(true)
    const token = preview
    const p     = selectedProject
    try {
      await onSave({
        token,
        project_id: projectId,
        client_id:  p?.client_id ?? null,
        label:      label || `Portal ${p?.name ?? ''}`,
        status:     'activo',
      })
    } finally { setSaving(false) }
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(18,24,42,.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999, padding:24 }}>
      <div style={{ background:'var(--w)', borderRadius:20, width:'100%', maxWidth:480, overflow:'hidden', display:'flex', flexDirection:'column', border:'1px solid var(--rule)' }}>

        {/* Header */}
        <div style={{ padding:'20px 24px 18px', borderBottom:'1px solid var(--rule)', position:'relative', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'var(--cr)' }}/>
          <div>
            <h3 style={{ fontFamily:'"Cormorant Garamond",serif', fontStyle:'italic', fontWeight:300, fontSize:22, color:'var(--nv)', marginBottom:2 }}>
              Generar acceso portal
            </h3>
            <p style={{ fontSize:11, color:'var(--n40)', fontWeight:300 }}>
              El cliente usará este código para ver el avance de su proyecto
            </p>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--n40)', display:'flex' }}><X size={18}/></button>
        </div>

        <div style={{ padding:24, display:'flex', flexDirection:'column', gap:18 }}>

          {/* Token preview — lo más importante */}
          <div style={{ textAlign:'center', padding:'20px', background:'var(--p)', borderRadius:12, border:'1px solid var(--rule)' }}>
            <div style={{ fontSize:11, fontWeight:700, color:'var(--n40)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:8 }}>
              Código de acceso
            </div>
            <code style={{ fontFamily:'"JetBrains Mono",monospace', fontWeight:700, fontSize:28, letterSpacing:'.12em', color:'var(--nv)', display:'block', marginBottom:10 }}>
              {preview}
            </code>
            <button
              onClick={() => setPreview(generateToken())}
              className="brv-btn brv-btn-ghost brv-btn-sm"
              style={{ fontSize:11, margin:'0 auto' }}
            >
              <RefreshCw size={11}/> Regenerar
            </button>
          </div>

          {/* Project selector */}
          <div>
            <Label>Proyecto</Label>
            <select
              className="brv-input"
              value={projectId}
              onChange={e => setProjectId(e.target.value)}
            >
              <option value="">— Selecciona un proyecto —</option>
              {projects.filter(p => p.status !== 'finalizado' && p.status !== 'cancelado').map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} · {p.clients?.name}
                </option>
              ))}
            </select>
          </div>

          {/* Selected project preview */}
          {selectedProject && (
            <div style={{ background:'var(--p)', borderRadius:9, padding:'12px 14px', border:'1px solid var(--rule)', display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:12, fontWeight:700, color:'var(--nv)', marginBottom:3 }}>{selectedProject.name}</div>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <PlanBadge plan={selectedProject.plan} />
                  <StatusBadge status={selectedProject.status} />
                </div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:10, color:'var(--n40)' }}>Cliente</div>
                <div style={{ fontSize:12, fontWeight:600, color:'var(--nv)' }}>{selectedProject.clients?.name}</div>
              </div>
            </div>
          )}

          {/* Label optional */}
          <div>
            <Label>Etiqueta interna (opcional)</Label>
            <input
              className="brv-input"
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder={selectedProject ? `Portal ${selectedProject.name}` : 'Ej: Portal fase diseño'}
            />
            <p style={{ fontSize:10, color:'var(--n40)', marginTop:4 }}>
              Solo lo ves tú. Para identificar el token en la lista.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding:'14px 24px', borderTop:'1px solid var(--rule)', display:'flex', justifyContent:'flex-end', gap:8, background:'var(--p)' }}>
          <button onClick={onClose} className="brv-btn brv-btn-ghost brv-btn-sm">Cancelar</button>
          <button
            onClick={handleSave}
            disabled={saving || !projectId}
            className="brv-btn brv-btn-coral brv-btn-sm"
            style={{ opacity: saving || !projectId ? .6 : 1 }}
          >
            {saving ? 'Generando...' : `Generar código ${preview}`}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function ClientPortal() {
  const [tokens,   setTokens]   = useState(MOCK_TOKENS)
  const [projects, setProjects] = useState(MOCK_PROJECTS)
  const [modal,    setModal]    = useState(false)
  const [copied,   setCopied]   = useState(null)
  const [filter,   setFilter]   = useState('activo')

  useEffect(() => {
    tokenDB.getAll().then(({ data }) => { if (data?.length) setTokens(data) }).catch(() => {})
    db.projects.getAll().then(({ data }) => { if (data?.length) setProjects(data) }).catch(() => {})
  }, [])

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text).catch(() => {
      const el = document.createElement('textarea')
      el.value = text
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    })
    setCopied(key ?? text)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleRevoke = async (id) => {
    if (!confirm('¿Revocar este acceso? El cliente no podrá entrar más.')) return
    await tokenDB.revoke(id).catch(() => {})
    setTokens(ts => ts.map(t => t.id === id ? { ...t, status: 'revocado' } : t))
  }

  const handleSave = async (form) => {
    const { data } = await tokenDB.create(form).catch(() => ({ data: null }))
    const proj     = projects.find(p => p.id === form.project_id)
    const newToken = data ?? {
      ...form,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      last_access: null,
      access_count: 0,
      projects: { name: proj?.name, status: proj?.status, progress: proj?.progress ?? 0, plan: proj?.plan, figma_url: proj?.figma_url, live_url: proj?.live_url },
      clients:  { name: proj?.clients?.name, email: proj?.clients?.email ?? '' },
    }
    setTokens(ts => [newToken, ...ts])
    setModal(false)
  }

  const filtered = tokens.filter(t => filter === 'todos' || t.status === filter)
  const activeCount  = tokens.filter(t => t.status === 'activo').length
  const neverOpened  = tokens.filter(t => t.status === 'activo' && t.access_count === 0).length

  return (
    <div style={{ maxWidth: 900 }}>

      {/* Heading */}
      <div style={{ marginBottom:24, display:'flex', alignItems:'flex-end', justifyContent:'space-between' }}>
        <div>
          <h2 style={{ fontFamily:'"Cormorant Garamond",serif', fontStyle:'italic', fontWeight:300, fontSize:30, letterSpacing:'-.02em', color:'var(--nv)' }}>
            Portal <em style={{ fontStyle:'normal', fontWeight:600, color:'var(--cr)' }}>de clientes.</em>
          </h2>
          <p style={{ fontSize:12, color:'var(--gy)', marginTop:4, fontWeight:300 }}>
            <strong style={{ color:'var(--nv)' }}>{activeCount}</strong> accesos activos
            {neverOpened > 0 && <> · <strong style={{ color:'var(--cr)' }}>{neverOpened}</strong> sin abrir aún</>}
          </p>
        </div>
        <button onClick={() => setModal(true)} className="brv-btn brv-btn-coral">
          <Plus size={14}/> Generar acceso
        </button>
      </div>

      {/* How it works — small info bar */}
      <div style={{ background:'var(--w)', border:'1px solid var(--rule)', borderRadius:10, padding:'12px 18px', marginBottom:20, display:'flex', alignItems:'center', gap:24, flexWrap:'wrap' }}>
        {[
          { n:'1', label:'Genera el código aquí', desc:'BRV-XXXXXX único por proyecto' },
          { n:'2', label:'Envíaselo al cliente',   desc:'Por WhatsApp o email' },
          { n:'3', label:'Cliente entra al portal', desc:'bravenweb.com/portal' },
          { n:'4', label:'Ve su proyecto en tiempo real', desc:'Estado, progreso, Figma, mensajes' },
        ].map((step, i) => (
          <div key={step.n} style={{ display:'flex', alignItems:'center', gap:8 }}>
            {i > 0 && <span style={{ color:'var(--rule)', fontSize:16 }}>→</span>}
            <div style={{ width:20, height:20, borderRadius:'50%', background:'var(--nv)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:800, color:'var(--p)', flexShrink:0 }}>{step.n}</div>
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:'var(--nv)' }}>{step.label}</div>
              <div style={{ fontSize:10, color:'var(--n40)' }}>{step.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:4, marginBottom:16 }}>
        {[['activo','Activos'],['revocado','Revocados'],['todos','Todos']].map(([val,lbl]) => (
          <button key={val} onClick={() => setFilter(val)} style={{ padding:'5px 11px', borderRadius:5, fontSize:11, fontWeight:700, cursor:'pointer', border:'1px solid', borderColor:filter===val?'var(--nv)':'var(--rule)', background:filter===val?'var(--nv)':'transparent', color:filter===val?'var(--p)':'var(--n40)', transition:'all .15s' }}>{lbl}</button>
        ))}
      </div>

      {/* Token grid */}
      {filtered.length === 0
        ? <EmptyState
            icon={Plus}
            title="Sin accesos generados"
            desc="Genera el primer código de acceso para que un cliente pueda ver su proyecto."
            action={<button onClick={() => setModal(true)} className="brv-btn brv-btn-navy brv-btn-sm">Generar acceso</button>}
          />
        : (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {filtered.map(tok => (
              <TokenCard
                key={tok.id}
                tok={tok}
                onRevoke={handleRevoke}
                onCopy={handleCopy}
                copied={copied}
              />
            ))}
          </div>
        )
      }

      {modal && <NewTokenModal onClose={() => setModal(false)} onSave={handleSave} projects={projects} />}
    </div>
  )
}
