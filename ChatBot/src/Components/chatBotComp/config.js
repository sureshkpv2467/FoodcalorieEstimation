import { createChatBotMessage } from 'react-chatbot-kit';
const botName = 'NutriBot';

const config = {
    initialMessages: [createChatBotMessage(`Hi! I'm ${botName}`)],
    botName: botName,
    customStyles: {
      botMessageBox: {
        backgroundColor: '#376B7E',
      },
      chatButton: {
        backgroundColor: '#5ccc9d',
      },
    },
};

export default config;