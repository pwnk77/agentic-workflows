-- Demo data seeding script for expense reimbursement system
-- This script populates the database with sample users and claims in various workflow states

-- Insert demo users with role hierarchy
INSERT INTO users (email, name, role, manager_id) VALUES 
    ('employee@demo.com', 'John Smith', 'employee', NULL),
    ('manager@demo.com', 'Sarah Johnson', 'manager', NULL),
    ('finance@demo.com', 'Michael Chen', 'finance', NULL);

-- Update employee to have manager relationship
UPDATE users SET manager_id = (SELECT id FROM users WHERE email = 'manager@demo.com') 
WHERE email = 'employee@demo.com';

-- Insert sample claims in different workflow states
INSERT INTO claims (employee_id, amount, category, expense_date, description, status) VALUES
    -- Pending review claims (waiting for manager)
    (
        (SELECT id FROM users WHERE email = 'employee@demo.com'),
        45.67,
        'meals',
        '2025-01-15',
        'Client dinner at downtown restaurant',
        'pending_review'
    ),
    (
        (SELECT id FROM users WHERE email = 'employee@demo.com'),
        120.00,
        'travel',
        '2025-01-16',
        'Uber rides for client meetings',
        'pending_review'
    ),
    
    -- Approved claims (waiting for finance processing)
    (
        (SELECT id FROM users WHERE email = 'employee@demo.com'),
        89.99,
        'supplies',
        '2025-01-10',
        'Office supplies for project',
        'approved'
    ),
    (
        (SELECT id FROM users WHERE email = 'employee@demo.com'),
        250.00,
        'equipment',
        '2025-01-12',
        'External monitor for workstation',
        'approved'
    ),
    
    -- Rejected claim (for demo purposes)
    (
        (SELECT id FROM users WHERE email = 'employee@demo.com'),
        500.00,
        'other',
        '2025-01-08',
        'Personal laptop purchase',
        'rejected'
    ),
    
    -- Paid claims (complete workflow)
    (
        (SELECT id FROM users WHERE email = 'employee@demo.com'),
        75.50,
        'meals',
        '2025-01-05',
        'Team lunch expense',
        'paid'
    );

-- Insert corresponding reviews for approved/rejected claims
INSERT INTO reviews (claim_id, reviewer_id, action, comments) VALUES
    -- Review for approved supply claim ($89.99)
    (
        (SELECT id FROM claims WHERE amount = 89.99 AND category = 'supplies'),
        (SELECT id FROM users WHERE email = 'manager@demo.com'),
        'approved',
        'Valid business expense, approved for processing.'
    ),
    -- Review for approved equipment claim ($250.00)
    (
        (SELECT id FROM claims WHERE amount = 250.00 AND category = 'equipment'),
        (SELECT id FROM users WHERE email = 'manager@demo.com'),
        'approved',
        'Monitor needed for productivity, approved.'
    ),
    -- Review for rejected personal laptop ($500.00)
    (
        (SELECT id FROM claims WHERE amount = 500.00 AND category = 'other'),
        (SELECT id FROM users WHERE email = 'manager@demo.com'),
        'rejected',
        'Personal equipment not covered by company policy.'
    ),
    -- Review for paid team lunch ($75.50)
    (
        (SELECT id FROM claims WHERE amount = 75.50 AND category = 'meals'),
        (SELECT id FROM users WHERE email = 'manager@demo.com'),
        'approved',
        'Team building expense approved.'
    );

-- Insert payments for paid claims
INSERT INTO payments (claim_id, processed_by, payment_date, reference_number) VALUES
    -- Payment for team lunch claim ($75.50)
    (
        (SELECT id FROM claims WHERE amount = 75.50 AND category = 'meals'),
        (SELECT id FROM users WHERE email = 'finance@demo.com'),
        '2025-01-07',
        'PAY-2025-001'
    );

-- Insert sample audit log entries to demonstrate audit trail
INSERT INTO audit_log (table_name, record_id, action, old_values, new_values, user_id) VALUES
    (
        'claims',
        (SELECT id FROM claims WHERE amount = 89.99 AND category = 'supplies'),
        'UPDATE',
        '{"status": "pending_review"}',
        '{"status": "approved"}',
        (SELECT id FROM users WHERE email = 'manager@demo.com')
    ),
    (
        'claims',
        (SELECT id FROM claims WHERE amount = 75.50 AND category = 'meals'),
        'UPDATE',
        '{"status": "approved"}',
        '{"status": "paid"}',
        (SELECT id FROM users WHERE email = 'finance@demo.com')
    );

-- Verify data insertion with counts
SELECT 
    'Data Summary' as info,
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM claims) as total_claims,
    (SELECT COUNT(*) FROM claims WHERE status = 'pending_review') as pending_claims,
    (SELECT COUNT(*) FROM claims WHERE status = 'approved') as approved_claims,
    (SELECT COUNT(*) FROM claims WHERE status = 'rejected') as rejected_claims,
    (SELECT COUNT(*) FROM claims WHERE status = 'paid') as paid_claims,
    (SELECT COUNT(*) FROM reviews) as total_reviews,
    (SELECT COUNT(*) FROM payments) as total_payments;