import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Heart, Clock, Scale, Brain, Star, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { BehaviorTrackingPopup } from './BehaviorTrackingPopup';
import * as behaviorApi from '../api/behaviorApi';

const children = [
  {
    id: 1,
    name: 'Ali',
    age: 8,
    avatar: '👦',
    behaviorLevel: 85,
    islamicKnowledge: 78,
    gamesPlayed: 12,
    traits: {
      empathy: 80,
      patience: 75,
      honesty: 90,
      focus: 70,
    },
  },
  {
    id: 2,
    name: 'Umer',
    age: 6,
    avatar: '🧒',
    behaviorLevel: 72,
    islamicKnowledge: 65,
    gamesPlayed: 8,
    traits: {
      empathy: 70,
      patience: 65,
      honesty: 80,
      focus: 68,
    },
  },
  {
    id: 3,
    name: 'Usman',
    age: 10,
    avatar: '👨',
    behaviorLevel: 90,
    islamicKnowledge: 88,
    gamesPlayed: 20,
    traits: {
      empathy: 88,
      patience: 85,
      honesty: 92,
      focus: 90,
    },
  },
];

const quotes = [
  "The best gift a parent can give their child is good character.",
  "Children are like wet cement; whatever falls on them makes an impression.",
  "Your children are not your children, they are the sons and daughters of Life's longing for itself.",
];

export function ParentDashboard() {
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  const [showBehaviorPopup, setShowBehaviorPopup] = useState(false);
  const [parentId, setParentId] = useState<number | null>(null);

  useEffect(() => {
    // Get parent ID from user info
    const userInfo = localStorage.getItem('user_info');
    if (userInfo) {
      try {
        // You may need to fetch parent_id from the backend or store it during login
        // For now, using a placeholder. Replace with actual parent_id logic
        setParentId(1); // TODO: Get actual parent_id
      } catch (err) {
        console.error('Failed to parse user info', err);
      }
    }

    // Check if behavior popup should be shown
    if (behaviorApi.shouldShowBehaviorPopup() || behaviorApi.shouldShowReminder()) {
      setShowBehaviorPopup(true);
    }
  }, []);

  const handleOpenBehaviorCheckIn = () => {
    setShowBehaviorPopup(true);
  };

  const handleCloseBehaviorPopup = () => {
    setShowBehaviorPopup(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-[#FFF8E1] to-white pt-20 lg:pt-8">
      {/* Behavior Tracking Popup */}
      {showBehaviorPopup && parentId && (
        <BehaviorTrackingPopup
          parentId={parentId}
          onClose={handleCloseBehaviorPopup}
        />
      )}

      {/* Welcome Header */}
      <div className="mb-6 lg:mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <h1 className="text-[#2D5F3F] text-2xl sm:text-3xl lg:text-4xl">Welcome, Ahmed</h1>
          <Button
            onClick={handleOpenBehaviorCheckIn}
            className="bg-gradient-to-r from-[#A8E6CF] to-[#8BD4AE] hover:from-[#8BD4AE] hover:to-[#A8E6CF] text-[#2D5F3F] rounded-xl font-medium"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Daily Check-in
          </Button>
        </div>
        <div className="flex items-start gap-2 bg-white/60 p-3 sm:p-4 rounded-2xl border-l-4 border-[#A8E6CF]">
          <span className="text-xl sm:text-2xl">💡</span>
          <p className="text-sm sm:text-base text-gray-700 italic">"{randomQuote}"</p>
        </div>
      </div>

      {/* Children Profiles */}
      <h2 className="text-[#2D5F3F] mb-4 text-xl sm:text-2xl">Your Children</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-6 lg:mb-8">
        {children.map((child) => (
          <Card key={child.id} className="p-6 hover:shadow-xl transition-shadow rounded-3xl border-2 border-[#A8E6CF]/20">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#A8E6CF] to-[#B3E5FC] flex items-center justify-center text-3xl">
                {child.avatar}
              </div>
              <div>
                <h3 className="text-[#2D5F3F]">{child.name}</h3>
                <p className="text-gray-600">{child.age} years old</p>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="space-y-4 mb-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-700">Behavior Level</span>
                  <Badge className="bg-[#A8E6CF] text-[#2D5F3F] hover:bg-[#A8E6CF]">
                    {child.behaviorLevel}%
                  </Badge>
                </div>
                <Progress value={child.behaviorLevel} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-700">Islamic Knowledge</span>
                  <Badge className="bg-[#B3E5FC] text-[#1E4F6F] hover:bg-[#B3E5FC]">
                    {child.islamicKnowledge}%
                  </Badge>
                </div>
                <Progress value={child.islamicKnowledge} className="h-2" />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-gray-700">Games Played</span>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span>{child.gamesPlayed}</span>
                </div>
              </div>
            </div>

            {/* Traits */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 bg-red-50 p-2 rounded-lg">
                <Heart className="h-4 w-4 text-red-500" />
                <div>
                  <p className="text-xs text-gray-600">Empathy</p>
                  <p className="text-sm text-gray-800">{child.traits.empathy}%</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 bg-blue-50 p-2 rounded-lg">
                <Clock className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-xs text-gray-600">Patience</p>
                  <p className="text-sm text-gray-800">{child.traits.patience}%</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 bg-green-50 p-2 rounded-lg">
                <Scale className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-xs text-gray-600">Honesty</p>
                  <p className="text-sm text-gray-800">{child.traits.honesty}%</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 bg-purple-50 p-2 rounded-lg">
                <Brain className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-xs text-gray-600">Focus</p>
                  <p className="text-sm text-gray-800">{child.traits.focus}%</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <Card className="p-4 sm:p-6 bg-gradient-to-br from-[#A8E6CF] to-[#8BD4AE] text-white rounded-2xl">
          <p className="text-white/90 mb-2 text-sm sm:text-base">Total Activities</p>
          <p className="text-2xl sm:text-3xl">40</p>
        </Card>
        
        <Card className="p-4 sm:p-6 bg-gradient-to-br from-[#B3E5FC] to-[#81D4FA] text-white rounded-2xl">
          <p className="text-white/90 mb-2 text-sm sm:text-base">Avg Progress</p>
          <p className="text-2xl sm:text-3xl">82%</p>
        </Card>
        
        <Card className="p-4 sm:p-6 bg-gradient-to-br from-[#FFF8E1] to-[#FFE082] text-[#6B5B00] rounded-2xl">
          <p className="opacity-90 mb-2 text-sm sm:text-base">This Week</p>
          <p className="text-2xl sm:text-3xl">+15%</p>
        </Card>
      </div>
    </div>
  );
}
