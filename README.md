# LearnMate AI

An AI-powered personalized learning platform that generates roadmaps, quizzes, and chat assistance based on student profiles.

## Tech Stack

- **Frontend**: React.js
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **AI**: IBM Granite (via Watsonx)

## Project Structure

```
LearnMate AI/
├── backend/        # Express API server
│   ├── config/     # DB connection
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── uploads/    # Resume uploads
└── frontend/       # React app
    └── src/
        ├── api/
        ├── components/
        ├── context/
        └── pages/
```

## Getting Started

### Prerequisites
- Node.js >= 16
- MongoDB

### Backend Setup

```bash
cd backend
npm install
# Create a .env file (see .env.example)
npm start
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

## Environment Variables

Create a `.env` file inside the `backend/` folder:

```
MONGO_URI=<your_mongodb_connection_string>
PORT=5000
WATSONX_API_KEY=<your_watsonx_api_key>
WATSONX_PROJECT_ID=<your_project_id>
```
