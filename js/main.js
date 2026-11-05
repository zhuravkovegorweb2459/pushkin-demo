// Header: hairline after scroll, mobile menu toggle.
(function () {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('site-nav');

  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // The bottom booking bar steps aside while the hero's own booking button is on screen,
  // so «Записаться онлайн» is never shown twice at once
  const bar = document.querySelector('.booking-bar');
  const heroBooking = document.querySelector('.hero .btn--book');
  if (bar && heroBooking && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      bar.classList.toggle('is-hidden', entry.isIntersecting);
    }).observe(heroBooking);
  }

  if (!toggle || !nav) return;

  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('.menu-toggle__label').textContent = open ? 'Закрыть' : 'Меню';
    nav.classList.toggle('is-open', open);
    document.documentElement.style.overflow = open ? 'hidden' : '';
  };

  toggle.addEventListener('click', () => {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });

  nav.addEventListener('click', (event) => {
    if (event.target.closest('a')) setOpen(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      toggle.focus();
    }
  });

  window.matchMedia('(min-width: 60.0625rem)').addEventListener('change', (event) => {
    if (event.matches) setOpen(false);
  });
})();
