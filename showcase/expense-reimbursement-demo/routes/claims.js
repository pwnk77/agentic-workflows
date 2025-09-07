const express = require('express');
const database = require('../lib/database');
const { requireAuth, requireEmployee, requireManagerOrFinance, requireFinance, requireOwnership, requireClaimState } = require('../middleware/auth');
const { validateClaimSubmission, validateClaimReview, validatePaymentProcessing, validateNumericId } = require('../middleware/validation');

const router = express.Router();

// GET /api/claims - List claims based on user role
router.get('/', requireAuth, async (req, res) => {
    try {
        const { role, id: userId } = req.session.user;
        let query, params;

        switch (role) {
            case 'employee':
                // Employees see only their own claims
                query = `
                    SELECT c.*, u.name as employee_name, u.email as employee_email,
                           r.action as review_action, r.comments as review_comments,
                           r.reviewed_at, p.payment_date, p.reference_number
                    FROM claims c
                    JOIN users u ON c.employee_id = u.id
                    LEFT JOIN reviews r ON c.id = r.claim_id
                    LEFT JOIN payments p ON c.id = p.claim_id
                    WHERE c.employee_id = ?
                    ORDER BY c.created_at DESC
                `;
                params = [userId];
                break;
                
            case 'manager':
                // Managers see all claims for review
                query = `
                    SELECT c.*, u.name as employee_name, u.email as employee_email,
                           r.action as review_action, r.comments as review_comments,
                           r.reviewed_at, p.payment_date, p.reference_number
                    FROM claims c
                    JOIN users u ON c.employee_id = u.id
                    LEFT JOIN reviews r ON c.id = r.claim_id
                    LEFT JOIN payments p ON c.id = p.claim_id
                    ORDER BY c.status = 'pending_review' DESC, c.created_at DESC
                `;
                params = [];
                break;
                
            case 'finance':
                // Finance sees approved claims for processing
                query = `
                    SELECT c.*, u.name as employee_name, u.email as employee_email,
                           r.action as review_action, r.comments as review_comments,
                           r.reviewed_at, p.payment_date, p.reference_number
                    FROM claims c
                    JOIN users u ON c.employee_id = u.id
                    LEFT JOIN reviews r ON c.id = r.claim_id
                    LEFT JOIN payments p ON c.id = p.claim_id
                    WHERE c.status IN ('approved', 'paid')
                    ORDER BY c.status = 'approved' DESC, c.created_at DESC
                `;
                params = [];
                break;
                
            default:
                return res.status(403).json({ error: 'Invalid user role' });
        }

        const claims = await database.all(query, params);
        res.json({ claims });
    } catch (error) {
        console.error('Get claims error:', error);
        res.status(500).json({ error: 'Failed to fetch claims' });
    }
});

// GET /api/claims/:id - Get single claim details
router.get('/:id', requireAuth, validateNumericId, requireOwnership, async (req, res) => {
    try {
        const claimId = req.params.id;
        
        const query = `
            SELECT c.*, u.name as employee_name, u.email as employee_email,
                   r.action as review_action, r.comments as review_comments,
                   r.reviewed_at, reviewer.name as reviewer_name,
                   p.payment_date, p.reference_number, p.payment_method,
                   processor.name as processor_name
            FROM claims c
            JOIN users u ON c.employee_id = u.id
            LEFT JOIN reviews r ON c.id = r.claim_id
            LEFT JOIN users reviewer ON r.reviewer_id = reviewer.id
            LEFT JOIN payments p ON c.id = p.claim_id
            LEFT JOIN users processor ON p.processed_by = processor.id
            WHERE c.id = ?
        `;

        const claim = await database.get(query, [claimId]);
        
        if (!claim) {
            return res.status(404).json({ error: 'Claim not found' });
        }

        res.json({ claim });
    } catch (error) {
        console.error('Get claim error:', error);
        res.status(500).json({ error: 'Failed to fetch claim details' });
    }
});

