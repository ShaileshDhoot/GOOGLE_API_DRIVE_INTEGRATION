const fs = require('fs').promises
const {google} = require('googleapis')

const refreshToken = async (oAuth2Client) => {
    try {
      const { tokens } = await oAuth2Client.refreshAccessToken();
      oAuth2Client.setCredentials(tokens);
    } catch (error) {
      console.error('Error refreshing access token:', error);
      throw error;
    }
  };

// Function to authenticate with Google Drive API

const authenticate = async () => {
    const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];
    const { client_id, client_secret, redirect_uris } = process.env;
  
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris);
  
    const TOKEN_PATH = './downloadToken.json'; // Path to store the token
  
    try {
      // Check if the token.json file exists
      await fs.access(TOKEN_PATH);
  
      // Load the token if it exists
      const token = await fs.readFile(TOKEN_PATH);
      oAuth2Client.setCredentials(JSON.parse(token));
      
      // Check if the access token is expired, and refresh if needed
      if (oAuth2Client.isTokenExpiring()) {
        await refreshToken(oAuth2Client);
        // Save the updated token data to the token.json file
        await fs.writeFile(TOKEN_PATH, JSON.stringify(oAuth2Client.credentials));
      }
      
      return oAuth2Client;
    } catch (error) {
      // If the token.json file doesn't exist, create it
      if (error.code === 'ENOENT') {
        // Create an empty token object
        const token = {
          access_token: '',
          refresh_token: '', // You may want to set this up properly after initial authorization
          scope: SCOPES,
          token_type: 'Bearer',
          expiry_date: null,
        };
  
        // Write the empty token object to the token.json file
        await fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  
        const authUrl = oAuth2Client.generateAuthUrl({
          access_type: 'offline',
          scope: SCOPES,
          // Make sure this matches the authorized redirect URI
          redirect_uri: 'http://localhost:3000/auth/google/callback',
        });
        console.log('Authorize this app by visiting this URL:', authUrl);
        
        // Return the OAuth2 client without credentials
        return oAuth2Client;
      }
      // Handle other errors
      console.error('Error loading token:', error);
      return null;
    }
  };

  module.exports = authenticate