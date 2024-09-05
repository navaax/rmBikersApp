import { VertexAI } from '@google-cloud/vertexai';

// Inicializa el cliente de Vertex AI
const client = new VertexAI();

// Especifica el modelo de Gemini
const modelName = 'text-bison@001'; // Reemplaza con el nombre del modelo que deseas usar

// Crea la solicitud
const prompt = 'Escribe un poema sobre un gato';
const response = await client.generateText({ modelName, prompt });

console.log(response.text);