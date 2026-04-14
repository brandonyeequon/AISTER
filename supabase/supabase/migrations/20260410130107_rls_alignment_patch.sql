-- =====================================================
-- AISTER / STER MVP - SAFE FULL RLS POLICIES
-- Skips any table that does not exist.
-- Matches current target matrix:
-- profiles           : select self+admin, update self+admin, no insert/delete
-- evaluations        : select involved+admin, insert evaluator, update evaluator, delete draft only
-- evaluation_details : select involved+admin, insert/update evaluator, no delete
-- lesson_plans       : select involved, insert/update/delete evaluator
-- observation_notes  : select involved, insert/update/delete evaluator
-- ster_scores        : select involved, insert/update evaluator, no delete
-- ai_feedback        : select involved, insert/update evaluator, no delete
-- STER ref tables    : public read only
-- =====================================================

-- profiles
do $$
begin
  if to_regclass('public.profiles') is not null then
    execute 'alter table public.profiles enable row level security';

    execute 'drop policy if exists "profiles_select_own" on public.profiles';
    execute $sql$
      create policy "profiles_select_own"
      on public.profiles
      for select
      to authenticated
      using (auth.uid() = user_id)
    $sql$;

    execute 'drop policy if exists "profiles_select_admin" on public.profiles';
    execute $sql$
      create policy "profiles_select_admin"
      on public.profiles
      for select
      to authenticated
      using (
        exists (
          select 1
          from public.profiles p
          join public.roles r on r.role_id = p.role_id
          where p.user_id = auth.uid()
            and r.role_name = 'admin'
        )
      )
    $sql$;

    execute 'drop policy if exists "profiles_update_own" on public.profiles';
    execute $sql$
      create policy "profiles_update_own"
      on public.profiles
      for update
      to authenticated
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id)
    $sql$;

    execute 'drop policy if exists "profiles_update_admin" on public.profiles';
    execute $sql$
      create policy "profiles_update_admin"
      on public.profiles
      for update
      to authenticated
      using (
        exists (
          select 1
          from public.profiles p
          join public.roles r on r.role_id = p.role_id
          where p.user_id = auth.uid()
            and r.role_name = 'admin'
        )
      )
      with check (
        exists (
          select 1
          from public.profiles p
          join public.roles r on r.role_id = p.role_id
          where p.user_id = auth.uid()
            and r.role_name = 'admin'
        )
      )
    $sql$;
  end if;
end $$;

-- evaluations
do $$
begin
  if to_regclass('public.evaluations') is not null then
    execute 'alter table public.evaluations enable row level security';

    execute 'drop policy if exists "evaluations_select_involved" on public.evaluations';
    execute $sql$
      create policy "evaluations_select_involved"
      on public.evaluations
      for select
      to authenticated
      using (
        auth.uid() = evaluator_id
        or auth.uid() = student_teacher_id
        or exists (
          select 1
          from public.profiles p
          join public.roles r on r.role_id = p.role_id
          where p.user_id = auth.uid()
            and r.role_name = 'admin'
        )
      )
    $sql$;

    execute 'drop policy if exists "evaluations_insert_evaluator" on public.evaluations';
    execute $sql$
      create policy "evaluations_insert_evaluator"
      on public.evaluations
      for insert
      to authenticated
      with check (auth.uid() = evaluator_id)
    $sql$;

    execute 'drop policy if exists "evaluations_update_evaluator" on public.evaluations';
    execute $sql$
      create policy "evaluations_update_evaluator"
      on public.evaluations
      for update
      to authenticated
      using (auth.uid() = evaluator_id)
      with check (auth.uid() = evaluator_id)
    $sql$;

    execute 'drop policy if exists "evaluations_delete_evaluator_draft" on public.evaluations';
    execute $sql$
      create policy "evaluations_delete_evaluator_draft"
      on public.evaluations
      for delete
      to authenticated
      using (
        auth.uid() = evaluator_id
        and status = ''draft''
      )
    $sql$;
  end if;
end $$;

-- evaluation_details
do $$
begin
  if to_regclass('public.evaluation_details') is not null then
    execute 'alter table public.evaluation_details enable row level security';

    execute 'drop policy if exists "eval_details_select_involved" on public.evaluation_details';
    execute $sql$
      create policy "eval_details_select_involved"
      on public.evaluation_details
      for select
      to authenticated
      using (
        exists (
          select 1
          from public.evaluations e
          where e.evaluation_id = evaluation_details.evaluation_id
            and (auth.uid() = e.evaluator_id or auth.uid() = e.student_teacher_id)
        )
        or exists (
          select 1
          from public.profiles p
          join public.roles r on r.role_id = p.role_id
          where p.user_id = auth.uid()
            and r.role_name = 'admin'
        )
      )
    $sql$;

    execute 'drop policy if exists "eval_details_insert_evaluator" on public.evaluation_details';
    execute $sql$
      create policy "eval_details_insert_evaluator"
      on public.evaluation_details
      for insert
      to authenticated
      with check (
        exists (
          select 1
          from public.evaluations e
          where e.evaluation_id = evaluation_details.evaluation_id
            and auth.uid() = e.evaluator_id
        )
      )
    $sql$;

    execute 'drop policy if exists "eval_details_update_evaluator" on public.evaluation_details';
    execute $sql$
      create policy "eval_details_update_evaluator"
      on public.evaluation_details
      for update
      to authenticated
      using (
        exists (
          select 1
          from public.evaluations e
          where e.evaluation_id = evaluation_details.evaluation_id
            and auth.uid() = e.evaluator_id
        )
      )
      with check (
        exists (
          select 1
          from public.evaluations e
          where e.evaluation_id = evaluation_details.evaluation_id
            and auth.uid() = e.evaluator_id
        )
      )
    $sql$;

    execute 'drop policy if exists "eval_details_delete_evaluator" on public.evaluation_details';
    execute 'drop policy if exists "eval_details_delete_admin" on public.evaluation_details';
  end if;
