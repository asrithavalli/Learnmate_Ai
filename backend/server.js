'use strict';

require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const connectDB      = require('./config/db');
const roadmapRoutes  = require('./routes/roadmapRoutes');
const profileRoutes  = require('./routes/profileRoutes');
const quizRoutes     = require('./routes/quizRoutes');
const chatRoutes     = require('./routes/chatRoutes');
const errorHandler   = require('./middleware/errorHandler');

const app  = express();
const PORT = process.env.PORT || 5000;

/* ── Connect to MongoDB ────────────────────────────────────── */
connectDB();

/* ── Global Middleware ─────────────────────────────────────── */
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

/* ── Health check ──────────────────────────────────────────── */
app.get('/', (_req, res) => {
  res.json({ status: 'ok', message: 'LearnMate AI API is running 🚀' });
});

/* ── API Routes ────────────────────────────────────────────── */
app.use('/api/generate-roadmap', roadmapRoutes);
app.use('/api/profiles',         profileRoutes);
app.use('/api/generate-quiz',    quizRoutes);
app.use('/api/chat',             chatRoutes);

/* ── 404 handler ───────────────────────────────────────────── */
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

/* ── Global error handler ──────────────────────────────────── */
app.use(errorHandler);

/* ── Start ─────────────────────────────────────────────────── */
app.listen(PORT, () => {
  console.log(`\n🚀 LearnMate AI backend  →  http://localhost:${PORT}`);
  console.log(`   POST   http://localhost:${PORT}/api/generate-roadmap`);
  console.log(`   POST   http://localhost:${PORT}/api/generate-quiz`);
  console.log(`   POST   http://localhost:${PORT}/api/profiles`);
  console.log(`   GET    http://localhost:${PORT}/api/profiles`);
  console.log(`   GET    http://localhost:${PORT}/api/profiles/:id`);
  console.log(`   PUT    http://localhost:${PORT}/api/profiles/:id`);
  console.log(`   DELETE http://localhost:${PORT}/api/profiles/:id\n`);

  /* Warn when watsonx credentials are still placeholder values */
  const key = process.env.WATSONX_API_KEY;
  const pid = process.env.WATSONX_PROJECT_ID;
  if (!key || key === 'your_ibm_cloud_api_key_here' ||
      !pid || pid === 'your_watsonx_project_id_here') {
    console.warn('⚠️  [watsonx] Credentials not set — roadmap & quiz will use static fallback data.');
    console.warn('   Set WATSONX_API_KEY and WATSONX_PROJECT_ID in backend/.env to enable IBM Granite.\n');
  } else {
    console.log('✅ [watsonx] IBM Granite credentials detected — AI generation enabled.\n');
  }
});

module.exports = app;
