require('dotenv').config();
const { CohereClient } = require('cohere-ai');
const cohere = new CohereClient(process.env.CO_API_KEY);

async function testChat() {
  try {
    const response = await cohere.chat({
      model: 'command-r-plus',
      message: 'Hello!',
      chatHistory: [],
      maxTokens: 10,
      temperature: 0.7,
    });
    console.log('Raw Cohere response:', response);
  } catch (err) {
    console.error('Cohere test error:', err);
    if (err.response && err.response.body) {
      console.error('Cohere error body:', err.response.body);
    }
  }
}

testChat();
