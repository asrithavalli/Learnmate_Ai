'use strict';

const profileService = require('../services/profileService');

/* ────────────────────────────────────────────────────────────
   POST /api/profiles
   Create a new student profile.
──────────────────────────────────────────────────────────── */
async function createProfile(req, res, next) {
  try {
    const profile = await profileService.createProfile(req.body);
    return res.status(201).json({ success: true, data: profile });
  } catch (err) {
    /* Mongoose duplicate-key error (email unique) */
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'A profile with this email already exists.',
      });
    }
    next(err);
  }
}

/* ────────────────────────────────────────────────────────────
   GET /api/profiles
   List all profiles.
   Query params: ?careerGoal=  ?page=  ?limit=
──────────────────────────────────────────────────────────── */
async function getAllProfiles(req, res, next) {
  try {
    const { careerGoal, email, page = 1, limit = 50 } = req.query;
    const result = await profileService.getAllProfiles({ careerGoal, email, page, limit });
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

/* ────────────────────────────────────────────────────────────
   GET /api/profiles/:id
   Get a single profile by ID.
──────────────────────────────────────────────────────────── */
async function getProfileById(req, res, next) {
  try {
    const profile = await profileService.getProfileById(req.params.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }
    return res.status(200).json({ success: true, data: profile });
  } catch (err) {
    /* Invalid ObjectId format */
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid profile ID format.' });
    }
    next(err);
  }
}

/* ────────────────────────────────────────────────────────────
   PUT /api/profiles/:id
   Update one or more fields of an existing profile.
──────────────────────────────────────────────────────────── */
async function updateProfile(req, res, next) {
  try {
    const profile = await profileService.updateProfile(req.params.id, req.body);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }
    return res.status(200).json({ success: true, data: profile });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid profile ID format.' });
    }
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'A profile with this email already exists.',
      });
    }
    next(err);
  }
}

/* ────────────────────────────────────────────────────────────
   DELETE /api/profiles/:id
   Remove a profile permanently.
──────────────────────────────────────────────────────────── */
async function deleteProfile(req, res, next) {
  try {
    const profile = await profileService.deleteProfile(req.params.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }
    return res.status(200).json({
      success: true,
      message: `Profile for "${profile.name}" deleted successfully.`,
    });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid profile ID format.' });
    }
    next(err);
  }
}

module.exports = {
  createProfile,
  getAllProfiles,
  getProfileById,
  updateProfile,
  deleteProfile,
};
