'use client';

import { useState, useEffect, useRef } from 'react';
import { ChatMessage, ChatResponse } from '@/types/chat';
import { chatAPI } from '@/lib/api';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { Loader2, MessageSquare } from 'lucide-react';

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string, images?: string[]) => {
    // Add user message immediately
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date(),
      hasImages: images && images.length > 0,
      images
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const response: ChatResponse = await chatAPI.sendMessage({
        message: content,
        conversationId,
        images
      });

      // Add AI response
      const aiMessage: ChatMessage = {
        id: response.id,
        content: response.content,
        role: response.role,
        timestamp: response.timestamp
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Set conversation ID if this is the first message
      if (!conversationId) {
        setConversationId(response.conversationId);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        content: 'Sorry, there was an error sending your message. Please try again.',
        role: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setConversationId(undefined);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">AI Assistant</h1>
            <p className="text-sm text-gray-500">Powered by GPT-4o Mini</p>
          </div>
        </div>
        
        <button
          onClick={handleNewChat}
          className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          New Chat
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <MessageSquare className="w-12 h-12 mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Start New Conversation</h3>
            <p className="text-sm text-center max-w-md">
              Welcome to AI Assistant! Ask me anything or upload images for analysis.
            </p>
          </div>
        ) : (
          <div className="pb-4">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {loading && (
              <div className="flex items-center gap-3 p-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                </div>
                <div className="bg-gray-100 rounded-lg px-4 py-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <MessageInput onSendMessage={handleSendMessage} disabled={loading} />
    </div>
  );
}
