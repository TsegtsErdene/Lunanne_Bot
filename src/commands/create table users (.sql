create table users (
  id text primary key,
  joined_at timestamptz default now()
);
create table lessons (
  id text primary key,
  module text,
  title text,
  description text
);
create table user_progress (
  user_id text references users(id),
  lesson_id text references lessons(id),
  completed boolean default false,
  completed_at timestamptz,
  primary key (user_id, lesson_id)
);
create table quiz_attempts (
  user_id text,
  lesson_id text,
  score int,
  taken_at timestamptz default now()
);
create table user_xp (
  user_id text primary key,
  xp int default 0,
  level int default 1
);
