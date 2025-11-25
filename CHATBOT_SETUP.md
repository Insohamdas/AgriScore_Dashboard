# Chatbot Setup Instructions

## The Issue
The chatbot requires a valid Gemini API key to function. Currently, it's set to a placeholder.

## How to Fix

### Step 1: Get a Gemini API Key
1. Visit https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key

### Step 2: Update .env File
1. Open the `.env` file in the project root
2. Replace `your-api-key-here` with your actual API key:
   ```
   VITE_GEMINI_API_KEY=AIzaSy...your-actual-key-here
   ```

### Step 3: Restart the Server
1. Stop the current server (press Ctrl+C in terminal)
2. Start it again:
   ```bash
   npm run dev
   ```

### Step 4: Test the Chatbot
1. Navigate to "Help & Support" in the app
2. Try asking a question in text mode
3. You should get AI-powered responses

## Text Mode Features
- Ask agricultural questions
- Get crop recommendations
- Weather-related queries
- Farm management advice

## Voice Mode Features
- Click the voice button to activate
- Speak naturally to the AI
- Get spoken responses
- Requires microphone permissions

## Troubleshooting

### "API Key missing" error
- Check that `.env` file exists
- Verify the key starts with `VITE_GEMINI_API_KEY=`
- Ensure there are no extra spaces or quotes
- Restart the development server

### Chatbot not responding
- Open browser console (F12) to see detailed errors
- Check API key is valid and not expired
- Verify you have internet connection
- Some API features may require billing enabled

### Voice mode not working
- Grant microphone permissions when prompted
- Check that your browser supports Web Audio API
- Ensure API key has Live API access enabled
