//End point para solo uso de metodo GET --_

import axios from 'axios';
import getAuthFromMercadoApi from '../control/Path_Control/autenticacionApi/Auth/autenToken.js';

async function getEndPointData(url) {
    //const tokenData = await getAuthFromMercadoApi();  // Obtén el token de autenticación
    const accessToken = 'APP_USR-889807737673414-090913-d6d9bb5e227a5599156094a5a4fb55b5-420711769';

    const config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: url,
        headers: { 
            'Authorization': `Bearer ${accessToken}`
        }
    };

    try {
        const response = await axios.request(config);
        
        return response.data;  // Retorna directamente los datos
    } catch (error) {
        console.error("Error en la solicitud de endpoint:", error);
        throw error;  // Propaga el error
    }
}


 export default getEndPointData;
