# Prompts Claude Code -- TerraGrow UAT Testing Platform

> Ce document contient le prompt principal et les prompts de suivi pour piloter Claude Code dans le developpement de l'application.

---

## 1. Prompt principal (copier-coller au lancement)

```
Tu vas developper une application web complete : la plateforme de UAT Testing TerraGrow pour CFG Alsace. C'est une web app qui remplace un fichier Excel de retours de tests par une interface web elegante. Les 7 conseillers de gestion de CFG Alsace testent les interfaces du logiciel SaaS TerraGrow (jumeau economique de l'exploitation agricole) et enregistrent leur feedback structure (5 criteres, note, verbatim, suggestion) sur 23 user journeys. L'admin (Pierre Wirenius, TerraGrow) consulte une synthese agregee de tous les retours.

---

### Stack technique

- **Frontend** : HTML + Tailwind CSS (via CDN `https://cdn.tailwindcss.com`) + JavaScript vanilla (PAS de React, PAS de Vue, PAS de framework JS)
- **Backend** : Supabase (PostgreSQL + Auth magic link + RLS)
- **SDK** : Supabase JS SDK v2 via CDN (`https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2`)
- **Police** : Inter (Google Fonts)
- **Icones** : Heroicons (micro/mini/solid) inline SVG uniquement
- **Design System** : Marcassin DS -- OBLIGATOIRE, voir la spec design-system.md

---

### Fichiers de specification a lire AVANT de coder

Lis attentivement ces 4 fichiers dans l'ordre. Ils constituent ta source de verite absolue :

1. **`claude.md`** -- Specification produit complete : contexte, utilisateurs, fonctionnalites, 23 user journeys, charte visuelle, architecture technique, contraintes, hors perimetre.
2. **`database.md`** -- Specification database Supabase : schema (tables `profiles` et `feedbacks`, enums), migration SQL complete, policies RLS, configuration magic link, templates email, requetes utiles (upsert feedback, aggregation admin), types TypeScript.
3. **`frontend.md`** -- Specification front-end exhaustive : architecture des 6 pages HTML (index, register, magic-link-sent, dashboard, test, admin), structure HTML complete avec classes Tailwind, composants Marcassin utilises par page, logique JS par page, flows utilisateur complets (inscription, login, test/feedback, admin), edge cases et gestion d'erreurs, fichier journeys.json complet avec les 23 journeys.
4. **`design-system/design-system.md`** -- Design system Marcassin : tokens (couleurs, typo, spacing, shadows), composants Basics (Button, Select, Badge, Radio, Table, SideBar, Header), composants Complex (Cards, Modals, Charts), etats d'interaction, regles de developpement obligatoires.

---

### Structure des fichiers a creer

```
/
├── index.html              # Page de login (fond dark #021130)
├── register.html           # Page d'inscription (fond dark #021130)
├── magic-link-sent.html    # Confirmation d'envoi du magic link (fond clair)
├── dashboard.html          # Dashboard testeur (grille de tests + KPIs)
├── test.html               # Detail d'un test + formulaire feedback (dynamique via ?id=A5)
├── admin.html              # Vue synthese admin (tableau agrege)
├── css/
│   └── styles.css          # Custom styles (scrollbar, transitions, spinner)
├── js/
│   ├── supabase.js         # Client Supabase init + auth helpers
│   ├── auth.js             # Logique auth (register, login, magic link, callback)
│   ├── dashboard.js        # Logique dashboard (profil, KPIs, grille)
│   ├── test.js             # Logique page test (chargement journey, formulaire feedback, upsert, auto-save)
│   └── admin.js            # Logique vue synthese (aggregation, tableau, verbatims)
├── assets/
│   └── logo.svg            # Logo TerraGrow (placeholder)
└── data/
    └── journeys.json       # Les 23 user journeys (statique, copie exacte depuis frontend.md)
```

---

### Instructions de developpement -- Phase par phase

