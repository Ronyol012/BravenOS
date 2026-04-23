import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(
  supabaseUrl ?? 'https://qkguauyaetqwxvomxjbh.supabase.co',
  supabaseKey ?? 'placeholder'
)

export const signInWithEmail = (email, password) =>
  supabase.auth.signInWithPassword({ email, password })

export const signOut = () => supabase.auth.signOut()

// ─── DB helpers ajustados al schema real de Supabase ──────────────────────
// Mapeo de columnas reales:
//   projects  → stage, progress_pct, total_amount, delivery_date, site_url, github_url, figma_url
//   clients   → company (not business), status 'active'
//   tasks     → status 'pending'/'done', priority, tag
//   pipeline  → tabla pipeline con campos de lead
//   finances  → tabla transactions (type: ingreso/egreso)
//   messages  → body (not content), sender
//   maintenance → fee, next_billing, status 'active'

export const db = {
  projects: {
    getAll: () => supabase
      .from('projects')
      .select('*, clients(name, email, company)')
      .order('created_at', { ascending: false }),
    getById: (id) => supabase
      .from('projects')
      .select('*, clients(name, email, company), tasks(*), messages(*)')
      .eq('id', id)
      .single(),
    create: (d) => supabase.from('projects').insert(d).select().single(),
    update: (id, d) => supabase.from('projects').update(d).eq('id', id).select().single(),
    delete: (id) => supabase.from('projects').delete().eq('id', id),
  },

  clients: {
    getAll: () => supabase
      .from('clients')
      .select('*, projects(id, name, stage)')
      .order('created_at', { ascending: false }),
    getById: (id) => supabase
      .from('clients')
      .select('*, projects(*)')
      .eq('id', id)
      .single(),
    create: (d) => supabase.from('clients').insert(d).select().single(),
    update: (id, d) => supabase.from('clients').update(d).eq('id', id).select().single(),
    delete: (id) => supabase.from('clients').delete().eq('id', id),
  },

  // pipeline = tabla leads/CRM
  leads: {
    getAll: () => supabase
      .from('pipeline')
      .select('*, clients(name, email, company)')
      .order('created_at', { ascending: false }),
    create: (d) => supabase.from('pipeline').insert(d).select().single(),
    update: (id, d) => supabase.from('pipeline').update(d).eq('id', id).select().single(),
    delete: (id) => supabase.from('pipeline').delete().eq('id', id),
  },

  // finances = tabla transactions
  finances: {
    getAll: () => supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false }),
    create: (d) => supabase.from('transactions').insert(d).select().single(),
    update: (id, d) => supabase.from('transactions').update(d).eq('id', id).select().single(),
    delete: (id) => supabase.from('transactions').delete().eq('id', id),
  },

  // invoices = facturas separadas
  invoices: {
    getAll: () => supabase
      .from('invoices')
      .select('*, projects(name), clients(name)')
      .order('created_at', { ascending: false }),
    create: (d) => supabase.from('invoices').insert(d).select().single(),
    update: (id, d) => supabase.from('invoices').update(d).eq('id', id).select().single(),
  },

  tasks: {
    getAll: () => supabase
      .from('tasks')
      .select('*, projects(name), clients(name)')
      .order('due_date', { ascending: true }),
    getByProject: (projectId) => supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId),
    create: (d) => supabase.from('tasks').insert(d).select().single(),
    update: (id, d) => supabase.from('tasks').update(d).eq('id', id).select().single(),
    delete: (id) => supabase.from('tasks').delete().eq('id', id),
  },

  maintenance: {
    getAll: () => supabase
      .from('maintenance')
      .select('*, clients(name, email), projects(name)')
      .order('next_billing', { ascending: true }),
    create: (d) => supabase.from('maintenance').insert(d).select().single(),
    update: (id, d) => supabase.from('maintenance').update(d).eq('id', id).select().single(),
  },

  quotes: {
    getAll: () => supabase
      .from('quotes')
      .select('*, clients(name)')
      .order('created_at', { ascending: false }),
    create: (d) => supabase.from('quotes').insert(d).select().single(),
    update: (id, d) => supabase.from('quotes').update(d).eq('id', id).select().single(),
  },

  contracts: {
    getAll: () => supabase
      .from('contracts')
      .select('*')
      .order('createdAt', { ascending: false }),
    create: (d) => supabase.from('contracts').insert(d).select().single(),
    update: (id, d) => supabase.from('contracts').update(d).eq('id', id).select().single(),
  },

  messages: {
    getAll: () => supabase
      .from('messages')
      .select('*, clients(name), projects(name)')
      .order('created_at', { ascending: false }),
    getByProject: (projectId) => supabase
      .from('messages')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true }),
    create: (d) => supabase.from('messages').insert(d).select().single(),
    update: (id, d) => supabase.from('messages').update(d).eq('id', id).select().single(),
  },
}

// ─── Token helpers ────────────────────────────────────────────────────────
export const tokenDB = {
  getAll: () => supabase
    .from('client_tokens')
    .select('*, projects(name, stage, progress_pct, plan, figma_url, site_url, delivery_date), clients(name, email)')
    .order('created_at', { ascending: false }),

  getByToken: (token) => supabase
    .from('client_tokens')
    .select('*, projects(*, clients(name, email)), clients(name, email)')
    .eq('token', token)
    .eq('status', 'activo')
    .single(),

  create: (d) => supabase.from('client_tokens').insert(d).select().single(),
  revoke:  (id) => supabase.from('client_tokens').update({ status: 'revocado' }).eq('id', id).select().single(),
  logAccess: (id) => supabase.from('client_tokens').update({
    last_access: new Date().toISOString(),
    access_count: supabase.rpc('increment_access', { row_id: id }),
  }).eq('id', id),
}

// ─── Token generator — BRV-XXXXXX formato legible ────────────────────────
export function generateToken() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'BRV-'
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}
