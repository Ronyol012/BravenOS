import { useState, useEffect } from 'react'
import { Plus, X, Check } from 'lucide-react'
import { relativeDate, PRIORITY_CONFIG, TAG_CONFIG, C, normalizeTask } from '@/lib/utils'
import { db } from '@/lib/supabase'

const TAGS = ['diseño','dev','admin','cliente','ventas','finanzas','legal']
const PRIOS = Object.entries(PRIORITY_CONFIG).map(([k,v])=>({ value:k, label:v.label, color:v.color }))

const SEED = [
  { id:1, title:'Entregar wireframes — Clínica Familia Verde', tag:'diseño',   priority:'urgente', due_date: new Date().toISOString(),                     status:'pendiente' },
  { id:2, title:'Revisar contrato — Inmobiliaria Palma',       tag:'admin',    priority:'alta',    due_date: new Date().toISOString(),                     status:'pendiente' },
  { id:3, title:'Subir avance a portal — La Cazuela',          tag:'dev',      priority:'normal',  due_date: new Date(Date.now()+86400000).toISOString(),  status:'pendiente' },
  { id:4, title:'Enviar propuesta — Hotel Cibao Palace',       tag:'ventas',   priority:'alta',    due_date: new Date(Date.now()+518400000).toISOString(), status:'pendiente' },
  { id:5, title:'Factura — Academia Digital RD',               tag:'finanzas', priority:'normal',  due_date: new Date(Date.now()+604800000).toISOString(), status:'pendiente' },
  { id:6, title:'Diseñar sección héroe — Gym PowerFit',        tag:'diseño',   priority:'baja',    due_date: new Date(Date.now()+864000000).toISOString(), status:'pendiente' },
]

