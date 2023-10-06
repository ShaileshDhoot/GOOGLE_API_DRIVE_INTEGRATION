const {google} = require('googleapis')

const getAccessToken = async (code) => {
    const { client_id, client_secret, redirect_uris } = process.env;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris);
  
    try {
      const { tokens } = await oAuth2Client.getToken(code);
      oAuth2Client.setCredentials(tokens);
      return oAuth2Client;
    } catch (error) {
      console.error('Error getting access token:', error);
      throw error;
    }
  };

  module.exports = getAccessToken