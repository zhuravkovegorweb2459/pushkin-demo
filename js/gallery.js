// Works gallery: filter by kind, a short first view, and a viewer that shows one plate large.
// Without JS every plate is shown and the filters stay hidden.
(function () {
  const gallery = document.querySelector('.gallery');
  if (!gallery) return;

  const grid = gallery.querySelector('.gallery__grid');
  const items = Array.from(grid.querySelectorAll('.gallery__item'));
  const filterBar = gallery.querySelector('.gallery__filters');
  const filters = Array.from(gallery.querySelectorAll('.filter'));
  const more = gallery.querySelector('.gallery__more');
  const status = gallery.querySelector('[data-gallery-status]');

  let current = 'all';
  let expanded = false;

  const matches = (item, filter) => filter === 'all' || item.dataset.tags.split(' ').includes(filter);
  const matching = () => items.filter((item) => matches(item, current));

  const worksWord = (n) => {
    const tens = n % 100, ones = n % 10;
    if (tens > 10 && tens < 20) return 'работ';
    if (ones === 1) return 'работа';
    if (ones > 1 && ones < 5) return 'работы';
    return 'работ';
  };

  // First view: two rows of plates (three on a phone, where rows hold two)
  const firstView = () => {
    const columns = getComputedStyle(grid).gridTemplateColumns.split(' ').length;
    return columns * (columns > 2 ? 2 : 3);
  };

  const render = () => {
    const shown = matching();
    const limit = current === 'all' && !expanded ? firstView() : shown.length;
    items.forEach((item) => { item.hidden = !shown.includes(item) || shown.indexOf(item) >= limit; });
    if (more) {
      const rest = shown.length - limit;
      more.hidden = rest <= 0;
      more.textContent = `Показать все работы (ещё ${rest})`;
    }
  };

  filters.forEach((button) => {
    const count = items.filter((item) => matches(item, button.dataset.filter)).length;
    const slot = button.querySelector('.filter__count');
    if (slot) slot.textContent = count;

    button.addEventListener('click', () => {
      current = button.dataset.filter;
      filters.forEach((other) => other.setAttribute('aria-pressed', String(other === button)));
      render();
      const visible = items.filter((item) => !item.hidden).length;
      if (status) status.textContent = `Показано: ${visible} ${worksWord(visible)}`;
    });
  });

  if (more) {
    more.addEventListener('click', () => {
      const firstHidden = items.find((item) => item.hidden && matches(item, current));
      expanded = true;
      render();
      if (firstHidden) firstHidden.querySelector('.plate__open').focus();
    });
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(render, 150);
  });

  if (filterBar) filterBar.hidden = false;
  render();

  // ---------- Viewer ----------
  const viewer = document.querySelector('.viewer');
  if (!viewer || typeof viewer.showModal !== 'function') return;

  // Created here, so the closed viewer holds no image without a source
  const image = viewer.querySelector('[data-viewer-img]').appendChild(document.createElement('img'));
  const number = viewer.querySelector('[data-viewer-number]');
  const kind = viewer.querySelector('[data-viewer-type]');
  const caption = viewer.querySelector('[data-viewer-caption]');
  const counter = viewer.querySelector('[data-viewer-count]');
  const SWIPE = 50;

  let list = [];
  let index = 0;
  let opener = null;

  const preload = (item) => { new Image().src = item.querySelector('.plate__open').dataset.full; };

  const show = (next) => {
    index = (next + list.length) % list.length;
    const item = list[index];
    const open = item.querySelector('.plate__open');
    const thumb = open.querySelector('img');
    const head = item.querySelectorAll('.plate__head > span');

    number.textContent = `Картинка ${head[0].textContent}`;
    kind.textContent = head[1].textContent;
    caption.textContent = item.querySelector('figcaption').textContent;
    counter.textContent = `${index + 1} из ${list.length}`;

    // The thumbnail is already loaded: show it at once, then swap in the full size
    image.alt = thumb.alt;
    image.src = thumb.currentSrc || thumb.src;
    const full = new Image();
    full.src = open.dataset.full;
    full.decode()
      .then(() => { if (list[index] === item) image.src = full.src; })
      .catch(() => { /* keep the thumbnail if the large file fails */ });

    if (list.length > 1) preload(list[(index + 1) % list.length]);
  };

  grid.addEventListener('click', (event) => {
    const open = event.target.closest('.plate__open');
    if (!open) return;
    opener = open;
    list = matching();
    show(list.indexOf(open.closest('.gallery__item')));
    document.documentElement.classList.add('viewer-open');
    viewer.showModal();
  });

  viewer.addEventListener('close', () => {
    document.documentElement.classList.remove('viewer-open');
    if (opener) opener.focus();
  });

  viewer.querySelector('[data-viewer-close]').addEventListener('click', () => viewer.close());
  viewer.querySelectorAll('[data-step]').forEach((button) => {
    button.addEventListener('click', () => show(index + Number(button.dataset.step)));
  });

  // A click on the empty paper around the plate closes the viewer
  viewer.addEventListener('click', (event) => {
    if (event.target === viewer) viewer.close();
  });

  viewer.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') show(index - 1);
    if (event.key === 'ArrowRight') show(index + 1);
  });

  let startX = null;
  viewer.addEventListener('pointerdown', (event) => {
    if (event.pointerType !== 'mouse') startX = event.clientX;
  });
  viewer.addEventListener('pointerup', (event) => {
    if (startX === null) return;
    const dx = event.clientX - startX;
    startX = null;
    if (Math.abs(dx) > SWIPE) show(index + (dx < 0 ? 1 : -1));
  });
})();
