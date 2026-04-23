// Auth logic for login, register, magic-link-sent pages
// Executes immediately — no async top-level to avoid blocking form listeners

const currentPage = window.location.pathname.split('/').pop() || 'index.html';

// Non-blocking: redirect if already logged in
if (currentPage === 'index.html' || currentPage === 'register.html') {
  getSession().then(session => {
    if (session) window.location.href = 'dashboard.html';
  }).catch(() => {});
}

// --- LOGIN PAGE ---
if (currentPage === 'index.html') {
  const form = document.getElementById('login-form');
  if (form) {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      const errorEl = document.getElementById('login-error');
      const submitBtn = document.getElementById('login-submit');
      errorEl.classList.add('hidden');

      const email = document.getElementById('email').value.trim();
      if (!email) return;

      submitBtn.disabled = true;
      submitBtn.textContent = 'Envoi en cours...';

      try {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: window.location.origin + '/dashboard.html' },
        });

        if (error) {
          errorEl.textContent = error.message || "Erreur lors de l'envoi.";
          errorEl.classList.remove('hidden');
          submitBtn.disabled = false;
          submitBtn.textContent = "Recevoir le lien d'accès";
        } else {
          window.location.href = 'magic-link-sent.html?email=' + encodeURIComponent(email);
        }
      } catch (err) {
        errorEl.textContent = 'Erreur réseau. Réessayez.';
        errorEl.classList.remove('hidden');
        submitBtn.disabled = false;
        submitBtn.textContent = "Recevoir le lien d'accès";
      }
    });
  }
}

// --- REGISTER PAGE ---
if (currentPage === 'register.html') {
  const form = document.getElementById('register-form');
  if (form) {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      const errorEl = document.getElementById('register-error');
      const submitBtn = document.getElementById('register-submit');
      errorEl.classList.add('hidden');

      const email = document.getElementById('email').value.trim();
      const firstName = document.getElementById('first_name').value.trim();
      const lastName = document.getElementById('last_name').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const company = document.getElementById('company').value.trim();
      const jobTitle = document.getElementById('job_title').value.trim();

      if (!email || !firstName || !lastName) {
        errorEl.textContent = 'Veuillez remplir le nom, le prénom et l\'email.';
        errorEl.classList.remove('hidden');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Envoi en cours...';

      localStorage.setItem('pending_profile', JSON.stringify({
        first_name: firstName, last_name: lastName, email,
        phone: phone || null, company: company || null, job_title: jobTitle || null,
      }));

      try {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            data: { first_name: firstName, last_name: lastName },
            emailRedirectTo: window.location.origin + '/dashboard.html',
          },
        });

        if (error) {
          errorEl.textContent = error.message || "Erreur lors de l'inscription.";
          errorEl.classList.remove('hidden');
          submitBtn.disabled = false;
          submitBtn.textContent = "Recevoir le lien d'accès";
          localStorage.removeItem('pending_profile');
        } else {
          window.location.href = 'magic-link-sent.html?email=' + encodeURIComponent(email) + '&register=true';
        }
      } catch (err) {
        errorEl.textContent = 'Erreur réseau. Réessayez.';
        errorEl.classList.remove('hidden');
        submitBtn.disabled = false;
        submitBtn.textContent = "Recevoir le lien d'accès";
        localStorage.removeItem('pending_profile');
      }
    });
  }
}

// --- MAGIC LINK SENT PAGE ---
if (currentPage === 'magic-link-sent.html') {
  const params = new URLSearchParams(window.location.search);
  const email = params.get('email') || '';
  const sentEmailEl = document.getElementById('sent-email');
  const resendBtn = document.getElementById('resend-btn');
  const resendMsg = document.getElementById('resend-msg');

  if (sentEmailEl) sentEmailEl.textContent = email;

  let cooldown = false;

  if (resendBtn) {
    resendBtn.addEventListener('click', async function() {
      if (cooldown) return;
      resendBtn.disabled = true;
      resendMsg.classList.add('hidden');

      try {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: window.location.origin + '/dashboard.html' },
        });

        if (error) {
          resendMsg.textContent = 'Erreur : ' + (error.message || 'impossible de renvoyer.');
          resendMsg.classList.remove('hidden', 'text-tg-success');
          resendMsg.classList.add('text-red-400');
          resendBtn.disabled = false;
        } else {
          resendMsg.textContent = 'Lien renvoyé avec succès.';
          resendMsg.classList.remove('hidden', 'text-red-400');
          resendMsg.classList.add('text-tg-success');
          cooldown = true;
          let remaining = 60;
          resendBtn.textContent = 'Renvoyer (' + remaining + 's)';
          const interval = setInterval(function() {
            remaining--;
            resendBtn.textContent = 'Renvoyer (' + remaining + 's)';
            if (remaining <= 0) {
              clearInterval(interval);
              cooldown = false;
              resendBtn.disabled = false;
              resendBtn.textContent = 'Renvoyer';
            }
          }, 1000);
        }
      } catch (err) {
        resendBtn.disabled = false;
      }
    });
  }

  // Auto-redirect when magic link is clicked in another tab
  supabase.auth.onAuthStateChange(async function(event, session) {
    if (event === 'SIGNED_IN' && session) {
      await handlePostSignIn(session);
      window.location.href = 'dashboard.html';
    }
  });
}

// --- Global: complete profile after magic link sign-in ---
supabase.auth.onAuthStateChange(async function(event, session) {
  if (event === 'SIGNED_IN' && session) {
    await handlePostSignIn(session);
  }
});

async function handlePostSignIn(session) {
  const pendingProfile = localStorage.getItem('pending_profile');
  if (!pendingProfile) return;

  try {
    const profile = JSON.parse(pendingProfile);
    await supabase.from('profiles').upsert({
      id: session.user.id,
      first_name: profile.first_name,
      last_name: profile.last_name,
      email: profile.email,
      phone: profile.phone,
      company: profile.company,
      job_title: profile.job_title,
    }, { onConflict: 'id' });
  } catch (e) {
    console.error('Profile upsert error:', e);
  } finally {
    localStorage.removeItem('pending_profile');
  }
}
