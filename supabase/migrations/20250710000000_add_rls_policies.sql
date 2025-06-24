-- 2025-07-10: Voeg correcte RLS-policies toe voor student- en docent operaties

-- Zet RLS aan op tabellen
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_elements ENABLE ROW LEVEL SECURITY;

-- Policy: studenten mogen alleen hun eigen submissions bekijken, aanmaken en verwijderen
CREATE POLICY students_manage_own_submissions ON public.submissions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: docenten mogen alle submissions selecteren voor worksheets die zij bezitten
CREATE POLICY teachers_select_submissions ON public.submissions
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.worksheets w
    WHERE w.id = public.submissions.worksheet_id
      AND w.owner_id = auth.uid()
  ));

-- Policy: docenten mogen submission_elements updaten/beoordelen voor worksheets die zij bezitten
CREATE POLICY teachers_manage_submission_elements ON public.submission_elements
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM public.submissions s
      JOIN public.worksheets w ON w.id = s.worksheet_id
      WHERE s.id = public.submission_elements.submission_id
        AND w.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.submissions s
      JOIN public.worksheets w ON w.id = s.worksheet_id
      WHERE s.id = public.submission_elements.submission_id
        AND w.owner_id = auth.uid()
    )
  );
