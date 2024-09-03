import axios from 'axios';
import fs from 'fs';
import ExcelJS from 'exceljs'; // Importar la librería exceljs

const access_token = 'APP_USR-1529010052401438-083016-a391eaf68c198e8d4117a69d89232914-635799575';

async function getArticulosFromUserId() {
  try {
    const config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: 'https://api.mercadolibre.com/users/635799575/items/search',
      headers: { 
        'Authorization': `Bearer ${access_token}` 
      }
    };
    const response = await axios(config);
    const resultados = response.data.results;

    // Map de las solicitudes para obtener atributos de artículos
    const detailedRequests = resultados.map(async (itemId) => {
      try {
        const itemDetailsResponse = {
          method: 'get',
          maxBodyLength: Infinity,
          url: `https://api.mercadolibre.com/items/${itemId}?attributes=id,price,category_id,title,health,shipping,available_quantity`,
          headers: { 
            'Authorization': `Bearer ${access_token}`
          }
        };

        const itemDetails = await axios.request(itemDetailsResponse);
        const calidadCompraData = await getCalidadCompra(itemId);
        console.log(itemDetails);
        return {
          id: itemDetails.data.id,
          categoriaID: itemDetails.data.category_id,
          Titulo: itemDetails.data.title || 'N/A',
          Precio: itemDetails.data.price || 'N/A',
          Stock: itemDetails.data.available_quantity || 'SIN STOCK',
          Shipping_mode: itemDetails.data.shipping ? itemDetails.data.shipping.mode : 'N/A',
          Shipping_free_shipping: itemDetails.data.shipping ? itemDetails.data.shipping.free_shipping : 'N/A',
          Estado: itemDetails.data.health || 'N/A',
          Calidad_item_id: calidadCompraData ? calidadCompraData.item_id : 'N/A',
          Calidad_reputation: calidadCompraData && calidadCompraData.reputation 
            ? calidadCompraData.reputation.color || 'N/A'
            : 'N/A',
          Calidad_metrics_details: calidadCompraData 
            ? (calidadCompraData.distribution && calidadCompraData.distribution.empty_state_title) || 'No hay datos disponibles'
            : 'N/A'
        };
      } catch (error) {
        console.error("Error obteniendo detalles del artículo:", error);
        return { id: itemId, error: "Error en la solicitud de atributos" };
      }
    });

    const detailedResults = await Promise.all(detailedRequests);

    // Exportar los resultados a un archivo Excel
    exportToExcel(detailedResults);

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

function exportToExcel(data) {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Productos');

    // Definir columnas
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 15 },
      { header: 'Categoría', key: 'category_id', width: 20 },
      { header: 'Nombre del Producto', key: 'title', width: 30 },
      { header: 'Precio', key: 'price', width: 15 },
      { header: 'Stock', key: 'stock', width: 15 },
      { header: 'Envío Gratis', key: 'shipping_free_shipping', width: 15 },
      { header: 'ID Calidad', key: 'calidad_item_id', width: 15 },
      { header: 'Calidad de Producto (%)', key: 'health', width: 25 },
      { header: 'Reputación', key: 'calidad_reputation', width: 20 },
      { header: 'Métras de Calidad', key: 'calidad_metrics_details', width: 50 }
    ];

    // Agregar filas
    data.forEach(item => {
      worksheet.addRow(item);
    });

    // Aplicar formato condicional a la columna 'Calidad de Producto (%)'
    worksheet.getColumn('health').eachCell({ includeEmpty: true }, (cell, rowNumber) => {
      if (rowNumber > 1) { // Excluir el encabezado
        const value = parseFloat(cell.value);
        if (!isNaN(value)) { // Verificar que el valor sea un número
          if (value < 80) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } }; // Rojo
          } else if (value >= 80 && value < 90) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } }; // Amarillo
          } else if (value >= 90) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00FF00' } }; // Verde
          }
        }
      }
    });

    // Aplicar formato condicional a la columna 'Reputación'
    worksheet.getColumn('calidad_reputation').eachCell({ includeEmpty: true }, (cell, rowNumber) => {
      if (rowNumber > 1) { // Excluir el encabezado
        const color = cell.value ? cell.value.toLowerCase() : '';
        if (color === 'red') {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } }; // Rojo
        } else if (color === 'yellow') {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } }; // Amarillo
        } else if (color === 'green') {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00FF00' } }; // Verde
        }
      }
    });

    // Guardar el archivo Excel
    const filePath = './data/Productos.xlsx';
    fs.mkdirSync('./data', { recursive: true }); // Crear el directorio si no existe
    workbook.xlsx.writeFile(filePath)
      .then(() => {
        console.log('El archivo Excel ha sido creado con éxito en el directorio data.');
      })
      .catch(error => {
        console.error('Error al exportar a Excel:', error);
      });
  } catch (error) {
    console.error('Error al exportar a Excel:', error);
  }
}

// Llamada principal
getArticulosFromUserId().then(results => {
  console.log("Resultados combinados:", results);
});
