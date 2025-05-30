// index.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 5001;

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

// ✅ Corrected Cohere call using messages array
// Simpler Cohere completion
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




console.log("Loaded API key:", process.env.COHERE_API_KEY);

// Health check route
app.get("/", (req, res) => {
  res.send("Server is working!");
});

// Main AI generation route
app.post("/generate-itinerary", async (req, res) => {
  try {
    const { destination, startDate, endDate, interests, budget } = req.body;

    if (!destination || !startDate || !endDate || !interests) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const daysCount =
      Math.ceil(
        (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
      ) + 1;

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

    // After receiving rawText from AI
let itineraryJson;

try {
  // Try to extract JSON from AI response by detecting the first '{' or '['
  const jsonStart = rawText.indexOf("[");
  const jsonEnd = rawText.lastIndexOf("]") + 1;

  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error("No JSON array found in AI response");
  }

  const jsonString = rawText.substring(jsonStart, jsonEnd);
  itineraryJson = JSON.parse(jsonString);
} catch (e) {
  console.error("Error parsing itinerary JSON:", e.message);
  // Return the raw AI text so frontend can see what happened
  return res.status(500).json({
    error: "Failed to parse AI response as JSON.",
    rawResponse: rawText,
  });
}


    res.json({ itinerary: itineraryJson });
  } catch (error) {
    console.error("Itinerary generation failed:", error.message);
    res.status(500).json({ error: "AI generation failed: " + error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});

// Optional test block
// if (require.main === module) {
//   const testPrompt = `Create a 2-day itinerary for a solo traveler visiting Rome interested in history and food. Format the response like this:

// [
//   {
//     "day": "Day 1",
//     "activities": ["Visit the Colosseum", "Eat carbonara", "Walk around Trastevere"]
//   },
//   {
//     "day": "Day 2",
//     "activities": ["Vatican tour", "Lunch at local trattoria", "Explore Roman Forum"]
//   }
// ]`;

//   generateItinerary(testPrompt)
//     .then((text) => {
//       console.log("✅ AI response:", text);
//       process.exit(0);
//     })
//     .catch((err) => {
//       console.error("❌ Error generating itinerary:", err.message || err);
//       process.exit(1);
//     });
// }


