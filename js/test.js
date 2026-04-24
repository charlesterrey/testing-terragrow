// Test detail page — SPA navigation (sidebar stays, content swaps)
(async function () {
  try {

  var isSupabaseConfigured = typeof _isSupabaseReady !== 'undefined' && _isSupabaseReady;
  var isPreview = window.location.search.includes('preview');
  var user = null, profile = null;

  if (isSupabaseConfigured && !isPreview) {
    var session = await requireAuth();
    if (!session) return;
    user = session.user;
    profile = await getProfile(user.id);
    if (!profile) { window.location.href = 'register.html'; return; }
  } else {
    user = { id: 'preview-user' };
    profile = { first_name: 'Michael', last_name: 'Lachmann', job_title: 'Conseiller de gestion', company: 'CFG Alsace' };
  }

  document.getElementById('user-name').textContent = profile.first_name + ' ' + profile.last_name;
  document.getElementById('user-meta').textContent = [profile.job_title, profile.company].filter(Boolean).join(' - ');

  // Load journeys (once)
  var res = await fetch('data/journeys.json');
  var journeysData = await res.json();
  var allJourneys = journeysData.journeys;
  var previewParam = isPreview ? '&preview' : '';
  var criteriaFields = ['critere_navigation', 'critere_comprehension', 'critere_performance', 'critere_fonctionnel', 'critere_design'];

  // Load all feedbacks for sidebar (once, updated on save)
  var allFeedbacks = [];
  if (isSupabaseConfigured && !isPreview) {
    var fbAll = await supabase.from('feedbacks').select('journey_id,statut_realisation,note,critere_navigation,critere_comprehension,critere_performance,critere_fonctionnel,critere_design');
    allFeedbacks = (fbAll.data || []);
  } else {
    allFeedbacks = [
      { journey_id: 'A1', statut_realisation: 'termine', note: 4, critere_navigation: 'ok', critere_comprehension: 'ok', critere_performance: 'ok', critere_fonctionnel: 'a_ameliorer', critere_design: 'ok' },
      { journey_id: 'A2', statut_realisation: 'termine', note: 5, critere_navigation: 'ok', critere_comprehension: 'ok', critere_performance: 'ok', critere_fonctionnel: 'ok', critere_design: 'ok' },
      { journey_id: 'A3', statut_realisation: 'termine', note: 3, critere_navigation: 'ok', critere_comprehension: 'a_ameliorer', critere_performance: 'ok', critere_fonctionnel: null, critere_design: null },
      { journey_id: 'A4', statut_realisation: 'en_cours', note: null, critere_navigation: 'ok', critere_comprehension: null, critere_performance: null, critere_fonctionnel: null, critere_design: null },
      { journey_id: 'A5', statut_realisation: 'en_cours', note: 2, critere_navigation: 'a_ameliorer', critere_comprehension: 'bloquant', critere_performance: null, critere_fonctionnel: null, critere_design: null },
      { journey_id: 'C1', statut_realisation: 'termine', note: 4, critere_navigation: 'ok', critere_comprehension: 'ok', critere_performance: 'ok', critere_fonctionnel: 'ok', critere_design: 'ok' },
      { journey_id: 'C2', statut_realisation: 'termine', note: 5, critere_navigation: 'ok', critere_comprehension: 'ok', critere_performance: 'ok', critere_fonctionnel: 'ok', critere_design: 'ok' },
    ];
  }
  var fbMap = {};
  allFeedbacks.forEach(function(f) { fbMap[f.journey_id] = f; });

  // ========== SIDEBAR (built once, never destroyed) ==========
  var sidebarNav = document.getElementById('journey-list');

  function fbStatus(fb) {
    if (!fb) return 'todo';
    var hasNote = fb.note !== null && fb.note !== undefined;
    var allC = fb.critere_navigation && fb.critere_comprehension && fb.critere_performance && fb.critere_fonctionnel && fb.critere_design;
    if (hasNote && allC) return 'done';
    if (hasNote || fb.statut_realisation === 'en_cours' || fb.statut_realisation === 'termine') return 'partial';
    return 'todo';
  }

  function buildSidebar(activeId) {
    sidebarNav.innerHTML = '';
    var groups = { todo: [], partial: [], done: [] };
    allJourneys.forEach(function(j) { groups[fbStatus(fbMap[j.id])].push(j); });

    var groupDefs = [
      { key: 'todo', label: 'À faire', color: 'text-neutral-400' },
      { key: 'partial', label: 'En cours', color: 'text-tg-primary/60' },
      { key: 'done', label: 'Terminées', color: 'text-tg-success/60' },
    ];

    groupDefs.forEach(function(g) {
      var items = groups[g.key];
      if (items.length === 0) return;
      var header = document.createElement('div');
      header.className = 'px-4 pt-3 pb-1 text-[9px] font-semibold uppercase tracking-wider ' + g.color;
      header.textContent = g.label + ' (' + items.length + ')';
      sidebarNav.appendChild(header);

      items.forEach(function(j) {
        var isActive = j.id === activeId;
        var link = document.createElement('a');
        link.href = 'test.html?id=' + j.id + previewParam;
        link.dataset.journeyId = j.id;

        var iconHtml;
        if (g.key === 'done') iconHtml = '<svg class="w-3 h-3 text-tg-success" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" /></svg>';
        else if (g.key === 'partial') iconHtml = '<span class="w-2 h-2 rounded-full bg-tg-primary inline-block"></span>';
        else iconHtml = '<span class="w-2 h-2 rounded-full bg-red-400 inline-block"></span>';

        var textClass = g.key === 'done' ? 'text-tg-success' : 'text-neutral-600 hover:text-neutral-900';
        var idClass = g.key === 'done' ? 'text-tg-success/60' : 'text-neutral-400';

        link.className = 'sidebar-item flex items-center gap-2 px-4 py-1.5 text-xs transition-colors rounded-lg mx-2 '
          + (isActive ? 'active font-semibold text-neutral-950' : textClass);

        link.innerHTML = '<span class="sidebar-status-icon flex-shrink-0 w-3 flex items-center justify-center">' + iconHtml + '</span>'
          + '<span class="font-mono text-[10px] ' + idClass + ' w-5 flex-shrink-0">' + j.id + '</span>'
          + '<span class="truncate">' + j.title + '</span>';

        // SPA navigation — intercept click
        link.addEventListener('click', function(e) {
          e.preventDefault();
          navigateTo(j.id);
        });

        sidebarNav.appendChild(link);
      });
    });

    var activeItem = sidebarNav.querySelector('.active');
    if (activeItem) activeItem.scrollIntoView({ block: 'nearest' });
  }

  // ========== CURRENT JOURNEY STATE ==========
  var currentJourneyId = null;
  var autoSaveTimeout = null;
  var statusInput = document.getElementById('fb-status');
  var ratingInput = document.getElementById('fb-rating');

  // Note constants
  var noteColors = ['#d4d4d8', '#ef4444', '#f59e0b', '#a7a7ae', '#2563eb', '#1cc172'];
  var noteTexts = ['— /5', '1 /5 · Mauvais', '2 /5 · Insuffisant', '3 /5 · Correct', '4 /5 · Bien', '5 /5 · Excellent'];
  var fillColors = [
    'linear-gradient(90deg, rgba(212,212,216,0.2), rgba(212,212,216,0.3))',
    'linear-gradient(90deg, rgba(239,68,68,0.2), rgba(239,68,68,0.35))',
    'linear-gradient(90deg, rgba(245,158,11,0.2), rgba(245,158,11,0.35))',
    'linear-gradient(90deg, rgba(167,167,174,0.2), rgba(167,167,174,0.35))',
    'linear-gradient(90deg, rgba(37,99,235,0.15), rgba(37,99,235,0.3))',
    'linear-gradient(90deg, rgba(28,193,114,0.2), rgba(28,193,114,0.4))',
  ];

  function triggerAutoSave() {
    if (autoSaveTimeout) clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(function() { saveFeedback(true); }, 400);
  }

  function getCriteriaValue(fieldName) {
    var group = document.querySelector('[data-criteria="' + fieldName + '"]');
    if (!group) return null;
    var btns = group.querySelectorAll('.criteria-btn');
    for (var k = 0; k < btns.length; k++) {
      if (btns[k].className.includes('emerald')) return 'ok';
      if (btns[k].className.includes('amber-4')) return 'a_ameliorer';
      if (btns[k].className.includes('red-4')) return 'bloquant';
    }
    return null;
  }

  function computeStatus() {
    var hasNote = ratingInput.value !== '' && parseInt(ratingInput.value) > 0;
    var filledCriteria = 0;
    criteriaFields.forEach(function(f) { if (getCriteriaValue(f)) filledCriteria++; });
    var allCriteria = filledCriteria === 5;
    var anyCriteria = filledCriteria > 0;
    var hasText = (document.getElementById('fb-comment').value || '').trim() ||
                  (document.getElementById('fb-verbatim').value || '').trim() ||
                  (document.getElementById('fb-suggestion').value || '').trim();

    if (hasNote && allCriteria) statusInput.value = 'termine';
    else if (hasNote || anyCriteria || hasText) statusInput.value = 'en_cours';
    else statusInput.value = 'non_commence';
  }

  function setNote(val) {
    ratingInput.value = val > 0 ? val : '';
    var pct = (val / 5) * 100;
    var noteFill = document.getElementById('note-fill');
    var noteThumb = document.getElementById('note-thumb');
    var thumbInner = document.getElementById('note-thumb-inner');
    var thumbValue = document.getElementById('note-thumb-value');
    var noteDisplay = document.getElementById('note-display');

    noteFill.style.width = pct + '%';
    noteFill.style.background = fillColors[val];
    noteThumb.style.left = 'calc(' + pct + '% - 14px)';
    thumbInner.style.borderColor = val > 0 ? noteColors[val] : '#e5e5e5';
    thumbInner.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08), 0 0 0 1px ' + (val > 0 ? noteColors[val] + '20' : 'rgba(0,0,0,0.04)');
    thumbValue.textContent = val > 0 ? val : '—';
    thumbValue.style.color = val > 0 ? noteColors[val] : '#a7a7ae';
    noteDisplay.style.color = noteColors[val];
    noteDisplay.textContent = noteTexts[val];

    document.querySelectorAll('.note-label').forEach(function(l) {
      var n = parseInt(l.dataset.note);
      l.style.color = n === val ? noteColors[val] : '#a7a7ae';
      l.style.fontWeight = n === val ? '600' : '400';
    });

    computeStatus();
    triggerAutoSave();
  }

  function showSaveToast() {
    var toast = document.getElementById('save-success');
    toast.classList.remove('hidden');
    toast.style.opacity = '0';
    toast.style.transform = 'translate(-50%, 10px)';
    requestAnimationFrame(function() {
      toast.style.transition = 'opacity 200ms, transform 200ms';
      toast.style.opacity = '1';
      toast.style.transform = 'translate(-50%, 0)';
    });
    setTimeout(function() {
      toast.style.opacity = '0';
      toast.style.transform = 'translate(-50%, 10px)';
      setTimeout(function() { toast.classList.add('hidden'); }, 200);
    }, 2000);
  }

  async function saveFeedback(isAutoSave) {
    var saveBtn = document.getElementById('save-btn');
    if (!isAutoSave) { saveBtn.disabled = true; saveBtn.textContent = 'Sauvegarde...'; }

    var feedbackData = {
      user_id: user.id,
      journey_id: currentJourneyId,
      statut_realisation: statusInput.value || 'non_commence',
      comment: document.getElementById('fb-comment').value || null,
      note: ratingInput.value !== '' ? parseInt(ratingInput.value) : null,
      verbatim: document.getElementById('fb-verbatim').value || null,
      suggestion: document.getElementById('fb-suggestion').value || null,
    };
    criteriaFields.forEach(function(f) { feedbackData[f] = getCriteriaValue(f); });

    // Update local fbMap for sidebar
    fbMap[currentJourneyId] = feedbackData;

    if (!isSupabaseConfigured || isPreview) {
      if (!isAutoSave) { saveBtn.disabled = false; saveBtn.textContent = 'Sauvegarder'; showSaveToast(); }
      return;
    }

    var result = await supabase.from('feedbacks').upsert(feedbackData, { onConflict: 'user_id,journey_id' });
    if (result.error) {
      console.error('Save error:', result.error);
      if (!isAutoSave) { saveBtn.disabled = false; saveBtn.textContent = 'Sauvegarder'; }
      return;
    }
    if (!isAutoSave) { saveBtn.disabled = false; saveBtn.textContent = 'Sauvegarder'; showSaveToast(); }
  }

  // ========== LOAD JOURNEY (swaps content, keeps sidebar) ==========
  async function loadJourney(id) {
    var journey = allJourneys.find(function(j) { return j.id === id; });
    if (!journey) return;

    currentJourneyId = id;
    if (autoSaveTimeout) clearTimeout(autoSaveTimeout);

    // Fade out content
    var area = document.getElementById('content-area');
    area.classList.remove('loaded');

    // Update URL without reload
    var newUrl = 'test.html?id=' + id + previewParam;
    history.pushState({ journeyId: id }, '', newUrl);

    // Update top bar
    var isAgri = journey.section === 'agriculteur';
    var badge = document.getElementById('test-section-badge');
    badge.innerHTML = '<span class="w-1.5 h-1.5 rounded-full ' + (isAgri ? 'bg-emerald-400' : 'bg-blue-400') + '"></span>' + (isAgri ? 'Agriculteur' : 'Conseiller');
    badge.className = 'inline-flex items-center gap-1.5 text-xs text-neutral-500';
    document.getElementById('test-id').textContent = journey.id;
    document.title = 'TerraGrow — ' + journey.id + ' ' + journey.title;

    // Update content
    document.getElementById('test-title').textContent = journey.title;
    document.getElementById('test-userstory').textContent = journey.userStory;
    document.getElementById('test-screens').textContent = journey.screens;
    document.getElementById('test-objectif').textContent = journey.objectif;

    // Rebuild criteria
    var criteriaContainer = document.getElementById('criteria-container');
    criteriaContainer.innerHTML = '';
    var resetBtn = 'criteria-btn px-3 py-1.5 rounded-lg text-xs font-medium border border-neutral-200 bg-white text-neutral-500 transition-all';

    journey.criteria.forEach(function(label, i) {
      var fieldName = criteriaFields[i];
      var div = document.createElement('div');
      div.className = 'flex items-center gap-3';
      div.innerHTML =
        '<span class="text-sm text-neutral-800 flex-1 leading-snug">' + label + '</span>'
        + '<div class="flex gap-1.5 flex-shrink-0" data-criteria="' + fieldName + '">'
        + '<button type="button" data-value="ok" class="' + resetBtn + '">OK</button>'
        + '<button type="button" data-value="a_ameliorer" class="' + resetBtn + '">À améliorer</button>'
        + '<button type="button" data-value="bloquant" class="' + resetBtn + '">Bloquant</button>'
        + '</div>';

      div.querySelectorAll('.criteria-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var group = btn.closest('[data-criteria]');
          group.querySelectorAll('.criteria-btn').forEach(function(b) { b.className = resetBtn; });
          var v = btn.dataset.value;
          if (v === 'ok') btn.className = 'criteria-btn px-3 py-1.5 rounded-lg text-xs font-semibold border border-emerald-400 bg-emerald-50 text-emerald-700';
          else if (v === 'a_ameliorer') btn.className = 'criteria-btn px-3 py-1.5 rounded-lg text-xs font-semibold border border-amber-400 bg-amber-50 text-amber-700';
          else if (v === 'bloquant') btn.className = 'criteria-btn px-3 py-1.5 rounded-lg text-xs font-semibold border border-red-400 bg-red-50 text-red-700';
          computeStatus();
          triggerAutoSave();
        });
      });
      criteriaContainer.appendChild(div);
    });

    // Reset form
    document.getElementById('fb-comment').value = '';
    document.getElementById('fb-verbatim').value = '';
    document.getElementById('fb-suggestion').value = '';
    setNote(0);

    // Load feedback for this journey
    var existingFeedback = null;
    if (isSupabaseConfigured && !isPreview) {
      var fbResult = await supabase.from('feedbacks').select('*').eq('journey_id', id).maybeSingle();
      if (!fbResult.error) existingFeedback = fbResult.data;
    } else if (fbMap[id] && fbMap[id].note !== undefined) {
      existingFeedback = fbMap[id];
    }

    if (existingFeedback) {
      criteriaFields.forEach(function(f) {
        if (existingFeedback[f]) {
          var group = document.querySelector('[data-criteria="' + f + '"]');
          if (group) {
            var btn = group.querySelector('[data-value="' + existingFeedback[f] + '"]');
            if (btn) btn.click();
          }
        }
      });
      document.getElementById('fb-comment').value = existingFeedback.comment || '';
      if (existingFeedback.note !== null && existingFeedback.note !== undefined) setNote(existingFeedback.note);
      document.getElementById('fb-verbatim').value = existingFeedback.verbatim || '';
      document.getElementById('fb-suggestion').value = existingFeedback.suggestion || '';
    }

    computeStatus();

    // Update prev/next
    var currentIdx = allJourneys.findIndex(function(j) { return j.id === id; });
    var prevJ = currentIdx > 0 ? allJourneys[currentIdx - 1] : null;
    var nextJ = currentIdx < allJourneys.length - 1 ? allJourneys[currentIdx + 1] : null;
    var nav = document.getElementById('journey-nav');
    if (nav) {
      nav.innerHTML =
        (prevJ ? '<a href="#" data-nav="' + prevJ.id + '" class="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/></svg>' + prevJ.id + ' ' + prevJ.title + '</a>' : '<span></span>')
        + '<span class="text-xs text-neutral-400">' + (currentIdx + 1) + ' / ' + allJourneys.length + '</span>'
        + (nextJ ? '<a href="#" data-nav="' + nextJ.id + '" class="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 transition-colors">' + nextJ.id + ' ' + nextJ.title + '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg></a>' : '<span></span>');

      nav.querySelectorAll('[data-nav]').forEach(function(a) {
        a.addEventListener('click', function(e) { e.preventDefault(); navigateTo(a.dataset.nav); });
      });
    }

    // Rebuild sidebar to update active state + statuses
    buildSidebar(id);

    // Fade in
    requestAnimationFrame(function() {
      area.classList.add('loaded');
    });
  }

  function navigateTo(id) {
    // Save current before switching
    if (currentJourneyId) {
      computeStatus();
      saveFeedback(true);
    }
    loadJourney(id);
  }

  // Handle browser back/forward
  window.addEventListener('popstate', function(e) {
    if (e.state && e.state.journeyId) {
      loadJourney(e.state.journeyId);
    }
  });

  // ========== INIT ==========
  var initId = new URLSearchParams(window.location.search).get('id');
  if (!initId) { window.location.href = 'dashboard.html'; return; }

  // Note slider drag (once, delegates to setNote)
  var trackWrapper = document.getElementById('note-track-wrapper');
  var isDragging = false;
  function noteFromX(clientX) {
    var rect = trackWrapper.getBoundingClientRect();
    return Math.round(Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)) * 5);
  }
  trackWrapper.addEventListener('mousedown', function(e) { isDragging = true; setNote(noteFromX(e.clientX)); });
  document.addEventListener('mousemove', function(e) { if (isDragging) setNote(noteFromX(e.clientX)); });
  document.addEventListener('mouseup', function() { isDragging = false; });
  trackWrapper.addEventListener('touchstart', function(e) { isDragging = true; setNote(noteFromX(e.touches[0].clientX)); }, { passive: true });
  document.addEventListener('touchmove', function(e) { if (isDragging) setNote(noteFromX(e.touches[0].clientX)); }, { passive: true });
  document.addEventListener('touchend', function() { isDragging = false; });

  // Note label clicks (once)
  document.querySelectorAll('[data-note]').forEach(function(el) {
    el.addEventListener('click', function() { setNote(parseInt(el.dataset.note)); });
  });

  // Text field listeners (once)
  document.getElementById('fb-comment').addEventListener('input', function() { computeStatus(); triggerAutoSave(); });
  document.getElementById('fb-verbatim').addEventListener('input', function() { computeStatus(); triggerAutoSave(); });
  document.getElementById('fb-suggestion').addEventListener('input', function() { computeStatus(); triggerAutoSave(); });

  // Save button (once)
  document.getElementById('save-btn').addEventListener('click', function() {
    if (autoSaveTimeout) clearTimeout(autoSaveTimeout);
    saveFeedback(false);
  });
  document.getElementById('feedback-form').addEventListener('submit', function(e) { e.preventDefault(); saveFeedback(false); });

  // Load first journey
  await loadJourney(initId);
  history.replaceState({ journeyId: initId }, '', window.location.href);

  } catch (err) {
    console.error('[Test page]', err);
  }
})();
