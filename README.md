# README.md

# Spotify App

This project is a Spotify application that allows users to authenticate and fetch their top items from the Spotify API.

## Project Structure

```
spotify-app
├── src
│   └── server.js        # Main server logic for the Spotify app
├── package.json         # npm configuration file with dependencies
├── Procfile             # Heroku process file to run the application
└── README.md            # Project documentation
```

## Setup Instructions

1. Clone the repository:
   ```
   git clone <repository-url>
   cd spotify-app
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory and add your Spotify API credentials:
   ```
   CLIENT_ID=your_client_id
   CLIENT_SECRET=your_client_secret
   FRONTEND_URI=your_frontend_uri
   ```

4. Start the server locally:
   ```
   npm start
   ```

## Usage

- Navigate to `http://localhost:3000` to access the application.
- Follow the authentication flow to log in with your Spotify account.
- Use the `/top-items/:type` endpoint to fetch your top items.

## Deploying to Heroku

1. Create a new Heroku app:
   ```
   heroku create your-app-name
   ```

2. Deploy the application:
   ```
   git push heroku main
   ```

3. Open the application in your browser:
   ```
   heroku open
   ```

## License

This project is licensed under the MIT License.