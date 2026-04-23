import { useState } from 'react'
import { formatDOP } from '@/lib/utils'

const PLANS = [
  { id:'BRV-01', name:'Lanzamiento', base:11000, delivery:'3 días hábiles', features:['1 página, 5 secciones','Figma aprobado','Código limpio + Netlify','Formulario contacto','Dominio incluido','Video tutorial 5 min','1 ronda ajustes'] },
  { id:'BRV-02', name:'Portafolio',  base:15000, delivery:'4 días hábiles', features:['Single page + grid proyectos','Hasta 12 piezas','Animaciones de entrada','Filtros por categoría','Bio + contacto','Guía PDF','1 ronda ajustes'] },
  { id:'BRV-03', name:'Crecimiento', base:25000, delivery:'7–10 días hábiles',features:['Hasta 6 páginas','UX/UI completo Figma','CMS sin código','SEO base + GA4','Hasta 3 integraciones','2 rondas ajustes','Reporte 30 días'] },
  { id:'BRV-04', name:'Ecommerce',   base:38000, delivery:'10–14 días hábiles',features:['Hasta 30 SKUs + checkout','UX orientado conversión','Email transaccional','SEO productos + GA4','2 rondas ajustes','Capacitación 45 min'] },
]

const ADDONS = [
  { id:'blog',     label:'Blog / CMS integrado',         price:8000  },
  { id:'chat',     label:'Chat en vivo (Tawk.to)',        price:3000  },
  { id:'booking',  label:'Sistema de reservas/citas',     price:12000 },
  { id:'multilang',label:'Multiidioma (ES + EN)',          price:7000  },
  { id:'payments', label:'Pasarela de pagos (CardNet)',    price:10000 },
  { id:'seo',      label:'Paquete SEO avanzado (3 meses)',price:9000  },
  { id:'maint',    label:'Mantenimiento 6 meses incluido',price:5000  },
]

const MAINT = [
  { id:'basic',    label:'Básico',    price:5000,  features:['Actualizaciones de contenido','Soporte WhatsApp','Backup mensual'] },
  { id:'standard', label:'Estándar',  price:6500,  features:['Todo Básico','Cambios de diseño menores','Reporte mensual','SEO on-page'] },
  { id:'premium',  label:'Premium',   price:9000,  features:['Todo Estándar','Desarrollos nuevas funciones','Acceso prioritario','Reunión mensual'] },
]

function Tick() {
  return <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 6l4 4 6-8" stroke="var(--cr)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
}

