import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Send, Mic, Bot, User, Loader2 } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import * as chatApi from '../api/chatApi';
import * as behaviorApi from '../api/behaviorApi';
import TaskGeneration from './TaskGeneration';

interface Message {
  role: 'user' | 'ai';
  content: string;
  timestamp: string;
  tags?: string[];
}

export function ChatbotInterface() {
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  const [children, setChildren] = useState<behaviorApi.ChildInfo[]>([]);
  const [loadingChildren, setLoadingChildren] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      content: 'Assalamu Alaikum! I am your Parvarish AI assistant. How can I help you with your parenting journey today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastAiMessage, setLastAiMessage] = useState<Message | null>(null);

  // Fetch children list on mount
  useEffect(() => {
    const fetchChildren = async () => {
      setLoadingChildren(true);
      try {
        const data = await behaviorApi.getParentChildren();
        const childrenArray = Array.isArray(data) ? data : (data as any)?.children || [];
        setChildren(childrenArray);
      } catch (err) {
        console.error('Failed to load children:', err);
        setChildren([]);
      } finally {
        setLoadingChildren(false);
      }
    };
    fetchChildren();
  }, []);

  // Fetch chat history when selectedChildId changes
  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const historyData = await chatApi.getChatHistory(selectedChildId);
        const formattedMessages: Message[] = historyData.messages.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'ai',
          content: msg.content,
          timestamp: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }));
        
        if (formattedMessages.length > 0) {
          setMessages(formattedMessages);
        } else {
          // Set initial message if history is empty
          setMessages([
            {
              role: 'ai',
              content: 'Assalamu Alaikum! I am your Parvarish AI assistant. How can I help you with your parenting journey today?',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        }
      } catch (error) {
        console.error('Failed to load chat history:', error);
        // Optionally show an error message in the chat
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [selectedChildId]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const newUserMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([...messages, newUserMessage]);
    const userInput = inputMessage;
    setInputMessage('');
    setIsLoading(true);
    setLastAiMessage(null);

    try {
      // Send message with optional child context
      const response = await chatApi.sendChatMessage(userInput, selectedChildId);
      
      const aiResponse: Message = {
        role: 'ai',
        content: response.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        tags: (response as any).tags, // Assuming tags might come back
      };
      
      setMessages((prev) => [...prev, aiResponse]);
      setLastAiMessage(aiResponse);
    } catch (err) {
      console.error('Failed to send message:', err);
      const errorMessage: Message = {
        role: 'ai',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getPlaceholderText = () => {
    const selectedChild = children.find(c => c.id === selectedChildId);
    if (selectedChild) {
      return `Ask about ${selectedChild.name}'s development...`;
    }
    return 'Ask for Islamic parenting advice...';
  };

  const getContextBadge = () => {
    const selectedChild = children.find(c => c.id === selectedChildId);
    if (selectedChild) {
      return `💬 About ${selectedChild.name}`;
    }
    return '💬 General';
  };

  return (
    <div className="flex flex-col bg-gradient-to-br from-[#FFF8E1] to-white p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 min-h-screen">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-[#2D5F3F] mb-3 sm:mb-4 text-2xl sm:text-3xl lg:text-4xl">AI Parenting Assistant</h1>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <label className="text-gray-700 text-sm sm:text-base">Discussing about:</label>
          <Select
            value={selectedChildId?.toString() || 'general'}
            onValueChange={(value: string) => setSelectedChildId(value === 'general' ? null : parseInt(value))}
          >
            <SelectTrigger className="w-full sm:w-48 rounded-xl bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General Advice</SelectItem>
              {children.map((child) => (
                <SelectItem key={child.id} value={child.id.toString()}>
                  {child.name} {child.age ? `(${child.age} years)` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Context Badge */}
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            selectedChildId 
              ? 'bg-blue-100 text-blue-700' 
              : 'bg-gray-100 text-gray-700'
          }`}>
            {getContextBadge()}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col rounded-3xl overflow-hidden shadow-xl">
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className="flex flex-col"
              >
                <div className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {message.role === 'ai' && (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#A8E6CF] to-[#B3E5FC] flex items-center justify-center flex-shrink-0">
                        <Bot className="h-5 w-5 text-white" />
                    </div>
                    )}
                    
                    <div
                    className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-3 sm:p-4 ${
                        message.role === 'user'
                        ? 'bg-[#A8E6CF] text-[#2D5F3F]'
                        : 'bg-white border-2 border-gray-100'
                    }`}
                    >
                    <p className="whitespace-pre-line text-sm sm:text-base">{message.content}</p>
                    <p
                        className={`text-xs mt-2 ${
                        message.role === 'user' ? 'text-[#2D5F3F]/70' : 'text-gray-500'
                        }`}
                    >
                        {message.timestamp}
                    </p>
                    </div>

                    {message.role === 'user' && (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#B3E5FC] to-[#81D4FA] flex items-center justify-center flex-shrink-0">
                        <User className="h-5 w-5 text-white" />
                    </div>
                    )}
                </div>
                {lastAiMessage && lastAiMessage.content === message.content && (
                  <div className="ml-12 mt-2">
                    <TaskGeneration 
                      childId={selectedChildId}
                      chatbotResponse={lastAiMessage.content}
                      chatbotTags={lastAiMessage.tags}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-3 sm:p-4 bg-gray-50 border-t">
          <div className="flex gap-2 sm:gap-3">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={getPlaceholderText()}
              className="flex-1 rounded-xl text-sm sm:text-base"
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className="bg-[#A8E6CF] hover:bg-[#8BD4AE] text-[#2D5F3F] rounded-xl px-3 sm:px-6"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
              ) : (
                <Send className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </Button>
            <Button
              variant="outline"
              className="rounded-xl px-3 sm:px-6 border-2 border-[#B3E5FC] text-[#1E4F6F] hover:bg-[#B3E5FC]/10"
            >{/*
              <Mic className="h-4 w-4 sm:h-5 sm:w-5" />*/}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            AI provides guidance based on Quran and Hadith. Always verify with scholars.
          </p>
        </div>
      </Card>
    </div>
  );
}
