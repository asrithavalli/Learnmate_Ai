'use strict';

const roadmapService = require('../services/roadmapService');
const StudentProfile = require('../models/StudentProfile');
const { extractTextFromFile } = require('../services/resumeParser');

/**
 * POST /api/generate-roadmap
 * Body contains profile details, and file contains optional resume.
 */
async function generateRoadmap(req, res, next) {
  try {
    const { name, email, college, branch, year, careerGoal, learningHours, skills } = req.body;

    if (!email || !college || !branch || !year) {
      return res.status(400).json({
        success: false,
        message: 'email, college, branch, and year are required.'
      });
    }

    let resumeText = '';
    let resumeData = undefined;

    if (req.file) {
      resumeText = await extractTextFromFile(req.file.path, req.file.mimetype);
      resumeData = {
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        filePath: req.file.path,
        uploadedAt: new Date()
      };
    } else {
      // Check if they had a previously uploaded resume
      const existingProfile = await StudentProfile.findOne({ email: email.toLowerCase().trim() });
      if (existingProfile && existingProfile.resume && existingProfile.resume.filePath) {
        try {
          resumeText = await extractTextFromFile(
            existingProfile.resume.filePath,
            existingProfile.resume.fileType
          );
        } catch (err) {
          console.warn('[Resume] Failed to extract text from existing file:', err.message);
        }
      }
    }

    // Build/generate the roadmap (with optional resume text analysis)
    const roadmap = await roadmapService.buildRoadmap({
      name,
      skills,
      careerGoal,
      learningHours,
      resumeText
    });

    // Parse skills to an array
    const parsedSkills = typeof skills === 'string'
      ? skills.split(',').map(s => s.trim()).filter(Boolean)
      : Array.isArray(skills) ? skills : [];

    // Save/Update Student Profile in MongoDB
    const profileUpdate = {
      name,
      college,
      branch,
      year,
      careerGoal,
      learningHours: Number(learningHours),
      skills: parsedSkills,
      roadmap
    };

    if (resumeData) {
      profileUpdate.resume = resumeData;
    }

    const profile = await StudentProfile.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      { $set: profileUpdate },
      { new: true, upsert: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      data: roadmap,
      profile: profile
    });
  } catch (err) {
    next(err); // passed to global error handler
  }
}

module.exports = { generateRoadmap };
