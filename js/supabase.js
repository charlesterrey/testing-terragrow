// Supabase Client Init — credentials loaded from config.js (not committed)
// SUPABASE_URL and SUPABASE_ANON_KEY are defined in js/config.js

const _isSupabaseReady = SUPABASE_URL !== 'YOUR_SUPABASE_URL' && SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY';

// Create client — use "sbClient" to avoid collision with window.supabase (the SDK)
var sbClient;
if (_isSupabaseReady && window.supabase && window.supabase.createClient) {
  sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
  console.warn('[TerraGrow] Supabase non configure — mode preview actif');
  sbClient = {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      signInWithOtp: async () => ({ error: { message: 'Supabase non configure' } }),
      signOut: async () => {},
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: null }),
          maybeSingle: async () => ({ data: null, error: null }),
          order: async () => ({ data: [], error: null }),
        }),
        order: async () => ({ data: [], error: null }),
      }),
      upsert: async () => ({ error: null }),
      update: () => ({ eq: async () => ({ error: null }) }),
    }),
  };
}

// Alias — all other JS files use "supabase.xxx"
// We override window.supabase (the SDK) with our client since we no longer need the SDK
window.supabase = sbClient;
var supabase = sbClient;

// Auth helpers
async function getSession() {
  var result = await supabase.auth.getSession();
  return result.data.session;
}

async function getUser() {
  var result = await supabase.auth.getUser();
  return result.data.user;
}

async function getProfile(userId) {
  if (!_isSupabaseReady) return null;
  var result = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (result.error) console.error('Profile error:', result.error);
  return result.data;
}

function getInitials(firstName, lastName) {
  return (firstName ? firstName.charAt(0) : '').toUpperCase() + (lastName ? lastName.charAt(0) : '').toUpperCase();
}

function showToast(message, type, duration) {
  type = type || 'success';
  duration = duration || 3000;
  var toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'fixed bottom-6 right-6 z-50';
    document.body.appendChild(toast);
  }
  var bg = type === 'success' ? 'bg-lime-800' : type === 'error' ? 'bg-red-600' : 'bg-slate-800';
  toast.innerHTML = '<div class="flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium max-w-sm ' + bg + ' text-white"><span>' + message + '</span></div>';
  toast.classList.remove('hidden');
  setTimeout(function() { toast.classList.add('hidden'); }, duration);
}

async function requireAuth() {
  if (!_isSupabaseReady) return null;
  var session = await getSession();
  if (!session) {
    window.location.href = 'index.html';
    return null;
  }
  return session;
}

// Listen for sign out — only redirect on protected pages (not login/register/magic-link)
if (_isSupabaseReady && !window.location.search.includes('preview')) {
  var _sbCurrentPage = window.location.pathname.split('/').pop() || 'index.html';
  var publicPages = ['index.html', 'register.html', 'magic-link-sent.html', ''];
  if (publicPages.indexOf(_sbCurrentPage) === -1) {
    supabase.auth.onAuthStateChange(function(event) {
      if (event === 'SIGNED_OUT') {
        window.location.href = 'index.html';
      }
    });
  }
}
