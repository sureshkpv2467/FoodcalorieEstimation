import React from 'react';
import { createChatBotMessage } from 'react-chatbot-kit';
const botName = 'NutriBot';

const config = {
    initialMessages: [createChatBotMessage(`Hi! I'm ${botName}. How can I help you today?`)],
    botName: botName,
    customStyles: {
      botMessageBox: {
        backgroundColor: '#4299e1',
      },
      chatButton: {
        backgroundColor: '#4299e1',
      },
      chatInput: {
        border: '1px solid #e2e8f0',
        borderRadius: '0.375rem',
      },
      chatInputContainer: {
        backgroundColor: 'white',
      },
      chatMessageContainer: {
        backgroundColor: '#f7fafc',
      },
    },
    customComponents: {
      header: () => (
        <div style={{ 
          backgroundColor: '#4299e1', 
          color: 'white', 
          padding: '1rem',
          borderRadius: '0.5rem 0.5rem 0 0',
          textAlign: 'center',
          fontWeight: 'bold'
        }}>
          {botName}
        </div>
      ),
    },
};

export default config;