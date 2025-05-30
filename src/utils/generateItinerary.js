import axios from "axios";

export async function generateItinerary({ destination, startDate, endDate, budget, interests }) {
  const days = (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24) + 1;

  const prompt = `
You're a travel planner. Create a ${days}-day itinerary for a solo traveler going to ${destination} 
from ${startDate} to ${endDate}. 
Interests: ${interests.join(", ")}.
Budget: $${budget}.
Keep the itinerary friendly and suggest 2-3 activities per day.`;

  try {
    const response = await axios.post("https://api.openai.com/v1/chat/completions", {
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    }, {
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Error generating itinerary:", error);
    return "Sorry, something went wrong while generating your itinerary.";
  }
}
