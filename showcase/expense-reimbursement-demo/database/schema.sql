-- Expense Reimbursement Demo - Database Schema
-- SQLite database with workflow state management

-- Enable foreign key support
PRAGMA foreign_keys = ON;

-- Users table with role-based access
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('employee', 'manager', 'finance')),
    manager_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (manager_id) REFERENCES users(id)
);

-- Claims table for expense submissions
CREATE TABLE claims (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    category TEXT NOT NULL CHECK (category IN ('meals', 'travel', 'supplies', 'equipment', 'other')),
    expense_date DATE NOT NULL,
    description TEXT,
    receipt_data TEXT, -- Base64 encoded image data
    receipt_filename TEXT,
    status TEXT NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'approved', 'rejected', 'paid')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES users(id)
);

-- Reviews table for manager approval/rejection
CREATE TABLE reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    claim_id INTEGER NOT NULL,
    reviewer_id INTEGER NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('approved', 'rejected')),
    comments TEXT,
    reviewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (claim_id) REFERENCES claims(id),
    FOREIGN KEY (reviewer_id) REFERENCES users(id),
    UNIQUE(claim_id) -- One review per claim
);

-- Payments table for finance processing
CREATE TABLE payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    claim_id INTEGER NOT NULL,
    processed_by INTEGER NOT NULL,
    payment_date DATE NOT NULL,
    payment_method TEXT DEFAULT 'bank_transfer',
    reference_number TEXT,
    processed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (claim_id) REFERENCES claims(id),
    FOREIGN KEY (processed_by) REFERENCES users(id),
    UNIQUE(claim_id) -- One payment per claim
);

-- Audit log for state transition tracking
CREATE TABLE audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_name TEXT NOT NULL,
    record_id INTEGER NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values TEXT, -- JSON format
    new_values TEXT, -- JSON format
    user_id INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Trigger to update claims.updated_at on any change
CREATE TRIGGER update_claims_timestamp 
    AFTER UPDATE ON claims
BEGIN
    UPDATE claims SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Trigger to audit claims state changes
CREATE TRIGGER audit_claims_changes
    AFTER UPDATE ON claims
BEGIN
    INSERT INTO audit_log (table_name, record_id, action, old_values, new_values, user_id)
    VALUES (
        'claims',
        NEW.id,
        'UPDATE',
        json_object('status', OLD.status, 'amount', OLD.amount),
        json_object('status', NEW.status, 'amount', NEW.amount),
        NEW.employee_id
    );
END;

-- Performance indexes for dashboard queries

-- Index for claims by status (manager/finance dashboards)
CREATE INDEX idx_claims_status ON claims(status);

-- Index for claims by employee (employee dashboard)
CREATE INDEX idx_claims_employee ON claims(employee_id);

-- Index for claims by date (reporting and sorting)
CREATE INDEX idx_claims_date ON claims(expense_date);

-- Index for claims by status and date (filtered dashboards)
CREATE INDEX idx_claims_status_date ON claims(status, expense_date);

-- Index for reviews by claim (join optimization)
CREATE INDEX idx_reviews_claim ON reviews(claim_id);

-- Index for payments by claim (join optimization)
CREATE INDEX idx_payments_claim ON payments(claim_id);

-- Index for audit log by table and record (audit trail queries)
CREATE INDEX idx_audit_log_record ON audit_log(table_name, record_id);

-- Index for audit log by timestamp (recent activity)
CREATE INDEX idx_audit_log_timestamp ON audit_log(timestamp DESC);