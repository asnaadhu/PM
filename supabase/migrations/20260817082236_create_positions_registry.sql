/*
# Create Maldives professional positions registry

## Purpose
Adds a structured, user-extensible list of professional positions/roles specific to
Maldivian resort, hospitality, marine, technical, and support operations. Users can
select a position from this list when creating/editing their CV, or add their own
custom position if it is not present.

## New Tables
- `positions`
  - `id` (uuid, primary key)
  - `category` (text, not null) — the broad group, e.g. "Food & Beverage & Culinary"
  - `subcategory` (text, not null) — the finer group, e.g. "F&B Service", "Kitchen / Culinary"
  - `name` (text, not null) — the actual position, e.g. "Bar & Mixology"
  - `is_custom` (boolean, default false) — true when a user added it manually
  - `created_at` (timestamptz, default now())

## Seed Data
Inserts the full curated list of categories, subcategories, and positions provided by
the operator. Idempotent: existing rows are preserved; only missing (category, subcategory, name)
combinations are inserted via an anti-join guard.

## Security
- RLS enabled on `positions`.
- The position registry is intentionally public/shared across the app (no sign-in required to
  browse or suggest a new position), so policies grant CRUD to both `anon` and `authenticated`.

## Notes
1. This is a shared reference table — all users see the same positions.
2. Custom positions added by users are visible to everyone to maximize reuse.
3. A unique constraint on (category, subcategory, name) prevents duplicates.
*/

CREATE TABLE IF NOT EXISTS positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  subcategory text NOT NULL,
  name text NOT NULL,
  is_custom boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE positions ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX IF NOT EXISTS positions_category_sub_name_key
  ON positions (category, subcategory, name);