#### PHASE 0 : Setup et fondations
1. Creer la structure de fichiers complete listee ci-dessus.
2. Creer `js/supabase.js` avec l'initialisation du client Supabase (URL et anon key en placeholder `YOUR_SUPABASE_URL` / `YOUR_SUPABASE_ANON_KEY`).
3. Creer `data/journeys.json` avec les 23 journeys completes (copier depuis la spec frontend.md section 3).
4. Creer `css/styles.css` avec les styles custom (scrollbar, transitions, spinner).
5. Creer un `assets/logo.svg` placeholder simple (un carre vert avec "TG").
6. Configurer Tailwind via CDN dans chaque page HTML avec les couleurs custom : tg-dark (#021130), tg-primary (#2563eb), backgroundPrimary, backgroundSecondary, etc. (voir la config Tailwind dans frontend.md section 1.0).

#### PHASE 1 : Authentification
1. Implementer `index.html` (login) -- fond dark, formulaire email, bouton "Recevoir le Lien d'acces", lien vers register.html. Structure HTML exacte dans frontend.md section 1.1.
2. Implementer `register.html` (inscription) -- fond dark, 6 champs (Nom, Prenom, Email, Telephone, Entreprise, Poste), bouton submit. Structure exacte dans frontend.md section 1.2.
3. Implementer `magic-link-sent.html` -- fond clair, spinner, email affiche, bouton renvoyer avec cooldown 60s. Structure exacte dans frontend.md section 1.3.
4. Implementer `js/auth.js` avec :
   - Login : `supabase.auth.signInWithOtp({ email })` puis redirect vers magic-link-sent.html
   - Register : `signInWithOtp` avec metadata (first_name, last_name) + stocker profil en localStorage (`pending_profile`)
   - Callback : ecouter `onAuthStateChange(SIGNED_IN)`, recuperer `pending_profile` si present, upsert dans `profiles`, redirect vers dashboard.html
   - Renvoyer magic link avec cooldown 60 secondes
   - Detection session active : redirect auto vers dashboard.html si deja connecte
   - Gestion erreurs : email invalide, email deja pris, erreur reseau

#### PHASE 2 : Dashboard et page de test (le coeur de l'app)
1. Implementer `dashboard.html` -- header avec profil (avatar initiales, nom, poste), barre de 4 KPIs (progression, termines, en cours, note moyenne), grille de test cards separee en 2 sections (Agriculteur A1-A13, Conseiller C1-C10), bloc identifiants demo, lien admin conditionnel. Structure exacte dans frontend.md section 1.4.
2. Implementer `js/dashboard.js` :
   - Charger le profil depuis `profiles` (afficher avatar avec initiales, nom, poste+entreprise)
   - Charger journeys depuis `data/journeys.json`
   - Charger les feedbacks du user depuis `feedbacks` (RLS filtre automatiquement)
   - Calculer les 4 KPIs dynamiquement
   - Generer les test cards avec badge de statut (Non commence = gris, En cours = jaune, Termine = vert)
   - Clic sur une card : redirect vers `test.html?id=A5`
   - Si user est admin : afficher le lien vers admin.html
   - Bouton deconnexion : `supabase.auth.signOut()` puis redirect
3. Implementer `test.html` -- header avec retour, badge section, titre, user story, ecrans/flow, objectif de lecture, lien vers TerraGrow preprod, formulaire de feedback complet (statut, 5 criteres, commentaire, note /5 avec etoiles, verbatim, suggestion), boutons Sauvegarder et Retour. Structure exacte dans frontend.md section 1.5.
4. Implementer `js/test.js` :
   - Recuperer `id` depuis les query params
   - Charger la journey correspondante depuis journeys.json
   - Charger le feedback existant depuis Supabase (s'il existe)
   - Pre-remplir le formulaire avec les donnees existantes
   - Generer les 5 criteres dynamiquement (les labels sont dans journeys.json pour chaque journey)
   - Etoiles visuelles qui se mettent a jour quand on change la note
   - Auto-save avec debounce 2 secondes apres le dernier changement
   - Bouton "Sauvegarder" : upsert dans `feedbacks` avec `onConflict: 'user_id,journey_id'`
   - Validation : note entre 0 et 5, statut obligatoire pour sauvegarder
   - Desactiver le bouton pendant la requete pour eviter double-clic
   - Afficher "Feedback sauvegarde avec succes" pendant 3 secondes

#### PHASE 3 : Vue admin
1. Implementer `admin.html` -- header, 4 KPIs globaux (taux completion, score moyen, testeurs actifs, nombre bloquants), tableau de synthese par journey (colonnes: ID, Journey, OK, A ameliorer, Bloquant, Parcouru, Partiel, Non parcouru, Note moy.), section verbatims groupes par journey, section journeys problematiques. Structure exacte dans frontend.md section 1.6.
2. Implementer `js/admin.js` :
   - Verifier que le user est admin (`profiles.role === 'admin'`), sinon redirect vers dashboard.html
   - Charger TOUS les feedbacks (le RLS admin permet de tout lire)
   - Charger TOUS les profils testeurs
   - Agreger par journey : compter OK/A ameliorer/Bloquant sur les 5 criteres, compter les statuts, calculer note moyenne
   - Calculer les 4 KPIs globaux
   - Generer le tableau HTML
   - Trier les journeys problematiques par note ascendante
   - Afficher les verbatims avec le nom du testeur

#### PHASE 4 : Polish et edge cases
1. Protection des routes : chaque page protegee (dashboard, test, admin) verifie la session au chargement et redirige vers index.html si pas connecte.
2. Gestion de session expiree : `onAuthStateChange(SIGNED_OUT)` redirige vers index.html avec message.
3. Gestion erreur reseau : toast rouge en cas d'echec de sauvegarde.
4. Responsive : s'assurer que les pages sont lisibles sur desktop (Chrome, Edge, Firefox). Mobile acceptable mais pas prioritaire.
5. Accessibilite minimale : aria-labels sur les boutons d'action, labels sur tous les inputs.
6. Tester que l'upsert feedback fonctionne (creer un nouveau + modifier un existant).
7. Verifier le flow complet : inscription -> magic link -> dashboard -> test -> feedback -> admin.

---

### Contraintes critiques a respecter

1. **PAS de framework JS** : HTML + Tailwind CDN + JavaScript vanilla uniquement. Pas de build step, pas de bundler, pas de npm.
2. **Design System Marcassin** : utiliser les tokens de couleurs (backgroundPrimary, backgroundSecondary, etc.), les classes Tailwind definies dans le DS, les composants Button/Select/Badge/Card/Header. Ne PAS inventer de composants custom quand un composant Marcassin existe.
3. **Supabase RLS** : chaque testeur ne voit et ne modifie que ses propres feedbacks. L'admin peut lire tous les feedbacks mais ne peut pas les modifier. La migration SQL dans database.md contient toutes les policies -- les respecter.
4. **Magic Link uniquement** : pas de mot de passe. L'auth se fait exclusivement par magic link Supabase.
5. **Journeys en JSON statique** : les 23 journeys sont dans `data/journeys.json`, pas dans la base de donnees.
6. **Upsert pour les feedbacks** : un seul feedback par testeur par journey. Utiliser `upsert` avec `onConflict: 'user_id,journey_id'`.
7. **Fond dark (#021130)** pour les pages d'auth (login, register). Fond clair pour le reste de l'app.
8. **Police Inter** via Google Fonts.
9. **Heroicons inline SVG** pour toutes les icones.

---

### Commence maintenant

Commence par la Phase 0 (setup et fondations). Cree tous les fichiers de base, puis passe a la Phase 1 (auth). Avance phase par phase. A la fin de chaque phase, indique-moi ce qui a ete fait et ce qui reste. Ne saute pas de phase.
```

---

## 2. Prompts de suivi (un par phase)

### Prompt Phase 1 -- Auth

```
Continue avec la Phase 1 : Authentification.

Implemente les 3 pages d'auth (index.html, register.html, magic-link-sent.html) et le fichier js/auth.js. Suis exactement les structures HTML definies dans frontend.md sections 1.1, 1.2 et 1.3. 

Pour js/auth.js, implemente :
- Login via signInWithOtp({ email })
- Register via signInWithOtp avec metadata + stockage localStorage
- Callback onAuthStateChange pour finaliser le profil et rediriger
- Renvoi du magic link avec cooldown 60 secondes
- Detection de session active existante (redirect auto)

Teste mentalement le flow : register -> magic-link-sent -> clic lien -> dashboard. Verifie que tous les cas d'erreur sont geres (email invalide, deja pris, reseau).
```

### Prompt Phase 2 -- Core (Dashboard + Test)

```
Continue avec la Phase 2 : Dashboard et page de test.

C'est le coeur de l'app. Implemente dashboard.html, js/dashboard.js, test.html et js/test.js en suivant exactement les specs de frontend.md sections 1.4 et 1.5.

Points critiques :
- Le dashboard affiche l'avatar avec les initiales du user, les 4 KPIs calcules dynamiquement, et la grille de 23 test cards separees en Agriculteur (A1-A13) et Conseiller (C1-C10).
- Chaque card affiche un badge de statut colore selon le feedback existant (Non commence = gris, En cours = ambre, Termine = vert).
- La page test.html charge la journey depuis journeys.json et le feedback depuis Supabase, pre-remplit le formulaire si un feedback existe deja.
- Le formulaire de feedback utilise un upsert Supabase avec onConflict 'user_id,journey_id'.
- L'auto-save fonctionne avec un debounce de 2 secondes.
- Les 5 criteres sont generes dynamiquement avec les labels specifiques de chaque journey (depuis journeys.json).
- Les etoiles visuelles se mettent a jour quand on change la note.

Verifie que le clic sur une card du dashboard mene bien a test.html?id=XX et que le retour fonctionne.
```

### Prompt Phase 3 -- Admin

```
Continue avec la Phase 3 : Vue admin.

Implemente admin.html et js/admin.js en suivant frontend.md section 1.6.

L'admin doit voir :
- 4 KPIs globaux : taux de completion, score moyen, nombre de testeurs actifs, nombre de bloquants
- Un tableau de synthese avec une ligne par journey : colonnes OK / A ameliorer / Bloquant (agreges sur les 5 criteres x N testeurs), Parcouru / Partiel / Non parcouru, Note moyenne
- Les verbatims groupes par journey avec le nom du testeur
- Les journeys les plus problematiques tries par note ascendante

Points critiques :
- Verifier que le user est admin (profiles.role === 'admin'), sinon redirect silencieux vers dashboard.html
- Le RLS admin permet de lire tous les feedbacks et tous les profils
- L'aggregation doit compter correctement les criteres OK/A ameliorer/Bloquant sur les 5 champs (critere_navigation, critere_comprehension, critere_performance, critere_fonctionnel, critere_design)
- Utiliser les noms de criteres issus du schema database.md, pas ceux de claude.md (les noms different legerement)
```

### Prompt Phase 4 -- Polish

```
Continue avec la Phase 4 : Polish et edge cases.

Passe en revue toute l'application et corrige / ajoute :

1. **Protection des routes** : dashboard.html, test.html et admin.html doivent verifier la session au chargement. Si pas de session, redirect vers index.html.
2. **Session expiree** : ecouter onAuthStateChange(SIGNED_OUT) sur toutes les pages protegees et rediriger avec un message.
3. **Erreurs reseau** : afficher un toast rouge si une requete Supabase echoue (sauvegarde feedback, chargement profil, etc.).
4. **Double-clic** : desactiver le bouton Sauvegarder pendant la requete.
5. **Validation** : note entre 0 et 5, statut obligatoire pour sauvegarder, champs required sur le register.
6. **Responsive** : verifier que les grilles passent de 4 colonnes (xl) a 1 colonne (mobile) proprement.
7. **Accessibilite** : aria-label sur le bouton deconnexion, le bouton retour, les liens. Labels associes a tous les inputs.
8. **Coherence visuelle** : verifier que les couleurs Marcassin sont utilisees partout, que les shadows sont correctes, que les transitions sont presentes sur les elements interactifs.

Fais un dernier passage sur chaque fichier et confirme que le flow complet fonctionne de bout en bout.
```

---

## 3. Prompts de debug

### Debug 1 -- Magic link ne redirige pas

```
Le magic link Supabase ne redirige pas correctement apres le clic dans l'email. Le user clique sur le lien, la page s'ouvre mais reste bloquee ou redirige vers index.html au lieu de dashboard.html.

Verifie les points suivants dans l'ordre :
1. Dans js/supabase.js : le client est bien initialise avec createClient() et les bonnes URL/anon key.
2. Dans js/auth.js : onAuthStateChange ecoute bien l'evenement SIGNED_IN et redirige vers dashboard.html.
3. Le magic link Supabase redirige vers le Site URL configure dans le dashboard Supabase (Authentication > URL Configuration). Verifie que l'URL de redirect dans signInWithOtp({ emailRedirectTo }) correspond bien a l'URL ou l'app est deployee.
4. Si l'app est en localhost, il faut ajouter http://localhost:xxxx dans les Redirect URLs du dashboard Supabase.
5. Verifie que la page magic-link-sent.html ecoute bien onAuthStateChange et redirige automatiquement quand la session est creee (le user peut cliquer le magic link dans un autre onglet).
6. Teste : est-ce que supabase.auth.getSession() retourne bien une session apres le clic sur le magic link ?
```

### Debug 2 -- Feedbacks ne s'enregistrent pas

```
Les feedbacks ne s'enregistrent pas dans Supabase quand je clique "Sauvegarder" sur la page test.html. Le bouton semble fonctionner mais rien n'apparait dans la table feedbacks.

Verifie dans l'ordre :
1. Ouvre la console navigateur : y a-t-il une erreur Supabase ? Cherche "new row violates" ou "permission denied" ou "violates check constraint".
2. Verifie que le user_id est correct : il doit correspondre a auth.uid(). Teste avec `const { data: { user } } = await supabase.auth.getUser()` puis `user.id`.
3. Verifie que le journey_id respecte le format regex '^[AC][0-9]{1,2}$' (ex: "A5", "C10").
4. Verifie que les RLS sont en place : la policy feedbacks_insert_own exige que auth.uid() === user_id dans le WITH CHECK. Assure-toi que le champ user_id est bien passe dans l'objet upsert.
5. Verifie le upsert : le onConflict doit etre 'user_id,journey_id' (les deux colonnes de la contrainte UNIQUE).
6. Verifie que les valeurs des criteres correspondent aux enums PostgreSQL : 'ok', 'a_ameliorer', 'bloquant' (pas 'OK', pas 'ameliorer').
7. Verifie que la note est un integer entre 0 et 5 (pas un string, pas null si le CHECK est strict).
8. Teste un insert minimal dans la console : `await supabase.from('feedbacks').upsert({ user_id: user.id, journey_id: 'A1', statut_realisation: 'non_commence' }, { onConflict: 'user_id,journey_id' })` et regarde le retour.
```

### Debug 3 -- Vue admin ne montre pas les donnees

```
La vue admin (admin.html) ne montre aucune donnee ou des donnees incompletes. Le tableau de synthese est vide ou les KPIs affichent 0.

Verifie dans l'ordre :
1. Le user est-il bien admin ? Verifie dans Supabase : `SELECT role FROM profiles WHERE email = 'pierre@wirenius.com'`. Si role = 'tester', execute `UPDATE profiles SET role = 'admin' WHERE email = 'pierre@wirenius.com'`.
2. La policy RLS feedbacks_select_admin utilise la fonction is_admin(). Verifie que cette fonction existe et retourne true pour l'admin : `SELECT public.is_admin()` (en etant connecte avec le user admin).
3. Dans js/admin.js, la requete pour charger les feedbacks doit etre `supabase.from('feedbacks').select('*')` SANS filtre sur user_id (le RLS admin permet de tout lire).
4. Pareil pour les profils : `supabase.from('profiles').select('*')` doit retourner tous les profils grace a la policy profiles_select_admin.
5. Verifie que l'aggregation JS est correcte : les champs de criteres s'appellent critere_navigation, critere_comprehension, critere_performance, critere_fonctionnel, critere_design (pas critere_lisibilite, critere_logique, etc. -- les noms dans database.md different de ceux dans claude.md).
6. Verifie qu'il y a bien des feedbacks dans la base : `SELECT count(*) FROM feedbacks` dans l'editeur SQL Supabase.
```

### Debug 4 -- Profil non cree apres inscription

```
Apres l'inscription et le clic sur le magic link, le profil n'est pas cree dans la table profiles. Le dashboard affiche un profil vide ou redirige en boucle.

Verifie dans l'ordre :
1. Le trigger on_auth_user_created doit exister. Verifie : `SELECT * FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created'`. S'il n'existe pas, re-execute la migration SQL de database.md.
2. Le trigger appelle handle_new_user() qui lit raw_user_meta_data. Verifie que signInWithOtp passe bien les metadata : `options: { data: { first_name, last_name } }`.
3. Si le trigger cree le profil mais avec first_name et last_name vides, c'est que les metadata n'ont pas ete passees. Verifie le code dans js/auth.js pour le register.
4. Alternativement, si tu utilises le pattern localStorage (pending_profile) : verifie que apres le callback onAuthStateChange(SIGNED_IN), le code lit bien localStorage, fait le upsert dans profiles, puis supprime la cle.
5. La policy profiles_insert_own exige auth.uid() = id. Verifie que l'upsert passe bien l'id du user connecte.
6. Teste manuellement : apres le magic link, dans la console, `const { data } = await supabase.from('profiles').select('*')`. Si c'est vide, le profil n'a pas ete cree.
```
