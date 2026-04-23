import { useState, useEffect } from 'react'
import { Plus, X, ExternalLink, Github, Globe, ChevronDown, Search } from 'lucide-react'
import { SectionHeader, StatusBadge, PlanBadge, ProgressBar, EmptyState, Card } from '@/components/shared'
import { formatDOP, formatDate, relativeDate, STATUS_CONFIG, PLAN_CONFIG, C, normalizeProject } from '@/lib/utils'
import { db } from '@/lib/supabase'

const PHASES = ['Briefing','Wireframe','Diseño Figma','Aprobación cliente','Desarrollo','QA','Entrega']

const PLANS  = ['BRV-01','BRV-02','BRV-03','BRV-04']
const STATUSES = Object.entries(STATUS_CONFIG).map(([k,v]) => ({ value:k, label:v.label }))

const SEED = [
  { id:1, name:'Clínica Familia Verde',      clients:{name:'Dr. Javier Matos'}, plan:'BRV-02', status:'diseno',     progress:65,  value_dop:15000, paid_amount:9000,  due_date:'2025-04-25', figma_url:'', live_url:'', notes:'' },
  { id:2, name:'Restaurante La Cazuela',     clients:{name:'María Rodríguez'},  plan:'BRV-01', status:'desarrollo', progress_pct:80, total_amount:11000, paid_amount:11000, due_date:'2025-04-20', figma_url:'', live_url:'', notes:'' },
  { id:3, name:'Portal Inmobiliaria Palma',  clients:{name:'Carlos Sosa'},      plan:'BRV-04', status:'revision',   progress_pct:92, total_amount:38000, paid_amount:19000, due_date:'2025-04-18', figma_url:'', live_url:'', notes:'' },
  { id:4, name:'Plataforma Academia Digital',clients:{name:'Ana Herrera'},      plan:'BRV-02', status:'kickoff',    progress_pct:12, total_amount:15000, paid_amount:9000,  due_date:'2025-05-10', figma_url:'', live_url:'', notes:'' },
  { id:5, name:'Catálogo Online Don Pepe',   clients:{name:'Pedro García'},     plan:'BRV-01', status:'finalizado', progress_pct:100,total_amount:11000, paid_amount:11000, due_date:'2025-03-30', figma_url:'', live_url:'https://donpepe.netlify.app', notes:'' },
]

