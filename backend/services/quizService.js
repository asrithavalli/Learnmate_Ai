'use strict';

/* ── quizService.js ────────────────────────────────────────────
   Generates 5 MCQs from a roadmap using IBM Granite.
   Falls back to static per-goal questions if Granite is
   unavailable or returns malformed output.

   Each question shape:
   {
     id:       number,
     question: string,
     options:  string[4],   // A B C D
     answer:   string       // must exactly match one of options[]
   }
─────────────────────────────────────────────────────────────── */

const { WatsonXAI } = require('@ibm-cloud/watsonx-ai');

/* ── Singleton client (shared with graniteService) ─────────── */
let _client = null;

function getClient() {
  if (_client) return _client;
  const apiKey     = process.env.WATSONX_API_KEY;
  const serviceUrl = process.env.WATSONX_URL || 'https://us-south.ml.cloud.ibm.com';
  if (!apiKey) throw new Error('WATSONX_API_KEY is not set.');
  _client = WatsonXAI.newInstance({ version: '2024-05-31', serviceUrl });
  return _client;
}

/* ── Prompt ────────────────────────────────────────────────── */
function buildQuizPrompt({ careerGoal, skillGaps, recommendedSkills }) {
  const gapTopics   = (skillGaps        || []).slice(0, 5).map((g) => g.label).join(', ');
  const skillTopics = (recommendedSkills || []).slice(0, 6).map((s) => s.name).join(', ');

  return `You are a technical quiz author. Generate exactly 5 multiple-choice questions to test a student who is studying to become a "${careerGoal}".

The questions must be directly relevant to these skill-gap topics: ${gapTopics || careerGoal}.
Also draw from these recommended skills: ${skillTopics || careerGoal}.

Output ONLY a valid JSON array — no markdown fences, no prose, just the raw JSON array.

Each element must follow this exact shape:
{
  "id": <1-5>,
  "question": "<clear technical question>",
  "options": ["<option A>", "<option B>", "<option C>", "<option D>"],
  "answer": "<the correct option text, exactly matching one entry in options>"
}

Rules:
- Exactly 5 questions.
- Each question has exactly 4 options.
- The answer must be the full text of the correct option (not "A", "B", etc.).
- Vary difficulty: 2 beginner, 2 intermediate, 1 advanced.
- No duplicate questions or trivially obvious answers.
- Output ONLY the JSON array. Nothing else.`;
}

/* ── JSON extractor ────────────────────────────────────────── */
function extractJSONArray(raw) {
  const trimmed = raw.trim();

  // Fast path — entire response is a valid array
  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) return parsed;
  } catch (_) { /* fall through */ }

  // Find the outermost [...] block
  const start = trimmed.indexOf('[');
  const end   = trimmed.lastIndexOf(']');
  if (start !== -1 && end > start) {
    return JSON.parse(trimmed.slice(start, end + 1));
  }

  throw new SyntaxError('No JSON array found in Granite quiz response');
}

/* ── Shape validator ───────────────────────────────────────── */
function validateQuestions(arr) {
  if (!Array.isArray(arr) || arr.length !== 5) {
    throw new Error(`Expected 5 questions, got ${Array.isArray(arr) ? arr.length : 'non-array'}`);
  }
  for (const q of arr) {
    if (
      typeof q.question !== 'string' || !q.question.trim() ||
      !Array.isArray(q.options)      || q.options.length !== 4 ||
      typeof q.answer   !== 'string' || !q.options.includes(q.answer)
    ) {
      throw new Error(`Malformed question: ${JSON.stringify(q)}`);
    }
  }
}

