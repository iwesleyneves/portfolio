(function () {
  /**
   * ============================================================================
   * CONFIGURAÇÃO DO SUPABASE (CONTADOR PRIVADO E ANÔNIMO)
   * ============================================================================
   * 1. Crie ou abra um projeto no Supabase (https://supabase.com)
   * 2. Rode o script `supabase-analytics.sql` no SQL Editor do Supabase
   * 3. Cole abaixo a URL do projeto e a chave pública `anon` (Project Settings -> API)
   */
  const SUPABASE_CONFIG = {
    url: 'https://dhhzyyhdulsbzpezrrew.supabase.co',
    anonKey: 'sb_publishable_MdKm_pnsiuAsqhKGkd5K2w_3U_fL2WP'
  };

  const STORAGE_KEYS = {
    VISITED_UNIQUE: 'wn_portfolio_unique_v1',
    SESSION_VIEWED: 'wn_portfolio_session_v1',
    IGNORE_ADMIN: 'wn_portfolio_ignore_me',
    LOCAL_DEMO_STATS: 'wn_portfolio_local_stats_v1'
  };

  const isConfigured = () =>
    Boolean(SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey && SUPABASE_CONFIG.url.startsWith('http'));

  const isLocalhost = () =>
    location.hostname === 'localhost' || location.hostname === '127.0.0.1' || location.protocol === 'file:';

  const isIgnoredBrowser = () => {
    try {
      return localStorage.getItem(STORAGE_KEYS.IGNORE_ADMIN) === 'true';
    } catch {
      return false;
    }
  };

  const getDeviceType = () => (window.innerWidth <= 768 ? 'mobile' : 'desktop');

  const getReferrerDomain = () => {
    try {
      if (!document.referrer) return 'direto';
      const url = new URL(document.referrer);
      if (url.hostname === location.hostname) return 'interno';
      return url.hostname.replace(/^www\./, '');
    } catch {
      return 'direto';
    }
  };

  // Fallback local para você testar o painel antes mesmo de colar a chave do Supabase
  const recordLocalDemoEvent = (eventType, device, referrer) => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.LOCAL_DEMO_STATS);
      const data = raw
        ? JSON.parse(raw)
        : {
            total_views: 0,
            unique_visitors: 0,
            views_today: 0,
            views_7d: 0,
            click_cv: 0,
            click_github: 0,
            click_linkedin: 0,
            click_email: 0,
            click_drive_certs: 0,
            desktop_views: 0,
            mobile_views: 0,
            referrers: {}
          };

      if (eventType === 'page_view') {
        data.total_views += 1;
        data.views_today += 1;
        data.views_7d += 1;
        if (device === 'mobile') data.mobile_views += 1;
        else data.desktop_views += 1;
        if (referrer && referrer !== 'interno') {
          data.referrers[referrer] = (data.referrers[referrer] || 0) + 1;
        }
      } else if (eventType === 'unique_visit') {
        data.unique_visitors += 1;
      } else if (eventType in data) {
        data[eventType] += 1;
      }

      localStorage.setItem(STORAGE_KEYS.LOCAL_DEMO_STATS, JSON.stringify(data));
    } catch {}
  };

  async function sendEvent(eventType) {
    if (isIgnoredBrowser()) return;

    const device = getDeviceType();
    const referrer = getReferrerDomain();
    const host = location.hostname || 'local';

    // Sempre registra localmente para preview instantâneo se o Supabase ainda não estiver configurado
    recordLocalDemoEvent(eventType, device, referrer);

    // Ignora envio para o banco de produção se estiver em localhost
    if (isLocalhost() || !isConfigured()) return;

    try {
      const endpoint = `${SUPABASE_CONFIG.url.replace(/\/$/, '')}/rest/v1/portfolio_events`;
      await fetch(endpoint, {
        method: 'POST',
        keepalive: true,
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_CONFIG.anonKey,
          Authorization: `Bearer ${SUPABASE_CONFIG.anonKey}`,
          Prefer: 'return=minimal'
        },
        body: JSON.stringify({
          event_type: eventType,
          device_type: device,
          referrer_domain: referrer,
          host_domain: host
        })
      });
    } catch {
      // Falha silenciosa para nunca afetar a experiência do visitante
    }
  }

  function trackInitialVisit() {
    try {
      // 1. Verifica se é a primeira visita deste navegador (Visitante Único Anônimo)
      if (!localStorage.getItem(STORAGE_KEYS.VISITED_UNIQUE)) {
        localStorage.setItem(STORAGE_KEYS.VISITED_UNIQUE, '1');
        sendEvent('unique_visit');
      }

      // 2. Registra Pageview uma vez por sessão de aba para evitar spam de F5
      if (!sessionStorage.getItem(STORAGE_KEYS.SESSION_VIEWED)) {
        sessionStorage.setItem(STORAGE_KEYS.SESSION_VIEWED, '1');
        sendEvent('page_view');
      }
    } catch {
      sendEvent('page_view');
    }
  }

  function bindClickTracking() {
    // Cliques em Baixar CV
    document.querySelectorAll('a[href*="CurriculoWesleyNeves.pdf"]').forEach(el => {
      el.addEventListener('click', () => sendEvent('click_cv'));
    });

    // Cliques em GitHub
    document.querySelectorAll('a[href*="github.com/iwesleyneves"]').forEach(el => {
      el.addEventListener('click', () => sendEvent('click_github'));
    });

    // Cliques em LinkedIn
    document.querySelectorAll('a[href*="linkedin.com/in/iwesleyneves"]').forEach(el => {
      el.addEventListener('click', () => sendEvent('click_linkedin'));
    });

    // Cliques em Email
    document.querySelectorAll('a[href^="mailto:"]').forEach(el => {
      el.addEventListener('click', () => sendEvent('click_email'));
    });

    // Cliques na pasta completa de certificados no Drive
    document.querySelectorAll('.certificates-link').forEach(el => {
      el.addEventListener('click', () => sendEvent('click_drive_certs'));
    });
  }

  async function fetchStatsFromSupabase(pinCode) {
    if (!isConfigured()) {
      // Modo demonstração local quando as chaves do Supabase ainda não foram preenchidas
      if (pinCode !== 'admin' && pinCode !== '1234' && pinCode.length < 4) {
        throw new Error('PIN inválido.');
      }
      const raw = localStorage.getItem(STORAGE_KEYS.LOCAL_DEMO_STATS);
      const local = raw ? JSON.parse(raw) : {};
      const topReferrers = Object.entries(local.referrers || {})
        .map(([domain, count]) => ({ domain, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 4);

      return {
        demoMode: true,
        total_views: local.total_views || 1,
        unique_visitors: local.unique_visitors || 1,
        views_today: local.views_today || 1,
        views_7d: local.views_7d || 1,
        click_cv: local.click_cv || 0,
        click_github: local.click_github || 0,
        click_linkedin: local.click_linkedin || 0,
        click_email: local.click_email || 0,
        click_drive_certs: local.click_drive_certs || 0,
        desktop_views: local.desktop_views || 1,
        mobile_views: local.mobile_views || 0,
        top_referrers: topReferrers
      };
    }

    const endpoint = `${SUPABASE_CONFIG.url.replace(/\/$/, '')}/rest/v1/rpc/get_portfolio_stats`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_CONFIG.anonKey,
        Authorization: `Bearer ${SUPABASE_CONFIG.anonKey}`
      },
      body: JSON.stringify({ pin_input: pinCode })
    });

    if (!response.ok) {
      throw new Error('PIN incorreto ou função RPC não encontrada no Supabase.');
    }

    const data = await response.json();
    if (!data || data.error) {
      throw new Error(data?.error || 'PIN incorreto.');
    }
    return data;
  }

  function createAdminModal() {
    let modal = document.getElementById('analytics-admin-modal');
    if (modal) return modal;

    modal = document.createElement('div');
    modal.id = 'analytics-admin-modal';
    modal.className = 'analytics-modal';
    modal.innerHTML = `
      <div class="analytics-modal__overlay"></div>
      <div class="analytics-modal__box" role="dialog" aria-modal="true" aria-labelledby="analytics-modal-title">
        <div class="analytics-modal__head">
          <div class="analytics-modal__title-wrap">
            <span class="analytics-modal__badge">Privado</span>
            <h3 id="analytics-modal-title" class="analytics-modal__title">Analytics do Portfólio</h3>
          </div>
          <button type="button" class="analytics-modal__close" aria-label="Fechar painel">&times;</button>
        </div>
        <div id="analytics-modal-body"></div>
      </div>
    `;

    document.body.appendChild(modal);

    const close = () => {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    };

    modal.querySelector('.analytics-modal__close').addEventListener('click', close);
    modal.querySelector('.analytics-modal__overlay').addEventListener('click', close);
    window.addEventListener('keydown', e => {
      if (e.key === 'Escape' && modal.classList.contains('active')) close();
    });

    return modal;
  }

  function renderAuthScreen(bodyEl, onAuthenticated) {
    const configured = isConfigured();
    bodyEl.innerHTML = `
      <div class="analytics-auth">
        <p>Digite seu PIN secreto para descriptografar e consultar as estatísticas anônimas de acesso do portfólio.</p>
        <form class="analytics-auth__form" id="analytics-pin-form">
          <input
            type="password"
            id="analytics-pin-input"
            class="analytics-auth__input"
            placeholder="Digite seu PIN secreto..."
            autocomplete="current-password"
            required
          />
          <button type="submit" class="analytics-auth__btn">Acessar</button>
        </form>
        <div class="analytics-auth__error" id="analytics-pin-error"></div>
        ${
          !configured
            ? `<div class="analytics-setup-notice">
                <strong>Modo Demonstração Local ativo:</strong> Para sincronizar na nuvem, execute o arquivo <code>supabase-analytics.sql</code> no seu Supabase e preencha <code>SUPABASE_CONFIG</code> em <code>js/modules/analytics.js</code>. (Use qualquer PIN de 4+ dígitos para testar agora).
               </div>`
            : ''
        }
      </div>
    `;

    const form = bodyEl.querySelector('#analytics-pin-form');
    const input = bodyEl.querySelector('#analytics-pin-input');
    const errorEl = bodyEl.querySelector('#analytics-pin-error');
    setTimeout(() => input?.focus(), 60);

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const pin = input.value.trim();
      if (!pin) return;
      errorEl.textContent = 'Consultando...';
      try {
        const stats = await fetchStatsFromSupabase(pin);
        onAuthenticated(stats, pin);
      } catch (err) {
        errorEl.textContent = err.message || 'PIN inválido.';
      }
    });
  }

  function renderDashboardScreen(bodyEl, stats, pinCode) {
    const totalViews = Number(stats.total_views) || 0;
    const desktopViews = Number(stats.desktop_views) || 0;
    const mobileViews = Number(stats.mobile_views) || 0;
    const deviceTotal = Math.max(1, desktopViews + mobileViews);
    const desktopPct = Math.round((desktopViews / deviceTotal) * 100);
    const mobilePct = 100 - desktopPct;
    const referrers = Array.isArray(stats.top_referrers) ? stats.top_referrers : [];
    const ignored = isIgnoredBrowser();

    bodyEl.innerHTML = `
      <div class="analytics-dashboard">
        <div class="analytics-grid">
          <div class="analytics-card">
            <span class="analytics-card__label">Total de Visitas</span>
            <strong class="analytics-card__value">${totalViews}</strong>
            <span class="analytics-card__sub">${Number(stats.views_today) || 0} hoje • ${Number(stats.views_7d) || 0} últimos 7d</span>
          </div>
          <div class="analytics-card">
            <span class="analytics-card__label">Visitantes Únicos</span>
            <strong class="analytics-card__value">${Number(stats.unique_visitors) || 0}</strong>
            <span class="analytics-card__sub">100% anônimo (sem cookies)</span>
          </div>
          <div class="analytics-card">
            <span class="analytics-card__label">Downloads do CV</span>
            <strong class="analytics-card__value">${Number(stats.click_cv) || 0}</strong>
            <span class="analytics-card__sub">Cliques em Baixar CV</span>
          </div>
        </div>

        <h4 class="analytics-section-title">Interações & Cliques</h4>
        <div class="analytics-clicks-grid">
          <div class="analytics-click-pill">
            <span>GitHub</span>
            <strong>${Number(stats.click_github) || 0}</strong>
          </div>
          <div class="analytics-click-pill">
            <span>LinkedIn</span>
            <strong>${Number(stats.click_linkedin) || 0}</strong>
          </div>
          <div class="analytics-click-pill">
            <span>Email</span>
            <strong>${Number(stats.click_email) || 0}</strong>
          </div>
          <div class="analytics-click-pill">
            <span>Drive (Certs)</span>
            <strong>${Number(stats.click_drive_certs) || 0}</strong>
          </div>
        </div>

        <div class="analytics-meta-row">
          <div class="analytics-meta-box">
            <h4>Dispositivos</h4>
            <ul class="analytics-list">
              <li><span>Desktop</span><strong>${desktopViews} (${desktopPct}%)</strong></li>
              <li><span>Mobile</span><strong>${mobileViews} (${mobilePct}%)</strong></li>
            </ul>
          </div>
          <div class="analytics-meta-box">
            <h4>Principais Origens</h4>
            <ul class="analytics-list">
              ${
                referrers.length
                  ? referrers.map(r => `<li><span>${r.domain}</span><strong>${r.count}</strong></li>`).join('')
                  : '<li><span>Acesso direto</span><strong>100%</strong></li>'
              }
            </ul>
          </div>
        </div>

        <div class="analytics-footer">
          <label class="analytics-toggle-ignore">
            <input type="checkbox" id="analytics-ignore-checkbox" ${ignored ? 'checked' : ''} />
            <span>Ignorar meus acessos neste navegador</span>
          </label>
          <div class="analytics-actions">
            <button type="button" class="analytics-btn-secondary" id="analytics-refresh-btn">Atualizar</button>
          </div>
        </div>
      </div>
    `;

    const ignoreCheckbox = bodyEl.querySelector('#analytics-ignore-checkbox');
    ignoreCheckbox?.addEventListener('change', e => {
      try {
        if (e.target.checked) localStorage.setItem(STORAGE_KEYS.IGNORE_ADMIN, 'true');
        else localStorage.removeItem(STORAGE_KEYS.IGNORE_ADMIN);
      } catch {}
    });

    const refreshBtn = bodyEl.querySelector('#analytics-refresh-btn');
    refreshBtn?.addEventListener('click', async () => {
      refreshBtn.textContent = 'Atualizando...';
      try {
        const updated = await fetchStatsFromSupabase(pinCode);
        renderDashboardScreen(bodyEl, updated, pinCode);
      } catch {
        refreshBtn.textContent = 'Erro';
      }
    });
  }

  function openAdminModal() {
    const modal = createAdminModal();
    const bodyEl = modal.querySelector('#analytics-modal-body');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    renderAuthScreen(bodyEl, (stats, pinCode) => {
      renderDashboardScreen(bodyEl, stats, pinCode);
    });
  }

  function bindAdminTriggers() {
    // 1. Clicar 5 vezes seguidas na logo <Wesley/> em até 2 segundos
    const logo = document.querySelector('.navbar .logo');
    if (logo) {
      let clicks = 0;
      let timer = 0;
      logo.addEventListener('click', () => {
        clicks += 1;
        clearTimeout(timer);
        if (clicks >= 5) {
          clicks = 0;
          openAdminModal();
        } else {
          timer = setTimeout(() => {
            clicks = 0;
          }, 1800);
        }
      });
    }

    // 2. Atalho de teclado Ctrl + Shift + A
    window.addEventListener('keydown', e => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        openAdminModal();
      }
    });

    // 3. Parâmetro ?admin na URL
    if (new URLSearchParams(window.location.search).has('admin')) {
      setTimeout(openAdminModal, 400);
    }
  }

  window.initPortfolioAnalytics = function initPortfolioAnalytics() {
    trackInitialVisit();
    bindClickTracking();
    bindAdminTriggers();
  };
})();
