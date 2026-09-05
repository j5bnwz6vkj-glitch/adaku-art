/* ADAKU — shared behaviour: mobile nav, home carousel, catalogue filter + sort. */
(function () {
  'use strict';

  /* ---- mobile navigation ---- */
  var btn = document.querySelector('.menu-btn');
  var links = document.getElementById('navlinks');
  if (btn && links) {
    btn.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
    });
  }

  /* ---- home carousel ---- */
  var track = document.getElementById('track');
  if (track) {
    document.querySelectorAll('.arrow[data-scroll]').forEach(function (a) {
      a.addEventListener('click', function () {
        var card = track.querySelector('.card');
        var step = card ? card.getBoundingClientRect().width + 16 : 220;
        track.scrollBy({ left: step * 2 * Number(a.dataset.scroll), behavior: 'smooth' });
      });
    });
  }

  /* ---- catalogue filter + sort ---- */
  var grid = document.getElementById('catalogGrid');
  if (!grid) return;
  var cards = Array.prototype.slice.call(grid.children);
  var chips = Array.prototype.slice.call(document.querySelectorAll('.chip[data-filter]'));
  var sort = document.getElementById('sort');
  var filter = 'all';

  function apply() {
    var shown = cards.filter(function (c) {
      var ok = filter === 'all' || c.dataset.type === filter;
      c.hidden = !ok;
      return ok;
    });
    var mode = sort ? sort.value : 'latest';
    shown.sort(function (a, b) {
      if (mode === 'az') return a.dataset.name.localeCompare(b.dataset.name);
      var d = Number(a.dataset.order) - Number(b.dataset.order);
      return mode === 'oldest' ? -d : d;
    });
    shown.forEach(function (c) { grid.appendChild(c); });
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      filter = chip.dataset.filter;
      chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c === chip)); });
      apply();
    });
  });
  if (sort) sort.addEventListener('change', apply);
  apply();
})();