/* ── Static fallback banks (one per career goal) ───────────── */
const STATIC_QUESTIONS = {
  'Frontend Developer': [
    { id: 1, question: 'Which CSS property is used to create a flex container?', options: ['display: flex', 'position: flex', 'flex: container', 'layout: flex'], answer: 'display: flex' },
    { id: 2, question: 'In React, what hook lets you run side effects after render?', options: ['useState', 'useEffect', 'useContext', 'useReducer'], answer: 'useEffect' },
    { id: 3, question: 'What does the "V" in MVC stand for?', options: ['Variable', 'View', 'Version', 'Validate'], answer: 'View' },
    { id: 4, question: 'Which of the following is NOT a valid HTTP method?', options: ['GET', 'POST', 'SEND', 'DELETE'], answer: 'SEND' },
    { id: 5, question: 'What does CSS specificity determine?', options: ['The speed of rendering', 'Which CSS rule is applied when multiple rules match', 'The order files are loaded', 'Browser compatibility'], answer: 'Which CSS rule is applied when multiple rules match' },
  ],
  'Backend Developer': [
    { id: 1, question: 'Which HTTP status code indicates a resource was successfully created?', options: ['200 OK', '201 Created', '204 No Content', '301 Moved Permanently'], answer: '201 Created' },
    { id: 2, question: 'What is the purpose of an index in a database?', options: ['To enforce foreign key constraints', 'To speed up data retrieval queries', 'To store binary data', 'To encrypt column values'], answer: 'To speed up data retrieval queries' },
    { id: 3, question: 'In Node.js, which module provides file system operations?', options: ['http', 'path', 'fs', 'os'], answer: 'fs' },
    { id: 4, question: 'What does JWT stand for?', options: ['Java Web Token', 'JSON Web Token', 'JavaScript Web Transfer', 'JSON Wide Token'], answer: 'JSON Web Token' },
    { id: 5, question: 'Which SQL clause is used to filter grouped results?', options: ['WHERE', 'HAVING', 'FILTER', 'GROUP BY'], answer: 'HAVING' },
  ],
  'Full-Stack Developer': [
    { id: 1, question: 'What is the main purpose of a REST API?', options: ['Render HTML on the server', 'Enable communication between client and server over HTTP', 'Minify JavaScript files', 'Manage CSS stylesheets'], answer: 'Enable communication between client and server over HTTP' },
    { id: 2, question: 'In React, what does lifting state up mean?', options: ['Moving state to Redux', 'Moving state to a common ancestor component', 'Moving state to localStorage', 'Moving state to a context provider'], answer: 'Moving state to a common ancestor component' },
    { id: 3, question: 'Which NoSQL database stores data as JSON-like documents?', options: ['Redis', 'Cassandra', 'MongoDB', 'Neo4j'], answer: 'MongoDB' },
    { id: 4, question: 'What does CORS stand for?', options: ['Cross-Origin Resource Sharing', 'Client-Origin Request System', 'Cross-Object Rendering Service', 'Content-Origin Resource Server'], answer: 'Cross-Origin Resource Sharing' },
    { id: 5, question: 'Which tool is used to containerise applications for consistent deployment?', options: ['Webpack', 'Babel', 'Docker', 'ESLint'], answer: 'Docker' },
  ],
  'AI Engineer': [
    { id: 1, question: 'Which Python library is primarily used for numerical computation?', options: ['Pandas', 'NumPy', 'Matplotlib', 'Seaborn'], answer: 'NumPy' },
    { id: 2, question: 'What is overfitting in machine learning?', options: ['A model that performs poorly on training data', 'A model that memorises training data and fails to generalise', 'A model with too few parameters', 'A model trained on normalised data'], answer: 'A model that memorises training data and fails to generalise' },
    { id: 3, question: 'Which activation function is commonly used in the output layer for binary classification?', options: ['ReLU', 'Tanh', 'Sigmoid', 'Softmax'], answer: 'Sigmoid' },
    { id: 4, question: 'What does "epoch" mean in neural network training?', options: ['A single weight update', 'One full pass through the training dataset', 'The learning rate schedule', 'The number of hidden layers'], answer: 'One full pass through the training dataset' },
    { id: 5, question: 'Which framework is developed by Google for deep learning?', options: ['PyTorch', 'Scikit-learn', 'TensorFlow', 'Keras'], answer: 'TensorFlow' },
  ],
  'Data Scientist': [
    { id: 1, question: 'What does the pandas `groupby()` method do?', options: ['Sorts a DataFrame', 'Splits data into groups for aggregation', 'Merges two DataFrames', 'Filters rows by condition'], answer: 'Splits data into groups for aggregation' },
    { id: 2, question: 'Which metric measures the proportion of actual positives correctly identified?', options: ['Precision', 'Recall', 'F1 Score', 'Accuracy'], answer: 'Recall' },
    { id: 3, question: 'What is a p-value in hypothesis testing?', options: ['The probability the null hypothesis is true', 'The probability of observing the data if the null hypothesis is true', 'The effect size of the test', 'The confidence interval width'], answer: 'The probability of observing the data if the null hypothesis is true' },
    { id: 4, question: 'Which SQL function returns the number of rows in a group?', options: ['SUM()', 'AVG()', 'COUNT()', 'MAX()'], answer: 'COUNT()' },
    { id: 5, question: 'What is the purpose of feature scaling in machine learning?', options: ['To remove duplicate features', 'To normalise feature ranges so algorithms converge faster', 'To encode categorical variables', 'To split data into train and test sets'], answer: 'To normalise feature ranges so algorithms converge faster' },
  ],
  'Machine Learning Engineer': [
    { id: 1, question: 'What is the bias-variance trade-off?', options: ['Balancing model complexity to minimise both underfitting and overfitting', 'Choosing between gradient descent methods', 'The trade-off between precision and recall', 'Balancing training speed and accuracy'], answer: 'Balancing model complexity to minimise both underfitting and overfitting' },
    { id: 2, question: 'Which technique randomly drops neurons during training to prevent overfitting?', options: ['Batch Normalisation', 'Dropout', 'L2 Regularisation', 'Weight Decay'], answer: 'Dropout' },
    { id: 3, question: 'What does MLflow primarily help with?', options: ['Data preprocessing pipelines', 'Tracking ML experiments, parameters, and metrics', 'Deploying Docker containers', 'Feature engineering'], answer: 'Tracking ML experiments, parameters, and metrics' },
    { id: 4, question: 'In Scikit-learn, which method trains a model on data?', options: ['.predict()', '.transform()', '.fit()', '.score()'], answer: '.fit()' },
    { id: 5, question: 'What is the main advantage of ensemble methods like Random Forest?', options: ['Faster training speed', 'Reduced memory usage', 'Improved accuracy by combining multiple models', 'Simpler model interpretation'], answer: 'Improved accuracy by combining multiple models' },
  ],
  'DevOps Engineer': [
    { id: 1, question: 'What does CI/CD stand for?', options: ['Code Integration / Code Delivery', 'Continuous Integration / Continuous Delivery', 'Container Infrastructure / Container Deployment', 'Cloud Integration / Cloud Deployment'], answer: 'Continuous Integration / Continuous Delivery' },
    { id: 2, question: 'Which command starts a Docker container from an image?', options: ['docker build', 'docker pull', 'docker run', 'docker push'], answer: 'docker run' },
    { id: 3, question: 'What is Infrastructure as Code (IaC)?', options: ['Writing scripts to monitor servers', 'Managing infrastructure through machine-readable config files', 'Hosting code on cloud servers', 'Automating code reviews'], answer: 'Managing infrastructure through machine-readable config files' },
    { id: 4, question: 'In Kubernetes, what is a Pod?', options: ['A cluster of nodes', 'The smallest deployable unit containing one or more containers', 'A load balancer', 'A persistent storage volume'], answer: 'The smallest deployable unit containing one or more containers' },
    { id: 5, question: 'Which Terraform command applies the planned infrastructure changes?', options: ['terraform plan', 'terraform init', 'terraform apply', 'terraform validate'], answer: 'terraform apply' },
  ],
  'Cybersecurity Analyst': [
    { id: 1, question: 'What does SQL injection exploit?', options: ['Weak passwords', 'Unsanitised user input in database queries', 'Open network ports', 'Expired SSL certificates'], answer: 'Unsanitised user input in database queries' },
    { id: 2, question: 'What is the purpose of a firewall?', options: ['To encrypt data at rest', 'To monitor and control incoming and outgoing network traffic', 'To scan files for malware', 'To manage user authentication'], answer: 'To monitor and control incoming and outgoing network traffic' },
    { id: 3, question: 'What does "least privilege" mean in security?', options: ['Using the weakest encryption available', 'Granting users only the permissions they need', 'Minimising the number of users', 'Restricting internet access company-wide'], answer: 'Granting users only the permissions they need' },
    { id: 4, question: 'What type of attack floods a server with traffic to make it unavailable?', options: ['Phishing', 'Man-in-the-Middle', 'Distributed Denial of Service (DDoS)', 'Cross-Site Scripting (XSS)'], answer: 'Distributed Denial of Service (DDoS)' },
    { id: 5, question: 'Which protocol provides secure, encrypted remote access to servers?', options: ['FTP', 'Telnet', 'SSH', 'SMTP'], answer: 'SSH' },
  ],
  'Mobile App Developer': [
    { id: 1, question: 'In React Native, which component is used to display text?', options: ['<p>', '<Label>', '<Text>', '<span>'], answer: '<Text>' },
    { id: 2, question: 'What is the purpose of AsyncStorage in React Native?', options: ['To manage global state', 'To persist small amounts of data locally on the device', 'To handle HTTP requests', 'To render native UI components'], answer: 'To persist small amounts of data locally on the device' },
    { id: 3, question: 'Which lifecycle hook in Flutter is called once when the widget is inserted into the tree?', options: ['didUpdateWidget', 'initState', 'dispose', 'setState'], answer: 'initState' },
    { id: 4, question: 'What is the main purpose of a state management library like Redux?', options: ['To style UI components', 'To centralise and manage application state predictably', 'To handle network requests', 'To animate UI transitions'], answer: 'To centralise and manage application state predictably' },
    { id: 5, question: 'What is the minimum iOS version requirement step before App Store submission?', options: ['Testing on a real device', 'Writing a privacy policy', 'Creating an App Store Connect record', 'All of the above'], answer: 'All of the above' },
  ],
  'Cloud Architect': [
    { id: 1, question: 'What is the main benefit of serverless computing?', options: ['Lower latency than VMs', 'No need to manage server infrastructure; pay only for execution time', 'Unlimited storage capacity', 'Built-in machine learning capabilities'], answer: 'No need to manage server infrastructure; pay only for execution time' },
    { id: 2, question: 'What does AWS S3 primarily provide?', options: ['Compute instances', 'Managed databases', 'Object storage', 'Content delivery'], answer: 'Object storage' },
    { id: 3, question: 'In cloud architecture, what is a VPC?', options: ['A type of serverless function', 'A Virtual Private Cloud — an isolated network within a cloud provider', 'A virtual machine template', 'A cloud-based IDE'], answer: 'A Virtual Private Cloud — an isolated network within a cloud provider' },
    { id: 4, question: 'What is the primary purpose of a CDN?', options: ['To store relational data', 'To deliver content from servers closest to users, reducing latency', 'To run containerised workloads', 'To manage IAM policies'], answer: 'To deliver content from servers closest to users, reducing latency' },
    { id: 5, question: 'Which Terraform resource type defines reusable infrastructure components?', options: ['data', 'output', 'module', 'provider'], answer: 'module' },
  ],
};