/* ── helpers ────────────────────────────────────────────────── */
function inp(style) {
  return { ...style, fontFamily:'inherit' }
}
function Label({ children }) {
  return <label style={{ display:'block', fontSize:10, fontWeight:700, color:'var(--n40)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:5 }}>{children}</label>
}
function Row({ children, gap=12 }) {
  return <div style={{ display:'grid', gridTemplateColumns:`repeat(${children.length},1fr)`, gap }}>{children}</div>
}

/* ── Project card ───────────────────────────────────────────── */
function ProjectCard({ p, onOpen }) {
  const pct    = p.progress ?? 0
  const paid   = Number(p.paid_amount ?? 0)
  const total  = Number(p.value_dop  ?? 0)
  const pending= total - paid

  return (
    <div
      onClick={() => onOpen(p)}
      style={{ background:'var(--w)', border:'1px solid var(--rule)', borderRadius:14, padding:'20px 22px', cursor:'pointer', transition:'border-color .18s, transform .18s' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor='var(--nv)'; e.currentTarget.style.transform='translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor='var(--rule)'; e.currentTarget.style.transform='none' }}
    >
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
        <div>
          <p style={{ fontWeight:800, fontSize:14, letterSpacing:'-.03em', color:'var(--nv)', lineHeight:1.2, marginBottom:3 }}>{p.name}</p>
          <p style={{ fontSize:12, color:'var(--n40)', fontWeight:300 }}>{p.clients?.name}</p>
        </div>
        <PlanBadge plan={p.plan} />
      </div>

      {/* Progress */}
      <div style={{ marginBottom:12 }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
          <StatusBadge status={p.status} />
          <span style={{ fontSize:11, fontFamily:'"JetBrains Mono",monospace', color:'var(--n40)' }}>{pct}%</span>
        </div>
        <ProgressBar value={pct} />
      </div>

      {/* Footer */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:10, borderTop:'1px solid var(--rule)' }}>
        <div>
          <span style={{ fontFamily:'"JetBrains Mono",monospace', fontWeight:500, fontSize:13, color:'var(--nv)' }}>{formatDOP(total)}</span>
          {pending > 0 && (
            <span style={{ fontSize:10, color:'var(--cr)', fontWeight:700, marginLeft:8 }}>· Pendiente: {formatDOP(pending)}</span>
          )}
        </div>
        {p.due_date && (
          <span style={{ fontSize:10, color:'var(--n40)' }}>{relativeDate(p.due_date)}</span>
        )}
      </div>
    </div>
  )
}

/* ── Modal ──────────────────────────────────────────────────── */
function Modal({ project, onClose, onSave }) {
  const isNew = !project?.id
  const [form, setForm] = useState(project ?? {
    name:'', plan:'BRV-01', status:'kickoff', progress:0,
    value_dop:'', paid_amount:'', due_date:'',
    figma_url:'', live_url:'', notes:'',
  })
  const [phases, setPhases] = useState(
    PHASES.map((ph,i) => ({ phase:ph, completed: i < Math.floor((form.progress||0)/100*PHASES.length), order_index:i }))
  )
  const [saving, setSaving] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]:v }))

  // Sync progress from phases
  const togglePhase = (i) => {
    const next = phases.map((p,idx) => idx === i ? { ...p, completed:!p.completed } : p)
    setPhases(next)
    const done  = next.filter(p => p.completed).length
    const pct   = Math.round((done / next.length) * 100)
    setForm(f => ({ ...f, progress:pct }))
  }

  const handleSave = async () => {
    if (!form.name) return
    setSaving(true)
    try { await onSave(form) } finally { setSaving(false) }
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(18,24,42,.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999, padding:24 }}>
      <div style={{ background:'var(--w)', borderRadius:20, width:'100%', maxWidth:680, maxHeight:'90vh', overflow:'hidden', display:'flex', flexDirection:'column', border:'1px solid var(--rule)' }}>

        {/* Modal header — coral top bar */}
        <div style={{ padding:'20px 24px 18px', borderBottom:'1px solid var(--rule)', position:'relative' }}>
          <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'var(--cr)' }} />
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div>
              <h3 style={{ fontFamily:'"Cormorant Garamond",serif', fontStyle:'italic', fontWeight:300, fontSize:22, letterSpacing:'-.02em', color:'var(--nv)' }}>
                {isNew ? 'Nuevo proyecto' : form.name}
              </h3>
              {!isNew && <p style={{ fontSize:11, color:'var(--n40)', fontWeight:300, marginTop:2 }}>{form.clients?.name}</p>}
            </div>
            <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--n40)', padding:4, borderRadius:5, display:'flex' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ overflowY:'auto', padding:24, flex:1, display:'flex', flexDirection:'column', gap:18 }}>

          {/* Name */}
          <div>
            <Label>Nombre del proyecto</Label>
            <input className="brv-input" value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Web Clínica Familia Verde" />
          </div>

          <Row>
            <div>
              <Label>Plan</Label>
              <select className="brv-input" value={form.plan} onChange={e=>set('plan',e.target.value)}>
                {PLANS.map(p => <option key={p} value={p}>{p} — {PLAN_CONFIG[p]?.label}</option>)}
              </select>
            </div>
            <div>
              <Label>Estado</Label>
              <select className="brv-input" value={form.status} onChange={e=>set('status',e.target.value)}>
                {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </Row>

          <Row>
            <div>
              <Label>Valor total (DOP)</Label>
              <input className="brv-input" type="number" value={form.value_dop} onChange={e=>set('value_dop',e.target.value)} placeholder="11000" />
            </div>
            <div>
              <Label>Monto cobrado (DOP)</Label>
              <input className="brv-input" type="number" value={form.paid_amount} onChange={e=>set('paid_amount',e.target.value)} placeholder="6600" />
            </div>
          </Row>

          <Row>
            <div>
              <Label>Fecha límite</Label>
              <input className="brv-input" type="date" value={form.due_date || ''} onChange={e=>set('due_date',e.target.value)} />
            </div>
            <div>
              <Label>Progreso manual (%)</Label>
              <input className="brv-input" type="number" min="0" max="100" value={form.progress} onChange={e=>set('progress',Number(e.target.value))} />
            </div>
          </Row>

          <Row>
            <div>
              <Label>URL Figma</Label>
              <input className="brv-input" value={form.figma_url||''} onChange={e=>set('figma_url',e.target.value)} placeholder="https://figma.com/..." />
            </div>
            <div>
              <Label>URL en producción</Label>
              <input className="brv-input" value={form.live_url||''} onChange={e=>set('live_url',e.target.value)} placeholder="https://cliente.netlify.app" />
            </div>
          </Row>

          {/* Phases checklist — el corazón del proceso Braven */}
          <div>
            <Label>Fases del proyecto</Label>
            <div style={{ background:'var(--p)', borderRadius:10, border:'1px solid var(--rule)', overflow:'hidden' }}>
              {phases.map((ph, i) => (
                <label
                  key={ph.phase}
                  style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', borderBottom: i < phases.length-1 ? '1px solid var(--rule)' : 'none', cursor:'pointer', transition:'background .12s' }}
                  onMouseEnter={e=>e.currentTarget.style.background='var(--w)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                >
                  <div
                    onClick={() => togglePhase(i)}
                    style={{ width:16, height:16, borderRadius:4, border:`2px solid ${ph.completed ? 'var(--cr)' : 'var(--rule)'}`, background: ph.completed ? 'var(--cr)' : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all .15s', cursor:'pointer' }}
                  >
                    {ph.completed && <svg width="9" height="9" viewBox="0 0 12 12" fill="white"><path d="M1 6l4 4 6-8"/></svg>}
                  </div>
                  <span style={{ fontSize:13, color: ph.completed ? 'var(--nv)' : 'var(--n40)', fontWeight: ph.completed ? 600 : 400, textDecoration: ph.completed ? 'none' : 'none', flex:1 }}>
                    {ph.phase}
                  </span>
                  <span style={{ fontSize:9, color:'var(--n40)', fontFamily:'"JetBrains Mono",monospace' }}>
                    {i+1}/{PHASES.length}
                  </span>
                </label>
              ))}
            </div>
            <p style={{ fontSize:10, color:'var(--n40)', marginTop:5 }}>
              Marcar fases actualiza el progreso automáticamente — actualmente {form.progress}%
            </p>
          </div>

          <div>
            <Label>Notas internas</Label>
            <textarea className="brv-input" rows={3} value={form.notes||''} onChange={e=>set('notes',e.target.value)} placeholder="Observaciones, links adicionales, acuerdos..." style={{ resize:'vertical', lineHeight:1.6 }} />
          </div>

          {/* Links row */}
          {(form.figma_url || form.live_url) && (
            <div style={{ display:'flex', gap:8 }}>
              {form.figma_url && <a href={form.figma_url} target="_blank" rel="noreferrer" className="brv-btn brv-btn-ghost brv-btn-sm" style={{ fontSize:11 }}><ExternalLink size={11} /> Figma</a>}
              {form.live_url  && <a href={form.live_url}  target="_blank" rel="noreferrer" className="brv-btn brv-btn-navy  brv-btn-sm" style={{ fontSize:11 }}><Globe      size={11} /> Ver sitio</a>}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding:'14px 24px', borderTop:'1px solid var(--rule)', display:'flex', justifyContent:'flex-end', gap:8, background:'var(--p)' }}>
          <button onClick={onClose} className="brv-btn brv-btn-ghost brv-btn-sm">Cancelar</button>
          <button onClick={handleSave} disabled={saving} className="brv-btn brv-btn-navy brv-btn-sm" style={{ opacity:saving?.75:1 }}>
            {saving ? 'Guardando...' : isNew ? 'Crear proyecto' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Main page ──────────────────────────────────────────────── */
export default function Projects() {
  const [projects, setProjects] = useState(SEED)
  const [modal,    setModal]    = useState(null)   // null | {} | project
  const [search,   setSearch]   = useState('')
  const [filter,   setFilter]   = useState('all')

  useEffect(() => {
    db.projects.getAll().then(({ data }) => { if (data?.length) setProjects(data.map(normalizeProject)) }).catch(()=>{})
  }, [])

  const filtered = projects.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || (p.clients?.name ?? '').toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || (p.status ?? p.stage) === filter
    return matchSearch && matchFilter
  })

  const handleSave = async (form) => {
    if (form.id) {
      const { data } = await db.projects.update(form.id, form).catch(() => ({ data: null }))
      setProjects(ps => ps.map(p => p.id === form.id ? { ...p, ...form } : p))
    } else {
      setProjects(ps => [...ps, { ...form, id: Date.now(), clients: { name: '' } }])
    }
    setModal(null)
  }

  const statCounts = {
    all:        projects.length,
    diseno:     projects.filter(p=>p.status==='diseno').length,
    desarrollo: projects.filter(p=>p.status==='desarrollo').length,
    revision:   projects.filter(p=>p.status==='revision').length,
    finalizado: projects.filter(p=>(p.status ?? p.stage) === 'delivered' || (p.status ?? p.stage) === 'finalizado').length,
  }

  return (
    <div style={{ maxWidth:1200 }}>

      {/* Page heading */}
      <div style={{ marginBottom:24, display:'flex', alignItems:'flex-end', justifyContent:'space-between' }}>
        <div>
          <h2 style={{ fontFamily:'"Cormorant Garamond",serif', fontStyle:'italic', fontWeight:300, fontSize:30, letterSpacing:'-.02em', color:'var(--nv)', lineHeight:1 }}>
            Proyectos <em style={{ fontStyle:'normal', fontWeight:600, color:'var(--cr)' }}>activos.</em>
          </h2>
          <p style={{ fontSize:12, color:'var(--gy)', marginTop:4, fontWeight:300 }}>
            {projects.filter(p=>(p.status ?? p.stage) !== 'delivered' && (p.status ?? p.stage) !== 'finalizado' && (p.status ?? p.stage) !== 'cancelled').length} en curso · {projects.filter(p=>(p.status ?? p.stage) === 'delivered' || (p.status ?? p.stage) === 'finalizado').length} finalizados
          </p>
        </div>
        <button onClick={() => setModal({})} className="brv-btn brv-btn-coral">
          <Plus size={14} /> Nuevo proyecto
        </button>
      </div>

      {/* Filters + Search */}
      <div style={{ display:'flex', gap:10, marginBottom:20, alignItems:'center' }}>
        <div style={{ position:'relative', flex:1, maxWidth:280 }}>
          <Search size={13} style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', color:'var(--n40)' }} />
          <input
            className="brv-input"
            style={{ paddingLeft:32, fontSize:13 }}
            placeholder="Buscar proyecto o cliente..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display:'flex', gap:4 }}>
          {[['all','Todos'],['diseno','Diseño'],['desarrollo','Dev'],['revision','Revisión'],['finalizado','Entregados']].map(([val,lbl]) => (
            <button
              key={val}
              onClick={() => setFilter(val)}
              style={{
                padding:'5px 11px', borderRadius:5, fontSize:11, fontWeight:700,
                cursor:'pointer', border:'1px solid',
                borderColor: filter===val ? 'var(--nv)' : 'var(--rule)',
                background:  filter===val ? 'var(--nv)' : 'transparent',
                color:       filter===val ? 'var(--p)'  : 'var(--n40)',
                transition:'all .15s',
              }}
            >
              {lbl} {statCounts[val] ? `(${statCounts[val]})` : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0
        ? <EmptyState icon={Plus} title="Sin proyectos" desc="Crea el primer proyecto para empezar." action={<button onClick={()=>setModal({})} className="brv-btn brv-btn-navy brv-btn-sm">Crear proyecto</button>} />
        : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:14 }}>
            {filtered.map(p => <ProjectCard key={p.id} p={p} onOpen={setModal} />)}
          </div>
        )
      }

      {/* Summary bar */}
      <div style={{ marginTop:20, display:'grid', gridTemplateColumns:'repeat(4,1fr)', border:'1px solid var(--rule)', borderRadius:14, overflow:'hidden', background:'var(--w)' }}>
        {[
          { label:'Valor total proyectos', val:formatDOP(projects.reduce((s,p)=>s+Number(p.value_dop||0),0)) },
          { label:'Cobrado',               val:formatDOP(projects.reduce((s,p)=>s+Number(p.paid_amount||0),0)) },
          { label:'Por cobrar',            val:formatDOP(projects.reduce((s,p)=>s+Math.max(0,Number(p.value_dop||0)-Number(p.paid_amount||0)),0)) },
          { label:'Proyectos totales',     val:projects.length },
        ].map(({ label, val }, i) => (
          <div key={label} style={{ padding:'18px 22px', borderRight: i<3 ? '1px solid var(--rule)' : 'none' }}>
            <div style={{ fontSize:10, fontWeight:700, color:'var(--n40)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:4 }}>{label}</div>
            <div style={{ fontFamily:'"Plus Jakarta Sans"', fontWeight:800, fontSize:18, letterSpacing:'-.04em', color:'var(--nv)' }}>{val}</div>
          </div>
        ))}
      </div>

      {modal !== null && <Modal project={modal?.id ? modal : null} onClose={()=>setModal(null)} onSave={handleSave} />}
    </div>
  )
}
