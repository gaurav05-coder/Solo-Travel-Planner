// index.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { CohereClient } = require("cohere-ai");
const cohere = new CohereClient({ token: process.env.CO_API_KEY });

const app = express();
const PORT = process.env.PORT || 5001;

// Store chat context per sessionId
const chatContexts = new Map();

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

console.log("Loaded API key:", process.env.CO_API_KEY);

app.get("/", (req, res) => {
  res.send("Server is working!");
});

app.post('/chatbot', async (req, res) => {
  try {
    const { sessionId, message } = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({ error: 'Missing sessionId or message' });
    }

    // Get or initialize chat context array for this sessionId
    let context = chatContexts.get(sessionId) || [];

    // Add user message to context
    context.push(`User: ${message}`);

    // Keep only last 6 messages to limit context size (3 user + 3 bot)
    if (context.length > 6) context.shift();

    // Convert to Cohere format
    const chatHistory = context.map(line => {
      if (line.startsWith('User: ')) return { role: 'USER', message: line.replace('User: ', '') };
      if (line.startsWith('AI Travel Assistant: ')) return { role: 'CHATBOT', message: line.replace('AI Travel Assistant: ', '') };
      return null;
    }).filter(Boolean);

    // Set preamble to define assistant behavior
    const preamble = `
    You are a helpful, friendly, and knowledgeable **Personal AI Travel Assistant**. 
    
    You are not a general-purpose AI chatbot and must NEVER introduce yourself as a general assistant or by any other name (e.g., Coral, ChatGPT, etc.). Always identify yourself as a **Personal Travel Assistant** designed to help users with:
    - planning trips
    - suggesting places to visit
    - giving packing advice
    - sharing safety and visa tips
    - budgeting
    - generating day-wise itineraries
    
    If the user asks anything outside of travel, politely say you are only trained to help with travel-related topics.
    
    Start the conversation with a friendly greeting that explains your role as a **Personal AI Travel Assistant**.
    `.trim();

    const response = await cohere.chat({
      model: 'command-r-plus',
      message: message,
      chatHistory: chatHistory,
      preamble: preamble,
      maxTokens: 150,
      temperature: 0.7,
    });

    if (response && response.text) {
      const botReply = response.text.trim();
      // Add bot reply to context
      context.push(`AI Travel Assistant: ${botReply}`);
      // Update map
      chatContexts.set(sessionId, context);
      res.json({ reply: botReply });
    } else {
      console.error('Cohere response missing text field:', response);
      res.status(500).json({ error: 'Cohere response missing text field', details: response });
    }
  } catch (error) {
    console.error('Chatbot error:', error);
    if (error.response && error.response.body) {
      console.error('Cohere API error body:', error.response.body);
      res.status(500).json({ error: error.response.body });
    } else {
      res.status(500).json({ error: 'Failed to generate chatbot response' });
    }
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
