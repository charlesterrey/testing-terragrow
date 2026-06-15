-- ============================================================
-- ADD: campagne "Scénarios macro-économiques" (SA1-SA4, SC1-SC9)
-- Élargit la contrainte feedbacks.journey_id pour accepter le
-- préfixe optionnel "S" (scénarios) en plus des journeys A*/C*.
-- À exécuter dans l'éditeur SQL de Supabase AVANT que les testeurs
-- ne soumettent un feedback sur un journey SA*/SC*.
-- ============================================================

-- L'ancienne contrainte (migration initiale) n'autorisait que ^[AC][0-9]{1,2}$
ALTER TABLE public.feedbacks DROP CONSTRAINT IF EXISTS feedbacks_journey_id_check;

-- Nouvelle règle : préfixe S optionnel -> A1, C10, SA1, SC9 sont valides
ALTER TABLE public.feedbacks
  ADD CONSTRAINT feedbacks_journey_id_check
  CHECK (journey_id ~ '^S?[AC][0-9]{1,2}$');
