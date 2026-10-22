-- Little Shrimp Canteen MVP schema draft.
-- Target: Supabase PostgreSQL. Run in a disposable/local project first.

create extension if not exists pgcrypto;
create schema if not exists private;

revoke all on schema private from public, anon, authenticated;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null
    check (
      display_name = trim(display_name)
      and char_length(display_name) between 1 and 20
    ),
  avatar_path text
    check (
      avatar_path is null
      or (
        avatar_path like 'users/' || id::text || '/avatar/%'
        and char_length(split_part(avatar_path, '/', 4)) > 0
        and position('..' in avatar_path) = 0
      )
    ),
  default_servings smallint not null default 2
    check (default_servings between 1 and 20),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.table_spaces (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete restrict,
  name text not null check (char_length(trim(name)) between 1 and 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (id, owner_id)
);

create table public.table_members (
  table_space_id uuid not null references public.table_spaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  primary key (table_space_id, user_id)
);

create index table_members_user_space_idx
  on public.table_members (user_id, table_space_id);

create or replace function private.is_table_member(target_table_space_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.table_members member
    where member.table_space_id = target_table_space_id
      and member.user_id = (select auth.uid())
  );
$$;

revoke all on function private.is_table_member(uuid) from public;
grant usage on schema private to authenticated;
grant execute on function private.is_table_member(uuid) to authenticated;

create table public.diner_profiles (
  id uuid primary key default gen_random_uuid(),
  table_space_id uuid not null references public.table_spaces(id) on delete cascade,
  display_name text not null check (char_length(trim(display_name)) between 1 and 40),
  avatar_path text
    check (
      avatar_path is null
      or (
        avatar_path like 'tables/' || table_space_id::text || '/diner-avatars/%'
        and char_length(split_part(avatar_path, '/', 4)) > 0
        and position('..' in avatar_path) = 0
      )
    ),
  preferences jsonb not null default '{}'::jsonb,
  claimed_by_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (table_space_id, id)
);

create index diner_profiles_active_idx
  on public.diner_profiles (table_space_id, created_at)
  where deleted_at is null;

create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  table_space_id uuid not null references public.table_spaces(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 160),
  description text,
  base_servings numeric(6,2) check (base_servings > 0),
  estimated_minutes integer check (estimated_minutes > 0),
  status text not null default 'want_to_make'
    check (status in ('want_to_make', 'liked', 'made', 'archived')),
  cover_media_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (table_space_id, id)
);

create index recipes_active_updated_idx
  on public.recipes (table_space_id, updated_at desc)
  where deleted_at is null;

create table public.recipe_ingredients (
  id uuid primary key default gen_random_uuid(),
  table_space_id uuid not null,
  recipe_id uuid not null,
  position integer not null check (position >= 0),
  original_text text not null,
  normalized_name text,
  quantity numeric(12,3) check (quantity >= 0),
  unit text,
  is_confirmed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (table_space_id, id),
  unique (recipe_id, position),
  foreign key (table_space_id, recipe_id)
    references public.recipes(table_space_id, id) on delete cascade
);

create index recipe_ingredients_recipe_idx
  on public.recipe_ingredients (table_space_id, recipe_id, position);

