const express = require('express');
const database = require('../lib/database');
const { requireAuth, requireManagerOrFinance } = require('../middleware/auth');

const router = express.Router();

// GET /api/reports/summary - Monthly expense summary
router.get('/summary', requireAuth, requireManagerOrFinance, async (req, res) => {
    try {
        const query = `
            SELECT
                strftime('%Y-%m', expense_date) as month,
                COUNT(*) as total_claims,
                SUM(amount) as total_amount,
                AVG(amount) as avg_amount,
                COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_claims,
                COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_claims,
                COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_claims
            FROM claims
            WHERE expense_date >= date('now', '-12 months')
            GROUP BY strftime('%Y-%m', expense_date)
            ORDER BY month DESC
        `;

        const summary = await database.all(query);
        res.json({ summary });
    } catch (error) {
        console.error('Reports summary error:', error);
        res.status(500).json({ error: 'Failed to fetch expense summary' });
    }
});

// GET /api/reports/by-category - Expenses grouped by category
router.get('/by-category', requireAuth, requireManagerOrFinance, async (req, res) => {
    try {
        const query = `
            SELECT
                category,
                COUNT(*) as claim_count,
                SUM(amount) as total_amount,
                AVG(amount) as avg_amount,
                COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count,
                COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_count
            FROM claims
            WHERE expense_date >= date('now', '-12 months')
            GROUP BY category
            ORDER BY total_amount DESC
        `;

        const categories = await database.all(query);
        res.json({ categories });
    } catch (error) {
        console.error('Reports by category error:', error);
        res.status(500).json({ error: 'Failed to fetch category breakdown' });
    }
});

// GET /api/reports/by-department - Department spending summary
router.get('/by-department', requireAuth, requireManagerOrFinance, async (req, res) => {
    try {
        const query = `
            SELECT
                u.role as department,
                COUNT(c.id) as claim_count,
                SUM(c.amount) as total_amount,
                AVG(c.amount) as avg_amount,
                COUNT(CASE WHEN c.status = 'approved' THEN 1 END) as approved_count,
                COUNT(CASE WHEN c.status = 'rejected' THEN 1 END) as rejected_count
            FROM claims c
            JOIN users u ON c.employee_id = u.id
            WHERE c.expense_date >= date('now', '-12 months')
            GROUP BY u.role
            ORDER BY total_amount DESC
        `;

        const departments = await database.all(query);
        res.json({ departments });
    } catch (error) {
        console.error('Reports by department error:', error);
        res.status(500).json({ error: 'Failed to fetch department breakdown' });
    }
});

// GET /api/reports/approval-times - Average approval times
router.get('/approval-times', requireAuth, requireManagerOrFinance, async (req, res) => {
    try {
        const query = `
            SELECT
                strftime('%Y-%m', c.created_at) as month,
                c.category,
                AVG(JULIANDAY(r.reviewed_at) - JULIANDAY(c.created_at)) as avg_days_to_review,
                COUNT(*) as reviewed_claims,
                COUNT(CASE WHEN r.action = 'approved' THEN 1 END) as approved_count,
                COUNT(CASE WHEN r.action = 'rejected' THEN 1 END) as rejected_count
            FROM claims c
            JOIN reviews r ON c.id = r.claim_id
            WHERE c.created_at >= date('now', '-12 months')
            GROUP BY strftime('%Y-%m', c.created_at), c.category
            ORDER BY month DESC, c.category
        `;

        const approvalTimes = await database.all(query);
        res.json({ approval_times: approvalTimes });
    } catch (error) {
        console.error('Reports approval times error:', error);
        res.status(500).json({ error: 'Failed to fetch approval time metrics' });
    }
});

// GET /api/reports/dashboard-data - Combined data for dashboard
router.get('/dashboard-data', requireAuth, requireManagerOrFinance, async (req, res) => {
    try {
        // Get all report data in parallel
        const [summary, categories, departments, approvalTimes] = await Promise.all([
            database.all(`
                SELECT
                    strftime('%Y-%m', expense_date) as month,
                    COUNT(*) as total_claims,
                    SUM(amount) as total_amount,
                    AVG(amount) as avg_amount
                FROM claims
                WHERE expense_date >= date('now', '-6 months')
                GROUP BY strftime('%Y-%m', expense_date)
                ORDER BY month ASC
            `),
            database.all(`
                SELECT
                    category,
                    SUM(amount) as total_amount
                FROM claims
                WHERE expense_date >= date('now', '-12 months')
                GROUP BY category
                ORDER BY total_amount DESC
            `),
            database.all(`
                SELECT
                    u.role as department,
                    SUM(c.amount) as total_amount
                FROM claims c
                JOIN users u ON c.employee_id = u.id
                WHERE c.expense_date >= date('now', '-12 months')
                GROUP BY u.role
                ORDER BY total_amount DESC
            `),
            database.all(`
                SELECT
                    c.category,
                    AVG(JULIANDAY(r.reviewed_at) - JULIANDAY(c.created_at)) as avg_days_to_review
                FROM claims c
                JOIN reviews r ON c.id = r.claim_id
                WHERE c.created_at >= date('now', '-6 months')
                GROUP BY c.category
                ORDER BY avg_days_to_review DESC
            `)
        ]);

        res.json({
            monthly_trends: summary,
            category_breakdown: categories,
            department_spending: departments,
            approval_times: approvalTimes
        });
    } catch (error) {
        console.error('Dashboard data error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});

module.exports = router;