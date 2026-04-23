import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import {
  LayoutDashboard, FolderOpen, Users, Filter, DollarSign,
  CheckSquare, Wrench, FileText, ScrollText, MessageSquare,
  Calculator, Settings, LogOut, Globe,
} from 'lucide-react'

const SECTIONS = [
  {
    label: 'Principal',
    items: [
      { to: '/',            icon: LayoutDashboard, label: 'Dashboard',    end: true },
      { to: '/projects',    icon: FolderOpen,      label: 'Proyectos'           },
      { to: '/clients',     icon: Users,           label: 'Clientes'            },
      { to: '/pipeline',    icon: Filter,          label: 'Pipeline CRM'        },
      { to: '/finances',    icon: DollarSign,      label: 'Finanzas'            },
    ],
  },
  {
    label: 'Operaciones',
    items: [
      { to: '/tasks',        icon: CheckSquare,   label: 'Tareas'         },
      { to: '/maintenance',  icon: Wrench,        label: 'Mantenimiento'  },
      { to: '/quotes',       icon: FileText,      label: 'Cotizaciones'   },
      { to: '/contracts',    icon: ScrollText,    label: 'Contratos'      },
      { to: '/messages',     icon: MessageSquare, label: 'Mensajes'       },
      { to: '/portal-admin', icon: Globe,         label: 'Portal clientes'},
    ],
  },
  {
    label: 'Herramientas',
    items: [
      { to: '/calculator', icon: Calculator, label: 'Calculadora' },
      { to: '/settings',   icon: Settings,   label: 'Config.'     },
    ],
  },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const initials = (user?.email ?? 'RO').slice(0, 2).toUpperCase()

  return (
    <aside
      style={{
        width: 220,
        minHeight: '100vh',
        background: 'var(--w)',
        borderRight: '1px solid var(--rule)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '16px 16px 15px',
          borderBottom: '1px solid var(--rule)',
        }}
      >
        <div className="brv-logo-mark">
          <svg style={{ width: 11, height: 11, fill: 'var(--p)', position: 'relative', zIndex: 1, margin: '7px 0 0 7px' }} viewBox="0 0 24 24">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15, letterSpacing: '-.04em', color: 'var(--nv)', lineHeight: 1.1 }}>
            Braven OS
          </div>
          <div style={{ fontSize: 9, color: 'var(--n40)', letterSpacing: '.06em', fontFamily: '"JetBrains Mono", monospace', textTransform: 'uppercase' }}>
            v2.0 · alpha
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
        {SECTIONS.map(sec => (
          <div key={sec.label} style={{ marginBottom: 4 }}>
            <div className="brv-label" style={{ padding: '8px 8px 4px', marginBottom: 2, fontSize: 9 }}>
              {sec.label}
            </div>
            {sec.items.map(({ to, icon: Icon, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) => `brv-nav-item${isActive ? ' active' : ''}`}
                style={{ fontSize: 13 }}
              >
                {({ isActive }) => (
                  <>
                    <span
                      className="nav-dot-accent"
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: '50%',
                        background: isActive ? 'var(--cr)' : 'transparent',
                        border: isActive ? 'none' : '1px solid var(--rule)',
                        flexShrink: 0,
                        transition: 'all .15s',
                      }}
                    />
                    <Icon size={14} style={{ flexShrink: 0, opacity: isActive ? 1 : .5 }} />
                    {label}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* User */}
      <div style={{ borderTop: '1px solid var(--rule)', padding: '12px 10px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '6px 8px', marginBottom: 4 }}>
          {/* Coral-bordered avatar, inspired by logo mark style */}
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'var(--nv)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
              fontWeight: 800,
              color: 'var(--p)',
              flexShrink: 0,
              position: 'relative',
            }}
          >
            {initials}
            <span style={{ position: 'absolute', bottom: 0, right: 0, width: 7, height: 7, background: 'var(--cr)', borderRadius: '50% 0 0 0', borderRadius: 99 }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--nv)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email?.split('@')[0] ?? 'Admin'}
            </div>
            <div style={{ fontSize: 10, color: 'var(--n40)' }}>Administrador</div>
          </div>
        </div>
        <button
          onClick={async () => { await logout(); navigate('/login') }}
          className="brv-nav-item"
          style={{ fontSize: 12, color: 'var(--n40)' }}
        >
          <span style={{ width: 5, height: 5, borderRadius: '50%', border: '1px solid var(--rule)', flexShrink: 0 }} />
          <LogOut size={13} style={{ opacity: .5, flexShrink: 0 }} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
