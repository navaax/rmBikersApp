import OpenAI from 'openai';
import axios from 'axios';
import XLSX from 'xlsx';
import path from 'path';
import express from 'express';
import getArticulosFromUserId from '../getProductos.js';
const ACCESS_TOKEN = 'APP_USR-1529010052401438-090710-07e0cccea6b8a6027464ea0c2ec68a01-635799575';

// Configuración de OpenAI
const openai = new OpenAI({
  apiKey: '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', // Tu API Key de OpenAI
});

// Función para obtener la lista de productos
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

// Función para obtener preguntas por producto
async function getQuestionsForItem(itemId) {
  try {
    const response = await axios.get(
      `https://api.mercadolibre.com/questions/search?item=${itemId}&api_version=4`,
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
        },
      }
    );
    
    // Filtra las preguntas no respondidas
    const unansweredQuestions = response.data.questions.filter(
      (apiQuestion) => apiQuestion.status === 'UNANSWERED'
    );
    console.log(unansweredQuestions);
    
    return unansweredQuestions;
  } catch (error) {
    console.error('Error al obtener preguntas:', error);
    return [];
  }
}

// Función para leer el archivo Excel y obtener preguntas históricas
async function getExcelQuestions(itemId) {
  try {
    const workbook = XLSX.readFile('../../webScrapp/comparaciones_productos.xlsx');
    const sheetName = workbook.SheetNames[2]; // Hoja 3
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Filtrar y devolver solo las filas donde la primera columna (ITEM) coincide con itemId
    return data.filter(row => row[0] === itemId).map(row => ({
      id: row[1],
      text: row[2],
      answer: row[3],
    }));
  } catch (error) {
    console.error('Error al leer el archivo Excel:', error);
    return [];
  }
}

// Función para generar respuestas con OpenAI
async function generateAnswer(questionText, excelQuestions) {
  try {
    // Prepara el prompt para OpenAI
    const prompt = `
    Responde a la pregunta del usuario: "${questionText}" 
    en base a la siguiente información: 

    ${excelQuestions.map(item => `${item.text}: ${item.answer}`).join('\n')}

    Si no hay información relevante en la base de datos, responde: 
    "Lamentamos no encontrar la información específica a tu pregunta, puedes consultarnos mediante nuestro chat".
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1500,
    });
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error al generar respuesta con OpenAI:', error);
    return 'No se pudo generar una respuesta.';
  }
}


const app = express();
app.use(express.json());

// Función principal para coordinar el proceso
async function run() {
  try {
    const productList = await listadoDeProductos();
    const results = []; // Guardar resultados para la ruta web

    for (const product of productList) {
      const itemId = product.id;
      const unansweredQuestions = await getQuestionsForItem(itemId);
      const excelQuestions = await getExcelQuestions(itemId);

      // Itera sobre las preguntas no respondidas
      for (const question of unansweredQuestions) {
        const answer = await generateAnswer(question.text, excelQuestions);
        results.push({
          itemId: itemId,
          question: question.text,
          answer: answer,
        });
        
        // Imprimir la pregunta y la respuesta generada
        console.log(`Item ID: ${itemId}`);
        console.log(`Pregunta: ${question.text}`);
        console.log(`Respuesta: ${answer}`);
      }
    }

    // Exponer los resultados para ver en el navegador
    app.get('/results', (req, res) => {
      res.json(results);
    });

  } catch (error) {
    console.error('Error en la ejecución del proceso:', error);
  }

  setTimeout(run, 60000); // Ejecuta cada 60 segundos (1 minuto)
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

// Iniciar la ejecución
run();