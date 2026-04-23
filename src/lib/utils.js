import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export const cn = (...inputs) => twMerge(clsx(inputs))

export const formatDOP = (n) =>
  new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP', maximumFractionDigits: 0 }).format(n ?? 0)

export const formatDate = (d) => {
  if (!d) return '—'
  return new Intl.DateTimeFormat('es-DO', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(d))
}

export const formatDateShort = (d) => {
  if (!d) return '—'
  return new Intl.DateTimeFormat('es-DO', { day: 'numeric', month: 'short' }).format(new Date(d))
}

export const relativeDate = (d) => {
  if (!d) return '—'
  const diff = Math.floor((new Date(d) - new Date()) / 86400000)
  if (diff === 0)  return 'Hoy'
  if (diff === 1)  return 'Mañana'
  if (diff === -1) return 'Ayer'
  if (diff < 0)    return 'Hace ' + Math.abs(diff) + 'd'
  return 'En ' + diff + 'd'
}

export const C = {
  navy:'#12182a', coral:'#ea6969', blue:'#4d78bb', gray:'#5e5d5d',
  success:'#2a9d5c', warning:'#d97706', danger:'#dc2626',
  n40:'rgba(18,24,42,.4)', n20:'rgba(18,24,42,.2)', n05:'rgba(18,24,42,.05)',
  rule:'rgba(18,24,42,.11)',
}

export const PLAN_CONFIG = {
  'BRV-01': { label:'Lanzamiento', color:C.navy    },
  'BRV-02': { label:'Portafolio',  color:C.blue    },
  'BRV-03': { label:'Crecimiento', color:C.coral   },
  'BRV-04': { label:'Ecommerce',   color:C.success },
}

// projects.stage — real DB values + legacy Spanish aliases
export const STATUS_CONFIG = {
  brief:       { label:'Brief',          color:C.blue    },
  design:      { label:'En Diseño',      color:C.coral   },
  development: { label:'En Desarrollo',  color:C.warning },
  review:      { label:'Revisión',       color:C.success },
  adjustments: { label:'Ajustes',        color:C.danger  },
  delivered:   { label:'Entregado',      color:C.n40     },
  cancelled:   { label:'Cancelado',      color:C.gray    },
  kickoff:     { label:'Kickoff',        color:C.blue    },
  diseno:      { label:'En Diseño',      color:C.coral   },
  desarrollo:  { label:'En Desarrollo',  color:C.warning },
  revision:    { label:'Revisión',       color:C.success },
  ajustes:     { label:'Ajustes',        color:C.danger  },
  finalizado:  { label:'Finalizado',     color:C.n40     },
  cancelado:   { label:'Cancelado',      color:C.gray    },
}

// pipeline.stage
export const LEAD_STAGES = {
  nuevo:        { label:'Nuevo Lead',   color:C.n40     },
  contactado:   { label:'Contactado',   color:C.blue    },
  reunion:      { label:'Reunión',      color:C.coral   },
  propuesta:    { label:'Propuesta',    color:C.warning },
  negociacion:  { label:'Negociación',  color:C.danger  },
  ganado:       { label:'Ganado',       color:C.success },
  perdido:      { label:'Perdido',      color:C.gray    },
}

// tasks.status — real DB = 'pending' / 'done'
export const TASK_STATUS = {
  pending:     { label:'Pendiente',    color:C.coral   },
  in_progress: { label:'En progreso',  color:C.warning },
  done:        { label:'Completada',   color:C.success },
  cancelled:   { label:'Cancelada',    color:C.gray    },
  pendiente:   { label:'Pendiente',    color:C.coral   },
  en_progreso: { label:'En progreso',  color:C.warning },
  completado:  { label:'Completada',   color:C.success },
}

export const PRIORITY_CONFIG = {
  baja:    { label:'Baja',    color:C.n40     },
  normal:  { label:'Normal',  color:C.blue    },
  alta:    { label:'Alta',    color:C.warning },
  urgente: { label:'Urgente', color:C.coral   },
}

export const TAG_CONFIG = {
  diseño:   { bg:C.coral+'12',   text:C.coral   },
  dev:      { bg:C.blue+'12',    text:C.blue    },
  admin:    { bg:C.warning+'12', text:C.warning },
  cliente:  { bg:C.success+'12', text:C.success },
  ventas:   { bg:C.success+'12', text:C.success },
  finanzas: { bg:C.danger+'12',  text:C.danger  },
  legal:    { bg:C.warning+'12', text:C.warning },
}

// clients.status — real DB = 'active'
export const CLIENT_STATUS = {
  active:    { label:'Activo',    color:C.success },
  inactive:  { label:'Inactivo',  color:C.gray    },
  prospect:  { label:'Prospecto', color:C.blue    },
  activo:    { label:'Activo',    color:C.success },
  inactivo:  { label:'Inactivo',  color:C.gray    },
  prospecto: { label:'Prospecto', color:C.blue    },
}

// Normaliza un proyecto de Supabase para uso interno del OS
export function normalizeProject(p) {
  if (!p) return p
  return {
    ...p,
    status:    p.stage        ?? p.status,
    progress:  p.progress_pct ?? p.progress   ?? 0,
    value_dop: p.total_amount ?? p.value_dop  ?? 0,
    due_date:  p.delivery_date ?? p.due_date,
    live_url:  p.site_url     ?? p.live_url   ?? '',
    clients: p.clients ? {
      ...p.clients,
      business: p.clients.company ?? p.clients.business ?? '',
    } : p.clients,
  }
}

// Normaliza una tarea para uso interno
export function normalizeTask(t) {
  if (!t) return t
  const statusMap = { pending:'pendiente', done:'completado', in_progress:'en_progreso' }
  return { ...t, status: statusMap[t.status] ?? t.status }
}
