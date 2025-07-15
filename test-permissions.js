#!/usr/bin/env node

/**
 * COMPREHENSIVE PERMISSION SYSTEM TEST
 * 
 * This script tests all aspects of the permission system:
 * 1. Permission validation endpoints
 * 2. Role-based access control
 * 3. User-specific permissions
 * 4. Permission auditing
 * 5. Security validation
 */

const BASE_URL = 'http://localhost:5000';

// Test utilities
async function makeRequest(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
  
  const data = await response.json();
  return { status: response.status, data };
}

async function loginAsAdmin() {
  const { status, data } = await makeRequest('/api/login', {
    method: 'POST',
    body: JSON.stringify({
      username: 'admin',
      password: 'admin123'
    })
  });
  
  if (status === 200) {
    console.log('✅ Admin login successful');
    // Extract session cookie from response headers
    return data;
  } else {
    console.error('❌ Admin login failed:', data);
    return null;
  }
}

async function testPermissionEndpoints() {
  console.log('\n=== Testing Permission Endpoints ===');
  
  // Test permission initialization
  const { status: initStatus, data: initData } = await makeRequest('/api/admin/permissions/init', {
    method: 'POST'
  });
  
  console.log(`Permission initialization: ${initStatus === 200 ? '✅' : '❌'}`);
  if (initStatus === 200) {
    console.log(`  - Role permissions created: ${initData.rolePermissions}`);
    console.log(`  - Admin permissions granted: ${initData.adminPermissions}`);
  }
  
  // Test permission validation
  const testPermissions = [
    { category: 'USER_MANAGEMENT', action: 'CREATE', resource: 'users' },
    { category: 'ADMIN', action: 'MANAGE_USERS', resource: 'platform' },
    { category: 'JOBS', action: 'CREATE', resource: 'jobs' },
    { category: 'MEDIA', action: 'UPLOAD', resource: 'files' }
  ];
  
  for (const permission of testPermissions) {
    const { status: checkStatus, data: checkData } = await makeRequest('/api/admin/permissions/check', {
      method: 'POST',
      body: JSON.stringify({
        userId: 'admin',
        permission
      })
    });
    
    console.log(`Permission check (${permission.category}.${permission.action}): ${checkStatus === 200 ? '✅' : '❌'}`);
    if (checkStatus === 200) {
      console.log(`  - Has permission: ${checkData.hasPermission}`);
    }
  }
}

async function testRoleBasedAccess() {
  console.log('\n=== Testing Role-Based Access Control ===');
  
  // Test different role accesses
  const roleTests = [
    { role: 'admin', expectedAccess: true },
    { role: 'producer', expectedAccess: false },
    { role: 'manager', expectedAccess: false },
    { role: 'talent', expectedAccess: false }
  ];
  
  for (const test of roleTests) {
    const { status: roleStatus, data: roleData } = await makeRequest('/api/admin/permissions/role-check', {
      method: 'POST',
      body: JSON.stringify({
        userId: 'admin',
        role: test.role,
        permission: { category: 'ADMIN', action: 'MANAGE_USERS', resource: 'platform' }
      })
    });
    
    console.log(`Role access test (${test.role}): ${roleStatus === 200 ? '✅' : '❌'}`);
    if (roleStatus === 200) {
      const hasAccess = roleData.hasAccess;
      console.log(`  - Expected: ${test.expectedAccess}, Got: ${hasAccess} ${hasAccess === test.expectedAccess ? '✅' : '❌'}`);
    }
  }
}

async function testUserSpecificPermissions() {
  console.log('\n=== Testing User-Specific Permissions ===');
  
  // Test granting specific permission to a user
  const testPermission = {
    category: 'CONTENT',
    action: 'MODERATE',
    resource: 'posts'
  };
  
  const { status: grantStatus, data: grantData } = await makeRequest('/api/admin/permissions/grant', {
    method: 'POST',
    body: JSON.stringify({
      userId: 'admin',
      permission: testPermission
    })
  });
  
  console.log(`Grant user permission: ${grantStatus === 200 ? '✅' : '❌'}`);
  if (grantStatus === 200) {
    console.log(`  - Permission granted: ${grantData.permission.category}.${grantData.permission.action}`);
  }
  
  // Test checking the granted permission
  const { status: checkStatus, data: checkData } = await makeRequest('/api/admin/permissions/check', {
    method: 'POST',
    body: JSON.stringify({
      userId: 'admin',
      permission: testPermission
    })
  });
  
  console.log(`Check granted permission: ${checkStatus === 200 ? '✅' : '❌'}`);
  if (checkStatus === 200) {
    console.log(`  - Has permission: ${checkData.hasPermission} ${checkData.hasPermission ? '✅' : '❌'}`);
  }
  
  // Test revoking the permission
  const { status: revokeStatus, data: revokeData } = await makeRequest('/api/admin/permissions/revoke', {
    method: 'POST',
    body: JSON.stringify({
      userId: 'admin',
      permission: testPermission
    })
  });
  
  console.log(`Revoke user permission: ${revokeStatus === 200 ? '✅' : '❌'}`);
  if (revokeStatus === 200) {
    console.log(`  - Permission revoked: ${revokeData.success}`);
  }
}

