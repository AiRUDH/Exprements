import React, { useEffect, useRef } from 'react';
import Message from './Message';
import InputBox from './InputBox';
import Loader from './Loader';

const ChatWindow = ({ messages, isLoading, onSendMessage }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className="flex-1 flex flex-col">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((message) => (
          <Message
            key={message.id}
            message={message}
          />
        ))}
        {isLoading && <Loader />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <InputBox 
        onSendMessage={onSendMessage}
        disabled={isLoading}
      />
    </div>
  );
};

export default ChatWindow;
