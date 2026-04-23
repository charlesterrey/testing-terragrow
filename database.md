# Database Specification - CFG Testing (TerraGrow UAT)

> Specification technique Supabase pour l'application de UAT Testing TerraGrow.
> Ce document sert de reference pour Claude Code lors de l'implementation.

---

## 1. Schema de la base de donnees

### 1.1 Enums PostgreSQL

| Enum | Valeurs | Description |
|------|---------|-------------|
| `user_role` | `tester`, `admin` | Role de l'utilisateur |
| `statut_realisation` | `non_commence`, `en_cours`, `termine`, `bloque` | Avancement du journey |
| `statut_critere` | `ok`, `a_ameliorer`, `bloquant` | Evaluation d'un critere |

### 1.2 Table `profiles`

Stocke les informations complementaires des utilisateurs (liee 1:1 a `auth.users`).

| Colonne | Type | Nullable | Default | Contraintes | Description |
|---------|------|----------|---------|-------------|-------------|
| `id` | `uuid` | NON | - | PK, FK `auth.users(id)` ON DELETE CASCADE | Identifiant utilisateur |
| `first_name` | `text` | NON | - | `CHECK (char_length(first_name) >= 1)` | Prenom |
| `last_name` | `text` | NON | - | `CHECK (char_length(last_name) >= 1)` | Nom |
| `email` | `text` | NON | - | UNIQUE | Email (copie de auth.users pour faciliter les requetes) |
| `phone` | `text` | OUI | `NULL` | - | Numero de telephone |
| `company` | `text` | OUI | `NULL` | - | Entreprise |
| `job_title` | `text` | OUI | `NULL` | - | Poste / fonction |
| `role` | `user_role` | NON | `'tester'` | - | Role dans l'application |
| `avatar_url` | `text` | OUI | `NULL` | - | URL de l'avatar (optionnel) |
| `created_at` | `timestamptz` | NON | `now()` | - | Date de creation |
| `updated_at` | `timestamptz` | NON | `now()` | - | Derniere modification |

**Index :**
- PK sur `id`
- UNIQUE sur `email`

### 1.3 Table `feedbacks`

Stocke les retours de chaque testeur sur chaque user journey.

| Colonne | Type | Nullable | Default | Contraintes | Description |
|---------|------|----------|---------|-------------|-------------|
| `id` | `uuid` | NON | `gen_random_uuid()` | PK | Identifiant du feedback |
| `user_id` | `uuid` | NON | - | FK `profiles(id)` ON DELETE CASCADE | Testeur ayant soumis le feedback |
| `journey_id` | `text` | NON | - | `CHECK (journey_id ~ '^[AC][0-9]{1,2}$')` | Identifiant du journey (A1-A13, C1-C10) |
| `statut_realisation` | `statut_realisation` | NON | `'non_commence'` | - | Avancement global du journey |
| `critere_navigation` | `statut_critere` | OUI | `NULL` | - | Critere : navigation / ergonomie |
| `critere_comprehension` | `statut_critere` | OUI | `NULL` | - | Critere : comprehension des labels |
| `critere_performance` | `statut_critere` | OUI | `NULL` | - | Critere : temps de chargement / fluidite |
| `critere_fonctionnel` | `statut_critere` | OUI | `NULL` | - | Critere : la fonctionnalite marche correctement |
| `critere_design` | `statut_critere` | OUI | `NULL` | - | Critere : qualite visuelle / coherence UI |
| `comment` | `text` | OUI | `NULL` | - | Commentaire general |
| `note` | `smallint` | OUI | `NULL` | `CHECK (note >= 0 AND note <= 5)` | Note globale de 0 a 5 |
| `verbatim` | `text` | OUI | `NULL` | - | Citation / verbatim du testeur |
| `suggestion` | `text` | OUI | `NULL` | - | Suggestion d'amelioration |
| `created_at` | `timestamptz` | NON | `now()` | - | Date de creation |
| `updated_at` | `timestamptz` | NON | `now()` | - | Derniere modification |

**Index :**
- PK sur `id`
- UNIQUE sur `(user_id, journey_id)` -- un seul feedback par testeur par journey
- INDEX sur `user_id`
- INDEX sur `journey_id`

---

## 2. Policies RLS (Row Level Security)

### 2.1 Table `profiles`

| Policy | Operation | Role | Condition |
|--------|-----------|------|-----------|
| `profiles_select_own` | SELECT | authenticated | `auth.uid() = id` |
| `profiles_select_admin` | SELECT | authenticated | Le user connecte a `role = 'admin'` dans profiles |
| `profiles_update_own` | UPDATE | authenticated | `auth.uid() = id` |
| `profiles_insert_own` | INSERT | authenticated | `auth.uid() = id` |

