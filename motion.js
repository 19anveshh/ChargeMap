/* ChargePath Motion Engine: High-Precision 3D Perspective, Ambient Lighting, and Spring Physics */
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const canAnimate = () => !reduceMotion.matches && 'animate' in document.documentElement;
  const easeSpring = 'cubic-bezier(0.2, 0.8, 0.2, 1)';

  // Ambient mouse-following spotlight
  const initSpotlight = () => {
    if (reduceMotion.matches) return;
    let ticking = false;
    window.addEventListener('pointermove', (e) => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const x = (e.clientX / window.innerWidth) * 100;
          const y = (e.clientY / window.innerHeight) * 100;
          document.documentElement.style.setProperty('--mouse-x', `${x}%`);
          document.documentElement.style.setProperty('--mouse-y', `${y}%`);
          ticking = false;
        });
        ticking = true;
      }
    });
  };

  const reveal = (elements, options = {}) => {
    const nodes = [...elements].filter(Boolean);
    if (!nodes.length) return;
    if (!canAnimate()) {
      nodes.forEach((node) => node.classList.add('motion-visible'));
      return;
    }
    const delay = options.delay || 0;
    nodes.forEach((node, index) => {
      node.classList.add('motion-visible');
      node.animate([
        { opacity: 0, transform: `translateY(${options.y || 20}px) scale(${options.scale || 0.98})` },
        { opacity: 1, transform: 'translateY(0) scale(1)' }
      ], {
        duration: options.duration || 680,
        delay: delay + index * (options.stagger || 60),
        easing: easeSpring,
        fill: 'both'
      });
    });
  };

  const pop = (node, intensity = 1) => {
    if (!node || !canAnimate()) return;
    node.animate([
      { transform: 'scale(1)' },
      { transform: `scale(${1 + 0.02 * intensity})` },
      { transform: 'scale(1)' }
    ], { duration: 420, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' });
  };

  const countTo = (node, target, duration = 520) => {
    if (!node || target === '—') return;
    const numericTarget = Number(target);
    if (!Number.isFinite(numericTarget)) return;
    if (!canAnimate()) { node.textContent = target; return; }
    const start = Number(node.dataset.motionValue || 0);
    const startTime = performance.now();
    const tick = (now) => {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      node.textContent = Math.round(start + (numericTarget - start) * eased);
      if (progress < 1) requestAnimationFrame(tick);
      else {
        node.textContent = String(numericTarget);
        node.dataset.motionValue = String(numericTarget);
      }
    };
    requestAnimationFrame(tick);
  };

  const drawRoute = (path) => {
    if (!path) return;
    const length = path.getTotalLength ? path.getTotalLength() : 900;
    path.style.strokeDasharray = `${length}`;
    path.style.strokeDashoffset = `${length}`;
    if (!canAnimate()) { path.style.strokeDashoffset = '0'; return; }
    path.animate(
      [{ strokeDashoffset: length }, { strokeDashoffset: 0 }],
      { duration: 850, easing: easeSpring, fill: 'forwards' }
    );
  };

  const addMagnet = (node, strength = 6) => {
    if (!node || reduceMotion.matches) return;
    node.addEventListener('pointermove', (event) => {
      const rect = node.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * strength;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * strength;
      node.style.transform = `translate(${x}px, ${y}px)`;
    });
    node.addEventListener('pointerleave', () => {
      node.style.transform = '';
    });
  };

  // High-performance 3D Card Tilt with Specular Reflection
  const addTilt = (node, maxTilt = 8) => {
    if (!node || reduceMotion.matches) return;
    node.addEventListener('pointermove', (event) => {
      const rect = node.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      node.style.transform = `perspective(1200px) rotateX(${y * -maxTilt}deg) rotateY(${x * maxTilt}deg) translateY(-4px) scale(1.01)`;
    });
    node.addEventListener('pointerleave', () => {
      node.style.transform = '';
    });
  };

  const setup = () => {
    document.body.classList.add('motion-ready');
    initSpotlight();

    reveal(document.querySelectorAll('.topbar, .hero-copy > *, .hero-orbit'), { stagger: 80, duration: 750, y: 24 });
    reveal(document.querySelectorAll('.showcase-card'), { stagger: 120, duration: 800, y: 30, delay: 200 });

    const revealOnScroll = document.querySelectorAll(
      '.input-panel, .map-card, .recommendation-card, .alternatives-card, .algorithm-section, .footer'
    );

    if ('IntersectionObserver' in window && !reduceMotion.matches) {
      revealOnScroll.forEach((node) => node.classList.add('scroll-reveal'));
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.1 });
      revealOnScroll.forEach((node) => observer.observe(node));
    } else {
      reveal(revealOnScroll);
    }

    // Add magnetic hover to buttons
    document.querySelectorAll('.primary-button, .route-button, .outline-button, .avatar, .icon-button, .preset-chip')
      .forEach((button) => addMagnet(button, 6));

    // Add 3D Tilt to cards
    document.querySelectorAll('.showcase-card').forEach((card) => addTilt(card, 10));
    addTilt(document.querySelector('.recommendation-card'), 6);

    drawRoute(document.querySelector('#active-route'));
    drawRoute(document.querySelector('#route-shadow'));
  };

  window.ChargePathMotion = { reveal, pop, countTo, drawRoute, addMagnet, addTilt, canAnimate, setup };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup, { once: true });
  } else {
    setup();
  }
})();
