import { Bot } from 'lucide-react';

interface ThinkingIndicatorProps {
  timestamp: string;
}

export function ThinkingIndicator({ timestamp }: ThinkingIndicatorProps) {
  return (
    <div className="flex flex-col">
      <div className="flex gap-3 justify-start">
        {/* AI Avatar - matching the existing AI message styling */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#A8E6CF] to-[#B3E5FC] flex items-center justify-center flex-shrink-0">
          <Bot className="h-5 w-5 text-white" />
        </div>
        
        {/* Message bubble with thinking animation */}
        <div className="max-w-[85%] sm:max-w-[70%] rounded-2xl p-3 sm:p-4 bg-white border-2 border-gray-100">
          {/* Animated thinking dots */}
          <div className="flex items-center gap-1">
            <span className="text-sm sm:text-base text-gray-600">Thinking</span>
            <div className="flex gap-1 ml-2">
              <div 
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: '0ms', animationDuration: '1.4s' }}
              ></div>
              <div 
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: '200ms', animationDuration: '1.4s' }}
              ></div>
              <div 
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: '400ms', animationDuration: '1.4s' }}
              ></div>
            </div>
          </div>
          
          {/* Timestamp - matching existing AI message styling */}
          <p className="text-xs mt-2 text-gray-500">
            {timestamp}
          </p>
        </div>
      </div>
    </div>
  );
}