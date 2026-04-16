-- ============================================================
-- ELEVATE X ENTERPRISE — Supabase Schema
-- Run this in: Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- CATEGORIES
create table if not exists public.categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  image_url text,
  created_at timestamp with time zone default now()
);

-- PRODUCTS
create table if not exists public.products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  description text,
  price numeric(10, 2) not null default 0,
  original_price numeric(10, 2),
  stock integer not null default 0,
  category_id uuid references public.categories(id) on delete set null,
  images text[] default '{}',
  brand text,
  specs jsonb,
  featured boolean default false,
  created_at timestamp with time zone default now()
);

-- PROFILES (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  email text,
  phone text,
  address text,
  is_admin boolean default false,
  created_at timestamp with time zone default now()
);

-- CART ITEMS
create table if not exists public.cart_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamp with time zone default now(),
  unique(user_id, product_id)
);

-- ORDERS
create table if not exists public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  total numeric(10, 2) not null default 0,
  shipping_address text,
  created_at timestamp with time zone default now()
);

-- ORDER ITEMS
create table if not exists public.order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete set null,
  quantity integer not null default 1,
  price numeric(10, 2) not null default 0,
  created_at timestamp with time zone default now()
);

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- DECREMENT STOCK FUNCTION (used at checkout)
-- ============================================================
create or replace function public.decrement_stock(product_id uuid, amount integer)
returns void as $$
begin
  update public.products
  set stock = greatest(0, stock - amount)
  where id = product_id;
end;
$$ language plpgsql security definer;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.profiles enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- CATEGORIES: anyone can read; only admins write
create policy "categories_select" on public.categories for select using (true);
create policy "categories_insert" on public.categories for insert with check (
  exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
);
create policy "categories_update" on public.categories for update using (
  exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
);
create policy "categories_delete" on public.categories for delete using (
  exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
);

-- PRODUCTS: anyone can read; only admins write
create policy "products_select" on public.products for select using (true);
create policy "products_insert" on public.products for insert with check (
  exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
);
create policy "products_update" on public.products for update using (
  exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
);
create policy "products_delete" on public.products for delete using (
  exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
);

-- PROFILES: users manage their own
create policy "profiles_select" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);
-- Admins can read all profiles
create policy "profiles_admin_select" on public.profiles for select using (
  exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
);

-- CART ITEMS: users manage their own cart
create policy "cart_items_select" on public.cart_items for select using (auth.uid() = user_id);
create policy "cart_items_insert" on public.cart_items for insert with check (auth.uid() = user_id);
create policy "cart_items_update" on public.cart_items for update using (auth.uid() = user_id);
create policy "cart_items_delete" on public.cart_items for delete using (auth.uid() = user_id);

-- ORDERS: users see their own; admins see all
create policy "orders_select_own" on public.orders for select using (auth.uid() = user_id);
create policy "orders_insert" on public.orders for insert with check (auth.uid() = user_id);
create policy "orders_admin_select" on public.orders for select using (
  exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
);
create policy "orders_admin_update" on public.orders for update using (
  exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
);

-- ORDER ITEMS
create policy "order_items_select_own" on public.order_items for select using (
  exists (select 1 from public.orders where id = order_id and user_id = auth.uid())
);
create policy "order_items_insert" on public.order_items for insert with check (
  exists (select 1 from public.orders where id = order_id and user_id = auth.uid())
);
create policy "order_items_admin_select" on public.order_items for select using (
  exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
);

-- ============================================================
-- SEED DATA — Sample categories and products
-- ============================================================

insert into public.categories (name, slug) values
  ('Laptops', 'laptops'),
  ('Desktops', 'desktops'),
  ('Components', 'components'),
  ('Storage', 'storage'),
  ('Accessories', 'accessories')
on conflict (slug) do nothing;

-- Sample products (using public Unsplash tech images)
insert into public.products (name, slug, description, price, original_price, stock, brand, featured, images, specs, category_id)
select
  'MacBook Pro 14" M3 Pro',
  'macbook-pro-14-m3-pro',
  'The most powerful MacBook Pro ever. Built for demanding workflows with the M3 Pro chip.',
  1999.00, 2199.00, 15, 'Apple', true,
  ARRAY['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80'],
  '{"Chip": "Apple M3 Pro", "RAM": "18GB", "Storage": "512GB SSD", "Display": "14.2-inch Liquid Retina XDR", "Battery": "Up to 18 hours"}'::jsonb,
  (select id from public.categories where slug = 'laptops')
where not exists (select 1 from public.products where slug = 'macbook-pro-14-m3-pro');

insert into public.products (name, slug, description, price, original_price, stock, brand, featured, images, specs, category_id)
select
  'Dell XPS 15 9530',
  'dell-xps-15-9530',
  'Brilliant OLED display meets exceptional performance in an ultra-thin design.',
  1749.00, 1999.00, 8, 'Dell', true,
  ARRAY['https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80'],
  '{"Processor": "Intel Core i7-13700H", "RAM": "16GB DDR5", "Storage": "512GB NVMe", "Display": "15.6-inch OLED 3.5K", "GPU": "NVIDIA RTX 4060"}'::jsonb,
  (select id from public.categories where slug = 'laptops')