create table public.recipe_steps (
  id uuid primary key default gen_random_uuid(),
  table_space_id uuid not null,
  recipe_id uuid not null,
  position integer not null check (position >= 0),
  instruction text not null check (char_length(trim(instruction)) > 0),
  duration_minutes integer check (duration_minutes > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (recipe_id, position),
  foreign key (table_space_id, recipe_id)
    references public.recipes(table_space_id, id) on delete cascade
);

create index recipe_steps_recipe_idx
  on public.recipe_steps (table_space_id, recipe_id, position);

create table public.recipe_sources (
  id uuid primary key default gen_random_uuid(),
  table_space_id uuid not null,
  recipe_id uuid not null,
  source_type text not null check (source_type in ('screenshot', 'url', 'manual')),
  source_url text,
  author_name text,
  original_text text,
  created_at timestamptz not null default now(),
  foreign key (table_space_id, recipe_id)
    references public.recipes(table_space_id, id) on delete cascade
);

create index recipe_sources_recipe_idx
  on public.recipe_sources (table_space_id, recipe_id);

create table public.meal_plans (
  id uuid primary key default gen_random_uuid(),
  table_space_id uuid not null references public.table_spaces(id) on delete cascade,
  planned_for date not null,
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  servings numeric(6,2) not null check (servings > 0),
  appetite_factor numeric(4,2) not null default 1 check (appetite_factor > 0),
  status text not null default 'planned'
    check (status in ('draft', 'planned', 'shopping', 'cooking', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (table_space_id, id)
);

create index meal_plans_calendar_idx
  on public.meal_plans (table_space_id, planned_for, meal_type)
  where deleted_at is null;

create table public.meal_plan_recipes (
  id uuid primary key default gen_random_uuid(),
  table_space_id uuid not null,
  meal_plan_id uuid not null,
  recipe_id uuid not null,
  position integer not null default 0 check (position >= 0),
  servings numeric(6,2) check (servings > 0),
  adjustments jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (meal_plan_id, recipe_id),
  foreign key (table_space_id, meal_plan_id)
    references public.meal_plans(table_space_id, id) on delete cascade,
  foreign key (table_space_id, recipe_id)
    references public.recipes(table_space_id, id) on delete restrict
);

create index meal_plan_recipes_plan_idx
  on public.meal_plan_recipes (table_space_id, meal_plan_id, position);
create index meal_plan_recipes_recipe_idx
  on public.meal_plan_recipes (table_space_id, recipe_id);

create table public.shopping_trips (
  id uuid primary key default gen_random_uuid(),
  table_space_id uuid not null,
  meal_plan_id uuid,
  status text not null default 'draft'
    check (status in ('draft', 'active', 'completed', 'cancelled')),
  merchant text,
  payer_user_id uuid references auth.users(id) on delete set null,
  payer_diner_profile_id uuid,
  subtotal numeric(12,2) check (subtotal >= 0),
  discount numeric(12,2) check (discount >= 0),
  extra_fees numeric(12,2) check (extra_fees >= 0),
  paid_total numeric(12,2) check (paid_total >= 0),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (table_space_id, id),
  check (num_nonnulls(payer_user_id, payer_diner_profile_id) <= 1),
  foreign key (table_space_id, meal_plan_id)
    references public.meal_plans(table_space_id, id) on delete restrict,
  foreign key (table_space_id, payer_diner_profile_id)
    references public.diner_profiles(table_space_id, id) on delete restrict
);

create index shopping_trips_status_idx
  on public.shopping_trips (table_space_id, status, started_at desc);
create index shopping_trips_meal_plan_idx
  on public.shopping_trips (table_space_id, meal_plan_id)
  where meal_plan_id is not null;

create table public.shopping_items (
  id uuid primary key default gen_random_uuid(),
  table_space_id uuid not null,
  shopping_trip_id uuid not null,
  name text not null check (char_length(trim(name)) > 0),
  area text,
  position integer not null default 0 check (position >= 0),
  planned_quantity numeric(12,3) check (planned_quantity >= 0),
  planned_unit text,
  actual_quantity numeric(12,3) check (actual_quantity >= 0),
  actual_unit text,
  amount numeric(12,2) check (amount >= 0),
  status text not null default 'pending'
    check (status in ('pending', 'in_cart', 'at_home', 'not_found', 'skipped', 'settled')),
  is_unplanned boolean not null default false,
  note text,
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (table_space_id, id),
  foreign key (table_space_id, shopping_trip_id)
    references public.shopping_trips(table_space_id, id) on delete cascade
);

create index shopping_items_trip_order_idx
  on public.shopping_items (table_space_id, shopping_trip_id, area, position);

create table public.shopping_item_sources (
  table_space_id uuid not null,
  shopping_item_id uuid not null,
  recipe_ingredient_id uuid not null,
  contributed_quantity numeric(12,3) check (contributed_quantity >= 0),
  contributed_unit text,
  primary key (shopping_item_id, recipe_ingredient_id),
  foreign key (table_space_id, shopping_item_id)
    references public.shopping_items(table_space_id, id) on delete cascade,
  foreign key (table_space_id, recipe_ingredient_id)
    references public.recipe_ingredients(table_space_id, id) on delete restrict
);

create index shopping_item_sources_ingredient_idx
  on public.shopping_item_sources (table_space_id, recipe_ingredient_id);

create table public.cooking_records (
  id uuid primary key default gen_random_uuid(),
  table_space_id uuid not null,
  meal_plan_id uuid,
  recipe_id uuid not null,
  shopping_trip_id uuid,
  cooked_at timestamptz not null default now(),
  actual_servings numeric(6,2) check (actual_servings > 0),
  actual_minutes integer check (actual_minutes > 0),
  public_note text,
  next_time_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (table_space_id, id),
  foreign key (table_space_id, meal_plan_id)
    references public.meal_plans(table_space_id, id) on delete restrict,
  foreign key (table_space_id, recipe_id)
    references public.recipes(table_space_id, id) on delete restrict,
  foreign key (table_space_id, shopping_trip_id)
    references public.shopping_trips(table_space_id, id) on delete restrict
);

create index cooking_records_timeline_idx
  on public.cooking_records (table_space_id, cooked_at desc);
create index cooking_records_recipe_idx
  on public.cooking_records (table_space_id, recipe_id, cooked_at desc);

create table public.cooking_ratings (
  id uuid primary key default gen_random_uuid(),
  table_space_id uuid not null,
  cooking_record_id uuid not null,
  rater_user_id uuid references auth.users(id) on delete restrict,
  diner_profile_id uuid,
  rating numeric(2,1) not null check (rating between 1 and 5),
  remake_intent text check (remake_intent in ('yes', 'maybe', 'no')),
  note text,
  recorded_by_user_id uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (num_nonnulls(rater_user_id, diner_profile_id) = 1),
  foreign key (table_space_id, cooking_record_id)
    references public.cooking_records(table_space_id, id) on delete cascade,
  foreign key (table_space_id, diner_profile_id)
    references public.diner_profiles(table_space_id, id) on delete restrict
);

create unique index cooking_ratings_user_once_idx
  on public.cooking_ratings (cooking_record_id, rater_user_id)
  where rater_user_id is not null;
create unique index cooking_ratings_diner_once_idx
  on public.cooking_ratings (cooking_record_id, diner_profile_id)
  where diner_profile_id is not null;
create index cooking_ratings_record_idx
  on public.cooking_ratings (table_space_id, cooking_record_id);

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  table_space_id uuid not null references public.table_spaces(id) on delete cascade,
  bucket_id text not null default 'private-media',
  object_path text not null,
  media_type text not null check (media_type in ('recipe_source', 'recipe_cover', 'cooking_photo', 'receipt', 'share_card')),
  variant text not null default 'original'
    check (variant in ('original', 'thumbnail', 'processed', 'share')),
  mime_type text not null,
  byte_size bigint check (byte_size >= 0),
  width integer check (width > 0),
  height integer check (height > 0),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  check (
    object_path like 'tables/' || table_space_id::text || '/%'
    and char_length(split_part(object_path, '/', 4)) > 0
    and position('..' in object_path) = 0
  ),
  check (
    split_part(object_path, '/', 3) = case media_type
      when 'recipe_source' then 'recipe-sources'
      when 'recipe_cover' then 'recipe-covers'
      when 'cooking_photo' then 'cooking-photos'
      when 'receipt' then 'receipts'
      when 'share_card' then 'share-cards'
    end
  ),
  unique (bucket_id, object_path),
  unique (table_space_id, id)
);

create index media_assets_active_idx
  on public.media_assets (table_space_id, created_at desc)
  where deleted_at is null;

alter table public.recipes
  add constraint recipes_cover_media_fk
  foreign key (table_space_id, cover_media_id)
  references public.media_assets(table_space_id, id) on delete restrict;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_table_space_id uuid := gen_random_uuid();
  profile_display_name text;
  default_table_space_name text;
begin
  profile_display_name := left(
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      '小虾'
    ),
    20
  );
  default_table_space_name := left(profile_display_name || '的小虾食堂', 80);

  insert into public.profiles (id, display_name, default_servings)
  values (new.id, profile_display_name, 2);

  insert into public.table_spaces (id, owner_id, name)
  values (new_table_space_id, new.id, default_table_space_name);

  insert into public.table_members (table_space_id, user_id, role)
  values (new_table_space_id, new.id, 'owner');

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles', 'table_spaces', 'table_members', 'diner_profiles',
    'recipes', 'recipe_ingredients', 'recipe_steps', 'recipe_sources',
    'meal_plans', 'meal_plan_recipes', 'shopping_trips', 'shopping_items',
    'shopping_item_sources', 'cooking_records', 'cooking_ratings', 'media_assets'
  ]
  loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('alter table public.%I force row level security', table_name);
  end loop;
