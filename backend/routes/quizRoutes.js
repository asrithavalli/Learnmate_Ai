'use strict';

const express        = require('express');
const router         = express.Router();
const quizController = require('../controllers/quizController');

/**
 * POST /api/generate-quiz
 * Body: { careerGoal, skillGaps?, recommendedSkills? }
 * Returns: { success: true, data: { careerGoal, generatedBy, questions[] } }
 */
router.post('/', quizController.generateQuiz);

module.exports = router;