end $$;

-- lesson_plans
do $$
begin
  if to_regclass('public.lesson_plans') is not null then
    execute 'alter table public.lesson_plans enable row level security';

    execute 'drop policy if exists "lesson_plans_select_involved" on public.lesson_plans';
    execute $sql$
      create policy "lesson_plans_select_involved"
      on public.lesson_plans
      for select
      to authenticated
      using (
        exists (
          select 1
          from public.evaluations e
          where e.evaluation_id = lesson_plans.evaluation_id
            and (auth.uid() = e.evaluator_id or auth.uid() = e.student_teacher_id)
        )
      )
    $sql$;

    execute 'drop policy if exists "lesson_plans_insert_evaluator" on public.lesson_plans';
    execute $sql$
      create policy "lesson_plans_insert_evaluator"
      on public.lesson_plans
      for insert
      to authenticated
      with check (
        exists (
          select 1
          from public.evaluations e
          where e.evaluation_id = lesson_plans.evaluation_id
            and auth.uid() = e.evaluator_id
        )
      )
    $sql$;

    execute 'drop policy if exists "lesson_plans_update_evaluator" on public.lesson_plans';
    execute $sql$
      create policy "lesson_plans_update_evaluator"
      on public.lesson_plans
      for update
      to authenticated
      using (
        exists (
          select 1
          from public.evaluations e
          where e.evaluation_id = lesson_plans.evaluation_id
            and auth.uid() = e.evaluator_id
        )
      )
      with check (
        exists (
          select 1
          from public.evaluations e
          where e.evaluation_id = lesson_plans.evaluation_id
            and auth.uid() = e.evaluator_id
        )
      )
    $sql$;

    execute 'drop policy if exists "lesson_plans_delete_evaluator" on public.lesson_plans';
    execute $sql$
      create policy "lesson_plans_delete_evaluator"
      on public.lesson_plans
      for delete
      to authenticated
      using (
        exists (
          select 1
          from public.evaluations e
          where e.evaluation_id = lesson_plans.evaluation_id
            and auth.uid() = e.evaluator_id
        )
      )
    $sql$;
  end if;
end $$;

-- observation_notes
do $$
begin
  if to_regclass('public.observation_notes') is not null then
    execute 'alter table public.observation_notes enable row level security';

    execute 'drop policy if exists "obs_notes_select_involved" on public.observation_notes';
    execute $sql$
      create policy "obs_notes_select_involved"
      on public.observation_notes
      for select
      to authenticated
      using (
        exists (
          select 1
          from public.evaluations e
          where e.evaluation_id = observation_notes.evaluation_id
            and (auth.uid() = e.evaluator_id or auth.uid() = e.student_teacher_id)
        )
      )
    $sql$;

    execute 'drop policy if exists "obs_notes_insert_evaluator" on public.observation_notes';
    execute $sql$
      create policy "obs_notes_insert_evaluator"
      on public.observation_notes
      for insert
      to authenticated
      with check (
        exists (
          select 1
          from public.evaluations e
          where e.evaluation_id = observation_notes.evaluation_id
            and auth.uid() = e.evaluator_id
        )
      )
    $sql$;

    execute 'drop policy if exists "obs_notes_update_evaluator" on public.observation_notes';
    execute $sql$
      create policy "obs_notes_update_evaluator"
      on public.observation_notes
      for update
      to authenticated
      using (
        exists (
          select 1
          from public.evaluations e
          where e.evaluation_id = observation_notes.evaluation_id
            and auth.uid() = e.evaluator_id
        )
      )
      with check (
        exists (
          select 1
          from public.evaluations e
          where e.evaluation_id = observation_notes.evaluation_id
            and auth.uid() = e.evaluator_id
        )
      )
    $sql$;

    execute 'drop policy if exists "obs_notes_delete_evaluator" on public.observation_notes';
    execute $sql$
      create policy "obs_notes_delete_evaluator"
      on public.observation_notes
      for delete
      to authenticated
      using (
        exists (
          select 1
          from public.evaluations e
          where e.evaluation_id = observation_notes.evaluation_id
            and auth.uid() = e.evaluator_id
        )
      )
    $sql$;
  end if;
