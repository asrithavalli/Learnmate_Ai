import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProfileProvider } from './context/ProfileContext';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import HomePage      from './pages/HomePage';
import ProfilePage   from './pages/ProfilePage';
import RoadmapPage   from './pages/RoadmapPage';
import DashboardPage from './pages/DashboardPage';
import QuizPage      from './pages/QuizPage';
import Chatbot from './components/Chatbot/Chatbot';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <ProfileProvider>
        <div className="app">
          <Navbar />
          <main className="app__main">
            <Routes>
              <Route path="/"          element={<HomePage />}      />
              <Route path="/profile"   element={<ProfilePage />}   />
              <Route path="/roadmap"   element={<RoadmapPage />}   />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/quiz"      element={<QuizPage />}      />
              {/* Catch-all: redirect unknown paths to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Chatbot />
          <Footer />
        </div>
      </ProfileProvider>
    </BrowserRouter>
  );
}

export default App;
