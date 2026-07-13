'use strict';

/* ── Validation middleware for student profile routes ──────────
   Validates required fields on POST (create) and allowed fields
   on PUT (update). Returns 400 with a structured errors array.
─────────────────────────────────────────────────────────────── */

const VALID_YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate'];

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

/* Fields required on creation */
const REQUIRED_ON_CREATE = [
  'name', 'email', 'college', 'branch', 'year', 'careerGoal', 'learningHours',
];

function runChecks(body, requireAll) {
  const errors = [];

  /* Required fields (only enforced on POST) */
  if (requireAll) {
    REQUIRED_ON_CREATE.forEach((field) => {
      const val = body[field];
      if (val === undefined || val === null || String(val).trim() === '') {
        errors.push({ field, message: `"${field}" is required and cannot be empty.` });
      }
    });
    if (errors.length) return errors; // stop early — deeper checks need values
  }

  /* email format */
  if (body.email !== undefined) {
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRx.test(String(body.email).trim())) {
      errors.push({ field: 'email', message: 'Please provide a valid email address.' });
    }
  }

  /* year enum */
  if (body.year !== undefined && !VALID_YEARS.includes(body.year)) {
    errors.push({
      field: 'year',
      message: `"year" must be one of: ${VALID_YEARS.join(', ')}.`,
    });
  }

  /* careerGoal enum */
  if (body.careerGoal !== undefined && !VALID_GOALS.includes(body.careerGoal)) {
    errors.push({
      field: 'careerGoal',
      message: `"careerGoal" must be one of: ${VALID_GOALS.join(', ')}.`,
    });
  }

  /* learningHours range */
  if (body.learningHours !== undefined) {
    const h = Number(body.learningHours);
    if (isNaN(h) || h < 1 || h > 8) {
      errors.push({
        field: 'learningHours',
        message: '"learningHours" must be a number between 1 and 8.',
      });
    }
  }

  return errors;
}

/** Used on POST /api/profiles  */
function validateCreate(req, res, next) {
  const errors = runChecks(req.body, true);
  if (errors.length) return res.status(400).json({ success: false, errors });
  next();
}

/** Used on PUT /api/profiles/:id  */
function validateUpdate(req, res, next) {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({
      success: false,
      errors: [{ field: 'body', message: 'Request body must not be empty.' }],
    });
  }
  const errors = runChecks(req.body, false);
  if (errors.length) return res.status(400).json({ success: false, errors });
  next();
}

module.exports = { validateCreate, validateUpdate };
