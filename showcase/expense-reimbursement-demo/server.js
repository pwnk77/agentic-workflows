const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const database = require('./lib/database');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware stack
app.use(cors({
    origin: ['http://localhost:3001', 'http://127.0.0.1:3001', 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
}));

app.use(express.json({ limit: '10mb' })); // Support base64 images
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: 'expense-demo-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // Set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Serve static files
app.use(express.static('public'));

// Request logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path} - User: ${req.session?.user?.email || 'anonymous'}`);
    next();
});

// Import routes
const claimsRoutes = require('./routes/claims');

// Mount routes
app.use('/api/claims', claimsRoutes);

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        session: req.session?.user ? { 
            email: req.session.user.email, 
            role: req.session.user.role 
        } : null
    });
});

// Demo login endpoint for quick role switching
app.post('/api/login', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const user = await database.get(
            'SELECT id, email, name, role FROM users WHERE email = ?', 
            [email]
        );

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        req.session.user = user;
        res.json({ message: 'Login successful', user: user });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({ error: 'Failed to logout' });
        }
        res.json({ message: 'Logout successful' });
    });
});

// Current user endpoint
app.get('/api/user', (req, res) => {
    if (!req.session?.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    res.json({ user: req.session.user });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Initialize database and start server
async function startServer() {
    try {
        await database.init();
        console.log('Database initialized successfully');

        app.listen(PORT, () => {
            console.log(`Expense Reimbursement Demo server running on http://localhost:${PORT}`);
            console.log('Demo users:');
            console.log('- employee@demo.com (Employee)');
            console.log('- manager@demo.com (Manager)');  
            console.log('- finance@demo.com (Finance)');
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('Shutting down gracefully...');
    await database.close();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    await database.close();
    process.exit(0);
});

startServer();