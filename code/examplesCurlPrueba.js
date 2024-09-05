const getAuthTokken = require('../control/Path_Control/autenticacionApi/Auth/autenToken');

const tokenData = await getAuthTokken();
console.log('Token extraído:', tokenData);

// Utilizar los datos del token, por ejemplo:
const accessToken = tokenData.accessToken;
const userId = tokenData.userId;

const url = 'https://api.mercadolibre.com/answers';

// Create headers with the access token
const headers = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
};

// Define the answer data
const data = {
    question_id: 13142291502,  // Replace with the actual question ID
    text: 'Test answer...'  // Replace with your intended answer
};


// Send the POST request with data and headers
axios.post(url, data, { headers })
    .then(response => {
        console.log('Answer posted successfully!');
    })
    .catch(error => {
        console.error('Error posting answer:', error.response.status, error.response.data);
    });