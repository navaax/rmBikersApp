import axios from 'axios';
import fs from 'fs';
import csv from 'csv-parser';
// const getAuthTokken = require('../../Auth/autenToken');
import getAuthFromMercadoApi from '/workspaces/rmBikersApp/Path_Control/autenticacionApi/Auth/autenToken.js';

async function getPreguntas() {
  try {
    const parsedData = [];

    await new Promise((resolve, reject) => {
      fs.createReadStream('data.csv') 
        .pipe(csv())
        .on('data', (row) => {
          parsedData.push(row);
        })
        .on('end', () => {
          resolve();
        })
        .on('error', (error) => {
          reject(error);
        });
    });

    // Procesa los datos extraídos del CSV
    parsedData.forEach(data => {
      const sellerId = data.seller_id;
      const results = JSON.parse(data.results || '[]');
      const paging = JSON.parse(data.paging || '{}');
      const orders = JSON.parse(data.orders || '[]');
      const availableOrders = JSON.parse(data.available_orders || '[]');

      console.log('Seller ID:', sellerId);
      console.log('Results:', results);
      console.log('Paging:', paging);
      console.log('Orders:', orders);
      console.log('Available Orders:', availableOrders);
      
      resultados.push({ sellerId, results });
    });
    
    return resultados;
  } catch (error) {
    console.error('Error leyendo el archivo CSV o procesando datos:', error);
  }
}

 function getItems(sellerId, results) {
  try {
    const tokenData =  getAuthFromMercadoApi();  // Obtén el token de autenticación
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      throw new Error('Token de acceso no disponible');
    }

    if (Array.isArray(results) && results.length > 0) {
      const itemIds = results.join(',');

      let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `https://api.mercadolibre.com/items?ids=${itemIds}`,  // Realiza la solicitud con todos los IDs concatenados
        headers: { 
          'Authorization': `Bearer ${accessToken}`
        }
      };

      console.log('Configuración de la solicitud:', config);

      const response =  axios.request(config);
      console.log('Datos de la respuesta:', JSON.stringify(response.data));
    } else {
      console.error('results no es un array válido:', results);
    }
  } catch (error) {
    console.error('Error realizando la solicitud a la API:', error.message);
  }
}




export default {getItems};
