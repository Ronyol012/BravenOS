-- ═══════════════════════════════════════════════
-- BRAVEN OS — Schema · Supabase SQL Editor
-- Proyecto: qkguauyaetqwxvomxjbh.supabase.co
-- ═══════════════════════════════════════════════
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL, business TEXT, email TEXT, phone TEXT,
  whatsapp TEXT, sector TEXT, city TEXT DEFAULT 'Santo Domingo',
  status TEXT DEFAULT 'activo' CHECK (status IN ('activo','inactivo','prospecto')),
  source TEXT, notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  plan TEXT NOT NULL CHECK (plan IN ('BRV-01','BRV-02','BRV-03','BRV-04')),
  status TEXT DEFAULT 'kickoff' CHECK (status IN ('kickoff','diseno','desarrollo','revision','ajustes','finalizado','cancelado')),
  progress INTEGER DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  value_dop NUMERIC(12,2), paid_amount NUMERIC(12,2) DEFAULT 0,
  start_date DATE, due_date DATE, delivery_date DATE,
  figma_url TEXT, repo_url TEXT, live_url TEXT, netlify_id TEXT, notes TEXT,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('baja','normal','alta','urgente')),
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL, business TEXT, email TEXT, phone TEXT,
  sector TEXT, stage TEXT DEFAULT 'nuevo'
    CHECK (stage IN ('nuevo','contactado','reunion','propuesta','negociacion','ganado','perdido')),
  estimated_value NUMERIC(12,2), plan_interest TEXT, source TEXT, notes TEXT,
  next_followup DATE, converted_client_id UUID REFERENCES clients(id),
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE finances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('ingreso','egreso')),
  category TEXT, description TEXT NOT NULL,
  amount_dop NUMERIC(12,2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  payment_method TEXT DEFAULT 'transferencia',
  invoice_num TEXT, receipt_url TEXT, notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL, description TEXT,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pendiente' CHECK (status IN ('pendiente','en_progreso','completado','cancelado')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('baja','normal','alta','urgente')),
  tag TEXT, due_date DATE, completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE maintenance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  plan_name TEXT NOT NULL, monthly_fee NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'activo' CHECK (status IN ('activo','pausado','cancelado')),
  start_date DATE NOT NULL, next_date DATE, notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_number TEXT UNIQUE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  title TEXT NOT NULL, plan TEXT,
  items JSONB DEFAULT '[]',
  subtotal_dop NUMERIC(12,2), discount_pct NUMERIC(5,2) DEFAULT 0,
  itbis_pct NUMERIC(5,2) DEFAULT 0, total_dop NUMERIC(12,2),
  validity_days INTEGER DEFAULT 15,
  status TEXT DEFAULT 'borrador' CHECK (status IN ('borrador','enviada','aprobada','rechazada','vencida')),
  notes TEXT, pdf_url TEXT, sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_number TEXT UNIQUE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
  title TEXT NOT NULL, total_dop NUMERIC(12,2), payment_terms TEXT,
  status TEXT DEFAULT 'borrador' CHECK (status IN ('borrador','enviado','firmado','cancelado')),
  signed_at TIMESTAMPTZ, pdf_url TEXT, client_portal_url TEXT, notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  channel TEXT DEFAULT 'whatsapp' CHECK (channel IN ('whatsapp','email','instagram','telefono','presencial')),
  direction TEXT DEFAULT 'enviado' CHECK (direction IN ('recibido','enviado')),
  subject TEXT, content TEXT NOT NULL,
  status TEXT DEFAULT 'enviado' CHECK (status IN ('borrador','enviado','leido','respondido')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Triggers updated_at
CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at=NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

CREATE TRIGGER clients_uat    BEFORE UPDATE ON clients    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER projects_uat   BEFORE UPDATE ON projects   FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER leads_uat      BEFORE UPDATE ON leads      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tasks_uat      BEFORE UPDATE ON tasks      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER maintenance_uat BEFORE UPDATE ON maintenance FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER quotes_uat     BEFORE UPDATE ON quotes     FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER contracts_uat  BEFORE UPDATE ON contracts  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-numbering quotes
CREATE OR REPLACE FUNCTION gen_quote_number() RETURNS TRIGGER AS $$
DECLARE n INTEGER;
BEGIN SELECT COALESCE(MAX(CAST(SUBSTRING(quote_number FROM 9) AS INTEGER)),0)+1 INTO n FROM quotes WHERE quote_number IS NOT NULL;
NEW.quote_number='BRV-COT-'||LPAD(n::TEXT,4,'0'); RETURN NEW; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER quotes_num BEFORE INSERT ON quotes FOR EACH ROW WHEN (NEW.quote_number IS NULL) EXECUTE FUNCTION gen_quote_number();

-- Auto-numbering contracts
CREATE OR REPLACE FUNCTION gen_contract_number() RETURNS TRIGGER AS $$
DECLARE n INTEGER;
BEGIN SELECT COALESCE(MAX(CAST(SUBSTRING(contract_number FROM 10) AS INTEGER)),0)+1 INTO n FROM contracts WHERE contract_number IS NOT NULL;
NEW.contract_number='BRV-CONT-'||LPAD(n::TEXT,4,'0'); RETURN NEW; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER contracts_num BEFORE INSERT ON contracts FOR EACH ROW WHEN (NEW.contract_number IS NULL) EXECUTE FUNCTION gen_contract_number();

-- Indexes
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_client ON projects(client_id);
CREATE INDEX idx_leads_stage     ON leads(stage);
CREATE INDEX idx_finances_date   ON finances(date);
CREATE INDEX idx_tasks_status    ON tasks(status);
CREATE INDEX idx_tasks_due       ON tasks(due_date);
CREATE INDEX idx_clients_name    ON clients USING GIN (name gin_trgm_ops);
CREATE INDEX idx_projects_name   ON projects USING GIN (name gin_trgm_ops);

-- Seed data
INSERT INTO clients (name, business, email, phone, sector, city, status) VALUES
  ('Dr. Javier Matos',  'Clínica Familia Verde',   'jmatos@gmail.com',  '809-555-0101','servicios','Santo Domingo','activo'),
  ('María Rodríguez',   'Restaurante La Cazuela',  'maria@lacazuela.do','829-555-0102','alimentos', 'Santiago',     'activo'),
  ('Carlos Sosa',       'Inmobiliaria Palma',       'csosa@palma.do',   '849-555-0103','servicios','Santo Domingo','activo'),
  ('Ana Herrera',       'Academia Digital RD',      'ana@academia.do',  '809-555-0104','servicios','Santo Domingo','activo'),
  ('Pedro García',      'Ferretería Don Pepe',      'pedro@donpepe.do', '829-555-0105','servicios','La Romana',    'activo');


-- ─── CLIENT TOKENS (Portal de cliente) ──────────────────────────────────────
CREATE TABLE client_tokens (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token       TEXT UNIQUE NOT NULL,             -- BRV-XXXX código legible
  project_id  UUID REFERENCES projects(id) ON DELETE CASCADE,
  client_id   UUID REFERENCES clients(id)  ON DELETE CASCADE,
  label       TEXT,                             -- nombre descriptivo interno
  status      TEXT DEFAULT 'activo'
              CHECK (status IN ('activo','expirado','revocado')),
  expires_at  TIMESTAMPTZ,                      -- null = no expira
  last_access TIMESTAMPTZ,
  access_count INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tokens_token     ON client_tokens(token);
CREATE INDEX idx_tokens_project   ON client_tokens(project_id);
CREATE INDEX idx_tokens_status    ON client_tokens(status);
