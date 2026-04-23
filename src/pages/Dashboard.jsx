import { useState, useEffect } from 'react'
import { FolderOpen, Users, DollarSign, CheckSquare, TrendingUp, AlertTriangle, Wrench, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts'
import { KpiCard, ProgressBar, StatusBadge, PlanBadge, PriorityDot, TagBadge, SectionHeader, Card } from '@/components/shared'
import { formatDOP, relativeDate, PRIORITY_CONFIG, normalizeProject, normalizeTask } from '@/lib/utils'
import { db } from '@/lib/supabase'

/* ── Mock data ─────────────────────────────────────────────── */
const MOCK_PROJECTS = [
  { id:1, name:'Clínica Familia Verde',      clients:{ name:'Dr. Javier Matos' }, plan:'BRV-02', status:'diseno',     progress:65,  value_dop:15000 },
  { id:2, name:'Restaurante La Cazuela',     clients:{ name:'María Rodríguez'  }, plan:'BRV-01', status:'desarrollo', progress:80,  value_dop:11000 },
  { id:3, name:'Portal Inmobiliaria Palma',  clients:{ name:'Carlos Sosa'      }, plan:'BRV-04', status:'revision',   progress:92,  value_dop:38000 },
  { id:4, name:'Plataforma Academia Digital',clients:{ name:'Ana Herrera'      }, plan:'BRV-02', status:'kickoff',    progress:12,  value_dop:15000 },
]
const MOCK_TASKS = [
  { id:1, title:'Entregar wireframes — Clínica Familia Verde', due_date: new Date().toISOString(),                    tag:'diseño',   priority:'urgente' },
  { id:2, title:'Revisar contrato — Inmobiliaria Palma',       due_date: new Date().toISOString(),                    tag:'admin',    priority:'alta'    },
  { id:3, title:'Subir avance a portal — La Cazuela',          due_date: new Date(Date.now()+86400000).toISOString(), tag:'dev',      priority:'normal'  },
  { id:4, title:'Enviar propuesta — Hotel Cibao Palace',       due_date: new Date(Date.now()+518400000).toISOString(),tag:'ventas',   priority:'alta'    },
  { id:5, title:'Factura — Academia Digital RD',               due_date: new Date(Date.now()+604800000).toISOString(),tag:'finanzas', priority:'normal'  },
]
const MOCK_FINANCES = [
  { type:'ingreso', amount_dop:9000,  amount:9000  }, { type:'ingreso', amount_dop:11000, amount:11000 },
  { type:'ingreso', amount_dop:19000, amount:19000 }, { type:'ingreso', amount_dop:9000,  amount:9000  },
  { type:'ingreso', amount_dop:11000, amount:11000 },
  { type:'egreso',  amount_dop:2200,  amount:2200  }, { type:'egreso',  amount_dop:2800,  amount:2800  },
  { type:'egreso',  amount_dop:1800,  amount:1800  }, { type:'egreso',  amount_dop:950,   amount:950   },
]
const CHART_DATA = [
  { mes:'Dic', ingresos:22000, egresos:7750  },
  { mes:'Ene', ingresos:33000, egresos:7750  },
  { mes:'Feb', ingresos:26000, egresos:7750  },
  { mes:'Mar', ingresos:49000, egresos:7750  },
  { mes:'Abr', ingresos:59000, egresos:7750  },
]
const PIPELINE = [
  { stage:'Nuevo',     value:25000 },
  { stage:'Reunión',   value:15000 },
  { stage:'Propuesta', value:38000 },
  { stage:'Negoc.',    value:11000 },
]
const PIPELINE_COLORS = ['rgba(18,24,42,.25)','#4d78bb','#ea6969','#d97706']

/* ── Custom Recharts tooltip ───────────────────────────────── */
function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'var(--w)', border:'1px solid var(--rule)', borderRadius:7, padding:'8px 12px', fontSize:11 }}>
      <p style={{ fontWeight:700, color:'var(--n40)', marginBottom:6, textTransform:'uppercase', letterSpacing:'.06em', fontSize:9 }}>{label}</p>
      {payload.map(p => (
        <div key={p.name} style={{ display:'flex', alignItems:'center', gap:6, marginBottom:3 }}>
          <span style={{ width:8, height:8, borderRadius:'50%', background:p.color, flexShrink:0 }} />
          <span style={{ color:'var(--gy)' }}>{p.name}:</span>
          <span style={{ fontWeight:700, color:'var(--nv)', fontFamily:'"JetBrains Mono",monospace' }}>{formatDOP(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

/* ── Dashboard ─────────────────────────────────────────────── */
export default function Dashboard() {
  const [projects, setProjects] = useState(MOCK_PROJECTS)
  const [tasks,    setTasks]    = useState(MOCK_TASKS)
  const [finances, setFinances] = useState(MOCK_FINANCES)

  useEffect(() => {
    Promise.all([db.projects.getAll(), db.tasks.getAll(), db.finances.getAll()]).then(([p,t,f]) => {
      if (p.data?.length) setProjects(p.data.map(normalizeProject))
      if (t.data?.length) setTasks(t.data.map(normalizeTask))
      if (f.data?.length) setFinances(f.data)
    }).catch(() => {})
  }, [])

  const active     = projects.filter(p => p.status !== 'finalizado' && p.status !== 'cancelado')
  const ingresos   = finances.filter(f => f.type === 'ingreso').reduce((s,f) => s + Number(f.amount_dop), 0)
  const egresos    = finances.filter(f => f.type === 'egreso' ).reduce((s,f) => s + Number(f.amount_dop), 0)
  const ganancia   = ingresos - egresos
  const pending    = tasks.filter(t => t.status !== 'completado' && t.status !== 'cancelado')
  const urgent     = tasks.filter(t => t.priority === 'urgente')

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <div style={{ maxWidth: 1200 }}>

      {/* ── Greeting — serif italic like braven-demo .sh ───── */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontFamily:'"Cormorant Garamond",Georgia,serif', fontStyle:'italic', fontWeight:300, fontSize:34, letterSpacing:'-.02em', color:'var(--nv)', lineHeight:1.1, marginBottom:6 }}>
          {greeting}, <em style={{ fontStyle:'normal', fontWeight:600, color:'var(--cr)' }}>Rony.</em>
        </h2>
        <p style={{ fontSize:13, color:'var(--gy)', fontWeight:300 }}>
          Tienes{' '}
          <strong style={{ color:'var(--nv)', fontWeight:700 }}>{urgent.length} tarea{urgent.length !== 1 ? 's' : ''} urgente{urgent.length !== 1 ? 's' : ''}</strong>
          {' '}y {active.length} proyectos en curso.
        </p>
      </div>

      {/* ── KPI row ──────────────────────────────────────────── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
        <KpiCard label="Proyectos activos"   value={active.length}      sub={`${projects.filter(p=>p.status==='finalizado').length} finalizados`} icon={FolderOpen}  trend={12}  />
        <KpiCard label="Ingresos del mes"    value={formatDOP(ingresos)} sub={`Egresos: ${formatDOP(egresos)}`}                                     icon={DollarSign}  trend={18}  />
        <KpiCard label="Ganancia neta"       value={formatDOP(ganancia)} sub="Este período"                                                         icon={TrendingUp}             />
        <KpiCard label="Tareas pendientes"   value={pending.length}     sub={`${urgent.length} urgentes`}                                           icon={CheckSquare}           />
      </div>

      {/* ── Charts ───────────────────────────────────────────── */}
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:12, marginBottom:20 }}>

        <div className="brv-card">
          <SectionHeader title="Ingresos vs. Egresos" />
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={CHART_DATA} margin={{ top:4, right:4, left:-20, bottom:0 }}>
              <defs>
                <linearGradient id="gI" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#ea6969" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#ea6969" stopOpacity={0}    />
                </linearGradient>
                <linearGradient id="gE" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#12182a" stopOpacity={0.08} />
                  <stop offset="95%" stopColor="#12182a" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--rule)" vertical={false} />
              <XAxis dataKey="mes" tick={{ fill:'var(--n40)', fontSize:10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:'var(--n40)', fontSize:9 }} axisLine={false} tickLine={false} tickFormatter={v=>`${v/1000}k`} />
              <Tooltip content={<ChartTip />} />
              <Area type="monotone" dataKey="ingresos" name="Ingresos" stroke="#ea6969" strokeWidth={2} fill="url(#gI)" dot={false} />
              <Area type="monotone" dataKey="egresos"  name="Egresos"  stroke="#12182a" strokeWidth={1.5} fill="url(#gE)" dot={false} strokeDasharray="4 2" />
            </AreaChart>
          </ResponsiveContainer>
          <div style={{ display:'flex', gap:16, marginTop:8 }}>
            {[['#ea6969','Ingresos'],['#12182a','Egresos']].map(([c,l]) => (
              <span key={l} style={{ display:'flex', alignItems:'center', gap:5, fontSize:10, color:'var(--n40)', fontWeight:600 }}>
                <span style={{ width:16, height:2, background:c, borderRadius:1, display:'inline-block' }} />{l}
              </span>
            ))}
          </div>
        </div>

        <div className="brv-card">
          <SectionHeader title="Pipeline" />
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={PIPELINE} margin={{ top:4, right:0, left:-28, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--rule)" horizontal={false} />
              <XAxis dataKey="stage" tick={{ fill:'var(--n40)', fontSize:9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:'var(--n40)', fontSize:9 }} axisLine={false} tickLine={false} tickFormatter={v=>`${v/1000}k`} />
              <Tooltip content={<ChartTip />} />
              <Bar dataKey="value" name="Valor" radius={[4,4,0,0]}>
                {PIPELINE.map((_, i) => <Cell key={i} fill={PIPELINE_COLORS[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ marginTop:10, paddingTop:10, borderTop:'1px solid var(--rule)' }}>
            <div style={{ fontSize:10, color:'var(--n40)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.07em' }}>Total pipeline</div>
            <div style={{ fontFamily:'"Plus Jakarta Sans"', fontWeight:800, fontSize:18, letterSpacing:'-.04em', color:'var(--nv)', marginTop:2 }}>
              RD$89,000
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom row: projects + tasks ─────────────────────── */}
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:12 }}>

        {/* Projects table */}
        <div className="brv-card">
          <SectionHeader
            title="Proyectos Activos"
            action={
              <Link to="/projects" className="brv-btn brv-btn-ghost brv-btn-sm" style={{ fontSize:11, gap:4 }}>
                Ver todos <ArrowRight size={11} />
              </Link>
            }
          />
          <table className="brv-table">
            <thead>
              <tr>
                <th>Proyecto</th>
                <th>Plan</th>
                <th>Estado</th>
                <th>Progreso</th>
                <th style={{ textAlign:'right' }}>Valor</th>
              </tr>
            </thead>
            <tbody>
              {active.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ fontSize:13, color:'var(--nv)', fontWeight:600 }}>{p.name}</div>
                    {p.clients && <div style={{ fontSize:11, color:'var(--n40)', fontWeight:300 }}>{p.clients.name}</div>}
                  </td>
                  <td><PlanBadge plan={p.plan} /></td>
                  <td><StatusBadge status={p.status} /></td>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:6, minWidth:80 }}>
                      <ProgressBar value={p.progress} />
                      <span style={{ fontSize:10, color:'var(--n40)', minWidth:26, fontFamily:'"JetBrains Mono",monospace' }}>{p.progress}%</span>
                    </div>
                  </td>
                  <td style={{ textAlign:'right', fontFamily:'"JetBrains Mono",monospace', fontSize:11, color:'var(--nv)', fontWeight:500 }}>
                    {formatDOP(p.value_dop)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tasks */}
        <div className="brv-card">
          <SectionHeader
            title="Tareas Pendientes"
            action={
              <Link to="/tasks" className="brv-btn brv-btn-ghost brv-btn-sm" style={{ fontSize:11, gap:4 }}>
                Ver <ArrowRight size={11} />
              </Link>
            }
          />
          <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:6 }}>
            {pending.slice(0,5).map(t => {
              const isUrgent = t.priority === 'urgente' || t.priority === 'alta'
              return (
                <li
                  key={t.id}
                  style={{
                    display:'flex', alignItems:'flex-start', gap:9,
                    padding:'9px 11px', borderRadius:7,
                    background:'var(--p)',
                    border:`1px solid ${isUrgent ? '#ea696930' : 'var(--rule)'}`,
                    transition:'border-color .15s',
                  }}
                >
                  <PriorityDot priority={t.priority} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:12, fontWeight:600, color:'var(--nv)', lineHeight:1.35 }}>{t.title}</p>
                    <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:4, flexWrap:'wrap' }}>
                      <TagBadge tag={t.tag} />
                      <span style={{ fontSize:10, color:'var(--n40)' }}>{relativeDate(t.due_date)}</span>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>

      </div>

      {/* ── Quick stats row — .pc-grid style from braven-demo ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', border:'1px solid var(--rule)', borderRadius:14, overflow:'hidden', marginTop:20, background:'var(--w)' }}>
        {[
          { n:'01', icon:TrendingUp,    label:'Pipeline total',           val:'RD$89,000' },
          { n:'02', icon:AlertTriangle, label:'Proyectos urgentes',       val:'2'          },
          { n:'03', icon:Wrench,        label:'Mantenimientos activos',   val:'0'          },
          { n:'04', icon:Users,         label:'Clientes activos',         val:'5'          },
        ].map(({ n, icon:Icon, label, val }, i) => (
          <div
            key={n}
            style={{
              padding:'28px 24px',
              borderRight: i < 3 ? '1px solid var(--rule)' : 'none',
              position:'relative', overflow:'hidden',
              transition:'background .2s',
              cursor:'default',
            }}
            className="stat-cell"
          >
            {/* Ghost serif number */}
            <div style={{ position:'absolute', bottom:-8, right:4, fontFamily:'"Cormorant Garamond"', fontSize:72, fontStyle:'italic', fontWeight:300, color:'var(--n05)', lineHeight:1 }}>
              {n}
            </div>
            <div style={{ width:32, height:32, borderRadius:'50%', background:'var(--nv)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14, transition:'background .2s' }} className="stat-icon">
              <Icon size={14} style={{ color:'var(--p)' }} />
            </div>
            <div style={{ fontFamily:'"Plus Jakarta Sans"', fontWeight:800, fontSize:20, letterSpacing:'-.04em', color:'var(--nv)' }}>{val}</div>
            <div style={{ fontSize:12, fontWeight:300, color:'var(--gy)', marginTop:4, lineHeight:1.5 }}>{label}</div>
          </div>
        ))}
        <style>{`.stat-cell:hover{background:var(--p2)}.stat-cell:hover .stat-icon{background:var(--cr)!important}`}</style>
      </div>

    </div>
  )
}