### 2.2 Table `feedbacks`

| Policy | Operation | Role | Condition |
|--------|-----------|------|-----------|
| `feedbacks_select_own` | SELECT | authenticated | `auth.uid() = user_id` |
| `feedbacks_select_admin` | SELECT | authenticated | Le user connecte a `role = 'admin'` dans profiles |
| `feedbacks_insert_own` | INSERT | authenticated | `auth.uid() = user_id` |
| `feedbacks_update_own` | UPDATE | authenticated | `auth.uid() = user_id` |
| `feedbacks_delete_own` | DELETE | authenticated | `auth.uid() = user_id` |

> L'admin peut lire tous les feedbacks mais ne peut PAS modifier ceux des autres testeurs.

---

## 3. SQL de migration

Copier-coller directement dans l'editeur SQL de Supabase (ou dans un fichier `supabase/migrations/`).

```sql
-- ============================================================
-- MIGRATION : CFG Testing - TerraGrow UAT
-- ============================================================

-- ------------------------------------------------------------
-- 1. ENUMS
-- ------------------------------------------------------------

CREATE TYPE public.user_role AS ENUM ('tester', 'admin');

CREATE TYPE public.statut_realisation AS ENUM (
  'non_commence',
  'en_cours',
  'termine',
  'bloque'
);

CREATE TYPE public.statut_critere AS ENUM (
  'ok',
  'a_ameliorer',
  'bloquant'
);

-- ------------------------------------------------------------
-- 2. TABLE profiles
-- ------------------------------------------------------------

CREATE TABLE public.profiles (
  id          uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name  text        NOT NULL CHECK (char_length(first_name) >= 1),
  last_name   text        NOT NULL CHECK (char_length(last_name) >= 1),
  email       text        NOT NULL UNIQUE,
  phone       text,
  company     text,
  job_title   text,
  role        public.user_role NOT NULL DEFAULT 'tester',
  avatar_url  text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.profiles IS 'Profils des testeurs UAT TerraGrow';

-- ------------------------------------------------------------
-- 3. TABLE feedbacks
-- ------------------------------------------------------------

CREATE TABLE public.feedbacks (
  id                    uuid              PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid              NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  journey_id            text              NOT NULL CHECK (journey_id ~ '^[AC][0-9]{1,2}$'),
  statut_realisation    public.statut_realisation NOT NULL DEFAULT 'non_commence',
  critere_navigation    public.statut_critere,
  critere_comprehension public.statut_critere,
  critere_performance   public.statut_critere,
  critere_fonctionnel   public.statut_critere,
  critere_design        public.statut_critere,
  comment               text,
  note                  smallint          CHECK (note >= 0 AND note <= 5),
  verbatim              text,
  suggestion            text,
  created_at            timestamptz       NOT NULL DEFAULT now(),
  updated_at            timestamptz       NOT NULL DEFAULT now(),

  UNIQUE (user_id, journey_id)
);

COMMENT ON TABLE public.feedbacks IS 'Feedbacks des testeurs sur chaque user journey';

-- Index supplementaires
CREATE INDEX idx_feedbacks_user_id    ON public.feedbacks (user_id);
CREATE INDEX idx_feedbacks_journey_id ON public.feedbacks (journey_id);

-- ------------------------------------------------------------
-- 4. TRIGGER : updated_at automatique
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_feedbacks_updated
  BEFORE UPDATE ON public.feedbacks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------
-- 5. TRIGGER : creation automatique du profil a l'inscription
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------
-- 6. ROW LEVEL SECURITY
-- ------------------------------------------------------------

-- Activer RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

-- ---- Fonction helper : verifier si l'utilisateur est admin ----

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ---- Policies sur profiles ----

CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "profiles_select_admin"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ---- Policies sur feedbacks ----

CREATE POLICY "feedbacks_select_own"
  ON public.feedbacks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "feedbacks_select_admin"
  ON public.feedbacks FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "feedbacks_insert_own"
  ON public.feedbacks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "feedbacks_update_own"
  ON public.feedbacks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "feedbacks_delete_own"
  ON public.feedbacks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------
-- 7. SEED : promouvoir Pierre Wirenius en admin
--    (a executer APRES sa premiere connexion magic link)
-- ------------------------------------------------------------

-- UPDATE public.profiles
-- SET role = 'admin'
-- WHERE email = 'pierre@wirenius.com';
```

---

## 4. Configuration Magic Link Supabase

### 4.1 Parametres du dashboard Supabase

Dans **Authentication > Providers > Email** :

