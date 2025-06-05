// itinerary-backend/index.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();
const { CohereClient } = require("cohere-ai");
const axios = require("axios");
const { body, validationResult } = require("express-validator");

// Initialize Cohere client with correct env var name
const cohere = new CohereClient(process.env.COHERE_API_KEY);

const app = express();
const PORT = process.env.PORT || 5001;

// Store chat context per sessionId for chatbot memory
const chatContexts = new Map();

// Middleware
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://solo-travel-planner-e3620.web.app",
  "https://solo-travel-planner-e3620.firebaseapp.com"
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  })
);
app.use(express.json());
app.use(helmet());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later." },
  })
);

// Mask API key in logs
console.log("Loaded Cohere API key:", process.env.COHERE_API_KEY ? process.env.COHERE_API_KEY.slice(0, 4) + "****" : "NOT SET");

// --- Basic health check ---
app.get("/", (req, res) => {
  res.send("Server is working!");
});

// --- Persona classification endpoint ---
app.post(
  "/persona",
  [
    body("interests").isArray({ min: 1 }).withMessage("Interests must be a non-empty array."),
    body("budget").optional().isNumeric().withMessage("Budget must be a number."),
    body("duration").optional().isNumeric().withMessage("Duration must be a number."),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: "Invalid input", details: errors.array() });
    }
    const { interests, budget, duration } = req.body;
    // Basic mock logic for persona
    const persona =
      interests.includes("Museums") || interests.includes("History")
        ? "Culture Explorer"
        : interests.includes("Beaches") || interests.includes("Nature")
        ? "Nature Nomad"
        : "Foodie Drifter";
    res.json({ persona });
  }
);

// --- Helper: Generate itinerary using Cohere chat endpoint ---
async function generateItinerary(prompt) {
  try {
    const response = await axios.post(
      "https://api.cohere.ai/v1/chat",
      {
        model: "command-xlarge-nightly",
        temperature: 0.8,
        max_tokens: 1000,
        chat_history: [],
        message: prompt,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 60000,
      }
    );

    return response.data.text;
  } catch (error) {
    console.error("🔥 Axios error details:", error.response?.data || error.message);
    throw error;
  }
}

// --- Chatbot endpoint ---
app.post(
  '/chatbot',
  [
    body("sessionId").isString().notEmpty().withMessage("sessionId is required."),
    body("message").isString().notEmpty().withMessage("message is required."),
  ],
  async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: "Invalid input", details: errors.array() });
    }
    const { sessionId, message } = req.body;
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
      res.status(500).json({ error: 'AI service error', details: error.response.body });
    } else {
      res.status(500).json({ error: 'Failed to generate chatbot response' });
    }
  }
});


// --- Itinerary generation endpoint ---
app.post(
  "/generate-itinerary",
  [
    body("destination").isString().notEmpty().withMessage("Destination is required."),
    body("startDate").isString().notEmpty().withMessage("Start date is required."),
    body("endDate").isString().notEmpty().withMessage("End date is required."),
    body("interests").isArray({ min: 1 }).withMessage("Interests must be a non-empty array."),
    body("budget").optional().isNumeric().withMessage("Budget must be a number."),
  ],
  async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: "Invalid input", details: errors.array() });
    }
    const { destination, startDate, endDate, interests, budget } = req.body;
    const daysCount =
      Math.ceil(
        (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
      ) + 1;

    // Prompt with strict JSON format instructions for Cohere chat API
    const prompt = `
Create a detailed ${daysCount}-day travel itinerary for a solo traveler visiting ${destination}. The traveler is interested in ${interests.join(", ")}.

**Important:**
- Respond **only** with a JSON array.
- Do **NOT** include any explanations, introductions, or extra text.
- The JSON must be an array of objects.
- Each object must have:
  - a "day" field (e.g., "Day 1")
  - an "activities" field which is an array of 3 to 5 activity descriptions (strings) for that day.

Example format you must follow exactly:

[
  {
    "day": "Day 1",
    "activities": [
      "Visit the main museum",
      "Have lunch at a local cafe",
      "Walk through the historic district"
    ]
  },
  {
    "day": "Day 2",
    "activities": [
      "Explore the art gallery",
      "Try local street food",
      "Visit the city park"
    ]
  }
]

Please ensure the output is valid JSON and contains no extra characters or text outside the JSON array.
    `;

    const rawText = await generateItinerary(prompt);

    // Extract JSON from raw AI response
    let itineraryJson;
    try {
      const jsonStart = rawText.indexOf("[");
      const jsonEnd = rawText.lastIndexOf("]") + 1;
      if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error("No JSON array found in AI response");
      }
      const jsonString = rawText.substring(jsonStart, jsonEnd);
      itineraryJson = JSON.parse(jsonString);
    } catch (e) {
      console.error("Error parsing AI itinerary JSON:", e.message || e);
      return res.status(500).json({
        error: "Failed to parse AI response as JSON.",
        rawResponse: rawText,
      });
    }
    res.json({ itinerary: itineraryJson });
  } catch (error) {
    console.error("Itinerary generation failed:", error.message);
    res.status(500).json({ error: "AI generation failed", details: error.message });
  }
});

// --- Global error handlers ---
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
});

// --- Start the server ---
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
