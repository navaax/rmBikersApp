import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Module Refresh Auth
import mercadoEndPointAuth from './model/mercadoLibreEndPointAuth.js';
// End Module Refresh Auth


// JSON DATA EXTRUCTURE
// {
//     "access_token": "APP_USR-12345657984-090515-b0ad156bce70050973466faa15-1234567",
//     "token_type": "bearer",
//     "expires_in": 10800,
//     "scope": "offline_access read write",
//     "user_id": 1234567,
//     "refresh_token": "TG-5b9032b4e4b0714aed1f959f-1234567"
// }

async function refreshTokenData(){
    dotenv.config({ path: path.resolve(__dirname, 'acces.env') });
    
    const refreshToken = process.env.refreshToken;
    const clientId = process.env.clientId;
    const clientSecret = process.env.clientSecret;

    const url = 'https://api.mercadolibre.com/oauth/token';

    const data = {
        grant_type: 'refresh_token',
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken
    };
    try {
        mercadoEndPointAuth(url, data);

    } catch (error) {
        throw ('Refresh Token MLSave Data error:', error);
    }
}

