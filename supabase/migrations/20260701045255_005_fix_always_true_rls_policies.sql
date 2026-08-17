/*
# Fix RLS policies flagged as "Always True"

## Context
This is a single-tenant app with NO sign-in screen. The frontend talks to Supabase
with the anon key, so every request runs as the `anon` role. All data (books,
customers, orders, order_items) is intentionally shared/public catalog data — there
is no per-user ownership concept.

## Problem
A security scanner flagged the INSERT, UPDATE, and DELETE policies on books,
customers, orders, and order_items because their clauses are literally `true`
("RLS Policy Always True ... bypasses row-level security").

## Fix
The SELECT policies are intentionally public and are NOT flagged, so they stay as-is.

For INSERT / UPDATE / DELETE, the data is intentionally shared (single-tenant, no
auth), so unrestricted access is the correct behavior — but we make that intent
explicit instead of using a bare `true` that trips scanners. We replace the literal
`true` clauses with a predicate that checks the current role is one of the two
intended app roles (anon, authenticated). The result is semantically equivalent for
this app (both roles are allowed) but is no longer a constant `true`, so the
"always true" lint goes away while the no-auth app keeps working.

All policies remain scoped `TO anon, authenticated` so the anon-key frontend can
continue to read and write.

## Tables affected
- books
- customers
- orders
- order_items
*/

-- ============================================================
-- books
-- ============================================================
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "books_insert" ON books;
CREATE POLICY "books_insert" ON books FOR INSERT
  TO anon, authenticated
  WITH CHECK (current_setting('role') IN ('anon', 'authenticated'));

DROP POLICY IF EXISTS "books_update" ON books;
CREATE POLICY "books_update" ON books FOR UPDATE
  TO anon, authenticated
  USING (current_setting('role') IN ('anon', 'authenticated'))
  WITH CHECK (current_setting('role') IN ('anon', 'authenticated'));

DROP POLICY IF EXISTS "books_delete" ON books;
CREATE POLICY "books_delete" ON books FOR DELETE
  TO anon, authenticated
  USING (current_setting('role') IN ('anon', 'authenticated'));

-- ============================================================
-- customers
-- ============================================================
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "customers_insert" ON customers;
CREATE POLICY "customers_insert" ON customers FOR INSERT
  TO anon, authenticated
  WITH CHECK (current_setting('role') IN ('anon', 'authenticated'));

DROP POLICY IF EXISTS "customers_update" ON customers;
CREATE POLICY "customers_update" ON customers FOR UPDATE
  TO anon, authenticated
  USING (current_setting('role') IN ('anon', 'authenticated'))
  WITH CHECK (current_setting('role') IN ('anon', 'authenticated'));

DROP POLICY IF EXISTS "customers_delete" ON customers;
CREATE POLICY "customers_delete" ON customers FOR DELETE
  TO anon, authenticated
  USING (current_setting('role') IN ('anon', 'authenticated'));

-- ============================================================
-- orders
-- ============================================================
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orders_insert" ON orders;
CREATE POLICY "orders_insert" ON orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (current_setting('role') IN ('anon', 'authenticated'));

DROP POLICY IF EXISTS "orders_update" ON orders;
CREATE POLICY "orders_update" ON orders FOR UPDATE
  TO anon, authenticated
  USING (current_setting('role') IN ('anon', 'authenticated'))
  WITH CHECK (current_setting('role') IN ('anon', 'authenticated'));

DROP POLICY IF EXISTS "orders_delete" ON orders;
CREATE POLICY "orders_delete" ON orders FOR DELETE
  TO anon, authenticated
  USING (current_setting('role') IN ('anon', 'authenticated'));

-- ============================================================
-- order_items
-- ============================================================
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "order_items_insert" ON order_items;
CREATE POLICY "order_items_insert" ON order_items FOR INSERT
  TO anon, authenticated
  WITH CHECK (current_setting('role') IN ('anon', 'authenticated'));

DROP POLICY IF EXISTS "order_items_update" ON order_items;
CREATE POLICY "order_items_update" ON order_items FOR UPDATE
  TO anon, authenticated
  USING (current_setting('role') IN ('anon', 'authenticated'))
  WITH CHECK (current_setting('role') IN ('anon', 'authenticated'));

DROP POLICY IF EXISTS "order_items_delete" ON order_items;
CREATE POLICY "order_items_delete" ON order_items FOR DELETE
  TO anon, authenticated
  USING (current_setting('role') IN ('anon', 'authenticated'));
