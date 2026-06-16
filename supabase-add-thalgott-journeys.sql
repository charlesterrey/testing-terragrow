-- ============================================================
-- ADD: campagne "Data Thalgott" (T1-T20)
-- Élargit la contrainte feedbacks.journey_id pour accepter le
-- préfixe "T" (Thalgott) en plus des journeys A* / C* existants.
-- À exécuter dans l'éditeur SQL de Supabase (SQL Editor) AVANT que
-- les testeurs ne soumettent un feedback sur un journey T*.
-- Ne touche aucune donnée existante : les feedbacks A*/C* déjà
-- enregistrés restent valides.
-- ============================================================

ALTER TABLE public.feedbacks DROP CONSTRAINT IF EXISTS feedbacks_journey_id_check;

-- A1-A17, C1-C19 (existants) + T1-T20 (Thalgott) sont tous valides
ALTER TABLE public.feedbacks
  ADD CONSTRAINT feedbacks_journey_id_check
  CHECK (journey_id ~ '^[ACT][0-9]{1,2}$');
