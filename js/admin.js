// Admin synthesis page logic
(async function () {
  try {
  var isSupabaseConfigured = typeof _isSupabaseReady !== 'undefined' && _isSupabaseReady;
  var isPreview = window.location.search.includes('preview');
  var user = null, profile = null, feedbacks = [], profiles = [];

  if (isSupabaseConfigured && !isPreview) {
    var session = await requireAuth();
    if (!session) return;
    user = session.user;
    profile = await getProfile(user.id);
    if (!profile || profile.role !== 'admin') { window.location.href = 'dashboard.html'; return; }
    var fbResult = await supabase.from('feedbacks').select('*');
    feedbacks = (fbResult.data || []);
    var prResult = await supabase.from('profiles').select('id, first_name, last_name, email, job_title, company, role, created_at, updated_at');
    profiles = (prResult.data || []);
  } else {
    profile = { first_name: 'Charles', last_name: 'TERREY', job_title: 'CEO', company: 'TerraGrow', role: 'admin' };
    feedbacks = [
      { journey_id: 'A1', user_id: 'u1', statut_realisation: 'termine', note: 4, critere_navigation: 'ok', critere_comprehension: 'ok', critere_performance: 'ok', critere_fonctionnel: 'a_ameliorer', critere_design: 'ok', verbatim: 'Bonne prise en main globale.' },
      { journey_id: 'A1', user_id: 'u2', statut_realisation: 'termine', note: 3, critere_navigation: 'ok', critere_comprehension: 'a_ameliorer', critere_performance: 'ok', critere_fonctionnel: 'ok', critere_design: 'a_ameliorer', verbatim: 'Le parcours est un peu long.' },
      { journey_id: 'A2', user_id: 'u1', statut_realisation: 'termine', note: 5, critere_navigation: 'ok', critere_comprehension: 'ok', critere_performance: 'ok', critere_fonctionnel: 'ok', critere_design: 'ok', verbatim: null },
      { journey_id: 'A3', user_id: 'u1', statut_realisation: 'en_cours', note: 2, critere_navigation: 'a_ameliorer', critere_comprehension: 'bloquant', critere_performance: 'ok', critere_fonctionnel: 'a_ameliorer', critere_design: 'ok', verbatim: 'Navigation confuse.' },
      { journey_id: 'A5', user_id: 'u2', statut_realisation: 'termine', note: 1, critere_navigation: 'bloquant', critere_comprehension: 'bloquant', critere_performance: 'a_ameliorer', critere_fonctionnel: 'bloquant', critere_design: 'a_ameliorer', verbatim: 'Prévisionnel incompréhensible.' },
      { journey_id: 'C1', user_id: 'u1', statut_realisation: 'termine', note: 4, critere_navigation: 'ok', critere_comprehension: 'ok', critere_performance: 'ok', critere_fonctionnel: 'ok', critere_design: 'ok', verbatim: null },
      { journey_id: 'C2', user_id: 'u2', statut_realisation: 'en_cours', note: null, critere_navigation: null, critere_comprehension: null, critere_performance: null, critere_fonctionnel: null, critere_design: null, verbatim: null },
    ];
    profiles = [
      { id: 'u1', first_name: 'Michael', last_name: 'Lachmann', email: 'michael@cfg-alsace.fr', job_title: 'Conseiller', company: 'CFG Alsace', role: 'tester', created_at: '2026-04-20T10:00:00Z', updated_at: '2026-04-23T14:30:00Z' },
      { id: 'u2', first_name: 'Victoria', last_name: 'Martin', email: 'victoria@cfg-alsace.fr', job_title: 'Conseiller', company: 'CFG Alsace', role: 'tester', created_at: '2026-04-21T09:00:00Z', updated_at: '2026-04-23T11:15:00Z' },
      { id: 'u3', first_name: 'Antoine', last_name: 'Dubois', email: 'antoine@cfg-alsace.fr', job_title: 'Conseiller', company: 'CFG Alsace', role: 'tester', created_at: '2026-04-22T08:00:00Z', updated_at: '2026-04-22T08:00:00Z' },
    ];
  }

  // Header
  document.getElementById('user-name').textContent = profile.first_name + ' ' + profile.last_name;
  var fnEl = document.getElementById('user-firstname');
  if (fnEl) fnEl.textContent = profile.first_name;

  var profileMap = {};
  profiles.forEach(function(p) { profileMap[p.id] = p; });

  var res = await fetch('data/journeys.json');
  var journeysData = await res.json();
  var journeys = journeysData.journeys;
  var totalJourneys = journeys.length;
  var criteriaFields = ['critere_navigation', 'critere_comprehension', 'critere_performance', 'critere_fonctionnel', 'critere_design'];

  var feedbacksByJourney = {};
  var feedbacksByUser = {};
  feedbacks.forEach(function(fb) {
    if (!feedbacksByJourney[fb.journey_id]) feedbacksByJourney[fb.journey_id] = [];
    feedbacksByJourney[fb.journey_id].push(fb);
    if (!feedbacksByUser[fb.user_id]) feedbacksByUser[fb.user_id] = [];
    feedbacksByUser[fb.user_id].push(fb);
  });

  // KPIs
  var globalCompleted = 0, globalNotesSum = 0, globalNotesCount = 0, globalBlockers = 0, activeTesters = {};
  feedbacks.forEach(function(fb) {
    activeTesters[fb.user_id] = true;
    if (fb.statut_realisation === 'termine') globalCompleted++;
    if (fb.note !== null && fb.note !== undefined) { globalNotesSum += fb.note; globalNotesCount++; }
    criteriaFields.forEach(function(f) { if (fb[f] === 'bloquant') globalBlockers++; });
  });

  var completionPct = feedbacks.length > 0 ? Math.round((globalCompleted / feedbacks.length) * 100) : 0;
  var avgScore = globalNotesCount > 0 ? (globalNotesSum / globalNotesCount).toFixed(1) : '—';

  document.getElementById('kpi-completion').textContent = completionPct + '%';
  document.getElementById('kpi-completion-bar').style.width = completionPct + '%';
  document.getElementById('kpi-completion-sub').textContent = globalCompleted + ' feedbacks terminés';
  document.getElementById('kpi-score').innerHTML = avgScore + '<span class="text-[10px] font-normal text-neutral-500"> /5</span>';
  document.getElementById('kpi-score-sub').textContent = 'sur ' + globalNotesCount + ' feedbacks notés';
  document.getElementById('kpi-testers').textContent = profiles.filter(function(p) { return p.role !== 'admin'; }).length;
  document.getElementById('kpi-blockers').textContent = globalBlockers;

  // --- TESTERS ---
  var testers = profiles.filter(function(p) { return p.role !== 'admin'; });

  function testerCompleted(t) {
    var fbs = feedbacksByUser[t.id] || [];
    return fbs.filter(function(f) {
      var hn = f.note !== null && f.note !== undefined;
      return hn && f.critere_navigation && f.critere_comprehension && f.critere_performance && f.critere_fonctionnel && f.critere_design;
    }).length;
  }

  testers.sort(function(a, b) { return testerCompleted(b) - testerCompleted(a); });

  function timeAgo(d) {
    var diff = Math.floor((new Date() - new Date(d)) / 1000);
    if (diff < 60) return "à l'instant";
    if (diff < 3600) return 'il y a ' + Math.floor(diff / 60) + ' min';
    if (diff < 86400) return 'il y a ' + Math.floor(diff / 3600) + 'h';
    if (diff < 172800) return 'hier';
    return 'il y a ' + Math.floor(diff / 86400) + 'j';
  }

  // Build tester data rows
  var testerRows = testers.map(function(t) {
    var completed = testerCompleted(t);
    var pct = Math.round((completed / totalJourneys) * 100);
    return {
      id: t.id,
      name: t.first_name + ' ' + t.last_name,
      email: t.email || '',
      job: [t.job_title, t.company].filter(Boolean).join(' — '),
      created: t.created_at || '',
      createdLabel: t.created_at ? new Date(t.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '—',
      updated: t.updated_at || '',
      updatedLabel: t.updated_at ? timeAgo(t.updated_at) : '—',
      completed: completed,
      pct: pct
    };
  });

  var testersTbody = document.getElementById('testers-body');
  var mailBtn = document.getElementById('mail-selected');

  function updateMailButton() {
    var checked = document.querySelectorAll('.tester-checkbox:checked');
    if (mailBtn) {
      if (checked.length > 0) {
        mailBtn.classList.remove('hidden');
        mailBtn.textContent = 'Envoyer un mail (' + checked.length + ')';
      } else {
        mailBtn.classList.add('hidden');
      }
    }
  }

  function renderTesters(rows) {
    testersTbody.innerHTML = '';
    rows.forEach(function(r) {
      var tr = document.createElement('tr');
      tr.className = 'border-b border-neutral-100 hover:bg-neutral-100/40 transition-colors';
      tr.innerHTML =
        '<td class="px-3 py-1.5"><input type="checkbox" class="tester-checkbox rounded border-neutral-300" data-email="' + r.email + '"></td>' +
        '<td class="px-3 py-1.5 font-medium text-neutral-950"><a href="tester.html?id=' + r.id + (isPreview ? '&preview' : '') + '" class="hover:text-tg-primary hover:underline transition-colors">' + r.name + '</a></td>' +
        '<td class="px-3 py-1.5 text-neutral-500">' + r.email + '</td>' +
        '<td class="px-3 py-1.5 text-neutral-500">' + r.job + '</td>' +
        '<td class="px-3 py-1.5 text-neutral-500">' + r.createdLabel + '</td>' +
        '<td class="px-3 py-1.5 text-neutral-500">' + r.updatedLabel + '</td>' +
        '<td class="px-3 py-1.5">' +
          '<div class="flex items-center gap-2 justify-center">' +
            '<span class="text-[10px] font-semibold text-neutral-950 w-8 text-right">' + r.completed + '/' + totalJourneys + '</span>' +
            '<div class="w-16 h-[5px] rounded bg-neutral-200"><div class="h-[5px] rounded bg-tg-success" style="width:' + r.pct + '%"></div></div>' +
            '<span class="text-[10px] text-neutral-400 w-6">' + r.pct + '%</span>' +
          '</div>' +
        '</td>';
      testersTbody.appendChild(tr);
    });
    updateMailButton();
  }

  renderTesters(testerRows);

  // Select all checkbox
  document.getElementById('select-all-testers').addEventListener('change', function() {
    var checked = this.checked;
    document.querySelectorAll('.tester-checkbox').forEach(function(cb) { cb.checked = checked; });
    updateMailButton();
  });

  // Individual checkbox change
  document.addEventListener('change', function(e) {
    if (e.target.classList.contains('tester-checkbox')) updateMailButton();
  });

  // Mail button action
  if (mailBtn) mailBtn.addEventListener('click', function() {
    var emails = [];
    document.querySelectorAll('.tester-checkbox:checked').forEach(function(cb) {
      if (cb.dataset.email) emails.push(cb.dataset.email);
    });
    if (emails.length > 0) {
      window.location.href = 'mailto:?bcc=' + emails.join(',') + '&subject=TerraGrow Testing';
    }
  });

  // Testers search
  document.getElementById('testers-search').addEventListener('input', function() {
    var q = this.value.toLowerCase();
    var filtered = testerRows.filter(function(r) {
      return r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q) || r.job.toLowerCase().includes(q);
    });
    renderTesters(filtered);
  });

  // Testers sort
  var testerSort = { col: null, asc: true };
  document.querySelectorAll('.sortable-tester').forEach(function(th) {
    th.style.cursor = 'pointer';
    th.addEventListener('click', function() {
      var col = th.dataset.col;
      if (testerSort.col === col) testerSort.asc = !testerSort.asc;
      else { testerSort.col = col; testerSort.asc = true; }

      var sorted = testerRows.slice().sort(function(a, b) {
        var va, vb;
        if (col === 'name') { va = a.name; vb = b.name; }
        else if (col === 'created') { va = a.created; vb = b.created; }
        else if (col === 'active') { va = a.updated; vb = b.updated; }
        else if (col === 'progress') { va = a.completed; vb = b.completed; }
        if (typeof va === 'string') return testerSort.asc ? va.localeCompare(vb) : vb.localeCompare(va);
        return testerSort.asc ? va - vb : vb - va;
      });
      renderTesters(sorted);
    });
  });

  // --- SYNTHESIS TABLE (sortable + filterable) ---
  var tbody = document.getElementById('synthesis-body');
  var journeyRows = [];

  journeys.forEach(function(journey) {
    var fbs = feedbacksByJourney[journey.id] || [];
    var ok = 0, warn = 0, block = 0, parcouru = 0, partiel = 0;
    var noteSum = 0, noteCount = 0;

    fbs.forEach(function(fb) {
      criteriaFields.forEach(function(f) {
        if (fb[f] === 'ok') ok++;
        if (fb[f] === 'a_ameliorer') warn++;
        if (fb[f] === 'bloquant') block++;
      });
      if (fb.statut_realisation === 'termine') parcouru++;
      else if (fb.statut_realisation === 'en_cours' || fb.statut_realisation === 'bloque') partiel++;
      if (fb.note !== null && fb.note !== undefined) { noteSum += fb.note; noteCount++; }
    });

    var avg = noteCount > 0 ? (noteSum / noteCount).toFixed(1) : null;
    journeyRows.push({ id: journey.id, title: journey.title, ok: ok, warn: warn, block: block, parcouru: parcouru, partiel: partiel, note: avg, noteNum: avg ? parseFloat(avg) : -1 });
  });

  function renderTable(rows) {
    tbody.innerHTML = '';
    rows.forEach(function(r) {
      var tr = document.createElement('tr');
      tr.className = 'border-b border-neutral-100 hover:bg-neutral-100/40 transition-colors';
      var noteHtml = r.note ? '<span class="font-semibold">' + r.note + '</span><span class="text-neutral-400">/5</span>' : '<span class="text-neutral-300">—</span>';
      tr.innerHTML =
        '<td class="px-3 py-1.5 font-mono text-[10px] text-neutral-400">' + r.id + '</td>' +
        '<td class="px-3 py-1.5 text-neutral-800 font-medium">' + r.title + '</td>' +
        '<td class="px-3 py-1.5 text-center"><span class="inline-block w-5 h-5 leading-5 rounded text-[10px] font-bold bg-backgroundLime text-lime-700">' + r.ok + '</span></td>' +
        '<td class="px-3 py-1.5 text-center"><span class="inline-block w-5 h-5 leading-5 rounded text-[10px] font-bold bg-backgroundAmber text-amber-700">' + r.warn + '</span></td>' +
        '<td class="px-3 py-1.5 text-center"><span class="inline-block w-5 h-5 leading-5 rounded text-[10px] font-bold bg-backgroundRed text-red-700">' + r.block + '</span></td>' +
        '<td class="px-3 py-1.5 text-center">' + noteHtml + '</td>' +
        '<td class="px-3 py-1.5 text-center text-neutral-600">' + r.parcouru + '</td>' +
        '<td class="px-3 py-1.5 text-center text-neutral-600">' + r.partiel + '</td>';
      tbody.appendChild(tr);
    });
  }

  renderTable(journeyRows);

  // Sort
  var currentSort = { col: null, asc: true };
  document.querySelectorAll('th.sortable').forEach(function(th) {
    th.addEventListener('click', function() {
      var col = th.dataset.col;
      if (currentSort.col === col) currentSort.asc = !currentSort.asc;
      else { currentSort.col = col; currentSort.asc = true; }

      document.querySelectorAll('th.sortable').forEach(function(t) { t.classList.remove('active'); });
      th.classList.add('active');

      var sorted = journeyRows.slice().sort(function(a, b) {
        var va = a[col], vb = b[col];
        if (col === 'note') { va = a.noteNum; vb = b.noteNum; }
        if (typeof va === 'string') return currentSort.asc ? va.localeCompare(vb) : vb.localeCompare(va);
        return currentSort.asc ? va - vb : vb - va;
      });
      renderTable(sorted);
    });
  });

  // Search
  document.getElementById('table-search').addEventListener('input', function() {
    var q = this.value.toLowerCase();
    var filtered = journeyRows.filter(function(r) { return r.id.toLowerCase().includes(q) || r.title.toLowerCase().includes(q); });
    renderTable(filtered);
  });

  // --- VERBATIMS ---
  var verbatimsList = document.getElementById('verbatims-list');
  var hasVerbatims = false;

  journeys.forEach(function(journey) {
    var fbs = feedbacksByJourney[journey.id] || [];
    var verbs = fbs.filter(function(fb) { return fb.verbatim && fb.verbatim.trim(); });
    if (verbs.length === 0) return;
    hasVerbatims = true;

    var html = '';
    verbs.forEach(function(fb) {
      var p = profileMap[fb.user_id];
      var name = p ? p.first_name + ' ' + p.last_name : 'Inconnu';
      html += '<div class="flex items-start gap-2 py-1.5"><span class="text-[10px] font-medium text-neutral-950 flex-shrink-0 w-20">' + name + '</span><p class="text-[11px] text-neutral-600 italic">"' + fb.verbatim + '"</p></div>';
    });

    var section = document.createElement('div');
    section.className = 'border-b border-neutral-100 pb-2 last:border-0';
    section.innerHTML = '<div class="flex items-center gap-2 mb-1"><span class="font-mono text-[10px] text-neutral-400">' + journey.id + '</span><span class="text-[11px] font-medium text-neutral-800">' + journey.title + '</span></div>' + html;
    verbatimsList.appendChild(section);
  });

  if (!hasVerbatims) document.getElementById('no-verbatims').classList.remove('hidden');

  // --- PROBLEMATIQUES ---
  var problematicList = document.getElementById('problematic-list');
  var rated = journeyRows.filter(function(j) { return j.noteNum > 0; });
  rated.sort(function(a, b) { return a.noteNum - b.noteNum; });
  var worst = rated.slice(0, 5);

  if (worst.length === 0) {
    document.getElementById('no-problematic').classList.remove('hidden');
  } else {
    worst.forEach(function(j) {
      var c = j.noteNum < 2 ? 'text-red-600' : j.noteNum < 3.5 ? 'text-amber-600' : 'text-neutral-600';
      var row = document.createElement('div');
      row.className = 'flex items-center justify-between bg-white rounded border border-red-200 px-3 py-1.5';
      row.innerHTML =
        '<div class="flex items-center gap-2"><span class="font-mono text-[10px] text-neutral-400">' + j.id + '</span><span class="text-[11px] text-neutral-800">' + j.title + '</span></div>' +
        '<div class="flex items-center gap-2"><span class="text-[11px] font-semibold ' + c + '">' + j.note + '/5</span><span class="text-[10px] text-neutral-500">' + j.block + ' bloq.</span></div>';
      problematicList.appendChild(row);
    });
  }

  // --- EXPORT EXCEL ---
  document.getElementById('export-excel').addEventListener('click', function() {
    if (typeof XLSX === 'undefined') { alert('Chargement en cours, réessayez.'); return; }
    var wb = XLSX.utils.book_new();

    var criteriaLabels = { critere_navigation: 'Navigation', critere_comprehension: 'Compréhension', critere_performance: 'Performance', critere_fonctionnel: 'Fonctionnel', critere_design: 'Design' };
    var statusLabels = { ok: 'OK', a_ameliorer: 'À améliorer', bloquant: 'Bloquant' };

    // --- Sheet 1: Synthèse globale ---
    var globalRows = [['ID', 'Journey', 'Section', 'Nb feedbacks', 'Navigation OK', 'Navigation À amél.', 'Navigation Bloq.', 'Compréhension OK', 'Compréhension À amél.', 'Compréhension Bloq.', 'Performance OK', 'Performance À amél.', 'Performance Bloq.', 'Fonctionnel OK', 'Fonctionnel À amél.', 'Fonctionnel Bloq.', 'Design OK', 'Design À amél.', 'Design Bloq.', 'Note moyenne', 'Nb parcouru', 'Nb partiel']];

    journeys.forEach(function(j) {
      var fbs = feedbacksByJourney[j.id] || [];
      var counts = {};
      criteriaFields.forEach(function(f) { counts[f] = { ok: 0, a_ameliorer: 0, bloquant: 0 }; });
      var noteS = 0, noteC = 0, parcouru = 0, partiel = 0;
      fbs.forEach(function(fb) {
        criteriaFields.forEach(function(f) { if (fb[f] && counts[f][fb[f]] !== undefined) counts[f][fb[f]]++; });
        if (fb.statut_realisation === 'termine') parcouru++;
        else if (fb.statut_realisation === 'en_cours' || fb.statut_realisation === 'bloque') partiel++;
        if (fb.note !== null && fb.note !== undefined) { noteS += fb.note; noteC++; }
      });
      var row = [j.id, j.title, j.section === 'agriculteur' ? 'Agriculteur' : 'Conseiller', fbs.length];
      criteriaFields.forEach(function(f) { row.push(counts[f].ok, counts[f].a_ameliorer, counts[f].bloquant); });
      row.push(noteC > 0 ? Math.round(noteS / noteC * 10) / 10 : '', parcouru, partiel);
      globalRows.push(row);
    });

    var wsGlobal = XLSX.utils.aoa_to_sheet(globalRows);
    wsGlobal['!cols'] = [{ wch: 5 }, { wch: 35 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, wsGlobal, 'Synthèse');

    // --- Sheet 2: Tous les feedbacks ---
    var allRows = [['Testeur', 'Email', 'Journey ID', 'Journey', 'Section', 'Navigation', 'Compréhension', 'Performance', 'Fonctionnel', 'Design', 'Note /5', 'Statut', 'Commentaire', 'Verbatim', 'Suggestion']];

    feedbacks.forEach(function(fb) {
      var p = profileMap[fb.user_id];
      var j = journeys.find(function(jj) { return jj.id === fb.journey_id; });
      var name = p ? p.first_name + ' ' + p.last_name : 'Inconnu';
      var email = p ? (p.email || '') : '';
      allRows.push([
        name, email, fb.journey_id, j ? j.title : '', j ? (j.section === 'agriculteur' ? 'Agriculteur' : 'Conseiller') : '',
        statusLabels[fb.critere_navigation] || '', statusLabels[fb.critere_comprehension] || '', statusLabels[fb.critere_performance] || '',
        statusLabels[fb.critere_fonctionnel] || '', statusLabels[fb.critere_design] || '',
        fb.note !== null && fb.note !== undefined ? fb.note : '', fb.statut_realisation || '',
        fb.comment || '', fb.verbatim || '', fb.suggestion || ''
      ]);
    });

    var wsAll = XLSX.utils.aoa_to_sheet(allRows);
    wsAll['!cols'] = [{ wch: 20 }, { wch: 25 }, { wch: 5 }, { wch: 35 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 6 }, { wch: 12 }, { wch: 40 }, { wch: 40 }, { wch: 40 }];
    XLSX.utils.book_append_sheet(wb, wsAll, 'Tous les feedbacks');

    // --- One sheet per tester ---
    testers.forEach(function(t) {
      var userFbs = feedbacksByUser[t.id] || [];
      if (userFbs.length === 0) return;
      var rows = [['Journey ID', 'Journey', 'Section', 'Navigation', 'Compréhension', 'Performance', 'Fonctionnel', 'Design', 'Note /5', 'Statut', 'Commentaire', 'Verbatim', 'Suggestion']];

      journeys.forEach(function(j) {
        var fb = userFbs.find(function(f) { return f.journey_id === j.id; });
        if (!fb) {
          rows.push([j.id, j.title, j.section === 'agriculteur' ? 'Agriculteur' : 'Conseiller', '', '', '', '', '', '', '', '', '', '']);
          return;
        }
        rows.push([
          j.id, j.title, j.section === 'agriculteur' ? 'Agriculteur' : 'Conseiller',
          statusLabels[fb.critere_navigation] || '', statusLabels[fb.critere_comprehension] || '', statusLabels[fb.critere_performance] || '',
          statusLabels[fb.critere_fonctionnel] || '', statusLabels[fb.critere_design] || '',
          fb.note !== null && fb.note !== undefined ? fb.note : '', fb.statut_realisation || '',
          fb.comment || '', fb.verbatim || '', fb.suggestion || ''
        ]);
      });

      var ws = XLSX.utils.aoa_to_sheet(rows);
      ws['!cols'] = [{ wch: 5 }, { wch: 35 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 6 }, { wch: 12 }, { wch: 40 }, { wch: 40 }, { wch: 40 }];
      var sheetName = (t.first_name + ' ' + t.last_name).substring(0, 31);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });

    // Download
    var now = new Date();
    var dateStr = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
    XLSX.writeFile(wb, 'TerraGrow-Testing-Export-' + dateStr + '.xlsx');
  });

  // Show
  document.getElementById('loading').classList.add('hidden');
  var pc = document.getElementById('page-content');
  pc.classList.remove('hidden');
  requestAnimationFrame(function() { pc.classList.add('visible'); });

  } catch (err) {
    console.error('[Admin]', err);
    console.error(err);
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('page-content').classList.remove('hidden');
    document.getElementById('page-content').classList.add('visible');
  }
})();
