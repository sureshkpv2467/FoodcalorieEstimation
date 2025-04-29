import React from 'react';

const ActionProvider = ({ createChatBotMessage, setState, children }) => {
    // const handleHello = () => {
    //     const botMessage = createChatBotMessage('Hello. Nice to meet you.');
    
    //     setState((prev) => ({
    //       ...prev,
    //       messages: [...prev.messages, botMessage],
    //     }));
    //   };

    const handleUserMessage = async(message) =>{
          try{
            const response = await fetch("http://localhost:5174/ask",{
              method: 'POST',
              headers:{
                "Content-Type":"application/json",
              },
              body: JSON.stringify({question: message}),
            });

            const data = await response.json();
            const botMessage = createChatBotMessage(data.response || "Sorry, I couldn't understand that.");

            setState((prev) => ({
              ...prev,
              messages: [...prev.messages, botMessage],
            }));
          } catch (error) {
            console.error("Error fetching response:", error);
            const botMessage = createChatBotMessage("Oops! Something went wrong.");
            setState((prev) => ({
              ...prev,
              messages: [...prev.messages, botMessage],
            }));
          }

    }

  return (
    <div>
      {React.Children.map(children, (child) => {
        return React.cloneElement(child, {
          actions: {
            handleUserMessage
          },
        });
      })}
    </div>
  );
};

export default ActionProvider;