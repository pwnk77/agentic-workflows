// Input validation middleware

// Validate expense claim submission
const validateClaimSubmission = (req, res, next) => {
    const { amount, category, expense_date, description, receipt_data } = req.body;
    const errors = [];

    // Validate amount
    if (!amount) {
        errors.push('Amount is required');
    } else {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            errors.push('Amount must be a positive number');
        }
        if (numAmount > 10000) {
            errors.push('Amount exceeds maximum limit of $10,000');
        }
    }

    // Validate category
    const validCategories = ['meals', 'travel', 'supplies', 'equipment', 'other'];
    if (!category) {
        errors.push('Category is required');
    } else if (!validCategories.includes(category)) {
        errors.push(`Category must be one of: ${validCategories.join(', ')}`);
    }

    // Validate expense date
    if (!expense_date) {
        errors.push('Expense date is required');
    } else {
        const expenseDate = new Date(expense_date);
        const today = new Date();
        today.setHours(23, 59, 59, 999); // End of today
        
        if (isNaN(expenseDate.getTime())) {
            errors.push('Invalid expense date format');
        } else if (expenseDate > today) {
            errors.push('Expense date cannot be in the future');
        }
        
        // Check if date is more than 90 days old
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        
        if (expenseDate < ninetyDaysAgo) {
            errors.push('Expense date cannot be more than 90 days old');
        }
    }

    // Validate description (optional but has length limit)
    if (description && description.length > 500) {
        errors.push('Description cannot exceed 500 characters');
    }

    // Validate receipt data if provided
    if (receipt_data) {
        if (typeof receipt_data !== 'string' || !receipt_data.startsWith('data:image/')) {
            errors.push('Receipt must be a valid base64 image data URL');
        }
        
        // Check file size (base64 is roughly 33% larger than original)
        const estimatedSize = (receipt_data.length * 0.75) / 1024 / 1024; // MB
        if (estimatedSize > 5) {
            errors.push('Receipt image must be smaller than 5MB');
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({ 
            error: 'Validation failed',
            errors: errors
        });
    }

    next();
};

// Validate claim review (approve/reject)
const validateClaimReview = (req, res, next) => {
    const { action, comments } = req.body;
    const errors = [];

    // Validate action
    const validActions = ['approved', 'rejected'];
    if (!action) {
        errors.push('Action is required');
    } else if (!validActions.includes(action)) {
        errors.push(`Action must be one of: ${validActions.join(', ')}`);
    }

    // Validate comments
    if (comments && comments.length > 1000) {
        errors.push('Comments cannot exceed 1000 characters');
    }

    // Require comments for rejection
    if (action === 'rejected' && (!comments || comments.trim().length === 0)) {
        errors.push('Comments are required when rejecting a claim');
    }

    if (errors.length > 0) {
        return res.status(400).json({ 
            error: 'Validation failed',
            errors: errors
        });
    }

    next();
};

// Validate payment processing
const validatePaymentProcessing = (req, res, next) => {
    const { payment_date, payment_method, reference_number } = req.body;
    const errors = [];

    // Validate payment date
    if (!payment_date) {
        errors.push('Payment date is required');
    } else {
        const paymentDate = new Date(payment_date);
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        
        if (isNaN(paymentDate.getTime())) {
            errors.push('Invalid payment date format');
        } else if (paymentDate > today) {
            errors.push('Payment date cannot be in the future');
        }
    }

    // Validate payment method (optional, default to bank_transfer)
    if (payment_method) {
        const validMethods = ['bank_transfer', 'check', 'cash', 'other'];
        if (!validMethods.includes(payment_method)) {
            errors.push(`Payment method must be one of: ${validMethods.join(', ')}`);
        }
    }

    // Validate reference number (optional but has length limit)
    if (reference_number && reference_number.length > 100) {
        errors.push('Reference number cannot exceed 100 characters');
    }

    if (errors.length > 0) {
        return res.status(400).json({ 
            error: 'Validation failed',
            errors: errors
        });
    }

    next();
};

// Validate numeric ID parameter
const validateNumericId = (req, res, next) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id) || id <= 0) {
        return res.status(400).json({ 
            error: 'Invalid ID',
            message: 'ID must be a positive integer'
        });
    }
    
    req.params.id = id; // Convert to integer
    next();
};

module.exports = {
    validateClaimSubmission,
    validateClaimReview,
    validatePaymentProcessing,
    validateNumericId
};