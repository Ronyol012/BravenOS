import { useState, useEffect } from 'react'
import { Plus, X, ArrowRight } from 'lucide-react'
import { formatDOP, LEAD_STAGES, PLAN_CONFIG, C } from '@/lib/utils'
import { db } from '@/lib/supabase'

const STAGES = ['nuevo','contactado','reunion','propuesta','negociacion','ganado','perdido']
const PLANS  = ['BRV-01','BRV-02','BRV-03','BRV-04']

const SEED = [
  { id:1, name:'Luis Fermín',    business:'Hotel Cibao Palace',      stage:'propuesta',   estimated_value:38000, plan_interest:'BRV-04', phone:'809-555-0201', sector:'turismo',   notes:'Necesita checkout reservas.' },
  { id:2, name:'Raúl Peña',      business:'Gym PowerFit SD',          stage:'reunion',     estimated_value:15000, plan_interest:'BRV-02', phone:'829-555-0202', sector:'servicios', notes:'Reunión agendada martes 22.' },
  { id:3, name:'Dra. Castillo',  business:'Bufete Castillo & Asoc.', stage:'nuevo',        estimated_value:25000, plan_interest:'BRV-03', phone:'849-555-0203', sector:'servicios', notes:'Lead frío. Contactar esta semana.' },
  { id:4, name:'Sandra Moya',    business:'EcoTienda Natural',        stage:'negociacion', estimated_value:11000, plan_interest:'BRV-01', phone:'809-555-0204', sector:'alimentos', notes:'Pide descuento. Mantener precio.' },
  { id:5, name:'Lic. Montero',   business:'Escuela Bilingüe Montero', stage:'contactado',  estimated_value:25000, plan_interest:'BRV-03', phone:'809-555-0205', sector:'servicios', notes:'Pidió propuesta para mayo.' },
]

function Label({ children }) {
  return <label style={{ display:'block', fontSize:10, fontWeight:700, color:'var(--n40)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:5 }}>{children}</label>
}

function LeadCard({ lead, onOpen, onMove }) {
  const stage = LEAD_STAGES[lead.stage]
  const stageIdx = STAGES.indexOf(lead.stage)
  const canNext = stageIdx < STAGES.length - 1 && lead.stage !== 'ganado' && lead.stage !== 'perdido'
  return (
    <div
      onClick={() => onOpen(lead)}
      style={{ background:'var(--w)', border:'1px solid var(--rule)', borderRadius:10, padding:'14px 14px 12px', cursor:'pointer', marginBottom:8, transition:'border-color .15s, transform .15s' }}
      onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--nv)';e.currentTarget.style.transform='translateY(-1px)'}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--rule)';e.currentTarget.style.transform='none'}}
    >
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
        <div>
          <p style={{ fontWeight:700, fontSize:13, letterSpacing:'-.03em', color:'var(--nv)', lineHeight:1.2 }}>{lead.name}</p>
          <p style={{ fontSize:11, color:'var(--n40)', fontWeight:300, marginTop:2 }}>{lead.business}</p>
        </div>
        {lead.plan_interest && (
          <span style={{ fontSize:9, fontWeight:700, padding:'2px 7px', borderRadius:100, textTransform:'uppercase', letterSpacing:'.05em', background:'var(--nv)', color:'var(--p)' }}>
            {PLAN_CONFIG[lead.plan_interest]?.label}
          </span>
        )}
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontFamily:'"JetBrains Mono",monospace', fontSize:13, fontWeight:500, color:'var(--nv)' }}>
          {formatDOP(lead.estimated_value)}
        </span>
        {canNext && (
          <button
            onClick={e => { e.stopPropagation(); onMove(lead, STAGES[stageIdx+1]) }}
            style={{ background:'none', border:'1px solid var(--rule)', borderRadius:5, padding:'3px 7px', cursor:'pointer', fontSize:10, color:'var(--n40)', display:'flex', alignItems:'center', gap:4, transition:'all .15s' }}
            onMouseEnter={e=>{e.currentTarget.style.background='var(--nv)';e.currentTarget.style.color='var(--p)';e.currentTarget.style.borderColor='var(--nv)'}}
            onMouseLeave={e=>{e.currentTarget.style.background='none';e.currentTarget.style.color='var(--n40)';e.currentTarget.style.borderColor='var(--rule)'}}
            title="Avanzar etapa"
          >
            <ArrowRight size={10} /> Avanzar
          </button>
        )}
      </div>
    </div>
  )
}