where not exists (select 1 from public.products where slug = 'dell-xps-15-9530');

insert into public.products (name, slug, description, price, original_price, stock, brand, featured, images, specs, category_id)
select
  'ASUS ROG Strix G16 Gaming Laptop',
  'asus-rog-strix-g16',
  'Dominate the competition with this powerhouse gaming laptop featuring the latest NVIDIA GPU.',
  1499.00, 1699.00, 12, 'ASUS', true,
  ARRAY['https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&q=80'],
  '{"Processor": "AMD Ryzen 9 7945HX", "RAM": "16GB DDR5", "Storage": "1TB NVMe", "Display": "16-inch QHD 240Hz", "GPU": "NVIDIA RTX 4070"}'::jsonb,
  (select id from public.categories where slug = 'laptops')
where not exists (select 1 from public.products where slug = 'asus-rog-strix-g16');

insert into public.products (name, slug, description, price, original_price, stock, brand, featured, images, specs, category_id)
select
  'NVIDIA GeForce RTX 4090',
  'nvidia-rtx-4090',
  'The ultimate GPU for gaming and content creation. Unmatched performance at 4K and beyond.',
  1599.00, 1799.00, 5, 'NVIDIA', true,
  ARRAY['https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600&q=80'],
  '{"VRAM": "24GB GDDR6X", "Memory Bus": "384-bit", "TDP": "450W", "CUDA Cores": "16384", "Boost Clock": "2.52 GHz"}'::jsonb,
  (select id from public.categories where slug = 'components')
where not exists (select 1 from public.products where slug = 'nvidia-rtx-4090');

insert into public.products (name, slug, description, price, original_price, stock, brand, featured, images, specs, category_id)
select
  'Samsung 990 Pro 2TB NVMe SSD',
  'samsung-990-pro-2tb',
  'Blazing fast PCIe 4.0 SSD for professionals and enthusiasts.',
  199.00, 249.00, 30, 'Samsung', false,
  ARRAY['https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=600&q=80'],
  '{"Capacity": "2TB", "Interface": "PCIe 4.0 NVMe", "Read Speed": "7,450 MB/s", "Write Speed": "6,900 MB/s", "Form Factor": "M.2 2280"}'::jsonb,
  (select id from public.categories where slug = 'storage')
where not exists (select 1 from public.products where slug = 'samsung-990-pro-2tb');

insert into public.products (name, slug, description, price, original_price, stock, brand, featured, images, specs, category_id)
select
  'Corsair Vengeance 32GB DDR5-5600',
  'corsair-vengeance-32gb-ddr5',
  'High-performance DDR5 RAM for next-gen platforms.',
  129.00, 159.00, 25, 'Corsair', false,
  ARRAY['https://images.unsplash.com/photo-1591238372338-39ff3cb98048?w=600&q=80'],
  '{"Capacity": "32GB (2x16GB)", "Speed": "DDR5-5600", "CAS Latency": "CL36", "Voltage": "1.25V", "Form Factor": "DIMM"}'::jsonb,
  (select id from public.categories where slug = 'components')
where not exists (select 1 from public.products where slug = 'corsair-vengeance-32gb-ddr5');

insert into public.products (name, slug, description, price, original_price, stock, brand, featured, images, specs, category_id)
select
  'Logitech MX Master 3S Mouse',
  'logitech-mx-master-3s',
  'The ultimate productivity mouse with MagSpeed scrolling and 8K DPI.',
  99.00, 119.00, 50, 'Logitech', false,
  ARRAY['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=80'],
  '{"DPI": "200–8000", "Connectivity": "Bluetooth/USB", "Battery": "Up to 70 days", "Buttons": "7 buttons", "Weight": "141g"}'::jsonb,
  (select id from public.categories where slug = 'accessories')
where not exists (select 1 from public.products where slug = 'logitech-mx-master-3s');

insert into public.products (name, slug, description, price, original_price, stock, brand, featured, images, specs, category_id)
select
  'AMD Ryzen 9 7950X Processor',
  'amd-ryzen-9-7950x',
  'The world-class desktop CPU for content creators and professionals.',
  699.00, 799.00, 10, 'AMD', false,
  ARRAY['https://images.unsplash.com/photo-1555617981-dac3772603f0?w=600&q=80'],
  '{"Cores": "16 Cores / 32 Threads", "Base Clock": "4.5 GHz", "Boost Clock": "5.7 GHz", "Cache": "64MB L3", "TDP": "170W"}'::jsonb,
  (select id from public.categories where slug = 'components')
where not exists (select 1 from public.products where slug = 'amd-ryzen-9-7950x');
