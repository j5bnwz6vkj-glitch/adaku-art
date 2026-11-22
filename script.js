/* ADAKU — shared behaviour: renders pages from catalogue.js + lyrics-data.js,
   then mobile nav, home carousel, catalogue filter + sort. */
(function () {
  'use strict';

  var RELEASES = window.ADAKU_RELEASES || [];
  var LYRICS   = window.ADAKU_LYRICS || {};
  var FEATURED = window.ADAKU_FEATURED_RELEASE || null;

  /* ---- featured release hero: one config block controls each launch ---- */
  if (FEATURED) {
    var fTitle = document.getElementById('featuredReleaseTitle');
    var fEye = document.getElementById('featuredReleaseEyebrow');
    var fTag = document.getElementById('featuredReleaseTagline');
    var fDate = document.getElementById('featuredReleaseDate');
    var fArt = document.getElementById('featuredReleaseArtwork');
    var fListen = document.getElementById('featuredReleaseListen');
    var fExplore = document.getElementById('featuredReleaseExplore');
    if (fTitle && FEATURED.title) fTitle.textContent = FEATURED.title;
    /* long single words (e.g. DECONSTRUCT) get a smaller size so they don't run into the artwork */
    if (fTitle && FEATURED.title && Math.max.apply(null, FEATURED.title.split(/\s+/).map(function (w) { return w.length; })) > 9) fTitle.classList.add('long-title');
    if (fEye && FEATURED.eyebrow) fEye.textContent = FEATURED.eyebrow;
    if (fTag && FEATURED.tagline) fTag.textContent = FEATURED.tagline;
    if (fDate && FEATURED.date) fDate.textContent = FEATURED.date;
    if (fArt && FEATURED.artwork) { fArt.src = FEATURED.artwork; fArt.alt = FEATURED.title + ' by ADAKU cover artwork'; }
    if (fListen && FEATURED.listen) fListen.href = FEATURED.listen;
    if (fListen && FEATURED.listenLabel && fListen.firstChild) fListen.firstChild.nodeValue = FEATURED.listenLabel + ' ';
    if (fExplore && FEATURED.explore) fExplore.href = FEATURED.explore;
    var fGlow = document.querySelector('.release-glow');
    if (fGlow && FEATURED.artwork) fGlow.style.backgroundImage = 'linear-gradient(90deg,#07101d 0%,rgba(7,16,29,.28) 18%,rgba(7,16,29,.05) 50%),url("' + FEATURED.artwork + '")';
    var fCount = document.getElementById('featuredCountdown');
    if (fCount && FEATURED.countdownTo) {
      var target = new Date(FEATURED.countdownTo).getTime();
      var pad = function (n) { return (n < 10 ? '0' : '') + n; };
      var tick = function () {
        var left = target - Date.now();
        if (!(left > 0)) { fCount.hidden = true; return false; }
        var d = Math.floor(left / 864e5), hh = Math.floor(left / 36e5) % 24,
            mm = Math.floor(left / 6e4) % 60, ss = Math.floor(left / 1e3) % 60;
        fCount.innerHTML = '<span class="cd-label">T-minus</span>' +
          [[d, 'days'], [hh, 'hrs'], [mm, 'min'], [ss, 'sec']].map(function (u) {
            return '<span class="cd-unit"><b>' + pad(u[0]) + '</b><small>' + u[1] + '</small></span>';
          }).join('');
        fCount.hidden = false; return true;
      };
      if (tick()) { var cdTimer = setInterval(function () { if (!tick()) clearInterval(cdTimer); }, 1000); }
    }
    var fMotto = document.getElementById('featuredReleaseMotto');
    if (fMotto && FEATURED.motto) {
      fMotto.innerHTML = String(FEATURED.motto).split('•').map(function (w) { return esc(w.trim()); }).join(' <i>•</i> ');
    }
  }

  /* ---- looping silent video behind the hero (loop / loopYouTube in catalogue.js) ---- */
  var heroSec = document.querySelector('.release-hero');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (heroSec && FEATURED && (FEATURED.loop || FEATURED.loopYouTube) && !reduceMotion) {
    var layer = document.createElement('div');
    layer.className = 'hero-loop';
    layer.setAttribute('aria-hidden', 'true');
    heroSec.insertBefore(layer, heroSec.firstChild);
    var sizeLoop = function () { layer.style.setProperty('--loop-h', layer.offsetHeight + 'px'); };
    sizeLoop();
    window.addEventListener('resize', sizeLoop);
    var giveUp = function () { layer.remove(); heroSec.classList.remove('loop-on'); };
    /* the cover art stays up until the loop is actually playing */
    var goLive = function () {
      if (heroSec.classList.contains('loop-on')) return;
      heroSec.classList.add('loop-on');
      layer.classList.add('is-playing');
      sizeLoop();
    };
    var useYouTube = function () {
      var id = FEATURED.loopYouTube;
      if (!id) { giveUp(); return; }
      var slot = document.createElement('div');
      layer.appendChild(slot);
      layer.classList.add('is-yt');
      var build = function () {
        new window.YT.Player(slot, {
          videoId: id,
          host: 'https://www.youtube-nocookie.com',
          playerVars: { autoplay: 1, mute: 1, loop: 1, playlist: id, controls: 0, playsinline: 1,
                        rel: 0, modestbranding: 1, disablekb: 1, iv_load_policy: 3, fs: 0 },
          events: {
            onReady: function (e) { e.target.mute(); e.target.playVideo(); var f = e.target.getIframe(); f.tabIndex = -1; f.title = ''; },
            /* 1 = playing; a short delay lets YouTube's title overlay clear first */
            onStateChange: function (e) { if (e.data === 1) setTimeout(goLive, 1500); else if (e.data === 0) e.target.playVideo(); }
          }
        });
      };
      if (window.YT && window.YT.Player) { build(); return; }
      var prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = function () { if (prev) prev(); build(); };
      var tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.onerror = giveUp;
      document.head.appendChild(tag);
    };
    if (FEATURED.loop) {
      var hv = document.createElement('video');
      hv.muted = true; hv.loop = true; hv.autoplay = true; hv.playsInline = true;
      hv.setAttribute('muted', ''); hv.setAttribute('playsinline', ''); hv.setAttribute('preload', 'auto');
      hv.addEventListener('playing', goLive);
      hv.addEventListener('error', function () { hv.remove(); useYouTube(); });
      hv.src = FEATURED.loop;
      layer.appendChild(hv);
      var hp = hv.play();
      if (hp && hp.catch) hp.catch(function () {});
    } else {
      useYouTube();
    }
  }

  function slug(t) {
    return String(t).toLowerCase().replace(/&/g, 'and')
      .replace(/['’`]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function lyricEntry(t) {
    var e = LYRICS[t];
    if (!e) return null;
    if (typeof e === 'string') return { credit: '', text: e };
    return { credit: e.credit || '', text: e.text || '' };
  }
  function hasLyrics(t) { var e = lyricEntry(t); return !!(e && e.text.trim()); }

  /* cover art that degrades gracefully until the image file exists */
  function cover(r) {
    return '<div class="frame"><img src="' + esc(r.cover) + '" alt="' + esc(r.title) +
           ' cover art" loading="lazy" onerror="this.closest(\'.frame\').classList.add(\'no-art\');this.remove();">' +
           '</div>';
  }

  function card(r, i) {
    var s = slug(r.title);
    /* a release with soon: true (or no listen link yet) shows as "Coming soon" */
    var soon = !!r.soon || !r.listen;
    var lyr = hasLyrics(r.title)
      ? '<a class="btn" href="lyrics.html#' + s + '">Lyrics</a>'
      : '';
    return '<article class="card' + (soon ? ' is-soon' : '') + '" data-type="' + esc((r.type || 'single').toLowerCase()) +
           '" data-order="' + i + '" data-name="' + esc(r.title) + '">' +
           cover(r) +
           '<h3>' + esc(r.title) + '</h3>' +
           '<p class="meta">' + esc(r.type || 'Single') + (soon ? ' · Coming soon' : '') + '</p>' +
           '<div class="card-actions">' + (soon
             ? '<span class="btn soon" aria-disabled="true">Coming soon</span>'
             : '<a class="btn fill" href="' + esc(r.listen) + '" target="_blank" rel="noopener">Listen</a>') +
           lyr + '</div></article>';
  }

  /* ---- home campaign band (window.ADAKU_CAMPAIGN in catalogue.js) ---- */
  var CAMPAIGN = window.ADAKU_CAMPAIGN || null;
  var campEl = document.getElementById('campaign');
  if (campEl && CAMPAIGN) {
    var lines = (CAMPAIGN.ticker || []).map(function (t) { return '<span>' + esc(t) + '</span><i>✦</i>'; }).join('');
    var brief = (CAMPAIGN.briefing || []).map(function (r) {
      var isO2 = /oxygen/i.test(r[0]);
      return '<li' + (isO2 ? ' class="o2"' : '') + '><span>' + esc(r[0]) + '</span><b>' + esc(r[1]) + '</b>' +
        (isO2 ? '<em class="o2-bar"><i style="width:' + (parseInt(r[1], 10) || 12) + '%"></i></em>' : '') + '</li>';
    }).join('');
    campEl.innerHTML =
      (lines ? '<div class="camp-ticker" aria-hidden="true"><div class="camp-run">' + lines + lines + '</div></div>' : '') +
      '<div class="wrap camp-inner">' +
        '<div class="camp-copy">' +
          (CAMPAIGN.kicker ? '<p class="camp-kicker">' + esc(CAMPAIGN.kicker) + '</p>' : '') +
          (CAMPAIGN.quote ? '<h2 class="camp-quote">' + esc(CAMPAIGN.quote) + '</h2>' : '') +
          (CAMPAIGN.text ? '<p class="camp-text">' + esc(CAMPAIGN.text) + '</p>' : '') +
          (CAMPAIGN.link ? '<a class="btn camp-cta" href="' + esc(CAMPAIGN.link) + '" target="_blank" rel="noopener">' + esc(CAMPAIGN.cta || 'Listen') + ' <svg width="18" height="8" viewBox="0 0 18 8" fill="none" stroke="currentColor" aria-hidden="true"><path d="M0 4h16M12 1l4 3-4 3"/></svg></a>' : '') +
        '</div>' +
        (brief ? '<div class="camp-panel"><p class="camp-panel-head"><span class="dot"></span>Lunar club · live status</p><ul>' + brief + '</ul>' +
          (CAMPAIGN.status ? '<p class="camp-status">' + esc(CAMPAIGN.status) + '</p>' : '') + '</div>' : '') +
      '</div>';
    campEl.hidden = false;
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
      var entry = lyricEntry(title);
      var text = entry ? entry.text : '';
      titleEl.textContent = title;
      if (text && text.trim()) {
        bodyEl.classList.remove('placeholder');
        bodyEl.innerHTML = text.trim().split(/\n{2,}/).map(function (block) {
          var b = block.trim();
          if (b.indexOf('## ') === 0) {
            var head = '<h3 class="lyric-section">' + esc(b.slice(3).split('\n')[0]) + '</h3>';
            var rest = b.split('\n').slice(1).join('\n');
            return head + (rest.trim() ? '<p>' + esc(rest).replace(/\n/g, '<br>') + '</p>' : '');
          }
          return '<p>' + esc(b).replace(/\n/g, '<br>') + '</p>';
        }).join('');
        noteEl.textContent = entry.credit || 'Official lyrics';
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

  /* ---- "Latest" news strip (window.ADAKU_NEWS in catalogue.js) ---- */
  var NEWS = window.ADAKU_NEWS || [];
  var newsSec = document.getElementById('news');
  var newsGrid = document.getElementById('newsGrid');
  if (newsSec && newsGrid && NEWS.length) {
    newsGrid.innerHTML = NEWS.map(function (n) {
      var ext = n.link && /^https?:/.test(n.link);
      return '<article class="news-item">' +
        (n.kicker ? '<p class="news-kicker">' + esc(n.kicker) + '</p>' : '') +
        '<h3>' + esc(n.title || '') + '</h3>' +
        (n.text ? '<p class="news-text">' + esc(n.text) + '</p>' : '') +
        (n.link ? '<a class="news-link" href="' + esc(n.link) + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + '>' +
          esc(n.linkLabel || 'More') + ' <svg width="18" height="8" viewBox="0 0 18 8" fill="none" stroke="currentColor" aria-hidden="true"><path d="M0 4h16M12 1l4 3-4 3"/></svg></a>' : '') +
        '</article>';
    }).join('');
    newsSec.hidden = false;
  } else {
    /* no news: drop the menu link so it never points at nothing */
    var newsLink = document.querySelector('#navlinks a[href$="#news"]');
    if (newsLink && !newsSec) newsLink.remove();
  }

  /* ---- featured video player + thumbnail row ---- */
  var VIDEO = window.ADAKU_VIDEO;
  var VIDEOS = window.ADAKU_VIDEOS || [];
  var film = document.querySelector('.filmcard');
  if (film && VIDEO && VIDEO.id) {
    var current = VIDEO;
    var link = film.querySelector('a');
    var cap  = document.getElementById('filmCap');
    var fb = document.getElementById('ytFallback');
    var poster = film.querySelector('img');
    var watchUrl = function (id) { return 'https://www.youtube.com/watch?v=' + id; };
    var thumb = function (id, size) { return 'https://i.ytimg.com/vi/' + id + '/' + size + '.jpg'; };
    var setVideo = function (v) {
      current = v;
      if (link) link.href = watchUrl(v.id);
      if (fb) fb.href = watchUrl(v.id);
      if (cap && v.title) cap.textContent = v.title + (v.caption ? ' \u2014 ' + v.caption : '');
      if (poster) {
        poster.onerror = function () { poster.onerror = null; poster.src = thumb(v.id, 'hqdefault'); };
        poster.src = v.poster || thumb(v.id, 'maxresdefault');
        poster.alt = (v.title || 'ADAKU') + ' video still';
      }
    };
    setVideo(VIDEO);
    var play = function (e) {
      if (e) e.preventDefault();
      var f = film.querySelector('iframe');
      var src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(current.id) + '?autoplay=1&rel=0';
      if (!f) {
        f = document.createElement('iframe');
        f.allow = 'accelerometer; autoplay; encrypted-media; picture-in-picture';
        f.allowFullscreen = true;
        if (link) link.hidden = true;
        film.appendChild(f);
      }
      f.title = current.title || 'ADAKU video';
      f.src = src;
    };
    if (link) link.addEventListener('click', play);

    var row = document.getElementById('videoRow');
    if (row && VIDEOS.length > 1) {
      row.innerHTML = VIDEOS.map(function (v, i) {
        return '<button type="button" class="vid-thumb" data-i="' + i + '"' +
          (v.id === VIDEO.id ? ' aria-current="true"' : '') + '>' +
          '<span class="vid-img"><img src="' + thumb(v.id, 'mqdefault') + '" alt="" loading="lazy"></span>' +
          '<span class="vid-title">' + esc(v.title) + '</span></button>';
      }).join('');
      row.hidden = false;
      row.addEventListener('click', function (e) {
        var b = e.target.closest('.vid-thumb');
        if (!b) return;
        var v = VIDEOS[Number(b.dataset.i)];
        Array.prototype.forEach.call(row.children, function (c) { c.removeAttribute('aria-current'); });
        b.setAttribute('aria-current', 'true');
        setVideo(v);
        play();
      });
    }

    var watch = document.getElementById('watchLatest');
    if (watch) {
      if (FEATURED && FEATURED.watchLabel) watch.lastChild.nodeValue = FEATURED.watchLabel;
      watch.hidden = false;
      watch.addEventListener('click', function (e) {
        e.preventDefault();
        setVideo(VIDEO);
        if (row) Array.prototype.forEach.call(row.children, function (c) {
          if (VIDEOS[Number(c.dataset.i)] && VIDEOS[Number(c.dataset.i)].id === VIDEO.id) c.setAttribute('aria-current', 'true');
          else c.removeAttribute('aria-current');
        });
        film.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
        setTimeout(play, 450);
      });
    }
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
