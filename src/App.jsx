import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth }     from '@/contexts/AuthContext'
import AppLayout       from '@/components/layout/AppLayout'
import Login           from '@/pages/Login'
import Dashboard       from '@/pages/Dashboard'
import Projects        from '@/pages/Projects'
import Clients         from '@/pages/Clients'
import Pipeline        from '@/pages/Pipeline'
import Finances        from '@/pages/Finances'
import Tasks           from '@/pages/Tasks'
import Calculator      from '@/pages/Calculator'
import ClientPortal    from '@/pages/ClientPortal'
import PortalPublic    from '@/pages/PortalPublic'
import { Maintenance, Quotes, Contracts, Messages, Settings } from '@/pages/stubs'

function Guard({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--p)' }}>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
        <div style={{ width:32, height:32, borderRadius:8, background:'var(--nv)', display:'flex', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden' }}>
          <svg style={{ width:12, height:12, fill:'var(--p)', position:'relative', zIndex:1 }} viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          <span style={{ position:'absolute', bottom:0, right:0, width:10, height:10, background:'var(--cr)', borderRadius:'50% 0 0 0' }}/>
        </div>
        <span style={{ fontSize:11, color:'var(--n40)', fontWeight:600, letterSpacing:'.06em', textTransform:'uppercase' }}>Cargando...</span>
      </div>
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const { user } = useAuth()
  return (
    <Routes>
      {/* Public routes — no auth */}
      <Route path="/login"  element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/portal" element={<PortalPublic />} />

      {/* Protected routes */}
      <Route path="/" element={<Guard><AppLayout /></Guard>}>
        <Route index              element={<Dashboard />}    />
        <Route path="projects"    element={<Projects />}     />
        <Route path="clients"     element={<Clients />}      />
        <Route path="pipeline"    element={<Pipeline />}     />
        <Route path="finances"    element={<Finances />}     />
        <Route path="tasks"       element={<Tasks />}        />
        <Route path="maintenance" element={<Maintenance />}  />
        <Route path="quotes"      element={<Quotes />}       />
        <Route path="contracts"   element={<Contracts />}    />
        <Route path="messages"    element={<Messages />}     />
        <Route path="calculator"  element={<Calculator />}   />
        <Route path="portal-admin" element={<ClientPortal />} />
        <Route path="settings"    element={<Settings />}     />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