// POST /api/claims - Submit new expense claim
router.post('/', requireAuth, requireEmployee, validateClaimSubmission, async (req, res) => {
    try {
        const { amount, category, expense_date, description, receipt_data, receipt_filename } = req.body;
        const employeeId = req.session.user.id;

        const result = await database.run(`
            INSERT INTO claims (employee_id, amount, category, expense_date, description, receipt_data, receipt_filename)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [employeeId, amount, category, expense_date, description || null, receipt_data || null, receipt_filename || null]);

        const claim = await database.get(`
            SELECT c.*, u.name as employee_name, u.email as employee_email
            FROM claims c
            JOIN users u ON c.employee_id = u.id
            WHERE c.id = ?
        `, [result.id]);

        res.status(201).json({ 
            message: 'Claim submitted successfully',
            claim: claim
        });
    } catch (error) {
        console.error('Create claim error:', error);
        res.status(500).json({ error: 'Failed to submit claim' });
    }
});

// POST /api/claims/:id/review - Manager review (approve/reject)
router.post('/:id/review', 
    requireAuth, 
    requireManagerOrFinance, 
    validateNumericId, 
    validateClaimReview,
    requireClaimState('pending_review'),
    async (req, res) => {
        try {
            const claimId = req.params.id;
            const { action, comments } = req.body;
            const reviewerId = req.session.user.id;

            // Start transaction
            await database.run('BEGIN TRANSACTION');

            try {
                // Update claim status
                await database.run(
                    'UPDATE claims SET status = ? WHERE id = ?',
                    [action, claimId]
                );

                // Insert review record
                await database.run(`
                    INSERT INTO reviews (claim_id, reviewer_id, action, comments)
                    VALUES (?, ?, ?, ?)
                `, [claimId, reviewerId, action, comments || null]);

                // Commit transaction
                await database.run('COMMIT');

                // Return updated claim
                const updatedClaim = await database.get(`
                    SELECT c.*, u.name as employee_name, u.email as employee_email,
                           r.action as review_action, r.comments as review_comments,
                           r.reviewed_at, reviewer.name as reviewer_name
                    FROM claims c
                    JOIN users u ON c.employee_id = u.id
                    LEFT JOIN reviews r ON c.id = r.claim_id
                    LEFT JOIN users reviewer ON r.reviewer_id = reviewer.id
                    WHERE c.id = ?
                `, [claimId]);

                res.json({ 
                    message: `Claim ${action} successfully`,
                    claim: updatedClaim
                });
            } catch (error) {
                await database.run('ROLLBACK');
                throw error;
            }
        } catch (error) {
            console.error('Review claim error:', error);
            res.status(500).json({ error: 'Failed to review claim' });
        }
    }
);

// POST /api/claims/:id/process - Finance processing (mark as paid)
router.post('/:id/process', 
    requireAuth, 
    requireFinance, 
    validateNumericId, 
    validatePaymentProcessing,
    requireClaimState('approved'),
    async (req, res) => {
        try {
            const claimId = req.params.id;
            const { payment_date, payment_method, reference_number } = req.body;
            const processorId = req.session.user.id;

            // Start transaction
            await database.run('BEGIN TRANSACTION');

            try {
                // Update claim status to paid
                await database.run(
                    'UPDATE claims SET status = ? WHERE id = ?',
                    ['paid', claimId]
                );

                // Insert payment record
                await database.run(`
                    INSERT INTO payments (claim_id, processed_by, payment_date, payment_method, reference_number)
                    VALUES (?, ?, ?, ?, ?)
                `, [claimId, processorId, payment_date, payment_method || 'bank_transfer', reference_number || null]);

                // Commit transaction
                await database.run('COMMIT');

                // Return updated claim with payment info
                const updatedClaim = await database.get(`
                    SELECT c.*, u.name as employee_name, u.email as employee_email,
                           r.action as review_action, r.comments as review_comments,
                           r.reviewed_at, reviewer.name as reviewer_name,
                           p.payment_date, p.reference_number, p.payment_method,
                           processor.name as processor_name
                    FROM claims c
                    JOIN users u ON c.employee_id = u.id
                    LEFT JOIN reviews r ON c.id = r.claim_id
                    LEFT JOIN users reviewer ON r.reviewer_id = reviewer.id
                    LEFT JOIN payments p ON c.id = p.claim_id
                    LEFT JOIN users processor ON p.processed_by = processor.id
                    WHERE c.id = ?
                `, [claimId]);

                res.json({ 
                    message: 'Payment processed successfully',
                    claim: updatedClaim
                });
            } catch (error) {
                await database.run('ROLLBACK');
                throw error;
            }
        } catch (error) {
            console.error('Process payment error:', error);
            res.status(500).json({ error: 'Failed to process payment' });
        }
    }
);

module.exports = router;