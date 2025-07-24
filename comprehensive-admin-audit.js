#!/usr/bin/env node
/**
 * Comprehensive Admin Dashboard Audit Script
 * Tests all admin functionality to identify broken features
 */

import http from 'http';
import fs from 'fs';

// Test configuration
const BASE_URL = 'http://localhost:5000';
let authCookies = '';

// Helper function to make HTTP requests
function makeRequest(method, path, data = null, cookies = '') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: parsed
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: responseData
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Test admin authentication
async function testAdminAuth() {
  console.log('\n🔐 Testing Admin Authentication...');
  
  try {
    const response = await makeRequest('POST', '/api/auth/login', {
      username: 'marty@onlinechannel.tv',
      password: '123456'
    });
    
    if (response.status === 200) {
      // Extract session cookie
      const setCookie = response.headers['set-cookie'];
      if (setCookie) {
        authCookies = setCookie.join('; ');
        console.log('✅ Admin login successful');
        return true;
      } else {
        console.log('❌ No session cookie received');
        return false;
      }
    } else {
      console.log(`❌ Admin login failed: ${response.status} - ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Admin login error: ${error.message}`);
    return false;
  }
}

// Test user management endpoints
async function testUserManagement() {
  console.log('\n👥 Testing User Management...');
  
  const tests = [
    { method: 'GET', path: '/api/admin/users', name: 'List Users' },
    { method: 'POST', path: '/api/admin/users', name: 'Create User', data: {
      email: 'test-audit@example.com',
      firstName: 'Test',
      lastName: 'Audit',
      role: 'talent',
      password: 'testpass123'
    }},
  ];
  
  const results = {};
  
  for (const test of tests) {
    try {
      const response = await makeRequest(test.method, test.path, test.data, authCookies);
      
      if (response.status >= 200 && response.status < 300) {
        console.log(`✅ ${test.name}: Success (${response.status})`);
        results[test.name] = 'PASS';
        
        // Store created user ID for further tests
        if (test.name === 'Create User' && response.data.id) {
          results.createdUserId = response.data.id;
        }
      } else {
        console.log(`❌ ${test.name}: Failed (${response.status}) - ${JSON.stringify(response.data)}`);
        results[test.name] = `FAIL (${response.status})`;
      }
    } catch (error) {
      console.log(`❌ ${test.name}: Error - ${error.message}`);
      results[test.name] = `ERROR (${error.message})`;
    }
  }
  
  // Test user update if we created a user
  if (results.createdUserId) {
    try {
      const updateResponse = await makeRequest('PUT', `/api/admin/users/${results.createdUserId}`, {
        firstName: 'Updated',
        lastName: 'User'
      }, authCookies);
      
      if (updateResponse.status >= 200 && updateResponse.status < 300) {
        console.log(`✅ Update User: Success (${updateResponse.status})`);
        results['Update User'] = 'PASS';
      } else {
        console.log(`❌ Update User: Failed (${updateResponse.status}) - ${JSON.stringify(updateResponse.data)}`);
        results['Update User'] = `FAIL (${updateResponse.status})`;
      }
    } catch (error) {
      console.log(`❌ Update User: Error - ${error.message}`);
      results['Update User'] = `ERROR (${error.message})`;
    }
    
    // Test user deletion
    try {
      const deleteResponse = await makeRequest('DELETE', `/api/admin/users/${results.createdUserId}`, null, authCookies);
      
      if (deleteResponse.status >= 200 && deleteResponse.status < 300) {
        console.log(`✅ Delete User: Success (${deleteResponse.status})`);
        results['Delete User'] = 'PASS';
      } else {
        console.log(`❌ Delete User: Failed (${deleteResponse.status}) - ${JSON.stringify(deleteResponse.data)}`);
        results['Delete User'] = `FAIL (${deleteResponse.status})`;
      }
    } catch (error) {
      console.log(`❌ Delete User: Error - ${error.message}`);
      results['Delete User'] = `ERROR (${error.message})`;
    }
  }
  
  return results;
}

// Test pricing tier management
async function testPricingTierManagement() {
  console.log('\n💰 Testing Pricing Tier Management...');
  
  const tests = [
    { method: 'GET', path: '/api/admin/pricing-tiers', name: 'List Pricing Tiers' },
    { method: 'POST', path: '/api/admin/pricing-tiers', name: 'Create Pricing Tier', data: {
      name: 'Test Tier',
      price: 99.99,
      duration: 'monthly',
      category: 'talent',
      features: ['Test feature 1', 'Test feature 2'],
      isActive: true
    }},
  ];
  
  const results = {};
  
  for (const test of tests) {
    try {
      const response = await makeRequest(test.method, test.path, test.data, authCookies);
      
      if (response.status >= 200 && response.status < 300) {
        console.log(`✅ ${test.name}: Success (${response.status})`);
        results[test.name] = 'PASS';
        
        if (test.name === 'Create Pricing Tier' && response.data.id) {
          results.createdTierId = response.data.id;
        }
      } else {
        console.log(`❌ ${test.name}: Failed (${response.status}) - ${JSON.stringify(response.data)}`);
        results[test.name] = `FAIL (${response.status})`;
      }
    } catch (error) {
      console.log(`❌ ${test.name}: Error - ${error.message}`);
      results[test.name] = `ERROR (${error.message})`;
    }
  }
  
  return results;
}

// Test email template management
async function testEmailTemplateManagement() {
  console.log('\n📧 Testing Email Template Management...');
  
  const tests = [
    { method: 'GET', path: '/api/admin/email-templates', name: 'List Email Templates' },
    { method: 'POST', path: '/api/admin/email-templates', name: 'Create Email Template', data: {
      name: 'Test Template',
      subject: 'Test Subject',
      content: '<h1>Test Content</h1>',
      type: 'test',
      isActive: true
    }},
  ];
  
  const results = {};
  
  for (const test of tests) {
    try {
      const response = await makeRequest(test.method, test.path, test.data, authCookies);
      
      if (response.status >= 200 && response.status < 300) {
        console.log(`✅ ${test.name}: Success (${response.status})`);
        results[test.name] = 'PASS';
      } else {
        console.log(`❌ ${test.name}: Failed (${response.status}) - ${JSON.stringify(response.data)}`);
        results[test.name] = `FAIL (${response.status})`;
      }
    } catch (error) {
      console.log(`❌ ${test.name}: Error - ${error.message}`);
      results[test.name] = `ERROR (${error.message})`;
    }
  }
  
  return results;
}

// Test other admin endpoints
async function testOtherAdminFeatures() {
  console.log('\n⚙️ Testing Other Admin Features...');
  
  const tests = [
    { method: 'GET', path: '/api/admin/system-settings', name: 'System Settings' },
    { method: 'GET', path: '/api/admin/analytics/overview', name: 'Analytics Overview' },
    { method: 'GET', path: '/api/admin/jobs', name: 'Jobs Management' },
    { method: 'GET', path: '/api/admin/test-results', name: 'Test Results' },
    { method: 'GET', path: '/api/admin/monitoring/health', name: 'Health Monitoring' },
  ];
  
  const results = {};
  
  for (const test of tests) {
    try {
      const response = await makeRequest(test.method, test.path, null, authCookies);
      
      if (response.status >= 200 && response.status < 300) {
        console.log(`✅ ${test.name}: Success (${response.status})`);
        results[test.name] = 'PASS';
      } else if (response.status === 404) {
        console.log(`⚠️ ${test.name}: Not Implemented (404)`);
        results[test.name] = 'NOT_IMPLEMENTED';
      } else {
        console.log(`❌ ${test.name}: Failed (${response.status}) - ${JSON.stringify(response.data)}`);
        results[test.name] = `FAIL (${response.status})`;
      }
    } catch (error) {
      console.log(`❌ ${test.name}: Error - ${error.message}`);
      results[test.name] = `ERROR (${error.message})`;
    }
  }
  
  return results;
}

// Generate comprehensive report
function generateReport(allResults) {
  console.log('\n' + '='.repeat(80));
  console.log('📊 COMPREHENSIVE ADMIN DASHBOARD AUDIT REPORT');
  console.log('='.repeat(80));
  
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  let notImplementedTests = 0;
  let errorTests = 0;
  
  const categories = ['User Management', 'Pricing Tier Management', 'Email Template Management', 'Other Admin Features'];
  
  categories.forEach(category => {
    if (allResults[category]) {
      console.log(`\n${category.toUpperCase()}:`);
      Object.entries(allResults[category]).forEach(([test, result]) => {
        if (test.includes('Id')) return; // Skip internal tracking fields
        
        totalTests++;
        if (result === 'PASS') {
          passedTests++;
          console.log(`  ✅ ${test}: ${result}`);
        } else if (result === 'NOT_IMPLEMENTED') {
          notImplementedTests++;
          console.log(`  ⚠️ ${test}: ${result}`);
        } else if (result.startsWith('ERROR')) {
          errorTests++;
          console.log(`  💥 ${test}: ${result}`);
        } else {
          failedTests++;
          console.log(`  ❌ ${test}: ${result}`);
        }
      });
    }
  });
  
  console.log('\n' + '='.repeat(80));
  console.log('SUMMARY:');
  console.log(`Total Tests: ${totalTests}`);
  console.log(`✅ Passed: ${passedTests} (${Math.round(passedTests/totalTests*100)}%)`);
  console.log(`❌ Failed: ${failedTests} (${Math.round(failedTests/totalTests*100)}%)`);
  console.log(`💥 Errors: ${errorTests} (${Math.round(errorTests/totalTests*100)}%)`);
  console.log(`⚠️ Not Implemented: ${notImplementedTests} (${Math.round(notImplementedTests/totalTests*100)}%)`);
  
  const successRate = Math.round(passedTests/totalTests*100);
  console.log('\n' + '='.repeat(80));
  
  if (successRate >= 90) {
    console.log('🎉 EXCELLENT: Admin dashboard is production-ready!');
  } else if (successRate >= 70) {
    console.log('✅ GOOD: Admin dashboard is mostly functional with minor issues');
  } else if (successRate >= 50) {
    console.log('⚠️ NEEDS WORK: Admin dashboard has significant issues');
  } else {
    console.log('🚨 CRITICAL: Admin dashboard is not production-ready');
  }
  
  return {
    totalTests,
    passedTests,
    failedTests,
    errorTests,
    notImplementedTests,
    successRate
  };
}

// Main execution
async function runComprehensiveAudit() {
  console.log('🔍 Starting Comprehensive Admin Dashboard Audit...');
  console.log('This will test all admin functionality to identify broken features');
  
  // Test authentication first
  const authSuccess = await testAdminAuth();
  if (!authSuccess) {
    console.log('❌ Cannot proceed without admin authentication');
    process.exit(1);
  }
  
  // Run all tests
  const allResults = {
    'User Management': await testUserManagement(),
    'Pricing Tier Management': await testPricingTierManagement(),
    'Email Template Management': await testEmailTemplateManagement(),
    'Other Admin Features': await testOtherAdminFeatures()
  };
  
  // Generate final report
  const summary = generateReport(allResults);
  
  // Write detailed results to file
  const reportData = {
    timestamp: new Date().toISOString(),
    summary,
    detailedResults: allResults
  };
  
  fs.writeFileSync('admin-audit-report.json', JSON.stringify(reportData, null, 2));
  console.log('\n📄 Detailed report saved to admin-audit-report.json');
  
  console.log('\n🏁 Comprehensive Admin Dashboard Audit Complete!');
}

// Run the audit
runComprehensiveAudit().catch(console.error);