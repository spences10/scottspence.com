-- Add index on posts.date for ORDER BY date DESC queries
-- Eliminates full table scan + temp B-tree sort on /posts route

CREATE INDEX IF NOT EXISTS idx_posts_date ON posts (date DESC);
