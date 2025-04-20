'use client';

import { useState } from 'react';
import { Send, Users } from 'lucide-react';

interface Message {
  id: number;
  user: string;
  content: string;
  timestamp: string;
}

export default function ChatWidget() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      user: 'User1',
      content: 'Hey everyone! How\'s it going?',
      timestamp: '2:30 PM'
    },
    {
      id: 2,
      user: 'User2',
      content: 'Great! Just won a tournament!',
      timestamp: '2:31 PM'
    }
  ]);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message: Message = {
      id: messages.length + 1,
      user: 'You',
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Live Chat</h2>
          <div className="flex items-center text-gray-400">
            <Users className="w-5 h-5 mr-1" />
            <span>42</span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="flex flex-col">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-[#FF6B00]">{message.user}</span>
              <span className="text-xs text-gray-400">{message.timestamp}</span>
            </div>
            <p className="text-gray-300">{message.content}</p>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-[#1E1E1E] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
          />
          <button
            type="submit"
            className="bg-[#FF6B00] hover:bg-[#FF8533] text-white p-2 rounded-lg"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
} 