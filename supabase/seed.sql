-- ============================================================
-- CLEAR EXISTING PLACEHOLDER DATA
-- ============================================================
delete from public.order_items;
delete from public.orders;
delete from public.cart_items;
delete from public.products;
delete from public.categories;

-- ============================================================
-- REAL CATEGORIES
-- ============================================================
insert into public.categories (id, name, slug, image_url) values
  ('11111111-0000-0000-0000-000000000001', 'Accessories',         'accessories',      'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=600&q=80'),
  ('11111111-0000-0000-0000-000000000002', 'Networking & Testing','networking',        'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=80'),
  ('11111111-0000-0000-0000-000000000003', 'Air Conditioning',    'air-conditioning',  'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&q=80');

-- ============================================================
-- REAL PRODUCTS
-- ============================================================

-- ACCESSORIES
insert into public.products (name, slug, description, price, stock, brand, featured, images, specs, category_id) values (
  'Gaming Keyboard – Hydra 10',
  'gaming-keyboard-hydra-10',
  'A versatile gaming keyboard with rechargeable built-in battery, Bluetooth, 2.4 GHz wireless via USB dongle, and satisfying mechanical switches — perfect for gaming and typing.',
  2999.00, 50, 'Hydra', true,
  ARRAY['https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=600&q=80','https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80'],
  '{"Connectivity": "Bluetooth / 2.4 GHz Wireless / Wired", "Switches": "Mechanical", "Battery": "Rechargeable built-in", "Receiver": "USB Dongle (2.4 GHz)"}'::jsonb,
  '11111111-0000-0000-0000-000000000001'
);

-- NETWORKING & TESTING
insert into public.products (name, slug, description, price, stock, brand, featured, images, specs, category_id) values (
  'B-NET OTDR',
  'b-net-otdr',
  'Compact fiber testing device with 24/22dB dynamic range and dual-wavelength support. Ideal for FTTx, LAN/WAN, and telecom fault detection, link certification, and performance analysis. Also includes RJ45 sequence test and wire tracker for copper cable checks.',
  45000.00, 10, 'B-NET', true,
  ARRAY['https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=80','https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&q=80'],
  '{"Dynamic Range": "24/22 dB", "Wavelengths": "1310 nm / 1550 nm", "Modes": "Auto / Expert OTDR Testing", "Features": "Event Map, Optical Power Meter, VFL-10KM, Laser Source, Loss Test, RJ45 Sequence Test, RJ45 Wire Tracker"}'::jsonb,
  '11111111-0000-0000-0000-000000000002'
);

insert into public.products (name, slug, description, price, stock, brand, featured, images, specs, category_id) values (
  'EXFO MaxTester 720C Access OTDR',
  'exfo-maxtester-720c',
  'Fully featured, entry-level OTDR optimized for multimode and singlemode access network construction and troubleshooting. Tablet-inspired design with a large 7-inch touchscreen and 12-hour battery life. Supports FTTx/PON, Data Centers, LAN/WAN, and Fronthaul/Backhaul applications.',
  185000.00, 5, 'EXFO', true,
  ARRAY['https://images.unsplash.com/photo-1601972599720-36938d4ecd31?w=600&q=80','https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=80'],
  '{"Display": "7-inch Touchscreen", "Battery Life": "12 Hours", "Fiber Types": "Multimode & Singlemode", "Applications": "FTTx/PON, Data Center, LAN/WAN, Fronthaul/Backhaul", "Security": "Tamper-Proof", "Testing": "Live Fiber Testing, High Dynamic Range"}'::jsonb,
  '11111111-0000-0000-0000-000000000002'
);

-- AIR CONDITIONING
insert into public.products (name, slug, description, price, stock, brand, featured, images, specs, category_id) values (
  'Split AC (Highwall)',
  'split-ac-highwall',
  'Energy-efficient split AC available in non-inverter and inverter options for optimal comfort in your office or home. Delivers enhanced cooling with reduced operating costs.',
  35000.00, 20, 'Elevate X', true,
  ARRAY['https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&q=80','https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80'],
  '{"Type": "Split AC (Highwall)", "Options": "Inverter / Non-Inverter", "Installation": "Wall Mounted", "Ideal For": "Home & Office"}'::jsonb,
  '11111111-0000-0000-0000-000000000003'
);

insert into public.products (name, slug, description, price, stock, brand, featured, images, specs, category_id) values (
  'Window AC',
  'window-ac',
  'Optimal for saving wall and floor space, window ACs are a smart choice for rooms where space is a priority. Easy installation and reliable cooling performance.',
  28000.00, 15, 'Elevate X', false,
  ARRAY['https://images.unsplash.com/photo-1635274605638-d44babc08a4f?w=600&q=80'],
  '{"Type": "Window AC", "Installation": "Window Frame", "Benefit": "Saves wall & floor space", "Ideal For": "Compact rooms"}'::jsonb,
  '11111111-0000-0000-0000-000000000003'
);