end $$;

create policy profiles_self_select on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id);
create policy profiles_self_update on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy table_spaces_member_select on public.table_spaces
  for select to authenticated
  using ((select private.is_table_member(id)));
create policy table_spaces_owner_update on public.table_spaces
  for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy table_members_self_select on public.table_members
  for select to authenticated
  using (user_id = (select auth.uid()));

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'recipe_ingredients', 'recipe_steps',
    'recipe_sources', 'meal_plans', 'meal_plan_recipes', 'shopping_trips',
    'shopping_items', 'shopping_item_sources', 'cooking_records'
  ]
  loop
    execute format(
      'create policy %I on public.%I for all to authenticated using ((select private.is_table_member(table_space_id))) with check ((select private.is_table_member(table_space_id)))',
      table_name || '_member_all',
      table_name
    );
  end loop;
end $$;

create policy diner_profiles_member_select on public.diner_profiles
  for select to authenticated
  using ((select private.is_table_member(table_space_id)));
create policy diner_profiles_member_insert on public.diner_profiles
  for insert to authenticated
  with check (
    (select private.is_table_member(table_space_id))
    and claimed_by_user_id is null
  );
create policy diner_profiles_member_update on public.diner_profiles
  for update to authenticated
  using (
    (select private.is_table_member(table_space_id))
    and claimed_by_user_id is null
  )
  with check (
    (select private.is_table_member(table_space_id))
    and claimed_by_user_id is null
  );

