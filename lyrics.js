/* ADAKU — lyrics index, search and reader. Reads window.ADAKU_LYRICS from lyrics-data.js. */
(function () {
  'use strict';

  var list   = document.getElementById('songList');
  var search = document.getElementById('lyricSearch');
  var title  = document.getElementById('lyricTitle');
  var note   = document.getElementById('lyricNote');
  var body   = document.getElementById('lyricBody');
  var count  = document.getElementById('songCount');
  if (!list || !body) return;

  var data = window.ADAKU_LYRICS;
  if (!data) {
    body.className = 'placeholder';
    body.innerHTML = '<strong>Lyrics data did not load.</strong><br>' +
      'Check that <code>lyrics-data.js</code> sits beside this page and that the filename matches exactly.';
    return;
  }

  var names = Object.keys(data);
  var current = names[0];
  if (count) count.textContent = String(names.length);

  function render() {
    var q = (search && search.value ? search.value : '').toLowerCase();
    var matches = names.filter(function (n) { return n.toLowerCase().indexOf(q) !== -1; });
    list.innerHTML = '';
    if (!matches.length) {
      var p = document.createElement('p');
      p.className = 'lyrics-note';
      p.style.margin = '10px 12px';
      p.textContent = 'No songs match that search.';
      list.appendChild(p);
      return;
    }
    matches.forEach(function (name) {
      var b = document.createElement('button');
      b.className = 'song-btn';
      b.type = 'button';
      b.textContent = name;
      if (name === current) b.setAttribute('aria-current', 'true');
      b.addEventListener('click', function () { select(name); });
      list.appendChild(b);
    });
  }

  function select(name) {
    current = name;
    var entry = data[name] || {};
    title.textContent = name;
    note.textContent = entry.note || 'Official lyrics';
    if (entry.text) {
      body.className = 'lyrics-body';
      body.textContent = entry.text;
    } else {
      body.className = 'placeholder';
      body.innerHTML = '<strong>Lyrics not published yet.</strong><br>' +
        'Add the text for this song to <code>lyrics-data.js</code> and it appears here immediately — ' +
        'search and navigation are already wired.';
    }
    render();
  }

  if (search) search.addEventListener('input', render);
  select(current);
})();