export default function Calculator() {
  const [plan,     setPlan]     = useState('BRV-01')
  const [addons,   setAddons]   = useState([])
  const [maint,    setMaint]    = useState(null)
  const [rush,     setRush]     = useState(false)
  const [discount, setDiscount] = useState(0)

  const selectedPlan = PLANS.find(p => p.id === plan)
  const addonTotal   = addons.reduce((s, a) => { const x = ADDONS.find(o=>o.id===a); return s + (x?.price??0) }, 0)
  const maintMonthly = MAINT.find(m=>m.id===maint)?.price ?? 0
  const rushFee      = rush ? Math.round(selectedPlan.base * 0.25) : 0
  const subtotal     = selectedPlan.base + addonTotal + rushFee
  const discountAmt  = Math.round(subtotal * (discount / 100))
  const total        = subtotal - discountAmt
  const advance50    = Math.round(total * 0.5)
  const advance60    = Math.round(total * 0.6)

  const toggleAddon = (id) => setAddons(a => a.includes(id) ? a.filter(x=>x!==id) : [...a,id])

  return (
    <div style={{ maxWidth:1100 }}>
      {/* Heading */}
      <div style={{ marginBottom:28 }}>
        <h2 style={{ fontFamily:'"Cormorant Garamond",serif',fontStyle:'italic',fontWeight:300,fontSize:30,letterSpacing:'-.02em',color:'var(--nv)' }}>
          Calculadora de <em style={{ fontStyle:'normal',fontWeight:600,color:'var(--cr)' }}>precios.</em>
        </h2>
        <p style={{ fontSize:12,color:'var(--gy)',marginTop:4,fontWeight:300 }}>Genera presupuestos para tus clientes con los planes reales de Braven Studio</p>
      </div>

      <div style={{ display:'grid',gridTemplateColumns:'1fr 340px',gap:20,alignItems:'start' }}>

        {/* Left: configurator */}
        <div style={{ display:'flex',flexDirection:'column',gap:16 }}>

          {/* Plan selector — .pc-grid style */}
          <div style={{ background:'var(--w)',border:'1px solid var(--rule)',borderRadius:14,overflow:'hidden' }}>
            <div style={{ padding:'14px 20px',borderBottom:'1px solid var(--rule)' }}>
              <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                <span style={{ width:18,height:1.5,background:'var(--cr)',display:'inline-block' }}/>
                <span style={{ fontSize:10,fontWeight:700,color:'var(--n40)',textTransform:'uppercase',letterSpacing:'.08em' }}>Plan base</span>
              </div>
            </div>
            <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)' }}>
              {PLANS.map((p,i) => (
                <div
                  key={p.id}
                  onClick={()=>setPlan(p.id)}
                  style={{ padding:'20px 18px',borderRight:i<3?'1px solid var(--rule)':'none',cursor:'pointer',transition:'background .15s',background:plan===p.id?'var(--nv)':'transparent',position:'relative',overflow:'hidden' }}
                  onMouseEnter={e=>{ if(plan!==p.id) e.currentTarget.style.background='var(--p2)' }}
                  onMouseLeave={e=>{ if(plan!==p.id) e.currentTarget.style.background='transparent' }}
                >
                  {/* Ghost number */}
                  <div style={{ position:'absolute',bottom:-8,right:4,fontFamily:'"Cormorant Garamond"',fontSize:64,fontStyle:'italic',fontWeight:300,lineHeight:1,opacity:.07,color:plan===p.id?'white':'var(--nv)',pointerEvents:'none' }}>
                    {p.id.split('-')[1]}
                  </div>
                  <p style={{ fontSize:9,fontWeight:700,color:plan===p.id?'rgba(255,255,255,.5)':'var(--n40)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:6 }}>{p.id}</p>
                  <p style={{ fontSize:14,fontWeight:800,letterSpacing:'-.04em',color:plan===p.id?'white':'var(--nv)',marginBottom:4 }}>{p.name}</p>
                  <p style={{ fontSize:15,fontFamily:'"JetBrains Mono",monospace',fontWeight:500,color:plan===p.id?'var(--cr)':'var(--nv)',marginBottom:8 }}>{formatDOP(p.base)}</p>
                  <p style={{ fontSize:10,color:plan===p.id?'rgba(255,255,255,.5)':'var(--n40)',fontWeight:300 }}>{p.delivery}</p>
                  <ul style={{ marginTop:10,listStyle:'none',display:'flex',flexDirection:'column',gap:4 }}>
                    {p.features.slice(0,4).map(f => (
                      <li key={f} style={{ display:'flex',alignItems:'flex-start',gap:5,fontSize:10,color:plan===p.id?'rgba(255,255,255,.7)':'var(--gy)',lineHeight:1.4 }}>
                        <span style={{ marginTop:1,flexShrink:0 }}><Tick /></span>{f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Add-ons */}
          <div style={{ background:'var(--w)',border:'1px solid var(--rule)',borderRadius:14,overflow:'hidden' }}>
            <div style={{ padding:'14px 20px',borderBottom:'1px solid var(--rule)' }}>
              <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                <span style={{ width:18,height:1.5,background:'var(--cr)',display:'inline-block' }}/>
                <span style={{ fontSize:10,fontWeight:700,color:'var(--n40)',textTransform:'uppercase',letterSpacing:'.08em' }}>Add-ons opcionales</span>
              </div>
            </div>
            <div style={{ padding:'14px 20px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:8 }}>
              {ADDONS.map(a => (
                <label key={a.id} style={{ display:'flex',alignItems:'center',gap:9,padding:'9px 12px',borderRadius:8,border:`1px solid ${addons.includes(a.id)?'var(--nv)':'var(--rule)'}`,background:addons.includes(a.id)?'var(--nv)':'transparent',cursor:'pointer',transition:'all .15s' }}>
                  <div onClick={()=>toggleAddon(a.id)} style={{ width:14,height:14,borderRadius:3,border:`2px solid ${addons.includes(a.id)?'var(--cr)':'var(--rule)'}`,background:addons.includes(a.id)?'var(--cr)':'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'all .15s' }}>
                    {addons.includes(a.id) && <svg width="8" height="8" viewBox="0 0 8 8"><path d="M1 4l2 2 4-5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>}
                  </div>
                  <div style={{ flex:1,minWidth:0 }}>
                    <p style={{ fontSize:11,fontWeight:600,color:addons.includes(a.id)?'white':'var(--nv)',lineHeight:1.3 }}>{a.label}</p>
                    <p style={{ fontSize:10,fontFamily:'"JetBrains Mono",monospace',color:addons.includes(a.id)?'var(--cr)':'var(--n40)',marginTop:1 }}>+{formatDOP(a.price)}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Maintenance plan */}
          <div style={{ background:'var(--w)',border:'1px solid var(--rule)',borderRadius:14,overflow:'hidden' }}>
            <div style={{ padding:'14px 20px',borderBottom:'1px solid var(--rule)' }}>
              <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                <span style={{ width:18,height:1.5,background:'var(--cr)',display:'inline-block' }}/>
                <span style={{ fontSize:10,fontWeight:700,color:'var(--n40)',textTransform:'uppercase',letterSpacing:'.08em' }}>Plan de mantenimiento mensual</span>
              </div>
            </div>
            <div style={{ padding:'14px 20px',display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8 }}>
              <label style={{ padding:'10px 12px',borderRadius:8,border:`1px solid ${!maint?'var(--nv)':'var(--rule)'}`,background:!maint?'var(--n05)':'transparent',cursor:'pointer',transition:'all .15s' }} onClick={()=>setMaint(null)}>
                <p style={{ fontSize:11,fontWeight:700,color:'var(--nv)',marginBottom:2 }}>Sin plan</p>
                <p style={{ fontSize:10,color:'var(--n40)' }}>RD$0 / mes</p>
              </label>
              {MAINT.map(m => (
                <label key={m.id} onClick={()=>setMaint(m.id)} style={{ padding:'10px 12px',borderRadius:8,border:`1px solid ${maint===m.id?'var(--nv)':'var(--rule)'}`,background:maint===m.id?'var(--nv)':'transparent',cursor:'pointer',transition:'all .15s' }}>
                  <p style={{ fontSize:11,fontWeight:700,color:maint===m.id?'white':'var(--nv)',marginBottom:2 }}>{m.label}</p>
                  <p style={{ fontSize:11,fontFamily:'"JetBrains Mono",monospace',color:maint===m.id?'var(--cr)':'var(--n40)' }}>{formatDOP(m.price)}<span style={{ fontSize:9 }}>/mes</span></p>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right: summary */}
        <div style={{ background:'var(--w)',border:'1px solid var(--rule)',borderRadius:14,overflow:'hidden',position:'sticky',top:0 }}>
          {/* Coral header */}
          <div style={{ background:'var(--nv)',padding:'20px 22px',position:'relative',overflow:'hidden' }}>
            <div style={{ position:'absolute',bottom:-10,right:4,fontFamily:'"Cormorant Garamond"',fontSize:100,fontStyle:'italic',fontWeight:300,lineHeight:1,color:'rgba(255,255,255,.04)',pointerEvents:'none' }}>
              {plan.split('-')[1]}
            </div>
            <div style={{ fontSize:10,fontWeight:700,color:'rgba(255,255,255,.4)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:6 }}>Resumen del presupuesto</div>
            <div style={{ fontFamily:'"Plus Jakarta Sans"',fontWeight:800,fontSize:28,letterSpacing:'-.04em',color:'white',lineHeight:1.1 }}>
              {formatDOP(total)}
            </div>
            <div style={{ fontSize:11,color:'rgba(255,255,255,.4)',marginTop:4 }}>Total proyecto · {selectedPlan.name}</div>
          </div>

          <div style={{ padding:'18px 20px',display:'flex',flexDirection:'column',gap:12 }}>
            {/* Line items */}
            {[
              { label:`Plan ${selectedPlan.name}`, val:selectedPlan.base },
              ...addons.map(a => { const x=ADDONS.find(o=>o.id===a); return { label:x.label, val:x.price } }),
              rush && { label:'Urgencia +25%', val:rushFee, color:'var(--cr)' },
              discount>0 && { label:`Descuento ${discount}%`, val:-discountAmt, color:'#2a9d5c' },
            ].filter(Boolean).map((item,i) => (
              <div key={i} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'1px solid var(--rule)',paddingBottom:10 }}>
                <span style={{ fontSize:12,color:'var(--gy)' }}>{item.label}</span>
                <span style={{ fontFamily:'"JetBrains Mono",monospace',fontSize:12,fontWeight:600,color:item.color||'var(--nv)' }}>
                  {item.val>=0?'':''}{formatDOP(item.val)}
                </span>
              </div>
            ))}

            {/* Rush toggle */}
            <label style={{ display:'flex',alignItems:'center',gap:8,cursor:'pointer',padding:'6px 0' }}>
              <div onClick={()=>setRush(!rush)} style={{ width:32,height:18,borderRadius:9,background:rush?'var(--cr)':'var(--rule)',position:'relative',transition:'background .2s',cursor:'pointer',flexShrink:0 }}>
                <span style={{ position:'absolute',top:2,left:rush?14:2,width:14,height:14,borderRadius:'50%',background:'white',transition:'left .2s' }}/>
              </div>
              <span style={{ fontSize:12,color:'var(--gy)' }}>Entrega urgente (+25%)</span>
            </label>

            {/* Discount */}
            <div>
              <label style={{ fontSize:10,fontWeight:700,color:'var(--n40)',textTransform:'uppercase',letterSpacing:'.07em',display:'block',marginBottom:5 }}>Descuento (%)</label>
              <input type="range" min="0" max="30" step="5" value={discount} onChange={e=>setDiscount(Number(e.target.value))} style={{ width:'100%',accentColor:'var(--cr)' }} />
              <div style={{ display:'flex',justifyContent:'space-between',fontSize:10,color:'var(--n40)',marginTop:3 }}>
                <span>0%</span><span style={{ color:'var(--cr)',fontWeight:700 }}>{discount}%</span><span>30%</span>
              </div>
            </div>

            {/* Payment split */}
            <div style={{ background:'var(--p)',borderRadius:9,padding:'12px 14px' }}>
              <div style={{ fontSize:10,fontWeight:700,color:'var(--n40)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:8 }}>Esquema de cobro</div>
              {plan==='BRV-01'||plan==='BRV-02' ? (
                <>
                  <div style={{ display:'flex',justifyContent:'space-between',marginBottom:5 }}>
                    <span style={{ fontSize:11,color:'var(--gy)' }}>60% al inicio</span>
                    <span style={{ fontFamily:'"JetBrains Mono",monospace',fontWeight:600,fontSize:12,color:'var(--nv)' }}>{formatDOP(advance60)}</span>
                  </div>
                  <div style={{ display:'flex',justifyContent:'space-between' }}>
                    <span style={{ fontSize:11,color:'var(--gy)' }}>40% al entregar</span>
                    <span style={{ fontFamily:'"JetBrains Mono",monospace',fontWeight:600,fontSize:12,color:'var(--nv)' }}>{formatDOP(total-advance60)}</span>
                  </div>
                </>
              ):(
                <>
                  <div style={{ display:'flex',justifyContent:'space-between',marginBottom:5 }}>
                    <span style={{ fontSize:11,color:'var(--gy)' }}>50% al inicio</span>
                    <span style={{ fontFamily:'"JetBrains Mono",monospace',fontWeight:600,fontSize:12,color:'var(--nv)' }}>{formatDOP(advance50)}</span>
                  </div>
                  <div style={{ display:'flex',justifyContent:'space-between',marginBottom:5 }}>
                    <span style={{ fontSize:11,color:'var(--gy)' }}>30% en desarrollo</span>
                    <span style={{ fontFamily:'"JetBrains Mono",monospace',fontWeight:600,fontSize:12,color:'var(--nv)' }}>{formatDOP(Math.round(total*.3))}</span>
                  </div>
                  <div style={{ display:'flex',justifyContent:'space-between' }}>
                    <span style={{ fontSize:11,color:'var(--gy)' }}>20% al entregar</span>
                    <span style={{ fontFamily:'"JetBrains Mono",monospace',fontWeight:600,fontSize:12,color:'var(--nv)' }}>{formatDOP(Math.round(total*.2))}</span>
                  </div>
                </>
              )}
            </div>

            {/* Maintenance */}
            {maint && (
              <div style={{ background:`rgba(18,24,42,.04)`,borderRadius:8,padding:'10px 12px',border:'1px solid var(--rule)' }}>
                <div style={{ fontSize:10,fontWeight:700,color:'var(--n40)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:5 }}>+ Mantenimiento mensual</div>
                <div style={{ fontFamily:'"JetBrains Mono",monospace',fontWeight:700,fontSize:16,letterSpacing:'-.02em',color:'var(--nv)' }}>
                  {formatDOP(maintMonthly)}<span style={{ fontSize:11,fontWeight:400 }}>/mes</span>
                </div>
              </div>
            )}

            <button className="brv-btn brv-btn-navy" style={{ width:'100%',justifyContent:'center',marginTop:4 }}>
              Crear cotización →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
