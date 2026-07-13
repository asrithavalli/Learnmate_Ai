'use strict';

const express             = require('express');
const router              = express.Router();
const multer              = require('multer');
const path                = require('path');
const fs                  = require('fs');
const roadmapController   = require('../controllers/roadmapController');
const validateRoadmapInput = require('../middleware/validateRoadmapInput');

// Ensure uploads folder exists in backend root
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

// Configure file filter
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed!'), false);
    }
  }
});

/**
 * POST /api/generate-roadmap
 * Body: { name, email, college, branch, year, skills, careerGoal, learningHours }
 * File: resume (optional)
 * Returns a personalised roadmap JSON object.
 */
router.post(
  '/',
  upload.single('resume'),
  validateRoadmapInput,
  roadmapController.generateRoadmap
);

module.exports = router;
