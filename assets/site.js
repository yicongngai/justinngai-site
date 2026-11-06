'use strict';
const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#navigation');
function closeMenu() { menu?.setAttribute('aria-expanded', 'false'); nav?.classList.remove('open'); }
menu?.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open)); nav.classList.toggle('open', open);
});
nav?.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') { closeMenu(); menu.focus(); }
});
// Whole words and phrases: "Ai Tong" must not match "Haig" plus "Katong".
function normalizeSearch(value) { return value.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, ' ').trim(); }
function matchesPhrase(text, query) {
  const phrase = normalizeSearch(query);
  return !phrase || (` ${normalizeSearch(text)} `).includes(` ${phrase} `);
}
if (location.pathname === '/new-condo-launch/' && location.search) location.replace('/new-condo-launch/all/' + location.search + location.hash);
const form = document.querySelector('.directory-controls');
if (form) {
  const cards = [...document.querySelectorAll('[data-project]')];
  const fields = ['q', 'region', 'district', 'stage', 'tenure', 'type', 'year', 'school', 'line', 'station', 'distance'];
  const exactFields = ['region', 'district', 'stage', 'tenure', 'type', 'year'];
  const result = document.querySelector('[data-results]');
  function readURL() {
    const params = new URLSearchParams(location.search);
    for (const name of fields) form.elements.namedItem(name).value = params.get(name) || (name === 'distance' ? '2000' : '');
    if (params.get('school') || params.get('station') || params.get('line') || location.hash === '#location-filters') document.querySelector('.location-filters').open = true;
  }
  function update(persist = true) {
    const values = Object.fromEntries(fields.map(name => [name, form.elements.namedItem(name).value.trim()]));
    let count = 0;
    for (const card of cards) {
      const amenities = JSON.parse(card.dataset.amenities), distance = Number(values.distance) || 2000;
      const school = amenities.schools.find(item => item.name === values.school && item.distance <= distance);
      const station = amenities.mrts.find(item => item.name === values.station && item.distance <= distance && (!values.line || item.lineName === values.line));
      const lineStation = amenities.mrts.find(item => item.lineName === values.line && item.distance <= distance);
      const queryAmenity = [...amenities.schools, ...amenities.mrts].find(item => values.q && matchesPhrase(item.name, values.q));
      const match = matchesPhrase(card.dataset.search, values.q) && exactFields.every(name => !values[name] || card.dataset[name] === values[name]) && (!values.school || school) && (!values.station || station) && (!values.line || lineStation);
      card.hidden = !match; if (match) count++;
      const context = card.querySelector('[data-match-context]'), amenity = school || station || lineStation || queryAmenity;
      context.hidden = !amenity;
      context.textContent = amenity ? `${amenity.name} · approx. ${Math.round(amenity.distance)} m${amenity.statusLabel ? ' · ' + amenity.statusLabel : ''}` : '';
    }
    result.textContent = `${count} ${count === 1 ? 'project' : 'projects'}`;
    document.querySelector('.empty-state').hidden = count !== 0;
    if (persist) {
      const params = new URLSearchParams();
      for (const name of fields) if (values[name] && (name !== 'distance' || values.school || values.station || values.line)) params.set(name, values[name]);
      history.replaceState(null, '', location.pathname + (params.size ? '?' + params : '') + location.hash);
    }
  }
  form.addEventListener('input', () => update()); form.addEventListener('change', () => update());
  form.addEventListener('submit', event => { event.preventDefault(); update(); });
  form.addEventListener('reset', () => setTimeout(() => update(), 0));
  document.querySelector('[data-reset-directory]')?.addEventListener('click', () => { form.reset(); form.elements.namedItem('q').focus(); });
  window.addEventListener('popstate', () => { readURL(); update(false); }); readURL(); update(false);
}
const videoSearch = document.querySelector('#video-search');
if (videoSearch) {
  const cards = [...document.querySelectorAll('[data-video]')];
  videoSearch.form.addEventListener('submit', event => event.preventDefault());
  videoSearch.addEventListener('input', () => {
    let count = 0;
    for (const card of cards) { card.hidden = !matchesPhrase(card.dataset.search, videoSearch.value); if (!card.hidden) count++; }
    document.querySelector('[data-video-count]').textContent = `${count} ${count === 1 ? 'video' : 'videos'}`;
    document.querySelector('[data-video-empty]').hidden = count !== 0;
  });
}
const dialog = document.querySelector('.plan-dialog');
if (dialog && typeof dialog.showModal === 'function') {
  const image = dialog.querySelector('img'); let opener;
  for (const link of document.querySelectorAll('[data-plan]')) link.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); opener = link; image.src = link.href; image.alt = link.dataset.caption + ' floor plan';
    dialog.querySelector('#plan-caption').textContent = link.dataset.caption;
    dialog.querySelector('[data-original-plan]').href = link.href;
    dialog.showModal(); dialog.querySelector('[data-close-plan]').focus();
  });
  dialog.querySelector('[data-close-plan]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => opener?.focus());
}
