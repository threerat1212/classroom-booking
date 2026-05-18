> For full workflow context, see docs/project-workflow.md.

# Database Entity-Relationship Diagram (ERD)

> Updated: 2026-05-16 after Phase 3.1-3.2 migrations applied

## Schema Overview

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│     users       │◄─────┤   portfolios     │─────►│    debtors      │
└─────────────────┘      └──────────────────┘      └─────────────────┘
        ▲                         ▲                         ▲
        │                         │                    ┌────┼────┬────────┐
        │                         │                    │    │    │        │
        │                    ┌────┴─────────────┐      │    │    │        │
        └────────────────────┤ assignments      │      │    │    │        │
                             └────────────────┬─┘      │    │    │        │
                                       ▲      │        │    │    │        │
        ┌────────────────────────────┐ │      │        │    │    │        │
        │                            │ │      │        │    │    │        │
    ┌───┴─────┬──────────────────────┴─┤      │        │    │    │        │
    │         │                        │      │        │    │    │        │
┌───┴──────┐┌────────────┐  ┌──────────┴──┐ ┌─┴──────────────────┤        │
│call_      ││  payments  │  │discount_    │ │                   │        │
│records   ││            │  │requests     │ │                   │        │
└────┬─────┘└────────────┘  └──────┬──────┘ │                   │        │
     │                             │        │                   │        │
     │              ┌──────────────┴────────┴───┐                │        │
     │              │                          │                │        │
┌────┴────────┐ ┌───┴───────────┐  ┌──────────┴──────┐   ┌─────┴───────┐
│import_      │ │import_log_    │  │export_          │   │             │
│sessions    │ │entries        │  │history          │   │(future)     │
└─────────────┘ └───────────────┘  └─────────────────┘   │audit_log    │
                                                          └─────────────┘
