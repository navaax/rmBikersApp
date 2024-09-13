import fuzzy from 'fuzzy';
import axios from 'axios';
import fs from 'fs';
import XLSX from 'xlsx';
import getArticulosFromUserId from '../../autenticacionApi/articulos/getProductos.js';
import * as cheerio from 'cheerio';

let access_token = 'APP_USR-889807737673414-090913-d6d9bb5e227a5599156094a5a4fb55b5-420711769';
const sellerIdsToFilter = [1107927983, 1111427732, 147712068, 1295123986, 132947885, 188528201, 225306136, 678107898, 1651870819, 121996258, 1214768485, 1694176395, 1568479543, 1287189487, 339071922, 5742139330, 96659371, 171629865];


//Parametros a evaluar, los datos para ventas.
//Porcentaje de precios mas altos, 30%. Se tiene que ver o monitoriar en caso de que baje de precio




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
};

async function buscarProductosApi(producto, accessToken) {
  const siteId = 'MLM';
  const url = `https://api.mercadolibre.com/sites/${siteId}/search?q=${encodeURIComponent(
    producto.Titulo
  )}&attributes=id,price,category_id,title,seller,available_quantity&category_id=${
    producto.CategoriaID
  }&limit=10`;
  console.log(url);

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data.results; // Retorna la lista de resultados
  } catch (error) {
    console.error(`Error en la búsqueda de productos: ${error.message}`);
    throw error;
  }
}


async function obtenerPreguntasProducto(itemId, productoIdPropio, accessToken) {
  const url = `https://api.mercadolibre.com/questions/search?item=${itemId}&api_version=4`;

  try {
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    console.log('Resultados de preguntas de la API:', response.data);

    
    const preguntas = response.data.questions.map(question => ({
      idProductoPropio: productoIdPropio,
      idProductoDelCompetidor: itemId,
      idPregunta: question.id,
      vendedorId: question.seller_id,
      estado: question.status,
      texto: question.text,
      fechaCreacion: question.date_created,
      respuesta: question.answer ? question.answer.text : 'No respondida'
    }));

    return preguntas;
  } catch (error) {
    console.error(`Error al obtener las preguntas del producto: ${error.message}`);
    return [];
  }
}

async function compararProductos() {
  const productosPropios = await listadoDeProductos();
  const comparaciones = [];
  const preguntas = [];

  try {
    for (const productoPropio of productosPropios) {
      const resultadosMercadoLibre = await buscarProductosApi(
        productoPropio,
        access_token
      );
      const productosFiltrados = resultadosMercadoLibre.filter(
        productoML => sellerIdsToFilter.includes(productoML.seller.id)
      );
      if (productosFiltrados.length > 0) {
        // Ordenar los productos filtrados por precio de forma ascendente
        productosFiltrados.sort((a, b) => a.price - b.price);

        // Agregar cada producto filtrado a la lista de comparaciones
        comparaciones.push(
          ...productosFiltrados.map(productoML => ({
            idProducto_relacionado: productoPropio.id,
            id: productoML.id || '-',
            Nombre:
              productoML.title || 'No encontrad@ dentro de los competidores asignados',
            IdVendedor: productoML.seller.id || '-',
            NombreVendedor: productoML.seller.nickname || '-',
            Enlace: productoML.permalink || '-',
            precio: productoML.price || '-',
            ComparacionPrecio:
              productoML.price > productoPropio.Precio
                ? `Vamos ganando por: $${productoML.price - productoPropio.Precio}`
                : `Vamos perdiendo por: $${productoPropio.Precio - productoML.price || '-'}`,
          }))
        );

        // Obtener preguntas para cada producto filtrado
        for (const productoML of productosFiltrados) {
          const preguntasProducto = await obtenerPreguntasProducto(productoML.id, access_token);
          // Añadir el idProducto_relacionado
          preguntas.push(...preguntasProducto.map(pregunta => ({
            ...pregunta,
            idProducto_relacionado: productoPropio.id // Añadir el id del producto propio relacionado
          })));
        }
      } else {
        comparaciones.push({
          idProducto_relacionado: productoPropio.id,
          id: '-',
          Nombre: 'No encontrados en listado de competencia',
          IdVendedor: '-',
          NombreVendedor: '-',
          Enlace: '-',
          precio: '-',
          ComparacionPrecio: '-',
        });
      }
    }
  } catch (error) {
    console.error('Error en comparaciones:', error);
  }

  return { comparaciones, preguntas };
}

async function generarExcel() {
  try {
    const { comparaciones, preguntas } = await compararProductos();

    // Crear el libro de Excel
    const wb = XLSX.utils.book_new();

    // Crear la hoja de productos propios
    const wsProductosPropios = XLSX.utils.json_to_sheet(await listadoDeProductos());
    XLSX.utils.book_append_sheet(wb, wsProductosPropios, 'Productos Propios');

    // Crear la hoja de comparaciones
    const wsComparaciones = XLSX.utils.json_to_sheet(comparaciones);
    XLSX.utils.book_append_sheet(wb, wsComparaciones, 'Comparaciones');

    // Crear la hoja de preguntas
    const wsPreguntas = XLSX.utils.json_to_sheet(preguntas);
    XLSX.utils.book_append_sheet(wb, wsPreguntas, 'Preguntas');

    // Guardar el archivo Excel
    const filePath = 'comparaciones_productos.xlsx';
    XLSX.writeFile(wb, filePath);
    console.log(`Archivo Excel creado: ${filePath}`);
  } catch (error) {
    console.error('Error al generar el archivo Excel:', error);
  }
}



generarExcel();
