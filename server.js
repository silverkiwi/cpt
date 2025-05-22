const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const axios = require('axios');
const bodyParser = require('body-parser');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.static(__dirname)); // Serve static files
app.use(bodyParser.json({limit: '50mb'})); // Handle JSON requests with large payloads

// API proxy endpoint
app.post('/api/gemini', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not found in environment variables' });
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    // Forward the request to Gemini API
    const response = await axios.post(apiUrl, req.body);

    // Return the Gemini API response
    return res.json(response.data);
  } catch (error) {
    console.error('Error proxying to Gemini API:', error.message);

    // Log more detailed error information
    if (error.response) {
      console.error('Gemini API error response:', JSON.stringify(error.response.data, null, 2));

      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      return res.status(error.response.status).json({
        error: 'Gemini API error',
        details: error.response.data
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from Gemini API');
      return res.status(500).json({
        error: 'No response from Gemini API',
        details: error.message
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up request:', error.message);
      return res.status(500).json({
        error: 'Error setting up request',
        details: error.message
      });
    }
  }
});

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
