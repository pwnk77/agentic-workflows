const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

class Database {
    constructor() {
        this.db = null;
    }

    init() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database('expense_demo.db', (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                
                console.log('Connected to SQLite database');
                this.setupDatabase()
                    .then(() => resolve())
                    .catch(reject);
            });
        });
    }

    async setupDatabase() {
        try {
            // Check if tables exist
            const tableExists = await this.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'");
            
            if (!tableExists) {
                // Tables don't exist, create them
                console.log('Creating database tables...');
                
                // Read and execute initialization script
                const initSQL = fs.readFileSync(path.join(__dirname, '../database/init.sql'), 'utf8');
                await this.exec(initSQL);

                // Read and execute schema script
                const schemaSQL = fs.readFileSync(path.join(__dirname, '../database/schema.sql'), 'utf8');
                await this.exec(schemaSQL);
                
                console.log('Database schema created successfully');
            } else {
                console.log('Database tables already exist, skipping schema creation');
                
                // Just apply optimizations
                const initSQL = fs.readFileSync(path.join(__dirname, '../database/init.sql'), 'utf8');
                await this.exec(initSQL);
            }

            // Check if data already exists
            const userCount = await this.get('SELECT COUNT(*) as count FROM users');
            if (userCount.count === 0) {
                // Read and execute seed script only if no data exists
                const seedSQL = fs.readFileSync(path.join(__dirname, '../database/seed.sql'), 'utf8');
                await this.exec(seedSQL);
                console.log('Demo data seeded successfully');
            } else {
                console.log('Demo data already exists, skipping seeding');
            }
        } catch (error) {
            console.error('Database setup error:', error);
            throw error;
        }
    }

    exec(sql) {
        return new Promise((resolve, reject) => {
            this.db.exec(sql, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, changes: this.changes });
            });
        });
    }

    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    close() {
        return new Promise((resolve) => {
            if (this.db) {
                this.db.close((err) => {
                    if (err) console.error('Error closing database:', err);
                    else console.log('Database connection closed');
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }
}

module.exports = new Database();