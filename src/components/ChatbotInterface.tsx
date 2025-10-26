import { useState } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Send, Mic, Bot, User } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: string;
}

export function ChatbotInterface() {
  const [selectedChild, setSelectedChild] = useState('Ali');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: 'Assalamu Alaikum! I am your Parvarish AI assistant. How can I help you with your parenting journey today?',
      sender: 'ai',
      timestamp: '10:30 AM',
    },
    {
      id: 2,
      text: 'My son Ali has been showing impatience lately. What Islamic advice can you give me?',
      sender: 'user',
      timestamp: '10:32 AM',
    },
    {
      id: 3,
      text: `Wa Alaikum Assalam! Patience (Sabr) is a fundamental virtue in Islam. Here's some guidance:

📖 Quranic Wisdom:
"And seek help through patience and prayer" (Quran 2:45)

🌟 Practical Steps for Ali:
1. Teach him the story of Prophet Ayub (AS) and his patience
2. Practice breathing exercises when he feels frustrated
3. Reward patient behavior with positive reinforcement
4. Model patience in your own actions

💡 Activity Suggestion:
Try the "Patience Building" game in our activities section - it helps children understand delayed gratification through fun scenarios.

Would you like specific duas to teach Ali about patience?`,
      sender: 'ai',
      timestamp: '10:33 AM',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newUserMessage: Message = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([...messages, newUserMessage]);
    setInputMessage('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: messages.length + 2,
        text: `I understand your concern about ${selectedChild}. Let me provide you with some Islamic guidance and practical advice based on our teachings...`,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-[#FFF8E1] to-white p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-[#2D5F3F] mb-3 sm:mb-4 text-2xl sm:text-3xl lg:text-4xl">AI Parenting Assistant</h1>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <label className="text-gray-700 text-sm sm:text-base">Discussing about:</label>
          <Select value={selectedChild} onValueChange={setSelectedChild}>
            <SelectTrigger className="w-full sm:w-48 rounded-xl bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Ali">Ali (8 years)</SelectItem>
              <SelectItem value="Umer">Umer (6 years)</SelectItem>
              <SelectItem value="Usman">Usman (10 years)</SelectItem>
              <SelectItem value="General">General Advice</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col rounded-3xl overflow-hidden shadow-xl">
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.sender === 'ai' && (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#A8E6CF] to-[#B3E5FC] flex items-center justify-center flex-shrink-0">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                )}
                
                <div
                  className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-3 sm:p-4 ${
                    message.sender === 'user'
                      ? 'bg-[#A8E6CF] text-[#2D5F3F]'
                      : 'bg-white border-2 border-gray-100'
                  }`}
                >
                  <p className="whitespace-pre-line text-sm sm:text-base">{message.text}</p>
                  <p
                    className={`text-xs mt-2 ${
                      message.sender === 'user' ? 'text-[#2D5F3F]/70' : 'text-gray-500'
                    }`}
                  >
                    {message.timestamp}
                  </p>
                </div>

                {message.sender === 'user' && (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#B3E5FC] to-[#81D4FA] flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-white" />
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
              placeholder="Ask for Islamic parenting advice..."
              className="flex-1 rounded-xl text-sm sm:text-base"
            />
            <Button
              onClick={handleSendMessage}
              className="bg-[#A8E6CF] hover:bg-[#8BD4AE] text-[#2D5F3F] rounded-xl px-3 sm:px-6"
            >
              <Send className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Button
              variant="outline"
              className="rounded-xl px-3 sm:px-6 border-2 border-[#B3E5FC] text-[#1E4F6F] hover:bg-[#B3E5FC]/10"
            >
              <Mic className="h-4 w-4 sm:h-5 sm:w-5" />
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
