const axios = require('axios');
const qs = require('qs');
const fs = require('fs');
const saveFirstDataTokken = require('../metadata/save');
// Function to save the token data to a file


// Function to fetch a new token from Mercado Libre API
async function fetchToken(appId, clientSecret, redirectUri, authorizationCode) {
  const data = qs.stringify({
    'grant_type': 'authorization_code',
    'client_id': `${appId}`,
    'client_secret': `${clientSecret}`,
    'code': `${authorizationCode}`,
    'redirect_uri': `${redirectUri}`
  });

  const config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://api.mercadolibre.com/oauth/token',
    headers: {
      'accept': 'application/json',
      'content-type': 'application/x-www-form-urlencoded'
    },
    data
  };

  try {
    const response = await axios.request(config);
    return response.data; // Return the actual token data
  } catch (error) {
    console.error('Error al obtener el token:', error);
    // Handle the error appropriately (e.g., retry or notify)
    throw error; // Re-throw the error for subsequent handling
  }
}

// Function to get authorization from Mercado Libre API
async function getAuthFromMercadoApi(appId, clientSecret, redirectUri, authorizationCode) {
  try {
    // Check if a token file exists and attempt to read it
    const filePath = 'data.csv';
    let tokenData;
    try {
      const data = await fs.promises.readFile(filePath, 'utf8');
      tokenData = JSON.parse(data);
    } catch (error) {
      // Ignore error if the file doesn't exist, we'll fetch a new token
      if (error.code !== 'ENOENT') {
        throw error; // Re-throw other errors
      }
    }

    // If token data exists, return it
    if (tokenData) {
      console.log('UserDataToken:', JSON.stringify(tokenData, null, 2));
      return tokenData;
    }

    // If no token data exists, fetch a new one
    console.log('Obteniendo token nuevo...');
    tokenData = await fetchToken(appId, clientSecret, redirectUri, authorizationCode);
    await saveFirstDataTokken(tokenData); // Save the fetched token for future use
    return tokenData;
  } catch (error) {
    console.error('Error al obtener el token:', error);
    throw error; // Re-throw the error for handling by the caller
  }
}

module.exports = getAuthFromMercadoApi;