function Modal({ lead, onClose, onSave }) {
  const isNew = !lead?.id
  const [form, setForm] = useState(lead ?? { name:'', business:'', phone:'', email:'', sector:'servicios', stage:'nuevo', estimated_value:'', plan_interest:'BRV-01', notes:'' })
  const [saving, setSaving] = useState(false)
  const set = (k,v) => setForm(f=>({...f,[k]:v}))
  const handleSave = async () => { if(!form.name) return; setSaving(true); try{ await onSave(form) }finally{ setSaving(false) } }
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(18,24,42,.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999, padding:24 }}>
      <div style={{ background:'var(--w)', borderRadius:20, width:'100%', maxWidth:500, maxHeight:'88vh', overflow:'hidden', display:'flex', flexDirection:'column', border:'1px solid var(--rule)' }}>
        <div style={{ padding:'18px 22px 16px', borderBottom:'1px solid var(--rule)', position:'relative', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'var(--cr)' }} />
          <h3 style={{ fontFamily:'"Cormorant Garamond",serif', fontStyle:'italic', fontWeight:300, fontSize:21, color:'var(--nv)' }}>{isNew?'Nuevo lead':form.name}</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--n40)', display:'flex' }}><X size={17}/></button>
        </div>
        <div style={{ overflowY:'auto', padding:22, display:'flex', flexDirection:'column', gap:14 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div><Label>Nombre</Label><input className="brv-input" value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Luis Fermín" /></div>
            <div><Label>Negocio</Label><input className="brv-input" value={form.business||''} onChange={e=>set('business',e.target.value)} placeholder="Hotel Cibao Palace" /></div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div><Label>Teléfono/WhatsApp</Label><input className="brv-input" value={form.phone||''} onChange={e=>set('phone',e.target.value)} placeholder="809-555-0200" /></div>
            <div><Label>Email</Label><input className="brv-input" value={form.email||''} onChange={e=>set('email',e.target.value)} placeholder="correo@empresa.do" /></div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
            <div><Label>Etapa</Label>
              <select className="brv-input" value={form.stage} onChange={e=>set('stage',e.target.value)}>
                {STAGES.map(s=><option key={s} value={s}>{LEAD_STAGES[s]?.label}</option>)}
              </select>
            </div>
            <div><Label>Plan de interés</Label>
              <select className="brv-input" value={form.plan_interest||'BRV-01'} onChange={e=>set('plan_interest',e.target.value)}>
                {PLANS.map(p=><option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div><Label>Valor estimado (DOP)</Label><input className="brv-input" type="number" value={form.estimated_value||''} onChange={e=>set('estimated_value',e.target.value)} placeholder="11000" /></div>
          </div>
          <div><Label>Notas</Label><textarea className="brv-input" rows={3} value={form.notes||''} onChange={e=>set('notes',e.target.value)} placeholder="Observaciones, acuerdos, próximos pasos..." style={{ resize:'vertical', lineHeight:1.6 }} /></div>
        </div>
        <div style={{ padding:'12px 22px', borderTop:'1px solid var(--rule)', display:'flex', justifyContent:'flex-end', gap:8, background:'var(--p)' }}>
          <button onClick={onClose} className="brv-btn brv-btn-ghost brv-btn-sm">Cancelar</button>
          <button onClick={handleSave} disabled={saving||!form.name} className="brv-btn brv-btn-navy brv-btn-sm">{saving?'Guardando...':isNew?'Crear lead':'Guardar'}</button>
        </div>
      </div>
    </div>
  )
}

export default function Pipeline() {
  const [leads, setLeads] = useState(SEED)
  const [modal, setModal] = useState(null)

  useEffect(() => { db.leads.getAll().then(({data})=>{if(data?.length)setLeads(data)}).catch(()=>{}) }, [])

  const handleSave = async (form) => {
    if(form.id) setLeads(ls=>ls.map(l=>l.id===form.id?{...l,...form}:l))
    else        setLeads(ls=>[...ls,{...form,id:Date.now()}])
    setModal(null)
  }
  const handleMove = (lead, newStage) => setLeads(ls=>ls.map(l=>l.id===lead.id?{...l,stage:newStage}:l))

  const totalPipeline = leads.filter(l=>!['ganado','perdido'].includes(l.stage)).reduce((s,l)=>s+Number(l.estimated_value||0),0)
  const ganados       = leads.filter(l=>l.stage==='ganado').reduce((s,l)=>s+Number(l.estimated_value||0),0)

  const activeStages = STAGES.filter(s => s !== 'perdido')

  return (
    <div style={{ maxWidth:1400 }}>
      {/* Heading */}
      <div style={{ marginBottom:20, display:'flex', alignItems:'flex-end', justifyContent:'space-between' }}>
        <div>
          <h2 style={{ fontFamily:'"Cormorant Garamond",serif', fontStyle:'italic', fontWeight:300, fontSize:30, letterSpacing:'-.02em', color:'var(--nv)' }}>
            Pipeline <em style={{ fontStyle:'normal', fontWeight:600, color:'var(--cr)' }}>CRM.</em>
          </h2>
          <p style={{ fontSize:12, color:'var(--gy)', marginTop:4, fontWeight:300 }}>
            Pipeline activo: <strong style={{ color:'var(--nv)', fontFamily:'"JetBrains Mono",monospace' }}>{formatDOP(totalPipeline)}</strong>
            <span style={{ margin:'0 8px', color:'var(--rule)' }}>·</span>
            Ganados: <strong style={{ color:'#2a9d5c', fontFamily:'"JetBrains Mono",monospace' }}>{formatDOP(ganados)}</strong>
          </p>
        </div>
        <button onClick={()=>setModal({})} className="brv-btn brv-btn-coral"><Plus size={14}/> Nuevo lead</button>
      </div>

      {/* Kanban board */}
      <div style={{ display:'flex', gap:10, overflowX:'auto', paddingBottom:8 }}>
        {activeStages.map(stage => {
          const cfg      = LEAD_STAGES[stage]
          const colLeads = leads.filter(l => l.stage === stage)
          const colVal   = colLeads.reduce((s,l)=>s+Number(l.estimated_value||0),0)
          const isGanado = stage === 'ganado'
          return (
            <div key={stage} style={{ minWidth:220, maxWidth:240, flex:'0 0 220px' }}>
              {/* Column header */}
              <div style={{ padding:'10px 12px', marginBottom:8, borderRadius:8, background:'var(--w)', border:'1px solid var(--rule)' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
                  <span style={{ fontSize:11, fontWeight:700, color: isGanado ? '#2a9d5c' : cfg.color, textTransform:'uppercase', letterSpacing:'.06em' }}>
                    {cfg.label}
                  </span>
                  <span style={{ fontSize:11, fontWeight:800, color:'var(--nv)', background:'var(--n05)', borderRadius:100, padding:'1px 6px' }}>
                    {colLeads.length}
                  </span>
                </div>
                {colVal > 0 && (
                  <p style={{ fontSize:11, fontFamily:'"JetBrains Mono",monospace', color:'var(--n40)', fontWeight:500 }}>
                    {formatDOP(colVal)}
                  </p>
                )}
              </div>

              {/* Cards */}
              <div style={{ minHeight:80 }}>
                {colLeads.map(l => <LeadCard key={l.id} lead={l} onOpen={setModal} onMove={handleMove} />)}
              </div>

              {/* Add button per column */}
              <button
                onClick={()=>setModal({ stage })}
                style={{ width:'100%', padding:'7px', background:'transparent', border:'1px dashed var(--rule)', borderRadius:8, cursor:'pointer', color:'var(--n40)', fontSize:11, fontWeight:600, transition:'all .15s', display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--nv)';e.currentTarget.style.color='var(--nv)'}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--rule)';e.currentTarget.style.color='var(--n40)'}}
              >
                <Plus size={11}/> Añadir
              </button>
            </div>
          )
        })}

        {/* Perdidos column (collapsed) */}
        <div style={{ minWidth:160, flex:'0 0 160px' }}>
          <div style={{ padding:'10px 12px', marginBottom:8, borderRadius:8, background:'var(--p2)', border:'1px solid var(--rule)', opacity:.6 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <span style={{ fontSize:11, fontWeight:700, color:'var(--n40)', textTransform:'uppercase', letterSpacing:'.06em' }}>Perdidos</span>
              <span style={{ fontSize:11, fontWeight:800, color:'var(--n40)', background:'var(--n05)', borderRadius:100, padding:'1px 6px' }}>
                {leads.filter(l=>l.stage==='perdido').length}
              </span>
            </div>
          </div>
          {leads.filter(l=>l.stage==='perdido').map(l => (
            <div key={l.id} onClick={()=>setModal(l)} style={{ background:'var(--p2)', border:'1px solid var(--rule)', borderRadius:8, padding:'10px 12px', marginBottom:6, cursor:'pointer', opacity:.5 }}>
              <p style={{ fontWeight:600, fontSize:12, color:'var(--nv)' }}>{l.name}</p>
              <p style={{ fontSize:10, color:'var(--n40)' }}>{formatDOP(l.estimated_value)}</p>
            </div>
          ))}
        </div>
      </div>

      {modal !== null && <Modal lead={modal?.id ? modal : (modal?.stage ? { stage:modal.stage } : null)} onClose={()=>setModal(null)} onSave={handleSave} />}
    </div>
  )
}
