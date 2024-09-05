import axios from 'axios';
import getEndPointData from '../../../../model/mercadoLibreEndPointProduct.js';
const access_token = 'APP_USR-1529010052401438-090418-49bbc09fcad2c5811442a29eac398540-635799575';

async function getArticulosFromUserId() {
    try {
        // URL de la API
        let url = `https://api.mercadolibre.com/users/635799575/items/search`;
        
        // Obtener datos del endpoint
        const response = await getEndPointData(url);

        // Asegúrate de que response contiene la propiedad 'results' y que es un array
        if (!response || !Array.isArray(response.results)) {
            throw new Error('La respuesta de la API no contiene un array en la propiedad "results"');
        }

        // Obtén el array de items
        const resultados = response.results;

        // Map de las solicitudes para obtener atributos de artículos
        const detailedRequests = resultados.map(async (itemId) => {
          //https://api.mercadolibre.com/items/${itemId}?attributes=id,title,category_id,price,base_price,initial_quantity,available_quantity,health,shipping,listing_type_id,descriptions,variations,condition,pictures,video_id,expiration_time,attributes&id=MAX_WEIGHT_LOAD,BRAND,value_name&id=MAX_SPEED,MODEL,value_name`,
          const url = `https://api.mercadolibre.com/items/${itemId}?attributes=id,title,category_id,price,base_price,initial_quantity,available_quantity,health,shipping,listing_type_id,descriptions,variations,condition,pictures,video_id,expiration_time,attributes&id=MAX_WEIGHT_LOAD,BRAND,value_name&id=MAX_SPEED,MODEL,value_name`;
                          
            try {
                
              const itemDetails = await getEndPointData(url);
              const calidadCompraData = await getCalidadCompra(itemId);
                // Si 'itemDetails' no es el formato esperado, asegúrate de manejarlo adecuadamente
                if (!itemDetails || typeof itemDetails !== 'object') {
                    throw new Error('La respuesta de la API para el artículo no es válida.');
                }
                console.log(itemDetails);
                

                return {
                    id: itemDetails.id,
                    CategoriaID: itemDetails.category_id,
                    Titulo: itemDetails.title || 'N/A',
                    Precio: itemDetails.price || 'N/A',
                    BPrecio: itemDetails.base_price || 'N/A',
                    Stock: itemDetails.available_quantity || 'SIN STOCK',
                    MetodoPago: itemDetails.shipping ? itemDetails.shipping.mode : 'N/A',
                    Envio_Gratis: itemDetails.shipping ? itemDetails.shipping.free_shipping : 'N/A',
                    Estado: itemDetails.health || 'N/A',
                    CalidadID: calidadCompraData ? calidadCompraData.item_id : 'N/A',       
                    Fotos: itemDetails.pictures,
                    Video: itemDetails.video_id,
                    Catalogo: itemDetails.catalog_product_id,
                    Garantia: itemDetails.warranty,
                    TiempoDisp: itemDetails.official_store_id,
                    Variaciones : itemDetails.variations,
                    Dimensiones : itemDetails.shipping ? itemDetails.shipping.dimensions : 'N/A',
                    Descripcion: itemDetails.descriptions || 'N/A',
                    CodigoGTIN : itemDetails.attributes ? itemDetails.attributes.name : 'N/A',
                    Condicion: itemDetails.condition,
                    TipoPublicacion: itemDetails.listing_type_id,
                    TDisponible: itemDetails.expiration_time,
                    CaracteristicasP : itemDetails.attributes.value_type ? itemDetails.attributes.value_name : 'N/A',
                    CaracteristicasS : itemDetails.attributes.value_type ? itemDetails.attributes.value_name : 'N/A',
                    Calidad_Reputation: calidadCompraData && calidadCompraData.reputation
              };
            } catch (error) {
                console.error("Error obteniendo detalles del artículo:", error);
                return { id: itemId, error: "Error en la solicitud de atributos" };
            }
        });

        // Esperar todas las solicitudes detalladas
        const detailedResults = await Promise.all(detailedRequests);

        // Procesar y exportar los resultados
        // ... (continúa con el procesamiento y exportación a Excel)

        return detailedResults;
    } catch (error) {
        console.error("Error en getArticulosFromUserId:", error);
        return ['Datos no encontrados, Error: GETPRODUCTOS1-2'];
    }
}

async function getCalidadCompra(id) {
    try {
        const getMedidorCalidadCompra = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `https://api.mercadolibre.com/reputation/items/${id}/purchase_experience/integrators?locale=es_MX`,
            headers: { 
                'Authorization': `Bearer ${access_token}`
            }
        };

        const response = await axios.request(getMedidorCalidadCompra);
        return response.data;
    } catch (error) {
        console.error("Error en getCalidadCompra:", error);
        return { error: "Error en la solicitud de calidad" };
    }
}

// Llamada principal
getArticulosFromUserId().then(results => {
    console.log("Resultados combinados:", results);
});

export default getArticulosFromUserId;