/**
 * SIMCAT Database Schema DDL
 * Comprehensive schema for users, RBAC, taxonomy, questions, editorial reviews,
 * packages, attempts, answers, results, orders, audit logs, and bookmarks.
 */

export const SCHEMA_SQL = `
-- 1. Roles & Permissions (RBAC)
CREATE TABLE IF NOT EXISTS roles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  permissions TEXT NOT NULL -- JSON array
);

-- 2. Users & Authentication
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uuid TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role_id TEXT NOT NULL REFERENCES roles(id) ON UPDATE CASCADE,
  status TEXT DEFAULT 'active', -- active, suspended, pending
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_profiles (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  nik_masked TEXT,
  phone TEXT,
  target_instansi TEXT,
  avatar_url TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Taxonomy (Categories, Subjects, Topics)
CREATE TABLE IF NOT EXISTS exam_categories (
  id TEXT PRIMARY KEY, -- cpns, pppk, bumn, sekolah-kedinasan
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS subjects (
  id TEXT PRIMARY KEY, -- e.g. cpns-twk, cpns-tiu, cpns-tkp, bumn-tkd
  category_id TEXT NOT NULL REFERENCES exam_categories(id) ON UPDATE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS topics (
  id TEXT PRIMARY KEY, -- e.g. twk-pancasila, tiu-numerik
  subject_id TEXT NOT NULL REFERENCES subjects(id) ON UPDATE CASCADE,
  name TEXT NOT NULL,
  description TEXT
);

-- 4. Scoring Rules (Config-driven, versioned, uncoupled from engine)
CREATE TABLE IF NOT EXISTS scoring_rules (
  id TEXT PRIMARY KEY, -- e.g. rule-cpns-skd-2026
  name TEXT NOT NULL,
  category_id TEXT NOT NULL REFERENCES exam_categories(id),
  reference_source TEXT NOT NULL, -- e.g. KepmenPAN-RB No. 321 Tahun 2024
  rules_json TEXT NOT NULL, -- JSON config of passing grades, weights, options
  version TEXT DEFAULT '2026.1',
  is_verified INTEGER DEFAULT 1,
  notes TEXT
);

-- 5. Question Bank & Editorial Review Workflow
CREATE TABLE IF NOT EXISTS questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uuid TEXT UNIQUE NOT NULL,
  category_id TEXT NOT NULL REFERENCES exam_categories(id),
  subject_id TEXT NOT NULL REFERENCES subjects(id),
  topic_id TEXT REFERENCES topics(id),
  stimulus_text TEXT, -- Reading passage / scenario
  question_text TEXT NOT NULL,
  media_url TEXT,
  difficulty INTEGER DEFAULT 3, -- 1 (easy) to 5 (hard)
  editorial_status TEXT DEFAULT 'published', -- draft, review_pending, revision_required, approved, published, archived
  author_id INTEGER REFERENCES users(id),
  reviewer_id INTEGER REFERENCES users(id),
  version INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS question_options (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  option_key TEXT NOT NULL, -- A, B, C, D, E
  option_text TEXT NOT NULL,
  media_url TEXT,
  is_correct INTEGER DEFAULT 0, -- 1=correct, 0=wrong (SERVER ONLY)
  score_weight REAL DEFAULT 0,  -- 0.0 to 5.0 (SERVER ONLY)
  UNIQUE(question_id, option_key)
);

CREATE TABLE IF NOT EXISTS question_explanations (
  question_id INTEGER PRIMARY KEY REFERENCES questions(id) ON DELETE CASCADE,
  explanation_text TEXT NOT NULL,
  quick_trick TEXT,
  reference_source TEXT
);

CREATE TABLE IF NOT EXISTS question_reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  reviewer_id INTEGER NOT NULL REFERENCES users(id),
  status TEXT NOT NULL, -- approved, revision_required, rejected
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. Exam Packages & Question Mapping
CREATE TABLE IF NOT EXISTS exam_packages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  category_id TEXT NOT NULL REFERENCES exam_categories(id),
  scoring_rule_id TEXT NOT NULL REFERENCES scoring_rules(id),
  duration_minutes INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  description TEXT,
  is_free INTEGER DEFAULT 1,
  price INTEGER DEFAULT 0,
  selection_mode TEXT DEFAULT 'fixed', -- fixed, random_quota
  quota_config_json TEXT, -- JSON specifying quotas per subject
  status TEXT DEFAULT 'published', -- draft, published, archived
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS package_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  package_id INTEGER NOT NULL REFERENCES exam_packages(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  sequence_order INTEGER NOT NULL,
  UNIQUE(package_id, question_id)
);

-- 7. Exam Execution Engine (Attempts, Autosaved Answers, Graded Results)
CREATE TABLE IF NOT EXISTS exam_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uuid TEXT UNIQUE NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id),
  package_id INTEGER NOT NULL REFERENCES exam_packages(id),
  scoring_rule_snapshot TEXT NOT NULL, -- JSON snapshot of scoring rules
  questions_snapshot TEXT NOT NULL,    -- JSON snapshot of questions list & option order
  started_at DATETIME NOT NULL,
  expires_at DATETIME NOT NULL,
  finished_at DATETIME,
  status TEXT DEFAULT 'in_progress',   -- created, in_progress, submitted, auto_submitted, graded, cancelled, expired
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS attempt_answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  attempt_id INTEGER NOT NULL REFERENCES exam_attempts(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL REFERENCES questions(id),
  selected_option_key TEXT,
  is_doubtful INTEGER DEFAULT 0,
  client_sequence INTEGER DEFAULT 1,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(attempt_id, question_id)
);

CREATE TABLE IF NOT EXISTS exam_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  attempt_id INTEGER UNIQUE NOT NULL REFERENCES exam_attempts(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id),
  package_id INTEGER NOT NULL REFERENCES exam_packages(id),
  total_score REAL NOT NULL,
  max_possible_score REAL NOT NULL,
  is_passed INTEGER NOT NULL, -- 1 if all subtest passing grades met, else 0
  category_scores TEXT NOT NULL, -- JSON object of subtest breakdowns
  correct_count INTEGER DEFAULT 0,
  wrong_count INTEGER DEFAULT 0,
  unanswered_count INTEGER DEFAULT 0,
  accuracy_percent REAL DEFAULT 0,
  time_spent_seconds INTEGER NOT NULL,
  recommendations_json TEXT, -- JSON array of advice
  graded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 8. Monetization & Subscriptions
CREATE TABLE IF NOT EXISTS subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  duration_days INTEGER NOT NULL,
  features_json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_no TEXT UNIQUE NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id),
  plan_id TEXT REFERENCES subscription_plans(id),
  package_id INTEGER REFERENCES exam_packages(id),
  amount INTEGER NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, paid, failed, expired, cancelled
  payment_method TEXT,
  payment_reference TEXT,
  paid_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 9. Bookmarks & In-app Notifications
CREATE TABLE IF NOT EXISTS bookmarks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, question_id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info', -- info, success, warning, system
  is_read INTEGER DEFAULT 0,
  action_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 10. Audit Logging
CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details TEXT,
  ip_address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for high-throughput concurrency
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category_id, subject_id, editorial_status);
CREATE INDEX IF NOT EXISTS idx_question_options_qid ON question_options(question_id);
CREATE INDEX IF NOT EXISTS idx_attempts_user ON exam_attempts(user_id, status);
CREATE INDEX IF NOT EXISTS idx_attempts_expiry ON exam_attempts(status, expires_at);
CREATE INDEX IF NOT EXISTS idx_attempt_answers_attempt ON attempt_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_user ON exam_results(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id, status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id, created_at);
`;
