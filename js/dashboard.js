// Dashboard logic
(async function () {
  try {
  var isSupabaseConfigured = typeof _isSupabaseReady !== 'undefined' && _isSupabaseReady;
  var user = null, profile = null, feedbacks = [];

  if (isSupabaseConfigured && typeof requireAuth === 'function' && !window.location.search.includes('preview')) {
    var session = await requireAuth();
    if (!session) return;
    user = session.user;
    // Safety net: if pending_profile still in localStorage, retry the upsert
    var pendingProfile = localStorage.getItem('pending_profile');
    if (pendingProfile) {
      try {
        var pp = JSON.parse(pendingProfile);
        var upsertRes = await supabase.from('profiles').upsert({
          id: user.id,
          first_name: pp.first_name,
          last_name: pp.last_name,
          email: pp.email,
          phone: pp.phone,
          company: pp.company,
          job_title: pp.job_title
        }, { onConflict: 'id' });
        if (!upsertRes.error) localStorage.removeItem('pending_profile');
        else console.error('Profile upsert retry error:', upsertRes.error);
      } catch (e) { console.error(e); }
    }
    profile = await getProfile(user.id);
    if (!profile || !profile.first_name) { window.location.href = 'register.html?complete=1'; return; }
    var result = await supabase.from('feedbacks').select('*').order('journey_id', { ascending: true });
    feedbacks = result.data || [];
  } else {
    profile = { first_name: 'Michael', last_name: 'Lachmann', job_title: 'Conseiller de gestion', company: 'CFG Alsace', role: 'admin' };
    feedbacks = [
      { journey_id: 'A1', statut_realisation: 'termine', note: 4, critere_navigation: 'ok', critere_comprehension: 'ok', critere_performance: 'ok', critere_fonctionnel: 'a_ameliorer', critere_design: 'ok' },
      { journey_id: 'A2', statut_realisation: 'termine', note: 5, critere_navigation: 'ok', critere_comprehension: 'ok', critere_performance: 'ok', critere_fonctionnel: 'ok', critere_design: 'ok' },
      { journey_id: 'A3', statut_realisation: 'termine', note: 3, critere_navigation: 'ok', critere_comprehension: 'a_ameliorer', critere_performance: 'ok', critere_fonctionnel: 'ok', critere_design: 'a_ameliorer' },
      { journey_id: 'A4', statut_realisation: 'en_cours', note: null, critere_navigation: 'ok', critere_comprehension: null, critere_performance: null, critere_fonctionnel: null, critere_design: null },
      { journey_id: 'A5', statut_realisation: 'en_cours', note: 2, critere_navigation: 'a_ameliorer', critere_comprehension: 'bloquant', critere_performance: 'ok', critere_fonctionnel: 'a_ameliorer', critere_design: 'ok' },
      { journey_id: 'A6', statut_realisation: 'bloque', note: 1, critere_navigation: 'bloquant', critere_comprehension: 'bloquant', critere_performance: 'a_ameliorer', critere_fonctionnel: 'bloquant', critere_design: 'a_ameliorer' },
      { journey_id: 'C1', statut_realisation: 'termine', note: 4, critere_navigation: 'ok', critere_comprehension: 'ok', critere_performance: 'ok', critere_fonctionnel: 'ok', critere_design: 'a_ameliorer' },
      { journey_id: 'C2', statut_realisation: 'termine', note: 5, critere_navigation: 'ok', critere_comprehension: 'ok', critere_performance: 'ok', critere_fonctionnel: 'ok', critere_design: 'ok' },
      { journey_id: 'C3', statut_realisation: 'en_cours', note: null, critere_navigation: null, critere_comprehension: null, critere_performance: null, critere_fonctionnel: null, critere_design: null },
    ];
  }

  // Header
  var avatarEl = document.getElementById('user-avatar');
  if (avatarEl) avatarEl.textContent = getInitials(profile.first_name, profile.last_name);
  document.getElementById('user-name').textContent = profile.first_name + ' ' + profile.last_name;
  document.getElementById('user-meta').textContent = [profile.job_title, profile.company].filter(Boolean).join(' — ');
  var firstnameEl = document.getElementById('user-firstname');
  if (firstnameEl) firstnameEl.textContent = profile.first_name;

  document.getElementById('logout-btn').addEventListener('click', async function() {
    if (isSupabaseConfigured) await supabase.auth.signOut();
    window.location.href = 'index.html';
  });

  // Load journeys
  var res = await fetch('data/journeys.json');
  var data = await res.json();
  var journeys = data.journeys;
  var total = journeys.length;

  var feedbackMap = {};
  feedbacks.forEach(function(fb) { feedbackMap[fb.journey_id] = fb; });

  // Stats
  var done = 0, partial = 0, noteSum = 0, noteCount = 0;
  var agriDone = 0, agriTotal = 0, agriNoteSum = 0, agriNoteCount = 0;
  var consDone = 0, consTotal = 0, consNoteSum = 0, consNoteCount = 0;

  journeys.forEach(function(j) {
    var isAgri = j.section === 'agriculteur';
    if (isAgri) agriTotal++; else consTotal++;
    var fb = feedbackMap[j.id];
    if (!fb) return;
    var hasN = fb.note !== null && fb.note !== undefined;
    var allC = fb.critere_navigation && fb.critere_comprehension && fb.critere_performance && fb.critere_fonctionnel && fb.critere_design;
    var anyFilled = hasN || fb.critere_navigation || fb.critere_comprehension || fb.critere_performance || fb.critere_fonctionnel || fb.critere_design;
    if (hasN && allC) { done++; if (isAgri) agriDone++; else consDone++; }
    else if (anyFilled) partial++;
    if (hasN) {
      noteSum += fb.note; noteCount++;
      if (isAgri) { agriNoteSum += fb.note; agriNoteCount++; }
      else { consNoteSum += fb.note; consNoteCount++; }
    }
  });
  var agriAvg = agriNoteCount > 0 ? (agriNoteSum / agriNoteCount).toFixed(1) : '—';
  var consAvg = consNoteCount > 0 ? (consNoteSum / consNoteCount).toFixed(1) : '—';
  var pct = Math.round((done / total) * 100);
  var remaining = total - done - partial;

  // Donut SVG
  function donut(doneV, totalV, color, size) {
    var r = 34, cx = 44, cy = 44, circ = 2 * Math.PI * r;
    var p = totalV > 0 ? doneV / totalV : 0;
    var filled = circ * p;
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 88 88">' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="#e5e7eb" stroke-width="6"/>' +
      (p > 0 ? '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + color + '" stroke-width="6" stroke-linecap="round" stroke-dasharray="' + filled + ' ' + (circ - filled) + '" transform="rotate(-90 ' + cx + ' ' + cy + ')"/>' : '') +
      '<text x="' + cx + '" y="' + cy + '" text-anchor="middle" dominant-baseline="central" font-family="Inter,sans-serif" font-size="15" font-weight="600" fill="#1d1e24">' + doneV + '/' + totalV + '</text>' +
    '</svg>';
  }

  // Render progress
  document.getElementById('progress-section').innerHTML =
    '<div class="flex-1">' +
      '<div class="flex items-baseline gap-2 mb-3">' +
        '<span class="text-3xl font-semibold text-neutral-950 tracking-tight">' + pct + '%</span>' +
        '<span class="text-sm text-neutral-500">' + done + ' sur ' + total + ' journeys parcourues</span>' +
      '</div>' +
      '<div class="flex items-center gap-4 text-xs text-neutral-500">' +
        '<span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-tg-success"></span>' + done + ' parcourus</span>' +
        '<span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-tg-primary"></span>' + partial + ' en cours</span>' +
        '<span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-red-400"></span>' + remaining + ' restants</span>' +
      '</div>' +
    '</div>' +
    '<div class="flex items-center gap-6">' +
      '<div class="flex flex-col items-center gap-1">' +
        donut(agriDone, agriTotal, '#1cc172', 88) +
        '<span class="text-[11px] text-neutral-500">Agriculteur</span>' +
        '<span class="text-[11px] font-semibold text-neutral-950">' + agriAvg + ' <span class="font-normal text-neutral-400">/5</span></span>' +
      '</div>' +
      '<div class="flex flex-col items-center gap-1">' +
        donut(consDone, consTotal, '#2563eb', 88) +
        '<span class="text-[11px] text-neutral-500">Conseiller</span>' +
        '<span class="text-[11px] font-semibold text-neutral-950">' + consAvg + ' <span class="font-normal text-neutral-400">/5</span></span>' +
      '</div>' +
    '</div>';

  // Sort: À faire (0) → En cours (1) → Parcouru (2), same logic as test page
  function cardStatus(fb) {
    if (!fb) return 0;
    var hasN = fb.note !== null && fb.note !== undefined;
    var allC = fb.critere_navigation && fb.critere_comprehension && fb.critere_performance && fb.critere_fonctionnel && fb.critere_design;
    var anyFilled = hasN || fb.critere_navigation || fb.critere_comprehension || fb.critere_performance || fb.critere_fonctionnel || fb.critere_design;
    if (hasN && allC) return 2; // Parcouru
    if (anyFilled) return 1;   // En cours
    return 0;                   // À faire
  }
  var sortedJourneys = journeys.slice().sort(function(a, b) {
    return cardStatus(feedbackMap[a.id]) - cardStatus(feedbackMap[b.id]);
  });

  // Render cards
  var grid = document.getElementById('tests-grid');
  var allCards = [];

  sortedJourneys.forEach(function(j) {
    var fb = feedbackMap[j.id];
    var card = makeCard(j, fb);
    grid.appendChild(card);
    allCards.push({ el: card, section: j.section });
  });

  // Filters
  document.getElementById('filter-all').addEventListener('click', function() { filterCards('all'); });
  document.getElementById('filter-agri').addEventListener('click', function() { filterCards('agriculteur'); });
  document.getElementById('filter-conseiller').addEventListener('click', function() { filterCards('conseiller'); });

  function filterCards(section) {
    var count = 0;
    allCards.forEach(function(c) {
      if (section === 'all' || c.section === section) { c.el.style.display = ''; count++; }
      else { c.el.style.display = 'none'; }
    });
    document.getElementById('visible-count').textContent = count;
    document.querySelectorAll('.filter-btn').forEach(function(btn) {
      btn.classList.remove('bg-white', 'text-neutral-950', 'shadow-sm');
      btn.classList.add('text-neutral-500');
    });
    var id = section === 'all' ? 'filter-all' : section === 'agriculteur' ? 'filter-agri' : 'filter-conseiller';
    var btn = document.getElementById(id);
    btn.classList.add('bg-white', 'text-neutral-950', 'shadow-sm');
    btn.classList.remove('text-neutral-500');
    // section-label removed — greeting is static now
  }

  function makeCard(j, fb) {
    var el = document.createElement('a');
    el.href = 'test.html?id=' + j.id;

    // Completion: same logic as test page — 5 criteria + note
    var filled = 0;
    var hasNote = false;
    var allCriteria = false;
    if (fb) {
      if (fb.critere_navigation) filled++;
      if (fb.critere_comprehension) filled++;
      if (fb.critere_performance) filled++;
      if (fb.critere_fonctionnel) filled++;
      if (fb.critere_design) filled++;
      hasNote = fb.note !== null && fb.note !== undefined;
      if (hasNote) filled++;
      allCriteria = fb.critere_navigation && fb.critere_comprehension && fb.critere_performance && fb.critere_fonctionnel && fb.critere_design;
    }
    var completionPct = Math.round((filled / 6) * 100);
    var isComplete = hasNote && allCriteria;
    var isPartial = !isComplete && filled > 0;

    var statusText, statusDotClass;
    if (isComplete)     { statusText = 'Parcouru'; statusDotClass = 'bg-tg-success'; }
    else if (isPartial) { statusText = 'En cours'; statusDotClass = 'bg-amber-400'; }
    else                { statusText = 'À faire';  statusDotClass = 'bg-neutral-300'; }

    el.className = 'group bg-white rounded-lg border border-neutral-200 p-3.5 flex flex-col justify-between transition-all duration-150 hover:shadow-sm hover:border-neutral-300'
      + (isComplete ? ' opacity-50 hover:opacity-80' : '');
    el.style.minHeight = '110px';

    var isAgri = j.section === 'agriculteur';
    var sectionDot = isAgri ? 'bg-emerald-400' : 'bg-blue-400';
    var sectionLabel = isAgri ? 'Agri' : 'Conseil';

    // Progress bar color
    var barColor = completionPct === 100 ? 'bg-tg-success' : completionPct > 0 ? 'bg-tg-primary' : 'bg-neutral-300';

    el.innerHTML =
      '<div>' +
        '<div class="flex items-center justify-between mb-2">' +
          '<div class="flex items-center gap-1.5">' +
            '<span class="text-[11px] font-mono font-semibold text-neutral-400">' + j.id + '</span>' +
            '<span class="w-1 h-1 rounded-full ' + sectionDot + '"></span>' +
            '<span class="text-[10px] text-neutral-400">' + sectionLabel + '</span>' +
          '</div>' +
          '<span class="flex items-center gap-1">' +
            '<span class="w-1.5 h-1.5 rounded-full ' + statusDotClass + '"></span>' +
            '<span class="text-[10px] text-neutral-500">' + statusText + '</span>' +
          '</span>' +
        '</div>' +
        '<p class="text-[13px] font-medium text-neutral-800 leading-snug group-hover:text-neutral-950 transition-colors mb-2">' + j.title + '</p>' +
      '</div>' +
      '<div>' +
        '<div class="flex items-center justify-between mb-1">' +
          '<span class="text-[10px] text-neutral-400">' + (completionPct > 0 ? completionPct + '%' : '') + '</span>' +
        '</div>' +
        '<div class="h-[3px] rounded-full bg-neutral-200">' +
          '<div class="h-[3px] rounded-full ' + barColor + ' transition-all" style="width:' + completionPct + '%"></div>' +
        '</div>' +
      '</div>';

    return el;
  }

  // Fade in page content
  requestAnimationFrame(function() {
    var pc = document.getElementById('page-content');
    if (pc) pc.classList.add('visible');
  });

  } catch (err) {
    console.error('[Dashboard]', err);
  }
})();
