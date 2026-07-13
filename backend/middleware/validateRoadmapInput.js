'use strict';

/* ── Validation middleware for POST /api/generate-roadmap ──────
   Checks that all required fields are present and well-formed.
   On failure returns 400 with an errors array.
   On success calls next() to hand off to the controller.
─────────────────────────────────────────────────────────────── */

const REQUIRED = ['name', 'skills', 'careerGoal', 'learningHours'];

const VALID_GOALS = [
  'Frontend Developer',
  'Backend Developer',
  'Full-Stack Developer',
  'AI Engineer',
  'Data Scientist',
  'Machine Learning Engineer',
  'DevOps Engineer',
  'Cybersecurity Analyst',
  'Mobile App Developer',
  'Cloud Architect',
];

function validateRoadmapInput(req, res, next) {
  const errors = [];
  const body   = req.body || {};

  /* Required-field presence */
  REQUIRED.forEach((field) => {
    const value = body[field];
    if (value === undefined || value === null || String(value).trim() === '') {
      errors.push({ field, message: `"${field}" is required and cannot be empty.` });
    }
  });

  /* Skip deeper validation if basic fields missing */
  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  /* learningHours must be a number between 1 and 8 */
  const hours = Number(body.learningHours);
  if (isNaN(hours) || hours < 1 || hours > 8) {
    errors.push({
      field: 'learningHours',
      message: '"learningHours" must be a number between 1 and 8.',
    });
  }

  /* careerGoal must be one of the accepted values */
  if (!VALID_GOALS.includes(body.careerGoal.trim())) {
    errors.push({
      field: 'careerGoal',
      message: `"careerGoal" must be one of: ${VALID_GOALS.join(', ')}.`,
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  /* Normalise data onto req.body before passing on */
  req.body.name          = String(body.name).trim();
  req.body.skills        = String(body.skills).trim();
  req.body.careerGoal    = String(body.careerGoal).trim();
  req.body.learningHours = hours;

  next();
}

module.exports = validateRoadmapInput;
