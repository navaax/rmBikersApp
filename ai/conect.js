import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY, // Tu API Key de OpenAI
});
const openai = new OpenAIApi(configuration);

async function generateAnswers(questions) {
  try {
    const responses = [];
    
    for (const question of questions) {
      const prompt = `Responde a la siguiente pregunta de manera clara y útil:\n\nPregunta: ${question.text}\nRespuesta:`;
      const response = await openai.createCompletion({
        model: 'text-davinci-003', // O el modelo que estés usando
        prompt: prompt, 
        max_tokens: 150,
      });

      responses.push({
        id: question.id,
        answer: response.data.choices[0].text.trim(),
      });
    }

    return responses;
  } catch (error) {
    console.error('Error al generar respuestas con OpenAI:', error);
    return [];
  }
}
