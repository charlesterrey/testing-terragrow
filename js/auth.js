// Auth logic — pure ES5, no const/let, no async/await, no destructuring
var currentPage = window.location.pathname.split('/').pop() || 'index.html';
var baseUrl = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);

// Non-blocking: redirect if already logged in
if (currentPage === 'index.html' || currentPage === 'register.html') {
  getSession().then(function(s) { if (s) window.location.href = 'dashboard.html'; }).catch(function() {});
}

// --- LOGIN ---
if (currentPage === 'index.html') {
  var loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      var err = document.getElementById('login-error');
      var btn = document.getElementById('login-submit');
      var email = document.getElementById('email').value.trim();
      err.classList.add('hidden');
      if (!email) return;
      btn.disabled = true;
      btn.textContent = 'Envoi en cours...';

      supabase.auth.signInWithOtp({ email: email, options: { emailRedirectTo: baseUrl + 'dashboard.html' } })
        .then(function(r) {
          if (r.error) { err.textContent = r.error.message; err.classList.remove('hidden'); btn.disabled = false; btn.textContent = "Recevoir le lien d'accès"; }
          else { window.location.href = 'magic-link-sent.html?email=' + encodeURIComponent(email); }
        })
        .catch(function() { err.textContent = 'Erreur réseau. Réessayez.'; err.classList.remove('hidden'); btn.disabled = false; btn.textContent = "Recevoir le lien d'accès"; });
    });
  }
}

// --- REGISTER ---
if (currentPage === 'register.html') {
  var regForm = document.getElementById('register-form');
  if (regForm) {
    regForm.addEventListener('submit', function(e) {
      e.preventDefault();
      var err = document.getElementById('register-error');
      var btn = document.getElementById('register-submit');
      err.classList.add('hidden');
      var email = document.getElementById('email').value.trim();
      var firstName = document.getElementById('first_name').value.trim();
      var lastName = document.getElementById('last_name').value.trim();
      var phone = document.getElementById('phone').value.trim();
      var company = document.getElementById('company').value.trim();
      var jobTitle = document.getElementById('job_title').value.trim();
      if (!email || !firstName || !lastName) { err.textContent = 'Veuillez remplir le nom, le prénom et l\'email.'; err.classList.remove('hidden'); return; }
      btn.disabled = true;
      btn.textContent = 'Envoi en cours...';
      localStorage.setItem('pending_profile', JSON.stringify({ first_name: firstName, last_name: lastName, email: email, phone: phone || null, company: company || null, job_title: jobTitle || null }));

      supabase.auth.signInWithOtp({ email: email, options: { data: { first_name: firstName, last_name: lastName }, emailRedirectTo: baseUrl + 'dashboard.html' } })
        .then(function(r) {
          if (r.error) { err.textContent = r.error.message; err.classList.remove('hidden'); btn.disabled = false; btn.textContent = "Recevoir le lien d'accès"; localStorage.removeItem('pending_profile'); }
          else { window.location.href = 'magic-link-sent.html?email=' + encodeURIComponent(email) + '&register=true'; }
        })
        .catch(function() { err.textContent = 'Erreur réseau. Réessayez.'; err.classList.remove('hidden'); btn.disabled = false; btn.textContent = "Recevoir le lien d'accès"; localStorage.removeItem('pending_profile'); });
    });
  }
}

// --- MAGIC LINK SENT ---
if (currentPage === 'magic-link-sent.html') {
  var params = new URLSearchParams(window.location.search);
  var sentEmail = params.get('email') || '';
  var sentEmailEl = document.getElementById('sent-email');
  var resendBtn = document.getElementById('resend-btn');
  var resendMsg = document.getElementById('resend-msg');
  if (sentEmailEl) sentEmailEl.textContent = sentEmail;
  var cooldown = false;

  if (resendBtn) {
    resendBtn.addEventListener('click', function() {
      if (cooldown) return;
      resendBtn.disabled = true;
      resendMsg.classList.add('hidden');
      supabase.auth.signInWithOtp({ email: sentEmail, options: { emailRedirectTo: baseUrl + 'dashboard.html' } })
        .then(function(r) {
          if (r.error) { resendMsg.textContent = 'Erreur : ' + r.error.message; resendMsg.classList.remove('hidden'); resendBtn.disabled = false; }
          else {
            resendMsg.textContent = 'Lien renvoyé avec succès.'; resendMsg.classList.remove('hidden');
            cooldown = true; var rem = 60; resendBtn.textContent = 'Renvoyer (' + rem + 's)';
            var iv = setInterval(function() { rem--; resendBtn.textContent = 'Renvoyer (' + rem + 's)'; if (rem <= 0) { clearInterval(iv); cooldown = false; resendBtn.disabled = false; resendBtn.textContent = 'Renvoyer'; } }, 1000);
          }
        }).catch(function() { resendBtn.disabled = false; });
    });
  }

  supabase.auth.onAuthStateChange(function(ev, sess) {
    if (ev === 'SIGNED_IN' && sess) { handlePostSignIn(sess); window.location.href = 'dashboard.html'; }
  });
}

// --- Global: complete profile after sign-in ---
supabase.auth.onAuthStateChange(function(ev, sess) {
  if (ev === 'SIGNED_IN' && sess) handlePostSignIn(sess);
});

function handlePostSignIn(sess) {
  var pp = localStorage.getItem('pending_profile');
  if (!pp) return;
  try {
    var p = JSON.parse(pp);
    supabase.from('profiles').upsert({ id: sess.user.id, first_name: p.first_name, last_name: p.last_name, email: p.email, phone: p.phone, company: p.company, job_title: p.job_title }, { onConflict: 'id' });
  } catch (e) { console.error(e); }
  localStorage.removeItem('pending_profile');
}
