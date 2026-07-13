'use strict';

const chatService = require('../services/chatService');

/**
 * POST /api/chat
 * Body: { message }
 */
async function postMessage(req, res, next) {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: '"message" is required and cannot be empty.',
      });
    }

    const reply = await chatService.getChatbotResponse(message.trim());

    return res.status(200).json({
      success: true,
      reply,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { postMessage };