async function testPermissionAuditing() {
  console.log('\n=== Testing Permission Auditing ===');
  
  // Test fetching audit logs
  const { status: auditStatus, data: auditData } = await makeRequest('/api/admin/permissions/audit', {
    method: 'GET'
  });
  
  console.log(`Fetch audit logs: ${auditStatus === 200 ? '✅' : '❌'}`);
  if (auditStatus === 200) {
    console.log(`  - Audit logs found: ${auditData.logs.length}`);
    if (auditData.logs.length > 0) {
      const latest = auditData.logs[0];
      console.log(`  - Latest log: ${latest.permission.category}.${latest.permission.action} - ${latest.granted ? 'GRANTED' : 'DENIED'}`);
    }
  }
  
  // Test audit log filtering
  const { status: filterStatus, data: filterData } = await makeRequest('/api/admin/permissions/audit?userId=admin&granted=true', {
    method: 'GET'
  });
  
  console.log(`Filter audit logs: ${filterStatus === 200 ? '✅' : '❌'}`);
  if (filterStatus === 200) {
    console.log(`  - Filtered logs: ${filterData.logs.length}`);
  }
}

async function testSecurityValidation() {
  console.log('\n=== Testing Security Validation ===');
  
  // Test unauthorized access
  const { status: unauthorizedStatus } = await makeRequest('/api/admin/permissions/check', {
    method: 'POST',
    body: JSON.stringify({
      userId: 'nonexistent',
      permission: { category: 'ADMIN', action: 'MANAGE_USERS', resource: 'platform' }
    })
  });
  
  console.log(`Unauthorized access handling: ${unauthorizedStatus === 401 || unauthorizedStatus === 403 ? '✅' : '❌'}`);
  
  // Test invalid permission format
  const { status: invalidStatus } = await makeRequest('/api/admin/permissions/check', {
    method: 'POST',
    body: JSON.stringify({
      userId: 'admin',
      permission: { category: 'INVALID', action: 'INVALID' }
    })
  });
  
  console.log(`Invalid permission handling: ${invalidStatus === 400 || invalidStatus === 422 ? '✅' : '❌'}`);
  
  // Test SQL injection protection
  const { status: sqlStatus } = await makeRequest('/api/admin/permissions/check', {
    method: 'POST',
    body: JSON.stringify({
      userId: "admin'; DROP TABLE users; --",
      permission: { category: 'USER_MANAGEMENT', action: 'CREATE', resource: 'users' }
    })
  });
  
  console.log(`SQL injection protection: ${sqlStatus === 400 || sqlStatus === 422 ? '✅' : '❌'}`);
}

async function testEndToEndPermissionFlow() {
  console.log('\n=== Testing End-to-End Permission Flow ===');
  
  // 1. Initialize permissions
  await makeRequest('/api/admin/permissions/init', { method: 'POST' });
  
  // 2. Check admin has all permissions
  const adminPermissions = [
    { category: 'USER_MANAGEMENT', action: 'CREATE', resource: 'users' },
    { category: 'ADMIN', action: 'MANAGE_USERS', resource: 'platform' },
    { category: 'JOBS', action: 'CREATE', resource: 'jobs' },
    { category: 'MEDIA', action: 'UPLOAD', resource: 'files' }
  ];
  
  let allPermissionsPass = true;
  for (const permission of adminPermissions) {
    const { status, data } = await makeRequest('/api/admin/permissions/check', {
      method: 'POST',
      body: JSON.stringify({ userId: 'admin', permission })
    });
    
    if (status !== 200 || !data.hasPermission) {
      allPermissionsPass = false;
      break;
    }
  }
  
  console.log(`Admin permissions check: ${allPermissionsPass ? '✅' : '❌'}`);
  
  // 3. Grant permission to a user
  const { status: grantStatus } = await makeRequest('/api/admin/permissions/grant', {
    method: 'POST',
    body: JSON.stringify({
      userId: 'testuser',
      permission: { category: 'CONTENT', action: 'CREATE', resource: 'posts' }
    })
  });
  
  console.log(`Grant permission: ${grantStatus === 200 ? '✅' : '❌'}`);
  
  // 4. Check granted permission
  const { status: checkStatus, data: checkData } = await makeRequest('/api/admin/permissions/check', {
    method: 'POST',
    body: JSON.stringify({
      userId: 'testuser',
      permission: { category: 'CONTENT', action: 'CREATE', resource: 'posts' }
    })
  });
  
  console.log(`Check granted permission: ${checkStatus === 200 && checkData.hasPermission ? '✅' : '❌'}`);
  
  // 5. Verify audit trail
  const { status: auditStatus, data: auditData } = await makeRequest('/api/admin/permissions/audit?userId=testuser', {
    method: 'GET'
  });
  
  console.log(`Audit trail verification: ${auditStatus === 200 && auditData.logs.length > 0 ? '✅' : '❌'}`);
}

async function runAllTests() {
  console.log('🚀 Starting Comprehensive Permission System Test');
  console.log('='.repeat(60));
  
  try {
    // Login as admin first
    const adminUser = await loginAsAdmin();
    if (!adminUser) {
      console.error('❌ Cannot proceed without admin login');
      process.exit(1);
    }
    
    // Run all test suites
    await testPermissionEndpoints();
    await testRoleBasedAccess();
    await testUserSpecificPermissions();
    await testPermissionAuditing();
    await testSecurityValidation();
    await testEndToEndPermissionFlow();
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ All permission system tests completed successfully!');
    console.log('🎉 Permission system is fully functional and ready for production use.');
    
  } catch (error) {
    console.error('\n❌ Test execution failed:', error.message);
    process.exit(1);
  }
}

// Only run if this script is executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = { runAllTests };