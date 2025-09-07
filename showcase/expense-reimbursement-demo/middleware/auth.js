// Authentication and role-based middleware

// Require authentication middleware
const requireAuth = (req, res, next) => {
    if (!req.session?.user) {
        return res.status(401).json({ 
            error: 'Authentication required',
            message: 'Please login to access this resource'
        });
    }
    next();
};

// Role-based authorization middleware factory
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.session?.user) {
            return res.status(401).json({ 
                error: 'Authentication required',
                message: 'Please login to access this resource'
            });
        }

        const userRole = req.session.user.role;
        
        // Convert single role to array for consistency
        const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
        
        if (!roles.includes(userRole)) {
            return res.status(403).json({ 
                error: 'Access forbidden',
                message: `This action requires one of the following roles: ${roles.join(', ')}`,
                userRole: userRole,
                requiredRoles: roles
            });
        }
        
        next();
    };
};

// Specific role middlewares for convenience
const requireEmployee = requireRole('employee');
const requireManager = requireRole('manager');
const requireFinance = requireRole('finance');

// Allow manager or finance roles (for viewing all claims)
const requireManagerOrFinance = requireRole(['manager', 'finance']);

// Employee ownership middleware - ensures user can only access their own claims
const requireOwnership = async (req, res, next) => {
    try {
        const database = require('../lib/database');
        const claimId = req.params.id;
        const userId = req.session.user.id;
        const userRole = req.session.user.role;

        // Managers and finance can access any claim
        if (userRole === 'manager' || userRole === 'finance') {
            return next();
        }

        // Employees can only access their own claims
        if (userRole === 'employee') {
            const claim = await database.get(
                'SELECT employee_id FROM claims WHERE id = ?',
                [claimId]
            );

            if (!claim) {
                return res.status(404).json({ error: 'Claim not found' });
            }

            if (claim.employee_id !== userId) {
                return res.status(403).json({ 
                    error: 'Access forbidden',
                    message: 'You can only access your own claims'
                });
            }
        }

        next();
    } catch (error) {
        console.error('Ownership check error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Middleware to check if claim is in correct state for action
const requireClaimState = (allowedStates) => {
    return async (req, res, next) => {
        try {
            const database = require('../lib/database');
            const claimId = req.params.id;
            
            const states = Array.isArray(allowedStates) ? allowedStates : [allowedStates];
            
            const claim = await database.get(
                'SELECT status FROM claims WHERE id = ?',
                [claimId]
            );

            if (!claim) {
                return res.status(404).json({ error: 'Claim not found' });
            }

            if (!states.includes(claim.status)) {
                return res.status(400).json({ 
                    error: 'Invalid claim state',
                    message: `Claim must be in one of these states: ${states.join(', ')}`,
                    currentState: claim.status,
                    allowedStates: states
                });
            }

            next();
        } catch (error) {
            console.error('Claim state check error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };
};

module.exports = {
    requireAuth,
    requireRole,
    requireEmployee,
    requireManager,
    requireFinance,
    requireManagerOrFinance,
    requireOwnership,
    requireClaimState
};