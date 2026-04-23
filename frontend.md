# Frontend Specification -- TerraGrow UAT Testing Platform

> **Version** : 1.0
> **Date** : 23 avril 2026
> **Auteur** : Lead Front-end Designer/Developer
> **Stack** : HTML + Tailwind CSS (CDN) + JavaScript vanilla + Supabase JS SDK
> **Design System** : Marcassin DS (voir `/design-system/design-system.md`)
> **Document de reference** : `/claude.md`

Ce document est la specification technique exhaustive du front-end. Claude Code doit pouvoir implementer l'integralite de l'application sans poser aucune question.

---

## Table des matieres

1. [Architecture des pages](#1-architecture-des-pages)
2. [User Journeys (flows utilisateur)](#2-user-journeys-flows-utilisateur)
3. [Fichier journeys.json](#3-fichier-journeysjson)
4. [Specification des composants](#4-specification-des-composants)
5. [Design des emails Supabase](#5-design-des-emails-supabase)
6. [Structure JavaScript](#6-structure-javascript)

---

## 1. Architecture des pages

### 1.0 Configuration globale Tailwind

Toutes les pages incluent le CDN Tailwind et une configuration custom dans `<head>` :

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TerraGrow Testing</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            'tg-dark': '#021130',
            'tg-dark-light': '#0a1f4a',
            'tg-primary': '#2563eb',
            'tg-primary-hover': '#1d4ed8',
            'tg-success': '#84cc16',
            'tg-warning': '#f59e0b',
            'tg-danger': '#ef4444',
            'tg-info': '#14b8a6',
            'backgroundPrimary': '#ffffff',
            'backgroundSecondary': '#f8fafc',
            'backgroundTertiary': '#f1f5f9',
            'backgroundHover': '#e2e8f0',
            'backgroundRed': '#fef2f2',
            'backgroundAmber': '#fffbeb',
            'backgroundLime': '#f7fee7',
            'backgroundTeal': '#f0fdfa',
            'backgroundBlue': '#eff6ff',
            'backgroundZinc': '#f4f4f5',
          },
          fontFamily: {
            'sans': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
          }
        }
      }
    }
  </script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    /* Custom scrollbar */
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 3px; }
    ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

    /* Transitions globales */
    .transition-base { transition: all 150ms ease-in-out; }

    /* Spinner animation */
    @keyframes spin { to { transform: rotate(360deg); } }
    .animate-spin { animation: spin 1s linear infinite; }
  </style>
</head>
```

Supabase SDK inclus avant `</body>` dans toutes les pages :

```html
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <script src="js/supabase.js"></script>
  <!-- script specifique a la page -->
</body>
</html>
```

---

### 1.1 index.html -- Page de Login

**URL** : `/index.html`
**Fond** : `bg-[#021130]` (plein ecran)
**Layout** : Centrage vertical et horizontal, single column

#### Structure HTML

```html
<body class="min-h-screen bg-[#021130] flex items-center justify-center px-4">
  <div class="w-full max-w-md">

    <!-- Bloc formulaire -->
    <div class="bg-[#021130] w-full">

      <!-- Titre -->
      <h1 class="text-white text-3xl font-bold text-center mb-2">
        Accedez a votre espace de test
      </h1>
      <p class="text-slate-400 text-center text-sm mb-8">
        Entrez votre email pour recevoir votre lien d'acces
      </p>

      <!-- Formulaire -->
      <form id="login-form" class="space-y-6">
        <!-- Champ Email -->
        <div>
          <label for="email" class="block text-sm font-medium text-slate-300 mb-1.5">
            Email professionnel
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            placeholder="prenom.nom@cfg-alsace.fr"
            class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-tg-primary focus:border-transparent text-sm"
          >
        </div>

        <!-- Message d'erreur (cache par defaut) -->
        <div id="login-error" class="hidden text-red-400 text-sm text-center"></div>

        <!-- Bouton submit -->
        <button
          type="submit"
          id="login-submit"
          class="w-full py-3 px-4 bg-tg-primary hover:bg-tg-primary-hover text-white font-semibold rounded-lg shadow-md transition-base focus:outline-none focus:ring-2 focus:ring-tg-primary focus:ring-offset-2 focus:ring-offset-[#021130] disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          Recevoir le Lien d'acces
        </button>
      </form>

      <!-- Lien inscription -->
      <p class="mt-6 text-center text-sm text-slate-400">
        Premiere visite ?
        <a href="register.html" class="text-tg-primary hover:text-blue-400 font-medium underline">
          Inscrivez-vous
        </a>
      </p>
    </div>

    <!-- Logo TerraGrow en bas -->
    <div class="mt-16 flex justify-center">
      <img src="assets/logo.svg" alt="TerraGrow" class="h-12 w-12 opacity-60">
    </div>
  </div>
</body>
```

#### Composants Marcassin utilises
- Button Primary (taille L, full-width)
- Label/Base pour le label du champ
- Input text avec etats Default / Focus / Error

#### Logique JS associee
- Fichier : `js/auth.js`
- Au submit : `supabase.auth.signInWithOtp({ email })`
- Succes : redirect vers `magic-link-sent.html?email=xxx`
- Erreur : afficher le message dans `#login-error`
- Si session deja active : redirect vers `dashboard.html`

---

### 1.2 register.html -- Page d'inscription

**URL** : `/register.html`
**Fond** : `bg-[#021130]` (plein ecran)
**Layout** : Centrage vertical et horizontal, single column

#### Structure HTML

```html
<body class="min-h-screen bg-[#021130] flex items-center justify-center px-4 py-12">
  <div class="w-full max-w-md">

    <!-- Titre -->
    <h1 class="text-white text-3xl font-bold text-center mb-2">
      Rejoindre le testing
    </h1>
    <p class="text-slate-400 text-center text-sm mb-8">
      Creez votre profil testeur pour acceder a la plateforme
    </p>

    <!-- Formulaire -->
    <form id="register-form" class="space-y-4">

      <!-- Nom + Prenom sur 2 colonnes -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label for="last_name" class="block text-sm font-medium text-slate-300 mb-1.5">Nom</label>
          <input type="text" id="last_name" name="last_name" required placeholder="Dupont"
            class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-tg-primary focus:border-transparent text-sm">
        </div>
        <div>
          <label for="first_name" class="block text-sm font-medium text-slate-300 mb-1.5">Prenom</label>
          <input type="text" id="first_name" name="first_name" required placeholder="Jean"
            class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-tg-primary focus:border-transparent text-sm">
        </div>
      </div>

      <!-- Email -->
      <div>
        <label for="email" class="block text-sm font-medium text-slate-300 mb-1.5">Email professionnel</label>
        <input type="email" id="email" name="email" required placeholder="prenom.nom@cfg-alsace.fr"
          class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-tg-primary focus:border-transparent text-sm">
      </div>

      <!-- Telephone -->
      <div>
        <label for="phone" class="block text-sm font-medium text-slate-300 mb-1.5">Telephone</label>
        <input type="tel" id="phone" name="phone" placeholder="06 12 34 56 78"
          class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-tg-primary focus:border-transparent text-sm">
      </div>

      <!-- Entreprise -->
      <div>
        <label for="company" class="block text-sm font-medium text-slate-300 mb-1.5">Entreprise</label>
        <input type="text" id="company" name="company" required placeholder="CFG Alsace"
          class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-tg-primary focus:border-transparent text-sm">
      </div>

      <!-- Poste -->
      <div>
        <label for="role" class="block text-sm font-medium text-slate-300 mb-1.5">Poste</label>
        <input type="text" id="role" name="role" required placeholder="Conseiller de gestion"
          class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-tg-primary focus:border-transparent text-sm">
      </div>

      <!-- Message d'erreur -->
      <div id="register-error" class="hidden text-red-400 text-sm text-center"></div>

      <!-- Bouton submit -->
      <button type="submit" id="register-submit"
        class="w-full py-3 px-4 bg-tg-primary hover:bg-tg-primary-hover text-white font-semibold rounded-lg shadow-md transition-base focus:outline-none focus:ring-2 focus:ring-tg-primary focus:ring-offset-2 focus:ring-offset-[#021130] disabled:opacity-50 disabled:cursor-not-allowed text-sm mt-2">
        Recevoir le Lien d'acces
      </button>
    </form>

    <!-- Lien login -->
    <p class="mt-6 text-center text-sm text-slate-400">
      Deja inscrit ?
      <a href="index.html" class="text-tg-primary hover:text-blue-400 font-medium underline">Connectez-vous</a>
    </p>

    <!-- Logo -->
    <div class="mt-12 flex justify-center">
      <img src="assets/logo.svg" alt="TerraGrow" class="h-12 w-12 opacity-60">
    </div>
  </div>
</body>
```

#### Composants Marcassin utilises
- Button Primary (taille L, full-width)
- Label/Base pour chaque label
- Input text x6 avec etats Default / Focus / Error
- Grid 2 colonnes pour Nom/Prenom

#### Logique JS associee
- Fichier : `js/auth.js`
- Au submit :
  1. `supabase.auth.signInWithOtp({ email })` pour creer le compte + envoyer le magic link
  2. `supabase.from('profiles').upsert({ id: user.id, first_name, last_name, email, phone, company, role })`
  3. Stocker les donnees de profil dans `localStorage` pour le upsert apres confirmation
- Redirect vers `magic-link-sent.html?email=xxx&register=true`
- Gestion erreur : email deja pris, champs obligatoires vides

---

### 1.3 magic-link-sent.html -- Confirmation d'envoi

**URL** : `/magic-link-sent.html?email=xxx`
**Fond** : `bg-backgroundPrimary` (blanc/clair)
**Layout** : Centrage vertical et horizontal

#### Structure HTML

```html
<body class="min-h-screen bg-white flex items-center justify-center px-4">
  <div class="w-full max-w-md text-center">

    <!-- Spinner -->
    <div class="mb-8 flex justify-center">
      <div class="w-16 h-16 border-4 border-slate-200 border-t-tg-primary rounded-full animate-spin"></div>
    </div>

    <!-- Titre -->
    <h1 class="text-2xl font-bold text-slate-900 mb-3">
      Lien d'Acces Envoye
    </h1>

    <!-- Texte explicatif -->
    <p class="text-slate-600 text-sm mb-2">
      Un email contenant votre lien d'acces a ete envoye a :
    </p>
    <p id="sent-email" class="text-tg-primary font-semibold text-base mb-6">
      <!-- rempli dynamiquement -->
    </p>
    <p class="text-slate-500 text-sm mb-8">
      Cliquez sur le lien dans l'email pour acceder a votre espace de test.
      Verifiez vos spams si vous ne le trouvez pas.
    </p>

    <!-- Bouton renvoyer -->
    <button id="resend-btn"
      class="text-tg-primary hover:text-tg-primary-hover font-medium text-sm underline transition-base disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed">
      Renvoyer le lien
    </button>

    <!-- Message de confirmation renvoi -->
    <p id="resend-msg" class="hidden text-tg-success text-sm mt-3">
      Lien renvoye avec succes.
    </p>

    <!-- Retour login -->
    <p class="mt-8 text-sm text-slate-400">
      <a href="index.html" class="text-slate-500 hover:text-slate-700 underline">Retour a la connexion</a>
    </p>
  </div>
</body>
```

#### Composants Marcassin utilises
- Heading/Medium pour le titre
- Label/Base pour les textes
- Bouton Ghost (lien "Renvoyer")
- Spinner custom (border animation)

#### Logique JS associee
- Fichier : `js/auth.js`
- Recuperer `email` depuis les query params
- Bouton "Renvoyer" : re-appeler `supabase.auth.signInWithOtp({ email })`
- Cooldown de 60 secondes apres renvoi (disabled + compteur)
- Ecouter `supabase.auth.onAuthStateChange` : si SIGNED_IN, redirect vers `dashboard.html`

---

### 1.4 dashboard.html -- Dashboard testeur

**URL** : `/dashboard.html`
**Fond** : `bg-backgroundSecondary` (#f8fafc)
**Layout** : Full-width, sections empilees verticalement

**Acces** : Protege -- redirect vers `index.html` si pas de session active.

#### Structure HTML

```html
<body class="min-h-screen bg-slate-50">

  <!-- ========== HEADER ========== -->
  <header class="bg-white border-b border-slate-200 px-6 py-4">
    <div class="max-w-7xl mx-auto flex items-center justify-between">

      <!-- Logo + Titre app -->
      <div class="flex items-center gap-3">
        <img src="assets/logo.svg" alt="TerraGrow" class="h-8 w-8">
        <span class="text-lg font-bold text-slate-900">TerraGrow Testing</span>
      </div>

      <!-- Profil utilisateur -->
      <div class="flex items-center gap-3">
        <!-- Avatar initiales -->
        <div id="user-avatar" class="w-10 h-10 rounded-full bg-tg-primary flex items-center justify-center text-white font-semibold text-sm">
          <!-- JS : initiales ex "ML" -->
        </div>
        <div class="text-right">
          <p id="user-name" class="text-sm font-semibold text-slate-900"><!-- JS --></p>
          <p id="user-meta" class="text-xs text-slate-500"><!-- JS : "Poste - Entreprise" --></p>
        </div>
        <!-- Bouton deconnexion -->
        <button id="logout-btn" class="ml-4 p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-base" title="Se deconnecter">
          <!-- Heroicon: arrow-right-on-rectangle (24px) -->
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
          </svg>
        </button>
      </div>
    </div>
  </header>

  <!-- ========== MAIN CONTENT ========== -->
  <main class="max-w-7xl mx-auto px-6 py-8">

    <!-- Titre de la page -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-slate-900">Vos tests a realiser</h1>
      <p class="text-sm text-slate-500 mt-1">Parcourez chaque journey et donnez votre feedback</p>
    </div>

    <!-- ========== BARRE DE KPIs ========== -->
    <div id="kpi-bar" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <!-- KPI Card 1 : Progression globale -->
      <!-- KPI Card 2 : Tests termines -->
      <!-- KPI Card 3 : Tests en cours -->
      <!-- KPI Card 4 : Note moyenne -->
      <!-- Generes dynamiquement par JS -->
    </div>

    <!-- ========== SECTION AGRICULTEUR ========== -->
    <section class="mb-10">
      <h2 class="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
        <!-- Heroicon: user (mini 20px) -->
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 text-tg-primary">
          <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
        </svg>
        Portail Agriculteur
        <span class="text-sm font-normal text-slate-400 ml-1">(13 journeys)</span>
      </h2>

      <div id="grid-agriculteur" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <!-- Test Cards A1-A13 generees par JS -->
      </div>
    </section>

    <!-- ========== SECTION CONSEILLER ========== -->
    <section class="mb-10">
      <h2 class="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
        <!-- Heroicon: academic-cap (mini 20px) -->
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 text-tg-info">
          <path d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944z" />
        </svg>
        Portail Conseiller
        <span class="text-sm font-normal text-slate-400 ml-1">(10 journeys)</span>
      </h2>

      <div id="grid-conseiller" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <!-- Test Cards C1-C10 generees par JS -->
      </div>
    </section>

    <!-- ========== IDENTIFIANTS DEMO ========== -->
    <div class="bg-backgroundBlue border border-blue-200 rounded-lg p-4 mb-8">
      <h3 class="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
        <!-- Heroicon: information-circle (mini 20px) -->
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clip-rule="evenodd" />
        </svg>
        Identifiants de demo
      </h3>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
        <div>
          <span class="text-blue-700 font-medium">URL :</span>
          <a href="https://preprod-conseil.terragrow.fr/login" target="_blank" class="text-blue-600 underline break-all">preprod-conseil.terragrow.fr/login</a>
        </div>
        <div>
          <span class="text-blue-700 font-medium">Agriculteur :</span>
          <code class="bg-blue-100 px-1.5 py-0.5 rounded text-xs">agri@demo.fr / 0000</code>
        </div>
        <div>
          <span class="text-blue-700 font-medium">Conseiller :</span>
          <code class="bg-blue-100 px-1.5 py-0.5 rounded text-xs">advisor@demo.fr / 0000</code>
        </div>
      </div>
    </div>

    <!-- Lien admin (visible uniquement si admin) -->
    <div id="admin-link" class="hidden text-center">
      <a href="admin.html" class="text-tg-primary hover:text-tg-primary-hover text-sm font-medium underline">
        Acceder a la vue synthese admin
      </a>
    </div>

  </main>
</body>
```

#### Composants Marcassin utilises
- Header Components Section (header de page)
- Indicator Card pour les 4 KPIs
- Cards pour les test cards (titre + description + badge)
- Badge/Badge Type pour les statuts
- Button Ghost (deconnexion)
- Heading/Large pour le titre page
- Heading/Medium pour les titres de section
- Label/Base et Label/Small pour les textes

#### Logique JS associee
- Fichier : `js/dashboard.js`
- Charger le profil depuis Supabase (`profiles`)
- Charger les journeys depuis `data/journeys.json`
- Charger les feedbacks de l'utilisateur depuis Supabase (`feedbacks`)
- Calculer les KPIs et generer les cards dynamiquement
- Gestion du clic sur une card : redirect vers `test.html?id=A5`
- Bouton deconnexion : `supabase.auth.signOut()` puis redirect vers `index.html`
- Si `profiles.is_admin === true` : afficher le lien admin

---

### 1.5 test.html -- Page de detail d'un test

**URL** : `/test.html?id=A5`
**Fond** : `bg-backgroundSecondary`
**Layout** : Full-width, scroll vertical

**Acces** : Protege.

#### Structure HTML

```html
<body class="min-h-screen bg-slate-50">

  <!-- ========== HEADER (identique dashboard) ========== -->
  <header class="bg-white border-b border-slate-200 px-6 py-4">
    <div class="max-w-5xl mx-auto flex items-center justify-between">
      <div class="flex items-center gap-3">
        <a href="dashboard.html" class="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-base" title="Retour au dashboard">
          <!-- Heroicon: arrow-left (24px) -->
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </a>
        <img src="assets/logo.svg" alt="TerraGrow" class="h-8 w-8">
        <span class="text-lg font-bold text-slate-900">TerraGrow Testing</span>
      </div>
      <div class="flex items-center gap-3">
        <div id="user-avatar" class="w-10 h-10 rounded-full bg-tg-primary flex items-center justify-center text-white font-semibold text-sm"></div>
        <div class="text-right">
          <p id="user-name" class="text-sm font-semibold text-slate-900"></p>
          <p id="user-meta" class="text-xs text-slate-500"></p>
        </div>
      </div>
    </div>
  </header>

  <!-- ========== MAIN CONTENT ========== -->
  <main class="max-w-5xl mx-auto px-6 py-8">

    <!-- ===== EN-TETE DU TEST ===== -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">

      <!-- Badge section + ID -->
      <div class="flex items-center gap-3 mb-3">
        <span id="test-section-badge" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
          <!-- ex: bg-blue-100 text-blue-800 "Agriculteur" OU bg-teal-100 text-teal-800 "Conseiller" -->
        </span>
        <span id="test-id" class="text-sm font-mono text-slate-400"><!-- ex: A5 --></span>
      </div>

      <!-- Titre du test -->
      <h1 id="test-title" class="text-2xl font-bold text-slate-900 mb-3">
        <!-- ex: Tresorerie : previsionnel 12 mois -->
      </h1>

      <!-- User story -->
      <p id="test-userstory" class="text-slate-600 text-sm leading-relaxed mb-4">
        <!-- Description longue -->
      </p>

      <!-- Ecrans / flow a parcourir -->
      <div class="bg-slate-50 rounded-lg p-4 mb-4">
        <h3 class="text-sm font-semibold text-slate-700 mb-2">Ecrans / flow a parcourir</h3>
        <p id="test-screens" class="text-sm text-slate-600 leading-relaxed">
          <!-- Instructions de navigation -->
        </p>
      </div>

      <!-- Objectif de lecture -->
      <div class="bg-backgroundLime rounded-lg p-4">
        <h3 class="text-sm font-semibold text-lime-800 mb-2">Objectif de lecture</h3>
        <p id="test-objectif" class="text-sm text-lime-700 leading-relaxed">
          <!-- Ce qu'on regarde -->
        </p>
      </div>
    </div>

    <!-- ===== LIEN VERS L'APP ===== -->
    <div class="bg-backgroundBlue border border-blue-200 rounded-lg p-4 mb-6">
      <div class="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p class="text-sm font-medium text-blue-900">Ouvrir l'application a tester</p>
          <p class="text-xs text-blue-700 mt-0.5">Identifiants : agri@demo.fr / advisor@demo.fr - Mot de passe : 0000</p>
        </div>
        <a href="https://preprod-conseil.terragrow.fr/login" target="_blank"
          class="inline-flex items-center gap-2 px-4 py-2 bg-tg-primary hover:bg-tg-primary-hover text-white text-sm font-medium rounded-lg shadow-sm transition-base">
          <!-- Heroicon: arrow-top-right-on-square (mini 20px) -->
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
            <path fill-rule="evenodd" d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5zm4.943-.69l5.5-1.5a.75.75 0 01.914.727v5.5a.75.75 0 01-1.5 0V6.636l-5.22 5.22a.75.75 0 11-1.06-1.06l5.22-5.22H10.5a.75.75 0 010-1.5h2.25a.75.75 0 01.164.018z" clip-rule="evenodd" />
          </svg>
          Ouvrir TerraGrow
        </a>
      </div>
    </div>

    <!-- ===== FORMULAIRE DE FEEDBACK ===== -->
    <form id="feedback-form" class="space-y-6">

      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 class="text-lg font-bold text-slate-900 mb-6">Votre feedback</h2>

        <!-- 1. Statut de realisation -->
        <div class="mb-6">
          <label class="block text-sm font-semibold text-slate-700 mb-2">Statut de realisation</label>
          <select id="fb-status" name="status"
            class="w-full sm:w-64 px-4 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-tg-primary focus:border-transparent">
            <option value="">-- Selectionnez --</option>
            <option value="parcouru">Parcouru</option>
            <option value="partiel">Partiel</option>
            <option value="non_parcouru">Non parcouru</option>
          </select>
        </div>

        <!-- 2. Les 5 criteres -->
        <div class="mb-6">
          <h3 class="text-sm font-semibold text-slate-700 mb-4">Criteres d'evaluation</h3>
          <div class="space-y-4" id="criteria-container">
            <!-- Genere dynamiquement par JS : 5 criteres avec chacun un label contextuel + select OK/A ameliorer/Bloquant -->
          </div>
        </div>

        <!-- 3. Commentaire criteres -->
        <div class="mb-6">
          <label for="fb-comment" class="block text-sm font-semibold text-slate-700 mb-2">Commentaire sur les criteres</label>
          <textarea id="fb-comment" name="comment" rows="3" placeholder="Precisez vos observations sur les criteres..."
            class="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-tg-primary focus:border-transparent resize-y"></textarea>
        </div>

        <!-- 4. Note globale /5 -->
        <div class="mb-6">
          <label for="fb-rating" class="block text-sm font-semibold text-slate-700 mb-2">Note globale /5</label>
          <div class="flex items-center gap-3">
            <input type="number" id="fb-rating" name="rating" min="0" max="5" step="1" placeholder="0"
              class="w-20 px-4 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-700 text-center focus:outline-none focus:ring-2 focus:ring-tg-primary focus:border-transparent">
            <span class="text-sm text-slate-400">/ 5</span>
            <!-- Etoiles visuelles -->
            <div id="star-display" class="flex gap-1 ml-2">
              <!-- 5 etoiles generees par JS -->
            </div>
          </div>
        </div>

        <!-- 5. Verbatim -->
        <div class="mb-6">
          <label for="fb-verbatim" class="block text-sm font-semibold text-slate-700 mb-2">Verbatim</label>
          <p class="text-xs text-slate-400 mb-1.5">1 a 3 phrases qui resument ce qui vous a marque</p>
          <textarea id="fb-verbatim" name="verbatim" rows="2" placeholder="Ce qui m'a marque..."
            class="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-tg-primary focus:border-transparent resize-y"></textarea>
        </div>

        <!-- 6. Suggestion -->
        <div class="mb-6">
          <label for="fb-suggestion" class="block text-sm font-semibold text-slate-700 mb-2">Suggestion d'amelioration</label>
          <p class="text-xs text-slate-400 mb-1.5">1 a 2 idees concretes</p>
          <textarea id="fb-suggestion" name="suggestion" rows="2" placeholder="Pour ameliorer cette journey, je suggere..."
            class="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-tg-primary focus:border-transparent resize-y"></textarea>
        </div>
      </div>

      <!-- ===== BARRE D'ACTIONS ===== -->
      <div class="flex items-center justify-between">
        <a href="dashboard.html"
          class="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-base shadow-sm">
          <!-- Heroicon: arrow-left (mini 20px) -->
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
            <path fill-rule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clip-rule="evenodd" />
          </svg>
          Retour au dashboard
        </a>

        <div class="flex items-center gap-3">
          <!-- Indicateur auto-save -->
          <span id="save-indicator" class="hidden text-xs text-slate-400 flex items-center gap-1">
            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" /></svg>
            Sauvegarde automatique
          </span>

          <button type="submit" id="save-btn"
            class="inline-flex items-center gap-2 px-6 py-2.5 bg-tg-primary hover:bg-tg-primary-hover text-white text-sm font-semibold rounded-lg shadow-md transition-base focus:outline-none focus:ring-2 focus:ring-tg-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed">
            Sauvegarder
          </button>
        </div>
      </div>

      <!-- Message de succes -->
      <div id="save-success" class="hidden bg-backgroundLime border border-lime-300 rounded-lg p-3 text-center text-sm text-lime-800 font-medium">
        Feedback sauvegarde avec succes.
      </div>

    </form>

  </main>
</body>
```

#### Composants Marcassin utilises
- Header Components Section
- Heading/Large pour le titre du test
- Cards (container blanc avec shadow)
- Badge/Badge Type pour la section (Agriculteur/Conseiller)
- Select pour statut + criteres
- Textarea
- Input number pour la note
- Button Primary (Sauvegarder)
- Button Secondary (Retour)
- Button Ghost (liens)
- Label/Large, Label/Base, Label/Small, Label/Tiny

#### Logique JS associee
- Fichier : `js/test.js`
- Recuperer `id` depuis les query params
- Charger la journey depuis `journeys.json`
- Charger le feedback existant depuis Supabase (si deja saisi)
- Pre-remplir le formulaire avec les donnees existantes
- Generer les 5 criteres dynamiquement (labels contextualises par journey)
- Gestion des etoiles visuelles (mise a jour au changement de la note)
- Auto-save (debounce 2s apres dernier changement)
- Bouton "Sauvegarder" : upsert dans Supabase table `feedbacks`
- Validation : note entre 0-5, statut obligatoire

---

### 1.6 admin.html -- Vue synthese admin

**URL** : `/admin.html`
**Fond** : `bg-backgroundSecondary`
**Layout** : Full-width, tableau de synthese

**Acces** : Protege -- redirect si pas admin (`profiles.is_admin !== true`).

#### Structure HTML

```html
<body class="min-h-screen bg-slate-50">

  <!-- ========== HEADER ========== -->
  <header class="bg-white border-b border-slate-200 px-6 py-4">
    <div class="max-w-7xl mx-auto flex items-center justify-between">
      <div class="flex items-center gap-3">
        <a href="dashboard.html" class="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-base">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </a>
        <img src="assets/logo.svg" alt="TerraGrow" class="h-8 w-8">
        <span class="text-lg font-bold text-slate-900">Synthese Admin</span>
      </div>
      <div class="flex items-center gap-3">
        <div id="user-avatar" class="w-10 h-10 rounded-full bg-tg-primary flex items-center justify-center text-white font-semibold text-sm"></div>
        <p id="user-name" class="text-sm font-semibold text-slate-900"></p>
      </div>
    </div>
  </header>

  <main class="max-w-7xl mx-auto px-6 py-8">

    <!-- ===== KPIs GLOBAUX ===== -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div id="kpi-completion" class="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <!-- Taux de completion global -->
      </div>
      <div id="kpi-score" class="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <!-- Score moyen global -->
      </div>
      <div id="kpi-testers" class="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <!-- Nombre de testeurs actifs -->
      </div>
      <div id="kpi-blockers" class="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <!-- Nombre de bloquants -->
      </div>
    </div>

    <!-- ===== TABLEAU DE SYNTHESE PAR JOURNEY ===== -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
      <div class="px-6 py-4 border-b border-slate-200">
        <h2 class="text-lg font-bold text-slate-900">Synthese par journey</h2>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-slate-50">
            <tr>
              <th class="px-4 py-3 text-left font-semibold text-slate-600">ID</th>
              <th class="px-4 py-3 text-left font-semibold text-slate-600">Journey</th>
              <th class="px-4 py-3 text-center font-semibold text-slate-600">OK</th>
              <th class="px-4 py-3 text-center font-semibold text-slate-600">A ameliorer</th>
              <th class="px-4 py-3 text-center font-semibold text-slate-600">Bloquant</th>
              <th class="px-4 py-3 text-center font-semibold text-slate-600">Parcouru</th>
              <th class="px-4 py-3 text-center font-semibold text-slate-600">Partiel</th>
              <th class="px-4 py-3 text-center font-semibold text-slate-600">Non parcouru</th>
              <th class="px-4 py-3 text-center font-semibold text-slate-600">Note moy.</th>
            </tr>
          </thead>
          <tbody id="synthesis-body" class="divide-y divide-slate-100">
            <!-- Genere par JS -->
          </tbody>
        </table>
      </div>
    </div>

    <!-- ===== VERBATIMS ===== -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
      <h2 class="text-lg font-bold text-slate-900 mb-4">Verbatims</h2>
      <div id="verbatims-list" class="space-y-3">
        <!-- Genere par JS : un bloc par journey avec verbatims de chaque testeur -->
      </div>
    </div>

    <!-- ===== JOURNEYS PROBLEMATIQUES ===== -->
    <div class="bg-backgroundRed border border-red-200 rounded-xl p-6">
      <h2 class="text-lg font-bold text-red-900 mb-4">Journeys les plus problematiques</h2>
      <div id="problematic-list" class="space-y-2">
        <!-- Genere par JS : tri par note ascendante -->
      </div>
    </div>

  </main>
</body>
```

#### Composants Marcassin utilises
- Header Components Section
- Indicator Card x4 (KPIs globaux)
- Table Cell / Tables pour le tableau de synthese
- Badge/Badge Type pour les compteurs OK/Warning/Bloquant
- Heading/Large, Heading/Medium
- Label/Base, Label/Small

#### Logique JS associee
- Fichier : `js/admin.js`
- Verifier que l'utilisateur est admin
- Charger TOUS les feedbacks de TOUS les testeurs
- Agreger par journey : compter OK/A ameliorer/Bloquant par critere, compter statuts, calculer note moyenne
- Calculer les KPIs globaux
- Generer le tableau de synthese
- Trier les journeys problematiques (note la plus basse en premier)
- Afficher les verbatims groupes par journey

---

## 2. User Journeys (flows utilisateur)

### 2.1 Flow inscription (premier acces)

```
1. Utilisateur arrive sur register.html
   └─ Remplit : Nom, Prenom, Email, Telephone, Entreprise, Poste
   └─ Clic "Recevoir le Lien d'acces"

2. JS : supabase.auth.signInWithOtp({ email, options: { data: { first_name, last_name } } })
   └─ Stocker les donnees de profil dans localStorage (cle: 'pending_profile')
   └─ Succes : redirect vers magic-link-sent.html?email=xxx&register=true
   └─ Erreur : afficher message ("Cet email est deja utilise" ou erreur reseau)

3. Page magic-link-sent.html
   └─ Affiche l'email de destination
   └─ Bouton "Renvoyer ?" (cooldown 60s)
   └─ Ecoute supabase.auth.onAuthStateChange(SIGNED_IN)

4. Utilisateur clique le magic link dans son email
   └─ Supabase valide le token
   └─ onAuthStateChange se declenche
   └─ JS detecte 'pending_profile' dans localStorage
   └─ JS cree/met a jour le profil : supabase.from('profiles').upsert(...)
   └─ Supprime 'pending_profile' de localStorage
   └─ Redirect vers dashboard.html

5. Dashboard.html
   └─ Charge le profil et les journeys
   └─ Affiche les KPIs et la grille de tests
```

### 2.2 Flow login (acces suivants)

```
1. Utilisateur arrive sur index.html
   └─ Si session active : redirect immediat vers dashboard.html
   └─ Sinon : affiche le formulaire

2. Saisit son email → clic "Recevoir le Lien d'acces"
   └─ JS : supabase.auth.signInWithOtp({ email })
   └─ Succes : redirect vers magic-link-sent.html?email=xxx
   └─ Erreur "user not found" : afficher "Aucun compte avec cet email. Inscrivez-vous."

3. magic-link-sent.html → meme flow que 2.1 etape 3

4. Clic sur le lien email → session creee → redirect dashboard.html

5. Dashboard.html → charge profil existant + feedbacks existants
```

### 2.3 Flow test et feedback

```
1. Dashboard : clic sur une test card (ex: A5)
   └─ Redirect vers test.html?id=A5

2. test.html charge :
   └─ La journey A5 depuis journeys.json
   └─ Le feedback existant depuis Supabase (si deja saisi)
   └─ Pre-remplit le formulaire si feedback existe

3. Le testeur :
   └─ Lit la description, les instructions, l'objectif
   └─ Clique "Ouvrir TerraGrow" → onglet preprod
   └─ Realise le parcours dans TerraGrow
   └─ Revient sur test.html

4. Le testeur remplit le feedback :
   └─ Selectionne le statut (Parcouru/Partiel/Non parcouru)
   └─ Evalue les 5 criteres (OK/A ameliorer/Bloquant)
   └─ Saisit commentaire, note, verbatim, suggestion
   └─ Auto-save toutes les 2 secondes apres modification
   └─ OU clic "Sauvegarder" pour sauvegarde immediate

5. Sauvegarde :
   └─ supabase.from('feedbacks').upsert({ user_id, journey_id, status, criteria, comment, rating, verbatim, suggestion, updated_at })
   └─ Affiche "Feedback sauvegarde avec succes" pendant 3 secondes
   └─ Met a jour le badge de statut sur le dashboard au retour

6. Clic "Retour" → dashboard.html
   └─ Les KPIs sont recalcules avec le nouveau feedback
```

### 2.4 Flow admin -- synthese

```
1. Utilisateur admin arrive sur dashboard.html
   └─ Voit le lien "Acceder a la vue synthese admin"
   └─ Clic → admin.html

2. admin.html :
   └─ Verifie que profiles.is_admin === true
   └─ Si non admin : redirect vers dashboard.html
   └─ Charge TOUS les feedbacks : supabase.from('feedbacks').select('*')
   └─ Charge TOUS les profils : supabase.from('profiles').select('first_name, last_name')
   └─ Agrege les donnees par journey

3. Affichage :
   └─ 4 KPIs globaux (completion, score, testeurs actifs, bloquants)
   └─ Tableau de synthese par journey
   └─ Verbatims groupes par journey
   └─ Journeys problematiques tries par note
```

### 2.5 Edge cases et gestion d'erreurs

| Cas | Comportement |
|-----|-------------|
| **Email invalide (format)** | Validation HTML5 native `type="email"` + message inline |
| **Email inexistant au login** | Message : "Aucun compte avec cet email. Inscrivez-vous." avec lien vers register.html |
| **Session expiree** | `supabase.auth.onAuthStateChange(SIGNED_OUT)` → redirect vers index.html avec message "Session expiree, reconnectez-vous" |
| **Magic link expire** | Supabase renvoie une erreur au clic → page d'erreur avec bouton "Demander un nouveau lien" |
| **Feedback deja saisi** | Le formulaire est pre-rempli. L'upsert ecrase les valeurs precedentes. Pas de confirmation "ecraser". |
| **Perte de connexion reseau** | Afficher un toast "Erreur de connexion. Vos modifications n'ont pas ete sauvegardees." en rouge |
| **Champs obligatoires vides** | Validation native HTML5 (`required`). Le bouton Sauvegarder reste actif mais le form ne soumet pas. |
| **Note hors bornes** | `min="0" max="5"` sur l'input. Validation JS supplementaire. |
| **Double-clic sur Sauvegarder** | Desactiver le bouton pendant la requete (`disabled` + spinner) |
| **Profil incomplet apres magic link** | Si le profil est absent dans `profiles`, redirect vers register.html avec l'email pre-rempli |
| **Acces admin non autorise** | Redirect silencieux vers dashboard.html |

---

## 3. Fichier journeys.json

Le fichier `data/journeys.json` contient la definition statique des 23 journeys. Voici le JSON complet :

```json
{
  "journeys": [
    {
      "id": "A1",
      "section": "agriculteur",
      "title": "Onboarding agriculteur",
      "module": "Onboarding",
      "userStory": "En tant qu'agriculteur invite par mon conseiller, j'active mon compte et j'arrive sur un tableau de bord que je comprends rapidement.",
      "screens": "Login -> parcours d'onboarding guide -> choix du synchronisateur parcellaire (Mes Parcelles, SMAG, Geofolia, Weuse) -> import du parcellaire -> arrivee sur la home.",
      "objectif": "Je comprends a quoi sert l'outil et ce que je dois faire pour aller plus loin.",
      "criteria": [
        "Les etapes de l'onboarding sont claires et enchainees logiquement",
        "Le choix du synchronisateur parcellaire est comprehensible",
        "La promesse / valeur a la sortie de l'onboarding est lisible",
        "Le temps percu pour finir l'onboarding est raisonnable",
        "L'arrivee sur la home donne envie de creuser"
      ]
    },
    {
      "id": "A2",
      "section": "agriculteur",
      "title": "Parcelles & assolement",
      "module": "Agronomie > Parcelles & assolement",
      "userStory": "En tant qu'agriculteur, je visualise mes parcelles, je cree et je projette mon assolement previsionnel sur plusieurs campagnes.",
      "screens": "Liste parcellaire -> fiche parcelle -> creation d'un assolement previsionnel -> propagation sur plusieurs parcelles -> cycle de rotation pluriannuel.",
      "objectif": "Je visualise simplement mes parcelles et la rotation que je prevois.",
      "criteria": [
        "La difference parcelle / assolement / rotation est claire",
        "Creer un assolement previsionnel est intuitif",
        "Propager un assolement sur plusieurs parcelles est evident",
        "Les campagnes / annees sont bien lisibles visuellement",
        "La vue liste parcellaire est exploitable au quotidien"
      ]
    },
    {
      "id": "A3",
      "section": "agriculteur",
      "title": "ITK (Itineraires techniques)",
      "module": "Agronomie > ITK",
      "userStory": "En tant qu'agriculteur, je construis mes itineraires techniques par culture avec mon conseiller pour cadrer mon previsionnel.",
      "screens": "Creation d'un ITK -> suite d'operations dans le temps -> affectation aux cultures / parcelles -> signature de l'ITK.",
      "objectif": "Je comprends comment un ITK cadre mon previsionnel economique.",
      "criteria": [
        "La logique ITK -> culture -> parcelle est comprehensible",
        "Creer un ITK est intuitif (operations, doses, prix)",
        "Le lien ITK -> previsionnel economique est explicite",
        "La validation / signature d'un ITK est claire",
        "Les ITK existants sont faciles a retrouver et dupliquer"
      ]
    },
    {
      "id": "A4",
      "section": "agriculteur",
      "title": "Carnet de plaine",
      "module": "Agronomie > Carnet de plaine",
      "userStory": "En tant qu'agriculteur, je mets a jour au fil de l'eau les interventions reellement realisees sur mes parcelles.",
      "screens": "Depot des exports FMS ou saisie manuelle -> remontee des operations -> signalement des donnees a corriger -> comparaison prevu / realise.",
      "objectif": "Je vois en direct l'ecart entre ce que j'avais prevu et ce que je realise.",
      "criteria": [
        "Deposer un export FMS est simple",
        "Les operations mal recuperees sont clairement signalees",
        "La saisie manuelle d'une operation est ergonomique",
        "Le delta previsionnel / concretise est lisible",
        "L'effort de mise a jour est tenable dans le temps"
      ]
    },
    {
      "id": "A5",
      "section": "agriculteur",
      "title": "Tresorerie : previsionnel 12 mois",
      "module": "Tresorerie > Previsionnel 12 mois",
      "userStory": "En tant qu'agriculteur, je consulte mon previsionnel de tresorerie 12 mois pour anticiper mes tensions de cash.",
      "screens": "Vue graphique 12 mois -> tableau encaissements / decaissements -> drill-down par nature (charges operationnelles, structure, etc.).",
      "objectif": "Je lis en quelques secondes ou se situe mon risque cash sur les 12 mois a venir.",
      "criteria": [
        "Le graphique 12 mois est lisible en un coup d'oeil",
        "Les encaissements / decaissements sont bien distingues",
        "Balance et BFR sont comprehensibles sans etre expert-comptable",
        "Le drill-down par nature de charge fonctionne",
        "Le lien graphique <-> tableau est coherent"
      ]
    },
    {
      "id": "A6",
      "section": "agriculteur",
      "title": "Tresorerie : gestion des factures",
      "module": "Tresorerie > Factures",
      "userStory": "En tant qu'agriculteur, je depose mes factures en attente et je visualise leur statut pour fiabiliser mon previsionnel.",
      "screens": "Import / scan de factures -> lecture automatique -> tableau des factures par statut -> rattachement aux flux de tresorerie.",
      "objectif": "Je sais quelles factures sont en attente, payees, ou a regler.",
      "criteria": [
        "Deposer / scanner une facture est simple",
        "La lecture automatique du contenu est comprehensible",
        "Les statuts (payee / impayee / en attente) sont clairs",
        "Le lien facture -> flux de tresorerie est visible",
        "Les erreurs de lecture sont signalees et corrigeables"
      ]
    },
    {
      "id": "A7",
      "section": "agriculteur",
      "title": "Tresorerie : flux bancaires",
      "module": "Tresorerie > Categorisation flux bancaires",
      "userStory": "En tant qu'agriculteur, je categorise mes flux bancaires remontes automatiquement pour obtenir un previsionnel fiable.",
      "screens": "Liste des transactions issues de la connexion bancaire -> categorisation (suggeree / manuelle) -> impact sur le previsionnel 12 mois.",
      "objectif": "Je transforme rapidement une liste de flux bruts en previsionnel exploitable.",
      "criteria": [
        "Le tableau de flux bancaires est lisible",
        "Les categories suggerees automatiquement me parlent",
        "Categoriser manuellement est rapide",
        "L'impact sur le previsionnel 12 mois est visible immediatement",
        "L'effort global de categorisation est raisonnable"
      ]
    },
    {
      "id": "A8",
      "section": "agriculteur",
      "title": "Rentabilite : vue ateliers",
      "module": "Rentabilite > Vue ateliers (campagne)",
      "userStory": "En tant qu'agriculteur, j'accede a une vue globale de la rentabilite de tous mes ateliers pour reperer les sorties de route.",
      "screens": "Vue synthetique marge brute / EBE / cout de revient par atelier -> comparaison previsionnel vs realise -> alerte visuelle sur les ecarts.",
      "objectif": "Je repere instantanement l'atelier qui deraille.",
      "criteria": [
        "La vue globale des ateliers est lisible",
        "L'atelier en difficulte ressort visuellement",
        "Produit / charge / EBE / marge : le vocabulaire me parle",
        "L'ecart prevu / realise est visuellement evident",
        "L'echelle des indicateurs est bien calibree"
      ]
    },
    {
      "id": "A9",
      "section": "agriculteur",
      "title": "Rentabilite : focus atelier",
      "module": "Rentabilite > Focus atelier",
      "userStory": "En tant qu'agriculteur, je zoome sur un atelier pour comprendre ou partent mes charges et ou se situe ma marge.",
      "screens": "Detail des charges operationnelles / de structure -> split prevu / realise -> focus par poste (engrais, semences, carburant, phyto, MO).",
      "objectif": "Je comprends precisement d'ou vient l'ecart sur l'atelier que j'ai selectionne.",
      "criteria": [
        "Le zoom sur un atelier est immediatement lisible",
        "La decomposition par poste est claire",
        "Le split prevu / realise par poste est explicite",
        "Les ratios affiches sont pertinents pour agir",
        "Je sais quelle decision prendre face a un depassement"
      ]
    },
    {
      "id": "A10",
      "section": "agriculteur",
      "title": "Pluriannuel",
      "module": "Pluriannuel",
      "userStory": "En tant qu'agriculteur, je visualise ma trajectoire economique sur plusieurs exercices comptables pour preparer mes decisions structurantes.",
      "screens": "Vue pluriannuelle graphique + tableau -> filtres par scenario (conjoncturel) et par projet (investissement) -> lecture EBE / BFR / tresorerie projetee.",
      "objectif": "Je vois ou me menent mes choix structurants sur 6 a 8 ans.",
      "criteria": [
        "La vue pluriannuelle est lisible",
        "L'exercice comptable est bien materialise",
        "L'effet d'un scenario conjoncturel est visible",
        "L'effet d'un projet d'investissement est visible",
        "Les indicateurs cles (EBE, BFR, treso projetee) sont clairs"
      ]
    },
    {
      "id": "A11",
      "section": "agriculteur",
      "title": "Stocks : gestion stocks & lots",
      "module": "Stocks > Gestion stocks & lots",
      "userStory": "En tant qu'agriculteur, je gere mes stocks et mes lots pour fiabiliser ma marge et ma tresorerie.",
      "screens": "Vue inventaire valorise -> fiches lots -> mouvements de stock -> impact sur les indicateurs de rentabilite.",
      "objectif": "Je maintiens un inventaire fiable qui alimente ma rentabilite.",
      "criteria": [
        "Le modele stock / lot est comprehensible",
        "La valorisation est lisible",
        "Les mouvements de stock sont tracables",
        "L'impact stock -> rentabilite / tresorerie est visible",
        "L'interface est applicable a la realite d'une exploitation"
      ]
    },
    {
      "id": "A12",
      "section": "agriculteur",
      "title": "Stocks : import manuel ventes/achats",
      "module": "Stocks > Import manuel vente / achat",
      "userStory": "En tant qu'agriculteur, j'ajoute manuellement des ventes ou des achats pour maintenir mes stocks a jour.",
      "screens": "Formulaire de saisie d'un achat / d'une vente -> affectation a un lot -> mise a jour du stock et des KPI associes.",
      "objectif": "Je saisis en moins d'une minute une vente ou un achat hors flux auto.",
      "criteria": [
        "Le formulaire de saisie est clair et rapide",
        "L'affectation a un lot est evidente",
        "L'impact sur mes stocks est immediat",
        "Les KPI associes sont mis a jour visiblement",
        "Le temps percu pour une saisie est raisonnable"
      ]
    },
    {
      "id": "A13",
      "section": "agriculteur",
      "title": "Chat avec mon conseiller",
      "module": "Chat agriculteur",
      "userStory": "En tant qu'agriculteur, j'ouvre la boite de dialogue pour echanger avec mon conseiller sans changer d'outil.",
      "screens": "Ouverture du drawer chat depuis la home -> conversation 1-1 avec le conseiller -> envoi de messages, fichiers, mentions -> historique archive.",
      "objectif": "Je communique avec mon conseiller comme je le ferais sur WhatsApp, mais avec tout trace et rattache a mon dossier.",
      "criteria": [
        "Le chat est visible / accessible depuis la home",
        "Le drawer est intuitif",
        "L'envoi d'un message / fichier est simple",
        "L'historique de conversation est lisible",
        "La valeur vs SMS / WhatsApp / mail est percue"
      ]
    },
    {
      "id": "C1",
      "section": "conseiller",
      "title": "Portefeuille client",
      "module": "Portefeuille client",
      "userStory": "En tant que conseiller, j'ouvre mon portefeuille, je segmente mes adherents et je repere les dossiers a risque ou a fort potentiel de conseil.",
      "screens": "Tableau portefeuille -> indicateurs cles par exploitation (CA, charges, EBE, EBE/CA, fraicheur) -> tri / regroupement par production -> creation de listes personnalisees.",
      "objectif": "Je priorise mes rendez-vous de conseil en 2 minutes.",
      "criteria": [
        "Le tableau portefeuille est lisible en un coup d'oeil",
        "Les indicateurs cles proposes sont pertinents",
        "Le tri / regroupement par production fonctionne intuitivement",
        "Creer une liste / vue personnalisee est clair",
        "Je peux prioriser mes rendez-vous a partir de cette vue"
      ]
    },
    {
      "id": "C2",
      "section": "conseiller",
      "title": "Fiche client : vue d'ensemble",
      "module": "Fiche client > Vue d'ensemble",
      "userStory": "En tant que conseiller, j'ouvre la fiche d'un adherent et j'ai une lecture synthetique avant de descendre dans le detail.",
      "screens": "Fiche client agregee -> identite exploitation + indicateurs de tete -> acces aux sous-pages (treso, pluriannuel, rentabilite, projets, itineraires, stocks).",
      "objectif": "En 30 secondes, je sais ou sont les points d'attention chez cet adherent.",
      "criteria": [
        "L'identite exploitation est claire",
        "Les indicateurs de tete donnent une lecture rapide",
        "Les sous-pages sont bien signalees et accessibles",
        "La navigation interne a la fiche est fluide",
        "Je sais ou aller chercher quoi"
      ]
    },
    {
      "id": "C3",
      "section": "conseiller",
      "title": "Fiche client : tresorerie",
      "module": "Fiche client > Tresorerie",
      "userStory": "En tant que conseiller, j'ouvre la sous-page tresorerie de l'adherent pour qualifier le risque cash et la trajectoire 12 mois.",
      "screens": "Meme affichage que cote agriculteur (graphique 12 mois + tableau + factures + categorisation bancaire) -> lecture en mode conseiller.",
      "objectif": "Je qualifie le risque cash en quelques secondes.",
      "criteria": [
        "L'affichage est coherent avec la vue agriculteur",
        "Le risque cash se qualifie rapidement",
        "La trajectoire 12 mois est lisible",
        "Les indicateurs (balance, BFR) sont exploitables",
        "La lecture en mode conseiller apporte une vraie valeur"
      ]
    },
    {
      "id": "C4",
      "section": "conseiller",
      "title": "Fiche client : pluriannuel",
      "module": "Fiche client > Pluriannuel",
      "userStory": "En tant que conseiller, j'ouvre la sous-page pluriannuel pour lire la trajectoire economique sur plusieurs exercices.",
      "screens": "Meme affichage que cote agriculteur (graphique + tableau pluriannuel + filtres projets / scenarios) -> lecture sur plusieurs exercices.",
      "objectif": "Je batis un conseil structurant en m'appuyant sur la trajectoire pluriannuelle.",
      "criteria": [
        "L'affichage est coherent avec la vue agriculteur",
        "La lecture pluriannuelle est claire",
        "L'application d'un scenario / projet est evidente",
        "Les exercices comptables sont bien materialises",
        "Je peux batir un conseil structurant depuis cette vue"
      ]
    },
    {
      "id": "C5",
      "section": "conseiller",
      "title": "Fiche client : rentabilite",
      "module": "Fiche client > Rentabilite (vs referentiel)",
      "userStory": "En tant que conseiller, je situe la rentabilite des ateliers de l'adherent vs mon portefeuille ou un autre referentiel que je choisis.",
      "screens": "Vue rentabilite par atelier -> selection du referentiel (mon portefeuille, liste filtree, referentiel externe) -> lecture produits / charges / EBE / marge vs referentiel.",
      "objectif": "Je sais quel atelier de cet adherent challenger en priorite et pourquoi.",
      "criteria": [
        "Le positionnement vs referentiel est visible",
        "Je peux changer de referentiel de comparaison facilement",
        "Les ecarts atelier par atelier sont evidents",
        "Les indicateurs economiques parlent a mon metier",
        "Je sais quel atelier challenger en priorite"
      ]
    },
    {
      "id": "C6",
      "section": "conseiller",
      "title": "Fiche client : projets",
      "module": "Fiche client > Projets",
      "userStory": "En tant que conseiller, je consulte les projets d'investissement de l'adherent et j'en cree de nouveaux pour simuler des previsionnels.",
      "screens": "Liste des projets -> visualisation des previsionnels associes -> creation d'un nouveau projet (hypotheses, plan de financement, assolement) -> projection pluriannuelle + alertes.",
      "objectif": "Je co-construis avec l'adherent la meilleure trajectoire en comparant plusieurs projets.",
      "criteria": [
        "La liste des projets est claire",
        "Creer un nouveau projet est intuitif",
        "Les hypotheses (plan de financement, assolement) sont accessibles",
        "Les previsionnels generes sont lisibles",
        "Je peux porter le projet en rendez-vous de conseil"
      ]
    },
    {
      "id": "C7",
      "section": "conseiller",
      "title": "Fiche client : itineraires",
      "module": "Fiche client > Itineraires (vs portefeuille)",
      "userStory": "En tant que conseiller, je compare les performances techniques de l'adherent sur ses itineraires culturaux et je les situe dans le portefeuille.",
      "screens": "Liste des ITK de l'adherent par culture -> details techniques et economiques -> comparaison avec les ITK d'autres exploitations du portefeuille.",
      "objectif": "J'identifie les leviers techniques par culture sur lesquels aller chercher de la marge.",
      "criteria": [
        "Les ITK de l'adherent sont bien listes",
        "Le comparatif avec d'autres exploitations est exploitable",
        "Les indicateurs techniques sont pertinents",
        "Les indicateurs economiques associes sont lisibles",
        "Je peux batir un conseil agronomique a partir de la"
      ]
    },
    {
      "id": "C8",
      "section": "conseiller",
      "title": "Fiche client : stocks",
      "module": "Fiche client > Stocks",
      "userStory": "En tant que conseiller, j'ouvre la sous-page stocks de l'adherent pour fiabiliser ma lecture de la marge et de la tresorerie.",
      "screens": "Meme affichage que cote agriculteur (inventaire valorise, lots, mouvements) -> lecture en mode conseiller.",
      "objectif": "Je qualifie un besoin de pilotage des stocks chez l'adherent.",
      "criteria": [
        "L'affichage est coherent avec la vue agriculteur",
        "L'impact stock -> marge / tresorerie est lisible",
        "Les lots sont tracables",
        "Les mouvements sont lisibles",
        "Je peux qualifier un besoin de pilotage stock"
      ]
    },
    {
      "id": "C9",
      "section": "conseiller",
      "title": "Data visualisation portefeuille",
      "module": "Data visualisation portefeuille",
      "userStory": "En tant que conseiller, je construis a la volee des graphiques sur mon portefeuille pour faire emerger des tendances et reperer les exploitations a risque.",
      "screens": "Choix d'un type de graph (bar / line / distribution) -> choix de l'axe Y (indicateurs par defaut + custom) et axe X -> selecteur de periode -> scenario macro -> clic sur un point -> drawer exploitation -> fiche client.",
      "objectif": "Je passe d'une observation macro a une action ciblee sur une exploitation en quelques clics.",
      "criteria": [
        "Le choix du type de graph est intuitif",
        "Les indicateurs par defaut sont pertinents",
        "Le selecteur de periode fonctionne bien",
        "L'application d'un scenario macro est lisible",
        "Je passe de la vue macro a la fiche exploitation en un clic"
      ]
    },
    {
      "id": "C10",
      "section": "conseiller",
      "title": "Chat conseiller",
      "module": "Chat / boite de dialogue conseiller",
      "userStory": "En tant que conseiller, je centralise mes echanges avec mes adherents dans TerraGrow pour tracer le conseil et garantir la continuite.",
      "screens": "Acces au module chat (3 niveaux : cabinet / equipe / conversation) -> ouverture d'une conversation 1-1 ou groupe -> envoi messages, fichiers, mentions -> rattachement automatique au dossier client.",
      "objectif": "Je retrouve tous mes echanges rattaches aux bons dossiers, meme en cas de reprise par un collegue.",
      "criteria": [
        "Les 3 niveaux d'acces sont clairs",
        "Ouvrir une conversation est intuitif",
        "L'envoi de message / fichier / mention fonctionne",
        "Le rattachement au dossier client est lisible",
        "Je gagne du temps vs SMS / WhatsApp / mail"
      ]
    }
  ]
}
```

---

## 4. Specification des composants

### 4.1 KPI Card (Indicator Card)

Card de type indicateur pour le dashboard.

```html
<!-- KPI Card -->
<div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
  <div class="flex items-center justify-between mb-3">
    <span class="text-xs font-medium text-slate-500 uppercase tracking-wider">
      <!-- Label : ex "Progression" -->
    </span>
    <!-- Icone optionnelle -->
    <div class="p-2 rounded-lg bg-backgroundBlue">
      <!-- Heroicon mini 20px -->
    </div>
  </div>
  <p class="text-2xl font-bold text-slate-900 mb-1">
    <!-- Valeur : ex "8 / 23" -->
  </p>
  <!-- Progress bar optionnelle -->
  <div class="w-full bg-slate-100 rounded-full h-2 mt-2">
    <div class="bg-tg-primary rounded-full h-2 transition-all duration-500" style="width: 35%"></div>
  </div>
  <p class="text-xs text-slate-400 mt-1.5">
    <!-- Sous-texte : ex "35% de completion" -->
  </p>
</div>
```

**Variantes** :
- Avec progress bar (progression)
- Avec valeur numerique seule (score moyen)
- Avec compteur colore (nombre de bloquants)
- Avec mini-chart (repartition statuts)

**Props** :
- `label` (string) : texte du label en haut
- `value` (string) : valeur principale
- `subtext` (string) : sous-texte
- `icon` (string) : nom de l'icone Heroicons
- `iconBg` (string) : classe de couleur de fond pour l'icone
- `progress` (number|null) : pourcentage pour la progress bar (0-100)
- `color` (string) : couleur d'accent (blue, lime, amber, red)

---

### 4.2 Test Card

Card cliquable representant un test/journey sur le dashboard.

```html
<!-- Test Card -->
<a href="test.html?id=A5" class="block bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md hover:border-slate-300 transition-base group">

  <!-- Header : ID + Badge statut -->
  <div class="flex items-center justify-between mb-3">
    <span class="text-xs font-mono font-bold text-slate-400">A5</span>
    <!-- Badge statut -->
    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
      Non commence
    </span>
  </div>

  <!-- Titre -->
  <h3 class="text-sm font-semibold text-slate-900 group-hover:text-tg-primary transition-base mb-1.5">
    Tresorerie : previsionnel 12 mois
  </h3>

  <!-- Description courte (tronquee) -->
  <p class="text-xs text-slate-500 line-clamp-2">
    Je consulte mon previsionnel de tresorerie 12 mois pour anticiper mes tensions de cash.
  </p>

  <!-- Barre de remplissage feedback (si feedback partiel) -->
  <div class="mt-3 flex items-center gap-2">
    <div class="flex-1 bg-slate-100 rounded-full h-1.5">
      <div class="bg-tg-primary rounded-full h-1.5" style="width: 0%"></div>
    </div>
    <span class="text-xs text-slate-400">0%</span>
  </div>
</a>
```

**Variantes du Badge statut** :

| Statut | Classes Tailwind |
|--------|-----------------|
| Non commence | `bg-slate-100 text-slate-600` |
| En cours | `bg-backgroundAmber text-amber-700` |
| Parcouru | `bg-backgroundLime text-lime-700` |
| Partiel | `bg-backgroundAmber text-amber-700` |
| Non parcouru | `bg-slate-100 text-slate-600` |
| Termine (feedback complet) | `bg-backgroundLime text-lime-700` avec check icon |

**Props** :
- `id` (string) : ID du test (A1, C5, etc.)
- `title` (string) : titre du test
- `description` (string) : user story (tronquee a 2 lignes)
- `status` (string) : statut du feedback
- `progress` (number) : pourcentage de champs remplis (0-100)
- `href` (string) : URL vers test.html?id=xxx

---

### 4.3 Critere d'evaluation

Bloc d'evaluation d'un critere individuel (5 par test).

```html
<!-- Critere -->
<div class="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
  <div class="flex-1">
    <div class="flex items-center gap-2 mb-1">
      <span class="text-xs font-bold text-slate-400">C1</span>
      <span class="text-sm font-medium text-slate-700">
        <!-- Label du critere contextualise : ex "Le graphique 12 mois est lisible en un coup d'oeil" -->
      </span>
    </div>
  </div>
  <select name="criteria_1" class="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-tg-primary focus:border-transparent min-w-[160px]">
    <option value="">-- Evaluez --</option>
    <option value="ok">OK</option>
    <option value="a_ameliorer">A ameliorer</option>
    <option value="bloquant">Bloquant</option>
  </select>
</div>
```

**Couleur du select selon la valeur** (appliquee par JS) :
- `ok` : `border-lime-400 bg-backgroundLime`
- `a_ameliorer` : `border-amber-400 bg-backgroundAmber`
- `bloquant` : `border-red-400 bg-backgroundRed`

---

### 4.4 Avatar initiales

Avatar circulaire avec les initiales de l'utilisateur.

```html
<div class="w-10 h-10 rounded-full bg-tg-primary flex items-center justify-center text-white font-semibold text-sm">
  ML
</div>
```

**Variantes de taille** :
- Small : `w-8 h-8 text-xs`
- Medium : `w-10 h-10 text-sm`
- Large : `w-12 h-12 text-base`

**Generation JS** : prendre la premiere lettre du prenom + premiere lettre du nom, en majuscules.

---

### 4.5 Toast / Notification

Notification temporaire en bas a droite.

```html
<!-- Toast -->
<div id="toast" class="fixed bottom-6 right-6 z-50 hidden">
  <div class="flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium max-w-sm">
    <!-- Variante succes -->
    <!-- class="bg-lime-800 text-white" -->
    <!-- Variante erreur -->
    <!-- class="bg-red-600 text-white" -->
    <!-- Variante info -->
    <!-- class="bg-slate-800 text-white" -->
    <span>Message du toast</span>
    <button class="text-white/70 hover:text-white">
      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
    </button>
  </div>
</div>
```

**Fonction JS** : `showToast(message, type = 'success', duration = 3000)`

---

### 4.6 Section Header

En-tete de section reutilisable.

```html
<h2 class="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
  <!-- Icone optionnelle -->
  <svg class="w-5 h-5 text-tg-primary">...</svg>
  Titre de la section
  <span class="text-sm font-normal text-slate-400 ml-1">(sous-texte)</span>
</h2>
```

---

### 4.7 Info Box

Boite d'information (identifiants de demo, etc.).

```html
<div class="bg-backgroundBlue border border-blue-200 rounded-lg p-4">
  <h3 class="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
    <!-- Icone info -->
    Titre
  </h3>
  <div class="text-sm text-blue-700">
    <!-- Contenu -->
  </div>
</div>
```

**Variantes par couleur** :
- Info : `bg-backgroundBlue border-blue-200 text-blue-900`
- Succes : `bg-backgroundLime border-lime-200 text-lime-900`
- Warning : `bg-backgroundAmber border-amber-200 text-amber-900`
- Erreur : `bg-backgroundRed border-red-200 text-red-900`

---

### 4.8 Tableau de synthese (admin)

Ligne de tableau pour la vue admin.

```html
<tr class="hover:bg-slate-50 transition-base">
  <td class="px-4 py-3 text-sm font-mono font-bold text-slate-500">A5</td>
  <td class="px-4 py-3 text-sm text-slate-700">Tresorerie : previsionnel 12 mois</td>
  <td class="px-4 py-3 text-center">
    <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-backgroundLime text-lime-700 text-xs font-bold">12</span>
  </td>
  <td class="px-4 py-3 text-center">
    <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-backgroundAmber text-amber-700 text-xs font-bold">5</span>
  </td>
  <td class="px-4 py-3 text-center">
    <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-backgroundRed text-red-700 text-xs font-bold">1</span>
  </td>
  <td class="px-4 py-3 text-center text-sm text-slate-600">4</td>
  <td class="px-4 py-3 text-center text-sm text-slate-600">2</td>
  <td class="px-4 py-3 text-center text-sm text-slate-600">1</td>
  <td class="px-4 py-3 text-center">
    <span class="text-sm font-bold text-slate-900">3.8</span>
    <span class="text-xs text-slate-400">/5</span>
  </td>
</tr>
```

---

## 5. Design des emails Supabase

### 5.1 Email Magic Link (connexion)

**Objet** : Votre lien d'acces TerraGrow Testing
**Variable Supabase** : `{{ .ConfirmationURL }}`

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Votre lien d'acces TerraGrow Testing</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%;">

          <!-- HEADER -->
          <tr>
            <td style="background-color: #021130; padding: 32px 40px; border-radius: 12px 12px 0 0; text-align: center;">
              <img src="https://your-domain.com/assets/logo.svg" alt="TerraGrow" width="48" height="48" style="display: block; margin: 0 auto 16px;">
              <h1 style="color: #ffffff; font-size: 20px; font-weight: 700; margin: 0; line-height: 1.3;">
                TerraGrow Testing
              </h1>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="background-color: #ffffff; padding: 40px; border-radius: 0 0 12px 12px;">

              <h2 style="color: #0f172a; font-size: 22px; font-weight: 700; margin: 0 0 16px; text-align: center;">
                Votre lien d'acces
              </h2>

              <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 24px; text-align: center;">
                Cliquez sur le bouton ci-dessous pour acceder a votre espace de test TerraGrow.
                Ce lien est valable pendant 24 heures et ne peut etre utilise qu'une seule fois.
              </p>

              <!-- BOUTON CTA -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 8px 0 32px;">
                    <a href="{{ .ConfirmationURL }}"
                      style="display: inline-block; background-color: #2563eb; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px; line-height: 1;">
                      Acceder a mon espace
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; margin: 0 0 16px; text-align: center;">
                Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :
              </p>
              <p style="color: #2563eb; font-size: 11px; line-height: 1.4; margin: 0 0 24px; text-align: center; word-break: break-all;">
                {{ .ConfirmationURL }}
              </p>

              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">

              <p style="color: #94a3b8; font-size: 11px; line-height: 1.5; margin: 0; text-align: center;">
                Cet email a ete envoye automatiquement par TerraGrow Testing.
                Si vous n'avez pas demande cet acces, vous pouvez ignorer cet email.
              </p>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding: 24px 40px; text-align: center;">
              <p style="color: #94a3b8; font-size: 11px; margin: 0;">
                TerraGrow SAS - Plateforme de test UAT
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

### 5.2 Email d'invitation (admin invite un testeur)

**Objet** : Vous etes invite a tester TerraGrow
**Variable Supabase** : `{{ .ConfirmationURL }}`

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitation TerraGrow Testing</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%;">

          <!-- HEADER -->
          <tr>
            <td style="background-color: #021130; padding: 32px 40px; border-radius: 12px 12px 0 0; text-align: center;">
              <img src="https://your-domain.com/assets/logo.svg" alt="TerraGrow" width="48" height="48" style="display: block; margin: 0 auto 16px;">
              <h1 style="color: #ffffff; font-size: 20px; font-weight: 700; margin: 0; line-height: 1.3;">
                TerraGrow Testing
              </h1>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="background-color: #ffffff; padding: 40px; border-radius: 0 0 12px 12px;">

              <h2 style="color: #0f172a; font-size: 22px; font-weight: 700; margin: 0 0 16px; text-align: center;">
                Vous etes invite a tester TerraGrow
              </h2>

              <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
                Bonjour,
              </p>

              <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
                Dans le cadre du partenariat TerraGrow x CFG Alsace, vous etes invite a participer aux tests
                utilisateurs (UAT) de la plateforme TerraGrow. Votre feedback est essentiel pour valider
                les interfaces avant le prochain jalon.
              </p>

              <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
                <strong>Ce que vous allez faire :</strong> parcourir les interfaces de TerraGrow (agriculteur et conseiller)
                et donner votre avis structure sur chaque ecran. Comptez environ 30 a 45 minutes par session.
              </p>

              <!-- BOUTON CTA -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 8px 0 32px;">
                    <a href="{{ .ConfirmationURL }}"
                      style="display: inline-block; background-color: #2563eb; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px; line-height: 1;">
                      Creer mon compte testeur
                    </a>
                  </td>
                </tr>
              </table>

              <!-- BLOC IDENTIFIANTS -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #eff6ff; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="color: #1e3a5f; font-size: 13px; font-weight: 600; margin: 0 0 8px;">
                      Identifiants de demo TerraGrow
                    </p>
                    <p style="color: #475569; font-size: 13px; line-height: 1.6; margin: 0;">
                      URL : preprod-conseil.terragrow.fr/login<br>
                      Agriculteur : agri@demo.fr / 0000<br>
                      Conseiller : advisor@demo.fr / 0000
                    </p>
                  </td>
                </tr>
              </table>

              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">

              <p style="color: #94a3b8; font-size: 11px; line-height: 1.5; margin: 0; text-align: center;">
                Cet email a ete envoye par Pierre Wirenius (TerraGrow) via la plateforme de test UAT.
                Si vous n'etes pas concerne, vous pouvez ignorer cet email.
              </p>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding: 24px 40px; text-align: center;">
              <p style="color: #94a3b8; font-size: 11px; margin: 0;">
                TerraGrow SAS - Plateforme de test UAT
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

### 5.3 Email de bienvenue (apres premiere inscription)

**Objet** : Bienvenue sur TerraGrow Testing
**Envoye par** : Supabase Edge Function ou trigger after insert on profiles
**Variable** : `{{ .SiteURL }}` pour le lien vers le dashboard

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenue sur TerraGrow Testing</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%;">

          <!-- HEADER -->
          <tr>
            <td style="background-color: #021130; padding: 32px 40px; border-radius: 12px 12px 0 0; text-align: center;">
              <img src="https://your-domain.com/assets/logo.svg" alt="TerraGrow" width="48" height="48" style="display: block; margin: 0 auto 16px;">
              <h1 style="color: #ffffff; font-size: 20px; font-weight: 700; margin: 0; line-height: 1.3;">
                TerraGrow Testing
              </h1>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="background-color: #ffffff; padding: 40px; border-radius: 0 0 12px 12px;">

              <h2 style="color: #0f172a; font-size: 22px; font-weight: 700; margin: 0 0 16px; text-align: center;">
                Bienvenue dans l'equipe de test !
              </h2>

              <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
                Votre compte testeur est maintenant actif. Vous pouvez commencer a parcourir les 23 journeys
                utilisateur et donner votre feedback.
              </p>

              <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
                <strong>Comment ca marche :</strong>
              </p>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="padding: 0 0 12px;">
                    <table role="presentation" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="width: 32px; vertical-align: top;">
                          <div style="width: 24px; height: 24px; background-color: #2563eb; border-radius: 50%; color: #ffffff; font-size: 12px; font-weight: 700; text-align: center; line-height: 24px;">1</div>
                        </td>
                        <td style="padding-left: 12px; color: #475569; font-size: 13px; line-height: 1.5;">
                          Connectez-vous a votre espace de test via le bouton ci-dessous
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0 0 12px;">
                    <table role="presentation" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="width: 32px; vertical-align: top;">
                          <div style="width: 24px; height: 24px; background-color: #2563eb; border-radius: 50%; color: #ffffff; font-size: 12px; font-weight: 700; text-align: center; line-height: 24px;">2</div>
                        </td>
                        <td style="padding-left: 12px; color: #475569; font-size: 13px; line-height: 1.5;">
                          Choisissez un test dans le dashboard et ouvrez TerraGrow dans un autre onglet
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0 0 12px;">
                    <table role="presentation" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="width: 32px; vertical-align: top;">
                          <div style="width: 24px; height: 24px; background-color: #2563eb; border-radius: 50%; color: #ffffff; font-size: 12px; font-weight: 700; text-align: center; line-height: 24px;">3</div>
                        </td>
                        <td style="padding-left: 12px; color: #475569; font-size: 13px; line-height: 1.5;">
                          Parcourez les ecrans puis revenez remplir votre feedback
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- BLOC IDENTIFIANTS -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #eff6ff; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="color: #1e3a5f; font-size: 13px; font-weight: 600; margin: 0 0 8px;">
                      Identifiants de demo TerraGrow
                    </p>
                    <p style="color: #475569; font-size: 13px; line-height: 1.6; margin: 0;">
                      URL : <a href="https://preprod-conseil.terragrow.fr/login" style="color: #2563eb;">preprod-conseil.terragrow.fr/login</a><br>
                      Agriculteur : agri@demo.fr / 0000<br>
                      Conseiller : advisor@demo.fr / 0000
                    </p>
                  </td>
                </tr>
              </table>

              <!-- BOUTON CTA -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 8px 0 32px;">
                    <a href="{{ .SiteURL }}/dashboard.html"
                      style="display: inline-block; background-color: #2563eb; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px; line-height: 1;">
                      Acceder au dashboard
                    </a>
                  </td>
                </tr>
              </table>

              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">

              <p style="color: #94a3b8; font-size: 11px; line-height: 1.5; margin: 0; text-align: center;">
                Questions ? Contactez Pierre Wirenius (TerraGrow) via le groupe Teams dedie.
              </p>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding: 24px 40px; text-align: center;">
              <p style="color: #94a3b8; font-size: 11px; margin: 0;">
                TerraGrow SAS - Plateforme de test UAT
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 6. Structure JavaScript

### 6.1 js/supabase.js -- Client Supabase + helpers

```javascript
/**
 * Initialisation du client Supabase et helpers globaux
 */

// --- Configuration ---
const SUPABASE_URL = 'https://xxx.supabase.co';   // A remplacer
const SUPABASE_ANON_KEY = 'eyJ...';                // A remplacer

// --- Client ---
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Auth Helpers ---

/**
 * Retourne la session courante ou null
 * @returns {Promise<Object|null>} session
 */
async function getSession() { /* supabase.auth.getSession() */ }

/**
 * Retourne l'utilisateur courant ou null
 * @returns {Promise<Object|null>} user
 */
async function getUser() { /* supabase.auth.getUser() */ }

/**
 * Charge le profil complet depuis la table profiles
 * @param {string} userId - UUID de l'utilisateur
 * @returns {Promise<Object|null>} profile { id, first_name, last_name, email, phone, company, role, is_admin, created_at }
 */
async function getProfile(userId) {
  // supabase.from('profiles').select('*').eq('id', userId).single()
}

/**
 * Cree ou met a jour un profil
 * @param {Object} profileData - { id, first_name, last_name, email, phone, company, role }
 * @returns {Promise<Object>} result
 */
async function upsertProfile(profileData) {
  // supabase.from('profiles').upsert(profileData)
}

/**
 * Deconnexion
 * @returns {Promise<void>}
 */
async function signOut() {
  // supabase.auth.signOut()
  // redirect vers index.html
}

// --- Protection de page ---

/**
 * Verifie que l'utilisateur est connecte, sinon redirect
 * A appeler au chargement de chaque page protegee
 * @returns {Promise<Object>} user
 */
async function requireAuth() {
  // getSession() -> si null, redirect index.html
  // getUser() -> si null, redirect index.html
  // return user
}

/**
 * Verifie que l'utilisateur est admin
 * @returns {Promise<boolean>}
 */
async function requireAdmin() {
  // const user = await requireAuth()
  // const profile = await getProfile(user.id)
  // if (!profile.is_admin) redirect dashboard.html
  // return true
}

// --- UI Helpers ---

/**
 * Affiche un toast notification
 * @param {string} message
 * @param {'success'|'error'|'info'} type
 * @param {number} duration - en ms (defaut 3000)
 */
function showToast(message, type = 'success', duration = 3000) {
  // Cree l'element toast, l'ajoute au DOM, le supprime apres duration
}

/**
 * Genere les initiales a partir du prenom et nom
 * @param {string} firstName
 * @param {string} lastName
 * @returns {string} ex: "ML"
 */
function getInitials(firstName, lastName) {
  // return (firstName[0] + lastName[0]).toUpperCase()
}

/**
 * Remplit les elements du header profil
 * @param {Object} profile
 */
function renderProfileHeader(profile) {
  // Met a jour #user-avatar, #user-name, #user-meta
}

// --- Ecoute changement de session ---
supabase.auth.onAuthStateChange((event, session) => {
  // SIGNED_IN : verifier pending_profile dans localStorage, upsertProfile si present
  // SIGNED_OUT : redirect vers index.html
  // TOKEN_REFRESHED : rien
});
```

---

### 6.2 js/auth.js -- Logique auth (register, login, magic link)

```javascript
/**
 * Logique d'authentification : login, register, magic-link-sent
 * Ce fichier gere les 3 pages d'auth.
 */

// --- Detection de la page ---
// Utiliser location.pathname pour savoir sur quelle page on est

// ============================================================
// PAGE LOGIN (index.html)
// ============================================================

/**
 * Initialise la page de login
 * Verifie si une session existe deja et redirige si oui
 */
async function initLoginPage() {
  // const session = await getSession()
  // if (session) window.location.href = 'dashboard.html'
  // Sinon : attacher l'event listener au formulaire
}

/**
 * Handler du formulaire de login
 * @param {Event} e - submit event
 */
async function handleLogin(e) {
  // e.preventDefault()
  // const email = document.getElementById('email').value.trim()
  // Validation email
  // Desactiver le bouton, afficher loading
  // const { error } = await supabase.auth.signInWithOtp({ email })
  // Si erreur : afficher dans #login-error
  // Si succes : redirect vers magic-link-sent.html?email=encodeURIComponent(email)
}

// ============================================================
// PAGE REGISTER (register.html)
// ============================================================

/**
 * Initialise la page d'inscription
 */
async function initRegisterPage() {
  // Verifier si session existe deja
  // Attacher event listener au formulaire
}

/**
 * Handler du formulaire d'inscription
 * @param {Event} e - submit event
 */
async function handleRegister(e) {
  // e.preventDefault()
  // Collecter les champs : first_name, last_name, email, phone, company, role
  // Validation (champs required non vides, email valide)
  // Stocker dans localStorage : localStorage.setItem('pending_profile', JSON.stringify({...}))
  // const { error } = await supabase.auth.signInWithOtp({ email, options: { data: { first_name, last_name } } })
  // Si erreur : afficher dans #register-error
  // Si succes : redirect vers magic-link-sent.html?email=xxx&register=true
}

// ============================================================
// PAGE MAGIC LINK SENT (magic-link-sent.html)
// ============================================================

/**
 * Initialise la page de confirmation d'envoi du magic link
 */
function initMagicLinkPage() {
  // Recuperer email depuis URLSearchParams
  // Afficher dans #sent-email
  // Attacher event listener au bouton resend
  // Ecouter onAuthStateChange pour redirect auto
}

/**
 * Renvoyer le magic link
 */
async function handleResend() {
  // Recuperer email depuis URLSearchParams
  // Desactiver le bouton
  // supabase.auth.signInWithOtp({ email })
  // Afficher message de confirmation #resend-msg
  // Cooldown 60s : desactiver le bouton pendant 60 secondes avec compteur visible
}

/**
 * Cooldown de renvoi (60 secondes)
 * @param {HTMLElement} button
 */
function startResendCooldown(button) {
  // let seconds = 60
  // button.disabled = true
  // button.textContent = `Renvoyer dans ${seconds}s`
  // setInterval : decrementer, re-activer a 0
}

// --- Auto-init selon la page ---
document.addEventListener('DOMContentLoaded', () => {
  // if (location.pathname includes 'register') initRegisterPage()
  // else if (location.pathname includes 'magic-link') initMagicLinkPage()
  // else initLoginPage()
});
```

---

### 6.3 js/dashboard.js -- Logique dashboard

```javascript
/**
 * Logique du dashboard testeur
 * Charge les journeys, les feedbacks, calcule les KPIs, genere les cards
 */

// --- Variables globales ---
let currentUser = null;
let currentProfile = null;
let journeys = [];
let feedbacks = {};  // { journeyId: feedbackObject }

// ============================================================
// INITIALISATION
// ============================================================

/**
 * Point d'entree du dashboard
 */
async function initDashboard() {
  // 1. Verifier auth
  // currentUser = await requireAuth()
  // 2. Charger le profil
  // currentProfile = await getProfile(currentUser.id)
  // 3. Remplir le header
  // renderProfileHeader(currentProfile)
  // 4. Charger les journeys
  // journeys = await loadJourneys()
  // 5. Charger les feedbacks de l'utilisateur
  // feedbacks = await loadUserFeedbacks(currentUser.id)
  // 6. Calculer et afficher les KPIs
  // renderKPIs()
  // 7. Generer la grille de test cards
  // renderTestCards()
  // 8. Gerer le lien admin
  // if (currentProfile.is_admin) document.getElementById('admin-link').classList.remove('hidden')
  // 9. Attacher le listener de deconnexion
  // document.getElementById('logout-btn').addEventListener('click', signOut)
}

// ============================================================
// CHARGEMENT DES DONNEES
// ============================================================

/**
 * Charge les journeys depuis le fichier JSON statique
 * @returns {Promise<Array>} journeys
 */
async function loadJourneys() {
  // const response = await fetch('data/journeys.json')
  // const data = await response.json()
  // return data.journeys
}

/**
 * Charge tous les feedbacks de l'utilisateur depuis Supabase
 * @param {string} userId
 * @returns {Promise<Object>} feedbacks indexes par journey_id
 */
async function loadUserFeedbacks(userId) {
  // const { data } = await supabase.from('feedbacks').select('*').eq('user_id', userId)
  // return data.reduce((acc, fb) => { acc[fb.journey_id] = fb; return acc; }, {})
}

// ============================================================
// CALCUL DES KPIs
// ============================================================

/**
 * Calcule les KPIs et les injecte dans le DOM
 */
function renderKPIs() {
  // const total = journeys.length (23)
  // const completed = nombre de feedbacks avec status !== ''
  // const inProgress = feedbacks avec au moins 1 champ rempli mais pas tous
  // const avgRating = moyenne des notes (exclure les null)
  // Generer 4 KPI Cards dans #kpi-bar
}

/**
 * Determine le statut d'affichage d'une journey
 * @param {string} journeyId
 * @returns {'not_started'|'in_progress'|'completed'}
 */
function getJourneyDisplayStatus(journeyId) {
  // const fb = feedbacks[journeyId]
  // if (!fb) return 'not_started'
  // if (fb.status && fb.rating !== null) return 'completed'
  // return 'in_progress'
}

/**
 * Calcule le pourcentage de remplissage d'un feedback
 * @param {Object} feedback
 * @returns {number} 0-100
 */
function getFeedbackProgress(feedback) {
  // Compter les champs remplis : status, criteria_1-5, comment, rating, verbatim, suggestion
  // Total = 10 champs
  // return (filled / 10) * 100
}

// ============================================================
// RENDU DES CARDS
// ============================================================

/**
 * Genere toutes les test cards dans les grilles
 */
function renderTestCards() {
  // const agriGrid = document.getElementById('grid-agriculteur')
  // const consGrid = document.getElementById('grid-conseiller')
  // journeys.forEach(j => {
  //   const card = createTestCard(j)
  //   if (j.section === 'agriculteur') agriGrid.appendChild(card)
  //   else consGrid.appendChild(card)
  // })
}

/**
 * Cree un element DOM pour une test card
 * @param {Object} journey
 * @returns {HTMLElement}
 */
function createTestCard(journey) {
  // const status = getJourneyDisplayStatus(journey.id)
  // const progress = feedbacks[journey.id] ? getFeedbackProgress(feedbacks[journey.id]) : 0
  // Creer un <a> avec les classes appropriees
  // Retourner l'element
}

/**
 * Retourne les classes CSS pour un badge de statut
 * @param {string} status
 * @returns {Object} { classes: string, label: string }
 */
function getStatusBadge(status) {
  // switch(status) :
  // 'not_started' -> { classes: 'bg-slate-100 text-slate-600', label: 'Non commence' }
  // 'in_progress' -> { classes: 'bg-amber-50 text-amber-700', label: 'En cours' }
  // 'completed'   -> { classes: 'bg-lime-50 text-lime-700', label: 'Termine' }
}

// --- Init ---
document.addEventListener('DOMContentLoaded', initDashboard);
```

---

### 6.4 js/test.js -- Logique page test + formulaire feedback

```javascript
/**
 * Logique de la page de detail d'un test et du formulaire de feedback
 */

// --- Variables ---
let currentUser = null;
let currentProfile = null;
let currentJourney = null;
let currentFeedback = null;
let autoSaveTimer = null;
const AUTO_SAVE_DELAY = 2000; // 2 secondes

// ============================================================
// INITIALISATION
// ============================================================

/**
 * Point d'entree de la page test
 */
async function initTestPage() {
  // 1. Auth
  // currentUser = await requireAuth()
  // currentProfile = await getProfile(currentUser.id)
  // renderProfileHeader(currentProfile)

  // 2. Charger la journey depuis l'ID en query param
  // const journeyId = new URLSearchParams(location.search).get('id')
  // if (!journeyId) redirect dashboard.html
  // currentJourney = await loadJourney(journeyId)
  // if (!currentJourney) redirect dashboard.html

  // 3. Afficher les infos du test
  // renderTestDetails(currentJourney)

  // 4. Generer les 5 criteres
  // renderCriteria(currentJourney.criteria)

  // 5. Charger le feedback existant
  // currentFeedback = await loadFeedback(currentUser.id, journeyId)
  // if (currentFeedback) prefillForm(currentFeedback)

  // 6. Attacher les event listeners
  // attachFormListeners()
}

// ============================================================
// CHARGEMENT
// ============================================================

/**
 * Charge une journey specifique depuis le JSON
 * @param {string} id - ex: "A5"
 * @returns {Promise<Object|null>}
 */
async function loadJourney(id) {
  // const response = await fetch('data/journeys.json')
  // const data = await response.json()
  // return data.journeys.find(j => j.id === id) || null
}

/**
 * Charge un feedback existant pour un utilisateur et une journey
 * @param {string} userId
 * @param {string} journeyId
 * @returns {Promise<Object|null>}
 */
async function loadFeedback(userId, journeyId) {
  // const { data } = await supabase.from('feedbacks')
  //   .select('*')
  //   .eq('user_id', userId)
  //   .eq('journey_id', journeyId)
  //   .single()
  // return data
}

// ============================================================
// RENDU
// ============================================================

/**
 * Affiche les details du test dans le DOM
 * @param {Object} journey
 */
function renderTestDetails(journey) {
  // document.getElementById('test-id').textContent = journey.id
  // document.getElementById('test-title').textContent = journey.title
  // document.getElementById('test-userstory').textContent = journey.userStory
  // document.getElementById('test-screens').textContent = journey.screens
  // document.getElementById('test-objectif').textContent = journey.objectif
  // Badge section : agriculteur (bleu) ou conseiller (teal)
}

/**
 * Genere les 5 blocs de criteres dans le formulaire
 * @param {Array<string>} criteria - 5 labels de criteres
 */
function renderCriteria(criteria) {
  // const container = document.getElementById('criteria-container')
  // criteria.forEach((label, index) => {
  //   const num = index + 1
  //   const block = document.createElement('div')
  //   // Structure : flex avec label + select (OK / A ameliorer / Bloquant)
  //   // name="criteria_${num}" id="fb-criteria-${num}"
  //   container.appendChild(block)
  // })
}

/**
 * Pre-remplit le formulaire avec un feedback existant
 * @param {Object} feedback
 */
function prefillForm(feedback) {
  // document.getElementById('fb-status').value = feedback.status || ''
  // Pour chaque critere : document.getElementById(`fb-criteria-${i}`).value = feedback[`criteria_${i}`] || ''
  // document.getElementById('fb-comment').value = feedback.comment || ''
  // document.getElementById('fb-rating').value = feedback.rating ?? ''
  // document.getElementById('fb-verbatim').value = feedback.verbatim || ''
  // document.getElementById('fb-suggestion').value = feedback.suggestion || ''
  // Mettre a jour les etoiles visuelles
  // Mettre a jour les couleurs des selects criteres
}

// ============================================================
// ETOILES VISUELLES
// ============================================================

/**
 * Met a jour l'affichage des etoiles selon la note
 * @param {number} rating - 0 a 5
 */
function updateStarDisplay(rating) {
  // const container = document.getElementById('star-display')
  // container.innerHTML = ''
  // for (let i = 1; i <= 5; i++) {
  //   const star = i <= rating ? 'text-amber-400' : 'text-slate-200'
  //   // SVG etoile avec classe star
  // }
}

// ============================================================
// AUTO-SAVE & SAUVEGARDE
// ============================================================

/**
 * Attache les listeners pour l'auto-save et le submit
 */
function attachFormListeners() {
  // const form = document.getElementById('feedback-form')
  // form.addEventListener('submit', handleSave)

  // Tous les inputs/selects/textareas : addEventListener('input'/'change', triggerAutoSave)

  // Note : addEventListener('input', () => updateStarDisplay(parseInt(value)))

  // Criteres selects : addEventListener('change', updateCriteriaStyle)
}

/**
 * Declenche l'auto-save avec debounce
 */
function triggerAutoSave() {
  // clearTimeout(autoSaveTimer)
  // autoSaveTimer = setTimeout(async () => {
  //   await saveFeedback(false) // silent = true
  //   // Afficher l'indicateur "Sauvegarde automatique"
  // }, AUTO_SAVE_DELAY)
}

/**
 * Handler du bouton Sauvegarder
 * @param {Event} e
 */
async function handleSave(e) {
  // e.preventDefault()
  // clearTimeout(autoSaveTimer)
  // await saveFeedback(true) // showConfirmation = true
}

/**
 * Sauvegarde le feedback dans Supabase
 * @param {boolean} showConfirmation - afficher le message de succes
 */
async function saveFeedback(showConfirmation = false) {
  // Collecter toutes les valeurs du formulaire
  // const feedbackData = {
  //   user_id: currentUser.id,
  //   journey_id: currentJourney.id,
  //   status: document.getElementById('fb-status').value,
  //   criteria_1: document.getElementById('fb-criteria-1')?.value || null,
  //   criteria_2: document.getElementById('fb-criteria-2')?.value || null,
  //   criteria_3: document.getElementById('fb-criteria-3')?.value || null,
  //   criteria_4: document.getElementById('fb-criteria-4')?.value || null,
  //   criteria_5: document.getElementById('fb-criteria-5')?.value || null,
  //   comment: document.getElementById('fb-comment').value || null,
  //   rating: parseFloat(document.getElementById('fb-rating').value) || null,
  //   verbatim: document.getElementById('fb-verbatim').value || null,
  //   suggestion: document.getElementById('fb-suggestion').value || null,
  //   updated_at: new Date().toISOString()
  // }

  // Validation
  // if (feedbackData.rating !== null && (feedbackData.rating < 0 || feedbackData.rating > 5)) { error }

  // Desactiver le bouton save si showConfirmation
  // const { error } = await supabase.from('feedbacks').upsert(feedbackData, { onConflict: 'user_id,journey_id' })

  // Si erreur : showToast(error.message, 'error')
  // Si succes && showConfirmation :
  //   - Afficher #save-success pendant 3s
  //   - showToast('Feedback sauvegarde', 'success')
  // Si succes && !showConfirmation :
  //   - Afficher brievement l'indicateur #save-indicator
  // Reactiver le bouton save
}

/**
 * Met a jour le style visuel d'un select de critere selon sa valeur
 * @param {HTMLSelectElement} select
 */
function updateCriteriaStyle(select) {
  // Retirer les classes precedentes
  // switch(select.value) :
  // 'ok' -> select.classList.add('border-lime-400', 'bg-lime-50')
  // 'a_ameliorer' -> select.classList.add('border-amber-400', 'bg-amber-50')
  // 'bloquant' -> select.classList.add('border-red-400', 'bg-red-50')
  // '' -> classes par defaut
}

// --- Init ---
document.addEventListener('DOMContentLoaded', initTestPage);
```

---

### 6.5 js/admin.js -- Logique vue synthese

```javascript
/**
 * Logique de la vue synthese admin
 * Agrege les feedbacks de tous les testeurs
 */

// --- Variables ---
let allFeedbacks = [];
let allProfiles = [];
let journeys = [];

// ============================================================
// INITIALISATION
// ============================================================

/**
 * Point d'entree de la page admin
 */
async function initAdminPage() {
  // 1. Verifier admin
  // await requireAdmin()
  // const user = await getUser()
  // const profile = await getProfile(user.id)
  // renderProfileHeader(profile)

  // 2. Charger les donnees
  // journeys = await loadJourneys()
  // allFeedbacks = await loadAllFeedbacks()
  // allProfiles = await loadAllProfiles()

  // 3. Generer les vues
  // renderGlobalKPIs()
  // renderSynthesisTable()
  // renderVerbatims()
  // renderProblematicJourneys()
}

// ============================================================
// CHARGEMENT
// ============================================================

/**
 * Charge TOUS les feedbacks de tous les utilisateurs
 * @returns {Promise<Array>}
 */
async function loadAllFeedbacks() {
  // const { data } = await supabase.from('feedbacks').select('*')
  // return data || []
}

/**
 * Charge tous les profils
 * @returns {Promise<Array>}
 */
async function loadAllProfiles() {
  // const { data } = await supabase.from('profiles').select('id, first_name, last_name')
  // return data || []
}

// ============================================================
// AGREGATION
// ============================================================

/**
 * Agrege les feedbacks pour une journey donnee
 * @param {string} journeyId
 * @returns {Object} { okCount, warningCount, blockerCount, parcouruCount, partielCount, nonParcouruCount, avgRating, verbatims }
 */
function aggregateJourneyFeedbacks(journeyId) {
  // const jFeedbacks = allFeedbacks.filter(f => f.journey_id === journeyId)
  // Compter les criteres : pour chaque feedback, pour chaque criteria_1..5 :
  //   - 'ok' -> okCount++
  //   - 'a_ameliorer' -> warningCount++
  //   - 'bloquant' -> blockerCount++
  // Compter les statuts :
  //   - 'parcouru' -> parcouruCount++
  //   - 'partiel' -> partielCount++
  //   - 'non_parcouru' -> nonParcouruCount++
  // Calculer la note moyenne (exclure les null)
  // Collecter les verbatims non vides avec le nom du testeur
  // return { okCount, warningCount, blockerCount, parcouruCount, partielCount, nonParcouruCount, avgRating, verbatims }
}

// ============================================================
// RENDU
// ============================================================

/**
 * Genere les 4 KPIs globaux
 */
function renderGlobalKPIs() {
  // Taux de completion : (feedbacks avec status rempli) / (journeys.length * allProfiles.length) * 100
  // Score moyen : moyenne de tous les ratings non null
  // Testeurs actifs : nombre de profils ayant au moins 1 feedback
  // Nombre de bloquants : total des criteres 'bloquant' toutes journeys confondues
}

/**
 * Genere le tableau de synthese par journey
 */
function renderSynthesisTable() {
  // const tbody = document.getElementById('synthesis-body')
  // Inserer une ligne de separation "PORTAIL AGRICULTEUR" et "PORTAIL CONSEILLER"
  // Pour chaque journey : aggregateJourneyFeedbacks et creer une <tr>
}

/**
 * Genere la liste des verbatims groupes par journey
 */
function renderVerbatims() {
  // const container = document.getElementById('verbatims-list')
  // Pour chaque journey ayant des verbatims :
  //   - Titre du journey (ID + titre)
  //   - Pour chaque verbatim : nom du testeur + texte
}

/**
 * Genere la liste des journeys problematiques (triees par note ascendante)
 */
function renderProblematicJourneys() {
  // const container = document.getElementById('problematic-list')
  // Calculer la note moyenne par journey
  // Trier par note ascendante
  // Afficher les 5 premieres (ou toutes celles < 3/5)
  // Pour chaque : ID + titre + note + nombre de bloquants
}

// --- Init ---
document.addEventListener('DOMContentLoaded', initAdminPage);
```

---

## Annexes

### A. Schema Supabase (tables)

```sql
-- Table profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table feedbacks
CREATE TABLE feedbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  journey_id TEXT NOT NULL,
  status TEXT CHECK (status IN ('parcouru', 'partiel', 'non_parcouru', '')),
  criteria_1 TEXT CHECK (criteria_1 IN ('ok', 'a_ameliorer', 'bloquant', '')),
  criteria_2 TEXT CHECK (criteria_2 IN ('ok', 'a_ameliorer', 'bloquant', '')),
  criteria_3 TEXT CHECK (criteria_3 IN ('ok', 'a_ameliorer', 'bloquant', '')),
  criteria_4 TEXT CHECK (criteria_4 IN ('ok', 'a_ameliorer', 'bloquant', '')),
  criteria_5 TEXT CHECK (criteria_5 IN ('ok', 'a_ameliorer', 'bloquant', '')),
  comment TEXT,
  rating NUMERIC(2,1) CHECK (rating >= 0 AND rating <= 5),
  verbatim TEXT,
  suggestion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, journey_id)
);

-- RLS : chaque utilisateur ne voit que ses feedbacks
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own feedbacks"
  ON feedbacks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own feedbacks"
  ON feedbacks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own feedbacks"
  ON feedbacks FOR UPDATE
  USING (auth.uid() = user_id);

-- Admin peut lire tous les feedbacks
CREATE POLICY "Admins can view all feedbacks"
  ON feedbacks FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- RLS profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Admin peut lire tous les profils
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );
```

### B. Structure des fichiers (rappel)

```
/
├── index.html
├── register.html
├── magic-link-sent.html
├── dashboard.html
├── test.html
├── admin.html
├── js/
│   ├── supabase.js
│   ├── auth.js
│   ├── dashboard.js
│   ├── test.js
│   └── admin.js
├── assets/
│   └── logo.svg          (copie de /logo/terragrow-logo.svg)
└── data/
    └── journeys.json
```

### C. Couleurs de reference rapide

| Usage | Hex | Classe Tailwind |
|-------|-----|-----------------|
| Fond pages auth | #021130 | `bg-[#021130]` |
| Primary action | #2563eb | `bg-tg-primary` |
| Primary hover | #1d4ed8 | `bg-tg-primary-hover` |
| Succes | #84cc16 | `bg-tg-success` |
| Warning | #f59e0b | `bg-tg-warning` |
| Danger | #ef4444 | `bg-tg-danger` |
| Info | #14b8a6 | `bg-tg-info` |
| Fond principal | #ffffff | `bg-backgroundPrimary` |
| Fond secondaire | #f8fafc | `bg-backgroundSecondary` |
| Fond tertiaire | #f1f5f9 | `bg-backgroundTertiary` |
| Hover | #e2e8f0 | `bg-backgroundHover` |
| Erreur fond | #fef2f2 | `bg-backgroundRed` |
| Warning fond | #fffbeb | `bg-backgroundAmber` |
| Succes fond | #f7fee7 | `bg-backgroundLime` |
| Info fond | #f0fdfa | `bg-backgroundTeal` |
| Selection fond | #eff6ff | `bg-backgroundBlue` |
| Disabled fond | #f4f4f5 | `bg-backgroundZinc` |
