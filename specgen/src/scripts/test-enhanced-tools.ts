#!/usr/bin/env ts-node

import { SpecService, CreateSpecData } from '../services/spec.service.js';
import { SpecGroupingService } from '../services/grouping.service.js';
import { RelationshipService } from '../services/relationship.service.js';

async function testEnhancedTools() {
  try {
    console.log('🔄 Testing enhanced MCP tools...');
    
    // Test 1: SpecGroupingService
    console.log('\n1️⃣ Testing SpecGroupingService...');
    const featureGroup = SpecGroupingService.detectFeatureGroup(
      'User Authentication System', 
      'JWT tokens, login, password security, role-based access control'
    );
    console.log('✅ Detected feature group:', featureGroup);
    
    const themeCategory = SpecGroupingService.detectThemeCategory(featureGroup, 'backend API service');
    console.log('✅ Detected theme category:', themeCategory);
    
    const priority = SpecGroupingService.detectPriority(
      'Critical Security Feature',
      'authentication security critical system'
    );
    console.log('✅ Detected priority:', priority);
    
    // Test 2: Create spec with enhanced data
    console.log('\n2️⃣ Testing enhanced SpecService...');
    const specData: CreateSpecData = {
      title: 'Enhanced MCP Test Spec',
      body_md: '# Enhanced MCP Test\n\nTesting intelligent grouping and relationships.',
      status: 'draft',
      feature_group: featureGroup,
      theme_category: themeCategory,
      priority: priority,
      related_specs: [],
      created_via: 'enhanced-test'
    };
    
    const createdSpec = SpecService.createSpec(specData);
    console.log('✅ Created spec with enhanced fields:', {
      id: createdSpec.id,
      title: createdSpec.title,
      feature_group: createdSpec.feature_group,
      theme_category: createdSpec.theme_category,
      priority: createdSpec.priority,
      created_via: createdSpec.created_via
    });
    
    // Test 3: RelationshipService  
    console.log('\n3️⃣ Testing RelationshipService...');
    const relatedSpecs = RelationshipService.findRelatedSpecs(createdSpec, {
      limit: 3,
      minScore: 0.1
    });
    console.log('✅ Found related specs:', relatedSpecs.length);
    
    if (relatedSpecs.length > 0) {
      console.log('📋 Related specs:');
      relatedSpecs.forEach(rel => {
        console.log(`  - ${rel.title} (score: ${rel.score.toFixed(2)}, type: ${rel.relationship_type})`);
      });
    }
    
    // Test 4: Auto-detect relationships
    const autoRelationships = RelationshipService.autoDetectRelationships(createdSpec);
    console.log('✅ Auto-detected relationships:', {
      suggested_related: autoRelationships.suggested_related.length,
      suggested_parent: autoRelationships.suggested_parent?.title || 'none'
    });
    
    console.log('\n✅ All enhanced tools tested successfully!');
    
  } catch (error) {
    console.error('❌ Enhanced tools test failed:', error);
  }
}

if (require.main === module) {
  testEnhancedTools();
}