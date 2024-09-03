const { GoogleGenerativeAI } = require("@google/generative-ai");
// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

async function processData(data) {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
    const prompt = data.prompt; // Assuming 'prompt' is the key for the prompt in your data
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
  
    console.log("Gemini "
   response:", text);
    return text; // Or do something else with the response
  }
  
  module.exports = { processData };