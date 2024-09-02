import { google } from 'googleapis';
import { parse }  from 'json2csv';
import credentials from './credentials.json'; //Carga de credenciales de 0Auth2

const oAuth2Client = new google.auth.OAuth2(
  credentials.installed.client_id,
  credentials.installed.client_secret,
  credentials.installed.redirect_uris[0]
);

const authUrl = oAuth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://www.googleapis.com/auth/spreadsheets']
});

console.log('Authorize this app by visiting this url:', authUrl);
