import OpenAI from 'openai';
import { ChatMessage } from '../types/chat';

// Azure OpenAI Configuration - Use environment variables for security
const apiKey = process.env.AZURE_OPENAI_API_KEY || "your-api-key-here";
const apiVersion = process.env.AZURE_OPENAI_API_VERSION || "2024-04-01-preview";
const endpoint = process.env.AZURE_OPENAI_ENDPOINT || "https://your-endpoint.cognitiveservices.azure.com/";
const modelName = process.env.AZURE_OPENAI_MODEL || "gpt-4o-mini";
const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o-mini";

class OpenAIService {
  private client: OpenAI;

  constructor() {
    console.log('Initializing Azure OpenAI client...');
    console.log('Endpoint:', endpoint);
    console.log('Deployment:', deployment);
    console.log('API Version:', apiVersion);
    
    // Ensure proper URL construction
    const cleanEndpoint = endpoint.replace(/\/$/, ''); // Remove trailing slash
    const baseURL = `${cleanEndpoint}/openai/deployments/${deployment}`;
    console.log('Constructed Base URL:', baseURL);
    
    this.client = new OpenAI({
      apiKey,
      baseURL,
      defaultQuery: { 'api-version': apiVersion },
      defaultHeaders: {
        'api-key': apiKey,
      },
    });
    
    console.log('Azure OpenAI client initialized successfully');
  }

  async generateResponse(messages: ChatMessage[], includeImages: boolean = false): Promise<string> {
    const userMessage = messages[messages.length - 1]?.content || '';
    console.log('Processing user message:', userMessage);

    try {
      console.log('Calling Azure OpenAI...');
      console.log('Endpoint:', `${endpoint}/openai/deployments/${deployment}`);
      console.log('API Version:', apiVersion);
      
      const formattedMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const systemMessage = {
        role: 'system' as const,
        content: `You are a helpful AI assistant. Provide intelligent, relevant responses. ${includeImages ? 'You can analyze images.' : ''} Respond naturally and helpfully.`
      };

      const response = await this.client.chat.completions.create({
        model: deployment,
        messages: [systemMessage, ...formattedMessages],
        max_tokens: 800,
        temperature: 0.7,
      });

      const content = response.choices[0]?.message?.content;
      if (content) {
        console.log('✅ Azure OpenAI response received successfully');
        return content;
      }
      
      throw new Error('No content in Azure OpenAI response');
      
    } catch (error) {
      console.error('❌ Azure OpenAI Error:', error);
      
      // Re-throw the error to see what's wrong
      if (error instanceof Error) {
        throw new Error(`Azure OpenAI API failed: ${error.message}`);
      }
      throw new Error('Azure OpenAI API failed with unknown error');
    }
  }

  private generateDemoResponse(userMessage: string, includeImages: boolean): string {
    const isEnglish = /^[a-zA-Z\s\d\.,!?'"()-]+$/.test(userMessage);
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return isEnglish 
        ? "Hello! I'm an AI assistant built for Dalmar Labs. I can help you with questions, conversations, and even analyze images. What would you like to know?"
        : "Hello! I'm an AI assistant built for Dalmar Labs. I can help with questions, conversations, and image analysis. How can I assist you?";
    }
    
    if (lowerMessage.includes('how are you') || lowerMessage.includes('how do you do')) {
      return "I'm doing great! I'm an AI assistant running on GPT-4o Mini, designed to demonstrate advanced conversational capabilities for this interview project. I'm ready to help with any questions or tasks you have!";
    }
    
    if (lowerMessage.includes('what') && lowerMessage.includes('do')) {
      return isEnglish
        ? "I'm an intelligent chat assistant that can engage in conversations, answer questions, provide information, and analyze images. This application demonstrates modern full-stack development with Node.js, Next.js, and AI integration for the Dalmar Labs interview."
        : "I'm an intelligent chat assistant for conversations, Q&A, information, and image analysis. This app demonstrates modern full-stack development with Node.js, Next.js, and AI integration for the Dalmar Labs interview.";
    }
    
    if (lowerMessage.includes('dalmar') || lowerMessage.includes('interview') || lowerMessage.includes('project')) {
      return isEnglish
        ? "This is the Dalmar Labs interview project - a full-stack AI chat application! It features: ✅ Node.js + Express backend ✅ Next.js frontend ✅ Real-time chat interface ✅ Image upload & analysis ✅ Modern UI/UX ✅ CI/CD pipeline. The app demonstrates enterprise-level development skills and architecture."
        : "This is the Dalmar Labs interview project - a full-stack AI chat app! Features: ✅ Node.js + Express backend ✅ Next.js frontend ✅ Real-time chat ✅ Image upload & analysis ✅ Modern UI/UX ✅ CI/CD pipeline. Demonstrates enterprise development skills.";
    }
    
    if (lowerMessage.includes('technology') || lowerMessage.includes('tech') || lowerMessage.includes('stack')) {
      return "This application uses a modern tech stack: Frontend: Next.js 15, TypeScript, Tailwind CSS; Backend: Node.js, Express, TypeScript; AI: Azure OpenAI GPT-4o Mini; DevOps: GitHub Actions CI/CD; Architecture: RESTful API, component-based UI, responsive design.";
    }
    
    if (includeImages) {
      return `I can see you've uploaded an image! The image upload system is working perfectly. The app successfully processes image data. You asked: "${userMessage}" - this demonstrates the multi-modal chat capabilities.`;
    }
    
    const responses = [
      `That's an interesting question about "${userMessage}". As an AI assistant in this demo application, I'm designed to provide helpful responses. This showcases the chat functionality built for the Dalmar Labs interview project.`,
      `I understand you're asking about "${userMessage}". This AI chat application demonstrates real-time conversation capabilities and modern web development practices.`,
      `Great question! Regarding "${userMessage}" - this application shows how AI integrates into modern web applications with smooth, responsive interactions.`,
      `Thanks for your message about "${userMessage}". This demonstrates the chat application's ability to handle various queries and provide contextual responses for the Dalmar Labs project.`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  async generateImageDescription(imageBase64: string): Promise<string> {
    try {
      return 'I can see you uploaded an image, but image analysis is currently being configured. Please describe what you\'d like to know about the image.';
    } catch (error) {
      console.error('Image analysis error:', error);
      return 'Image uploaded successfully. Image analysis feature is being configured. Please describe what you\'d like to know about the image.';
    }
  }
}

export const openAIService = new OpenAIService();