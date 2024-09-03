import express from 'express';
import axios from 'axios';
import open from 'open';

const app = express();
const port = 8080;

const clientId = '1529010052401438';
const redirectUri = `http://localhost:8080/callback`;
//https://auth.mercadolibre.com.mx/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}

const authUrl = `https://auth.mercadolibre.com.mx/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}`;

app.get('/callback', async (req, res) => {
    const authorizationCode = req.query.code;

    console.log('Received callback request:', req.url);

    if (!authorizationCode) {
        console.log('Authorization code not found in the URL.');
        return res.status(400).send('Authorization code not found.');
    }

    console.log('Authorization Code:', authorizationCode);

    try {
        const tokenResponse = await axios.post('https://api.mercadolibre.com/oauth/token', {
            grant_type: 'authorization_code',
            client_id: clientId,
            client_secret: clientSecret,
            code: authorizationCode,
            redirect_uri: redirectUri
        });

        const accessToken = tokenResponse.data.access_token;
        console.log('Access Token:', accessToken);

        res.send('Authorization successful! You can close this tab.');
    } catch (error) {
        console.error('Error exchanging code for token:', error.response ? error.response.data : error.message);
        res.status(500).send('Failed to exchange code for token.');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    open(authUrl);  // Esto abre automáticamente el enlace en el navegador
});