#!/usr/bin/env ts-node

import { DatabaseConnection } from '../database/connection';

async function testDatabaseWrite() {
  try {
    console.log('🔄 Testing database write functionality...');
    
    // Get current project database connection
    const dbConnection = DatabaseConnection.getCurrentProjectConnection();
    console.log('✅ Connected to database');
    
    // Test write operation directly
    const result = dbConnection.prepare(`
      INSERT INTO specs (title, body_md, status, feature_group, theme_category, priority, created_via)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      'Test Write Spec',
      '# Test Write Spec\n\nTesting database write after migration.',
      'draft',
      'integration', 
      'integration',
      'low',
      'direct-test'
    );
    
    console.log('✅ Write test successful! Inserted spec with ID:', result.lastInsertRowid);
    
    // Test read back
    const spec = dbConnection.prepare('SELECT * FROM specs WHERE id = ?').get(result.lastInsertRowid) as any;
    console.log('📋 Read back spec:', {
      id: spec.id,
      title: spec.title,
      theme_category: spec.theme_category,
      priority: spec.priority,
      created_via: spec.created_via
    });
    
    console.log('✅ Database write/read test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    
    // Check database mode
    try {
      const dbConnection = DatabaseConnection.getCurrentProjectConnection();
      const mode = dbConnection.prepare('PRAGMA query_only').get();
      console.log('📊 Database mode:', mode);
      
      const readonlyCheck = dbConnection.prepare('PRAGMA journal_mode').get();
      console.log('📊 Journal mode:', readonlyCheck);
      
    } catch (pragmaError) {
      console.error('❌ Could not check database mode:', pragmaError);
    }
  }
}

if (require.main === module) {
  testDatabaseWrite();
}