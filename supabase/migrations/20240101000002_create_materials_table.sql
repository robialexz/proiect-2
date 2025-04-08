-- Create materials table
create table materials (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  name text not null,
  dimension text,
  unit text not null,
  quantity numeric not null default 0,
  manufacturer text,
  category text,
  suplimentar numeric default 0,
  cost_per_unit numeric,
  supplier_id text,
  last_order_date date,
  min_stock_level numeric,
  max_stock_level numeric,
  location text,
  notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable RLS
alter table materials enable row level security;

-- Create policies
create policy "Users can view all materials"
  on materials for select
  using (true);

create policy "Users can create materials"
  on materials for insert
  using (true);

create policy "Users can update materials"
  on materials for update
  using (true);

create policy "Users can delete materials"
  on materials for delete
  using (true);

-- Create function to update the updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for updating the updated_at timestamp
create trigger on_materials_updated
  before update on materials
  for each row execute procedure public.handle_updated_at();