| Parametre | Valeur |
|-----------|--------|
| Enable Email provider | `ON` |
| Enable Email Sign Up | `ON` |
| Confirm Email | `ON` (via magic link) |
| Enable Magic Link Sign In | `ON` |
| Secure Email Change | `ON` |
| Double confirm email changes | `OFF` (pas necessaire pour 7 users) |
| Minimum password length | N/A (pas de mot de passe) |
| Magic Link / OTP Expiry | `3600` (1 heure) |

Dans **Authentication > URL Configuration** :

| Parametre | Valeur |
|-----------|--------|
| Site URL | `https://cfg-testing.vercel.app` (ou l'URL de production) |
| Redirect URLs | `https://cfg-testing.vercel.app/auth/callback`, `http://localhost:3000/auth/callback` |

### 4.2 Template d'email Magic Link (francais, branding TerraGrow)

Dans **Authentication > Email Templates > Magic Link** :

**Subject :**
```
Connexion a l'espace de test TerraGrow - CFG Alsace
```

**Body (HTML) :**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f7f6; margin: 0; padding: 0; }
    .container { max-width: 520px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #2D6A4F, #40916C); padding: 32px 24px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; }
    .header p { color: #B7E4C7; margin: 8px 0 0; font-size: 14px; }
    .body { padding: 32px 24px; }
    .body p { color: #333333; font-size: 15px; line-height: 1.6; margin: 0 0 16px; }
    .btn { display: inline-block; background: #2D6A4F; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; margin: 8px 0 24px; }
    .btn:hover { background: #1B4332; }
    .footer { padding: 16px 24px; background: #f4f7f6; text-align: center; }
    .footer p { color: #888888; font-size: 12px; margin: 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>TerraGrow</h1>
      <p>Espace de test UAT - CFG Alsace</p>
    </div>
    <div class="body">
      <p>Bonjour,</p>
      <p>Cliquez sur le bouton ci-dessous pour vous connecter a l'espace de test TerraGrow. Ce lien est valable pendant 1 heure.</p>
      <p style="text-align: center;">
        <a href="{{ .ConfirmationURL }}" class="btn">Se connecter</a>
      </p>
      <p style="font-size: 13px; color: #666;">Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :</p>
      <p style="font-size: 12px; color: #888; word-break: break-all;">{{ .ConfirmationURL }}</p>
    </div>
    <div class="footer">
      <p>CFG Alsace &mdash; Phase de test TerraGrow</p>
      <p>Cet email a ete envoye automatiquement. Merci de ne pas y repondre.</p>
    </div>
  </div>
</body>
</html>
```

### 4.3 Configuration SMTP (optionnel mais recommande)

Par defaut, Supabase utilise son propre service d'email (limite a ~4 emails/heure en plan gratuit). Pour 7 testeurs, c'est suffisant. Si besoin de fiabilite accrue :

Dans **Project Settings > Authentication > SMTP Settings** :

| Parametre | Exemple avec Resend |
|-----------|---------------------|
| Enable Custom SMTP | `ON` |
| Sender email | `noreply@cfg-testing.fr` |
| Sender name | `TerraGrow - CFG Alsace` |
| Host | `smtp.resend.com` |
| Port | `465` |
| Username | `resend` |
| Password | `re_XXXXXXXXXXXX` (cle API Resend) |
| Minimum interval between emails | `60` secondes |

### 4.4 Redirect URL et callback cote front

Le front doit gerer le callback magic link :

```
/auth/callback  ->  recupere le token depuis l'URL, echange via supabase.auth.exchangeCodeForSession()
```

Apres authentification reussie, rediriger vers `/dashboard`.

---

## 5. Requetes utiles

### 5.1 Recuperer tous les feedbacks d'un testeur

```sql
-- Via le client Supabase (RLS applique automatiquement)
SELECT
  f.journey_id,
  f.statut_realisation,
  f.critere_navigation,
  f.critere_comprehension,
  f.critere_performance,
  f.critere_fonctionnel,
  f.critere_design,
  f.comment,
  f.note,
  f.verbatim,
  f.suggestion,
  f.updated_at
FROM feedbacks f
WHERE f.user_id = auth.uid()
ORDER BY f.journey_id;
```

**Cote JS (Supabase client) :**

```typescript
const { data, error } = await supabase
  .from('feedbacks')
  .select('*')
  .order('journey_id', { ascending: true });
// RLS filtre automatiquement sur le user connecte
```

### 5.2 Aggregation synthese admin

```sql
-- Compteurs par statut de critere (tous feedbacks, tous testeurs)
SELECT
  COUNT(*) FILTER (WHERE critere_navigation = 'ok')          AS nav_ok,
  COUNT(*) FILTER (WHERE critere_navigation = 'a_ameliorer') AS nav_warning,
  COUNT(*) FILTER (WHERE critere_navigation = 'bloquant')    AS nav_bloquant,

  COUNT(*) FILTER (WHERE critere_comprehension = 'ok')          AS comp_ok,
  COUNT(*) FILTER (WHERE critere_comprehension = 'a_ameliorer') AS comp_warning,
  COUNT(*) FILTER (WHERE critere_comprehension = 'bloquant')    AS comp_bloquant,

  COUNT(*) FILTER (WHERE critere_performance = 'ok')          AS perf_ok,
  COUNT(*) FILTER (WHERE critere_performance = 'a_ameliorer') AS perf_warning,
  COUNT(*) FILTER (WHERE critere_performance = 'bloquant')    AS perf_bloquant,

  COUNT(*) FILTER (WHERE critere_fonctionnel = 'ok')          AS fonc_ok,
  COUNT(*) FILTER (WHERE critere_fonctionnel = 'a_ameliorer') AS fonc_warning,
  COUNT(*) FILTER (WHERE critere_fonctionnel = 'bloquant')    AS fonc_bloquant,

  COUNT(*) FILTER (WHERE critere_design = 'ok')          AS design_ok,
  COUNT(*) FILTER (WHERE critere_design = 'a_ameliorer') AS design_warning,
  COUNT(*) FILTER (WHERE critere_design = 'bloquant')    AS design_bloquant,

  ROUND(AVG(note)::numeric, 2) AS note_moyenne,

  COUNT(*) FILTER (WHERE statut_realisation = 'termine') AS journeys_termines,
  COUNT(*) AS total_feedbacks

FROM feedbacks;
```

```sql
-- Synthese par journey (note moyenne, taux de completion, distribution criteres)
SELECT
  f.journey_id,
  COUNT(*)                                                     AS nb_feedbacks,
  COUNT(*) FILTER (WHERE statut_realisation = 'termine')       AS nb_termines,
  ROUND(AVG(note)::numeric, 2)                                 AS note_moyenne,
  COUNT(*) FILTER (WHERE statut_realisation = 'bloque')        AS nb_bloques,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE statut_realisation = 'termine')
    / NULLIF(COUNT(*), 0), 1
  )                                                            AS taux_completion
FROM feedbacks f
GROUP BY f.journey_id
ORDER BY f.journey_id;
```

```sql
-- Synthese par testeur (progression globale)
SELECT
  p.first_name,
  p.last_name,
  COUNT(f.id)                                                  AS nb_feedbacks,
  COUNT(f.id) FILTER (WHERE f.statut_realisation = 'termine')  AS nb_termines,
  ROUND(AVG(f.note)::numeric, 2)                               AS note_moyenne,
  ROUND(
    100.0 * COUNT(f.id) FILTER (WHERE f.statut_realisation = 'termine')
    / 23.0, 1
  )                                                            AS progression_pct
FROM profiles p
LEFT JOIN feedbacks f ON f.user_id = p.id
WHERE p.role = 'tester'
GROUP BY p.id, p.first_name, p.last_name
ORDER BY p.last_name;
```

### 5.3 Upsert d'un feedback

```sql
-- SQL pur
INSERT INTO feedbacks (
  user_id, journey_id, statut_realisation,
  critere_navigation, critere_comprehension, critere_performance,
  critere_fonctionnel, critere_design,
  comment, note, verbatim, suggestion
)
VALUES (
  :user_id, :journey_id, :statut_realisation,
  :critere_navigation, :critere_comprehension, :critere_performance,
  :critere_fonctionnel, :critere_design,
  :comment, :note, :verbatim, :suggestion
)
ON CONFLICT (user_id, journey_id)
DO UPDATE SET
  statut_realisation    = EXCLUDED.statut_realisation,
  critere_navigation    = EXCLUDED.critere_navigation,
  critere_comprehension = EXCLUDED.critere_comprehension,
  critere_performance   = EXCLUDED.critere_performance,
  critere_fonctionnel   = EXCLUDED.critere_fonctionnel,
  critere_design        = EXCLUDED.critere_design,
  comment               = EXCLUDED.comment,
  note                  = EXCLUDED.note,
  verbatim              = EXCLUDED.verbatim,
  suggestion            = EXCLUDED.suggestion;
-- updated_at est gere automatiquement par le trigger
```

**Cote JS (Supabase client) :**

```typescript
const { data, error } = await supabase
  .from('feedbacks')
  .upsert(
    {
      user_id: userId,         // auth.uid() cote front
      journey_id: journeyId,   // ex: "A1", "C3"
      statut_realisation: 'termine',
      critere_navigation: 'ok',
      critere_comprehension: 'a_ameliorer',
      critere_performance: 'ok',
      critere_fonctionnel: 'ok',
      critere_design: 'bloquant',
      comment: 'La navigation est fluide mais le design manque de coherence.',
      note: 3,
      verbatim: 'Je me suis perdu dans le menu lateral.',
      suggestion: 'Ajouter un fil d\'Ariane.'
    },
    { onConflict: 'user_id,journey_id' }
  )
  .select()
  .single();
```

---

## 6. Configuration Supabase projet

### 6.1 Variables d'environnement

```env
# .env.local (Next.js / Vite / etc.)
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Cote serveur uniquement (si besoin de service_role pour l'admin)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> **IMPORTANT :** Ne JAMAIS exposer `SUPABASE_SERVICE_ROLE_KEY` cote client.
> Le `ANON_KEY` est concu pour etre public (les RLS protegent les donnees).

### 6.2 Initialisation du client Supabase (TypeScript)

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

```typescript
// lib/supabase/server.ts (pour Server Components / API routes)
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createSupabaseServer() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}
```

### 6.3 Auth callback route (Next.js App Router)

```typescript
// app/auth/callback/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // En cas d'erreur, rediriger vers la page de login
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
```

### 6.4 Envoi du magic link (inscription + connexion)

```typescript
// Inscription avec metadata (first_name, last_name, etc.)
async function signUpWithMagicLink(formData: {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
}) {
  const { error } = await supabase.auth.signInWithOtp({
    email: formData.email,
    options: {
      data: {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone ?? null,
        company: formData.company ?? null,
        job_title: formData.jobTitle ?? null,
      },
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  return { error };
}

// Connexion simple (utilisateur existant)
async function signInWithMagicLink(email: string) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  return { error };
}
```

### 6.5 Mise a jour du profil apres premiere connexion

Le trigger `on_auth_user_created` cree un profil minimal. Si des champs supplementaires (phone, company, job_title) sont passes via `signInWithOtp`, il faut les completer cote front apres le callback :

```typescript
async function completeProfile(profile: {
  phone?: string;
  company?: string;
  jobTitle?: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from('profiles')
    .update({
      phone: profile.phone,
      company: profile.company,
      job_title: profile.jobTitle,
    })
    .eq('id', user.id);

  return { error };
}
```

### 6.6 Types TypeScript generes

```typescript
// types/database.ts
export type UserRole = 'tester' | 'admin';
export type StatutRealisation = 'non_commence' | 'en_cours' | 'termine' | 'bloque';
export type StatutCritere = 'ok' | 'a_ameliorer' | 'bloquant';

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  company: string | null;
  job_title: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Feedback {
  id: string;
  user_id: string;
  journey_id: string;
  statut_realisation: StatutRealisation;
  critere_navigation: StatutCritere | null;
  critere_comprehension: StatutCritere | null;
  critere_performance: StatutCritere | null;
  critere_fonctionnel: StatutCritere | null;
  critere_design: StatutCritere | null;
  comment: string | null;
  note: number | null;
  verbatim: string | null;
  suggestion: string | null;
  created_at: string;
  updated_at: string;
}
```

---

## 7. Notes d'implementation

### 7.1 Journeys en JSON statique (cote front)

Les 23 journeys ne sont **pas** stockes en base. Ils sont definis dans un fichier JSON cote front :

```typescript
// data/journeys.ts
export const JOURNEYS = [
  { id: 'A1',  category: 'agriculteur', title: '...' },
  { id: 'A2',  category: 'agriculteur', title: '...' },
  // ... A3 a A13
  { id: 'C1',  category: 'conseiller',  title: '...' },
  { id: 'C2',  category: 'conseiller',  title: '...' },
  // ... C3 a C10
] as const;
```

### 7.2 Promotion admin

Apres la premiere connexion de Pierre Wirenius, executer dans l'editeur SQL Supabase :

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'pierre@wirenius.com';
```

Alternativement, utiliser le service_role cote serveur (API route protegee).

### 7.3 Ordre de deploiement

1. Creer le projet Supabase
2. Executer la migration SQL (section 3)
3. Configurer les templates email (section 4.2)
4. Configurer les URL de redirection (section 4.1)
5. Recuperer `SUPABASE_URL` et `SUPABASE_ANON_KEY` depuis le dashboard
6. Deployer le front
7. Inviter les testeurs (ils recevront un magic link)
8. Promouvoir Pierre Wirenius en admin (section 7.2)
