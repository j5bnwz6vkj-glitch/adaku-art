/* ADAKU — shared behaviour: renders pages from catalogue.js + lyrics-data.js,
   then mobile nav, home carousel, catalogue filter + sort. */
(function () {
  'use strict';

  var RELEASES = window.ADAKU_RELEASES || [];
  var LYRICS   = window.ADAKU_LYRICS || {};

  function slug(t) {
    return String(t).toLowerCase().replace(/&/g, 'and')
      .replace(/['’`]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function hasLyrics(t) { return !!(LYRICS[t] && String(LYRICS[t]).trim()); }

  /* cover art that degrades gracefully until the image file exists */
  function cover(r) {
    return '<div class="frame"><img src="' + esc(r.cover) + '" alt="' + esc(r.title) +
           ' cover art" loading="lazy" onerror="this.closest(\'.frame\').classList.add(\'no-art\');this.remove();">' +
           '</div>';
  }

  function card(r, i) {
    var s = slug(r.title);
    var lyr = hasLyrics(r.title)
      ? '<a class="btn" href="lyrics.html#' + s + '">Lyrics</a>'
      : '';
    return '<article class="card" data-type="' + esc((r.type || 'single').toLowerCase()) +
           '" data-order="' + i + '" data-name="' + esc(r.title) + '">' +
           cover(r) +
           '<h3>' + esc(r.title) + '</h3>' +
           '<p class="meta">' + esc(r.type || 'Single') + '</p>' +
           '<div class="card-actions"><a class="btn fill" href="' + esc(r.listen) +
           '" target="_blank" rel="noopener">Listen</a>' + lyr + '</div></article>';
  }

  /* ---- home rail: the first five releases ---- */
  var track = document.getElementById('track');
  if (track && RELEASES.length) {
    track.innerHTML = RELEASES.slice(0, 5).map(card).join('');
  }

  /* ---- releases page: the whole catalogue ---- */
  var grid = document.getElementById('catalogGrid');
  if (grid && RELEASES.length) {
    grid.innerHTML = RELEASES.map(card).join('');
  }

  /* ---- lyrics page ---- */
  var songList = document.getElementById('songList');
  if (songList) {
    var titleEl = document.getElementById('lyricTitle');
    var bodyEl  = document.getElementById('lyricBody');
    var noteEl  = document.getElementById('lyricNote');

    songList.innerHTML = RELEASES.map(function (r) {
      return '<button type="button" class="song" data-title="' + esc(r.title) + '">' +
             esc(r.title) + (hasLyrics(r.title) ? '' : ' <em>soon</em>') + '</button>';
    }).join('');

    function show(title) {
      var text = LYRICS[title];
      titleEl.textContent = title;
      if (text && String(text).trim()) {
        bodyEl.classList.remove('placeholder');
        bodyEl.innerHTML = String(text).trim().split(/\n{2,}/).map(function (block) {
          return '<p>' + esc(block).replace(/\n/g, '<br>') + '</p>';
        }).join('');
        noteEl.textContent = 'Official lyrics';
      } else {
        bodyEl.classList.add('placeholder');
        bodyEl.innerHTML = '<p>Lyrics for this song are coming soon.</p>';
        noteEl.textContent = 'Not yet published';
      }
      Array.prototype.forEach.call(songList.children, function (b) {
        b.setAttribute('aria-current', String(b.dataset.title === title));
      });
      if (history.replaceState) history.replaceState(null, '', '#' + slug(title));
    }

    songList.addEventListener('click', function (e) {
      var b = e.target.closest('.song');
      if (b) show(b.dataset.title);
    });

    var search = document.getElementById('lyricSearch');
    if (search) {
      search.addEventListener('input', function () {
        var q = search.value.toLowerCase();
        Array.prototype.forEach.call(songList.children, function (b) {
          b.hidden = b.dataset.title.toLowerCase().indexOf(q) === -1;
        });
      });
    }

    var want = decodeURIComponent(location.hash.replace('#', ''));
    var start = RELEASES.filter(function (r) { return slug(r.title) === want; })[0]
             || RELEASES.filter(function (r) { return hasLyrics(r.title); })[0]
             || RELEASES[0];
    if (start) show(start.title);
  }

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
  if (track) {
    document.querySelectorAll('.arrow[data-scroll]').forEach(function (a) {
      a.addEventListener('click', function () {
        var c = track.querySelector('.card');
        var step = c ? c.getBoundingClientRect().width + 16 : 220;
        track.scrollBy({ left: step * 2 * Number(a.dataset.scroll), behavior: 'smooth' });
      });
    });
  }

  /* ---- catalogue filter + sort ---- */
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
