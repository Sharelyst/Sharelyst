/**
 * Test script for authentication endpoints
 * Run with: node testAuth.js
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

// Test data
const testUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    confirmPassword: 'password123'
};

let authToken = '';

/**
 * Test user registration
 */
async function testRegister() {
    console.log('\n=== Testing Registration ===');
    try {
        const response = await axios.post(`${API_BASE_URL}/auth/register`, testUser);
        console.log('✅ Registration successful');
        console.log('User:', response.data.data.username);
        console.log('Email:', response.data.data.email);
        authToken = response.data.data.token;
        console.log('Token received:', authToken.substring(0, 20) + '...');
        return true;
    } catch (error) {
        if (error.response) {
            console.log('❌ Registration failed:', error.response.data.message);
            // If user already exists, try to login instead
            if (error.response.status === 409) {
                return testLogin();
            }
        } else {
            console.log('❌ Error:', error.message);
        }
        return false;
    }
}

/**
 * Test user login
 */
async function testLogin() {
    console.log('\n=== Testing Login ===');
    try {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, {
            identifier: testUser.username,
            password: testUser.password
        });
        console.log('✅ Login successful');
        console.log('User:', response.data.data.username);
        authToken = response.data.data.token;
        console.log('Token received:', authToken.substring(0, 20) + '...');
        return true;
    } catch (error) {
        if (error.response) {
            console.log('❌ Login failed:', error.response.data.message);
        } else {
            console.log('❌ Error:', error.message);
        }
        return false;
    }
}

/**
 * Test login with email
 */
async function testLoginWithEmail() {
    console.log('\n=== Testing Login with Email ===');
    try {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, {
            identifier: testUser.email,
            password: testUser.password
        });
        console.log('✅ Login with email successful');
        console.log('User:', response.data.data.username);
        return true;
    } catch (error) {
        if (error.response) {
            console.log('❌ Login with email failed:', error.response.data.message);
        } else {
            console.log('❌ Error:', error.message);
        }
        return false;
    }
}

/**
 * Test token verification
 */
async function testVerifyToken() {
    console.log('\n=== Testing Token Verification ===');
    try {
        const response = await axios.post(
            `${API_BASE_URL}/auth/verify`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            }
        );
        console.log('✅ Token verification successful');
        console.log('User:', response.data.data.username);
        console.log('Email:', response.data.data.email);
        return true;
    } catch (error) {
        if (error.response) {
            console.log('❌ Token verification failed:', error.response.data.message);
        } else {
            console.log('❌ Error:', error.message);
        }
        return false;
    }
}

/**
 * Test invalid credentials
 */
async function testInvalidLogin() {
    console.log('\n=== Testing Invalid Login ===');
    try {
        await axios.post(`${API_BASE_URL}/auth/login`, {
            identifier: testUser.username,
            password: 'wrongpassword'
        });
        console.log('❌ Should have failed but succeeded');
        return false;
    } catch (error) {
        if (error.response && error.response.status === 401) {
            console.log('✅ Invalid login correctly rejected');
            return true;
        }
        console.log('❌ Unexpected error:', error.message);
        return false;
    }
}

/**
 * Run all tests
 */
async function runTests() {
    console.log('==========================================');
    console.log('  Sharelyst Authentication Test Suite');
    console.log('==========================================');

    const results = {
        total: 0,
        passed: 0,
        failed: 0
    };

    // Test registration
    results.total++;
    if (await testRegister()) results.passed++;
    else results.failed++;

    // Test login with username
    results.total++;
    if (await testLoginWithEmail()) results.passed++;
    else results.failed++;

    // Test token verification
    results.total++;
    if (await testVerifyToken()) results.passed++;
    else results.failed++;

    // Test invalid login
    results.total++;
    if (await testInvalidLogin()) results.passed++;
    else results.failed++;

    // Print summary
    console.log('\n==========================================');
    console.log('  Test Summary');
    console.log('==========================================');
    console.log(`Total Tests: ${results.total}`);
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log('==========================================\n');

    process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
