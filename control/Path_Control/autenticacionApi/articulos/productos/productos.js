import axios from 'axios';
import getQueryDB from '../../../../../servicios/sqlServ/query.js'; // Ajusta el path según tu estructura

// Configura tus variables
const ACCESS_TOKEN = 'APP_USR-889807737673414-091210-9c26eb77a8c048bc9ad42fd196dbb2a7-420711769';
const USER_ID = '420711769';
const BASE_URL = 'https://api.mercadolibre.com';

// Obtiene todos los ítems
async function fetchAllItems() {
  let allItemIds = [];
  let scrollId = null;

  while (true) {
    try {
      let url = `${BASE_URL}/users/${USER_ID}/items/search?search_type=scan`;
      if (scrollId) {
        url += `&scroll_id=${scrollId}`;
      }

      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`
        }
      });

      const data = response.data;
      allItemIds = allItemIds.concat(data.results);

      if (!data.scroll_id) {
        break;
      }

      scrollId = data.scroll_id;

    } catch (error) {
      console.error('Error al obtener los ítems:', error);
      break;
    }
  }

  await sendToSQL(allItemIds); // Mueve el llamado a sendToSQL aquí para asegurarte de que los datos están listos antes de enviarlos
  return allItemIds;
}

// Número máximo de ítems por lote para la inserción
const BATCH_SIZE = 1000;

async function sendToSQL(allItemIds) {
  // Dividir los ítems en lotes
  const chunks = [];
  for (let i = 0; i < allItemIds.length; i += BATCH_SIZE) {
    chunks.push(allItemIds.slice(i, i + BATCH_SIZE));
  }

  // Función para insertar un lote de datos
  async function insertBatch(batch) {
    try {
      // Construir los valores para la consulta SQL
      const values = batch.map(id => `('${id}')`).join(',');
      const query = `INSERT INTO mlidentificador (MLM) VALUES ${values};`; // Modificamos para usar los valores entre paréntesis
      console.log('Executing query:', query);
      await getQueryDB(query);
      console.log(`Inserted ${batch.length} records`);
    } catch (error) {
      console.error('Error al insertar los registros en la base de datos:', error);
      throw error; // Lanzar el error para manejo en el proceso principal
    }
  }

  // Insertar todos los lotes en paralelo
  try {
    await Promise.all(chunks.map(chunk => insertBatch(chunk)));
    console.log('Todos los registros han sido insertados correctamente.');
  } catch (error) {
    console.error('Error al insertar algunos lotes de registros:', error);
  }
}

// Ejecutar la función principal
fetchAllItems();
