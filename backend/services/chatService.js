'use strict';

const { WatsonXAI } = require('@ibm-cloud/watsonx-ai');

let _client = null;

function getClient() {
  if (_client) return _client;
  const apiKey     = process.env.WATSONX_API_KEY;
  const serviceUrl = process.env.WATSONX_URL || 'https://us-south.ml.cloud.ibm.com';

  if (!apiKey || apiKey === 'your_ibm_cloud_api_key_here') {
    return null;
  }

  _client = WatsonXAI.newInstance({
    version: '2024-05-31',
    serviceUrl,
  });

  return _client;
}

function buildSystemPrompt() {
  return `You are "LearnMate AI Tutor", a helpful, professional, and friendly learning pathway tutor. 
Your goal is to guide students on their learning journeys, answer technical questions, explain software engineering topics, suggest resources, recommend skills, and help them prepare for their careers.
Keep your answers clear, concise (around 2-4 sentences where possible), and encouraging. Use bullet points or code snippets when helpful.`;
}

function getRuleResponse(message) {
  const msg = message.toLowerCase();
  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
    return "Hello! I'm your LearnMate AI Tutor. How can I assist you on your learning journey today? Ask me about roadmaps, quizzes, career advice, or specific technologies!";
  }
  if (msg.includes('roadmap') || msg.includes('path') || msg.includes('learn')) {
    return "A roadmap is a structured 4-week timeline designed around your goal and daily hours. You can customize it by updating your profile. Try checking out the 'Roadmap' page to see your current learning path!";
  }
  if (msg.includes('quiz') || msg.includes('test') || msg.includes('question')) {
    return "Quizzes help you test your understanding of your career goal and skill gaps. Head to the 'Quiz' page to take a five-question interactive test. I can also help you review key concepts here!";
  }
  if (msg.includes('react') || msg.includes('frontend') || msg.includes('javascript') || msg.includes('js') || msg.includes('html') || msg.includes('css')) {
    return "Frontend developers build user-facing web applications. Key technologies to study include HTML, CSS, JavaScript (ES6+), React.js, and build tools like Vite. Would you like a suggested project idea for frontend?";
  }
  if (msg.includes('backend') || msg.includes('node') || msg.includes('database') || msg.includes('sql') || msg.includes('mongo') || msg.includes('api')) {
    return "Backend development handles data models, server logic, and APIs. To start, focus on Node.js/Express, RESTful API design, database schemas (MongoDB, PostgreSQL), and user authentication (JWT).";
  }
  if (msg.includes('project') || msg.includes('portfolio') || msg.includes('build')) {
    return "Building projects is the best way to escape tutorial hell! A great beginner project is a To-Do List or Weather App. An intermediate project is a Blog App with user registration. What stack are you using?";
  }
  if (msg.includes('career') || msg.includes('job') || msg.includes('resume') || msg.includes('interview')) {
    return "To land a job, build a strong personal portfolio, upload a clean resume for feedback, and practice technical interview questions. Feel free to upload your resume in the Profile page for a detailed score!";
  }
  if (msg.includes('help') || msg.includes('tutor')) {
    return "I can explain programming concepts, suggest study topics, review code logic, and guide you through your learning plan. Just type what you're studying right now!";
  }
  return "That's an interesting question! As your LearnMate AI Tutor, I suggest studying it step-by-step. Focus on core concepts, write simple code snippets to test it out, and then apply it in a project. Let me know if you want me to explain any specific term!";
}

/**
 * Generates response from the AI tutor bot.
 * 
 * @param {string} message 
 * @returns {Promise<string>}
 */
async function getChatbotResponse(message) {
  const client = getClient();
  const projectId = process.env.WATSONX_PROJECT_ID;

  if (client && projectId && projectId !== 'your_watsonx_project_id_here') {
    try {
      const response = await client.generateText({
        modelId: 'ibm/granite-3-8b-instruct',
        projectId,
        input: `${buildSystemPrompt()}\n\nUser: ${message}\nAssistant:`,
        parameters: {
          decoding_method: 'greedy',
          max_new_tokens: 300,
          min_new_tokens: 10,
          repetition_penalty: 1.05,
        },
      });

      const reply = response?.result?.results?.[0]?.generated_text;
      if (reply && reply.trim()) {
        return reply.trim();
      }
    } catch (err) {
      console.warn('[Chat] WatsonX call failed, using static tutor rules:', err.message);
    }
  }

  // Fallback to static rule database responses
  return getRuleResponse(message);
}

module.exports = { getChatbotResponse };
