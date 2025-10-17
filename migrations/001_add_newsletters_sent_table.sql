-- Migration: Add newsletters_sent table for tracking sent newsletters
-- Date: 2025-10-17
-- Purpose: Track newsletter sends to prevent duplicates and maintain audit trail

CREATE TABLE IF NOT EXISTS newsletters_sent (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT NOT NULL UNIQUE,
  sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  subscriber_count INTEGER,
  resend_broadcast_id TEXT
);
