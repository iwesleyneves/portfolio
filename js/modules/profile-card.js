(function () {
  const THEMES = {
    dark: {
      '--pc-frame': 'rgba(26, 35, 50, 0.78)',
      '--pc-frame-edge': 'rgba(74, 144, 226, 0.22)',
      '--pc-frame-highlight': 'rgba(255, 255, 255, 0.08)',
      '--pc-frame-shadow':
        '0 34px 80px rgba(74, 144, 226, 0.16), 0 16px 34px rgba(0, 0, 0, 0.65)',
      '--pc-tile': 'linear-gradient(180deg, #1f2b3d 0%, #141c28 100%)',
      '--pc-tile-edge': 'rgba(74, 144, 226, 0.18)',
      '--pc-tile-highlight': 'rgba(255, 255, 255, 0.12)',
      '--pc-tile-shadow': '0 4px 10px -4px rgba(0, 0, 0, 0.7)',
      '--pc-ink': '#f4f4f5',
      '--pc-muted': 'rgba(244, 244, 245, 0.65)',
      '--pc-hover': 'brightness(1.14)',
      '--pc-press': 'brightness(0.85)',
      '--pc-shade': 'rgba(0, 0, 0, 0.4)'
    },
    light: {
      '--pc-frame': 'rgba(240, 240, 243, 0.8)',
      '--pc-frame-edge': 'rgba(24, 24, 27, 0.07)',
      '--pc-frame-highlight': 'rgba(255, 255, 255, 0.95)',
      '--pc-frame-shadow':
        '0 22px 44px -22px rgba(24, 24, 27, 0.3), 0 6px 16px -10px rgba(24, 24, 27, 0.16)',
      '--pc-tile': 'linear-gradient(180deg, #ffffff 0%, #f6f6f8 100%)',
      '--pc-tile-edge': 'rgba(24, 24, 27, 0.08)',
      '--pc-tile-highlight': 'rgba(255, 255, 255, 1)',
      '--pc-tile-shadow': '0 4px 10px -5px rgba(24, 24, 27, 0.25)',
      '--pc-ink': '#27272a',
      '--pc-muted': 'rgba(39, 39, 42, 0.6)',
      '--pc-hover': 'brightness(0.97)',
      '--pc-press': 'brightness(0.92)',
      '--pc-shade': 'rgba(24, 24, 27, 0.14)'
    }
  };

  const FOILS = {
    dark: {
      '--pc-blend': 'color-dodge',
      '--pc-holo-filter': 'hue-rotate(0deg)',
      '--pc-sheen': 'rgba(255, 255, 255, 0.16)'
    },
    light: {
      '--pc-blend': 'multiply',
      '--pc-holo-filter': 'invert(1) hue-rotate(180deg)',
      '--pc-sheen': 'rgba(255, 255, 255, 0)'
    }
  };

  const GRAIN = `url("data:image/svg+xml,${encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='500' height='500'><filter id='g' x='0' y='0' width='100%' height='100%' color-interpolation-filters='sRGB'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0.55 0 0 0 -0.24 0.55 0 0 0 -0.24 0.55 0 0 0 -0.24 0 0 0 0 1'/></filter><rect width='100%' height='100%' filter='url(#g)'/></svg>"
  )}")`;

  const MAIL_SVG = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect width="20" height="16" x="2" y="4" rx="3"></rect>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
    </svg>
  `;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const isDark = color => {
    const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(color).trim());
    if (!match) return null;
    const hex = match[1].length === 3 ? match[1].replace(/./g, digit => digit + digit) : match[1];
    const [r, g, b] = [0, 2, 4].map(index => parseInt(hex.slice(index, index + 2), 16) / 255);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.5;
  };

  function mountProfileCard(root, options = {}) {
    if (!root) return null;

    const avatarUrl = options.avatarUrl ?? 'assets/img/wesley.JPEG';
    const iconUrl = options.iconUrl;
    const miniAvatarUrl = options.miniAvatarUrl ?? avatarUrl;
    const name = options.name ?? 'Wesley Neves';
    const title = options.title ?? 'Desenvolvedor Web & Mobile';
    const handle = options.handle ?? 'iwesleyneves';
    const status = options.status ?? 'Disponível';
    const statusColor = options.statusColor ?? '#22c55e';
    const contactText = options.contactText ?? 'Contato';
    const showUserInfo = options.showUserInfo ?? true;
    const onContactClick = options.onContactClick;
    const theme = options.theme ?? 'dark';
    const backdropColor = options.backdropColor;
    const radius = options.radius ?? 16;
    const holo = options.holo ?? 0.8;
    const glare = options.glare ?? 0.5;
    const enableTilt = options.enableTilt ?? true;
    const tiltStrength = options.tiltStrength ?? 12;
    const parallax = options.parallax ?? 8;
    const enableMobileTilt = options.enableMobileTilt ?? false;
    const mobileTiltSensitivity = options.mobileTiltSensitivity ?? 5;
    const intro = options.intro ?? true;

    const settingsRef = {
      current: { enableTilt, tiltStrength, parallax, mobileTiltSensitivity, intro }
    };

    const palette = theme === 'light' ? 'light' : 'dark';
    const foil = backdropColor ? ((isDark(backdropColor) ?? palette === 'dark') ? 'dark' : 'light') : palette;
    const backdrop = backdropColor
      ? `linear-gradient(180deg, color-mix(in srgb, ${backdropColor}, #ffffff 12%) 0%, color-mix(in srgb, ${backdropColor}, #000000 18%) 100%)`
      : 'var(--pc-tile)';

    root.classList.add('profile-card');

    const vars = {
      ...THEMES[palette],
      ...FOILS[foil],
      '--pc-radius': `${Math.max(0, radius)}px`,
      '--pc-backdrop': backdrop,
      '--pc-holo': String(clamp(holo, 0, 1)),
      '--pc-glare': String(clamp(glare, 0, 1)),
      '--pc-parallax': `${Math.max(0, parallax)}px`,
      '--pc-status': statusColor,
      '--pc-grain': GRAIN,
      '--pc-pattern': iconUrl ? `url("${iconUrl}")` : 'linear-gradient(#000, #000)',
      '--pc-pattern-size': iconUrl ? '180% auto' : '100% 100%',
      '--pc-holo-gain': String(iconUrl ? 1.25 : 0.42),
      '--pc-holo-detail': String(iconUrl && foil === 'dark' ? 1 : 0)
    };

    Object.entries(vars).forEach(([key, val]) => {
      root.style.setProperty(key, val);
    });

    root.innerHTML = `
      <div class="profile-card__body">
        <div class="profile-card__tile">
          <span class="profile-card__sheen"></span>
          <span class="profile-card__holo">
            <span class="profile-card__holo-glow"></span>
            <span class="profile-card__holo-shift"></span>
          </span>
          ${avatarUrl ? `<img class="profile-card__photo" src="${avatarUrl}" alt="${name || ''}" loading="lazy" draggable="false" />` : ''}
          ${
            name || title
              ? `
            <span class="profile-card__scrim"></span>
            <div class="profile-card__info">
              ${name ? `<h3 class="profile-card__name">${name}</h3>` : ''}
              ${title ? `<p class="profile-card__title">${title}</p>` : ''}
            </div>
          `
              : ''
          }
          <span class="profile-card__tile-rim"></span>
        </div>

        ${
          showUserInfo
            ? `
          <div class="profile-card__footer">
            ${
              miniAvatarUrl
                ? `
              <span class="profile-card__avatar">
                <img src="${miniAvatarUrl}" alt="" loading="lazy" draggable="false" />
              </span>
            `
                : ''
            }
            <div class="profile-card__meta">
              ${handle ? `<span class="profile-card__handle">@${handle}</span>` : ''}
              ${status ? `<span class="profile-card__status">${status}</span>` : ''}
            </div>
            ${
              contactText
                ? `
              <button
                type="button"
                class="profile-card__contact cursor-target"
                aria-label="${name ? `${contactText} ${name}` : contactText}"
              >
                ${MAIL_SVG}
                ${contactText}
              </button>
            `
                : ''
            }
          </div>
        `
            : ''
        }

        <span class="profile-card__glare"></span>
        <span class="profile-card__shade"></span>
        <span class="profile-card__rim"></span>
      </div>
    `;

    const contactBtn = root.querySelector('.profile-card__contact');
    if (contactBtn && typeof onContactClick === 'function') {
      contactBtn.addEventListener('click', onContactClick);
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const size = { width: root.offsetWidth, height: root.offsetHeight };
    const x = { p: 0, v: 0, target: 0 };
    const y = { p: 0, v: 0, target: 0 };
    const light = { p: 0, target: 0 };
    let raf = 0;
    let last = 0;
    let slowUntil = 0;
    let touchId = null;

    const write = () => {
      const { enableTilt: tiltOn, tiltStrength: strength, parallax: depth } = settingsRef.current;
      const angle = tiltOn && !reduced ? strength : 0;
      const tilt = Math.min(1, Math.hypot(x.p, y.p));
      const style = root.style;
      style.setProperty('--pc-light-x', `${((x.p + 1) * 0.5 * size.width).toFixed(1)}px`);
      style.setProperty('--pc-light-y', `${((y.p + 1) * 0.5 * size.height).toFixed(1)}px`);
      style.setProperty('--pc-pointer-x', `${((x.p + 1) * 50).toFixed(2)}%`);
      style.setProperty('--pc-pointer-y', `${((y.p + 1) * 50).toFixed(2)}%`);
      style.setProperty('--pc-band-x', `${(50 + x.p * 15).toFixed(2)}%`);
      style.setProperty('--pc-band-y', `${(50 + y.p * 15).toFixed(2)}%`);
      style.setProperty('--pc-rotate-x', `${(y.p * angle).toFixed(3)}deg`);
      style.setProperty('--pc-rotate-y', `${(-x.p * angle).toFixed(3)}deg`);
      style.setProperty('--pc-shift-x', `${(x.p * (reduced ? 0 : depth)).toFixed(2)}px`);
      style.setProperty('--pc-shift-y', `${(y.p * (reduced ? 0 : depth)).toFixed(2)}px`);
      style.setProperty('--pc-reach', tilt.toFixed(4));
      style.setProperty('--pc-tilt', (tilt * light.p).toFixed(4));
      style.setProperty('--pc-active', light.p.toFixed(4));
    };

    const frame = now => {
      const dt = Math.min(0.05, (now - last) / 1000 || 0);
      last = now;
      const slow = now < slowUntil;
      const stiffness = slow ? 24 : 120;
      const damping = slow ? 9 : 16;
      const steps = Math.max(1, Math.ceil(dt / (1 / 120)));
      const h = dt / steps;
      for (let i = 0; i < steps; i++) {
        for (const axis of [x, y]) {
          axis.v += (stiffness * (axis.target - axis.p) - damping * axis.v) * h;
          axis.p += axis.v * h;
        }
      }
      const tau = light.target > light.p ? 0.18 : slow ? 0.9 : 0.45;
      light.p += (light.target - light.p) * (1 - Math.exp(-dt / tau));
      write();
      const moving =
        Math.abs(x.target - x.p) > 0.0005 ||
        Math.abs(y.target - y.p) > 0.0005 ||
        Math.abs(x.v) > 0.0005 ||
        Math.abs(y.v) > 0.0005 ||
        Math.abs(light.target - light.p) > 0.002;
      if (moving) {
        raf = requestAnimationFrame(frame);
      } else {
        x.p = x.target;
        y.p = y.target;
        light.p = light.target;
        write();
        raf = 0;
      }
    };

    const wake = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };

    const aim = (nx, ny, on = true) => {
      x.target = clamp(nx, -1, 1);
      y.target = clamp(ny, -1, 1);
      light.target = on ? 1 : 0;
      slowUntil = 0;
      wake();
    };

    const aimAt = event => {
      const rect = root.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      aim(((event.clientX - rect.left) / rect.width) * 2 - 1, ((event.clientY - rect.top) / rect.height) * 2 - 1);
    };

    const release = () => aim(0, 0, false);

    const onEnter = event => {
      if (event.pointerType === 'mouse') aimAt(event);
    };
    const onMove = event => {
      if (event.pointerType === 'mouse' || event.pointerId === touchId) aimAt(event);
    };
    const onLeave = event => {
      if (event.pointerType === 'mouse') release();
    };
    const onDown = event => {
      if (event.pointerType === 'mouse') return;
      touchId = event.pointerId;
      aimAt(event);
    };
    const onUp = event => {
      if (event.pointerId !== touchId) return;
      touchId = null;
      release();
    };

    root.addEventListener('pointerenter', onEnter);
    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerleave', onLeave);
    root.addEventListener('pointerdown', onDown);
    root.addEventListener('pointerup', onUp);
    root.addEventListener('pointercancel', onUp);

    const observer = new ResizeObserver(() => {
      size.width = root.offsetWidth;
      size.height = root.offsetHeight;
      write();
    });
    observer.observe(root);

    if (settingsRef.current.intro && !reduced) {
      x.p = 0.62;
      y.p = -0.55;
      light.p = 1;
      slowUntil = performance.now() + 1400;
      write();
      wake();
    } else {
      write();
    }

    let listening = false;
    const onOrientation = event => {
      if (event.beta == null || event.gamma == null) return;
      const sensitivity = settingsRef.current.mobileTiltSensitivity;
      aim((event.gamma * sensitivity) / 150, ((event.beta - 20) * sensitivity) / 150);
    };
    const listen = () => {
      if (listening) return;
      listening = true;
      window.addEventListener('deviceorientation', onOrientation);
    };
    const onClick = () => {
      if (!enableMobileTilt) return;
      const Motion = window.DeviceOrientationEvent;
      if (Motion && typeof Motion.requestPermission === 'function') {
        Motion.requestPermission()
          .then(state => {
            if (state === 'granted') listen();
          })
          .catch(() => {});
      } else {
        listen();
      }
    };

    if (enableMobileTilt) {
      root.addEventListener('click', onClick);
    }

    return {
      destroy() {
        cancelAnimationFrame(raf);
        observer.disconnect();
        root.removeEventListener('pointerenter', onEnter);
        root.removeEventListener('pointermove', onMove);
        root.removeEventListener('pointerleave', onLeave);
        root.removeEventListener('pointerdown', onDown);
        root.removeEventListener('pointerup', onUp);
        root.removeEventListener('pointercancel', onUp);
        root.removeEventListener('click', onClick);
        window.removeEventListener('deviceorientation', onOrientation);
      }
    };
  }

  window.initProfileCard = function initProfileCard() {
    const cards = document.querySelectorAll('[data-profile-card]');
    cards.forEach(card => {
      mountProfileCard(card, {
        name: card.dataset.name || 'Wesley Neves',
        title: card.dataset.title || 'Desenvolvedor Web & Mobile',
        handle: card.dataset.handle || 'iwesleyneves',
        status: card.dataset.status || 'Disponível',
        contactText: card.dataset.contactText || 'Contato',
        avatarUrl: card.dataset.avatarUrl || 'assets/img/wesley.JPEG',
        miniAvatarUrl: card.dataset.miniAvatarUrl || card.dataset.avatarUrl || 'assets/img/wesley.JPEG',
        iconUrl: card.dataset.iconUrl || undefined,
        holo: card.dataset.holo !== undefined ? Number(card.dataset.holo) : 0.75,
        glare: card.dataset.glare !== undefined ? Number(card.dataset.glare) : 0.5,
        tiltStrength: card.dataset.tiltStrength !== undefined ? Number(card.dataset.tiltStrength) : 12,
        parallax: card.dataset.parallax !== undefined ? Number(card.dataset.parallax) : 8,
        radius: card.dataset.radius !== undefined ? Number(card.dataset.radius) : 16,
        enableTilt: card.dataset.enableTilt !== 'false',
        intro: card.dataset.intro !== 'false',
        showUserInfo: card.dataset.showUserInfo !== 'false',
        enableMobileTilt: card.dataset.enableMobileTilt === 'true',
        theme: card.dataset.theme || 'dark',
        onContactClick: () => {
          const contactSection = document.getElementById('contact');
          if (contactSection) {
            contactSection.scrollIntoView({ behavior: 'smooth' });
          } else {
            window.location.hash = '#contact';
          }
        }
      });
    });
  };
})();
