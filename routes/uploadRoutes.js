const express = require('express');
const uploadControllers = require('../controller/upload'); 

const router = express.Router();

router.get('/auth/upload/callback',uploadControllers.videoUpload)
router.get('/upload-video', uploadControllers.createUploadAuthUrl)

module.exports = router