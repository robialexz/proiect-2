-- Create projects table
create table projects (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  status text default 'active',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  created_by uuid references auth.users(id)
);

-- Enable RLS
alter table projects enable row level security;

-- Create policies
create policy "Users can view all projects"
  on projects for select
  using (true);

create policy "Users can create projects"
  on projects for insert
  using (auth.uid() = created_by);

create policy "Users can update their own projects"
  on projects for update
  using (auth.uid() = created_by);

create policy "Users can delete their own projects"
  on projects for delete
  using (auth.uid() = created_by);
