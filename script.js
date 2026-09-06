document.getElementById('year').textContent = new Date().getFullYear();
const navigationLinks = document.querySelectorAll('nav a');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      navigationLinks.forEach((link) => {
        const active = link.getAttribute('href') === `#${entry.target.id}`;
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }
  });
}, { rootMargin: '-15% 0px -55% 0px', threshold: 0 });
document.querySelectorAll('section[id]').forEach((section) => observer.observe(section));

// Animate metrics once on entry; static HTML remains readable without JavaScript.
const metrics = document.querySelector('.metrics');
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const counters = Array.from(document.querySelectorAll('[data-counter]'), (element) => ({
  node: element.querySelector('.counter-value'),
  target: Number(element.dataset.counter),
  decimals: (element.dataset.counter.split('.')[1] || '').length,
}));
let counterFrame;
let counterObserver;
const renderCounters = (progress) => {
  counters.forEach(({ node, target, decimals }) => {
    node.textContent = (target * progress).toFixed(decimals);
  });
};
if (metrics && !motionPreference.matches && 'IntersectionObserver' in window) {
  counterObserver = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    counterObserver.disconnect();
    if (motionPreference.matches) return;
    const duration = 1800;
    let startedAt;
    const tick = (now) => {
      startedAt ??= now;
      const progress = Math.min((now - startedAt) / duration, 1);
      renderCounters(1 - Math.pow(1 - progress, 3));
      if (progress < 1) counterFrame = requestAnimationFrame(tick);
    };
    renderCounters(0);
    counterFrame = requestAnimationFrame(tick);
  }, { threshold: 0.3 });
  counterObserver.observe(metrics);
}
motionPreference.addEventListener('change', (event) => {
  if (event.matches) {
    cancelAnimationFrame(counterFrame);
    counterObserver?.disconnect();
    renderCounters(1);
  }
});
