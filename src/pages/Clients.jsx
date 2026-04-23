import { useState, useEffect } from 'react'
import { Plus, Search, X, MessageSquare, Phone, Mail, Globe } from 'lucide-react'
import { SectionHeader, EmptyState, Badge } from '@/components/shared'
import { formatDate, C, CLIENT_STATUS } from '@/lib/utils'
import { db } from '@/lib/supabase'

const SECTORS = ['servicios','alimentos','artesanía','turismo','otro']
const STATUS  = ['activo','inactivo','prospecto']

const SEED = [
  { id:1, name:'Dr. Javier Matos',  business:'Clínica Familia Verde', email:'jmatos@gmail.com',   phone:'809-555-0101', whatsapp:'809-555-0101', sector:'servicios', city:'Santo Domingo', status:'activo',   source:'referido',  notes:'Especialista en medicina familiar.' },
  { id:2, name:'María Rodríguez',   business:'Restaurante La Cazuela',email:'maria@lacazuela.do', phone:'829-555-0102', whatsapp:'829-555-0102', sector:'alimentos', city:'Santiago',      status:'activo',   source:'instagram', notes:'Le gusta comunicarse por WhatsApp.' },
  { id:3, name:'Carlos Sosa',        business:'Inmobiliaria Palma',    email:'csosa@palma.do',    phone:'849-555-0103', whatsapp:'849-555-0103', sector:'servicios', city:'Santo Domingo', status:'activo',   source:'email',     notes:'Proyecto grande. Muy meticuloso con los detalles.' },
  { id:4, name:'Ana Herrera',        business:'Academia Digital RD',   email:'ana@academia.do',   phone:'809-555-0104', whatsapp:'809-555-0104', sector:'servicios', city:'Santo Domingo', status:'activo',   source:'referido',  notes:'' },
  { id:5, name:'Pedro García',       business:'Ferretería Don Pepe',   email:'pedro@donpepe.do',  phone:'829-555-0105', whatsapp:'829-555-0105', sector:'servicios', city:'La Romana',     status:'activo',   source:'email',     notes:'Proyecto finalizado. Interesado en mantenimiento.' },
]

function Label({ children }) {
  return <label style={{ display:'block', fontSize:10, fontWeight:700, color:'var(--n40)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:5 }}>{children}</label>
}

function Avatar({ name, size=40 }) {
  const initials = name?.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase() ?? '?'
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', background:'var(--nv)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:size*0.32, fontWeight:800, color:'var(--p)', flexShrink:0, position:'relative' }}>
      {initials}
      <span style={{ position:'absolute', bottom:1, right:1, width:size*0.22, height:size*0.22, background:'var(--cr)', borderRadius:'50%', border:'1.5px solid var(--w)' }}/>
    </div>
  )
}

