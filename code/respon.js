const axios = require('axios'); // Import axios for HTTP requests

// Function to post an answer using axios and Mercado Libre API
async function postAnswerToMercadoLibre(accessToken, questionId, answerText) {
  try {
    const response = await axios.post(
      'https://api.mercadolibre.com/answers', // API endpoint URL
      {
        question_id: questionId,
        text: answerText,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.status === 200) {
      console.log('Answer posted successfully!');
    } else {
      console.error(`Error posting answer: ${response.status}`);
      console.error(response.data); // Print the error message from the API
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Replace with your actual access token
const accessToken = 'APP_USR-1529010052401438-082411-c121dd2384489e484d954fdfe022aeed-635799575';

// Sample usage: Replace question ID and answer text with your values

module.exports = { postAnswerToMercadoLibre };
