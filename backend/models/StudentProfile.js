'use strict';

const mongoose = require('mongoose');

/* ── Valid options ──────────────────────────────────────────── */
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

/* ── Schema ─────────────────────────────────────────────────── */
const studentProfileSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: [true, 'Name is required.'],
      trim:     true,
      minlength: [2,   'Name must be at least 2 characters.'],
      maxlength: [100, 'Name cannot exceed 100 characters.'],
    },

    email: {
      type:     String,
      required: [true, 'Email is required.'],
      unique:   true,
      trim:     true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address.',
      ],
    },

    college: {
      type:     String,
      required: [true, 'College / University is required.'],
      trim:     true,
      maxlength: [150, 'College name cannot exceed 150 characters.'],
    },

    branch: {
      type:     String,
      required: [true, 'Branch / Major is required.'],
      trim:     true,
      maxlength: [100, 'Branch cannot exceed 100 characters.'],
    },

    year: {
      type:     String,
      required: [true, 'Current year is required.'],
      enum: {
        values:  VALID_YEARS,
        message: `Year must be one of: ${VALID_YEARS.join(', ')}.`,
      },
    },

    skills: {
      type:    [String],   // stored as an array; API accepts comma-string → split in service
      default: [],
    },

    careerGoal: {
      type:     String,
      required: [true, 'Career goal is required.'],
      enum: {
        values:  VALID_GOALS,
        message: `Career goal must be one of: ${VALID_GOALS.join(', ')}.`,
      },
    },

    learningHours: {
      type:     Number,
      required: [true, 'Daily learning hours is required.'],
      min: [1, 'Learning hours must be at least 1.'],
      max: [8, 'Learning hours cannot exceed 8.'],
    },
    resume: {
  fileName: {
    type: String,
    default: ""
  },
  fileType: {
    type: String,
    default: ""
  },
  filePath: {
    type: String,
    default: ""
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
    },
    roadmap: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    createdAt: {
      type:    Date,
      default: Date.now,
      immutable: true,   // prevent updates to createdAt
    },
  },
  {
    versionKey: false,    // remove __v field
    toJSON:  { virtuals: true },
    toObject:{ virtuals: true },
  }
);

/* ── Indexes ────────────────────────────────────────────────── */
// email index is already created by `unique: true` in the field definition,
// so we only add the extra compound/sort indexes here.
studentProfileSchema.index({ careerGoal: 1 });
studentProfileSchema.index({ createdAt: -1 });

/* ── Virtual: skillCount ─────────────────────────────────────── */
studentProfileSchema.virtual('skillCount').get(function () {
  return this.skills.length;
});

const StudentProfile = mongoose.model('StudentProfile', studentProfileSchema);

module.exports = StudentProfile;
