#!/usr/bin/env ts-node

import { DatabaseConnection } from '../database/connection';

async function rebuildFTS() {
  try {
    console.log('🔄 Rebuilding FTS (Full Text Search) table...');
    
    const db = DatabaseConnection.getCurrentProjectConnection();
    
    // Rebuild the FTS table to include all current specs
    console.log('📊 Rebuilding FTS index...');
    db.exec('INSERT INTO specs_fts(specs_fts) VALUES(\'rebuild\')');
    
    // Test the FTS functionality
    const testResults = db.prepare(`
      SELECT s.*, bm25(specs_fts) as score
      FROM specs s
      JOIN specs_fts ON s.id = specs_fts.rowid
      WHERE specs_fts MATCH ?
      ORDER BY score DESC
      LIMIT 5
    `).all('test');
    
    console.log('✅ FTS rebuilt successfully!');
    console.log('📋 Test search results for "test":', testResults.length, 'results');
    
    if (testResults.length > 0) {
      testResults.forEach((result: any, index: number) => {
        console.log(`  ${index + 1}. ${result.title} (score: ${result.score.toFixed(2)})`);
      });
    }
    
    // Test with other keywords
    const authResults = db.prepare(`
      SELECT s.*, bm25(specs_fts) as score
      FROM specs s
      JOIN specs_fts ON s.id = specs_fts.rowid
      WHERE specs_fts MATCH ?
      ORDER BY score DESC
      LIMIT 3
    `).all('auth authentication');
    
    console.log('📋 Search results for "auth authentication":', authResults.length, 'results');
    
  } catch (error) {
    console.error('❌ FTS rebuild failed:', error);
  }
}

if (require.main === module) {
  rebuildFTS();
}