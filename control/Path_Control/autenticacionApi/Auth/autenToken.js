import axios from 'axios';
import qs from 'qs';
import fs from 'fs/promises';
import saveFirstDataTokken from '../metadata/save.js'; // Función para guardar datos del token


// Función para obtener la autorización desde la API de Mercado Libre
async function getAuthFromMercadoApi(appId, clientSecret, redirectUri, authorizationCode) {
  const filePath = '/workspaces/rmBikersApp/Path_Control/autenticacionApi/metadata/dataAutenToken.txt'; // Ruta del archivo

  let tokenData;
  try {
    // Intenta leer el archivo de token existente
    const data = await fs.readFile(filePath, 'utf8');
    tokenData = JSON.parse(data);

    // Si el archivo existe y se pudo leer, devuelve los datos del token
    console.log('Token encontrado en el archivo:', JSON.stringify(tokenData, null, 2));
    return tokenData;
  } catch (error) {
    // Si el archivo no existe, se maneja la excepción ENOENT
    if (error.code === 'ENOENT') {
      console.log('Archivo de token no encontrado. Obteniendo token nuevo...');
    } else {
      // Si hay un error al leer el archivo que no es ENOENT, lanza el error
      console.error('Error al leer el archivo del token:', error);
      throw error;
    }
  }

  try {
    // Si no se pudo leer el token, obtén uno nuevo
    tokenData = await fetchToken(appId, clientSecret, redirectUri, authorizationCode);
    
    // Guarda el token obtenido para futuros usos
    await saveFirstDataTokken(tokenData, filePath); // Pasa la ruta del archivo para guardar
    console.log('Token guardado correctamente en el archivo.');
    return tokenData;
  } catch (error) {
    console.error('Error al obtener el token:', error);
    throw error; // Vuelve a lanzar el error para manejarlo en la llamada
  }
}

export default getAuthFromMercadoApi;
