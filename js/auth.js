// Auth logic — uses Edge Function + Resend for magic links
var currentPage = window.location.pathname.split('/').pop() || 'index.html';
var baseUrl = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);
var magicLinkUrl = SUPABASE_URL + '/functions/v1/send-magic-link';

function sendMagicLink(email) {
  return fetch(magicLinkUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email, redirectTo: baseUrl + 'dashboard.html' }),
  }).then(function(r) { return r.json(); });
}

// Handle magic link callback — parse token from URL hash/query
if (window.location.hash && window.location.hash.includes('access_token')) {
  // Supabase puts tokens in the hash fragment after magic link redirect
  // Wait for SDK to process, save profile, then redirect
  setTimeout(function() {
    getSession().then(function(s) {
      if (s) {
        return handlePostSignIn(s).then(function() {
          window.location.href = 'dashboard.html';
        });
      }
    });
  }, 500);
}

// Non-blocking: redirect if already logged in (but not if completing profile)
var isCompleting = currentPage === 'register.html' && window.location.search.includes('complete=1');
if ((currentPage === 'index.html' || currentPage === 'register.html') && !isCompleting) {
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

      sendMagicLink(email).then(function(r) {
        if (r.error) { err.textContent = r.error; err.classList.remove('hidden'); btn.disabled = false; btn.textContent = "Recevoir le lien d'accès"; }
        else { window.location.href = 'magic-link-sent.html?email=' + encodeURIComponent(email); }
      }).catch(function() { err.textContent = 'Erreur réseau. Réessayez.'; err.classList.remove('hidden'); btn.disabled = false; btn.textContent = "Recevoir le lien d'accès"; });
    });
  }
}

// --- REGISTER ---
if (currentPage === 'register.html') {
  var regForm = document.getElementById('register-form');
  if (regForm) {
    // If completing profile (already logged in), pre-fill email and hide it
    if (isCompleting) {
      getSession().then(function(s) {
        if (s && s.user) {
          var emailInput = document.getElementById('email');
          emailInput.value = s.user.email;
          emailInput.readOnly = true;
          emailInput.style.opacity = '0.6';
          var submitBtn = document.getElementById('register-submit');
          if (submitBtn) submitBtn.textContent = 'Enregistrer mon profil';
          // Hide the "already registered" link
          var secondaryLink = regForm.querySelector('a[href="index.html"]');
          if (secondaryLink && secondaryLink.parentElement) {
            secondaryLink.parentElement.style.display = 'none';
            // Also hide the separator above it
            var sep = secondaryLink.parentElement.previousElementSibling;
            if (sep) sep.style.display = 'none';
          }
        }
      });
    }

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

      // If already logged in (completing profile), save directly
      if (isCompleting) {
        btn.textContent = 'Enregistrement...';
        getSession().then(function(s) {
          if (!s) { window.location.href = 'index.html'; return; }
          return supabase.from('profiles').upsert({
            id: s.user.id,
            first_name: firstName,
            last_name: lastName,
            email: email,
            phone: phone || null,
            company: company || null,
            job_title: jobTitle || null
          }, { onConflict: 'id' }).then(function(res) {
            if (res.error) {
              err.textContent = 'Erreur : ' + res.error.message;
              err.classList.remove('hidden');
              btn.disabled = false;
              btn.textContent = 'Enregistrer mon profil';
            } else {
              window.location.href = 'dashboard.html';
            }
          });
        }).catch(function() {
          err.textContent = 'Erreur réseau. Réessayez.';
          err.classList.remove('hidden');
          btn.disabled = false;
          btn.textContent = 'Enregistrer mon profil';
        });
        return;
      }

      // Normal registration flow (not yet logged in)
      btn.textContent = 'Envoi en cours...';
      localStorage.setItem('pending_profile', JSON.stringify({ first_name: firstName, last_name: lastName, email: email, phone: phone || null, company: company || null, job_title: jobTitle || null }));

      sendMagicLink(email).then(function(r) {
        if (r.error) { err.textContent = r.error; err.classList.remove('hidden'); btn.disabled = false; btn.textContent = "Recevoir le lien d'accès"; localStorage.removeItem('pending_profile'); }
        else { window.location.href = 'magic-link-sent.html?email=' + encodeURIComponent(email) + '&register=true'; }
      }).catch(function() { err.textContent = 'Erreur réseau. Réessayez.'; err.classList.remove('hidden'); btn.disabled = false; btn.textContent = "Recevoir le lien d'accès"; localStorage.removeItem('pending_profile'); });
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
      sendMagicLink(sentEmail).then(function(r) {
        if (r.error) { resendMsg.textContent = 'Erreur : ' + r.error; resendMsg.classList.remove('hidden'); resendBtn.disabled = false; }
        else {
          resendMsg.textContent = 'Lien renvoyé avec succès.'; resendMsg.classList.remove('hidden');
          cooldown = true; var rem = 60; resendBtn.textContent = 'Renvoyer (' + rem + 's)';
          var iv = setInterval(function() { rem--; resendBtn.textContent = 'Renvoyer (' + rem + 's)'; if (rem <= 0) { clearInterval(iv); cooldown = false; resendBtn.disabled = false; resendBtn.textContent = 'Renvoyer'; } }, 1000);
        }
      }).catch(function() { resendBtn.disabled = false; });
    });
  }

  supabase.auth.onAuthStateChange(function(ev, sess) {
    if (ev === 'SIGNED_IN' && sess) {
      handlePostSignIn(sess).then(function() {
        window.location.href = 'dashboard.html';
      });
    }
  });
}

// --- Global: complete profile after sign-in ---
supabase.auth.onAuthStateChange(function(ev, sess) {
  if (ev === 'SIGNED_IN' && sess) handlePostSignIn(sess);
});

function handlePostSignIn(sess) {
  var pp = localStorage.getItem('pending_profile');
  if (!pp) return Promise.resolve();
  try {
    var p = JSON.parse(pp);
    return supabase.from('profiles').upsert({
      id: sess.user.id,
      first_name: p.first_name,
      last_name: p.last_name,
      email: p.email,
      phone: p.phone,
      company: p.company,
      job_title: p.job_title
    }, { onConflict: 'id' }).then(function(res) {
      if (res.error) console.error('Profile upsert error:', res.error);
      localStorage.removeItem('pending_profile');
    });
  } catch (e) {
    console.error(e);
    localStorage.removeItem('pending_profile');
    return Promise.resolve();
  }
}
