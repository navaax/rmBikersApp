const https = require('https');

// Access token, user ID, and application ID (replace with your values)
const accessToken = 'wfxo5pOEUnab4Co0tyz9JMKQlZwPlVua';
const appId = '1529010052401438';  // Replace with your Mercado Libre application ID

// API endpoint (adjust as needed)
const apiEndpoint = `/users/me`;

const options = {
  hostname: 'api.mercadolibre.com',
  path: apiEndpoint,
  method: 'GET',
  headers: {
    Authorization: `Bearer ${accessToken}`,
    'X-Application-Id': appId
  }
};

https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const parsedData = JSON.parse(data);
      console.log('Response data:', parsedData);
    } catch (error) {
      console.error('Error parsing response:', error);
    }
  });
})
.on('error', (error) => {
  console.error('Error making request:', error);
})
.end();