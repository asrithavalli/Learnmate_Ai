'use strict';

const StudentProfile = require('../models/StudentProfile');

/* ── helpers ────────────────────────────────────────────────── */

/** Parses a comma-separated string or passthrough array into a trimmed string[]. */
function parseSkills(raw) {
  if (Array.isArray(raw)) return raw.map((s) => s.trim()).filter(Boolean);
  if (typeof raw === 'string') return raw.split(',').map((s) => s.trim()).filter(Boolean);
  return [];
}

/* ── CRUD operations ────────────────────────────────────────── */

/**
 * Create a new student profile.
 * @throws Mongoose ValidationError if schema rules are violated.
 */
async function createProfile(data) {
  const doc = new StudentProfile({
    name:          data.name,
    email:         data.email,
    college:       data.college,
    branch:        data.branch,
    year:          data.year,
    skills:        parseSkills(data.skills),
    careerGoal:    data.careerGoal,
    learningHours: Number(data.learningHours),
  });
  return doc.save();
}

/**
 * Return all profiles, newest first.
 * Supports optional ?careerGoal= filter and ?limit= pagination.
 */
async function getAllProfiles({ careerGoal, email, limit = 50, page = 1 } = {}) {
  const filter = {};
  if (careerGoal) filter.careerGoal = careerGoal;
  if (email) filter.email = email;

  const skip = (Number(page) - 1) * Number(limit);
  const [profiles, total] = await Promise.all([
    StudentProfile.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    StudentProfile.countDocuments(filter),
  ]);

  return { profiles, total, page: Number(page), limit: Number(limit) };
}

/**
 * Return a single profile by Mongo _id.
 * Returns null when not found — controller handles 404.
 */
async function getProfileById(id) {
  return StudentProfile.findById(id);
}

/**
 * Update an existing profile by _id.
 * Only the fields passed in `updates` are changed.
 * Returns the updated document (or null if not found).
 */
async function updateProfile(id, updates) {
  // Prevent overwriting createdAt
  delete updates.createdAt;

  // Re-parse skills if provided
  if (updates.skills !== undefined) {
    updates.skills = parseSkills(updates.skills);
  }
  if (updates.learningHours !== undefined) {
    updates.learningHours = Number(updates.learningHours);
  }

  return StudentProfile.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true, runValidators: true }
  );
}

/**
 * Delete a profile by _id.
 * Returns the deleted document (or null if not found).
 */
async function deleteProfile(id) {
  return StudentProfile.findByIdAndDelete(id);
}

module.exports = {
  createProfile,
  getAllProfiles,
  getProfileById,
  updateProfile,
  deleteProfile,
};
