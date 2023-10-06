const fs = require('fs');
const { google } = require('googleapis');
const  authenticate  = require('../utility/authenticateUpload');

const { client_id_upload, client_secret_upload, redirect_uris_upload } = process.env;

// not importing because of change in credentials , and didnt created another js file for getaccesstoken for uploading
const getAccessToken = async (code) => {
    
    const oAuth2Client = new google.auth.OAuth2(client_id_upload, client_secret_upload, redirect_uris_upload);
  
    try {
      const { tokens } = await oAuth2Client.getToken(code);
      oAuth2Client.setCredentials(tokens);
      return oAuth2Client;
    } catch (error) {
      console.error('Error getting access token:', error);
      throw error;
    }
  };



const uploadVideoInChunks = async (auth, filePath, fileName, destFolderId) => {
  const drive = google.drive({ version: 'v3', auth });

  const fileMetadata = {
    name: fileName,
    parents: [destFolderId],
  };

  const media = {
    body: fs.createReadStream(filePath), 
  };

  try {
    const res = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id',
    });

    console.log('Video uploaded successfully. File ID:', res.data.id);
  } catch (error) {
    console.error('Error uploading video:', error);
  }
};

const createUploadAuthUrl = async (req, res) => {
    console.log('upload auth url')
  try {
    const auth = await authenticate();

    if (!auth) {
      throw new Error('Authentication failed');
    }
    const SCOPES = ['https://www.googleapis.com/auth/drive'];


    if (!auth.credentials.access_token) {
      
      const authUrl = auth.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        redirect_uri: 'http://localhost:3000/auth/upload/callback', 
      });
      console.log('Redirecting to authorization URL:', authUrl);
      return res.redirect(authUrl); 
    }
  } catch (error) {
    console.error('Error uploading video:', error);
    res.status(500).send(`Error uploading video: ${error.message}`);
  }
};

const videoUpload = async (req, res) => {
    console.log('videoupload function')
  const code = req.query.code; 

  try {
    const auth = await getAccessToken(code); t
    if (!auth) {
      throw new Error('Authentication failed');
    }

    
    if (!auth.credentials.access_token) {
      throw new Error('Authentication failed');
    }

    // const sourcePath = '../downloaded-video.mp4';
    // const destFolderId = '1FnIZDt_rJ4jFsMRdAfTET29oug6Y2uyB'; 
    // const fileName = 'video.mp4'; 

    const sourcePath = req.query.sourcePath; 
    const destFolderId = req.query.destFolderId; 
    const fileName = req.query.fileName; 
    //console.log('auth',auth, 'source path',sourcePath, 'filename' , fileName, 'destination folder', destFolderId)
    await uploadVideoInChunks(auth, sourcePath, fileName, destFolderId);
    res.send('Video uploaded successfully.');
  } catch (error) {
    console.error('Error handling OAuth2 callback:', error);
    res.status(500).send(`Error handling OAuth2 callback: ${error.message}`);
  }
};

module.exports = { videoUpload, createUploadAuthUrl };
