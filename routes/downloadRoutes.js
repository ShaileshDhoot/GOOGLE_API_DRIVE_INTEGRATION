const express = require('express');
const downloadContollers = require('../controller/download')
const router = express.Router();

router.get('/auth/google/callback',downloadContollers.videoDownload)
router.get('/download-video', downloadContollers.createAuthUrl)

module.exports = router