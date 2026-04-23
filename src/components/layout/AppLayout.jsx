import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

export default function AppLayout() {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--p)' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <Header />
        <main style={{ flex: 1, overflowY: 'auto', background: 'var(--p)' }}>
          <div style={{ padding: 24 }} className="animate-fade-up">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
