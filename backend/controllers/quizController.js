'use strict';

const quizService = require('../services/quizService');

/**
 * POST /api/generate-quiz
 * Body: { careerGoal, skillGaps?, recommendedSkills? }
 */
async function generateQuiz(req, res, next) {
  try {
    const { careerGoal, skillGaps = [], recommendedSkills = [] } = req.body;

    if (!careerGoal || typeof careerGoal !== 'string' || !careerGoal.trim()) {
      return res.status(400).json({
        success: false,
        message: '"careerGoal" is required.',
      });
    }

    const quiz = await quizService.buildQuiz({
      careerGoal:        careerGoal.trim(),
      skillGaps,
      recommendedSkills,
    });

    return res.status(200).json({ success: true, data: quiz });
  } catch (err) {
    next(err);
  }
}

module.exports = { generateQuiz };
