// Recap page logic
(async function () {
  try {

  var isSupabaseConfigured = typeof _isSupabaseReady !== 'undefined' && _isSupabaseReady;
  var isPreview = window.location.search.includes('preview');
  var user = null, profile = null, feedbacks = [];

  if (isSupabaseConfigured && !isPreview) {
    var session = await requireAuth();
    if (!session) return;
    user = session.user;
    profile = await getProfile(user.id);
    if (!profile) { window.location.href = 'register.html'; return; }
    var result = await supabase.from('feedbacks').select('*').order('journey_id', { ascending: true });
    feedbacks = result.data || [];
  } else {
    profile = { first_name: 'Michael', last_name: 'Lachmann', job_title: 'Conseiller de gestion', company: 'CFG Alsace' };
    feedbacks = [
      { journey_id: 'A1', statut_realisation: 'termine', note: 4, critere_navigation: 'ok', critere_comprehension: 'ok', critere_performance: 'ok', critere_fonctionnel: 'a_ameliorer', critere_design: 'ok', verbatim: 'L\'onboarding est fluide et agréable.', suggestion: 'Ajouter un indicateur de progression.' },
      { journey_id: 'A2', statut_realisation: 'termine', note: 5, critere_navigation: 'ok', critere_comprehension: 'ok', critere_performance: 'ok', critere_fonctionnel: 'ok', critere_design: 'ok', verbatim: 'Très clair, le modèle parcelle/assolement est bien expliqué.', suggestion: null },
      { journey_id: 'A3', statut_realisation: 'termine', note: 3, critere_navigation: 'ok', critere_comprehension: 'a_ameliorer', critere_performance: 'ok', critere_fonctionnel: null, critere_design: null, verbatim: null, suggestion: 'Simplifier la création d\'ITK.' },
      { journey_id: 'A4', statut_realisation: 'en_cours', note: null, critere_navigation: 'ok', critere_comprehension: null, critere_performance: null, critere_fonctionnel: null, critere_design: null, verbatim: null, suggestion: null },
      { journey_id: 'A5', statut_realisation: 'en_cours', note: 2, critere_navigation: 'a_ameliorer', critere_comprehension: 'bloquant', critere_performance: 'ok', critere_fonctionnel: 'a_ameliorer', critere_design: 'ok', verbatim: 'Le BFR est difficile à comprendre.', suggestion: 'Ajouter des infobulles explicatives.' },
      { journey_id: 'C1', statut_realisation: 'termine', note: 4, critere_navigation: 'ok', critere_comprehension: 'ok', critere_performance: 'ok', critere_fonctionnel: 'ok', critere_design: 'a_ameliorer', verbatim: 'Le portefeuille est très utile.', suggestion: 'Améliorer le tri par type de production.' },
      { journey_id: 'C2', statut_realisation: 'termine', note: 5, critere_navigation: 'ok', critere_comprehension: 'ok', critere_performance: 'ok', critere_fonctionnel: 'ok', critere_design: 'ok', verbatim: 'Fiche client parfaite.', suggestion: null },
    ];
  }

  var res = await fetch('data/journeys.json');
  var data = await res.json();
  var allJourneys = data.journeys;
  var total = allJourneys.length;

  var fbMap = {};
  feedbacks.forEach(function(f) { fbMap[f.journey_id] = f; });

  // Header
  document.getElementById('user-fullname').textContent = profile.first_name + ' ' + profile.last_name;
  var p2name = document.getElementById('user-fullname-p2');
  if (p2name) p2name.textContent = profile.first_name + ' ' + profile.last_name;
  document.getElementById('user-job').textContent = [profile.job_title, profile.company].filter(Boolean).join(' — ');
  var now = new Date();
  var dateStr = now.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  document.getElementById('completion-date').textContent = 'Généré le ' + dateStr;
  document.getElementById('footer-date').textContent = 'Rapport généré le ' + dateStr + ' — TerraGrow Testing';

  // Stats
  var criteriaFields = ['critere_navigation', 'critere_comprehension', 'critere_performance', 'critere_fonctionnel', 'critere_design'];
  var done = 0, noteSum = 0, noteCount = 0;
  var criteriaCounts = {};
  criteriaFields.forEach(function(f) { criteriaCounts[f] = { ok: 0, a_ameliorer: 0, bloquant: 0 }; });
  var noteDistribution = [0, 0, 0, 0, 0, 0];

  allJourneys.forEach(function(j) {
    var fb = fbMap[j.id];
    if (!fb) return;
    var hasNote = fb.note !== null && fb.note !== undefined;
    var allC = fb.critere_navigation && fb.critere_comprehension && fb.critere_performance && fb.critere_fonctionnel && fb.critere_design;
    if (hasNote && allC) done++;
    if (hasNote) { noteSum += fb.note; noteCount++; noteDistribution[fb.note]++; }
    criteriaFields.forEach(function(f) {
      if (fb[f] && criteriaCounts[f][fb[f]] !== undefined) criteriaCounts[f][fb[f]]++;
    });
  });

  document.getElementById('stat-journeys').textContent = done + '/' + total;
  document.getElementById('stat-note').textContent = noteCount > 0 ? (noteSum / noteCount).toFixed(1) : '—';

  // Criteria chart
  var criteriaLabels = { critere_navigation: 'Navigation', critere_comprehension: 'Compréhension', critere_performance: 'Performance', critere_fonctionnel: 'Fonctionnel', critere_design: 'Design' };
  var chartEl = document.getElementById('criteria-chart');

  criteriaFields.forEach(function(f) {
    var c = criteriaCounts[f];
    var t = c.ok + c.a_ameliorer + c.bloquant;
    if (t === 0) t = 1;
    var pOk = Math.round(c.ok / t * 100);
    var pWarn = Math.round(c.a_ameliorer / t * 100);
    var pBlock = 100 - pOk - pWarn;

    var row = document.createElement('div');
    row.className = 'flex items-center gap-3';
    row.innerHTML =
      '<span class="text-[11px] text-neutral-600 w-24 flex-shrink-0 text-right">' + criteriaLabels[f] + '</span>' +
      '<div class="flex-1 flex rounded h-[8px] overflow-hidden bg-neutral-100">' +
        (pOk > 0 ? '<div style="width:' + pOk + '%" class="h-full" style="background:#1cc172"></div>' : '') +
        (pWarn > 0 ? '<div style="width:' + pWarn + '%" class="h-full" style="background:#f59e0b"></div>' : '') +
        (pBlock > 0 ? '<div style="width:' + pBlock + '%" class="h-full" style="background:#e57373"></div>' : '') +
      '</div>' +
      '<span class="text-[10px] text-neutral-400 w-6 text-right">' + t + '</span>';

    // Fix: inline style on same element needs single style attribute
    var bar = row.querySelector('.flex-1');
    bar.innerHTML = '';
    if (pOk > 0) { var d = document.createElement('div'); d.className = 'h-full'; d.style.width = pOk + '%'; d.style.background = '#1cc172'; bar.appendChild(d); }
    if (pWarn > 0) { var d2 = document.createElement('div'); d2.className = 'h-full'; d2.style.width = pWarn + '%'; d2.style.background = '#f59e0b'; bar.appendChild(d2); }
    if (pBlock > 0) { var d3 = document.createElement('div'); d3.className = 'h-full'; d3.style.width = pBlock + '%'; d3.style.background = '#e57373'; bar.appendChild(d3); }

    chartEl.appendChild(row);
  });

  // Note histogram
  var histEl = document.getElementById('note-histogram');
  var maxNote = Math.max.apply(null, noteDistribution) || 1;
  var histColors = ['#d4d4d8', '#ef4444', '#f59e0b', '#a7a7ae', '#2563eb', '#1cc172'];

  for (var i = 0; i <= 5; i++) {
    var count = noteDistribution[i];
    var heightPct = (count / maxNote) * 100;
    var bar = document.createElement('div');
    bar.className = 'flex-1 flex flex-col items-center justify-end h-full';
    var inner = '';
    if (count > 0) inner += '<span class="text-[10px] font-semibold text-neutral-600 mb-1">' + count + '</span>';
    var barDiv = document.createElement('div');
    barDiv.className = 'w-full rounded-t-sm';
    barDiv.style.height = Math.max(heightPct, 3) + '%';
    barDiv.style.background = histColors[i];
    barDiv.style.minHeight = '2px';
    bar.innerHTML = inner;
    bar.appendChild(barDiv);
    histEl.appendChild(bar);
  }

  // Results table
  var tbody = document.getElementById('results-tbody');

  function statusDot(val) {
    if (val === 'ok') return '<span class="w-2 h-2 rounded-full inline-block" style="background:#1cc172"></span>';
    if (val === 'a_ameliorer') return '<span class="w-2 h-2 rounded-full inline-block" style="background:#f59e0b"></span>';
    if (val === 'bloquant') return '<span class="w-2 h-2 rounded-full inline-block" style="background:#e57373"></span>';
    return '<span class="w-2 h-2 rounded-full bg-neutral-200 inline-block"></span>';
  }

  var sorted = allJourneys.slice().sort(function(a, b) {
    function rank(fb) {
      if (!fb) return 2;
      var hn = fb.note !== null && fb.note !== undefined;
      var ac = fb.critere_navigation && fb.critere_comprehension && fb.critere_performance && fb.critere_fonctionnel && fb.critere_design;
      if (hn && ac) return 0;
      if (hn || fb.critere_navigation || fb.critere_comprehension) return 1;
      return 2;
    }
    return rank(fbMap[a.id]) - rank(fbMap[b.id]);
  });

  sorted.forEach(function(j) {
    var fb = fbMap[j.id];
    var tr = document.createElement('tr');
    tr.className = 'border-b border-neutral-100';
    var noteText = fb && fb.note !== null && fb.note !== undefined ? '<span class="font-semibold">' + fb.note + '</span><span class="text-neutral-400">/5</span>' : '<span class="text-neutral-300">—</span>';

    tr.innerHTML =
      '<td class="py-1 pr-2 font-mono text-[10px] text-neutral-400">' + j.id + '</td>' +
      '<td class="py-1 pr-2 text-[11px] text-neutral-800">' + j.title + '</td>' +
      '<td class="py-1 px-1 text-center">' + statusDot(fb ? fb.critere_navigation : null) + '</td>' +
      '<td class="py-1 px-1 text-center">' + statusDot(fb ? fb.critere_comprehension : null) + '</td>' +
      '<td class="py-1 px-1 text-center">' + statusDot(fb ? fb.critere_performance : null) + '</td>' +
      '<td class="py-1 px-1 text-center">' + statusDot(fb ? fb.critere_fonctionnel : null) + '</td>' +
      '<td class="py-1 px-1 text-center">' + statusDot(fb ? fb.critere_design : null) + '</td>' +
      '<td class="py-1 px-2 text-center text-[11px]">' + noteText + '</td>';
    tbody.appendChild(tr);
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
        (verbatim ? '<p class="text-[11px] text-neutral-600 leading-relaxed italic">"' + verbatim + '"</p>' : '') +
        (suggestion ? '<p class="text-[11px] text-tg-primary/70 leading-relaxed mt-0.5">→ ' + suggestion + '</p>' : '') +
      '</div>';
    commentsEl.appendChild(card);
  });

  if (!hasComments) {
    commentsEl.innerHTML = '<p class="text-[11px] text-neutral-400 text-center py-3">Aucun commentaire.</p>';
  }

  // Print
  document.getElementById('print-btn').addEventListener('click', function() { window.print(); });

  } catch (err) {
    console.error('[Recap]', err);
  }
})();
