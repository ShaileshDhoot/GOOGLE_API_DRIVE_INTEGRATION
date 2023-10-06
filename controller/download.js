const fs = require('fs')
const {google} = require('googleapis')
const  getAccessToken  = require('../utility/getAccessToken');
const  authenticate  = require('../utility/authenticateDownload');



const downloadVideo = async (auth, fileId, destPath) => {
    const drive = google.drive({ version: 'v3', auth });   
    
    const destStream = fs.createWriteStream(destPath);
  
    try {
      const response = await drive.files.get(
        { fileId, alt: 'media' },
        { responseType: 'stream' }
      );
  
      const media = response.data;
      const readableStream = media.on('end', () => {
        console.log('Download completed');
      });
  
      readableStream.pipe(destStream);
  
      await new Promise((resolve, reject) => {
        readableStream.on('end', () => {
          resolve();
        });
  
        readableStream.on('error', (error) => {
          console.error('Download error:', error);
          reject(error);
        });
      });
    } catch (error) {
      console.error('Error downloading video:', error);
      throw error;
    }
  };

const createAuthUrl =  async (req, res) => {
    try {
      const auth = await authenticate();
      if (!auth) {
        throw new Error('Authentication failed');
      }
      const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];
      // Redirect the user to the authorization URL if not authenticated
      if (!auth.credentials.access_token) {
        const authUrl = auth.generateAuthUrl({
          access_type: 'offline',
          scope: SCOPES,
        });
        console.log('Redirecting to authorization URL:', authUrl);
        res.redirect(authUrl); 
        return; 
      }
  
    } catch (error) {
      console.error('Error downloading video:', error);
      res.status(500).send(`Error downloading video: ${error.message}`);
    }
  };

const videoDownload =  async (req, res) => {
    const code = req.query.code; // The authorization code provided by Google
  
    try {
      const auth = await getAccessToken(code); // Use getAccessToken to get the authenticated client
      if (!auth) {
        throw new Error('Authentication failed');
      }
  
      // check if the user is authenticated
      if (!auth.credentials.access_token) {
        throw new Error('Authentication failed');
      }
  
      //  auth is correctly authenticated with the access token
      // trigger the download process here, by calling downloadVideo
  
      const fileId = '1-qt6axW1YJp8FWaXpetNi-WXdsghSe3r'; 
      const destPath = './downloaded-video.mp4';

      // const fileId = req.query.fileId; // Source Google Drive video ID
      // const destPath = req.query.destPath; // Destination file path

  
      await downloadVideo(auth, fileId, destPath);


      
      res.send('Video downloaded successfully.');


    } catch (error) {
      console.error('Error handling OAuth2 callback:', error);
      res.status(500).send(`Error handling OAuth2 callback: ${error.message}`);
    }
  };


  

  module.exports = {videoDownload, createAuthUrl}