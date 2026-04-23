# Sprint TODO - TerraGrow UAT Testing Platform

> **Projet** : TerraGrow UAT Testing App
> **Sprint** : Full build (Phase 0-4)
> **Deadline** : 30 avril 2026
> **Stack** : HTML + Tailwind CDN + JS vanilla + Supabase

---

## Phase 0 : Setup

### 0.1 - Creer la structure de fichiers du projet
- **Fichiers a creer** :
  - `index.html`
  - `register.html`
  - `magic-link-sent.html`
  - `dashboard.html`
  - `test.html`
  - `admin.html`
  - `css/styles.css`
  - `js/supabase.js`
  - `js/auth.js`
  - `js/dashboard.js`
  - `js/test.js`
  - `js/admin.js`
  - `data/journeys.json`
  - `assets/` (dossier pour le logo)
- **Dependances** : Aucune
- **Done quand** : L'arborescence existe avec des fichiers vides ou squelettes. La commande `ls -R` montre exactement la structure decrite dans `claude.md` section 6.
- **Complexite** : S

### 0.2 - Configurer le boilerplate HTML commun (head Tailwind + fonts)
- **Fichiers a modifier** : Tous les `.html`
- **Dependances** : 0.1
- **Details** :
  - Inclure le CDN Tailwind (`https://cdn.tailwindcss.com`) dans chaque `<head>`
  - Configurer `tailwind.config` inline avec les couleurs custom : `tg-dark` (#021130), `tg-primary` (#2563eb), `tg-primary-hover` (#1d4ed8), `tg-success` (#84cc16), `tg-warning` (#f59e0b), `tg-danger` (#ef4444), `tg-info` (#14b8a6), `backgroundPrimary` (#ffffff), `backgroundSecondary` (#f8fafc), `backgroundTertiary` (#f1f5f9), `backgroundHover` (#e2e8f0), `backgroundRed` (#fef2f2), `backgroundAmber` (#fffbeb), `backgroundLime` (#f7fee7), `backgroundTeal` (#f0fdfa), `backgroundBlue` (#eff6ff), `backgroundZinc` (#f4f4f5)
  - Font Inter via Google Fonts
  - CSS custom : scrollbar, `.transition-base`, `.animate-spin`
  - Inclure le Supabase JS SDK (`https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2`) avant `</body>`
  - Inclure `js/supabase.js` apres le SDK dans chaque page
- **Done quand** : Chaque page HTML s'ouvre dans le navigateur sans erreur console, Tailwind compile les classes custom, la font Inter est chargee.
- **Complexite** : S

### 0.3 - Creer le projet Supabase et executer la migration SQL
- **Fichiers a creer** : `supabase/migration.sql` (copie du SQL de `database.md` section 3)
- **Dependances** : Aucune (peut etre fait en parallele de 0.1)
- **Details** :
  - Creer un projet Supabase (via dashboard supabase.com)
  - Executer le SQL complet de migration dans l'editeur SQL Supabase :
    - 3 enums : `user_role`, `statut_realisation`, `statut_critere`
    - Table `profiles` (id uuid PK FK auth.users, first_name, last_name, email UNIQUE, phone, company, job_title, role user_role default 'tester', avatar_url, created_at, updated_at)
    - Table `feedbacks` (id uuid PK, user_id FK profiles, journey_id CHECK regex, statut_realisation, 5 criteres, comment, note CHECK 0-5, verbatim, suggestion, UNIQUE(user_id, journey_id))
    - Trigger `handle_updated_at` sur les deux tables
    - Trigger `handle_new_user` sur `auth.users` (creation auto du profil)
    - RLS active sur les deux tables
    - Helper `is_admin()` function
    - 9 policies RLS (4 pour profiles, 5 pour feedbacks) telles que specifiees dans `database.md` section 2
  - Recuperer `SUPABASE_URL` et `SUPABASE_ANON_KEY` depuis Project Settings > API
- **Done quand** : Les tables `profiles` et `feedbacks` existent dans Supabase, RLS est active, les policies sont en place. Un `SELECT * FROM profiles` retourne 0 lignes sans erreur.
- **Complexite** : M

### 0.4 - Configurer l'auth Supabase (Magic Link + URLs + templates email)
- **Fichiers a modifier** : Configuration dans le dashboard Supabase uniquement
- **Dependances** : 0.3
- **Details** :
  - Authentication > Providers > Email : Enable Magic Link Sign In = ON, Magic Link OTP Expiry = 3600
  - Authentication > URL Configuration : Site URL = URL de production, Redirect URLs = `{site}/auth/callback` + `http://localhost:3000/auth/callback`
  - Authentication > Email Templates > Magic Link : remplacer par le template HTML francais de `frontend.md` section 5.1 (header TerraGrow #021130, bouton CTA #2563eb, variable `{{ .ConfirmationURL }}`)
  - Authentication > Email Templates > Invite : remplacer par le template de `frontend.md` section 5.2
  - Optionnel : configurer SMTP custom (Resend) si besoin de fiabilite
- **Done quand** : Un test d'envoi de magic link via le dashboard Supabase envoie un email avec le bon template francais. L'email contient le bouton "Acceder a mon espace" et le lien de callback.
- **Complexite** : S

---

## Phase 1 : Auth

### 1.1 - Creer le client Supabase (`js/supabase.js`)
- **Fichier a creer** : `js/supabase.js`
- **Dependances** : 0.2, 0.3
- **Details** :
  - Initialiser le client avec `supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)`
  - Les credentials sont stockees en dur dans le fichier (l'anon key est safe cote client, les RLS protegent les donnees)
  - Exporter les fonctions helpers :
    - `getSession()` : retourne la session active ou null
    - `getUser()` : retourne l'utilisateur connecte ou null
    - `getProfile()` : fetch le profil depuis la table `profiles` pour le user connecte
    - `isAdmin()` : retourne true si `profile.role === 'admin'`
    - `requireAuth(redirectTo)` : verifie la session, redirige vers `index.html` si pas connecte
    - `requireAdmin()` : verifie la session + le role admin, redirige si non autorise
  - Ecouter `onAuthStateChange` globalement pour gerer les expirations de session
- **Done quand** : `supabase.js` est importable par tous les autres scripts. `getSession()` retourne null quand pas connecte. `requireAuth()` redirige correctement vers `index.html`.
- **Complexite** : M

### 1.2 - Page de login (`index.html` + logique dans `js/auth.js`)
- **Fichiers a modifier** : `index.html`, `js/auth.js`
- **Dependances** : 0.2, 1.1
- **Details** :
  - HTML : fond `bg-[#021130]`, centrage vertical/horizontal, formulaire avec champ email, bouton "Recevoir le Lien d'acces", lien vers register.html, logo TerraGrow en bas (structure exacte de `frontend.md` section 1.1)
  - JS dans `auth.js` :
    - Au chargement : verifier si session active via `getSession()`, si oui redirect vers `dashboard.html`
    - Au submit du form : `supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: origin + '/dashboard.html' } })`
    - Succes : redirect vers `magic-link-sent.html?email={email}`
    - Erreur : afficher le message dans `#login-error` (div cachee par defaut, affichee avec le texte de l'erreur)
    - Desactiver le bouton pendant la requete (disabled + opacity)
- **Done quand** : La page s'affiche correctement avec le fond dark, le formulaire est fonctionnel, la soumission envoie un magic link via Supabase et redirige vers magic-link-sent.html. Si session active, redirect automatique vers dashboard.
- **Complexite** : M

### 1.3 - Page d'inscription (`register.html` + logique dans `js/auth.js`)
- **Fichiers a modifier** : `register.html`, `js/auth.js`
- **Dependances** : 0.2, 1.1
- **Details** :
  - HTML : fond `bg-[#021130]`, formulaire avec 6 champs (Nom, Prenom en grid 2 cols, Email, Telephone, Entreprise, Poste), bouton "Recevoir le Lien d'acces", lien vers index.html, logo en bas (structure exacte de `frontend.md` section 1.2)
  - JS dans `auth.js` :
    - Au submit :
      1. Appeler `supabase.auth.signInWithOtp({ email, options: { data: { first_name, last_name }, emailRedirectTo: origin + '/dashboard.html' } })`
      2. Stocker les donnees de profil completes dans `localStorage` cle `pending_profile` : `{ first_name, last_name, email, phone, company, job_title }`
      3. Redirect vers `magic-link-sent.html?email={email}&register=true`
    - Gestion erreurs : email invalide, champs requis vides (Nom, Prenom, Email, Entreprise, Poste sont required)
- **Done quand** : Le formulaire d'inscription s'affiche, la soumission stocke le profil en localStorage, envoie le magic link, et redirige vers la page de confirmation. Les champs required empechent la soumission si vides.
- **Complexite** : M

### 1.4 - Page magic link envoye (`magic-link-sent.html` + logique dans `js/auth.js`)
- **Fichiers a modifier** : `magic-link-sent.html`, `js/auth.js`
- **Dependances** : 0.2, 1.1
- **Details** :
  - HTML : fond blanc, spinner CSS, titre "Lien d'Acces Envoye", email affiche dynamiquement, texte explicatif, bouton "Renvoyer le lien", lien retour login (structure exacte de `frontend.md` section 1.3)
  - JS dans `auth.js` :
    - Recuperer `email` depuis les query params de l'URL
    - Afficher l'email dans `#sent-email`
    - Bouton "Renvoyer" : re-appeler `signInWithOtp({ email })`, afficher message de confirmation, cooldown 60 secondes (bouton disabled + compteur degressif)
    - Ecouter `supabase.auth.onAuthStateChange` : si event === 'SIGNED_IN', alors :
      - Verifier si `localStorage.getItem('pending_profile')` existe
      - Si oui : faire un upsert sur `profiles` avec les donnees stockees, puis supprimer la cle localStorage
      - Redirect vers `dashboard.html`
- **Done quand** : La page affiche l'email du destinataire, le bouton renvoyer fonctionne avec un cooldown de 60s, et quand le magic link est clique dans l'email, la page detecte automatiquement la connexion, complete le profil si necessaire, et redirige vers le dashboard.
- **Complexite** : M

### 1.5 - Protection des routes (redirect si pas connecte)
- **Fichiers a modifier** : `js/supabase.js`, `dashboard.html`, `test.html`, `admin.html`
- **Dependances** : 1.1
- **Details** :
  - Dans `supabase.js` : la fonction `requireAuth()` verifie `getSession()`. Si null, redirige vers `index.html`.
  - Dans `supabase.js` : la fonction `requireAdmin()` verifie `getSession()` + fetch le profil + verifie `role === 'admin'`. Si non admin, redirige vers `dashboard.html`.
  - Appeler `requireAuth()` au chargement de `dashboard.html` et `test.html`
  - Appeler `requireAdmin()` au chargement de `admin.html`
  - Gerer la session expiree : `onAuthStateChange(SIGNED_OUT)` redirige vers `index.html`
- **Done quand** : Acceder a dashboard.html sans session redirige vers index.html. Acceder a admin.html sans etre admin redirige vers dashboard.html. Une session expiree redirige automatiquement vers index.html.
- **Complexite** : S

---

## Phase 2 : Core

### 2.1 - Creer le fichier `data/journeys.json`
- **Fichier a creer** : `data/journeys.json`
- **Dependances** : 0.1
- **Details** :
  - Copier le JSON complet de `frontend.md` section 3 : 23 journeys (A1-A13 + C1-C10)
  - Chaque journey contient : `id`, `section` (agriculteur/conseiller), `title`, `module`, `userStory`, `screens`, `objectif`, `criteria` (tableau de 5 strings)
  - Verifier que le JSON est valide (pas d'erreur de parsing)
- **Done quand** : `fetch('data/journeys.json')` retourne un objet avec 23 journeys. Chaque journey a les 7 champs requis. Le JSON passe un validateur.
- **Complexite** : S

### 2.2 - Dashboard testeur (`dashboard.html` + `js/dashboard.js`)
- **Fichiers a modifier** : `dashboard.html`, `js/dashboard.js`
- **Dependances** : 1.1, 1.5, 2.1
- **Details** :
  - HTML `dashboard.html` (structure exacte de `frontend.md` section 1.4) :
    - Header : logo TerraGrow + titre "TerraGrow Testing" a gauche, avatar initiales + nom + poste/entreprise + bouton deconnexion a droite
    - Titre page "Vos tests a realiser"
    - Barre de 4 KPIs en grid (Progression globale avec progress bar, Tests termines, Tests en cours, Note moyenne)
    - Section "Portail Agriculteur" avec grid de cards A1-A13
    - Section "Portail Conseiller" avec grid de cards C1-C10
    - Bloc "Identifiants de demo" (bg bleu, URL + credentials agri@demo.fr / advisor@demo.fr / 0000)
    - Lien admin cache par defaut (`#admin-link`)
  - JS `dashboard.js` :
    - `requireAuth()` au chargement
    - Fetch le profil via `getProfile()` -> remplir header (avatar initiales, nom, poste - entreprise)
    - Fetch `data/journeys.json`
    - Fetch les feedbacks du user : `supabase.from('feedbacks').select('*').order('journey_id')`
    - Calculer les KPIs :
      - Progression : nombre de feedbacks avec statut !== 'non_commence' / 23
      - Termines : nombre de feedbacks avec statut === 'termine'
      - En cours : nombre de feedbacks avec statut === 'en_cours'
      - Note moyenne : moyenne des notes non null
    - Generer les KPI cards dynamiquement (composant HTML de `frontend.md` section 4.1)
    - Generer les test cards pour chaque journey (composant HTML de `frontend.md` section 4.2) :
      - Badge statut : couleur selon le statut du feedback (Non commence = slate, En cours = amber, Termine = lime)
      - Progress bar : pourcentage de champs remplis dans le feedback
      - Clic -> `test.html?id={journeyId}`
    - Bouton deconnexion : `supabase.auth.signOut()` puis redirect vers `index.html`
    - Si `isAdmin()` : afficher `#admin-link`
- **Done quand** : Le dashboard affiche le profil utilisateur, les 4 KPIs avec des valeurs correctes, les 23 test cards reparties en 2 sections (Agriculteur 13 + Conseiller 10), les badges de statut refletent les feedbacks existants, le clic sur une card navigue vers test.html?id=X, la deconnexion fonctionne.
- **Complexite** : L

### 2.3 - Page de test/feedback (`test.html` + `js/test.js`)
- **Fichiers a modifier** : `test.html`, `js/test.js`
- **Dependances** : 1.1, 1.5, 2.1
- **Details** :
  - HTML `test.html` (structure exacte de `frontend.md` section 1.5) :
    - Header : bouton retour (fleche gauche), logo, titre "TerraGrow Testing", avatar + nom a droite
    - En-tete du test : badge section (Agriculteur bleu / Conseiller teal), ID (A5), titre, user story, bloc "Ecrans / flow a parcourir" (bg slate-50), bloc "Objectif de lecture" (bg lime)
    - Lien vers l'app : bloc bleu avec URL preprod + identifiants + bouton "Ouvrir TerraGrow" (target _blank)
    - Formulaire de feedback :
      1. Select "Statut de realisation" : Parcouru / Partiel / Non parcouru
      2. 5 criteres d'evaluation (generes dynamiquement depuis `journey.criteria`) : chacun avec label contextualise + select OK / A ameliorer / Bloquant (composant de `frontend.md` section 4.3)
      3. Textarea "Commentaire sur les criteres"
      4. Input number "Note globale /5" (min 0, max 5) + etoiles visuelles
      5. Textarea "Verbatim" (1-3 phrases)
      6. Textarea "Suggestion d'amelioration" (1-2 idees)
    - Barre d'actions : bouton "Retour au dashboard" (secondary) + indicateur auto-save + bouton "Sauvegarder" (primary)
    - Div de succes cachee "#save-success"
  - JS `test.js` :
    - `requireAuth()` au chargement
    - Recuperer `id` depuis les query params (`new URLSearchParams(window.location.search).get('id')`)
    - Fetch le journey depuis `data/journeys.json` et remplir tous les champs (titre, user story, screens, objectif, badge section)
    - Generer dynamiquement les 5 criteres depuis `journey.criteria` avec les bons labels
    - Fetch le feedback existant : `supabase.from('feedbacks').select('*').eq('journey_id', id).single()`
    - Si feedback existe : pre-remplir tous les champs du formulaire
    - Colorer les selects de criteres selon leur valeur (ok = lime, a_ameliorer = amber, bloquant = red) via event listener `change`
    - Mettre a jour les etoiles visuelles quand la note change
    - Auto-save : debounce de 2 secondes apres chaque modification (ecouter `input` et `change` sur tous les champs), appeler la fonction de sauvegarde, afficher l'indicateur "#save-indicator"
    - Bouton "Sauvegarder" : sauvegarde immediate avec :
      - Validation : note entre 0-5 si renseignee
      - Desactiver le bouton pendant la requete
      - Upsert : `supabase.from('feedbacks').upsert({ user_id, journey_id, statut_realisation, critere_navigation, critere_comprehension, critere_performance, critere_fonctionnel, critere_design, comment, note, verbatim, suggestion }, { onConflict: 'user_id,journey_id' })`
      - Mapping des 5 criteres du formulaire vers les colonnes DB : critere[0] -> critere_navigation, critere[1] -> critere_comprehension, critere[2] -> critere_performance, critere[3] -> critere_fonctionnel, critere[4] -> critere_design
      - Mapping du statut du formulaire : parcouru -> termine, partiel -> en_cours, non_parcouru -> non_commence
      - Succes : afficher "#save-success" pendant 3 secondes
      - Erreur : afficher un toast rouge
- **Done quand** : La page charge les donnees du journey, affiche les 5 criteres contextualises, pre-remplit le formulaire si un feedback existe, l'auto-save fonctionne avec debounce 2s, le bouton Sauvegarder fait un upsert correct dans Supabase, les selects changent de couleur, les etoiles se mettent a jour, le retour au dashboard fonctionne.
- **Complexite** : L

### 2.4 - Systeme de toast/notifications
- **Fichiers a modifier** : Tous les `.html`, `js/supabase.js` ou un fichier `js/utils.js`
- **Dependances** : 0.2
- **Details** :
  - Ajouter le HTML du toast dans toutes les pages protegees (dashboard, test, admin) : div fixe en bas a droite, cachee par defaut (composant de `frontend.md` section 4.5)
  - Fonction JS `showToast(message, type = 'success', duration = 3000)` :
    - Types : success (bg lime-800), error (bg red-600), info (bg slate-800)
    - Affiche le toast, le masque apres `duration` ms
    - Bouton de fermeture manuelle
  - Utiliser le toast dans auth.js (erreurs), test.js (sauvegarde), dashboard.js (deconnexion)
- **Done quand** : `showToast('Test', 'success')` affiche un toast vert en bas a droite pendant 3 secondes. Les erreurs reseau affichent un toast rouge.
- **Complexite** : S

---

## Phase 3 : Admin

### 3.1 - Vue synthese admin (`admin.html` + `js/admin.js`)
- **Fichiers a modifier** : `admin.html`, `js/admin.js`
- **Dependances** : 1.1, 1.5, 2.1, 2.3
- **Details** :
  - HTML `admin.html` (structure exacte de `frontend.md` section 1.6) :
    - Header : bouton retour vers dashboard, logo, titre "Synthese Admin", avatar + nom
    - 4 KPIs globaux en grid : Taux de completion global, Score moyen global, Nombre de testeurs actifs, Nombre de bloquants
    - Tableau de synthese par journey : colonnes ID, Journey, OK, A ameliorer, Bloquant, Parcouru, Partiel, Non parcouru, Note moy. (composant de `frontend.md` section 4.8)
    - Section Verbatims : verbatims groupes par journey
    - Section Journeys problematiques : fond rouge, tries par note ascendante
  - JS `admin.js` :
    - `requireAdmin()` au chargement (redirect vers dashboard si pas admin)
    - Charger le profil pour afficher le header
    - Charger TOUS les feedbacks : `supabase.from('feedbacks').select('*')` (RLS admin permet de tout voir)
    - Charger TOUS les profils testeurs : `supabase.from('profiles').select('first_name, last_name, id').eq('role', 'tester')`
    - Charger `data/journeys.json`
    - Agreger par journey :
      - Pour chaque journey, compter les feedbacks par statut de realisation (termine, en_cours, non_commence)
      - Pour chaque journey, compter les evaluations par critere (ok, a_ameliorer, bloquant) sur les 5 criteres cumules
      - Calculer la note moyenne par journey
      - Collecter les verbatims par journey
    - Calculer les KPIs globaux :
      - Taux de completion : nombre total de feedbacks termines / (23 * nombre de testeurs) * 100
      - Score moyen : moyenne de toutes les notes
      - Testeurs actifs : nombre de testeurs ayant au moins 1 feedback
      - Bloquants : nombre total de criteres evalues "bloquant"
    - Generer le tableau (une ligne par journey, badges colores pour OK/A ameliorer/Bloquant)
    - Generer les verbatims (groupes par journey, avec le nom du testeur)
    - Generer la section problematique (journeys tries par note ascendante, afficher les 5 pires)
- **Done quand** : La page admin affiche les 4 KPIs corrects, le tableau de synthese des 23 journeys avec les bons compteurs, les verbatims groupes par journey avec le nom du testeur, et les journeys les plus problematiques tries par note. L'acces est refuse aux non-admins.
- **Complexite** : L

### 3.2 - Promouvoir l'admin dans Supabase
- **Fichiers a modifier** : Aucun (action manuelle dans Supabase)
- **Dependances** : 0.3, que Pierre se soit connecte au moins une fois
- **Details** :
  - Apres la premiere connexion de Pierre Wirenius, executer dans l'editeur SQL Supabase :
    ```sql
    UPDATE public.profiles SET role = 'admin' WHERE email = 'pierre@wirenius.com';
    ```
  - Documenter cette etape dans un commentaire en haut de `admin.js`
- **Done quand** : Le profil de Pierre a `role = 'admin'`. Il peut acceder a `admin.html` et voir tous les feedbacks.
- **Complexite** : S

---

## Phase 4 : Polish

### 4.1 - Responsive check
- **Fichiers a modifier** : Tous les `.html`, `css/styles.css`
- **Dependances** : Toutes les phases 1-3
- **Details** :
  - Verifier chaque page en mode desktop (1280px+), tablette (768px), mobile (375px)
  - Les grids utilisent deja des breakpoints responsive (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`)
  - Verifier que :
    - Le header ne deborde pas sur mobile
    - Les KPI cards s'empilent correctement
    - Les test cards passent en 1 colonne sur mobile
    - Le formulaire de feedback est utilisable sur mobile
    - Le tableau admin scroll horizontalement sur petit ecran
    - Le grid Nom/Prenom du formulaire d'inscription reste en 2 colonnes sur mobile
  - Corriger les eventuels problemes de debordement ou de texte tronque
- **Done quand** : Toutes les pages sont navigables sans scroll horizontal involontaire sur mobile (375px). Les elements principaux (formulaires, cards, tableau) sont lisibles et utilisables.
- **Complexite** : M

### 4.2 - Gestion des erreurs et edge cases
- **Fichiers a modifier** : `js/auth.js`, `js/dashboard.js`, `js/test.js`, `js/admin.js`, `js/supabase.js`
- **Dependances** : Toutes les phases 1-3
- **Details** :
  - Implementer tous les edge cases de `frontend.md` section 2.5 :
    - Email invalide : validation HTML5 native `type="email"`
    - Email inexistant au login : message "Aucun compte avec cet email. Inscrivez-vous." + lien register
    - Session expiree : `onAuthStateChange(SIGNED_OUT)` -> redirect index.html avec `?msg=session_expired`
    - Magic link expire : page d'erreur avec bouton "Demander un nouveau lien"
    - Feedback deja saisi : pre-remplissage sans confirmation d'ecrasement
    - Perte de connexion reseau : toast rouge "Erreur de connexion. Vos modifications n'ont pas ete sauvegardees."
    - Note hors bornes : validation JS en plus du `min/max` HTML
    - Double-clic sur Sauvegarder : desactiver le bouton pendant la requete (flag `isSaving`)
    - Profil incomplet apres magic link : redirect vers register.html avec email pre-rempli si le profil n'a pas de `first_name`
    - Acces admin non autorise : redirect silencieux vers dashboard.html
  - Ajouter un try/catch autour de chaque appel Supabase
  - Afficher des etats de chargement (spinner) pendant les fetches
  - Gerer le cas ou `journeys.json` ne charge pas (fallback avec message d'erreur)
- **Done quand** : Chaque scenario d'erreur liste ci-dessus produit le comportement attendu. Aucune erreur non capturee dans la console. Les etats de chargement sont visibles.
- **Complexite** : M

### 4.3 - Test end-to-end manuel
- **Fichiers a modifier** : Aucun (verification manuelle)
- **Dependances** : 4.1, 4.2
- **Details** :
  - Tester le flow complet d'inscription :
    1. Aller sur register.html, remplir tous les champs, soumettre
    2. Verifier l'email recu (template correct, lien fonctionnel)
    3. Cliquer le magic link, verifier la redirect vers dashboard.html
    4. Verifier que le profil est complet dans Supabase (first_name, last_name, email, phone, company, job_title)
  - Tester le flow de login :
    1. Aller sur index.html, saisir l'email, soumettre
    2. Cliquer le magic link, verifier la redirect vers dashboard.html
  - Tester le flow de feedback :
    1. Cliquer sur un test (ex: A5), verifier l'affichage complet
    2. Remplir le formulaire, sauvegarder, verifier l'upsert dans Supabase
    3. Retourner au dashboard, verifier que le badge de statut est mis a jour
    4. Re-ouvrir le meme test, verifier le pre-remplissage
  - Tester la vue admin :
    1. Promouvoir un user en admin
    2. Verifier que le lien admin apparait sur le dashboard
    3. Ouvrir admin.html, verifier les KPIs et le tableau de synthese
  - Tester les edge cases :
    1. Acceder a dashboard.html sans session -> redirect login
    2. Acceder a admin.html sans etre admin -> redirect dashboard
    3. Remplir un feedback partiel, verifier l'auto-save
    4. Soumettre une note hors bornes (6, -1) -> validation
- **Done quand** : Tous les flows ci-dessus passent sans erreur. L'app est prete pour les 7 testeurs.
- **Complexite** : M

### 4.4 - Deploy (GitHub Pages ou Vercel)
- **Fichiers a creer** : `vercel.json` (optionnel) ou configuration GitHub Pages
- **Dependances** : 4.3
- **Details** :
  - Option A (Vercel recommandee) :
    - Creer un repo Git, push le code
    - Connecter le repo a Vercel
    - Deployer (pas de build step necessaire, c'est du HTML/JS statique)
    - Mettre a jour la Site URL dans Supabase avec l'URL Vercel
    - Mettre a jour les Redirect URLs dans Supabase
  - Option B (GitHub Pages) :
    - Activer GitHub Pages sur le repo (branche main, dossier root)
    - Mettre a jour les URLs Supabase
  - Dans les deux cas :
    - Verifier que le magic link redirige correctement vers le bon domaine
    - Verifier que les CORS Supabase autorisent le domaine de production
    - Tester un flow complet sur l'URL de production
- **Done quand** : L'app est accessible via une URL publique (ex: cfg-testing.vercel.app). Le magic link fonctionne de bout en bout sur cette URL. Les 7 testeurs peuvent s'inscrire et donner leur feedback.
- **Complexite** : S

---

## Recapitulatif des dependances

```
0.1 ──> 0.2 ──> 1.2, 1.3, 1.4, 2.4
0.1 ──> 2.1
0.3 ──> 0.4
0.3 ──> 1.1
1.1 ──> 1.2, 1.3, 1.4, 1.5
1.5 ──> 2.2, 2.3, 3.1
2.1 ──> 2.2, 2.3, 3.1
2.3 ──> 3.1
Phases 1-3 ──> 4.1, 4.2
4.1 + 4.2 ──> 4.3
4.3 ──> 4.4
```

## Ordre d'execution recommande

1. **En parallele** : 0.1 + 0.3
2. **Puis** : 0.2 (depend de 0.1), 0.4 (depend de 0.3), 2.1 (depend de 0.1)
3. **Puis** : 1.1 (depend de 0.2 + 0.3)
4. **En parallele** : 1.2, 1.3, 1.4, 2.4 (dependent de 1.1 et 0.2)
5. **Puis** : 1.5 (depend de 1.1)
6. **En parallele** : 2.2, 2.3 (dependent de 1.5 + 2.1)
7. **Puis** : 3.1 (depend de 2.3)
8. **Puis** : 3.2 (action manuelle, depend de 0.3)
9. **En parallele** : 4.1, 4.2 (dependent des phases 1-3)
10. **Puis** : 4.3 (depend de 4.1 + 4.2)
11. **Puis** : 4.4 (depend de 4.3)

## Estimations totales

| Complexite | Nombre | Effort estime |
|-----------|--------|---------------|
| S (Small) | 7 | ~30 min chacune |
| M (Medium) | 7 | ~1-2h chacune |
| L (Large) | 3 | ~2-4h chacune |
| **Total** | **17 taches** | **~20-30h** |