function Modal({ client, onClose, onSave }) {
  const isNew = !client?.id
  const [form, setForm] = useState(client ?? { name:'', business:'', email:'', phone:'', whatsapp:'', sector:'servicios', city:'Santo Domingo', status:'activo', source:'', notes:'' })
  const [saving, setSaving] = useState(false)
  const set = (k,v) => setForm(f => ({ ...f, [k]:v }))

  const handleSave = async () => {
    if (!form.name) return
    setSaving(true)
    try { await onSave(form) } finally { setSaving(false) }
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(18,24,42,.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999, padding:24 }}>
      <div style={{ background:'var(--w)', borderRadius:20, width:'100%', maxWidth:560, maxHeight:'90vh', overflow:'hidden', display:'flex', flexDirection:'column', border:'1px solid var(--rule)' }}>
        <div style={{ padding:'20px 24px 18px', borderBottom:'1px solid var(--rule)', position:'relative' }}>
          <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'var(--cr)' }} />
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <h3 style={{ fontFamily:'"Cormorant Garamond",serif', fontStyle:'italic', fontWeight:300, fontSize:22, color:'var(--nv)' }}>
              {isNew ? 'Nuevo cliente' : form.name}
            </h3>
            <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--n40)', display:'flex' }}><X size={18}/></button>
          </div>
        </div>

        <div style={{ overflowY:'auto', padding:24, display:'flex', flexDirection:'column', gap:16 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div>
              <Label>Nombre completo</Label>
              <input className="brv-input" value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Dr. Javier Matos" />
            </div>
            <div>
              <Label>Negocio / empresa</Label>
              <input className="brv-input" value={form.business||''} onChange={e=>set('business',e.target.value)} placeholder="Clínica Familia Verde" />
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div>
              <Label>Email</Label>
              <input className="brv-input" type="email" value={form.email||''} onChange={e=>set('email',e.target.value)} placeholder="cliente@correo.do" />
            </div>
            <div>
              <Label>Teléfono / WhatsApp</Label>
              <input className="brv-input" value={form.phone||''} onChange={e=>{ set('phone',e.target.value); set('whatsapp',e.target.value) }} placeholder="809-555-0100" />
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
            <div>
              <Label>Sector</Label>
              <select className="brv-input" value={form.sector} onChange={e=>set('sector',e.target.value)}>
                {SECTORS.map(s=><option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <Label>Ciudad</Label>
              <input className="brv-input" value={form.city||''} onChange={e=>set('city',e.target.value)} placeholder="Santo Domingo" />
            </div>
            <div>
              <Label>Estado</Label>
              <select className="brv-input" value={form.status} onChange={e=>set('status',e.target.value)}>
                {STATUS.map(s=><option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div>
            <Label>Fuente (cómo llegó)</Label>
            <input className="brv-input" value={form.source||''} onChange={e=>set('source',e.target.value)} placeholder="Referido, Instagram, Email, etc." />
          </div>
          <div>
            <Label>Notas internas</Label>
            <textarea className="brv-input" rows={3} value={form.notes||''} onChange={e=>set('notes',e.target.value)} placeholder="Preferencias de comunicación, observaciones..." style={{ resize:'vertical', lineHeight:1.6 }} />
          </div>
        </div>

        <div style={{ padding:'14px 24px', borderTop:'1px solid var(--rule)', display:'flex', justifyContent:'flex-end', gap:8, background:'var(--p)' }}>
          <button onClick={onClose} className="brv-btn brv-btn-ghost brv-btn-sm">Cancelar</button>
          <button onClick={handleSave} disabled={saving||!form.name} className="brv-btn brv-btn-navy brv-btn-sm">
            {saving ? 'Guardando...' : isNew ? 'Crear cliente' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}

const STATUS_COLOR = { activo:'#2a9d5c', inactivo:'#5e5d5d', prospecto:'#4d78bb' }

export default function Clients() {
  const [clients, setClients] = useState(SEED)
  const [modal,   setModal]   = useState(null)
  const [search,  setSearch]  = useState('')
  const [sector,  setSector]  = useState('all')

  useEffect(() => { db.clients.getAll().then(({data})=>{ if(data?.length) setClients(data.map(c => ({...c, business: c.company ?? c.business ?? ''}))) }).catch(()=>{}) }, [])

  const filtered = clients.filter(c => {
    const q = search.toLowerCase()
    const matchQ = c.name.toLowerCase().includes(q) || (c.business||'').toLowerCase().includes(q) || (c.email||'').toLowerCase().includes(q)
    const matchS = sector === 'all' || c.sector === sector
    return matchQ && matchS
  })

  const handleSave = async (form) => {
    if (form.id) setClients(cs => cs.map(c => c.id===form.id ? {...c,...form, company:form.business} : c))
    else         setClients(cs => [...cs, { ...form, id:Date.now() }])
    setModal(null)
  }

  return (
    <div style={{ maxWidth:1100 }}>
      {/* Heading */}
      <div style={{ marginBottom:24, display:'flex', alignItems:'flex-end', justifyContent:'space-between' }}>
        <div>
          <h2 style={{ fontFamily:'"Cormorant Garamond",serif', fontStyle:'italic', fontWeight:300, fontSize:30, letterSpacing:'-.02em', color:'var(--nv)' }}>
            Clientes <em style={{ fontStyle:'normal', fontWeight:600, color:'var(--cr)' }}>Braven.</em>
          </h2>
          <p style={{ fontSize:12, color:'var(--gy)', marginTop:4, fontWeight:300 }}>{clients.filter(c=>c.status==='activo').length} activos · {clients.length} en total</p>
        </div>
        <button onClick={()=>setModal({})} className="brv-btn brv-btn-coral"><Plus size={14}/> Nuevo cliente</button>
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:10, marginBottom:20, alignItems:'center' }}>
        <div style={{ position:'relative', flex:1, maxWidth:280 }}>
          <Search size={13} style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', color:'var(--n40)' }}/>
          <input className="brv-input" style={{ paddingLeft:32, fontSize:13 }} placeholder="Buscar nombre, negocio, email..." value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        {['all',...SECTORS].map(s => (
          <button key={s} onClick={()=>setSector(s)} style={{ padding:'5px 11px', borderRadius:5, fontSize:11, fontWeight:700, cursor:'pointer', border:'1px solid', borderColor:sector===s?'var(--nv)':'var(--rule)', background:sector===s?'var(--nv)':'transparent', color:sector===s?'var(--p)':'var(--n40)', transition:'all .15s', textTransform:'capitalize' }}>
            {s==='all'?'Todos':s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="brv-card" style={{ padding:0, overflow:'hidden' }}>
        <table className="brv-table">
          <thead>
            <tr>
              <th style={{ paddingLeft:20 }}>Cliente</th>
              <th>Sector</th>
              <th>Contacto</th>
              <th>Ciudad</th>
              <th>Estado</th>
              <th>Fuente</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign:'center', padding:40, color:'var(--n40)' }}>Sin resultados</td></tr>
            ) : filtered.map(c => (
              <tr key={c.id} style={{ cursor:'pointer' }} onClick={()=>setModal(c)}>
                <td style={{ paddingLeft:20 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <Avatar name={c.name} size={32} />
                    <div>
                      <div style={{ fontWeight:700, fontSize:13, color:'var(--nv)' }}>{c.name}</div>
                      <div style={{ fontSize:11, color:'var(--n40)', fontWeight:300 }}>{c.business}</div>
                    </div>
                  </div>
                </td>
                <td style={{ textTransform:'capitalize' }}>{c.sector}</td>
                <td>
                  <div style={{ display:'flex', gap:8 }}>
                    {c.email    && <a href={`mailto:${c.email}`}    onClick={e=>e.stopPropagation()} title={c.email}    style={{ color:'var(--n40)', display:'flex' }}><Mail      size={13}/></a>}
                    {c.whatsapp && <a href={`https://wa.me/1${c.whatsapp?.replace(/\D/g,'')}`} onClick={e=>e.stopPropagation()} target="_blank" rel="noreferrer" title="WhatsApp" style={{ color:'#25D366', display:'flex' }}><MessageSquare size={13}/></a>}
                    {c.phone    && <a href={`tel:${c.phone}`}       onClick={e=>e.stopPropagation()} title={c.phone}    style={{ color:'var(--n40)', display:'flex' }}><Phone     size={13}/></a>}
                  </div>
                </td>
                <td>{c.city}</td>
                <td><Badge label={c.status} color={STATUS_COLOR[c.status]??C.n40} /></td>
                <td style={{ textTransform:'capitalize', fontSize:11 }}>{c.source || '—'}</td>
                <td onClick={e=>{e.stopPropagation();setModal(c)}} style={{ cursor:'pointer', color:'var(--n40)', textAlign:'right', paddingRight:16 }}>
                  <span style={{ fontSize:11, fontWeight:600, color:'var(--bl)' }}>Editar</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal !== null && <Modal client={modal?.id ? modal : null} onClose={()=>setModal(null)} onSave={handleSave} />}
    </div>
  )
}
