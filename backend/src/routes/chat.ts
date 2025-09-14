import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { openAIService } from '../services/openai';
import { ChatMessage, ChatRequest, ChatResponse, Conversation } from '../types/chat';

const router = express.Router();

// In-memory storage for conversations (in production, use a database)
const conversations: Map<string, Conversation> = new Map();

// Get conversation history
router.get('/conversation/:id', (req, res) => {
  const { id } = req.params;
  const conversation = conversations.get(id);
  
  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found' });
  }
  
  res.json(conversation);
});

// Get all conversations
router.get('/conversations', (req, res) => {
  const conversationList = Array.from(conversations.values()).map(conv => ({
    id: conv.id,
    createdAt: conv.createdAt,
    updatedAt: conv.updatedAt,
    messageCount: conv.messages.length,
    lastMessage: conv.messages[conv.messages.length - 1]?.content.substring(0, 100) + '...'
  }));
  
  res.json(conversationList);
});

// Send message and get AI response
router.post('/message', async (req, res) => {
  try {
    const { message, conversationId, images }: ChatRequest = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get or create conversation
    let conversation: Conversation;
    const convId = conversationId || uuidv4();
    
    if (conversationId && conversations.has(conversationId)) {
      conversation = conversations.get(conversationId)!;
    } else {
      conversation = {
        id: convId,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      conversations.set(convId, conversation);
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: uuidv4(),
      content: message,
      role: 'user',
      timestamp: new Date(),
      hasImages: images && images.length > 0,
      images: images
    };
    
    conversation.messages.push(userMessage);

    // Process images if provided
    let enhancedMessage = message;
    if (images && images.length > 0) {
      try {
        const imageDescriptions = await Promise.all(
          images.map(img => openAIService.generateImageDescription(img))
        );
        enhancedMessage = `${message}\n\nImages provided:\n${imageDescriptions.join('\n')}`;
      } catch (error) {
        console.error('Error processing images:', error);
        enhancedMessage = `${message}\n\n[Note: Images were uploaded but couldn't be processed]`;
      }
    }

    // Generate AI response
    const messagesForAI = [...conversation.messages];
    if (enhancedMessage !== message) {
      messagesForAI[messagesForAI.length - 1] = {
        ...userMessage,
        content: enhancedMessage
      };
    }

    const aiResponseContent = await openAIService.generateResponse(
      messagesForAI,
      images && images.length > 0
    );

    // Add AI response
    const aiMessage: ChatMessage = {
      id: uuidv4(),
      content: aiResponseContent,
      role: 'assistant',
      timestamp: new Date()
    };
    
    conversation.messages.push(aiMessage);
    conversation.updatedAt = new Date();

    const response: ChatResponse = {
      id: aiMessage.id,
      content: aiResponseContent,
      role: 'assistant',
      timestamp: aiMessage.timestamp,
      conversationId: convId
    };

    res.json(response);
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: 'Failed to process message',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete conversation
router.delete('/conversation/:id', (req, res) => {
  const { id } = req.params;
  
  if (conversations.has(id)) {
    conversations.delete(id);
    res.json({ message: 'Conversation deleted successfully' });
  } else {
    res.status(404).json({ error: 'Conversation not found' });
  }
});

export { router as chatRouter };
