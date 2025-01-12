const express = require('express');
const axios = require('axios');
const querystring = require('querystring');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;
const FRONTEND_URI = process.env.FRONTEND_URI;

app.get('/login', (req, res) => {
    const scope = 'user-top-read';
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: CLIENT_ID,
            scope: scope,
            redirect_uri: REDIRECT_URI
        }));
});

// Handle OAuth callback and exchange authorization code for access token
app.get('/callback', async (req, res) => {
    const code = req.query.code || null;  // Get authorization code from query params

    try {
        // Request access token from Spotify
        const response = await axios.post('https://accounts.spotify.com/api/token',
        querystring.stringify({
            grant_type: 'authorization_code',  // Specify the grant type
            code: code,  // Include the authorization code
            redirect_uri: REDIRECT_URI,  // Include the redirect URI
        }),
        {
            Headers: {
                'authorization': 'Basic ' + (new Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')),  // Base64 encode client ID and secret
                'Content-Type': 'application/x-www-form-urlencoded'  // Set content type
            }
        });

        // Extract access and refresh tokens from response
        const { access_token, refresh_token } = response.data;
        // Redirect to frontend with tokens as query params
        res.redirect(`${FRONTEND_URI}/?access_token=${access_token}&refresh_token=${refresh_token}`);
    } catch (error) {
        console.error('Error in /callback', error.message);  // Log error message
        res.redirect(`${FRONTEND_URI}/?error=invalid_token`);  // Redirect to frontend with error
    }
});

// Refresh access token using refresh token
app.get('/refresh_token', async (req, res) => {
    const { refresh_token } = req.query;  // Get refresh token from query params

    try {
        // Request new access token from Spotify
        const response = await axios.post('https://accounts.spotify.com/api/token',
        querystring.stringify({
            grant_type: 'refresh_token',  // Specify the grant type
            refresh_token: refresh_token  // Include the refresh token
        }),
        {
            Headers: {
                'authorization': 'Basic ' + (new Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')),  // Base64 encode client ID and secret
                'Content-Type': 'application/x-www-form-urlencoded'  // Set content type
            }
        });

        // Extract new access token from response
        const { access_token } = response.data;
        // Send new access token as JSON response
        res.json({ access_token });
    } catch (error) {
        console.error('Error in /refresh_token', error.message);  // Log error message
        res.status(500).json({ error: 'Failed to refresh token' });  // Send error response
    }
});

app.get('/top-items/:type', async (req, res) => {
    const { type } = req.params;
    const { time_range, access_token } = req.query;

    try {
        const response = await axios.get(`https://api.spotify.com/v1/me/top/${type}`, {
            params: {
                time_range,
                limit: 10,
                locale: 'es-419, es;q=0.9'
            },
            headers: {
                'authorization': `Bearer ${access_token}`
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Errror in /top-items', error.message);
        res.status(400).json({ error: 'Error fetching top items' });
    }
});

// Start the Express server
const PORT = process.env.PORT || 8888;  // Get port from environment or default to 8888
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);  // Log server start message
});