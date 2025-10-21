-- Migration: Add GitHub activity tables
-- Date: 2025-10-21
-- Purpose: Store GitHub commits, PRs, issues, and releases for newsletter generation

-- GitHub Commits
CREATE TABLE IF NOT EXISTS github_commits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sha TEXT NOT NULL UNIQUE,
  repo TEXT NOT NULL,
  message TEXT NOT NULL,
  date TEXT NOT NULL,
  url TEXT NOT NULL,
  is_private BOOLEAN NOT NULL,
  fetched_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- GitHub Pull Requests
CREATE TABLE IF NOT EXISTS github_pull_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  repo TEXT NOT NULL,
  number INTEGER NOT NULL,
  title TEXT NOT NULL,
  state TEXT NOT NULL,
  created_at TEXT NOT NULL,
  merged_at TEXT,
  url TEXT NOT NULL,
  is_private BOOLEAN NOT NULL,
  fetched_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(repo, number)
);

-- GitHub Issues
CREATE TABLE IF NOT EXISTS github_issues (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  repo TEXT NOT NULL,
  number INTEGER NOT NULL,
  title TEXT NOT NULL,
  state TEXT NOT NULL,
  created_at TEXT NOT NULL,
  closed_at TEXT,
  url TEXT NOT NULL,
  is_private BOOLEAN NOT NULL,
  fetched_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(repo, number)
);

-- GitHub Releases
CREATE TABLE IF NOT EXISTS github_releases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  repo TEXT NOT NULL,
  tag_name TEXT NOT NULL,
  name TEXT NOT NULL,
  published_at TEXT NOT NULL,
  url TEXT NOT NULL,
  is_private BOOLEAN NOT NULL,
  fetched_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(repo, tag_name)
);

-- Performance indices for common queries
CREATE INDEX IF NOT EXISTS idx_github_commits_date ON github_commits(date DESC);
CREATE INDEX IF NOT EXISTS idx_github_commits_repo ON github_commits(repo);

CREATE INDEX IF NOT EXISTS idx_github_prs_created ON github_pull_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_github_prs_repo ON github_pull_requests(repo);

CREATE INDEX IF NOT EXISTS idx_github_issues_created ON github_issues(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_github_issues_repo ON github_issues(repo);

CREATE INDEX IF NOT EXISTS idx_github_releases_published ON github_releases(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_github_releases_repo ON github_releases(repo);