-- Seed data (only inserts rows that do not already exist)
INSERT INTO positions (category, subcategory, name, is_custom)
SELECT v.category, v.subcategory, v.name, false
FROM (VALUES
  -- Food & Beverage & Culinary
  ('Food & Beverage & Culinary', 'F&B Service', 'Food & Beverage'),
  ('Food & Beverage & Culinary', 'F&B Service', 'Bar & Mixology'),
  ('Food & Beverage & Culinary', 'F&B Service', 'Stewarding'),
  ('Food & Beverage & Culinary', 'Kitchen / Culinary', 'General Kitchen'),
  ('Food & Beverage & Culinary', 'Kitchen / Culinary', 'Italian Cuisine'),
  ('Food & Beverage & Culinary', 'Kitchen / Culinary', 'Indonesian / Asian Cuisine'),
  ('Food & Beverage & Culinary', 'Kitchen / Culinary', 'Pastry & Bakery'),

  -- Front Office & Guest Experience
  ('Front Office & Guest Experience', 'Front Desk', 'Front Office'),
  ('Front Office & Guest Experience', 'Front Desk', 'Rooms Division'),
  ('Front Office & Guest Experience', 'Front Desk', 'Concierge'),
  ('Front Office & Guest Experience', 'Guest Relations', 'Guest Services'),
  ('Front Office & Guest Experience', 'Guest Relations', 'Guest Relations'),
  ('Front Office & Guest Experience', 'Guest Relations', 'Customer Support'),
  ('Front Office & Guest Experience', 'Bookings', 'Reservations'),

  -- Housekeeping & Laundry
  ('Housekeeping & Laundry', 'Housekeeping', 'Housekeeping Attendant'),
  ('Housekeeping & Laundry', 'Housekeeping', 'Floor Supervisor'),
  ('Housekeeping & Laundry', 'Housekeeping', 'Public Area Cleaner'),
  ('Housekeeping & Laundry', 'Laundry', 'Laundry Attendant'),
  ('Housekeeping & Laundry', 'Laundry', 'Dry Cleaning'),
  ('Housekeeping & Laundry', 'Laundry', 'Linen Operations'),

  -- Spa, Wellness & Recreation
  ('Spa, Wellness & Recreation', 'Spa & Wellness', 'Spa Therapist'),
  ('Spa, Wellness & Recreation', 'Spa & Wellness', 'Yoga Instructor'),
  ('Spa, Wellness & Recreation', 'Spa & Wellness', 'Wellness Specialist'),
  ('Spa, Wellness & Recreation', 'Spa & Wellness', 'Fitness Trainer'),
  ('Spa, Wellness & Recreation', 'Recreation & Family', 'Kids Club Attendant'),
  ('Spa, Wellness & Recreation', 'Recreation & Family', 'Recreation Host'),
  ('Spa, Wellness & Recreation', 'Recreation & Family', 'Entertainment / DJ'),

  -- Water Sports, Marine & Diving
  ('Water Sports, Marine & Diving', 'Water Sports', 'Water Sports Attendant'),
  ('Water Sports, Marine & Diving', 'Water Sports', 'Boat Crew'),
  ('Water Sports, Marine & Diving', 'Diving', 'Diving Instructor'),
  ('Water Sports, Marine & Diving', 'Diving', 'Dive Master'),
  ('Water Sports, Marine & Diving', 'Marine Science', 'Marine Biologist'),
  ('Water Sports, Marine & Diving', 'Marine Science', 'Environmental Officer'),

  -- Engineering, Maintenance & Landscaping
  ('Engineering, Maintenance & Landscaping', 'Technical & Facilities', 'Engineering'),
  ('Engineering, Maintenance & Landscaping', 'Technical & Facilities', 'General Maintenance'),
  ('Engineering, Maintenance & Landscaping', 'Technical & Facilities', 'Construction'),
  ('Engineering, Maintenance & Landscaping', 'Grounds & Design', 'Landscaping / Gardening'),
  ('Engineering, Maintenance & Landscaping', 'Grounds & Design', 'Agriculture'),
  ('Engineering, Maintenance & Landscaping', 'Grounds & Design', 'Architecture'),
  ('Engineering, Maintenance & Landscaping', 'Grounds & Design', 'Interior Design'),

  -- Finance, Accounting & Procurement
  ('Finance, Accounting & Procurement', 'Accounting', 'Accounts'),
  ('Finance, Accounting & Procurement', 'Accounting', 'Finance'),
  ('Finance, Accounting & Procurement', 'Accounting', 'Auditing'),
  ('Finance, Accounting & Procurement', 'Supply Chain', 'Purchasing'),
  ('Finance, Accounting & Procurement', 'Supply Chain', 'Procurement'),
  ('Finance, Accounting & Procurement', 'Supply Chain', 'Logistics'),
  ('Finance, Accounting & Procurement', 'Supply Chain', 'Store / Warehousing'),

  -- Human Resources & Administration
  ('Human Resources & Administration', 'HR & People', 'Human Resources'),
  ('Human Resources & Administration', 'HR & People', 'Recruitment'),
  ('Human Resources & Administration', 'HR & People', 'Training & Development'),
  ('Human Resources & Administration', 'HR & People', 'Legal'),
  ('Human Resources & Administration', 'Administration', 'Office Admin'),
  ('Human Resources & Administration', 'Administration', 'Executive Assistant'),

  -- Sales, Marketing, Creative & IT
  ('Sales, Marketing, Creative & IT', 'Commercial', 'Sales & Marketing'),
  ('Sales, Marketing, Creative & IT', 'Commercial', 'Digital Marketing'),
  ('Sales, Marketing, Creative & IT', 'Commercial', 'Public Relations'),
  ('Sales, Marketing, Creative & IT', 'Creative & Media', 'Photography'),
  ('Sales, Marketing, Creative & IT', 'Creative & Media', 'Videography'),
  ('Sales, Marketing, Creative & IT', 'Creative & Media', 'Graphic Design'),
  ('Sales, Marketing, Creative & IT', 'Technology', 'Information Technology'),
  ('Sales, Marketing, Creative & IT', 'Technology', 'Web Development'),
  ('Sales, Marketing, Creative & IT', 'Technology', 'Network Support'),

  -- Management & Executive
  ('Management & Executive', 'Leadership', 'Senior Management'),
  ('Management & Executive', 'Leadership', 'Head of Department (HOD)'),
  ('Management & Executive', 'Leadership', 'Operations Management'),
  ('Management & Executive', 'Specialized Management', 'Project Management'),
  ('Management & Executive', 'Specialized Management', 'Risk & Safety'),

  -- Medical & Healthcare
  ('Medical & Healthcare', 'Resort Medical', 'Resort Doctor'),
  ('Medical & Healthcare', 'Resort Medical', 'Resort Nurse'),
  ('Medical & Healthcare', 'Resort Medical', 'First Aid Officer'),
  ('Medical & Healthcare', 'Resort Medical', 'Medical Diagnostics'),

  -- Transport, Aviation & Security
  ('Transport, Aviation & Security', 'Transit & Logistics', 'Airport Host'),
  ('Transport, Aviation & Security', 'Transit & Logistics', 'Transport / Boat Captain'),
  ('Transport, Aviation & Security', 'Transit & Logistics', 'Aviation Support'),
  ('Transport, Aviation & Security', 'Security', 'Security Officer'),
  ('Transport, Aviation & Security', 'Security', 'Loss Prevention'),

  -- Retail & Boutiques
  ('Retail & Boutiques', 'Retail & Boutiques', 'Retail & Boutiques')
) AS v(category, subcategory, name)
WHERE NOT EXISTS (
  SELECT 1 FROM positions p
  WHERE p.category = v.category
    AND p.subcategory = v.subcategory
    AND p.name = v.name
);

-- Public read: anyone (anon or authenticated) can browse the position registry
DROP POLICY IF EXISTS "positions_public_select" ON positions;
CREATE POLICY "positions_public_select"
ON positions FOR SELECT
TO anon, authenticated USING (true);

-- Public insert: users can add custom positions to the shared registry
DROP POLICY IF EXISTS "positions_public_insert" ON positions;
CREATE POLICY "positions_public_insert"
ON positions FOR INSERT
TO anon, authenticated WITH CHECK (true);

-- Public update: allow correcting a position (shared registry)
DROP POLICY IF EXISTS "positions_public_update" ON positions;
CREATE POLICY "positions_public_update"
ON positions FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

-- No deletes from the app for now to protect shared reference data
