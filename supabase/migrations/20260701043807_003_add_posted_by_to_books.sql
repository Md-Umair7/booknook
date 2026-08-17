/*
# Add posted_by column to books

## Changes

### 1. Schema
- Adds `posted_by` (TEXT, nullable) to `books` to record the name of the person who
  listed the book in the catalog. Nullable so existing rows and the existing insert
  flow keep working.

### 2. Data
- Backfills `posted_by` for the seeded books so existing cards show a poster.
*/

ALTER TABLE books ADD COLUMN IF NOT EXISTS posted_by TEXT;

UPDATE books
SET posted_by = CASE
  WHEN title IN ('The Midnight Library', 'Where the Crawdads Sing', 'The Alchemist') THEN 'Sarah Miller'
  WHEN title IN ('Atomic Habits', 'Educated') THEN 'James Carter'
  WHEN title IN ('Dune', 'Project Hail Mary') THEN 'Priya Patel'
  WHEN title = 'The Silent Patient' THEN 'Sarah Miller'
  ELSE 'Admin'
END
WHERE posted_by IS NULL;
