(function () {
  const GAUSSIAN_EDGE = Math.exp(-2);
  const WAVE_PERIOD = 3.2;
  const WAVE_PEAK = 0.7;

  const parseSettings = settings =>
    new Map(
      settings
        .split(',')
        .map(part => part.trim())
        .filter(Boolean)
        .map(part => {
          const [name, value] = part.split(/\s+/);
          return [name.replace(/['"]/g, ''), parseFloat(value)];
        })
    );

  const strengthAt = (distance, radius, falloff) => {
    if (distance >= radius) return 0;
    const norm = 1 - distance / radius;
    switch (falloff) {
      case 'exponential':
        return norm * norm;
      case 'gaussian':
        return (Math.exp(-2 * (distance / radius) ** 2) - GAUSSIAN_EDGE) / (1 - GAUSSIAN_EDGE);
      case 'linear':
      default:
        return norm;
    }
  };

  function mountVariableProximity(targetEl, options = {}) {
    if (!targetEl || targetEl.querySelector('.variable-proximity')) return null;

    const label = (options.label ?? targetEl.textContent ?? '').replace(/\s+/g, ' ').trim();
    if (!label) return null;

    const fromFontVariationSettings = options.fromFontVariationSettings ?? "'wght' 400, 'opsz' 9";
    const toFontVariationSettings = options.toFontVariationSettings ?? "'wght' 1000, 'opsz' 40";
    const containerEl = options.containerEl ?? targetEl.parentElement;
    const radius = options.radius ?? 90;
    const falloff = options.falloff ?? 'gaussian';
    const smoothing = options.smoothing ?? 0.2;
    const fromColor = options.fromColor;
    const toColor = options.toColor;
    const scale = options.scale ?? 1;
    const lift = options.lift ?? 0;
    const idleWave = options.idleWave ?? false;
    const fontSize = options.fontSize;

    const fromSettings = parseSettings(fromFontVariationSettings);
    const toSettings = parseSettings(toFontVariationSettings);
    const axes = Array.from(fromSettings.entries()).map(([axis, fromValue]) => ({
      axis,
      fromValue,
      toValue: toSettings.get(axis) ?? fromValue
    }));

    targetEl.textContent = '';

    const root = document.createElement('span');
    root.className = 'variable-proximity';
    root.style.display = 'inline';
    if (fontSize !== undefined) {
      root.style.fontSize = typeof fontSize === 'number' ? `${fontSize}px` : fontSize;
    }

    const words = label.split(' ');
    const letterRefs = [];

    words.forEach((word, wordIndex) => {
      const wordSpan = document.createElement('span');
      wordSpan.setAttribute('data-word', '');
      wordSpan.style.display = 'inline-block';
      wordSpan.style.whiteSpace = 'nowrap';

      word.split('').forEach(char => {
        const letterSpan = document.createElement('span');
        letterSpan.style.display = 'inline-block';
        letterSpan.style.fontVariationSettings = fromFontVariationSettings;
        if (fromColor) letterSpan.style.color = fromColor;
        letterSpan.style.transformOrigin = '50% 80%';
        letterSpan.setAttribute('aria-hidden', 'true');
        letterSpan.textContent = char;
        wordSpan.appendChild(letterSpan);
        letterRefs.push(letterSpan);
      });

      root.appendChild(wordSpan);

      if (wordIndex < words.length - 1) {
        root.appendChild(document.createTextNode(' '));
      }
    });

    const srOnly = document.createElement('span');
    srOnly.className = 'sr-only';
    srOnly.textContent = label;
    root.appendChild(srOnly);

    targetEl.appendChild(root);

    let live = true;

    const pointer = { x: 0, y: 0, active: false };
    const levels = [];
    const targets = [];
    const written = [];
    const painted = [];
    const moved = [];
    const anchors = [];
    const tinted = Boolean(fromColor || toColor);
    const restColor = fromColor || 'currentColor';
    const nearColor = toColor || 'currentColor';
    const growth = (Number(scale) || 1) - 1;
    const rise = Number(lift) || 0;
    const transformed = growth !== 0 || rise !== 0;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const waving = idleWave && !reduced;
    let frame = 0;
    let lastTime = 0;
    let dirty = true;
    let layoutDirty = true;
    let nearAny = false;
    let lastNear = -Infinity;
    let waveMix = 0;
    let span = 1;
    let visible = true;

    const settingsAt = level =>
      axes.map(({ axis, fromValue, toValue }) => `'${axis}' ${fromValue + (toValue - fromValue) * level}`).join(', ');

    const measureAnchors = () => {
      let left = Infinity;
      let top = Infinity;
      let right = -Infinity;
      letterRefs.forEach((letter, index) => {
        if (!letter) return;
        const rect = letter.getBoundingClientRect();
        anchors[index] = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        left = Math.min(left, rect.left);
        top = Math.min(top, rect.top);
        right = Math.max(right, rect.right);
      });
      anchors.forEach(anchor => {
        anchor.x -= left;
        anchor.y -= top;
      });
      span = Math.max(220, (right - left) * 0.85);
    };

    const measure = () => {
      targets.length = letterRefs.length;
      targets.fill(0);
      nearAny = false;
      if (!pointer.active) return;

      const area = containerEl?.getBoundingClientRect();
      if (area) {
        const dx = Math.max(area.left - pointer.x, 0, pointer.x - area.right);
        const dy = Math.max(area.top - pointer.y, 0, pointer.y - area.bottom);
        if (dx * dx + dy * dy >= radius * radius) return;
      }

      letterRefs.forEach((letter, index) => {
        if (!letter) return;
        const rect = letter.getBoundingClientRect();
        const distance = Math.hypot(
          pointer.x - (rect.left + rect.width / 2),
          pointer.y - (rect.top + rect.height / 2)
        );
        targets[index] = strengthAt(distance, radius, falloff);
        if (targets[index] > 0) nearAny = true;
      });
    };

    const waveAt = (index, time) => {
      const anchor = anchors[index];
      if (!anchor) return 0;
      const phase = ((anchor.x + anchor.y * 0.6) / span - time / WAVE_PERIOD) * Math.PI * 2;
      return WAVE_PEAK * ((1 + Math.cos(phase)) / 2) ** 2.2;
    };

    const tick = now => {
      frame = 0;
      const delta = lastTime ? Math.min(now - lastTime, 64) : 16;
      lastTime = now;

      if (dirty) {
        measure();
        dirty = false;
      }
      if (waving && layoutDirty) {
        measureAnchors();
        layoutDirty = false;
      }

      if (nearAny) lastNear = now;
      const idle = waving && visible && !nearAny && now - lastNear > 500;
      const goal = idle ? 1 : 0;
      waveMix += (goal - waveMix) * (1 - Math.exp(-delta / 600));
      if (Math.abs(goal - waveMix) < 0.002) waveMix = goal;

      const ease = smoothing > 0 ? 1 - Math.exp(-delta / (smoothing * 400)) : 1;
      const time = now / 1000;
      let settling = false;

      letterRefs.forEach((letter, index) => {
        if (!letter) return;
        let target = targets[index] ?? 0;
        if (waveMix > 0) target = Math.max(target, waveMix * waveAt(index, time));
        const current = levels[index] ?? 0;
        let next = current + (target - current) * ease;
        if (Math.abs(target - next) < 0.002) {
          next = target;
        } else {
          settling = true;
        }
        levels[index] = next;

        const settings = next === 0 ? fromFontVariationSettings : settingsAt(next);
        if (written[index] !== settings) {
          written[index] = settings;
          letter.style.fontVariationSettings = settings;
        }

        if (tinted) {
          const paint =
            next === 0
              ? fromColor || ''
              : `color-mix(in oklab, ${restColor} ${((1 - next) * 100).toFixed(1)}%, ${nearColor})`;
          if (painted[index] !== paint) {
            painted[index] = paint;
            letter.style.color = paint;
          }
        }

        if (transformed) {
          const shift =
            next === 0 ? '' : `translateY(${(-rise * next).toFixed(3)}em) scale(${(1 + growth * next).toFixed(3)})`;
          if (moved[index] !== shift) {
            moved[index] = shift;
            letter.style.transform = shift;
          }
        }
      });

      if (settling || waveMix > 0 || (waving && visible && !nearAny)) {
        frame = requestAnimationFrame(tick);
      } else {
        lastTime = 0;
      }
    };

    const schedule = () => {
      dirty = true;
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const relayout = () => {
      layoutDirty = true;
      schedule();
    };

    const handleMove = (x, y) => {
      pointer.x = x;
      pointer.y = y;
      pointer.active = true;
      schedule();
    };

    const handleMouseMove = event => handleMove(event.clientX, event.clientY);
    const handleTouchMove = event => {
      const touch = event.touches[0];
      if (touch) handleMove(touch.clientX, touch.clientY);
    };
    const handleLeave = () => {
      pointer.active = false;
      schedule();
    };

    const docRoot = document.documentElement;
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleLeave);
    window.addEventListener('touchcancel', handleLeave);
    window.addEventListener('scroll', schedule, { capture: true, passive: true });
    window.addEventListener('resize', relayout);
    docRoot.addEventListener('mouseleave', handleLeave);

    let observer = null;
    if (waving && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(entries => {
        visible = entries.some(entry => entry.isIntersecting);
        schedule();
      });
      observer.observe(root);
    }
    if (waving) document.fonts?.ready.then(relayout);

    schedule();

    return {
      destroy() {
        live = false;
        cancelAnimationFrame(frame);
        observer?.disconnect();
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleLeave);
        window.removeEventListener('touchcancel', handleLeave);
        window.removeEventListener('scroll', schedule, { capture: true });
        window.removeEventListener('resize', relayout);
        docRoot.removeEventListener('mouseleave', handleLeave);
      }
    };
  }

  window.initVariableProximity = function initVariableProximity() {
    if (window.matchMedia('(max-width: 900px), (hover: none), (pointer: coarse)').matches) {
      return;
    }

    const homeText = document.querySelector('#home .home-text');
    if (!homeText) return;

    const isLight = () => document.documentElement.getAttribute('data-theme') === 'light';

    const subtitle = homeText.querySelector('h3');
    if (subtitle) {
      mountVariableProximity(subtitle, {
        containerEl: homeText,
        fromFontVariationSettings: "'wght' 600, 'opsz' 14",
        toFontVariationSettings: "'wght' 1000, 'opsz' 48",
        radius: 95,
        falloff: 'gaussian',
        smoothing: 0.2,
        fromColor: 'var(--secondary)',
        toColor: 'var(--text)',
        scale: 1.06,
        lift: 0.04
      });
    }

    const paragraph = homeText.querySelector('p');
    if (paragraph) {
      mountVariableProximity(paragraph, {
        containerEl: homeText,
        fromFontVariationSettings: "'wght' 400, 'opsz' 9",
        toFontVariationSettings: "'wght' 950, 'opsz' 40",
        radius: 90,
        falloff: 'gaussian',
        smoothing: 0.2,
        fromColor: 'var(--muted)',
        toColor: 'var(--text)',
        scale: 1.04,
        lift: 0.03
      });
    }
  };
})();
