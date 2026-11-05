// The engraver's burin: ornaments marked .draw are engraved once when they reach the screen.
// The page arms .motion-ok in <head>; without this script the ornaments stay fully drawn.
(function () {
  window.__decor = true;
  const root = document.documentElement;
  if (!root.classList.contains('motion-ok')) return;

  const ornaments = document.querySelectorAll('.draw');
  if (!('IntersectionObserver' in window)) {
    ornaments.forEach((el) => el.classList.add('is-drawn'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-drawn');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.4 });

  ornaments.forEach((el) => observer.observe(el));

  // Styleguide: replay the engraving of every ornament inside a block.
  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-redraw]');
    if (!button) return;
    const scope = document.querySelector(button.dataset.redraw);
    if (!scope) return;
    const items = scope.querySelectorAll('.draw');
    items.forEach((el) => {
      el.style.transition = 'none';
      el.classList.remove('is-drawn');
      el.getBoundingClientRect();
      el.style.transition = '';
    });
    requestAnimationFrame(() => requestAnimationFrame(() => {
      items.forEach((el) => el.classList.add('is-drawn'));
    }));
  });
})();
