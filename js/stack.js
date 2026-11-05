// Plate stack: the top fashion plate is lifted off and slipped under the pile.
// Positions live in CSS ([data-pos]); on phones the stack is a swipe strip and this stays idle.
(function () {
  const stacked = window.matchMedia('(min-width: 48rem)');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  document.querySelectorAll('.plate-stack').forEach((stack) => {
    const plates = Array.from(stack.querySelectorAll('.plate'));
    const next = stack.querySelector('.plate-stack__next');
    const status = stack.querySelector('.plate-stack__status');
    if (plates.length < 2) return;
    stack.setAttribute('data-ready', '');

    let busy = false;

    const topPlate = () => plates.find((p) => p.dataset.pos === '0');

    const announce = () => {
      if (!status) return;
      const index = plates.indexOf(topPlate()) + 1;
      status.textContent = `Картинка ${index} из ${plates.length}`;
    };

    const shuffle = () => {
      if (busy || !stacked.matches) return;
      const leaving = topPlate();
      const count = plates.length;

      // Everyone moves one place up; the top plate goes to the bottom of the pile.
      leaving.style.transition = 'none';
      plates.forEach((p) => {
        p.dataset.pos = String((Number(p.dataset.pos) - 1 + count) % count);
      });
      const end = getComputedStyle(leaving).transform;
      leaving.getBoundingClientRect();
      leaving.style.transition = '';
      announce();

      if (reduced.matches || !leaving.animate) return;

      busy = true;
      const lift = leaving.animate([
        { transform: 'none', zIndex: 5 },
        { transform: 'translate(46%, -5%) rotate(8deg)', zIndex: 5, offset: 0.45 },
        { transform: end, zIndex: 0 }
      ], { duration: 820, easing: 'cubic-bezier(.16, 1, .3, 1)' });
      lift.onfinish = lift.oncancel = () => { busy = false; };
    };

    next && next.addEventListener('click', shuffle);
    stack.addEventListener('click', (event) => {
      const plate = event.target.closest('.plate');
      if (plate && plate.dataset.pos === '0') shuffle();
    });
    announce();
  });
})();
