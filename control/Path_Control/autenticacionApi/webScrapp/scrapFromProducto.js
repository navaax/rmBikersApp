import axios from 'axios';
import XLSX from 'xlsx';
import fs from 'fs';

// Leer el archivo XLSX
function leerXlsx(pathFile) {
  const workbook = XLSX.readFile(pathFile);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(sheet);
}

// Extraer el itemId de la URL
function extraerItemId(url) {
  const match = url.match(/MLM-(\d+)/);
  return match ? `MLM${match[1]}` : null;
}

// Función para obtener preguntas y respuestas
async function obtenerPreguntasProducto(itemId, productoIdPropio, vendedor, accessToken) {
    const url = `https://api.mercadolibre.com/questions/search?item=${itemId}&api_version=4`;
  
    try {
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      // Extraer las preguntas

      const preguntas = response.data.questions.map(question => ({
        sku_identificador: productoIdPropio,
        idProductoDelCompetidor: itemId,
        idPregunta: question.id,
        Vendedor: vendedor,
        estado: question.status,
        texto: question.text,
        fechaCreacion: question.date_created,
        respuesta: question.answer ? question.answer.text : 'No respondida'
      }));
  
      return preguntas;
    } catch (error) {
      console.error(`Error al obtener las preguntas del producto: SKU-${productoIdPropio} MLM-Vendedor: ${itemId} ${error.message}`);
      return [];
    }
  }

// Función principal
async function obtenerPreguntasYRespuestas(rutaArchivo, accessToken) {
  const datos = leerXlsx(rutaArchivo);
  const resultados = [];

  for (const fila of datos) {
    const productoIdPropio = fila.Name; 
    const vendedor = fila.Labels // Asegúrate de que la columna se llama 'SKU'
    const url = fila.URL; // Asegúrate de que la columna se llama 'URL'
    const itemId = extraerItemId(url);

    if (itemId) {
      const preguntas = await obtenerPreguntasProducto(itemId, productoIdPropio, vendedor, accessToken);
      resultados.push(...preguntas);
    }
  }

  // Guardar resultados en un archivo CSV
  const csv = resultados.map(p => 
    `"${p.sku_identificador}","${p.idProductoDelCompetidor}","${p.idPregunta}","${p.Vendedor}","${p.estado}","${p.texto}","${p.fechaCreacion}","${p.respuesta}"`
  ).join('\n');

  fs.writeFileSync('preguntas_y_respuestas.csv', `sku_identificador,idProductoDelCompetidor,idPregunta,Vendedor,estado,texto,fechaCreacion,respuesta\n${csv}`);
  console.log('Resultados guardados en preguntas_y_respuestas.csv');
}

// Ejecutar la función principal
const accessToken = 'APP_USR-889807737673414-091110-936252d7192e2863cf38dc3d4ea58869-420711769'; // Reemplaza con tu token de acceso
const rutaArchivo = './dataStract.xlsx';
obtenerPreguntasYRespuestas(rutaArchivo, accessToken);
