# Database Schema (Current Implementation)

Source of truth: `backend/models.py` (SQLAlchemy ORM).

## Tables

### 1. `users`
- `id` (UUID, PK)
- `name` (String, nullable)
- `email` (String, unique, indexed, non-null)
- `password` (String, nullable; hashed before storage)
- `status` (String, default `"pending_registration"`)
- `created_at` (DateTimeTZ, server default now)
- `updated_at` (DateTimeTZ, nullable, on update now)

### 2. `investor_profiles`
- `id` (UUID, PK)
- `user_id` (UUID, unique, indexed, non-null)
- `phone` (String, nullable)
- `city` (String, nullable)
- `risk` (String, nullable)
- `goal` (String, nullable)
- `horizon` (String, nullable)
- `experience` (String, nullable)
- `created_at` (DateTimeTZ, server default now)
- `updated_at` (DateTimeTZ, nullable, on update now)

### 3. `otp_codes`
- `id` (UUID, PK)
- `email` (String, indexed, non-null)
- `otp` (String, nullable)
- `type` (String, default `"register"`)
- `token` (String, nullable; used for password reset)
- `expires_at` (DateTimeTZ, non-null)
- `created_at` (DateTimeTZ, server default now)

### 4. `kyc_documents`
- `id` (UUID, PK)
- `user_id` (UUID, FK -> `users.id`, non-null)
- `doc_type` (String, non-null; `"aadhaar"` or `"pan"`)
- `extracted_id_number` (String, nullable)
- `extracted_name` (String, nullable)
- `status` (String, default `"pending_review"`)
- `created_at` (DateTimeTZ, server default now)

### 5. `news_articles`
- `id` (UUID, PK)
- `title` (String, non-null)
- `source` (String, non-null)
- `link` (String, unique, non-null)
- `summary` (String, nullable)
- `sentiment` (String, nullable)
- `score` (Float, nullable)
- `related` (JSON list, default `[]`)
- `published_at` (DateTimeTZ, nullable)
- `fetched_at` (DateTimeTZ, server default now)

### 6. `market_quotes`
- `symbol` (String, PK)
- `name` (String, non-null)
- `sector` (String, nullable)
- `ltp` (Float, nullable)
- `prev_close` (Float, nullable)
- `change` (Float, nullable)
- `pct_change` (Float, nullable)
- `day_high` (Float, nullable)
- `day_low` (Float, nullable)
- `year_high` (Float, nullable)
- `year_low` (Float, nullable)
- `volume` (Integer, nullable)
- `pe` (Float, nullable)
- `sector_pe` (Float, nullable)
- `rsi14` (Float, nullable)
- `sentiment` (String, nullable)
- `analysis_summary` (String, nullable)
- `updated_at` (DateTimeTZ, server default now, on update now)

### 7. `corporate_announcements`
- `id` (UUID, PK)
- `symbol` (String, indexed, non-null)
- `subject` (String, non-null)
- `attachment_text` (String, nullable)
- `attachment_url` (String, nullable)
- `broadcast_date` (String, nullable)
- `is_financial_result` (Boolean, default `false`)
- `filing_excerpt` (String, nullable)
- `fetched_at` (DateTimeTZ, server default now)

### 8. `quarterly_financials`
- `id` (UUID, PK)
- `symbol` (String, indexed, non-null)
- `quarter_end` (String, non-null, format `YYYY-MM-DD`)
- `revenue` (Float, nullable)
- `net_income` (Float, nullable)
- `eps` (Float, nullable)
- `yoy_revenue_growth` (Float, nullable)
- `yoy_profit_growth` (Float, nullable)
- `fetched_at` (DateTimeTZ, server default now, on update now)

Constraint:
- unique composite key on (`symbol`, `quarter_end`)

### 9. `investor_personas`
- `id` (UUID, PK)
- `user_id` (UUID, unique, indexed, non-null)
- `persona_name` (String, nullable)
- `investment_style` (String, nullable)
- `risk_score` (Float, nullable)
- `risk_category` (String, nullable)
- `profile_json` (JSON, nullable)
- `financial_metrics_json` (JSON, nullable)
- `recommended_allocation_json` (JSON, nullable)
- `llm_summary` (String, nullable)
- `onboarding_completed` (Boolean, default `false`)
- `created_at` (DateTimeTZ, server default now)
- `updated_at` (DateTimeTZ, nullable, on update now)

`financial_metrics_json.extracted_profile` contains the structured answers extracted from the onboarding chatbot, including age, income, expenses, goals, horizon, emergency fund, debt, behaviour, experience, and existing investments.

### 10. `onboarding_conversations`
- `id` (UUID, PK)
- `user_id` (UUID, indexed, non-null)
- `conversation_id` (String, indexed, non-null)
- `role` (String, non-null)
- `message` (String, non-null)
- `extracted_json` (JSON, nullable)
- `graph_node` (String, nullable)
- `timestamp` (DateTimeTZ, server default now)

## Notes
- The backend creates missing tables at app startup via SQLAlchemy metadata.
- The schema currently maps to the `public` PostgreSQL schema used by Supabase.
