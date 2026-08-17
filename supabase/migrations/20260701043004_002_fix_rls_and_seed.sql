/*
# Fix RLS policies and seed sample data

## Problem
BookNook is a no-auth CRM (no sign-in screen). The original migration scoped every
policy `TO authenticated`, but the frontend uses the anon key. With no authenticated
session, the anon client is blocked from all reads and writes, so every screen shows
empty even though the tables exist.

## Changes

### 1. Security — recreate all policies with anon access
For each table (books, customers, orders, order_items) the four CRUD policies are
dropped and recreated as `TO anon, authenticated`. The data is intentionally
shared/public (single-tenant, no sign-in), so `USING (true)` / `WITH CHECK (true)`
is appropriate and documented here.

### 2. Data — seed sample rows so the UI is not empty
Inserts a handful of books, customers, and orders with order_items. Inserts use
fixed UUIDs and ON CONFLICT DO NOTHING so re-running the migration is safe and
never duplicates data.
*/

-- ---------- books ----------
DROP POLICY IF EXISTS "books_select" ON books;
DROP POLICY IF EXISTS "books_insert" ON books;
DROP POLICY IF EXISTS "books_update" ON books;
DROP POLICY IF EXISTS "books_delete" ON books;

CREATE POLICY "books_select" ON books FOR SELECT
  TO anon, authenticated USING (true);
CREATE POLICY "books_insert" ON books FOR INSERT
  TO anon, authenticated WITH CHECK (true);
CREATE POLICY "books_update" ON books FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "books_delete" ON books FOR DELETE
  TO anon, authenticated USING (true);

-- ---------- customers ----------
DROP POLICY IF EXISTS "customers_select" ON customers;
DROP POLICY IF EXISTS "customers_insert" ON customers;
DROP POLICY IF EXISTS "customers_update" ON customers;
DROP POLICY IF EXISTS "customers_delete" ON customers;

CREATE POLICY "customers_select" ON customers FOR SELECT
  TO anon, authenticated USING (true);
CREATE POLICY "customers_insert" ON customers FOR INSERT
  TO anon, authenticated WITH CHECK (true);
CREATE POLICY "customers_update" ON customers FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "customers_delete" ON customers FOR DELETE
  TO anon, authenticated USING (true);

-- ---------- orders ----------
DROP POLICY IF EXISTS "orders_select" ON orders;
DROP POLICY IF EXISTS "orders_insert" ON orders;
DROP POLICY IF EXISTS "orders_update" ON orders;
DROP POLICY IF EXISTS "orders_delete" ON orders;

CREATE POLICY "orders_select" ON orders FOR SELECT
  TO anon, authenticated USING (true);
CREATE POLICY "orders_insert" ON orders FOR INSERT
  TO anon, authenticated WITH CHECK (true);
CREATE POLICY "orders_update" ON orders FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "orders_delete" ON orders FOR DELETE
  TO anon, authenticated USING (true);

-- ---------- order_items ----------
DROP POLICY IF EXISTS "order_items_select" ON order_items;
DROP POLICY IF EXISTS "order_items_insert" ON order_items;
DROP POLICY IF EXISTS "order_items_update" ON order_items;
DROP POLICY IF EXISTS "order_items_delete" ON order_items;

CREATE POLICY "order_items_select" ON order_items FOR SELECT
  TO anon, authenticated USING (true);
CREATE POLICY "order_items_insert" ON order_items FOR INSERT
  TO anon, authenticated WITH CHECK (true);
CREATE POLICY "order_items_update" ON order_items FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "order_items_delete" ON order_items FOR DELETE
  TO anon, authenticated USING (true);

