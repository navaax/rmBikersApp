import * as dotenv from 'dotenv';
import express from 'express'
import fetch from 'node-fetch';

if (process.env.NODE_ENV !== 'production'){
    dotenv.config();
}

const app = express();

app.use(express.json);
app.use(express.urlencoded({extended: true}));

const redirectUri = `https://localhost:8080`;
app.get('/', (er, res)=>{
   
    //https://auth.mercadolibre.com.mx/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}

    res.redirect(`https://auth.mercadolibre.com.mx/authorization?response_type=code&client_id=${process.env.APP_ID}&redirect_uri=${redirectUri}`);

});
//ruta del access token
app.get('/auth_mercado_libre',async(req, res) =>{
    let code = req.query.code;
    let body = {
        grant_type: 'authorization_code',
        client_id: process.env.APP_ID,
        client_secret: process.env.SECRET_KEY,
        refresh_token: process.env.REDIRECT_URI
    };

    let response = await fetch('https://api.mercadolibre.com/oauth/token',{
        method: 'POST',
        headers: {
            'accept': 'aplication/json',
            'content-type': 'application/x-www-form-urlencoded'

        },
        body: JSON.stringify(body)
    });
    const data = await response.json();
    res.status(200).json({response: 'success', data});
});


const port = process.env.PORT || 8080; // Usa el puerto de la variable de entorno o el 8080 por defecto

app.listen(port, () => {
    console.log(`Server running at https://localhost:${port}`);
});