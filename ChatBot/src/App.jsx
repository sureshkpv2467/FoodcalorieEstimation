import { useState } from 'react'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';  
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Chatbot from 'react-chatbot-kit'
import 'react-chatbot-kit/build/main.css'
import config from './Components/chatBotComp/config'
import ActionProvider from './Components/chatBotComp/ActionProvider'
import MessageParser from './Components/chatBotComp/MessageParser'
import LoginSignUp from './Components/SignUpPage/LoginSignUp'

function App() {
  const [showChatbot, setShowChatbot] = useState(false);

  const isAuthenticated = () => {
    return localStorage.getItem('token') !== null;
  };
  const ProtectedRoute = ({ children }) => {
    return isAuthenticated() ? children : <Navigate to="/" />;
  };
  return (
    <div>
      {/* Chatbot Toggle Button
      <div className="chatbot-container">
        {!showChatbot && <div className="chat-cloud">Ask me anything</div>}
        <button className="chat-button" onClick={() => setShowChatbot(!showChatbot)}>
          💬
        </button>
      </div> */}

      {/* Chatbot */}
      {/* {showChatbot && (
        <div className="chatbot-box">
          <Chatbot config={config} messageParser={MessageParser} actionProvider={ActionProvider} />
        </div>
      )} */}
      <Router>
      <Routes>
        {/* Login Route */}
        <Route path="/" element={<LoginSignUp />} />
        
        {/* Landing Page - Protected Route */}
        <Route 
          path="/landing" 
          element={
            <ProtectedRoute>
               <div>
                  {/* Chatbot Toggle Button */}
                  <div className="chatbot-container">
                    {!showChatbot && <div className="chat-cloud">Ask me anything</div>}
                    <button className="chat-button" onClick={() => setShowChatbot(!showChatbot)}>
                      💬
                    </button>
                  </div>

                  {/* Chatbot */}
                  {showChatbot && (
                    <div className="chatbot-box">
                      <Chatbot config={config} messageParser={MessageParser} actionProvider={ActionProvider} />
                    </div>
                  )}
                </div>
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
    </div>
    
  )
}

export default App
