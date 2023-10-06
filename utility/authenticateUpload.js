const fs = require('fs').promises;
const { google } = require('googleapis');

const { client_id_upload, client_secret_upload, redirect_uris_upload } = process.env;

const refreshToken = async (oAuth2Client) => {
  try {
    const { tokens } = await oAuth2Client.refreshAccessToken();
    oAuth2Client.setCredentials(tokens);
  } catch (error) {
    console.error('Error refreshing access token:', error);
    throw error;
  }
};

//  to authenticate with Google Drive API
const authenticate = async () => {
  const SCOPES = ['https://www.googleapis.com/auth/drive']; 

  // various options for scope like reand only or with crud operations
  
  const oAuth2Client = new google.auth.OAuth2(client_id_upload, client_secret_upload, redirect_uris_upload);
  
  // store token
  const TOKEN_PATH = './uploadToken.json'; 
  
  try {
    // Check if the json file exists
    await fs.access(TOKEN_PATH);
    
    // Load the token if it exists
    const token = await fs.readFile(TOKEN_PATH);
    oAuth2Client.setCredentials(JSON.parse(token));
    
    // Check if the access token is expired, and refresh if needed
    if (oAuth2Client.isTokenExpiring()) {
      await refreshToken(oAuth2Client)
      // Save the updated token data to the token.json file
      await fs.writeFile(TOKEN_PATH, JSON.stringify(oAuth2Client.credentials))
    }
    
    return oAuth2Client;
  } catch (error) {
    // If the json file doesn't exist, create it
    if (error.code === 'ENOENT') {
      // create an empty token 
      const token = {
        access_token: '',
        refresh_token: '', 
        scope: SCOPES,
        token_type: 'Bearer',
        expiry_date: null,
      };
      
      // write it in json filethe empty token object to the token.json file
      await fs.writeFile(TOKEN_PATH, JSON.stringify(token));
      
      // Return the OAuth2 client without credentials
      return oAuth2Client;
    }
    // handle  errors
    console.error('Error loading token:', error)
    
  }
};

module.exports = authenticate;