/* Default fallback for unrecognised goals */
const DEFAULT_QUESTIONS = STATIC_QUESTIONS['Full-Stack Developer'];

/* ── Granite quiz generation ───────────────────────────────── */
async function generateQuizWithGranite({ careerGoal, skillGaps, recommendedSkills }) {
  const client    = getClient();
  const projectId = process.env.WATSONX_PROJECT_ID;
  if (!projectId) throw new Error('WATSONX_PROJECT_ID is not set.');

  const prompt = buildQuizPrompt({ careerGoal, skillGaps, recommendedSkills });

  const response = await client.generateText({
    modelId:   'ibm/granite-3-8b-instruct',
    projectId,
    input:     prompt,
    parameters: {
      decoding_method:    'greedy',
      max_new_tokens:     1500,
      min_new_tokens:     100,
      stop_sequences:     [],
      repetition_penalty: 1.05,
    },
  });

  const raw = response?.result?.results?.[0]?.generated_text;
  if (!raw) throw new Error('Granite returned an empty quiz response.');

  const questions = extractJSONArray(raw);
  // Re-number ids 1-5 in case Granite got them wrong
  questions.forEach((q, i) => { q.id = i + 1; });
  validateQuestions(questions);
  return questions;
}

/* ── Public API ────────────────────────────────────────────── */
async function buildQuiz({ careerGoal, skillGaps, recommendedSkills }) {
  const hasCredentials =
    process.env.WATSONX_API_KEY &&
    process.env.WATSONX_API_KEY !== 'your_ibm_cloud_api_key_here' &&
    process.env.WATSONX_PROJECT_ID &&
    process.env.WATSONX_PROJECT_ID !== 'your_watsonx_project_id_here';

  if (hasCredentials) {
    try {
      console.log('[Quiz] Generating quiz via Granite for:', careerGoal);
      const questions = await generateQuizWithGranite({ careerGoal, skillGaps, recommendedSkills });
      console.log('[Quiz] Granite quiz generated successfully.');
      return { careerGoal, generatedBy: 'granite', questions };
    } catch (err) {
      console.warn('[Quiz] Granite failed — using static fallback.', err.message);
    }
  } else {
    console.log('[Quiz] watsonx credentials not configured — using static fallback.');
  }

  return {
    careerGoal,
    generatedBy: 'static',
    questions: STATIC_QUESTIONS[careerGoal] || DEFAULT_QUESTIONS,
  };
}

module.exports = { buildQuiz };
