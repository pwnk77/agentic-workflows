#!/usr/bin/env ts-node

import { SpecService } from '../services/spec.service.js';

async function testSearch() {
  try {
    console.log('🔄 Testing SpecService search functionality...');
    
    // Test with very low min_score to see if there are any results
    const results1 = SpecService.searchSpecs('test', { min_score: 0.0, limit: 5 });
    console.log('📋 Search "test" (min_score: 0.0):', results1.results.length, 'results');
    
    results1.results.forEach((result: any, index: number) => {
      console.log(`  ${index + 1}. ${result.title} (score: ${result.score})`);
    });
    
    // Test with default parameters  
    const results2 = SpecService.searchSpecs('test');
    console.log('📋 Search "test" (default):', results2.results.length, 'results');
    
    // Test with authentication keywords
    const results3 = SpecService.searchSpecs('authentication auth', { min_score: 0.0 });
    console.log('📋 Search "authentication auth":', results3.results.length, 'results');
    
    // Test with enhanced keywords
    const results4 = SpecService.searchSpecs('enhanced MCP', { min_score: 0.0 });
    console.log('📋 Search "enhanced MCP":', results4.results.length, 'results');
    
  } catch (error) {
    console.error('❌ Search test failed:', error);
  }
}

if (require.main === module) {
  testSearch();
}