end $$;

-- ster_scores
do $$
begin
  if to_regclass('public.ster_scores') is not null then
    execute 'alter table public.ster_scores enable row level security';

    execute 'drop policy if exists "ster_scores_select_involved" on public.ster_scores';
    execute $sql$
      create policy "ster_scores_select_involved"
      on public.ster_scores
      for select
      to authenticated
      using (
        exists (
          select 1
          from public.evaluations e
          where e.evaluation_id = ster_scores.evaluation_id
            and (auth.uid() = e.evaluator_id or auth.uid() = e.student_teacher_id)
        )
      )
    $sql$;

    execute 'drop policy if exists "ster_scores_insert_evaluator" on public.ster_scores';
    execute $sql$
      create policy "ster_scores_insert_evaluator"
      on public.ster_scores
      for insert
      to authenticated
      with check (
        exists (
          select 1
          from public.evaluations e
          where e.evaluation_id = ster_scores.evaluation_id
            and auth.uid() = e.evaluator_id
        )
      )
    $sql$;

    execute 'drop policy if exists "ster_scores_update_evaluator" on public.ster_scores';
    execute $sql$
      create policy "ster_scores_update_evaluator"
      on public.ster_scores
      for update
      to authenticated
      using (
        exists (
          select 1
          from public.evaluations e
          where e.evaluation_id = ster_scores.evaluation_id
            and auth.uid() = e.evaluator_id
        )
      )
      with check (
        exists (
          select 1
          from public.evaluations e
          where e.evaluation_id = ster_scores.evaluation_id
            and auth.uid() = e.evaluator_id
        )
      )
    $sql$;

    execute 'drop policy if exists "ster_scores_delete_evaluator" on public.ster_scores';
    execute 'drop policy if exists "ster_scores_delete_admin" on public.ster_scores';
  end if;
end $$;

-- ai_feedback
do $$
begin
  if to_regclass('public.ai_feedback') is not null then
    execute 'alter table public.ai_feedback enable row level security';

    execute 'drop policy if exists "ai_feedback_select_involved" on public.ai_feedback';
    execute $sql$
      create policy "ai_feedback_select_involved"
      on public.ai_feedback
      for select
      to authenticated
      using (
        exists (
          select 1
          from public.evaluations e
          where e.evaluation_id = ai_feedback.evaluation_id
            and (auth.uid() = e.evaluator_id or auth.uid() = e.student_teacher_id)
        )
      )
    $sql$;

    execute 'drop policy if exists "ai_feedback_insert_evaluator" on public.ai_feedback';
    execute $sql$
      create policy "ai_feedback_insert_evaluator"
      on public.ai_feedback
      for insert
      to authenticated
      with check (
        exists (
          select 1
          from public.evaluations e
          where e.evaluation_id = ai_feedback.evaluation_id
            and auth.uid() = e.evaluator_id
        )
      )
    $sql$;

    execute 'drop policy if exists "ai_feedback_update_evaluator" on public.ai_feedback';
    execute $sql$
      create policy "ai_feedback_update_evaluator"
      on public.ai_feedback
      for update
      to authenticated
      using (
        exists (
          select 1
          from public.evaluations e
          where e.evaluation_id = ai_feedback.evaluation_id
            and auth.uid() = e.evaluator_id
        )
      )
      with check (
        exists (
          select 1
          from public.evaluations e
          where e.evaluation_id = ai_feedback.evaluation_id
            and auth.uid() = e.evaluator_id
        )
      )
    $sql$;

    execute 'drop policy if exists "ai_feedback_delete_evaluator" on public.ai_feedback';
    execute 'drop policy if exists "ai_feedback_delete_admin" on public.ai_feedback';
  end if;
end $$;

-- STER reference tables
do $$
begin
  if to_regclass('public.ster_categories') is not null then
    execute 'alter table public.ster_categories enable row level security';
    execute 'drop policy if exists "ster_categories_public_select" on public.ster_categories';
    execute $sql$
      create policy "ster_categories_public_select"
      on public.ster_categories
      for select
      to public
      using (true)
    $sql$;
  end if;

  if to_regclass('public.ster_competencies') is not null then
    execute 'alter table public.ster_competencies enable row level security';
    execute 'drop policy if exists "ster_competencies_public_select" on public.ster_competencies';
    execute $sql$
      create policy "ster_competencies_public_select"
      on public.ster_competencies
      for select
      to public
      using (true)
    $sql$;
  end if;

  if to_regclass('public.ster_rubric_levels') is not null then
    execute 'alter table public.ster_rubric_levels enable row level security';
    execute 'drop policy if exists "ster_rubric_levels_public_select" on public.ster_rubric_levels';
    execute $sql$
      create policy "ster_rubric_levels_public_select"
      on public.ster_rubric_levels
      for select
      to public
      using (true)
    $sql$;
  end if;
end $$;
