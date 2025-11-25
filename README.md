# AgriScore Dashboard

A comprehensive smart farming dashboard with real-time monitoring, AI assistance, and analytics.

## Features

- 📊 Real-time farm monitoring dashboard
- 🌱 Crop management and health tracking
- 💧 Soil & water analytics with IoT sensor data
- ⛅ Weather integration with forecasting
- ✅ Task management system
- 🤖 AI-powered chatbot (text & voice) using Gemini API
- 📈 Reports and analytics
- 👤 User account management

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Gemini API Key

Update the `.env` file with your actual Gemini API key:

```env
VITE_GEMINI_API_KEY=your-actual-gemini-api-key-here
```

**To get a Gemini API key:**
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Copy and paste it into the `.env` file

### 3. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000/`

## Troubleshooting

### Chatbot Not Working
- Verify `.env` file has `VITE_GEMINI_API_KEY=your-key`
- Restart dev server after adding API key: Stop server (Ctrl+C) and run `npm run dev` again
- Check browser console (F12) for error messages
- Ensure API key is valid and has proper permissions

### Voice Chat Not Working
- Grant microphone permissions when prompted
- Ensure you're using HTTPS or localhost
- Check that your Gemini API key supports Live API features

## Technology Stack

- React 19, TypeScript, Vite 6
- React Router, Recharts, Lucide Icons
- Tailwind CSS, Google Gemini AI
