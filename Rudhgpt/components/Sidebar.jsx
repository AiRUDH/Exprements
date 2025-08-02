import React from 'react';
import ThemeToggle from './ThemeToggle';

const Sidebar = ({ isOpen, onClose, isDarkMode, toggleTheme, promptApiKey }) => {
  // Dummy conversation history
  const conversations = [
    { id: 1, title: 'React Development Tips', timestamp: '2 hours ago' },
    { id: 2, title: 'JavaScript Best Practices', timestamp: '1 day ago' },
    { id: 3, title: 'CSS Grid Layout', timestamp: '3 days ago' },
    { id: 4, title: 'API Integration Guide', timestamp: '1 week ago' },
  ];

  return (
    <>
      <div className={`fixed lg:relative inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Conversations
              </h2>
              <button
                onClick={onClose}
                className="lg:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Close sidebar"
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* API Key Button */}
          <div className="px-4 pb-2">
            <button
              onClick={promptApiKey}
              className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.104 0 2-.896 2-2s-.896-2-2-2-2 .896-2 2 .896 2 2 2zm0 0v3m-4 4h8" />
              </svg>
              <span>Set API Key</span>
            </button>
          </div>

          {/* New Chat Button */}
          <div className="p-4">
            <button className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>New Chat</span>
            </button>
          </div>

          {/* Conversation History */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                className="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                  {conversation.title}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {conversation.timestamp}
                </div>
              </button>
            ))}
          </div>

          {/* Theme Toggle */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
