// src/utils/getPhoto.js

const PEXELS_API_KEY = '5VBCUTlKcTbY8EKu4pkJR2t9sejV31UapB5wnQXAPMaFKsRGbv8hkJcQ';

// Smarter keyword extractor
function extractKeywords(activity) {
    let text = activity.toLowerCase().replace(/[^a-z\s]/g, '');
  
    const stopwords = new Set([
      'and', 'or', 'the', 'a', 'an', 'of', 'to', 'in', 'on', 'at',
      'for', 'with', 'from', 'by', 'is', 'are', 'was', 'were',
      'be', 'have', 'has', 'had', 'do', 'does', 'did',
      'go', 'went', 'visit', 'explore', 'enjoy', 'see', 'stroll',
      'return', 'take', 'walk', 'walked', 'drive', 'driving', 'dinner',
      'food', 'meal', 'local', 'street', 'market', 'shopping', 'tour',
      'and', 'or', 'but', 'if', 'so', 'because', 'about', 'up',
      'down', 'out', 'off', 'over', 'under', 'again', 'further',
      'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how',
      'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other',
      'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so',
      'than', 'too', 'very', 'can', 'will', 'just', 'don', 'should', 'now',
  
      // Add problematic words found in your queries:
      'memorial', 'largest', 'trip', 'conclude', 'through'
    ]);
  
    const words = text.split(/\s+/);
  
    const keywords = words.filter(word =>
      word.length > 3 &&
      !stopwords.has(word) &&
      /^[a-z]+$/.test(word)
    );
  
    return keywords.slice(0, 3).join(' ');
  }
  
  
  

// getPhoto.js

export async function getPhoto(keywords) {
    const query = encodeURIComponent(keywords);
    const url = `https://api.pexels.com/v1/search?query=${query}&per_page=1`;
  
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: PEXELS_API_KEY,
        },
      });
  
      if (!response.ok) {
        throw new Error(`Pexels API error: ${response.status}`);
      }
  
      const data = await response.json();
      if (data.photos && data.photos.length > 0) {
        return data.photos[0].src.medium;
      } else {
        return null; // fallback logic can go here
      }
    } catch (error) {
      console.error('Error fetching photo:', error);
      throw error;
    }
  }
  export { extractKeywords };
  
