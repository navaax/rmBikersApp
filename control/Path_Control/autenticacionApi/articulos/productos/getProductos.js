import axios from 'axios';
import * as XLSX from 'xlsx';
import getEndPointData from '../../../../../model/mercadoLibreEndPointProduct.js';
import getQueryDB from '../../../../../servicios/sqlServ/query.js';

// Configura tus variables
const ACCESS_TOKEN = 'APP_USR-889807737673414-091311-9290b981a01db5899a43a745740b80ad-420711769';
const USER_ID = '420711769';
const BASE_URL = 'https://api.mercadolibre.com';

// Función para obtener datos de un endpoint


// Función para obtener la tarifa de venta
async function getSaleFee(price, categoryId, listingTypeId) {
    const saleFeeUrl = `https://api.mercadolibre.com/sites/MLM/listing_prices?price=${price}&category_id=${categoryId}&listing_type_id=${listingTypeId}&attributes=sale_fee_amount,sale_fee_details`;

    try {
        const response = await axios.get(saleFeeUrl);
        const { sale_fee_details } = response.data;
        return {
            percentageFee: sale_fee_details.percentage_fee,
            grossAmount: sale_fee_details.gross_amount
        };
    } catch (error) {
        console.error('Error al obtener la tarifa de venta:', error);
        return null;
    }
}

// Función para obtener el costo de envío por tipo de envío
async function getShippingCosts(itemId, zipCode) {
    
    const shippingUrl = `https://api.mercadolibre.com/items/${itemId}/shipping_options?zip_code=${zipCode}`;

    try {
        const response = await axios.get(shippingUrl);
        const options = response.data.options || [];
        return options.map(option => ({
            name: option.name,
            listCost: option.list_cost
        }));
    } catch (error) {
        console.error('Error al obtener los costos de envío:', error);
        return [];
    }
}

// Función principal para obtener todos los datos del producto
async function getDataProducto(id, zipCode) {
  
    let ShippingCosts = '';
    const url = `https://api.mercadolibre.com/items/${id}?attributes=id,title,category_id,price,base_price,initial_quantity,available_quantity,health,shipping,listing_type_id,descriptions,variations,condition,pictures,video_id,expiration_time,attributes&id=MAX_WEIGHT_LOAD,BRAND,value_name&id=MAX_SPEED,MODEL,value_name`;

    try {
        const itemDetails = await getEndPointData(url);

        if (!itemDetails || typeof itemDetails !== 'object') {
            throw new Error('La respuesta de la API para el artículo no es válida.');
        }

        // Obtener datos del costo de venta
        const saleFeeData = await getSaleFee(itemDetails.price, itemDetails.category_id, itemDetails.listing_type_id);

        // Obtener datos del costo de envío
        let shippingCosts = [];
        if (itemDetails.price >= 298) {
            shippingCosts = await getShippingCosts(id, zipCode);
        }

        const shippingCostsDisplay = shippingCosts.length > 0
        ? shippingCosts.map(cost => `Costo (${cost.name}): ${cost.listCost}`).join(', ')
        : 'Sin datos';
        const photoUrls = itemDetails.pictures.map(pictures => pictures.id);
        const photoColumns = photoUrls.reduce((acc, url, index) => {
            acc[`imagen ${index + 1}`] = url;
            return acc;
        }, {});
        
        return {
            CodigoGTIN: itemDetails.attributes ? itemDetails.attributes.find(attr => attr.id === 'SELLER_SKU')?.value_name : 'N/A',
            id: itemDetails.id,
            CategoriaID: itemDetails.category_id,
            Titulo: itemDetails.title || 'N/A',
            Precio: itemDetails.price || 'N/A',
            Porcentaje_De_Envio: saleFeeData ? saleFeeData.percentageFee : 'N/A',
            Costo_de_envio: saleFeeData ? saleFeeData.grossAmount : 'N/A',
            BPrecio: itemDetails.base_price || 'N/A',
            Stock: itemDetails.available_quantity || 'SIN STOCK',
            Costo_de_envio: shippingCostsDisplay,
            MetodoPago: itemDetails.shipping ? itemDetails.shipping.mode : 'N/A',
            Envio_Gratis: itemDetails.shing ? itemDetails.shipping.free_shipping : 'N/A',
            Estado: itemDetails.health || 'N/A',
            Video: itemDetails.video_id || 'Sin Video',
            Condicion: itemDetails.condition,
            TipoPublicacion: itemDetails.listing_type_id,
            ShippingCosts: ShippingCosts.listCost || 'No aplica',
            ...photoColumns
        };
    } catch (error) {
        console.error("Error obteniendo detalles del artículo:", error);
        return { id, error: "Error en la solicitud de atributos" };
    }
}

// Función para obtener el ID del producto desde la base de datos y luego obtener los datos del producto
async function getML_ID() {
  const sql = `SELECT * FROM mlidentificador`;
  try {
      const result = await getQueryDB(sql);
      const ids = result.map(item => item.MLM);
      console.log(`IDs obtenidos: ${ids.length}`);
      
      const zipCode = '55749'; // Asegúrate de usar el código postal correcto
      
      // Dividir IDs en bloques de 1000
      const blockSize = 1000;
      const idBlocks = [];
      for (let i = 0; i < ids.length; i += blockSize) {
          idBlocks.push(ids.slice(i, i + blockSize));
      }
      
      // Procesar cada bloque de IDs
      const allProducts = [];
      for (const block of idBlocks) {
          console.log(`Procesando bloque de ${block.length} IDs`);
          const productDataPromises = block.map(id => getDataProducto(id, zipCode));
          const products = await Promise.all(productDataPromises);
          allProducts.push(...products);
      }
      
      // Exportar los detalles a un archivo Excel
      exportToExcel(allProducts);
      
  } catch (error) {
      console.error(`POO ERROR:`, error);
      throw error; // Propaga el error para que pueda ser manejado por la función que llama a getML_ID
  }
}


// Función para exportar datos a un archivo Excel
function exportToExcel(items) {
    try {
        const worksheet = XLSX.utils.json_to_sheet(items);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Items');
        XLSX.writeFile(workbook, 'items_details.xlsx');
        console.log('Datos exportados a items_details.xlsx');
    } catch (error) {
        console.error('Error al exportar a Excel:', error);
    }
}

// Ejecuta la función principal
getML_ID();
