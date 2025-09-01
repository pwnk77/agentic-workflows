#!/usr/bin/env ts-node

import { DatabaseConnection } from '../database/connection.js';
import { SpecService } from '../services/spec.service.js';

async function testFreshConnection() {
  try {
    console.log('🔄 Testing with fresh database connection...');
    
    // Force close all existing connections
    DatabaseConnection.closeAllConnections();
    console.log('✅ Closed all cached connections');
    
    // Test direct search with fresh connection
    console.log('\n1️⃣ Testing direct SpecService search...');
    const results = SpecService.searchSpecs('test', { min_score: -10.0, limit: 5 });
    console.log('📋 Search results:', results.results.length);
    
    results.results.forEach((result: any, index: number) => {
      console.log(`  ${index + 1}. ${result.title} (score: ${result.score})`);
    });
    
    // Test create with new schema
    console.log('\n2️⃣ Testing create with new schema...');
    try {
      const timestamp = Date.now();
      const newSpec = SpecService.createSpec({
        title: `Fresh Connection Test Spec ${timestamp}`,
        body_md: '# Fresh Connection Test\n\nTesting after clearing connection cache.',
        status: 'draft',
        feature_group: 'testing',
        theme_category: 'general',
        priority: 'low',
        created_via: 'fresh-connection-test'
      });
      
      console.log('✅ Created spec with new schema:', {
        id: newSpec.id,
        title: newSpec.title,
        feature_group: newSpec.feature_group,
        theme_category: newSpec.theme_category,
        created_via: newSpec.created_via
      });
    } catch (createError) {
      console.error('❌ Create failed:', createError);
    }
    
    // Test search again after creating new spec
    console.log('\n3️⃣ Testing search after new spec creation...');
    const newResults = SpecService.searchSpecs('fresh connection', { min_score: -10.0 });
    console.log('📋 New search results:', newResults.results.length);
    
    // List all specs to verify data
    console.log('\n4️⃣ Listing all specs to verify data...');
    const allSpecs = SpecService.listSpecs({ limit: 10 });
    console.log('📋 Total specs in database:', allSpecs.pagination.total);
    
    allSpecs.specs.forEach((spec, index) => {
      console.log(`  ${index + 1}. ${spec.title} (${spec.feature_group || 'no-group'}) [${spec.created_via || 'unknown'}]`);
    });
    
  } catch (error) {
    console.error('❌ Fresh connection test failed:', error);
  }
}

if (require.main === module) {
  testFreshConnection();
}