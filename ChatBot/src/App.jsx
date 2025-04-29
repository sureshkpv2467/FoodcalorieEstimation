import { useState } from 'react'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';  
import './App.css'
import Chatbot from 'react-chatbot-kit'
import 'react-chatbot-kit/build/main.css'
import config from './Components/chatBotComp/config.jsx'
import ActionProvider from './Components/chatBotComp/ActionProvider'
import MessageParser from './Components/chatBotComp/MessageParser'
import LoginSignUp from './Components/SignUpPage/LoginSignUp'
import Navbar from './Components/Navbar/Navbar';
import Footer from './Components/Footer/Footer';
import Contact from './Components/Contact/Contact';
import Review from './Components/Review/Review'
import Home from './Components/Home/Home'
import Dashboard from './Pages/Dashboard/Dashboard';
import Food from './Pages/Food/Food';

function App() {
  const [showChatbot, setShowChatbot] = useState(false);

  const isAuthenticated = () => {
    return localStorage.getItem('token') !== null;
  };

  const ProtectedRoute = ({ children }) => {
    return isAuthenticated() ? children : <Navigate to="/signup" />;
  };

  return (
    <Router>
      <div className="app">
        <Navbar />
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<LoginSignUp />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/review" element={<Review />} />
          <Route path="/food" element={<Food />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>

        {/* Chatbot Toggle Button */}
        {!showChatbot && (
          <button 
            className="chatbot-toggle-button"
            onClick={() => setShowChatbot(true)}
          >
            💬
          </button>
        )}

        {/* Chatbot */}
        {showChatbot && (
          <div className="chatbot-container">
            <button 
              className="chatbot-close-button"
              onClick={() => setShowChatbot(false)}
            >
              ×
            </button>
            <Chatbot 
              config={config} 
              messageParser={MessageParser} 
              actionProvider={ActionProvider} 
            />
          </div>
        )}

        <Footer />
      </div>
    </Router>
  );
}

export default App;
