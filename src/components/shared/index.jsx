import { cn, PLAN_CONFIG, STATUS_CONFIG, LEAD_STAGES, PRIORITY_CONFIG, TAG_CONFIG } from '@/lib/utils'

/* ── Badge ─────────────────────────────────────────────────── */
export function Badge({ label, color }) {
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center',
        padding: '3px 9px', borderRadius: 100,
        fontSize: 10, fontWeight: 700,
        letterSpacing: '.05em', textTransform: 'uppercase',
        background: `${color}14`,
        color,
        border: `1px solid ${color}28`,
      }}
    >
      {label}
    </span>
  )
}

export const PlanBadge    = ({ plan })     => { const c = PLAN_CONFIG[plan];     return c ? <Badge label={c.label} color={c.color} /> : null }
export const StatusBadge  = ({ status })   => { const c = STATUS_CONFIG[status]; return c ? <Badge label={c.label} color={c.color} /> : null }
export const StageBadge   = ({ stage })    => { const c = LEAD_STAGES[stage];    return c ? <Badge label={c.label} color={c.color} /> : null }

export function PriorityDot({ priority }) {
  const c = PRIORITY_CONFIG[priority]
  if (!c) return null
  return (
    <span
      style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: c.color, flexShrink: 0 }}
      title={c.label}
    />
  )
}

export function TagBadge({ tag }) {
  const key = tag?.toLowerCase()
  const c = TAG_CONFIG[key] ?? { bg: 'rgba(18,24,42,.06)', text: 'rgba(18,24,42,.4)' }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 7px', borderRadius: 100, fontSize: 9, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', background: c.bg, color: c.text }}>
      {tag}
    </span>
  )
}

/* ── Progress ──────────────────────────────────────────────── */
export function ProgressBar({ value = 0, color }) {
  const fill = value === 100 ? '#2a9d5c' : (color ?? 'var(--cr)')
  return (
    <div className="brv-prog-track" style={{ flex: 1 }}>
      <div className="brv-prog-fill" style={{ width: `${value}%`, background: fill }} />
    </div>
  )
}

/* ── KPI Card — same structure as .pc in braven-demo ──────── */
export function KpiCard({ label, value, sub, icon: Icon, color, trend }) {
  return (
    <div className="brv-kpi" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Ghost number — decorative, from .pc-g in braven-demo */}
      <div style={{
        position: 'absolute', bottom: -8, right: 6,
        fontFamily: '"Cormorant Garamond", Georgia, serif',
        fontSize: 72, fontStyle: 'italic', fontWeight: 300,
        lineHeight: 1, color: 'var(--n05)', pointerEvents: 'none',
        userSelect: 'none',
      }}>
        {typeof value === 'number' ? value : ''}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        {/* Circle icon — from .pc-circle in braven-demo */}
        <div
          style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'var(--nv)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            transition: 'background .2s',
          }}
          className="kpi-circle"
        >
          <Icon size={16} style={{ color: 'var(--p)' }} />
        </div>

        {trend !== undefined && (
          <span style={{
            fontSize: 10, fontWeight: 700,
            background: trend >= 0 ? '#2a9d5c12' : '#dc262612',
            color: trend >= 0 ? '#2a9d5c' : '#dc2626',
            padding: '3px 8px', borderRadius: 100,
          }}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>

      <div
        style={{
          fontFamily: '"Plus Jakarta Sans"',
          fontWeight: 800,
          fontSize: 24,
          letterSpacing: '-.04em',
          color: 'var(--nv)',
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--gy)', marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--n40)', marginTop: 2 }}>{sub}</div>}

      <style>{`.brv-kpi:hover .kpi-circle{background:var(--cr)!important}`}</style>
    </div>
  )
}

/* ── Section header — brv-label style ─────────────────────── */
export function SectionHeader({ title, serif, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
      <div>
        {serif ? (
          <h2 style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontWeight: 300, fontStyle: 'italic', fontSize: 22, letterSpacing: '-.02em', color: 'var(--nv)' }}>
            {title}
          </h2>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 18, height: 1.5, background: 'var(--cr)', display: 'inline-block', flexShrink: 0 }} />
            <h2 style={{ fontWeight: 700, fontSize: 13, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--n40)' }}>
              {title}
            </h2>
          </div>
        )}
      </div>
      {action}
    </div>
  )
}

/* ── Card wrapper ─────────────────────────────────────────── */
export function Card({ children, className, style }) {
  return (
    <div className={cn('brv-card', className)} style={style}>
      {children}
    </div>
  )
}

/* ── Empty state ──────────────────────────────────────────── */
export function EmptyState({ icon: Icon, title, desc, action }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 16px', textAlign: 'center' }}>
      {Icon && (
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--nv)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <Icon size={20} style={{ color: 'var(--p)' }} />
        </div>
      )}
      <p style={{ fontWeight: 700, fontSize: 14, letterSpacing: '-.02em', color: 'var(--nv)', marginBottom: 6 }}>{title}</p>
      {desc && <p style={{ fontSize: 12, color: 'var(--gy)', maxWidth: 220 }}>{desc}</p>}
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  )
}
