// File: scripts/email-dashboard.js
// Dashboard de campañas email para Braven OS
// Configuración vía window.BRAVEN_EMAIL_CONFIG

class EmailDashboard {
  constructor() {
    // Configuración desde objeto global (setear en HTML antes de cargar este script)
    const config = window.BRAVEN_EMAIL_CONFIG || {}
    this.supabaseUrl = config.supabaseUrl || 'https://qkguauyaetqwxvomxjbh.supabase.co'
    this.supabaseKey = config.supabaseKey || ''
    this.netlifyFunctionUrl = config.netlifyFunctionUrl || 'https://webbraven.netlify.app/.netlify/functions/campaign-launcher'
    this.isLaunching = false
  }

  // Renderizar el dashboard
  render() {
    const container = document.createElement('section')
    container.id = 'email-dashboard'
    container.className = 'email-dashboard'
    container.innerHTML = `
      <div class="email-dashboard-wrapper">
        <div class="email-dashboard-header">
          <div>
            <h2>📧 Campañas Email</h2>
            <p>Automatización Braven Studio</p>
          </div>
          <button id="launch-campaign-btn" class="btn-launch-campaign">
            🚀 LANZAR CAMPAÑA
          </button>
        </div>

        <div id="email-stats" class="email-stats">
          <div class="stat-card">
            <div class="stat-label">Total Leads</div>
            <div class="stat-value" id="total-leads">-</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">🔥 HOT</div>
            <div class="stat-value" id="hot-leads">-</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">🟡 CALIENTE</div>
            <div class="stat-value" id="caliente-leads">-</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">🔵 TIBIO</div>
            <div class="stat-value" id="tibio-leads">-</div>
          </div>
        </div>

        <div id="email-campaigns" class="email-campaigns">
          <div class="campaign-card">
            <h3>Campaign 1: Presentación</h3>
            <div class="campaign-stats">
              <div>Enviados: <span id="c1-sent">-</span></div>
              <div>Abiertos: <span id="c1-opened">-</span> (<span id="c1-open-rate">-</span>%)</div>
              <div>Clicks: <span id="c1-clicked">-</span> (<span id="c1-click-rate">-</span>%)</div>
            </div>
          </div>

          <div class="campaign-card">
            <h3>Campaign 2: Caso de Uso</h3>
            <div class="campaign-stats">
              <div>Enviados: <span id="c2-sent">-</span></div>
              <div>Abiertos: <span id="c2-opened">-</span> (<span id="c2-open-rate">-</span>%)</div>
              <div>Clicks: <span id="c2-clicked">-</span> (<span id="c2-click-rate">-</span>%)</div>
            </div>
          </div>

          <div class="campaign-card">
            <h3>Campaign 3: Última Oportunidad</h3>
            <div class="campaign-stats">
              <div>Enviados: <span id="c3-sent">-</span></div>
              <div>Abiertos: <span id="c3-opened">-</span> (<span id="c3-open-rate">-</span>%)</div>
              <div>Clicks: <span id="c3-clicked">-</span> (<span id="c3-click-rate">-</span>%)</div>
            </div>
          </div>
        </div>

        <div id="email-logs" class="email-logs">
          <h3>Últimas Acciones</h3>
          <div id="logs-list">
            <p style="color: #999; font-size: 0.9rem;">Esperando datos...</p>
          </div>
        </div>
      </div>
    `

    // Event listener para el botón
    const btn = container.querySelector('#launch-campaign-btn')
    if (btn) {
      btn.addEventListener('click', () => this.launchCampaign())
    }

    // Cargar datos
    if (this.supabaseKey) {
      this.loadMetrics()
      setInterval(() => this.loadMetrics(), 30000) // Refresh cada 30s
    } else {
      console.warn('EmailDashboard: Supabase key not configured. Set window.BRAVEN_EMAIL_CONFIG')
    }

    return container
  }

  // Cargar métricas desde Supabase
  async loadMetrics() {
    try {
      const response = await fetch(
        `${this.supabaseUrl}/rest/v1/email_campaign_summary`,
        {
          headers: {
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`
          }
        }
      )
      
      if (response.ok) {
        const data = await response.json()
        if (data.length > 0) {
          this.updateStats(data[0])
        }
      }
    } catch (error) {
      console.error('EmailDashboard: Error loading metrics', error)
    }
  }

  // Actualizar stats en UI
  updateStats(summary) {
    const safe = (val) => val || 0
    const percent = (part, total) => total > 0 ? Math.round((part / total) * 100) : 0

    document.getElementById('total-leads').textContent = safe(summary.total_leads)
    document.getElementById('hot-leads').textContent = safe(summary.hot_leads)
    document.getElementById('caliente-leads').textContent = safe(summary.caliente_leads)
    document.getElementById('tibio-leads').textContent = safe(summary.tibio_leads)

    // Campaign 1
    document.getElementById('c1-sent').textContent = safe(summary.campaign_1_sent)
    document.getElementById('c1-opened').textContent = safe(summary.campaign_1_opened)
    document.getElementById('c1-clicked').textContent = safe(summary.campaign_1_clicked)
    document.getElementById('c1-open-rate').textContent = percent(summary.campaign_1_opened, summary.campaign_1_sent)
    document.getElementById('c1-click-rate').textContent = percent(summary.campaign_1_clicked, summary.campaign_1_sent)

    // Campaign 2
    document.getElementById('c2-sent').textContent = safe(summary.campaign_2_sent)
    document.getElementById('c2-opened').textContent = safe(summary.campaign_2_opened)
    document.getElementById('c2-clicked').textContent = safe(summary.campaign_2_clicked)
    document.getElementById('c2-open-rate').textContent = percent(summary.campaign_2_opened, summary.campaign_2_sent)
    document.getElementById('c2-click-rate').textContent = percent(summary.campaign_2_clicked, summary.campaign_2_sent)

    // Campaign 3
    document.getElementById('c3-sent').textContent = safe(summary.campaign_3_sent)
    document.getElementById('c3-opened').textContent = safe(summary.campaign_3_opened)
    document.getElementById('c3-clicked').textContent = safe(summary.campaign_3_clicked)
    document.getElementById('c3-open-rate').textContent = percent(summary.campaign_3_opened, summary.campaign_3_sent)
    document.getElementById('c3-click-rate').textContent = percent(summary.campaign_3_clicked, summary.campaign_3_sent)
  }

  // Lanzar campaña
  async launchCampaign() {
    if (this.isLaunching) return
    
    if (!confirm('¿Estás seguro de que querés lanzar la campaña? Se enviarán los 50 emails.')) {
      return
    }

    this.isLaunching = true
    const btn = document.getElementById('launch-campaign-btn')
    btn.disabled = true
    btn.textContent = '🔄 Lanzando...'

    try {
      const response = await fetch(this.netlifyFunctionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'launch-campaign' })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error lanzando campaña')
      }

      alert('✅ Campaña lanzada exitosamente!\n\nCampaign 1: Enviada ahora\nCampaign 2: En 3 días\nCampaign 3: En 7 días')
      
      // Recargar métricas
      setTimeout(() => this.loadMetrics(), 2000)
    } catch (error) {
      console.error('Launch error:', error)
      alert('❌ Error: ' + error.message)
    } finally {
      this.isLaunching = false
      btn.disabled = false
      btn.textContent = '🚀 LANZAR CAMPAÑA'
    }
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  const dashboard = new EmailDashboard()
  const container = document.querySelector('main') || document.body
  container.appendChild(dashboard.render())
})