function Label({ children }) {
  return <label style={{ display:'block', fontSize:10, fontWeight:700, color:'var(--n40)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:5 }}>{children}</label>
}

function Modal({ onClose, onSave }) {
  const [form, setForm] = useState({ title:'', tag:'diseño', priority:'normal', due_date:new Date(Date.now()+86400000).toISOString().split('T')[0], description:'' })
  const [saving,setSaving]=useState(false)
  const set=(k,v)=>setForm(f=>({...f,[k]:v}))
  const handleSave=async()=>{ if(!form.title)return;setSaving(true);try{await onSave(form)}finally{setSaving(false)} }
  return(
    <div style={{ position:'fixed',inset:0,background:'rgba(18,24,42,.45)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:999,padding:24 }}>
      <div style={{ background:'var(--w)',borderRadius:20,width:'100%',maxWidth:460,overflow:'hidden',display:'flex',flexDirection:'column',border:'1px solid var(--rule)' }}>
        <div style={{ padding:'18px 22px 16px',borderBottom:'1px solid var(--rule)',position:'relative',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
          <div style={{ position:'absolute',top:0,left:0,right:0,height:2,background:'var(--cr)' }}/>
          <h3 style={{ fontFamily:'"Cormorant Garamond",serif',fontStyle:'italic',fontWeight:300,fontSize:21,color:'var(--nv)' }}>Nueva tarea</h3>
          <button onClick={onClose} style={{ background:'none',border:'none',cursor:'pointer',color:'var(--n40)',display:'flex' }}><X size={17}/></button>
        </div>
        <div style={{ padding:22,display:'flex',flexDirection:'column',gap:14 }}>
          <div><Label>Título de la tarea</Label><input className="brv-input" value={form.title} onChange={e=>set('title',e.target.value)} placeholder="Ej: Entregar wireframes — Cliente X" autoFocus /></div>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
            <div><Label>Prioridad</Label>
              <select className="brv-input" value={form.priority} onChange={e=>set('priority',e.target.value)}>
                {PRIOS.map(p=><option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div><Label>Etiqueta</Label>
              <select className="brv-input" value={form.tag} onChange={e=>set('tag',e.target.value)}>
                {TAGS.map(t=><option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div><Label>Fecha límite</Label><input className="brv-input" type="date" value={form.due_date} onChange={e=>set('due_date',e.target.value)} /></div>
          <div><Label>Descripción (opcional)</Label><textarea className="brv-input" rows={2} value={form.description||''} onChange={e=>set('description',e.target.value)} placeholder="Detalles adicionales..." style={{ resize:'vertical',lineHeight:1.6 }} /></div>
        </div>
        <div style={{ padding:'12px 22px',borderTop:'1px solid var(--rule)',display:'flex',justifyContent:'flex-end',gap:8,background:'var(--p)' }}>
          <button onClick={onClose} className="brv-btn brv-btn-ghost brv-btn-sm">Cancelar</button>
          <button onClick={handleSave} disabled={saving||!form.title} className="brv-btn brv-btn-navy brv-btn-sm">{saving?'Guardando...':'Crear tarea'}</button>
        </div>
      </div>
    </div>
  )
}

function TaskRow({ task, onToggle }) {
  const p   = PRIORITY_CONFIG[task.priority] ?? {}
  const t   = TAG_CONFIG[task.tag?.toLowerCase()] ?? { bg:'var(--n05)', text:'var(--n40)' }
  const done= task.status === 'completado'
  const isUrgent = !done && (task.priority === 'urgente')
  return(
    <div style={{ display:'flex',alignItems:'center',gap:12,padding:'11px 16px',borderBottom:'1px solid var(--rule)',background: isUrgent?'#ea696904':'transparent',transition:'background .12s' }}
      onMouseEnter={e=>{ if(!isUrgent) e.currentTarget.style.background='var(--n05)' }}
      onMouseLeave={e=>{ if(!isUrgent) e.currentTarget.style.background='transparent' }}
    >
      {/* Check button */}
      <button
        onClick={()=>onToggle(task.id)}
        style={{ width:18,height:18,borderRadius:4,border:`2px solid ${done?'var(--cr)':p.color||'var(--rule)'}`,background:done?'var(--cr)':'transparent',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,transition:'all .15s' }}
      >
        {done && <Check size={10} style={{ color:'#fff' }}/>}
      </button>
      {/* Content */}
      <div style={{ flex:1,minWidth:0 }}>
        <p style={{ fontSize:13,fontWeight:600,color:done?'var(--n40)':'var(--nv)',textDecoration:done?'line-through':'none',lineHeight:1.3 }}>
          {task.title}
        </p>
        <div style={{ display:'flex',alignItems:'center',gap:8,marginTop:4 }}>
          <span style={{ fontSize:9,fontWeight:700,padding:'2px 7px',borderRadius:100,background:t.bg,color:t.text,textTransform:'uppercase',letterSpacing:'.05em' }}>{task.tag}</span>
          <span style={{ fontSize:11,color:isUrgent?'var(--cr)':'var(--n40)',fontWeight:isUrgent?700:400 }}>{relativeDate(task.due_date)}</span>
        </div>
      </div>
      {/* Priority dot */}
      <span style={{ width:7,height:7,borderRadius:'50%',background:p.color,flexShrink:0 }} title={p.label}/>
    </div>
  )
}

export default function Tasks() {
  const [tasks,  setTasks]  = useState(SEED)
  const [modal,  setModal]  = useState(false)
  const [filter, setFilter] = useState('pendiente')
  const [tag,    setTag]    = useState('all')

  useEffect(()=>{ db.tasks.getAll().then(({data})=>{if(data?.length)setTasks(data.map(normalizeTask))}).catch(()=>{}) },[])

  const toggle = (id) => setTasks(ts => ts.map(t => t.id===id ? { ...t, status: t.status==='completado'?'pending': t.status==='done'?'pending':'done' } : t))
  const handleSave = async (form) => { setTasks(ts=>[...ts,{...form,id:Date.now(),status:'pendiente'}]); setModal(false) }

  const filtered = tasks.filter(t => {
    const matchStatus = filter==='all' || t.status===filter
    const matchTag    = tag==='all'    || t.tag===tag
    return matchStatus && matchTag
  })

  const pendingCount = tasks.filter(t=>t.status!=='completado').length
  const doneCount    = tasks.filter(t=>t.status==='completado').length
  const urgentCount  = tasks.filter(t=>t.status!=='completado'&&(t.priority==='urgente'||t.priority==='alta')).length

  return(
    <div style={{ maxWidth:900 }}>
      {/* Heading */}
      <div style={{ marginBottom:24,display:'flex',alignItems:'flex-end',justifyContent:'space-between' }}>
        <div>
          <h2 style={{ fontFamily:'"Cormorant Garamond",serif',fontStyle:'italic',fontWeight:300,fontSize:30,letterSpacing:'-.02em',color:'var(--nv)' }}>
            Tareas <em style={{ fontStyle:'normal',fontWeight:600,color:'var(--cr)' }}>pendientes.</em>
          </h2>
          <p style={{ fontSize:12,color:'var(--gy)',marginTop:4,fontWeight:300 }}>
            <strong style={{ color:'var(--nv)' }}>{pendingCount}</strong> pendientes · <strong style={{ color:'var(--cr)' }}>{urgentCount}</strong> urgentes/altas · <strong style={{ color:'#2a9d5c' }}>{doneCount}</strong> completadas
          </p>
        </div>
        <button onClick={()=>setModal(true)} className="brv-btn brv-btn-coral"><Plus size={14}/> Nueva tarea</button>
      </div>

      {/* Filters */}
      <div style={{ display:'flex',gap:10,marginBottom:16,alignItems:'center',flexWrap:'wrap' }}>
        <div style={{ display:'flex',gap:4 }}>
          {[['pendiente','Pendientes'],['completado','Completadas'],['all','Todas']].map(([val,lbl])=>(
            <button key={val} onClick={()=>setFilter(val)} style={{ padding:'5px 11px',borderRadius:5,fontSize:11,fontWeight:700,cursor:'pointer',border:'1px solid',borderColor:filter===val?'var(--nv)':'var(--rule)',background:filter===val?'var(--nv)':'transparent',color:filter===val?'var(--p)':'var(--n40)',transition:'all .15s' }}>{lbl}</button>
          ))}
        </div>
        <div style={{ width:1,height:20,background:'var(--rule)' }}/>
        <div style={{ display:'flex',gap:4,flexWrap:'wrap' }}>
          <button onClick={()=>setTag('all')} style={{ padding:'5px 9px',borderRadius:5,fontSize:10,fontWeight:700,cursor:'pointer',border:'1px solid',borderColor:tag==='all'?'var(--bl)':'var(--rule)',background:tag==='all'?`${C.blue}12`:'transparent',color:tag==='all'?C.blue:'var(--n40)',transition:'all .15s' }}>Todos</button>
          {TAGS.map(t=>{
            const cfg=TAG_CONFIG[t]??{bg:'var(--n05)',text:'var(--n40)'}
            return <button key={t} onClick={()=>setTag(t)} style={{ padding:'5px 9px',borderRadius:5,fontSize:10,fontWeight:700,cursor:'pointer',border:'1px solid',borderColor:tag===t?cfg.text:'var(--rule)',background:tag===t?cfg.bg:'transparent',color:tag===t?cfg.text:'var(--n40)',transition:'all .15s',textTransform:'capitalize' }}>{t}</button>
          })}
        </div>
      </div>

      {/* Task list */}
      <div className="brv-card" style={{ padding:0,overflow:'hidden' }}>
        {filtered.length===0
          ? <div style={{ padding:'48px',textAlign:'center',color:'var(--n40)',fontSize:13 }}>No hay tareas con estos filtros.</div>
          : filtered.map(t => <TaskRow key={t.id} task={t} onToggle={toggle} />)
        }
      </div>

      {modal && <Modal onClose={()=>setModal(false)} onSave={handleSave} />}
    </div>
  )
}
