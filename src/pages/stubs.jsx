// Stubs — se construyen en próximos sprints
import { Wrench, FileText, ScrollText, MessageSquare, Settings as Gear } from 'lucide-react'

function Stub({ icon: Icon, title, desc, sprint }) {
  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily:'"Cormorant Garamond",serif', fontStyle:'italic', fontWeight:300, fontSize:30, letterSpacing:'-.02em', color:'var(--nv)' }}>
          {title} <em style={{ fontStyle:'normal', fontWeight:600, color:'var(--cr)' }}>próximo.</em>
        </h2>
        <p style={{ fontSize:12, color:'var(--gy)', marginTop:4, fontWeight:300 }}>{desc}</p>
      </div>
      <div style={{ background:'var(--w)', border:'1px solid var(--rule)', borderRadius:14, overflow:'hidden' }}>
        <div style={{ padding:'60px 40px', display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center' }}>
          <div style={{ width:48, height:48, borderRadius:'50%', background:'var(--nv)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16, position:'relative' }}>
            <Icon size={22} style={{ color:'var(--p)' }} />
            <span style={{ position:'absolute', bottom:0, right:0, width:16, height:16, background:'var(--cr)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="8" height="8" viewBox="0 0 8 8"><path d="M4 1v6M1 4h6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </span>
          </div>
          <p style={{ fontWeight:800, fontSize:16, letterSpacing:'-.04em', color:'var(--nv)', marginBottom:6 }}>{title}</p>
          <p style={{ fontSize:13, color:'var(--gy)', fontWeight:300, maxWidth:300, lineHeight:1.7 }}>{desc}</p>
          <div style={{ marginTop:20, padding:'8px 16px', background:'var(--n05)', borderRadius:100, border:'1px solid var(--rule)', fontSize:11, fontWeight:700, color:'var(--n40)', letterSpacing:'.06em', textTransform:'uppercase' }}>
            🚧 {sprint}
          </div>
        </div>
      </div>
    </div>
  )
}

export function Maintenance() {
  return <Stub icon={Wrench}        title="Mantenimiento" desc="Gestión de planes mensuales de mantenimiento web para clientes activos." sprint="Sprint 3" />
}
export function Quotes() {
  return <Stub icon={FileText}      title="Cotizaciones"  desc="Generador de cotizaciones PDF con numeración BRV-COT-XXXX y envío por email." sprint="Sprint 3" />
}
export function Contracts() {
  return <Stub icon={ScrollText}    title="Contratos"     desc="Plantillas de contratos de servicio con firma digital y portal de cliente." sprint="Sprint 4" />
}
export function Messages() {
  return <Stub icon={MessageSquare} title="Mensajes"      desc="Registro unificado de comunicaciones: WhatsApp, email, Instagram, teléfono." sprint="Sprint 3" />
}
export function Settings() {
  return <Stub icon={Gear}          title="Configuración" desc="Datos de la empresa, usuarios del equipo, plantillas y preferencias del sistema." sprint="Sprint 4" />
}

export default { Maintenance, Quotes, Contracts, Messages, Settings }
