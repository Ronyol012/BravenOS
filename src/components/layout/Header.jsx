import { useLocation } from 'react-router-dom'
import { Bell, Plus, Search } from 'lucide-react'

const META = {
  '/':            { title: 'Dashboard',     sub: 'Resumen del negocio' },
  '/projects':    { title: 'Proyectos',     sub: 'Gestión de proyectos activos' },
  '/clients':     { title: 'Clientes',      sub: 'Base de clientes Braven Studio' },
  '/pipeline':    { title: 'Pipeline CRM',  sub: 'Leads y oportunidades' },
  '/finances':    { title: 'Finanzas',      sub: 'Ingresos, egresos, flujo de caja' },
  '/tasks':       { title: 'Tareas',        sub: 'Pendientes y checklist' },
  '/maintenance': { title: 'Mantenimiento', sub: 'Planes mensuales activos' },
  '/quotes':      { title: 'Cotizaciones',  sub: 'Propuestas y presupuestos' },
  '/contracts':   { title: 'Contratos',     sub: 'Contratos de servicio' },
  '/messages':    { title: 'Mensajes',      sub: 'Comunicaciones con clientes' },
  '/calculator':  { title: 'Calculadora',   sub: 'Precios y rentabilidad' },
  '/settings':    { title: 'Configuración', sub: 'Preferencias del sistema' },
}

const ACTION = {
  '/':            'Nuevo proyecto',
  '/projects':    'Nuevo proyecto',
  '/clients':     'Nuevo cliente',
  '/pipeline':    'Nuevo lead',
  '/finances':    'Registrar',
  '/tasks':       'Nueva tarea',
  '/quotes':      'Nueva cotización',
  '/contracts':   'Nuevo contrato',
  '/messages':    'Nuevo mensaje',
}

export default function Header({ onNew }) {
  const { pathname } = useLocation()
  const meta   = META[pathname] ?? { title: 'Braven OS', sub: '' }
  const action = ACTION[pathname]

  const today = new Intl.DateTimeFormat('es-DO', {
    weekday: 'long', day: 'numeric', month: 'long',
  }).format(new Date())

  return (
    <header
      style={{
        background: 'var(--w)',
        borderBottom: '1px solid var(--rule)',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        flexShrink: 0,
        position: 'relative',
      }}
    >
      {/* Coral top line — same as nav progress bar on braven-demo */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'var(--cr)' }} />

      {/* Left: page title */}
      <div>
        <h1
          style={{
            fontFamily: '"Plus Jakarta Sans"',
            fontWeight: 800,
            fontSize: 15,
            letterSpacing: '-.04em',
            color: 'var(--nv)',
            lineHeight: 1.2,
          }}
        >
          {meta.title}
        </h1>
        <p style={{ fontSize: 11, color: 'var(--n40)', marginTop: 1, fontWeight: 300 }}>
          {meta.sub}
        </p>
      </div>

      {/* Right: actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Date chip — brv-chip style */}
        <span
          className="brv-chip"
          style={{ display: 'none' }}
        >
          {today}
        </span>
        <span
          style={{
            fontSize: 11,
            color: 'var(--n40)',
            background: 'var(--n05)',
            border: '1px solid var(--rule)',
            borderRadius: 100,
            padding: '4px 12px',
            fontWeight: 500,
          }}
          className="hidden md:block capitalize"
        >
          {today}
        </span>

        <button className="brv-btn brv-btn-ghost brv-btn-sm" style={{ padding: '6px 8px' }}>
          <Search size={14} />
        </button>
        <button className="brv-btn brv-btn-ghost brv-btn-sm" style={{ padding: '6px 8px', position: 'relative' }}>
          <Bell size={14} />
          <span style={{ position: 'absolute', top: 5, right: 5, width: 5, height: 5, borderRadius: '50%', background: 'var(--cr)' }} />
        </button>

        {action && (
          <button
            onClick={onNew}
            className="brv-btn brv-btn-navy brv-btn-sm"
            style={{ gap: 5 }}
          >
            <Plus size={13} />
            <span className="hidden sm:inline">{action}</span>
          </button>
        )}
      </div>
    </header>
  )
}
