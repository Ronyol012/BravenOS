import { useState, useEffect } from 'react'
import { Plus, X, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import { formatDOP, formatDate, C } from '@/lib/utils'
import { db } from '@/lib/supabase'

const CATS_IN  = ['proyecto','mantenimiento','otro']
const CATS_OUT = ['herramienta','operación','nómina','marketing','otro']

const SEED = [
  { id:1,  type:'ingreso', category:'proyecto',    description:'Adelanto 60% — Clínica Familia Verde',   amount_dop:9000,  date:'2025-04-01', payment_method:'transferencia' },
  { id:2,  type:'ingreso', category:'proyecto',    description:'Pago total — Restaurante La Cazuela',    amount_dop:11000, date:'2025-03-28', payment_method:'transferencia' },
  { id:3,  type:'ingreso', category:'proyecto',    description:'Adelanto 50% — Inmobiliaria Palma',      amount_dop:19000, date:'2025-04-05', payment_method:'transferencia' },
  { id:4,  type:'ingreso', category:'proyecto',    description:'Adelanto 60% — Academia Digital RD',     amount_dop:9000,  date:'2025-04-10', payment_method:'transferencia' },
  { id:5,  type:'ingreso', category:'proyecto',    description:'Pago total — Ferretería Don Pepe',       amount_dop:11000, date:'2025-03-15', payment_method:'efectivo'      },
  { id:6,  type:'egreso',  category:'herramienta', description:'Netlify Pro (mensual)',                   amount_dop:2200,  date:'2025-04-01', payment_method:'tarjeta'       },
  { id:7,  type:'egreso',  category:'herramienta', description:'Supabase Pro (mensual)',                  amount_dop:2800,  date:'2025-04-01', payment_method:'tarjeta'       },
  { id:8,  type:'egreso',  category:'herramienta', description:'Figma Profesional (mensual)',             amount_dop:1800,  date:'2025-04-01', payment_method:'tarjeta'       },
  { id:9,  type:'egreso',  category:'operación',   description:'Dominio bravenweb.com (anual)',           amount_dop:950,   date:'2025-03-01', payment_method:'tarjeta'       },
]

function Label({ children }) {
  return <label style={{ display:'block', fontSize:10, fontWeight:700, color:'var(--n40)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:5 }}>{children}</label>
}

function Modal({ onClose, onSave }) {
  const [form, setForm] = useState({ type:'ingreso', category:'proyecto', description:'', amount_dop:'', date: new Date().toISOString().split('T')[0], payment_method:'transferencia', notes:'' })
  const [saving, setSaving] = useState(false)
  const set = (k,v) => setForm(f=>({...f,[k]:v}))
  const cats = form.type === 'ingreso' ? CATS_IN : CATS_OUT
  const handleSave = async () => { if(!form.description||!form.amount_dop) return; setSaving(true); try{ await onSave(form) }finally{ setSaving(false) } }
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(18,24,42,.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999, padding:24 }}>
      <div style={{ background:'var(--w)', borderRadius:20, width:'100%', maxWidth:480, overflow:'hidden', display:'flex', flexDirection:'column', border:'1px solid var(--rule)' }}>
        <div style={{ padding:'18px 22px 16px', borderBottom:'1px solid var(--rule)', position:'relative', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'var(--cr)' }} />
          <h3 style={{ fontFamily:'"Cormorant Garamond",serif', fontStyle:'italic', fontWeight:300, fontSize:21, color:'var(--nv)' }}>Registrar movimiento</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--n40)', display:'flex' }}><X size={17}/></button>
        </div>
        <div style={{ padding:22, display:'flex', flexDirection:'column', gap:14 }}>
          {/* Type toggle */}
          <div>
            <Label>Tipo</Label>
            <div style={{ display:'flex', gap:6 }}>
              {[['ingreso','Ingreso','#2a9d5c'],['egreso','Egreso','#dc2626']].map(([val,lbl,col]) => (
                <button key={val} onClick={()=>{set('type',val);set('category',val==='ingreso'?'proyecto':'herramienta')}} style={{ flex:1, padding:'8px', borderRadius:7, border:`2px solid ${form.type===val?col:'var(--rule)'}`, background:form.type===val?`${col}10`:'transparent', color:form.type===val?col:'var(--n40)', fontWeight:700, fontSize:13, cursor:'pointer', transition:'all .15s' }}>
                  {lbl}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div><Label>Categoría</Label>
              <select className="brv-input" value={form.category} onChange={e=>set('category',e.target.value)}>
                {cats.map(c=><option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
              </select>
            </div>
            <div><Label>Método de pago</Label>
              <select className="brv-input" value={form.payment_method} onChange={e=>set('payment_method',e.target.value)}>
                {['transferencia','efectivo','tarjeta'].map(m=><option key={m} value={m}>{m.charAt(0).toUpperCase()+m.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div><Label>Descripción</Label><input className="brv-input" value={form.description} onChange={e=>set('description',e.target.value)} placeholder="Adelanto 50% — Cliente X" /></div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div><Label>Monto (DOP)</Label><input className="brv-input" type="number" value={form.amount_dop} onChange={e=>set('amount_dop',e.target.value)} placeholder="11000" /></div>
            <div><Label>Fecha</Label><input className="brv-input" type="date" value={form.date} onChange={e=>set('date',e.target.value)} /></div>
          </div>
        </div>
        <div style={{ padding:'12px 22px', borderTop:'1px solid var(--rule)', display:'flex', justifyContent:'flex-end', gap:8, background:'var(--p)' }}>
          <button onClick={onClose} className="brv-btn brv-btn-ghost brv-btn-sm">Cancelar</button>
          <button onClick={handleSave} disabled={saving||!form.description||!form.amount_dop} className="brv-btn brv-btn-navy brv-btn-sm">{saving?'Guardando...':'Registrar'}</button>
        </div>
      </div>
    </div>
  )
}

export default function Finances() {
  const [rows,  setRows]  = useState(SEED)
  const [modal, setModal] = useState(false)
  const [filter,setFilter]= useState('all')

  useEffect(() => { db.finances.getAll().then(({data})=>{if(data?.length)setRows(data.map(r=>({...r,amount_dop:r.amount_dop??r.amount??0})))}).catch(()=>{}) }, [])

  const handleSave = async (form) => {
    setRows(rs => [{ ...form, id:Date.now() }, ...rs])
    setModal(false)
  }

  const ingresos = rows.filter(r=>r.type==='ingreso').reduce((s,r)=>s+Number(r.amount_dop),0)
  const egresos  = rows.filter(r=>r.type==='egreso' ).reduce((s,r)=>s+Number(r.amount_dop),0)
  const balance  = ingresos - egresos

  const filtered = filter==='all' ? rows : rows.filter(r=>r.type===filter)

  return (
    <div style={{ maxWidth:1000 }}>
      {/* Heading */}
      <div style={{ marginBottom:24, display:'flex', alignItems:'flex-end', justifyContent:'space-between' }}>
        <div>
          <h2 style={{ fontFamily:'"Cormorant Garamond",serif', fontStyle:'italic', fontWeight:300, fontSize:30, letterSpacing:'-.02em', color:'var(--nv)' }}>
            Finanzas <em style={{ fontStyle:'normal', fontWeight:600, color:'var(--cr)' }}>Braven.</em>
          </h2>
          <p style={{ fontSize:12, color:'var(--gy)', marginTop:4, fontWeight:300 }}>Ingresos, egresos y flujo de caja en DOP</p>
        </div>
        <button onClick={()=>setModal(true)} className="brv-btn brv-btn-coral"><Plus size={14}/> Registrar</button>
      </div>

      {/* KPI cards — .pc-grid style */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', border:'1px solid var(--rule)', borderRadius:14, overflow:'hidden', background:'var(--w)', marginBottom:20 }}>
        {[
          { label:'Ingresos totales', val:formatDOP(ingresos), color:'#2a9d5c', icon:TrendingUp   },
          { label:'Egresos totales',  val:formatDOP(egresos),  color:'#dc2626', icon:TrendingDown },
          { label:'Balance neto',     val:formatDOP(balance),  color:balance>=0?'#2a9d5c':'#dc2626', icon:DollarSign },
        ].map(({ label, val, color, icon:Icon }, i) => (
          <div key={label} style={{ padding:'24px 28px', borderRight:i<2?'1px solid var(--rule)':'none', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', bottom:-8, right:4, fontFamily:'"Cormorant Garamond"', fontSize:72, fontStyle:'italic', fontWeight:300, color:'var(--n05)', lineHeight:1, pointerEvents:'none' }}>
              {['01','02','03'][i]}
            </div>
            <div style={{ width:32, height:32, borderRadius:'50%', background:'var(--nv)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:12 }}>
              <Icon size={15} style={{ color:'var(--p)' }}/>
            </div>
            <div style={{ fontFamily:'"Plus Jakarta Sans"', fontWeight:800, fontSize:22, letterSpacing:'-.04em', color }}>{val}</div>
            <div style={{ fontSize:12, fontWeight:300, color:'var(--gy)', marginTop:4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display:'flex', gap:6, marginBottom:16 }}>
        {[['all','Todos'],['ingreso','Ingresos'],['egreso','Egresos']].map(([val,lbl])=>(
          <button key={val} onClick={()=>setFilter(val)} style={{ padding:'5px 13px', borderRadius:5, fontSize:11, fontWeight:700, cursor:'pointer', border:'1px solid', borderColor:filter===val?'var(--nv)':'var(--rule)', background:filter===val?'var(--nv)':'transparent', color:filter===val?'var(--p)':'var(--n40)', transition:'all .15s' }}>{lbl}</button>
        ))}
      </div>

      {/* Ledger table */}
      <div className="brv-card" style={{ padding:0, overflow:'hidden' }}>
        <table className="brv-table">
          <thead>
            <tr>
              <th style={{ paddingLeft:20 }}>Descripción</th>
              <th>Categoría</th>
              <th>Método</th>
              <th>Fecha</th>
              <th style={{ textAlign:'right', paddingRight:20 }}>Monto</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id}>
                <td style={{ paddingLeft:20 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ width:6, height:6, borderRadius:'50%', background:r.type==='ingreso'?'#2a9d5c':'#dc2626', flexShrink:0 }}/>
                    <span style={{ color:'var(--nv)', fontWeight:600 }}>{r.description}</span>
                  </div>
                </td>
                <td style={{ textTransform:'capitalize' }}>{r.category}</td>
                <td style={{ textTransform:'capitalize' }}>{r.payment_method||'—'}</td>
                <td>{formatDate(r.date)}</td>
                <td style={{ textAlign:'right', paddingRight:20, fontFamily:'"JetBrains Mono",monospace', fontWeight:600, color:r.type==='ingreso'?'#2a9d5c':'#dc2626' }}>
                  {r.type==='ingreso'?'+':'-'} {formatDOP(r.amount_dop)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && <Modal onClose={()=>setModal(false)} onSave={handleSave} />}
    </div>
  )
}
