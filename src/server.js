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

app.get('/callback', async (req, res) => {
    const code = req.query.code || null;

    try {
        const response = await axios.post('https://accounts.spotify.com/api/token',
        querystring.stringify({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: REDIRECT_URI,
        }),
        {
            Headers: {
                'authorization': 'Basic ' + (new Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')),
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }

    );

    const { access_token, refresh_token } = response.data;
    res.redirect(`${FRONTEND_URI}/?access_token=${access_token}&refresh_token=${refresh_token}`);
    } catch (error) {
        console.error('Errror in /callback', error.message);
        res.redirect(`${FRONTEND_URI}/?error=invalid_token`);
    }
});

app.get('/refresh_token', async (req, res) => {
    const { refresh_token } = req.query;

    try {
        const response = await axios.post('https://accounts.spotify.com/api/token',
        querystring.stringify({
            grant_type: 'refresh_token',
            refresh_token: refresh_token,
        }),
        {
            Headers: {
                'authorization': 'Basic ' + (new Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')),
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }

    );

    const { access_token } = response.data;
    res.json({ access_token });
    } catch (error) {
        console.error('Errror in /refresh_token', error.message);
        res.status(400).json({ error: 'invalid_token' });
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

const PORT = process.env.PORT || 8888;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});