create policy recipes_member_select on public.recipes
  for select to authenticated
  using ((select private.is_table_member(table_space_id)));
create policy recipes_member_insert on public.recipes
  for insert to authenticated
  with check ((select private.is_table_member(table_space_id)));
create policy recipes_member_update on public.recipes
  for update to authenticated
  using ((select private.is_table_member(table_space_id)))
  with check ((select private.is_table_member(table_space_id)));

drop policy shopping_trips_member_all on public.shopping_trips;
create policy shopping_trips_member_all on public.shopping_trips
  for all to authenticated
  using ((select private.is_table_member(table_space_id)))
  with check (
    (select private.is_table_member(table_space_id))
    and (payer_user_id is null or payer_user_id = (select auth.uid()))
  );

create policy media_assets_member_select on public.media_assets
  for select to authenticated
  using ((select private.is_table_member(table_space_id)));
create policy media_assets_member_insert on public.media_assets
  for insert to authenticated
  with check (
    (select private.is_table_member(table_space_id))
    and created_by = (select auth.uid())
  );
create policy media_assets_member_update on public.media_assets
  for update to authenticated
  using (
    (select private.is_table_member(table_space_id))
    and created_by = (select auth.uid())
  )
  with check (
    (select private.is_table_member(table_space_id))
    and created_by = (select auth.uid())
  );

create policy cooking_ratings_member_select on public.cooking_ratings
  for select to authenticated
  using ((select private.is_table_member(table_space_id)));
create policy cooking_ratings_member_insert on public.cooking_ratings
  for insert to authenticated
  with check (
    (select private.is_table_member(table_space_id))
    and recorded_by_user_id = (select auth.uid())
    and (rater_user_id is null or rater_user_id = (select auth.uid()))
  );
create policy cooking_ratings_member_update on public.cooking_ratings
  for update to authenticated
  using (
    (select private.is_table_member(table_space_id))
    and recorded_by_user_id = (select auth.uid())
  )
  with check (
    (select private.is_table_member(table_space_id))
    and recorded_by_user_id = (select auth.uid())
    and (rater_user_id is null or rater_user_id = (select auth.uid()))
  );

revoke all on all tables in schema public from anon;
grant select, insert, update, delete on
  public.profiles,
  public.table_spaces,
  public.table_members,
  public.diner_profiles,
  public.recipes,
  public.recipe_ingredients,
  public.recipe_steps,
  public.recipe_sources,
  public.meal_plans,
  public.meal_plan_recipes,
  public.shopping_trips,
  public.shopping_items,
  public.shopping_item_sources,
  public.cooking_records,
  public.cooking_ratings,
  public.media_assets
to authenticated;

create or replace function private.storage_table_space_id(object_name text)
returns uuid
language plpgsql
immutable
set search_path = ''
as $$
begin
  if split_part(object_name, '/', 1) <> 'tables' then
    return null;
  end if;

  return split_part(object_name, '/', 2)::uuid;
