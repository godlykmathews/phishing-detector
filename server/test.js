import fetch from 'node-fetch';

async function testServer() {
    try {
        const response = await fetch('http://localhost:3001/health');
        const data = await response.json();
        console.log('Server health check:', data);
    } catch (error) {
        console.error('Server test failed:', error);
    }
}

testServer();