-- ---------- seed: books ----------
INSERT INTO books (id, title, author, isbn, price, stock_quantity, genre, description, cover_image_url) VALUES
  ('11111111-1111-1111-1111-111111111101', 'The Midnight Library', 'Matt Haig', '9780525559474', 18.99, 32, 'Fiction', 'A novel about second chances and the infinite possibilities of living.', 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?w=300&h=400&fit=crop'),
  ('11111111-1111-1111-1111-111111111102', 'Atomic Habits', 'James Clear', '9780735211292', 24.00, 50, 'Self-Help', 'Tiny changes, remarkable results.', 'https://images.pexels.com/photos/3747111/pexels-photo-3747111.jpeg?w=300&h=400&fit=crop'),
  ('11111111-1111-1111-1111-111111111103', 'Dune', 'Frank Herbert', '9780441013593', 22.50, 18, 'Sci-Fi', 'A stunning blend of adventure and mysticism on a desert planet.', 'https://images.pexels.com/photos/1112045/pexels-photo-1112045.jpeg?w=300&h=400&fit=crop'),
  ('11111111-1111-1111-1111-111111111104', 'Educated', 'Tara Westover', '9780399590504', 19.99, 25, 'Memoir', 'A memoir about a woman who leaves her survivalist family for education.', 'https://images.pexels.com/photos/1598666/pexels-photo-1598666.jpeg?w=300&h=400&fit=crop'),
  ('11111111-1111-1111-1111-111111111105', 'The Silent Patient', 'Alex Michaelides', '9781250301697', 16.99, 40, 'Thriller', 'A psychological thriller about a woman who shoots her husband.', 'https://images.pexels.com/photos/1377034/pexels-photo-1377034.jpeg?w=300&h=400&fit=crop'),
  ('11111111-1111-1111-1111-111111111106', 'Where the Crawdads Sing', 'Delia Owens', '9780735219090', 17.50, 28, 'Fiction', 'A coming-of-age mystery set in the marshes of North Carolina.', 'https://images.pexels.com/photos/1763265/pexels-photo-1763265.jpeg?w=300&h=400&fit=crop'),
  ('11111111-1111-1111-1111-111111111107', 'Project Hail Mary', 'Andy Weir', '9780593135204', 28.99, 15, 'Sci-Fi', 'A lone astronaut must save humanity in this interstellar adventure.', 'https://images.pexels.com/photos/1904104/pexels-photo-1904104.jpeg?w=300&h=400&fit=crop'),
  ('11111111-1111-1111-1111-111111111108', 'The Alchemist', 'Paulo Coelho', '9780062315007', 14.99, 60, 'Fiction', 'A fable about following your dreams.', 'https://images.pexels.com/photos/256455/pexels-photo-256455.jpeg?w=300&h=400&fit=crop')
ON CONFLICT (id) DO NOTHING;

-- ---------- seed: customers ----------
INSERT INTO customers (id, first_name, last_name, email, phone, address, city, state, zip_code, notes, total_orders, total_spent) VALUES
  ('22222222-2222-2222-2222-222222222201', 'Emma', 'Johnson', 'emma.johnson@example.com', '555-0101', '123 Oak Ave', 'Springfield', 'IL', '62704', 'Prefers hardcover editions.', 2, 86.46),
  ('22222222-2222-2222-2222-222222222202', 'Liam', 'Smith', 'liam.smith@example.com', '555-0102', '456 Pine St', 'Portland', 'OR', '97201', 'Repeat customer.', 1, 28.99),
  ('22222222-2222-2222-2222-222222222203', 'Olivia', 'Williams', 'olivia.williams@example.com', '555-0103', '789 Maple Dr', 'Austin', 'TX', '73301', NULL, 1, 16.99),
  ('22222222-2222-2222-2222-222222222204', 'Noah', 'Brown', 'noah.brown@example.com', '555-0104', '321 Cedar Ln', 'Denver', 'CO', '80202', 'Interested in sci-fi.', 2, 51.49)
ON CONFLICT (id) DO NOTHING;

-- ---------- seed: orders ----------
-- order 1: Emma - delivered
INSERT INTO orders (id, customer_id, status, subtotal, tax, total, shipping_address, notes) VALUES
  ('33333333-3333-3333-3333-333333333301', '22222222-2222-2222-2222-222222222201', 'delivered', 43.98, 3.52, 47.50, '123 Oak Ave, Springfield, IL 62704', 'Gift wrap requested.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO order_items (order_id, book_id, quantity, unit_price) VALUES
  ('33333333-3333-3333-3333-333333333301', '11111111-1111-1111-1111-111111111101', 1, 18.99),
  ('33333333-3333-3333-3333-333333333301', '11111111-1111-1111-1111-111111111102', 1, 24.00)
ON CONFLICT DO NOTHING;

-- order 2: Emma - shipped
INSERT INTO orders (id, customer_id, status, subtotal, tax, total, shipping_address, notes) VALUES
  ('33333333-3333-3333-3333-333333333302', '22222222-2222-2222-2222-222222222201', 'shipped', 35.90, 2.06, 37.96, '123 Oak Ave, Springfield, IL 62704', NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO order_items (order_id, book_id, quantity, unit_price) VALUES
  ('33333333-3333-3333-3333-333333333302', '11111111-1111-1111-1111-111111111106', 1, 17.50),
  ('33333333-3333-3333-3333-333333333302', '11111111-1111-1111-1111-111111111105', 1, 16.99)
ON CONFLICT DO NOTHING;

-- order 3: Liam - processing
INSERT INTO orders (id, customer_id, status, subtotal, tax, total, shipping_address, notes) VALUES
  ('33333333-3333-3333-3333-333333333303', '22222222-2222-2222-2222-222222222202', 'processing', 26.84, 2.15, 28.99, '456 Pine St, Portland, OR 97201', NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO order_items (order_id, book_id, quantity, unit_price) VALUES
  ('33333333-3333-3333-3333-333333333303', '11111111-1111-1111-1111-111111111107', 1, 28.99)
ON CONFLICT DO NOTHING;

-- order 4: Olivia - pending
INSERT INTO orders (id, customer_id, status, subtotal, tax, total, shipping_address, notes) VALUES
  ('33333333-3333-3333-3333-333333333304', '22222222-2222-2222-2222-222222222203', 'pending', 15.73, 1.26, 16.99, '789 Maple Dr, Austin, TX 73301', NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO order_items (order_id, book_id, quantity, unit_price) VALUES
  ('33333333-3333-3333-3333-333333333304', '11111111-1111-1111-1111-111111111105', 1, 16.99)
ON CONFLICT DO NOTHING;

-- order 5: Noah - delivered
INSERT INTO orders (id, customer_id, status, subtotal, tax, total, shipping_address, notes) VALUES
  ('33333333-3333-3333-3333-333333333305', '22222222-2222-2222-2222-222222222204', 'delivered', 47.67, 3.82, 51.49, '321 Cedar Ln, Denver, CO 80202', NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO order_items (order_id, book_id, quantity, unit_price) VALUES
  ('33333333-3333-3333-3333-333333333305', '11111111-1111-1111-1111-111111111103', 1, 22.50),
  ('33333333-3333-3333-3333-333333333305', '11111111-1111-1111-1111-111111111107', 1, 28.99)
ON CONFLICT DO NOTHING;
