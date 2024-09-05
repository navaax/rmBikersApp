import fuzzy from 'fuzzy';
import axios from 'axios';
import fs from 'fs';
import XLSX from 'xlsx';
// import getAuthFromMercadoApi from '../Auth/autenToken.js';
import getArticulosFromUserId from '../articulos/getProductos.js';

let access_token = 'APP_USR-1529010052401438-090418-49bbc09fcad2c5811442a29eac398540-635799575';

// Función para leer el access_token desde un archivo
// async function obtenerAccessToken() {
//   try {
//     const token = await getAuthFromMercadoApi();
//     access_token = token.access_token;
//     user_id = token.user_id;
//     return access_token;
//   } catch (error) {
//     console.error("Error al obtener el token de autenticación:", error.message);
//     // Propaga el error para que la función principal pueda manejarlo
//     throw error;
//   }
// }

const listadoDeProductos = async () => {
    try {
        const getdataProducto = await getArticulosFromUserId();
        if (!getdataProducto || !Array.isArray(getdataProducto)) {
            throw new Error(`ERROR: La respuesta de getArticulosFromUserId no es válida.`);
        }
        return getdataProducto; // Devuelve la lista completa de productos
        
    } catch (error) {
        console.error('Error al obtener el listado de productos:', error);
        return [];
    }
}
async function buscarProductosApi(producto, accessToken) {
  // Ahora la función buscarProductosApi recibe un solo producto
  const siteId = 'MLM';
  const url = `https://api.mercadolibre.com/sites/${siteId}/search?q=${encodeURIComponent(producto.Titulo)}&attributes=id,price,category_id,title,seller,available_quantity&category_id=${producto.CategoriaID}&limit=10`;
  console.log(url);

  try {
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    return response.data.results; // Retorna la lista de resultados

  } catch (error) {
    console.error(`Error en la búsqueda de productos: ${error.message}`);
    throw error;
  }
}
async function compararProductos() {
  const productosPropios = await listadoDeProductos();
  const comparaciones = [];

  // Iterar sobre todos los productos propios
  for (const productoPropio of productosPropios) {
    // Buscar la competencia para el producto propio actual
    const resultadosMercadoLibre = await buscarProductosApi(productoPropio, access_token);
    
    // Filtrar los resultados de Mercado Libre basados en una coincidencia de título alta
    const productosSimilares = resultadosMercadoLibre.filter(productoML => {
      // Comparación difusa de títulos
      const resultadoFuzzy = fuzzy.match(productoPropio.Titulo, productoML.title, {
        pre: '',
        post: '',
        extract: (el) => el,
        threshold: 1 // Ajusta este umbral según tus necesidades
      });

      return resultadoFuzzy && resultadoFuzzy.score >= 1;
    });

    // Iterar sobre los productos similares de Mercado Libre
    for (const productoML of productosSimilares) {
      // Comparar categorías de forma más confiable
      
        comparaciones.push({
          Id_Del_Producto: productoPropio.id,
          ProductoMLTitulo: productoML.title,
          PrecioPropio: productoPropio.Precio, // Agrega aquí el precio del producto propio
          PrecioML: productoML.price,
          order_Backend: productoML.order_backend,
          Stock: productoML.available_quantity,
          Vendedor: productoML.seller.nickname
        });
      
    }
  }

  return comparaciones;
}



// Llamada a la función para mostrar la tabla
async function generarExcel() {
  try {
    const productosPropios = await listadoDeProductos();
    const comparaciones = await compararProductos();

    // Crear el libro de Excel
    const wb = XLSX.utils.book_new();

    // Crear la hoja de productos propios
    const wsProductosPropios = XLSX.utils.json_to_sheet(productosPropios);
    XLSX.utils.book_append_sheet(wb, wsProductosPropios, 'Productos Propios');

    // Crear la hoja de comparaciones
    const wsComparaciones = XLSX.utils.json_to_sheet(comparaciones);
    XLSX.utils.book_append_sheet(wb, wsComparaciones, 'Comparaciones');

    // Guardar el archivo Excel
    const filePath = 'comparaciones_productos.xlsx';
    XLSX.writeFile(wb, filePath);
    console.log(`Archivo Excel creado: ${filePath}`);

  } catch (error) {
    console.error('Error al generar el archivo Excel:', error);
  }
}

  
generarExcel();