-- Migration 001: Extend submission/announcement/event enums to match UI semantics.
-- Run this once against the existing school_information_system database:
--   mysql -u root -p school_information_system < database/migrations/001_extend_enums.sql

-- Submissions: allow ATTENDANCE and PERFORMANCE in addition to existing types.
ALTER TABLE submissions
  MODIFY COLUMN type ENUM(
    'ANNOUNCEMENT',
    'EVENT',
    'REPORT',
    'ATTENDANCE',
    'PERFORMANCE',
    'OTHER'
  ) NOT NULL;

-- Approvals: same set of types.
ALTER TABLE approvals
  MODIFY COLUMN type ENUM(
    'ANNOUNCEMENT',
    'EVENT',
    'REPORT',
    'ATTENDANCE',
    'PERFORMANCE',
    'OTHER'
  ) NOT NULL;

-- Announcements: allow finer-grained audience targeting.
ALTER TABLE announcements
  MODIFY COLUMN targetAudience ENUM(
    'ALL',
    'TEACHERS',
    'PARENTS',
    'SPECIFIC_CLASS',
    'SPECIFIC_STUDENT',
    'SPECIFIC'
  ) NOT NULL;

-- Events: same audience options.
ALTER TABLE events
  MODIFY COLUMN targetAudience ENUM(
    'ALL',
    'TEACHERS',
    'PARENTS',
    'SPECIFIC_CLASS',
    'SPECIFIC_STUDENT',
    'SPECIFIC'
  ) NOT NULL;

-- Submissions: store the audience + targetId at submission time
-- so the admin doesn't have to re-enter them on approval.
ALTER TABLE submissions
  ADD COLUMN targetAudience VARCHAR(32) NULL AFTER content,
  ADD COLUMN targetId VARCHAR(191) NULL AFTER targetAudience;