insert into public.products (name, slug, description, price, stock, brand, featured, images, specs, category_id) values (
  'Portable AC',
  'portable-ac',
  'No installation hassle. Move it anywhere you need comfort. Portable ACs offer better energy efficiency and complete freedom of placement.',
  32000.00, 12, 'Elevate X', false,
  ARRAY['https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&q=80'],
  '{"Type": "Portable AC", "Installation": "No Installation Required", "Mobility": "High", "Benefit": "Energy efficient, portable comfort"}'::jsonb,
  '11111111-0000-0000-0000-000000000003'
);

insert into public.products (name, slug, description, price, stock, brand, featured, images, specs, category_id) values (
  'Tower AC',
  'tower-ac',
  'Significant cooling capacity with better portability and a modern design. Ideal for larger rooms needing personalized air conditioning.',
  42000.00, 10, 'Elevate X', false,
  ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80'],
  '{"Type": "Tower AC", "Cooling Capacity": "High", "Portability": "Better than wall units", "Design": "Modern freestanding"}'::jsonb,
  '11111111-0000-0000-0000-000000000003'
);

insert into public.products (name, slug, description, price, stock, brand, featured, images, specs, category_id) values (
  'Cassette AC',
  'cassette-ac',
  'Enhance the aesthetics of your space while delivering superior comfort. Available in 4-way (purified air), 2-way (long/narrow spaces), 1-way (compact areas), and Round (precise wind direction) variants.',
  55000.00, 8, 'Elevate X', false,
  ARRAY['https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&q=80'],
  '{"Type": "Cassette AC", "Variants": "4-Way / 2-Way / 1-Way / Round", "Installation": "Ceiling Mounted", "Ideal For": "Commercial & Residential spaces"}'::jsonb,
  '11111111-0000-0000-0000-000000000003'
);

insert into public.products (name, slug, description, price, stock, brand, featured, images, specs, category_id) values (
  'Ductable AC',
  'ductable-ac',
  'Ingeniously developed ductable technology for optimal temperature control, reduced humidity, and energy-efficient air conditioning across large spaces.',
  75000.00, 6, 'Elevate X', false,
  ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80'],
  '{"Type": "Ductable AC", "Coverage": "Large spaces", "Benefits": "Optimal temperature control, reduced humidity, energy efficient"}'::jsonb,
  '11111111-0000-0000-0000-000000000003'
);

insert into public.products (name, slug, description, price, stock, brand, featured, images, specs, category_id) values (
  'Package AC',
  'package-ac',
  'Easy to install, space-saving package AC that reduces electricity bills while reliably delivering optimal comfort.',
  95000.00, 5, 'Elevate X', false,
  ARRAY['https://images.unsplash.com/photo-1635274605638-d44babc08a4f?w=600&q=80'],
  '{"Type": "Package AC", "Installation": "Easy", "Benefit": "Saves space, reduces electricity bills"}'::jsonb,
  '11111111-0000-0000-0000-000000000003'
);

insert into public.products (name, slug, description, price, stock, brand, featured, images, specs, category_id) values (
  'Mega Split AC (Highwall)',
  'mega-split-ac',
  'Edge-to-edge air conditioning that covers a large area with wall-mounted installation. Offers higher comfort and powerful cooling for big spaces.',
  65000.00, 7, 'Elevate X', false,
  ARRAY['https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&q=80'],
  '{"Type": "Mega Split AC (Highwall)", "Coverage": "Large area edge-to-edge", "Installation": "Wall Mounted", "Ideal For": "Large rooms & commercial spaces"}'::jsonb,
  '11111111-0000-0000-0000-000000000003'
);

insert into public.products (name, slug, description, price, stock, brand, featured, images, specs, category_id) values (
  'VRF / VRV System',
  'vrf-vrv-system',
  'Improve energy efficiency with Variable Refrigerant Flow technology. Enables optimal cooling across multiple zones on a reduced refrigerant cycle.',
  250000.00, 3, 'Elevate X', false,
  ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80'],
  '{"Type": "VRF / VRV (Variable Refrigerant Flow)", "Zones": "Multi-zone", "Technology": "Variable Refrigerant Flow", "Benefit": "High energy efficiency"}'::jsonb,
  '11111111-0000-0000-0000-000000000003'
);

insert into public.products (name, slug, description, price, stock, brand, featured, images, specs, category_id) values (
  'Air Handling Unit (AHU)',
  'air-handling-unit',
  'Central AC air handling unit that enhances dust filtration and maintains optimal humidity levels for superior temperature control in large commercial spaces.',
  180000.00, 4, 'Elevate X', false,
  ARRAY['https://images.unsplash.com/photo-1635274605638-d44babc08a4f?w=600&q=80'],
  '{"Type": "Air Handling Unit (AHU)", "Technology": "HVAC", "Features": "Dust filtration, humidity control", "Ideal For": "Central AC systems, commercial buildings"}'::jsonb,
  '11111111-0000-0000-0000-000000000003'
);
