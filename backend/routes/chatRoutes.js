'use strict';

const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/chatController');

/**
 * Chatbot Route
 *  POST /api/chat - Sends user question to AI / fallback responder
 */
router.post('/', ctrl.postMessage);

module.exports = router;
