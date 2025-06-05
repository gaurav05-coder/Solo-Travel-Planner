# Solo Travel Planner

A production-ready web application to plan, organize, and maximize your solo adventures. Features AI-powered itinerary generation, a personal travel assistant chatbot, secure trip management, and a personalized dashboard—all designed for solo explorers.

---

## Features
- **AI Itinerary:** Generate day-wise, interest-based plans for any destination.
- **Personal Chatbot:** Get travel tips, destination info, and instant help 24/7.
- **Secure & Private:** All your trips are stored securely and only visible to you.
- **Personalized Dashboard:** See your travel persona, stats, and recommendations.
- **Community (coming soon):** Share trips and connect with other solo travelers.

---

## Tech Stack
- **Frontend:** React, Tailwind CSS, React Router, Firebase Auth/Firestore
- **Backend:** Node.js/Express, Cohere AI, Pexels API, Firebase

---

## Environment Setup

### 1. Frontend
- Copy `.env.example` to `.env` and add your Firebase credentials and API endpoints.
- Install dependencies:
  ```bash
  npm install
  ```
- Start the frontend:
  ```bash
  npm start
  ```

### 2. Backend
- Copy `.env.example` to `.env` and add your Cohere API key and Firebase credentials.
- Install dependencies:
  ```bash
  npm install
  ```
- Start the backend:
  ```bash
  npm run dev
  ```

### 3. Environment Variables
- **Never commit API keys or secrets to source control.**
- Use `.env` files and environment variables for all secrets in production.

---

## Deployment
- For production, build the frontend:
  ```bash
  npm run build
  ```
- Deploy to Netlify, Vercel, or your preferred provider.
- Ensure all environment variables are set in your deployment environment.

---

## Security
- All sensitive routes are protected by authentication.
- User data is stored in user-specific Firestore collections.
- Backend is secured with helmet, rate limiting, and strict CORS.

---

## Accessibility & UX
- All pages are accessible and responsive.
- Loading, error, and empty states are handled everywhere.

---

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## License
[MIT](LICENSE)
