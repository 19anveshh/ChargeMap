/* ChargePath motion layer: dependency-free Web Animations API + spring helpers. */
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const canAnimate = () => !reduceMotion.matches && 'animate' in document.documentElement;
  const ease = 'cubic-bezier(.22, 1, .36, 1)';

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
        { opacity: 0, transform: `translateY(${options.y || 18}px) scale(${options.scale || .98})` },
        { opacity: 1, transform: 'translateY(0) scale(1)' }
      ], { duration: options.duration || 640, delay: delay + index * (options.stagger || 70), easing: ease, fill: 'both' });
    });
  };

  const pop = (node, intensity = 1) => {
    if (!node || !canAnimate()) return;
    node.animate([
      { transform: 'scale(1)' },
      { transform: `scale(${1.018 * intensity})` },
      { transform: 'scale(1)' }
    ], { duration: 420, easing: 'cubic-bezier(.34, 1.56, .64, 1)' });
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
      else node.dataset.motionValue = String(numericTarget);
    };
    requestAnimationFrame(tick);
  };

  const drawRoute = (path) => {
    if (!path) return;
    const length = path.getTotalLength ? path.getTotalLength() : 900;
    path.style.strokeDasharray = `${length}`;
    path.style.strokeDashoffset = `${length}`;
    if (!canAnimate()) { path.style.strokeDashoffset = '0'; return; }
    path.animate([{ strokeDashoffset: length }, { strokeDashoffset: 0 }], { duration: 850, easing: ease, fill: 'forwards' });
  };

  const addMagnet = (node, strength = 10) => {
    if (!node || reduceMotion.matches) return;
    node.addEventListener('pointermove', (event) => {
      const rect = node.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - .5) * strength;
      const y = ((event.clientY - rect.top) / rect.height - .5) * strength;
      node.style.transform = `translate(${x}px, ${y}px)`;
    });
    node.addEventListener('pointerleave', () => { node.style.transform = ''; });
  };

  const addTilt = (node) => {
    if (!node || reduceMotion.matches) return;
    node.addEventListener('pointermove', (event) => {
      const rect = node.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      node.style.transform = `perspective(900px) rotateX(${y * -2.5}deg) rotateY(${x * 2.5}deg) translateY(-2px)`;
    });
    node.addEventListener('pointerleave', () => { node.style.transform = ''; });
  };

  const setup = () => {
    document.body.classList.add('motion-ready');
    reveal(document.querySelectorAll('.topbar, .hero-copy > *, .hero-orbit'), { stagger: 90, duration: 760, y: 22 });
    const revealOnScroll = document.querySelectorAll('.input-panel, .map-card, .recommendation-card, .alternatives-card, .algorithm-section, .footer');
    if ('IntersectionObserver' in window && !reduceMotion.matches) {
      revealOnScroll.forEach((node) => node.classList.add('scroll-reveal'));
      const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }), { threshold: .12 });
      revealOnScroll.forEach((node) => observer.observe(node));
    } else reveal(revealOnScroll);
    document.querySelectorAll('.primary-button, .route-button, .outline-button, .avatar, .icon-button').forEach((button) => addMagnet(button, 5));
    addTilt(document.querySelector('.recommendation-card'));
    drawRoute(document.querySelector('#active-route'));
    drawRoute(document.querySelector('#route-shadow'));
  };

  window.ChargePathMotion = { reveal, pop, countTo, drawRoute, addMagnet, addTilt, canAnimate, setup };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup, { once: true });
  else setup();
})();