exception when invalid_text_representation then
  return null;
end;
$$;

revoke all on function private.storage_table_space_id(text) from public;
grant execute on function private.storage_table_space_id(text) to authenticated;

create or replace function private.storage_user_id(object_name text)
returns uuid
language plpgsql
immutable
set search_path = ''
as $$
begin
  if split_part(object_name, '/', 1) <> 'users' then
    return null;
  end if;

  return split_part(object_name, '/', 2)::uuid;
exception when invalid_text_representation then
  return null;
end;
$$;

revoke all on function private.storage_user_id(text) from public;
grant execute on function private.storage_user_id(text) to authenticated;

insert into storage.buckets (id, name, public)
values ('private-media', 'private-media', false)
on conflict (id) do update set public = false;

create policy private_media_member_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'private-media'
    and (
      (
        split_part(name, '/', 1) = 'users'
        and split_part(name, '/', 3) = 'avatar'
        and (select private.storage_user_id(name)) = (select auth.uid())
      )
      or (
        split_part(name, '/', 1) = 'tables'
        and split_part(name, '/', 3) in (
          'diner-avatars', 'recipe-sources', 'recipe-covers',
          'cooking-photos', 'receipts', 'share-cards'
        )
        and (select private.is_table_member(private.storage_table_space_id(name)))
      )
    )
  );

create policy private_media_member_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'private-media'
    and owner_id = (select auth.uid()::text)
    and (
      (
        split_part(name, '/', 1) = 'users'
        and split_part(name, '/', 3) = 'avatar'
        and (select private.storage_user_id(name)) = (select auth.uid())
      )
      or (
        split_part(name, '/', 1) = 'tables'
        and split_part(name, '/', 3) in (
          'diner-avatars', 'recipe-sources', 'recipe-covers',
          'cooking-photos', 'receipts', 'share-cards'
        )
        and (select private.is_table_member(private.storage_table_space_id(name)))
      )
    )
  );

create policy private_media_owner_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'private-media'
    and owner_id = (select auth.uid()::text)
    and (
      (
        split_part(name, '/', 1) = 'users'
        and split_part(name, '/', 3) = 'avatar'
        and (select private.storage_user_id(name)) = (select auth.uid())
      )
      or (
        split_part(name, '/', 1) = 'tables'
        and split_part(name, '/', 3) in (
          'diner-avatars', 'recipe-sources', 'recipe-covers',
          'cooking-photos', 'receipts', 'share-cards'
        )
        and (select private.is_table_member(private.storage_table_space_id(name)))
      )
    )
  )
  with check (
    bucket_id = 'private-media'
    and owner_id = (select auth.uid()::text)
    and (
      (
        split_part(name, '/', 1) = 'users'
        and split_part(name, '/', 3) = 'avatar'
        and (select private.storage_user_id(name)) = (select auth.uid())
      )
      or (
        split_part(name, '/', 1) = 'tables'
        and split_part(name, '/', 3) in (
          'diner-avatars', 'recipe-sources', 'recipe-covers',
          'cooking-photos', 'receipts', 'share-cards'
        )
        and (select private.is_table_member(private.storage_table_space_id(name)))
      )
    )
  );

create policy private_media_owner_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'private-media'
    and owner_id = (select auth.uid()::text)
    and (
      (
        split_part(name, '/', 1) = 'users'
        and split_part(name, '/', 3) = 'avatar'
        and (select private.storage_user_id(name)) = (select auth.uid())
      )
      or (
        split_part(name, '/', 1) = 'tables'
        and split_part(name, '/', 3) in (
          'diner-avatars', 'recipe-sources', 'recipe-covers',
          'cooking-photos', 'receipts', 'share-cards'
        )
        and (select private.is_table_member(private.storage_table_space_id(name)))
      )
    )
  );

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles', 'table_spaces', 'diner_profiles', 'recipes',
    'recipe_ingredients', 'recipe_steps', 'meal_plans', 'shopping_trips',
    'shopping_items', 'cooking_records', 'cooking_ratings'
  ]
  loop
    execute format(
      'create trigger %I before update on public.%I for each row execute function private.set_updated_at()',
      table_name || '_set_updated_at',
      table_name
    );
  end loop;
end $$;
