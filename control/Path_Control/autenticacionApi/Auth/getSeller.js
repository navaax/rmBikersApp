import axios from 'axios';
import json2csv from 'json2csv';

import getAuthFromMercadoApi from '/workspaces/rmBikersApp/Path_Control/autenticacionApi/Auth/autenToken.js';
import saveFirstDataTokken from '../metadata/save.js';

export default async function getSellerData() {
  try {
    // Obtener los datos del token
    const tokenData = await getAuthFromMercadoApi(
      'access_token', 
      'user_id'
    );
    
    console.log('Token extraído:', tokenData); 

    // Desestructurar los datos del token
    const { access_token, user_id } = tokenData;

    if (!access_token || !user_id) {
      throw new Error('Token o ID de usuario no encontrados en los datos del token.');
    }

    // Configuración para la solicitud a la API
    const config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `https://api.mercadolibre.com/users/${user_id}/items/search`,
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    };

    // Realizar la solicitud a la API
    const response = await axios.request(config);
    
    const data = response.data;
    console.log(data);
    // Manejo de datos vacíos (opcional)
    if (!data || (Array.isArray(data) && data.length === 0)) {
      console.log('No se encontraron datos para guardar en CSV');
      return; // O realizar otras acciones
    }

    // Extraer nombres de campos (suponiendo que los datos son un array de objetos)
    const flattenData = [];
    for (const key in data) {
      if (Array.isArray(data[key])) {
        data[key].forEach((item, index) => {
          flattenData.push({ key, index, value: item });
        });
      } else {
        flattenData.push({ key, value: data[key] });
      }
    }

    // Convertir datos a CSV y guardarlos
    const csvData = json2csv.parse(flattenData, { header: true });
    await saveFirstDataTokken(csvData, 'data.csv'); // Reemplaza 'data.csv' con el nombre deseado

    console.log('Datos guardados correctamente en CSV');
  } catch (error) {
    console.error('Error obteniendo los datos del vendedor:', error);
    throw error; // Vuelve a lanzar el error para manejarlo en el código que llama
  }
}