#!/usr/bin/env ts-node

import { DatabaseConnection } from '../database/connection.js';
import { MigrationRunner } from '../database/migration-runner.js';

async function runMigration() {
  try {
    console.log('🔄 Starting database migration...');
    
    // Get current project database connection
    const dbConnection = DatabaseConnection.getCurrentProjectConnection();
    console.log('✅ Connected to database');
    
    // Initialize migration runner
    const migrationRunner = new MigrationRunner(dbConnection);
    
    // Check current version
    const currentVersion = migrationRunner.getCurrentVersion();
    console.log(`📊 Current database version: ${currentVersion}`);
    
    // Run migrations
    await migrationRunner.runMigrations();
    
    // Check new version
    const newVersion = migrationRunner.getCurrentVersion();
    console.log(`🎯 Updated database version: ${newVersion}`);
    
    console.log('✅ Migration completed successfully!');
    
    // Test the new schema by checking columns
    console.log('\n🔍 Validating new schema...');
    const tableInfo = dbConnection.prepare('PRAGMA table_info(specs)').all();
    
    console.log('📋 Current specs table columns:');
    tableInfo.forEach((col: any) => {
      console.log(`  - ${col.name}: ${col.type}${col.notnull ? ' NOT NULL' : ''}${col.dflt_value ? ` DEFAULT ${col.dflt_value}` : ''}`);
    });
    
    // Check for new columns
    const expectedNewColumns = ['theme_category', 'priority', 'related_specs', 'parent_spec_id', 'created_via', 'last_command'];
    const existingColumns = tableInfo.map((col: any) => col.name);
    
    const missingColumns = expectedNewColumns.filter(col => !existingColumns.includes(col));
    if (missingColumns.length === 0) {
      console.log('✅ All new columns added successfully!');
    } else {
      console.log('❌ Missing columns:', missingColumns);
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  runMigration();
}

export { runMigration };