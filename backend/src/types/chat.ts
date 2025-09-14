export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  hasImages?: boolean;
  images?: string[];
}

export interface ChatRequest {
  message: string;
  conversationId?: string;
  images?: string[];
}

export interface ChatResponse {
  id: string;
  content: string;
  role: 'assistant';
  timestamp: Date;
  conversationId: string;
  hasImages?: boolean;
  images?: string[];
}

export interface Conversation {
  id: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}
