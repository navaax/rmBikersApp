
import axios from 'axios';

// Función para obtener artículos del usuario
async function getArticulosFromUserId() {
  try {
    const config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: 'https://api.mercadolibre.com/users/635799575/items/search',
      headers: { 
        'Authorization': 'Bearer APP_USR-1529010052401438-082923-0c6a22d9307b2ba204f923adc9fc94b9-635799575'
      }
    };
    const response = await axios(config);
    const resultados = response.data.results;
    
    return resultados;
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
}

// Función para obtener detalles de los artículos desde sus IDs
async function getArticulosFromId(resultados) {
  console.log(`https://api.mercadolibre.com/items?ids=${resultados[0]}`)

  try {
   
    const configs = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `https://api.mercadolibre.com/items?ids=${resultados[0]}`,
      headers: { 
        'Authorization': 'Bearer APP_USR-1529010052401438-082914-4dadc6238624dfc8f8be2554e9a5b466-635799575'
      }
    };
    const response = await axios(configs);

    // Verifica si la respuesta tiene la estructura esperada
    // Aquí puedes revisar la estructura exacta de response.data
    const atributosDeArticulo = response.data;
    console.log(atributosDeArticulo);
    return atributosDeArticulo;
  } catch (error) {
    console.error("Error al obtener detalles del artículo:", error);
    return [];
  }
}

// Función para obtener el stock del producto
async function getStockFromProducto(atributosDeArticulo) {
  const user_product_id = atributosDeArticulo.body.user_product_id;
  try {
    if (!atributosDeArticulo || !atributosDeArticulo.body.user_product_id) {
      throw new Error('ID de producto no disponible.');
    }

    const productoId = user_product_id;
    console.log(productoId);
    const configss = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `https://api.mercadolibre.com/user-products/${productoId}/stock`,
      headers: { 
        'Authorization': 'Bearer APP_USR-1529010052401438-082914-4dadc6238624dfc8f8be2554e9a5b466-635799575'
      }
    };
    const responses = await axios(configss);
    const dataProductoConStock = {
      'Datos': atributosDeArticulo,
      'Stock': responses.data.body || 'No disponible'
    };

  

    return dataProductoConStock;
  } catch (error) {
    console.error("Error al obtener stock del producto:", error);
  }
}

// Ejecución de funciones

// 1. Obtener artículos del usuario
getArticulosFromUserId().then(resultados => {
  // 2. Obtener detalles de los artículos desde sus IDs
  getArticulosFromId(resultados).then(atributosDeArticulos => {
    if (atributosDeArticulos.length > 0) {
      // 3. Obtener el stock del producto para cada artículo
      atributosDeArticulos.forEach(atributos => {
        getStockFromProducto(atributos);
      });
    } else {
      console.log("No se encontraron detalles de artículos.");
    }
  });
});
