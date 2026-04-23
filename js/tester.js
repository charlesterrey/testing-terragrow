// Tester detail page (admin view)
(async function () {
  try {
  var isSupabaseConfigured = typeof _isSupabaseReady !== 'undefined' && _isSupabaseReady;
  var isPreview = window.location.search.includes('preview');
  var testerId = new URLSearchParams(window.location.search).get('id');
  if (!testerId) { window.location.href = 'admin.html'; return; }

  var testerProfile = null, feedbacks = [];

  if (isSupabaseConfigured && !isPreview) {
    var session = await requireAuth();
    if (!session) return;
    var adminProfile = await getProfile(session.user.id);
    if (!adminProfile || adminProfile.role !== 'admin') { window.location.href = 'dashboard.html'; return; }

    // Load tester profile
    var pr = await supabase.from('profiles').select('*').eq('id', testerId).single();
    testerProfile = pr.data;

    // Load tester feedbacks
    var fb = await supabase.from('feedbacks').select('*').eq('user_id', testerId);
    feedbacks = fb.data || [];
  } else {
    // Preview mock
    var mockProfiles = {
      'u1': { id: 'u1', first_name: 'Michael', last_name: 'Lachmann', email: 'michael@cfg-alsace.fr', job_title: 'Conseiller', company: 'CFG Alsace', created_at: '2026-04-20T10:00:00Z', updated_at: '2026-04-23T14:30:00Z' },
      'u2': { id: 'u2', first_name: 'Victoria', last_name: 'Martin', email: 'victoria@cfg-alsace.fr', job_title: 'Conseiller', company: 'CFG Alsace', created_at: '2026-04-21T09:00:00Z', updated_at: '2026-04-23T11:15:00Z' },
      'u3': { id: 'u3', first_name: 'Antoine', last_name: 'Dubois', email: 'antoine@cfg-alsace.fr', job_title: 'Conseiller', company: 'CFG Alsace', created_at: '2026-04-22T08:00:00Z', updated_at: '2026-04-22T08:00:00Z' },
    };
    testerProfile = mockProfiles[testerId] || mockProfiles['u1'];

    var allMockFeedbacks = [
      { journey_id: 'A1', user_id: 'u1', note: 4, critere_navigation: 'ok', critere_comprehension: 'ok', critere_performance: 'ok', critere_fonctionnel: 'a_ameliorer', critere_design: 'ok', verbatim: 'Bonne prise en main.', suggestion: 'Ajouter un indicateur de progression.', statut_realisation: 'termine' },
      { journey_id: 'A2', user_id: 'u1', note: 5, critere_navigation: 'ok', critere_comprehension: 'ok', critere_performance: 'ok', critere_fonctionnel: 'ok', critere_design: 'ok', verbatim: 'Très clair.', suggestion: null, statut_realisation: 'termine' },
      { journey_id: 'A3', user_id: 'u1', note: 2, critere_navigation: 'a_ameliorer', critere_comprehension: 'bloquant', critere_performance: 'ok', critere_fonctionnel: 'a_ameliorer', critere_design: 'ok', verbatim: 'Navigation confuse.', suggestion: 'Simplifier la création.', statut_realisation: 'en_cours' },
      { journey_id: 'C1', user_id: 'u1', note: 4, critere_navigation: 'ok', critere_comprehension: 'ok', critere_performance: 'ok', critere_fonctionnel: 'ok', critere_design: 'ok', verbatim: null, suggestion: null, statut_realisation: 'termine' },
      { journey_id: 'A1', user_id: 'u2', note: 3, critere_navigation: 'ok', critere_comprehension: 'a_ameliorer', critere_performance: 'ok', critere_fonctionnel: 'ok', critere_design: 'a_ameliorer', verbatim: 'Parcours un peu long.', suggestion: null, statut_realisation: 'termine' },
      { journey_id: 'A5', user_id: 'u2', note: 1, critere_navigation: 'bloquant', critere_comprehension: 'bloquant', critere_performance: 'a_ameliorer', critere_fonctionnel: 'bloquant', critere_design: 'a_ameliorer', verbatim: 'Prévisionnel incompréhensible.', suggestion: 'Refaire entièrement.', statut_realisation: 'termine' },
    ];
    feedbacks = allMockFeedbacks.filter(function(f) { return f.user_id === testerId; });
  }

  if (!testerProfile) { window.location.href = 'admin.html'; return; }

  // Load journeys
  var res = await fetch('data/journeys.json');
  var journeysData = await res.json();
  var allJourneys = journeysData.journeys;
  var totalJourneys = allJourneys.length;
  var criteriaFields = ['critere_navigation', 'critere_comprehension', 'critere_performance', 'critere_fonctionnel', 'critere_design'];

  var fbMap = {};
  feedbacks.forEach(function(f) { fbMap[f.journey_id] = f; });

  // Header
  document.getElementById('tester-name').textContent = testerProfile.first_name + ' ' + testerProfile.last_name;
  document.getElementById('tester-meta').textContent = [testerProfile.job_title, testerProfile.company].filter(Boolean).join(' — ');
  document.getElementById('tester-email').textContent = testerProfile.email || '';
  document.getElementById('tester-created').textContent = 'Inscrit le ' + (testerProfile.created_at ? new Date(testerProfile.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—');

  function timeAgo(d) {
    var diff = Math.floor((new Date() - new Date(d)) / 1000);
    if (diff < 60) return "à l'instant";
    if (diff < 3600) return 'il y a ' + Math.floor(diff / 60) + ' min';
    if (diff < 86400) return 'il y a ' + Math.floor(diff / 3600) + 'h';
    if (diff < 172800) return 'hier';
    return 'il y a ' + Math.floor(diff / 86400) + ' jours';
  }
  document.getElementById('tester-active').textContent = 'Actif ' + (testerProfile.updated_at ? timeAgo(testerProfile.updated_at) : '—');

  // Stats
  var completed = 0, noteSum = 0, noteCount = 0;
  feedbacks.forEach(function(f) {
    var hn = f.note !== null && f.note !== undefined;
    var ac = f.critere_navigation && f.critere_comprehension && f.critere_performance && f.critere_fonctionnel && f.critere_design;
    if (hn && ac) completed++;
    if (hn) { noteSum += f.note; noteCount++; }
  });
  var pct = Math.round((completed / totalJourneys) * 100);

  document.getElementById('tester-progress').textContent = completed + '/' + totalJourneys;
  document.getElementById('tester-bar').style.width = pct + '%';
  document.getElementById('mail-link').href = 'mailto:' + (testerProfile.email || '');
  document.title = 'TerraGrow — ' + testerProfile.first_name + ' ' + testerProfile.last_name;

  // Results table
  var tbody = document.getElementById('results-tbody');

  function dot(val) {
    if (val === 'ok') return '<span class="w-2 h-2 rounded-full inline-block" style="background:#1cc172"></span>';
    if (val === 'a_ameliorer') return '<span class="w-2 h-2 rounded-full inline-block" style="background:#f59e0b"></span>';
    if (val === 'bloquant') return '<span class="w-2 h-2 rounded-full inline-block" style="background:#e57373"></span>';
    return '<span class="w-2 h-2 rounded-full bg-neutral-200 inline-block"></span>';
  }

  // Build row data for filtering
  var journeyRows = allJourneys.map(function(j) {
    var fb = fbMap[j.id];
    var hn = fb && fb.note !== null && fb.note !== undefined;
    var ac = fb && fb.critere_navigation && fb.critere_comprehension && fb.critere_performance && fb.critere_fonctionnel && fb.critere_design;
    var status = 'todo';
    if (hn && ac) status = 'done';
    else if (fb) status = 'partial';
    return { j: j, fb: fb, status: status };
  });

  function renderTesterTable(rows) {
    tbody.innerHTML = '';
    rows.forEach(function(r) {
      var j = r.j, fb = r.fb;
      var tr = document.createElement('tr');
      tr.className = 'border-b border-neutral-100 hover:bg-neutral-100/40 transition-colors' + (!fb ? ' opacity-40' : '');

      var noteHtml = fb && fb.note !== null && fb.note !== undefined
        ? '<span class="font-semibold">' + fb.note + '</span><span class="text-neutral-400">/5</span>'
        : '<span class="text-neutral-300">—</span>';

      var statusHtml;
      if (r.status === 'done') statusHtml = '<span class="text-tg-success text-[10px] font-medium">Parcouru</span>';
      else if (r.status === 'partial') statusHtml = '<span class="text-amber-500 text-[10px] font-medium">En cours</span>';
      else statusHtml = '<span class="text-neutral-400 text-[10px]">—</span>';

      tr.innerHTML =
        '<td class="px-3 py-1.5 font-mono text-[10px] text-neutral-400">' + j.id + '</td>' +
        '<td class="px-3 py-1.5 text-neutral-800 font-medium">' + j.title + '</td>' +
        '<td class="px-3 py-1.5 text-center">' + dot(fb ? fb.critere_navigation : null) + '</td>' +
        '<td class="px-3 py-1.5 text-center">' + dot(fb ? fb.critere_comprehension : null) + '</td>' +
        '<td class="px-3 py-1.5 text-center">' + dot(fb ? fb.critere_performance : null) + '</td>' +
        '<td class="px-3 py-1.5 text-center">' + dot(fb ? fb.critere_fonctionnel : null) + '</td>' +
        '<td class="px-3 py-1.5 text-center">' + dot(fb ? fb.critere_design : null) + '</td>' +
        '<td class="px-3 py-1.5 text-center">' + noteHtml + '</td>' +
        '<td class="px-3 py-1.5 text-center">' + statusHtml + '</td>';
      tbody.appendChild(tr);
    });
  }

  renderTesterTable(journeyRows);

  // Filter + search
  function applyFilters() {
    var q = (document.getElementById('tester-table-search').value || '').toLowerCase();
    var f = document.getElementById('tester-table-filter').value;
    var filtered = journeyRows.filter(function(r) {
      if (f !== 'all' && r.status !== f) return false;
      if (q && !r.j.id.toLowerCase().includes(q) && !r.j.title.toLowerCase().includes(q)) return false;
      return true;
    });
    renderTesterTable(filtered);
  }

  document.getElementById('tester-table-search').addEventListener('input', applyFilters);
  document.getElementById('tester-table-filter').addEventListener('change', applyFilters);

  // Sort
  var testerSortState = { col: null, asc: true };
  document.querySelectorAll('.tester-sort').forEach(function(th) {
    th.addEventListener('click', function() {
      var col = th.dataset.sort;
      if (testerSortState.col === col) testerSortState.asc = !testerSortState.asc;
      else { testerSortState.col = col; testerSortState.asc = true; }

      var statusRank = { done: 0, partial: 1, todo: 2 };
      journeyRows.sort(function(a, b) {
        var va, vb;
        if (col === 'id') { va = a.j.id; vb = b.j.id; }
        else if (col === 'title') { va = a.j.title; vb = b.j.title; }
        else if (col === 'note') {
          va = a.fb && a.fb.note !== null && a.fb.note !== undefined ? a.fb.note : -1;
          vb = b.fb && b.fb.note !== null && b.fb.note !== undefined ? b.fb.note : -1;
        }
        else if (col === 'status') { va = statusRank[a.status]; vb = statusRank[b.status]; }
        if (typeof va === 'string') return testerSortState.asc ? va.localeCompare(vb) : vb.localeCompare(va);
        return testerSortState.asc ? va - vb : vb - va;
      });
      applyFilters();
    });
  });

  // Comments
  var commentsEl = document.getElementById('comments-section');
  var hasComments = false;

  allJourneys.forEach(function(j) {
    var fb = fbMap[j.id];
    if (!fb) return;
    var verbatim = (fb.verbatim || '').trim();
    var suggestion = (fb.suggestion || '').trim();
    if (!verbatim && !suggestion) return;
    hasComments = true;

    var card = document.createElement('div');
    card.className = 'flex gap-3 py-2 border-b border-neutral-100 last:border-0';
    card.innerHTML =
      '<span class="font-mono text-[10px] text-neutral-400 w-6 flex-shrink-0 pt-0.5">' + j.id + '</span>' +
      '<div class="flex-1 min-w-0">' +
        '<p class="text-[11px] font-medium text-neutral-800 mb-0.5">' + j.title + '</p>' +
        (verbatim ? '<p class="text-[11px] text-neutral-600 italic">"' + verbatim + '"</p>' : '') +
        (suggestion ? '<p class="text-[11px] text-tg-primary/70 mt-0.5">→ ' + suggestion + '</p>' : '') +
      '</div>';
    commentsEl.appendChild(card);
  });

  if (!hasComments) {
    commentsEl.innerHTML = '<p class="text-[11px] text-neutral-400 text-center py-3">Aucun commentaire.</p>';
  }

  // Show
  document.getElementById('loading').classList.add('hidden');
  var pc = document.getElementById('page-content');
  pc.classList.remove('hidden');
  requestAnimationFrame(function() { pc.classList.add('visible'); });

  } catch (err) {
    console.error('[Tester]', err);
    document.getElementById('loading').classList.add('hidden');
    var pc = document.getElementById('page-content');
    pc.classList.remove('hidden');
    pc.classList.add('visible');
  }
})();