```

## Detailed Table Definitions

### users
- **Purpose**: Authentication & RBAC
- **Audit**: `created_at`, `updated_at`, `deleted_at`
- **Key fields**: `email` (unique), `password_hash`, `role` (Admin|Supervisor|Agent), `employee_id`, `department`, `status`
- **Indexes**: `idx_users_role`, `idx_users_status`, `idx_users_employee_id`

### portfolios
- **Purpose**: Debt portfolio grouping (CIMB Auto, SCB Auto, etc.)
- **Audit**: `created_at`, `updated_at`, `deleted_at`, `created_by`, `updated_by`
- **Key fields**: `code` (unique), `name`, `description`
- **Indexes**: `idx_portfolios_code`, `idx_portfolios_created_at (WHERE deleted_at IS NULL)`

### debtors
- **Purpose**: Core debtor/contract records
- **Audit**: `created_at`, `updated_at`, `deleted_at`, `created_by`, `updated_by`, `version` (OCC)
- **Key fields**:
  - Identity: `contract_no` (unique), `customer_name`, `phone1/2`, `address`, `plate_no`
  - Financial: `outstanding_balance`, `approved_amount`, `paid_amount` (all `numeric(18,2)`)
  - Status: `dpd` (integer), `bucket` (1-30, 31-60, 61-90, 90-120, 120+, Legal), `status` (Active, Legal, Closed)
  - Assignment: `supervisor_id`, `assigned_to`, `next_call_date`
  - FK: `portfolio_id` → portfolios
- **Indexes**: `idx_debtors_portfolio_id`, `idx_debtors_assigned_to`, `idx_debtors_status`, `idx_debtors_bucket`, `idx_debtors_dpd`
- **Constraints**: `check_outstanding_balance_non_negative`, `check_dpd_non_negative`

### assignments
- **Purpose**: Agent job assignments (debtor → agent)
- **Audit**: `created_at`, `updated_at`, `deleted_at`, `created_by`, `updated_by`, `version` (future OCC)
- **Key fields**: `status` (Active, Completed, Returned, Unassigned), `priority` (Low, Normal, High, Urgent)
- **FKs**: `debtor_id` → debtors, `agent_id` → users, `supervisor_id` → users
- **Indexes**: `idx_assignments_agent_id (WHERE status='Active')`, `idx_assignments_debtor_id`

### call_records (append-only)
- **Purpose**: Call event log
- **Audit**: `created_at`, `deleted_at`, `created_by` (no update)
- **Key fields**: `phone_type`, `action` (Inbound, Outbound, SMS, Email, Visit), `result` (Connected, CB, PTP, Paid, NoAnswer, etc.), `remark`
- **PTP fields**: `ptp_date`, `ptp_amount`, `ptp_installment` (nullable, required if result=PTP)
- **FKs**: `debtor_id` → debtors, `agent_id` → users
- **Indexes**: `idx_call_records_debtor_id`, `idx_call_records_agent_id`, `idx_call_records_result`

### payments
- **Purpose**: Cash collection record
- **Audit**: `created_at`, `updated_at`, `deleted_at`, `created_by`
- **Key fields**: `bill_no` (unique per debtor + debtor_id), `amount` (`numeric(18,2)`), `paid_at`
- **FKs**: `debtor_id` → debtors, `agent_id` → users (nullable, staff collections)
- **Constraints**: `UNIQUE(debtor_id, bill_no)` (idempotency)

### discount_requests
- **Purpose**: Agent discount-request workflow with supervisor approval
- **Audit**: `created_at`, `updated_at`, `deleted_at`, `created_by`, `updated_by`, `version` (OCC)
- **Key fields**: 
  - Request: `requested_amount`, `reason`, `status` (Pending, Approved, Rejected, Returned)
  - Approval: `approved_amount`, `supervisor_remark`, `reviewed_by`, `reviewed_at`
- **FKs**: `debtor_id` → debtors, `agent_id` → users, `reviewed_by` → users
- **Indexes**: `idx_discount_requests_status (WHERE status='Pending')`
- **OCC**: `version` incremented on each state change (Pending→Approved/Rejected/Returned)

### import_sessions
- **Purpose**: Batch import progress tracking
- **Audit**: `created_at`, `updated_at`, `deleted_at`
- **Key fields**: `file_name`, `total_rows`, `success_rows`, `error_rows`, `skipped_rows`, `status` (Processing, Completed, PartialFailed, Failed)
- **FK**: `imported_by` → users
- **Indexes**: `idx_import_sessions_imported_by`, `idx_import_sessions_status`

### import_log_entries
- **Purpose**: Per-row import log for errors/audit
- **Audit**: `created_at`, `deleted_at` (no update)
- **Key fields**: `row_number`, `contract_no`, `customer_name`, `status` (Pending, Success, Error, Skipped), `error_message`
- **FK**: `session_id` → import_sessions
- **Indexes**: `idx_import_log_entries_session_id`, `idx_import_log_entries_status`

### export_history
- **Purpose**: Report generation audit log
- **Audit**: `created_at`, `deleted_at`
- **Key fields**: `type` (DebtorReport, PTPReport, PaymentReport, CallReport, etc.), `total_rows`, `file_format` (xlsx, csv, pdf), `file_path`, `status` (Processing, Completed, Failed)
- **FK**: `exported_by` → users
- **Indexes**: `idx_export_history_type`, `idx_export_history_created_at`

## Key Design Decisions

| Decision | Implementation | Rationale |
| --- | --- | --- |
| **Money** | `numeric(18,2)` | Avoids IEEE-754 float rounding errors |
| **Enums** | `text + CHECK` constraint | Easier migrations than PG `ENUM` type |
| **IDs** | UUID v4 `gen_random_uuid()` | Consistent with existing schema |
| **Concurrency** | `version int`, `WHERE version=$X` on UPDATE | OCC for discount_requests, future use for assignments |
| **Soft delete** | `deleted_at TIMESTAMPTZ` | All queries filter `WHERE deleted_at IS NULL` |
| **Indexes** | Partial: `WHERE deleted_at IS NULL` | Reduces index size, speeds active-only queries |
| **Pagination** | `LIMIT $limit OFFSET $offset` | Standard offset-based; upgrade to keyset if list > 100k rows |
| **DPD bucket** | Stored + derived (not computed on read) | Immutable at row-insert; recomputed on daily batch job |

## Migration History

- `000001_init.up.sql` — users table (existing)
- `000002_roles_and_user_fields.up.sql` — extend users with role/dept/status
- `000003_portfolios.up.sql` — portfolios table
- `000004_debtors.up.sql` — main debtor table with FKs & indexes
- `000005_debtor_constraints.up.sql` — monetary & DPD non-negative checks
- `000006_assignments.up.sql` — debtor-agent job assignments
- `000007_call_records.up.sql` — append-only call log
- `000008_payments.up.sql` — cash collection ledger
- `000009_discount_requests.up.sql` — approval workflow with OCC
- `000010_import_sessions.up.sql` — batch import tracking
- `000011_import_log_entries.up.sql` — per-row error audit
- `000012_export_history.up.sql` — report generation log
- `000013_seed_portfolios.up.sql` — dev data (5 portfolios)
- `000014_seed_users.up.sql` — dev data (1 admin, 1 supervisor, 3 agents)
- `000015_add_audit_to_portfolios.up.sql` — audit columns on portfolios
