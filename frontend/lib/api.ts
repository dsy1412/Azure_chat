import axios from 'axios';
import { ChatRequest, ChatResponse, Conversation } from '@/types/chat';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const chatAPI = {
  sendMessage: async (request: ChatRequest): Promise<ChatResponse> => {
    const response = await api.post('/api/chat/message', request);
    return {
      ...response.data,
      timestamp: new Date(response.data.timestamp)
    };
  },

  getConversation: async (id: string): Promise<Conversation> => {
    const response = await api.get(`/api/chat/conversation/${id}`);
    return {
      ...response.data,
      createdAt: new Date(response.data.createdAt),
      updatedAt: new Date(response.data.updatedAt),
      messages: response.data.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }))
    };
  },

  getConversations: async (): Promise<any[]> => {
    const response = await api.get('/api/chat/conversations');
    return response.data.map((conv: any) => ({
      ...conv,
      createdAt: new Date(conv.createdAt),
      updatedAt: new Date(conv.updatedAt)
    }));
  },

  deleteConversation: async (id: string): Promise<void> => {
    await api.delete(`/api/chat/conversation/${id}`);
  }
};

export default api;
