-- ============================================================
-- MIGRATION : CFG Testing - TerraGrow UAT
-- Fichier a executer dans l'editeur SQL de Supabase
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

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

-- Fonction helper : verifier si l'utilisateur est admin
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
-- WHERE email = 'pierre.w@terragrow.fr';
