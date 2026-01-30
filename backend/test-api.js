/**
 * API Integration Test Script
 * Runs a sequence of API calls (Seed -> Fetch Nearby -> Create Order -> Track Order)
 * to verify backend functionality.
 */
const fetch = require('node-fetch'); // Ensure node-fetch is installed or use global fetch in Node 18+

const BASE_URL = 'http://localhost:5000/api';

async function testAPI() {
    try {
        console.log('--- Testing API ---\n');

        // 1. Seed Data
        console.log('1. Seeding Garages...');
        const seedRes = await fetch(`${BASE_URL}/garages/seed`, { method: 'POST' });
        const seedData = await seedRes.json();
        console.log('Seed Result:', seedData);

        if (!seedData.success) throw new Error('Seeding failed');

        // 2. Get Nearby Garages
        console.log('\n2. Fetching Nearby Garages (SF Area)...');
        // Using coords from seed data (approx SF)
        const nearbyRes = await fetch(`${BASE_URL}/garages/nearby?lat=37.78825&lng=-122.4324`);
        const nearbyData = await nearbyRes.json();
        console.log(`Found ${nearbyData.count} garages.`);
        console.log('First Garage:', nearbyData.data[0]?.name);

        if (!nearbyData.success || nearbyData.count === 0) throw new Error('Fetching nearby failed');

        const garageId = nearbyData.data[0]._id;

        // 3. Create Order
        console.log('\n3. Creating Order...');
        const orderRes = await fetch(`${BASE_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: 'user123',
                garageId: garageId,
                vehicleDetails: { make: 'Toyota', model: 'Camry', year: '2020', issue: 'Won\'t start' },
                userLocation: { lat: 37.78825, lng: -122.4324 }
            })
        });
        const orderData = await orderRes.json();
        console.log('Order Created:', orderData.success);
        console.log('Order ID:', orderData.data?._id);

        if (!orderData.success) throw new Error('Order creation failed');

        const orderId = orderData.data._id;

        // 4. Track Order
        console.log('\n4. Tracking Order...');
        const trackRes = await fetch(`${BASE_URL}/orders/${orderId}/track`);
        const trackData = await trackRes.json();
        console.log('Order Status:', trackData.data.status);
        console.log('Mechanic Location:', trackData.data.mechanicLocation);

        console.log('\n--- API Verification Pattern Passed ---');

    } catch (error) {
        console.error('\n!!! API Test Failed !!!', error);
    }
}

testAPI();
